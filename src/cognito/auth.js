//var AWS = require('aws-sdk');
//var cognitoIdentity = new AWS.CognitoIdentity();
//var CognitoUserPool = cognitoIdentity.CognitoUserPool;
var AmazonCognitoIdentity = require('amazon-cognito-identity-js');
var CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
const AWS = require('aws-sdk');

var poolData = { UserPoolId : 'us-east-1_HhEqUyXU9',
    ClientId : '1hetfr9fr5t34f9jeqr6v593fn'
};

var userPool = new CognitoUserPool(poolData);

console.log('setting attributes');

var attribute = {
    Name : 'email',
    Value : 'santoroclaudio96@gmail.com'
};
var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(attribute);
var attributeList = [];

attributeList.push(attributeEmail);


console.log('pushed');

var cognitoUser;


console.log('trying to signup')

userPool.signUp('username', 'password', attributeList, null, function(err, result) {
    if (err) {
        console.log('There was an error: ' + err);
        alert(err);
        return;
    }
    cognitoUser = result.user;
});
