Papa.parse("matchs.csv", {
    download: true,
    header: true,
    complete: function(results) {
        const data = results.data;

        const tableData = data.map(match => [
            match.date,
            match.competition,
            match.phase,
            match.home_team,
            match.away_team,
            `<a href="${match.video_url}" target="_blank">▶ Voir</a>`
        ]);

        $('#matchs').DataTable({
            data: tableData,
            pageLength: 10,
            language: {
                search: "🔍 Rechercher :",
                lengthMenu: "Afficher _MENU_ matchs",
                info: "Matchs _START_ à _END_ sur _TOTAL_",
                paginate: {
                    next: "Suivant",
                    previous: "Précédent"
                }
            }
        });
    }
});
