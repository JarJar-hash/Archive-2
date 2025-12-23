let table;
let rawData = [];

Papa.parse("matchs.csv", {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function(results) {

        rawData = results.data.filter(m =>
            m.date && m.competition && m.home_team && m.away_team
        );

        const tableData = rawData.map(m => [
            m.date,
            m.competition,
            m.phase || "",
            m.home_team,
            m.away_team,
            `<a href="${m.video_url}" target="_blank">▶ Voir</a>`
        ]);

        table = $('#matchs').DataTable({
            data: tableData,
            pageLength: 10
        });

        populateFilters(rawData);
    }
});


function populateFilters(data) {

    const years = new Set();
    const competitions = new Set();
    const phases = new Set();
    const teams = new Set();

    data.forEach(m => {
        years.add(m.date.substring(0, 4));
        competitions.add(m.competition);
        if (m.phase) phases.add(m.phase);
        teams.add(m.home_team);
        teams.add(m.away_team);
    });

    fillSelect('#filter-year', [...years].sort().reverse());
    fillSelect('#filter-competition', [...competitions].sort());
    fillSelect('#filter-phase', [...phases].sort());
    fillSelect('#filter-team', [...teams].sort());
}

function fillSelect(selector, values) {
    const select = document.querySelector(selector);
    values.forEach(v => {
        const option = document.createElement('option');
        option.value = v;
        option.textContent = v;
        select.appendChild(option);
    });
}


$.fn.dataTable.ext.search.push(function(settings, data) {

    const year = $('#filter-year').val();
    const competition = $('#filter-competition').val();
    const phase = $('#filter-phase').val();
    const team = $('#filter-team').val();

    const matchDate = data[0];
    const matchCompetition = data[1];
    const matchPhase = data[2];
    const homeTeam = data[3];
    const awayTeam = data[4];

    if (year && !matchDate.startsWith(year)) return false;
    if (competition && matchCompetition !== competition) return false;
    if (phase && matchPhase !== phase) return false;

    if (
        team &&
        homeTeam !== team &&
        awayTeam !== team
    ) return false;

    return true;
});


$('#filter-year, #filter-competition, #filter-phase, #filter-team')
    .on('change', function () {
        table.draw();
    });

$('#reset-filters').on('click', function () {
    $('#filters select').val('');
    table.draw();
});



