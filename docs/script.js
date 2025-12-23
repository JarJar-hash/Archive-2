let allMatches = [];
let filteredMatches = [];

// --- Chargement du CSV ---
fetch('./matchs.csv')
    .then(res => res.text())
    .then(text => {
        
        console.log("CSV brut :", text); // <-- vérifie si le contenu est là
        allMatches = parseCSV(text);
        console.log("Matches parsés :", allMatches);

        // Initialisation des filtres
        populateFilters(allMatches);

        // Au début, on affiche tous les matchs
        filteredMatches = allMatches.slice();
        render();

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

// --- Appliquer les filtres ---
function applyFilters() {
    
    const year = document.getElementById('filter-year')?.value || '';
    const competition = document.getElementById('filter-competition')?.value || '';
    const phase = document.getElementById('filter-phase')?.value || '';
    const team = document.getElementById('filter-team')?.value || '';

    filteredMatches = allMatches.filter(m => {
        if (year && !m.date.startsWith(year)) return false;
        if (competition && m.competition !== competition) return false;
        if (phase && m.phase !== phase) return false;
        if (team && m.home_team !== team && m.away_team !== team) return false;
        return true;
    });

    console.log('Dropdown values:', {year, competition, phase, team});
    console.log('Total matches loaded:', allMatches.length);

    render();
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
            <div class="meta">${m.date} • ${m.phase || ''}</div>
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
        filteredMatches = allMatches.slice();
        render();
    });
}
