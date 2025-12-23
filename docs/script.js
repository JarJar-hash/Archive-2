let allMatches = [];
let filteredMatches = [];

// Chargement du CSV
fetch('matchs.csv')
    .then(res => res.text())
    .then(text => {
        allMatches = parseCSV(text);
        populateFilters(allMatches);
        applyFilters();
        window.addEventListener('resize', render);
    });

// --- CSV parser simple ---
function parseCSV(text) {
    const lines = text.trim().split('\n');
    const headers = lines.shift().split(',');

    return lines
        .map(line => {
            const values = line.split(',');
            return Object.fromEntries(
                headers.map((h, i) => [h.trim(), values[i]?.trim()])
            );
        })
        .filter(m =>
            m.date &&
            m.competition &&
            m.home_team &&
            m.away_team &&
            m.video_url
        );
}

// --- Filtres ---
function populateFilters(data) {
    const years = new Set();
    const competitions = new Set();
    const phases = new Set();
    const teams = new Set();

    data.forEach(m => {
        years.add(m.date.substring(6, 4));
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
    [...values]
        .sort((a, b) => desc ? b.localeCompare(a) : a.localeCompare(b))
        .forEach(v => {
            const o = document.createElement('option');
            o.value = v;
            o.textContent = v;
            select.appendChild(o);
        });
}

// --- Application des filtres ---
function applyFilters() {
    const year = filter-year.value;
    const competition = filter-competition.value;
    const phase = filter-phase.value;
    const team = filter-team.value;

    filteredMatches = allMatches.filter(m => {
        if (year && !m.date.startsWith(year)) return false;
        if (competition && m.competition !== competition) return false;
        if (phase && m.phase !== phase) return false;
        if (
            team &&
            m.home_team !== team &&
            m.away_team !== team
        ) return false;
        return true;
    });

    render();
}

// --- Rendu adaptatif ---
function render() {
    if (window.innerWidth <= 768) {
        renderCards(filteredMatches);
    } else {
        renderTable(filteredMatches);
    }
}

// --- Vue desktop ---
function renderTable(data) {
    const tbody = document.querySelector('#table-view tbody');
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

// --- Vue mobile ---
function renderCards(data) {
    const container = document.getElementById('card-view');
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

// --- Events ---
['filter-year', 'filter-competition', 'filter-phase', 'filter-team']
    .forEach(id =>
        document.getElementById(id).addEventListener('change', applyFilters)
    );

document.getElementById('reset').addEventListener('click', () => {
    document.querySelectorAll('#filters select').forEach(s => s.value = '');
    applyFilters();
});
