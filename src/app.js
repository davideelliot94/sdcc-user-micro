var express = require("express");
var cors = require('cors');
var bodyParser = require("body-parser");
var session = require('express-session');
const {Pool,Client} = require('pg');
var AWS = require('aws-sdk');
var jwt   = require('jsonwebtoken');
global.fetch = require('node-fetch');
//var request = require('request');
var AmazonCognitoIdentity = require('amazon-cognito-identity-js');
//const Video = require("./models/


const app = express();
app.use(cors());
app.use(bodyParser.json());

//app.use(session({secret: 'sdcc'}));

/*******************COGNITO********************/



var CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;

var poolData = { UserPoolId : 'us-east-1_WLaeGxYQd',
    ClientId : '4d76fpsdlldt729bkjufbj7gcb'
};

var userPool = new CognitoUserPool(poolData);
var idToken,accessToken;


var k1 = "6jqcZFFzaqP04u85tWTfAw55ls6PTbiABoDj/5I6LPQ=";
var k2 = "Sy/VW9mfv6T6q3wFOSoQCBMwKG+9ZyW/sEE92KI96Pg=";
/*******************************************************/


app.use(function (req, res, next) {
    // do something with the request
    var jwtToken;
    console.log('url is: '  +req.url);
    var nweText = req.body;
    if(nweText !== null && nweText !== undefined) {
        console.log('nweText is: ' + JSON.stringify(nweText));

    }
    if((req.url !== '/users/login') && (req.url !== '/users/registration') && (req.url !== '/users/qUrl') ) {
        var jwtToken = req.get('Authorization');
        console.log('headers: ' + jwtToken);

	const Verifier = require('verify-cognito-token');
	const params = {
  		region: 'us-east-1',
  		userPoolId: 'us-east-1_WLaeGxYQd'
	}
	const verifier = new Verifier(params);
 
	verifier.verify(jwtToken).then(function (data) {
		if(data === true)
			console.log("it's true!");
                console.log("Query Item succeeded: ", JSON.stringify(data));
	

        }).catch(function (err) {
		res.status(401);
            	res.json({msg: 'Token Expired'});
                console.log("Error: ", JSON.stringify(err));
        });

       // var decoded = jwt.verify(jwtToken, k2,{ algorithm: ['RS256']});
       // console.log('payload is: ' + decoded);
    }

    //console.log('nwe is: ' + nwe);
    next(); // MUST call this or the routes will not be hit
});




function findFirstDiffPos(a, b)
{
    var shorterLength = Math.min(a.length, b.length);

    for (var i = 0; i < shorterLength; i++)
    {
        if (a[i] !== b[i]) return i;
    }

    if (a.length !== b.length) return shorterLength;

    return -1;
}


const pool = new Pool({
    user:"postgres",
    host:"sdccrds.cv1l7z2qnpv7.us-east-1.rds.amazonaws.com",
    //host:"sdccdb.cq0cmm7hsjuw.eu-central-1.rds.amazonaws.com",
    database:"sdcc_rds",
    password:"postgres",
    port:5432
});

const creation = 'CREATE TABLE IF NOT EXISTS "users"(' +
        'id SERIAL PRIMARY KEY,'+
        'username VARCHAR(50),' +
        'email VARCHAR(50) NOT NULL,' +
        'password VARCHAR(10) NOT NULL,' +
        'name VARCHAR(20),' +
        'surname VARCHAR(20),' +
        'role INTEGER);';

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



const list_creation = 'CREATE TABLE IF NOT EXISTS "list_association"(' +
	'id SERIAL PRIMARY KEY,'+
        'username VARCHAR(20),' +
        'topicName VARCHAR(10) NOT NULL,' +
        'url VARCHAR(80) NOT NULL);';


pool.query(list_creation, function(err,rows){
        if (err) {
	    console.log('error list');
            var start = new Date().getTime();
            while (new Date().getTime() < start + 3000) ;

        }
        else{
            console.log('not error');
        }
});




app.get("/", (req, res) => {
    res.json({ msg: "I'm users-micro, Up & Running" });
});


