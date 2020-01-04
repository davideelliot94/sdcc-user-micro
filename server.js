const app = require("./src/app");
const { DB_URI } = require("./src/config");
//const pg = require("pg");
//pg.connect(DB_URI);


console.log('print1');

const { Client } = require('pg');
//var connectionString = "postgres://postgres:postgres@localhost:5432/database";
const client = new Client({
    connectionString: DB_URI
});


app.listen(8080, () => {
    console.log("running on port 8080");
    console.log("--------------------------");
});
