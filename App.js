import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { 
    AuthenticationDetails, 
    CognitoUser, 
    CognitoUserAttribute, 
    CognitoUserPool 
} from './lib/aws-cognito-identity';
import * as AWS from 'aws-sdk/dist/aws-sdk-react-native';

export default class App extends React.Component {

  constructor() {
    super();
    this.state = { token: null, status: "NONE" };
  }

  getToken = function() {
    this.setState({ ...this.state, status: 'START' });
    console.log('auth starting');
    var authenticationData = {
        Username : '',
        Password : ''
    };
    var authenticationDetails = new AuthenticationDetails(authenticationData);
    var poolData = {
        UserPoolId : '', // Your user pool id here
        ClientId : '' // Your client id here
    };
    var userPool = new CognitoUserPool(poolData);
    var userData = {
        Username : '',
        Pool : userPool
    };
    var cognitoUser = new CognitoUser(userData);
    var self = this;
    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: function (result) {
            let tok = result.getIdToken().getJwtToken();
            console.log(tok);
            self.setState({ ...self.state, token: tok });

            AWS.config.region = '';

            AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                IdentityPoolId : '', // your identity pool id here
                Logins : {
                    // Change the key below according to the specific region your user pool is in.
                    '' : tok
                }
            });

            AWS.config.credentials.get(function () {
              var accessKeyId = AWS.config.credentials.accessKeyId;
              var secretKey = AWS.config.credentials.secretAccessKey;
              var sessionToken = AWS.config.credentials.sessionToken;

              self.setState({ ...self.state, accessKeyId, secretKey, sessionToken });

              console.log(AWS.config.credentials.identityId);
              console.log(accessKeyId);
              console.log(secretKey);
              console.log(sessionToken);
            });            
        },

        onFailure: function(err) {
            console.log(err);
        },
        newPasswordRequired: function(userAtt, reqAtt)
        {
          console.log(userAtt);
          console.log(reqAtt);

          cognitoUser.completeNewPasswordChallenge("", reqAtt, {
            onSuccess: function(session) {
              let tok = session.getAccessToken().getJwtToken();
              console.log('access token + ' + tok);
              self.setState({ ...self.state, token: tok });
            },
            onFailure: function(err) {
              console.log(err);
            }
          })
        }
    });
    console.log("all done");
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>Open up App.js to start working on your app!</Text>
        <Text>Changes you make will automatically reload.</Text>
        <Text>Shake your phone to open the developer menu.</Text>
        <Button title="Get Token" onPress={this.getToken.bind(this)}></Button>
        <Text>Status: { this.state.status }</Text>
        <Text>{ this.state.token }</Text>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
