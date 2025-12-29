let allMatches = [];
let filteredMatches = [];

// --- Chargement du CSV ---
fetch('./matchs.csv')
    .then(res => res.text())
    .then(text => {
        
        // <-- vérifie si le contenu est là -- console.log("CSV brut :", text);
        allMatches = parseCSV(text);
        // console.log("Matches parsés :", allMatches);

        // 🔹 Tri par date dès le chargement
        allMatches = sortMatchesByDate(allMatches);

        filteredMatches = allMatches.slice();
        document.getElementById('filters').style.visibility = 'hidden';
        applyFilters();
        document.getElementById('filters').style.visibility = 'visible';
        
        // Re-render si redimensionnement
        window.addEventListener('resize', render);
    })
    .catch(err => console.error("Erreur chargement CSV :", err));

// --- Parser CSV ---
function parseCSV(text) {
    const lines = text.trim().split('\n');
    if (lines.length < 2) return [];

    // Détecte automatiquement le séparateur : ; ou ,
    const separator = lines[0].includes(';') ? ';' : ',';
    const headers = lines.shift().split(separator).map(h => h.trim());

    return lines
        .map(line => {
            const values = line.split(separator).map(v => v.trim());
            return Object.fromEntries(headers.map((h, i) => [h, values[i] || '']));
        })
        // Ignore seulement les lignes totalement vides
        .filter(m => Object.values(m).some(v => v !== ''));
}

// --- Filtres ---

function getCurrentFilters() {
    return {
        year: document.getElementById('filter-year')?.value || '',
        competition: document.getElementById('filter-competition')?.value || '',
        phase: document.getElementById('filter-phase')?.value || '',
        team: document.getElementById('filter-team')?.value || ''
    };
}

function filterMatches(matches, filters) {
    return matches.filter(m => {
        if (filters.year && !m.date.endsWith(filters.year)) return false;
        if (filters.competition && m.competition !== filters.competition) return false;
        if (filters.phase && m.phase !== filters.phase) return false;
        if (filters.team && m.home_team !== filters.team && m.away_team !== filters.team) return false;
        return true;
    });
}

function refillSelectWithCount(id, values, selectedValue, filterKey) {
    const select = document.getElementById(id);
    if (!select) return;

    select.innerHTML = '<option value="">Tous</option>';

    const currentFilters = getCurrentFilters();

    // 1. Construire la liste avec counts
    const options = [...values].map(v => {
        const filters = { ...currentFilters, [filterKey]: v };
        return {
            value: v,
            count: countMatchesWith(filteredMatches, filters)
        };
    });

    // 2. Trier du plus dispo au moins dispo
    options.sort((a, b) => {
    if (b.count !== a.count) return b.count - a.count;
    return a.value.localeCompare(b.value); // tie-break alphabétique
    });

    // 3. Rendu
    options.forEach(({ value, count }) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = `${value} (${count})`;
        option.disabled = count === 0;

        if (value === selectedValue) {
            option.selected = true;
        }

        select.appendChild(option);
    });
}

function updateFiltersFromData(data) {
    const years = new Set();
    const competitions = new Set();
    const phases = new Set();
    const teams = new Set();

    data.forEach(m => {
        years.add(m.date.split('/')[2]);
        competitions.add(m.competition);
        if (m.phase) phases.add(m.phase);
        teams.add(m.home_team);
        teams.add(m.away_team);
    });

    const current = getCurrentFilters();

    refillSelectWithCount('filter-year', years, current.year, 'year');
    refillSelectWithCount('filter-competition', competitions, current.competition, 'competition');
    refillSelectWithCount('filter-phase', phases, current.phase, 'phase');
    refillSelectWithCount('filter-team', teams, current.team, 'team');
}

// NON UTILISE
function populateFilters(data) {
    const years = new Set();
    const competitions = new Set();
    const phases = new Set();
    const teams = new Set();

    data.forEach(m => {
        years.add(m.date.split('/')[2]);
        competitions.add(m.competition);
        if (m.phase) phases.add(m.phase);
        teams.add(m.home_team);
        teams.add(m.away_team);
    });

    fillSelect('filter-year', years, true);
    fillSelect('filter-competition', competitions);
    fillSelect('filter-phase', phases);
    fillSelect('filter-team', teams);
}

