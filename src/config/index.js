//let DB_URI = "mongodb://18.184.20.79:27017/microservices";
//let DB_URI = "mongodb://localhost:27017/microservices";


let DB_URI = "jdbc:postgresql://sdccdb.cq0cmm7hsjuw.eu-central-1.rds.amazonaws.com"


//MODIFICATO PER AWS


/*if (process.env.MONGO_DB_URI) {
    DB_URI = process.env.MONGO_DB_URI;
}*/

module.exports = {
    DB_URI
};