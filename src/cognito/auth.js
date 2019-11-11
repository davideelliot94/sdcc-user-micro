//var AWS = require('aws-sdk');
//var cognitoIdentity = new AWS.CognitoIdentity();
//var CognitoUserPool = cognitoIdentity.CognitoUserPool;
global.fetch = require('node-fetch');
var AmazonCognitoIdentity = require('amazon-cognito-identity-js');
var CognitoUserPool = AmazonCognitoIdentity.CognitoUserPool;
const AWS = require('aws-sdk');

var poolData = { UserPoolId : 'us-east-1_WLaeGxYQd',
    ClientId : '4d76fpsdlldt729bkjufbj7gcb'
};

var userPool = new CognitoUserPool(poolData);

console.log('setting attributes');

var attribute = {
    Name : 'email',
    Value : 'closantoro@gmail.com'
};
var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(attribute);
var attributeList = [];

attributeList.push(attributeEmail);


/*console.log('pushed');

var cognitoUser;


console.log('trying to signup; userPool is: '+ JSON.stringify(userPool));

userPool.signUp('closantoro@gmail.com', 'password', attributeList, null, function(err, result) {
    if (err) {
        console.log('There was an error: ' + JSON.stringify(err));
        //alert(err);
        return;
    }
    cognitoUser = result.user;
});
*/
// Amazon Cognito creates a session which includes the id, access, and refresh tokens of an authenticated user.

var idToken;
var accessToken;

var authenticationData = {
    Username : 'closantoro@gmail.com',
    Password : 'password',
};
var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
var poolData = { UserPoolId : 'us-east-1_WLaeGxYQd',
    ClientId : '4d76fpsdlldt729bkjufbj7gcb'
};
var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
var userData = {
    Username : 'closantoro@gmail.com',
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

console.log('Access token: ' + JSON.stringify(accessToken));
console.log('Id token: ' + JSON.stringify(idToken));