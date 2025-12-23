body {
    margin: 0;
    font-family: system-ui, Arial, sans-serif;
    background: #f6f8fa;
}

header {
    text-align: center;
    padding: 15px;
    background: #0d1117;
    color: white;
}

/* Filtres */
#filters {
    position: sticky;
    top: 0;
    z-index: 10;
    background: white;
    padding: 10px;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
    gap: 10px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

#filters select,
#filters button {
    padding: 10px;
    border-radius: 6px;
    border: 1px solid #ccc;
}

#filters button {
    background: #1f6feb;
    color: white;
    border: none;
    cursor: pointer;
}

/* Desktop table */
table {
    width: 100%;
    border-collapse: collapse;
    background: white;
}

th, td {
    padding: 10px;
    border-bottom: 1px solid #eee;
    text-align: left;
}

th {
    background: #fafafa;
}

/* Mobile cards */
#card-view {
    padding: 12px;
    display: grid;
    gap: 12px;
}

.match-card {
    background: white;
    border-radius: 8px;
    padding: 12px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.08);
}

.match-card .competition {
    font-weight: bold;
    color: #1f6feb;
}

.match-card .teams {
    font-size: 1.1em;
    margin: 6px 0;
}

.match-card .meta {
    font-size: 0.9em;
    color: #555;
}

.match-card a {
    display: inline-block;
    margin-top: 8px;
    font-weight: bold;
    color: #1f6feb;
    text-decoration: none;
}

/* Responsive switch */
.mobile-only {
    display: none;
}

@media (max-width: 768px) {
    .desktop-only {
        display: none;
    }
    .mobile-only {
        display: block;
    }
}
