const express = require("express");
//const Video = require("./models/
var cors = require('cors');
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const {Pool,Client} = require('pg')

/*******************COGNITO********************/


global.fetch = require('node-fetch');
var AmazonCognitoIdentity = require('amazon-cognito-identity-js');
var CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
const AWS = require('aws-sdk');

var poolData = { UserPoolId : 'us-east-1_WLaeGxYQd',
    ClientId : '4d76fpsdlldt729bkjufbj7gcb'
};

var userPool = new CognitoUserPool(poolData);



/*******************************************************/


const pool = new Pool({
    user:"postgres",
    host:"database-1.cv1l7z2qnpv7.us-east-1.rds.amazonaws.com",
    //host:"sdccdb.cq0cmm7hsjuw.eu-central-1.rds.amazonaws.com",
    database:"sdccdb",
    password:"postgres",
    port:5432
});

const creation = 'CREATE TABLE IF NOT EXISTS "users"(' +
    'username VARCHAR(50) PRIMARY KEY,' +
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




app.get("/", (req, res) => {
    res.json({ msg: "I'm users-micro, Up & Running" });
});

/*

app.get("/api/u1/users", async (req, res) => {
    const videos = await Video.find({});
    res.json(videos);
});*/
function cognitoLog(email, psw) {
    var idToken;
    var accessToken;

    console.log('cognitoLogin!');
    var authenticationData = {
        Username : 'prova@example.com',// 'closantoro@gmail.com',
        Password : 'password',
    };
    var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
    var poolData = { UserPoolId : 'us-east-1_WLaeGxYQd',
        ClientId : '4d76fpsdlldt729bkjufbj7gcb'
    };
    var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    var userData = {
        Username : 'prova@example.com',//'closantoro@gmail.com',
        Pool : userPool
    };
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    console.log('cognitoUser is: ' + JSON.stringify(cognitoUser));
    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (result) {
            accessToken = result.getAccessToken().getJwtToken();

            /* Use the idToken for Logins Map when Federating User Pools with identity pools or when passing through an Authorization Header to an API Gateway Authorizer */
            idToken = result.idToken.jwtToken;

            console.log('Access token: ' + JSON.stringify(accessToken));
            console.log('Id token: ' + JSON.stringify(idToken));

            sessionStorage.setItem('accessToken',accessToken);
            sessionStorage.setItem('idToken',idToken);
        },

        onFailure: function(err) {
            console.log('There was an error: ' + JSON.stringify(err));
            //alert(err);
        },

    });
}



function cognitoSignUp(email,psw) {

    var attribute = {
        Name : 'email',
        Value : email
    };
    var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(attribute);
    var attributeList = [];

    attributeList.push(attributeEmail);
    var cognitoUser;


    console.log('trying to signup; userPool is: '+ JSON.stringify(userPool));

    userPool.signUp(email, psw, attributeList, null, function(err, result) {
        if (err) {
            console.log('There was an error: ' + JSON.stringify(err));
            //alert(err);
            return;
        }
        cognitoUser = result.user;
    });




}


app.post("/users/registration", async (req, res) => {
    console.log('called');
    console.log('got request: ' + req);
    let user =req.body.name;
    let email= req.body.email;
    let psw = req.body.psw;
    console.log('got name: ' + user);
    console.log('got email: ' + email);
    console.log('got psw: ' + psw);


    const text = "INSERT INTO users(username, email,password) VALUES($1, $2,$3) RETURNING *";
    const values = [user,email,psw];
// callback
    pool.query(text,values,(err, res) => {
        console.log('query2');
        if (err) {
            console.log("error: "  + err);
        } else {
            console.log("not error in creation");
            cognitoSignUp(email,psw)
            //console.log(res.rows[0])
            // { name: 'brianc', email: 'brian.m.carlson@gmail.com' }
        }
    });


});


app.post("/users/login", (req, res) => {

    console.log('body is: ' + JSON.stringify(req.body));
    let email= req.body.em;
    let psw = req.body.pass;
    console.log('got email: ' + email);
    console.log('got psw: ' + psw);

    //const text = "SELECT FROM users(email,password) VALUES($1, $2)";//" RETURNING *";
    const values = [email,psw];

    const text = "SELECT * FROM users WHERE  email ='"+email + "' AND password = '" + psw + "';";
    pool.query(text,/*values,*/(err, res) => {
        console.log('query LOGIN: ' + text);
        if (err) {
            console.log("error: "  + err);
            res.json("no logged in");
        } else {
            console.log("not error in creation ");
            //console.log(res.rows[0]);
            //res.json("logged in");
            cognitoLog(email,psw);
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