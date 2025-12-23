Papa.parse("matchs.csv", {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function(results) {

        const tableData = [];

        results.data.forEach((match, index) => {

            // Vérification stricte
            if (
                match.date &&
                match.competition &&
                match.home_team &&
                match.away_team &&
                match.video_url
            ) {
                tableData.push([
                    match.date.trim(),
                    match.competition.trim(),
                    (match.phase || "").trim(),
                    match.home_team.trim(),
                    match.away_team.trim(),
                    `<a href="${match.video_url.trim()}" target="_blank">▶ Voir</a>`
                ]);
            } else {
                console.warn("Ligne ignorée :", index + 1, match);
            }
        });

        $('#matchs').DataTable({
            destroy: true, // 👈 IMPORTANT si reload
            data: tableData,
            pageLength: 10
        });
    }
});