function cognitoLog(email, psw,res,rows) {

    console.log('cognitoLogin!');
    var authenticationData = {
        Username : email,// 'closantoro@gmail.com',
        Password : psw,
    };
    var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
    var poolData = { UserPoolId : 'us-east-1_WLaeGxYQd',
        ClientId : '4d76fpsdlldt729bkjufbj7gcb'
    };
    var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
    var userData = {
        Username : email,//'closantoro@gmail.com',
        Pool : userPool
    };
    var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
   // console.log('cognitoUser is: ' + JSON.stringify(cognitoUser));
    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (result) {
            accessToken = result.getAccessToken().getJwtToken();
	    console.log('got access token: ' + JSON.stringify(accessToken));
            /* Use the idToken for Logins Map when Federating User Pools with identity pools or when passing through an Authorization Header to an API Gateway Authorizer */
            idToken = result.idToken.jwtToken;
            console.log('sending results');
            res.status(200);
            res.json({
                token: accessToken,
                username: rows.rows[0].username,
                name: rows.rows[0].name,
                surname: rows.rows[0].surname,
                email: rows.rows[0].email,
                role: rows.rows[0].role
            });
           // console.log('Access token: ' + JSON.stringify(accessToken));
            //console.log('Id token: ' + JSON.stringify(idToken));

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



app.post("/users/registration", (req, res) => {
   // createUsers();
    console.log('called');
    console.log('got request: ' + req);
    var user =req.body.username;
    var email= req.body.email;
    var psw = req.body.psw;
    var name = req.body.name;
    var surname = req.body.surname;
    var role = req.body.role;

    console.log('got name: ' + user);
    console.log('got email: ' + email);
    console.log('got psw: ' + psw);
    console.log('got name: ' + name);
    console.log('got surname: ' + surname);
    console.log('got role: ' + role);
    console.log(typeof role);

    const text = "INSERT INTO users(username, email,password,name,surname,role) VALUES($1,$2,$3,$4,$5,$6) RETURNING *";
    const values = [user,email,psw,name,surname,role];
// callback
    pool.query(text,values,(err, response) => {
        console.log('query2');
        if (err) {
            console.log("error: "  + err);
            throw err;
        } else {
            cognitoSignUp(email,psw);
            console.log("not error in creation");
            res.send({msg:'successful signup'})
        }
    });


});







app.post("/users/login", (req, res) => {

    var email= req.body.em;
    var psw = req.body.pass;
    var role;
    console.log('got email: ' + email);
    console.log('got psw: ' + psw);
    console.log('full url is: ' + req.url);
    console.log('e mail and psw: ' + JSON.stringify(email) + '   ' + JSON.stringify(psw));

    var text ="SELECT name,surname,username,email,role FROM users WHERE email='"+email +"' AND password='"+psw +"'";
    var role;

    //var values = [newpsw,newname,newsurname,email];
    console.log('text is: ' + text);
    pool.query(text, /*values, */function(err,rows){
        if (err)/* ||rows.rows[0] === undefined)*/ {
            console.log('error is: ' + err);
            return err;
        }
        if(rows.rows[0] === undefined){
            res.status(404);
            res.json({msg: 'Unexisting username'});
            //return new Error('Unexisting username');

        }
        else{
            console.log('row 0: ' + rows.rows[0]);
            return cognitoLog(email,psw,res,rows);

            //return res;
        }
    });

});



app.get("/users/profile/*", (req, res) => {

    var response;
    //var email= req.body.email;
    var fullUrl = req.url;


    var index = findFirstDiffPos("/users/profile/",fullUrl);
    var email = fullUrl.substring(index);

    console.log('profile, got email: ' + email);

    const text ="SELECT * FROM users WHERE email='"+email +"';";
    console.log(JSON.stringify(text));
    //var rows;
    pool.query(text, function (error, results) {
        //if (error || results.rows[0] === undefined) throw error;

        if (error)/* ||rows.rows[0] === undefined)*/ {
            console.log('error is: ' + err);
            return error;
        }
        if(results.rows[0] === undefined){
            console.log('is undefined');
            res.status(404);
            res.json({msg: 'Unexisting username'});
            //return new Error('Unexisting username');

        }
        else {
            console.log(results.rows[0].name)
            var rows = results["rows"];
            //res.send({msg: 'msg'});
            res.send({
                username: results.rows[0].username,
                name: results.rows[0].name,
                surname: results.rows[0].surname,
                email: results.rows[0].email
            });
        }

    });

});







app.get("/users/lists/*", (req, res) => {

    var response;
    //var email= req.body.email;
    var fullUrl = req.url;


    var index = findFirstDiffPos("/users/lists/",fullUrl);
    var usern = fullUrl.substring(index);

    console.log('profile, got usern: ' + usern);

    const text ="SELECT topicname,url FROM list_association WHERE username<>'"+usern +"' and url LIKE '%sns%';";
    console.log(JSON.stringify(text));
    //var rows;
    pool.query(text, function (error, results) {
        //if (error || results.rows[0] === undefined) throw error;

        if (error)/* ||rows.rows[0] === undefined)*/ {
            console.log('error is: ' + err);
            return error;
        }
        if(results.rows[0] === undefined){
            console.log('is undefined');
            res.status(404);
            res.json({msg: 'Unexisting username'});
            //return new Error('Unexisting username');

        }
        else {
            var arrayRes = [];
            var length = results.rows.length;
            var x;
            for(x = 0; x < length; x ++) {
                var list = [results.rows[x].topicname, results.rows[x].url];
                arrayRes.push(list);
            }
            console.log('final array is: ' + arrayRes);
            res.json(arrayRes);

        }

    });

});



app.get("/users/lists2/*", (req, res) => {

    var response;
    //var email= req.body.email;
    var fullUrl = req.url;


    var index = findFirstDiffPos("/users/lists2/",fullUrl);
    var usern = fullUrl.substring(index);

    console.log('profile, got usern: ' + usern);

    const text ="SELECT DISTINCT topicname,url FROM list_association WHERE username='"+usern +"';";
    console.log(JSON.stringify(text));
    //var rows;
    pool.query(text, function (error, results) {
        //if (error || results.rows[0] === undefined) throw error;

        if (error)/* ||rows.rows[0] === undefined)*/ {
            console.log('error is: ' + error);
            return error;
        }
        if(results.rows[0] === undefined){
            console.log('is undefined');
            res.status(404);
            res.json({msg: 'Unexisting username'});
            //return new Error('Unexisting username');

        }
        else {
            var rows = results["rows"];
            //res.send({msg: 'msg'});
	    var arrayRes = [];
	    var length = results.rows.length;
	    var x;
	    for(x = 0; x < length; x ++) {
            var list = [results.rows[x].topicname, results.rows[x].url];
            arrayRes.push(list);
        }
	    console.log('final array is: ' + arrayRes);
            res.json(arrayRes);
        }

    });

});






app.get("/users/qUrl/*", (req, res) => {

    var response;
    //var email= req.body.email;
    var fullUrl = req.url;


    var index = findFirstDiffPos("/users/qUrl/",fullUrl);
    var receiver = fullUrl.substring(index);

    console.log('profile, got receiver: ' + receiver);

    const text ="SELECT l.url FROM users u JOIN list_association l ON (l.username=u.username) WHERE u.username='"+receiver+"'  AND l.url LIKE '%sqs%'";

    console.log(JSON.stringify(text));
    //var rows;
    pool.query(text, function (error, results) {
        //if (error || results.rows[0] === undefined) throw error;

        if (error)/* ||rows.rows[0] === undefined)*/ {
            console.log('error is: ' + err);
            return error;
        }
        if(results.rows[0] === undefined){
            console.log('is undefined');
            res.status(404);
            res.json({msg: 'Unexisting username'});
            //return new Error('Unexisting username');

        }
        else {
	    console.log('rows: ' + JSON.stringify(results["rows"]));
	    var resUrl = results.rows[0].url;
            var rows = results["rows"];
	    console.log('rows2: ' + JSON.stringify(rows));
            console.log('got url: ' + JSON.stringify(rows[0].url));
            //var rows = results["rows"];
            //res.send({msg: 'msg'});
            res.json({
                qUrl: rows[0].url
            });
        }

    });

});




app.post("/users/profile/save", (req, res) => {

    var email= req.body.email;
    var newpsw = req.body.psw;
    var newname = req.body.name;
    var newsurname = req.body.surname;
    console.log('got email: ' + email);
    console.log('got psw: ' + newpsw);
    console.log('got name: ' + newname);
    console.log('got surname: ' + newsurname);

    var text = "UPDATE users SET password ='" + newpsw+"', name ='"+newname+"', surname ='"+newsurname+"' WHERE email = '"+email+"';";
    //var values = [newpsw,newname,newsurname,email];
    console.log('text is: ' + text);
    pool.query(text, /*values, */function(err,rows){
        if (err) {
            console.log('error is: ' + err);
            var start = new Date().getTime();
            while (new Date().getTime() < start + 3000) ;

        }
        else{
            console.log('not error');
            res.status(200);
            res.send();
        }
    });

});






app.post("/users/associate/", (req, res) => {

    var topicName = req.body.topicName;
    var username = req.body.usern;
    var url = req.body.url;

    console.log('got topicName: ' + topicName);
    console.log('got user: ' + username);
    console.log('got url: ' + url);


    const text = "INSERT INTO list_association(username,topicName,url) VALUES($1,$2,$3) RETURNING *";
    const values = [username,topicName,url];
// callback
    pool.query(text,values,(err, response) => {
        console.log('query2');
        if (err) {
            console.log("error: "  + err);
            throw err;
        } else {
            console.log("not error in creation");
            res.send({msg:'successful signup'})
            //cognitoSignUp(email,psw)
        }
    });
});




app.get("/users/all/", (req, res) => {

    console.log('users/all');
    var response;
//var email= req.body.email;
    var fullUrl = req.url;
    const text ="SELECT count(*) FROM users;";
    console.log(JSON.stringify(text));
//var rows;
    pool.query(text, function (error, results) {
        if (error) throw error;
        console.log(results.rows[0].count)
        var rows = results["rows"];
        //res.send({msg: 'msg'});
        res.send({
            number:rows[0].count
        });

    });

});


app.get("/users/teachers/", (req, res) => {

    var response;
//var email= req.body.email;
    var fullUrl = req.url;

    const text ="SELECT count(*) FROM users WHERE role=1;";
    console.log(JSON.stringify(text));
//var rows;
    pool.query(text, function (error, results) {
        if (error) throw error;
        console.log(results.rows[0].count)
        var rows = results["rows"];
    //res.send({msg: 'msg'});
        res.send({
            number:rows[0].count
        });

    });

});



app.get("/users/delete/", (req, res) => {

    var response;
//var email= req.body.email;
    var fullUrl = req.url;

    const text ="DELETE FROM users WHERE email='"+req.body.email+"'";
    console.log(JSON.stringify(text));
//var rows;
    pool.query(text, function (error, results) {
        if (error) throw error;
        else {
            console.log('deleted user');
            res.status(200).send;
        }
    });


});


module.exports = app;
