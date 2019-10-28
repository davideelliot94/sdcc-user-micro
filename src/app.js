const express = require("express");
//const Video = require("./models/
var cors = require('cors');
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const {Pool,Client} = require('pg')


const pool = new Pool({
    user:"postgres",
    host:"sdccdb.cq0cmm7hsjuw.eu-central-1.rds.amazonaws.com",
    database:"classdb",
    password:"postgres",
    port:5432
});

const creation = 'CREATE TABLE IF NOT EXISTS "users"(' +
    'username VARCHAR(10) PRIMARY KEY,' +
    'email VARCHAR(50) NOT NULL,' +
    'password VARCHAR(10))';

pool.query(creation,(err,res) =>{
    console.log('querying!');
    if(err){
        console.log('error in creation: ' + err);
        //console.log(err);
    }
    else{
        console.log('not error');
        //console.log(err.stack);
    }
});




/*app.get("/", (req, res) => {
    res.json({ msg: "videos" });
});

app.get("/api/u1/users", async (req, res) => {
    const videos = await Video.find({});
    res.json(videos);
});*/

app.post("/users/registration", async (req, res) => {
    console.log('called');
    console.log('got request: ' + req);
    let user =req.body.name;
    let email= req.body.email;
    let psw = req.body.psw;
    console.log('got name: ' + user);
    console.log('got email: ' + email);
    console.log('got psw: ' + psw);
    //const video = new User({ name: req.body.name });
    //const savedVideo = await video.save();
    //res.json(savedVideo);

    //console.log('pool is:  ' + JSON.stringify(pool));

    const text = "INSERT INTO users(username, email,password) VALUES($1, $2,$3) RETURNING *";
    const values = [user,email,psw];
// callback
    pool.query(text,values,(err, res) => {
        console.log('query2');
        if (err) {
            console.log("error: "  + err);
        } else {
            console.log("not error in creation");
            console.log(res.rows[0])
            // { name: 'brianc', email: 'brian.m.carlson@gmail.com' }
        }
    });


});


app.post("/users/login", (req, res) => {

    let email= req.body.email;
    let psw = req.body.psw;
    console.log('got email: ' + email);
    console.log('got psw: ' + psw);

    const text = "SELECT FROM users(email,password) VALUES($1, $2) RETURNING *";
    const values = [email,psw];

    pool.query(text,values,(err, res) => {
        console.log('query LOGIN');
        if (err) {
            console.log("error: "  + err);
            res.json("no logged in");
        } else {
            console.log("not error in creation");
            console.log(res.rows[0]);
            res.json("logged in");
            // { name: 'brianc', email: 'brian.m.carlson@gmail.com' }
        }
    });
    
    /*
    if(req.body.em =="user@email.com" && req.body.pass =="psw"){
        res.json({ ans: "ok" });
    };
*/
    
});


module.exports = app;