// NON UTILISE
function fillSelect(id, values, desc = false) {
    const select = document.getElementById(id);
    if (!select) return;

    [...values]
        .sort((a,b) => desc ? b.localeCompare(a) : a.localeCompare(b))
        .forEach(v => {
            const o = document.createElement('option');
            o.value = v;
            o.textContent = v;
            select.appendChild(o);
        });
}

function parseDateDMY(dateStr) {
    // dateStr = "dd/mm/yyyy"
    const parts = dateStr.split('/');
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // JS months: 0 = Janvier
    const year = parseInt(parts[2], 10);
    return new Date(year, month, day);
}

function sortMatchesByDate(matches) {
    return matches.sort((a, b) => parseDateDMY(a.date) - parseDateDMY(b.date));
}

function countMatchesWith(base, filters) {
    return filterMatches(base, filters).length;
}

function setFiltersDisabled(state) {
    document.querySelectorAll('#filters select').forEach(s => s.disabled = state);
}

let lastFilters = null;
let isInit = true;

// --- Appliquer les filtres ---
function applyFilters() {

    setFiltersDisabled(true);
    
    const filters = getCurrentFilters();
    
    if (!isInit && JSON.stringify(filters) === JSON.stringify(lastFilters)) {
        setFiltersDisabled(false);
        return;
    }

    isInit = false;
    lastFilters = filters;

    // 1. Filtrer
    filteredMatches = filterMatches(allMatches, filters);

    // 2. Mettre à jour les autres filtres dynamiquement
    updateFiltersFromData(filteredMatches);

    // 3. Trier + render
    filteredMatches = sortMatchesByDate(filteredMatches);

    // 4. Render
    render();

    // 5. Compteurs
    const counter = document.getElementById('match-count');
    if (counter) {
        counter.textContent = `${filteredMatches.length} matchs`;
    }

    setFiltersDisabled(false);
}

// --- Rendu adaptatif ---
function render() {
    const table = document.getElementById('table-view');
    const cards = document.getElementById('card-view');

    if (window.innerWidth <= 1024) {
        // mobile + tablette
        if (table) table.style.display = 'none';
        if (cards) {
            cards.style.display = 'grid'; // ou 'block' selon ton CSS
            renderCards(filteredMatches);
        }
    } else {
        // desktop large
        if (cards) cards.style.display = 'none';
        if (table) {
            table.style.display = 'table';
            renderTable(filteredMatches);
        }
    }
}


// --- Vue desktop ---
function renderTable(data) {
    const tbody = document.querySelector('#table-view tbody');
    if (!tbody) return;
    tbody.innerHTML = '';

    data.forEach(m => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${m.date}</td>
            <td>${m.competition}</td>
            <td>${m.phase || ''}</td>
            <td>${m.home_team}</td>
            <td>${m.away_team}</td>
            <td>${m.score || '-'}</td>
            <td><a href="${m.video_url}" target="_blank">▶</a></td>
        `;
        tbody.appendChild(tr);
    });
}

// --- Vue mobile/tablette ---
function renderCards(data) {
    const container = document.getElementById('card-view');
    if (!container) return;
    container.innerHTML = '';

    if (data.length === 0) {
        container.innerHTML = '<p>Aucun match trouvé</p>';
        return;
    }

    data.forEach(m => {
        const div = document.createElement('div');
        div.className = 'match-card';
        div.innerHTML = `
            <div class="competition">${m.competition}</div>
            <div class="teams">${m.home_team} – ${m.away_team}</div>
            <div class="meta">${m.date} • ${m.phase || ''} • ${m.score || '-'}</div>
            <a href="${m.video_url}" target="_blank">▶ Voir le match</a>
        `;
        container.appendChild(div);
    });
}

// --- Event listeners filtres ---
['filter-year','filter-competition','filter-phase','filter-team'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', applyFilters);
});

const resetBtn = document.getElementById('reset');
if (resetBtn) {
    resetBtn.addEventListener('click', () => {
        document.querySelectorAll('#filters select').forEach(s => s.value = '');
        applyFilters(); // 👈 recalcul complet
    });
}

