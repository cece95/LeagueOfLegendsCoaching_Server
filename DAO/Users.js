const firebase = require("firebase");
const FCM = require("fcm-node");
const deferred = require('deferred');

const Riot = require("./riot/riot");
//const Functions = require("./Functions.js");
const config = require('./config');

//firebase auth
firebase.initializeApp(config.firebase);
var fcm = new FCM(config.firebase.apiKey);

var email = config.user.email;
var password = config.user.password;

firebase.auth().signInWithEmailAndPassword(email, password)
.catch((error) => {
    var errorCode = error.code;
    var errorMessage = error.message;
});

//DB references
var USERS = firebase.database().ref('users/');
var COACHES = firebase.database().ref('coaches/');
var RESERVATIONS = firebase.database().ref('reservations/');
var RATINGS = firebase.database().ref('ratings/');

exports.register = (user) => {
    deferred_register = deferred();
    let result;
    console.log('user register: ', user);
    if (user){
        console.log('user: ', user);
        var ref = USERS.child(user.ign);
        
        ref.once('value').then(function(snapshot) {
            if (snapshot.exists()){
                //utente già presente nel db
                result = {code: 11};
                if(user.isCoach){
                    return new Promise(resolve => {resolve(continueCoach(user, result))});
                }
                else{
                    deferred_register.resolve(result); 
                }
            }
            else{
            //inserisco l'utente nel db
            obj = {ign: user.ign, password: user.password, isCoach: user.isCoach};
            ref.set(obj, (error) => {
                if (error){
                    //errore del database
                    result = {code: 12};
                    return deferred_register.resolve(result);
                }
                else{
                    //inserimento avvenuto con successo
                    result = {code:10};
                    if(user.isCoach){
                        return new Promise(resolve => {resolve(continueCoach(user, result))});
                    }
                    else{
                        return deferred_register.resolve(result); 
                    }
                }
            });
        }      
    });
    }
    else{
      result = {code: 13, error:"user not found"};
      deferred_register.resolve(result);
    }
    return deferred_register.promise;
}

const continueCoach = (coach, result) => {
    var deferred_continue = deferred();
    
    if ((result.code == 10) || (result.code == 11 && coach.upgrade)){
        var ref = COACHES.child(coach.ign);

        ref.once('value').then((snapshot) => {
        if (snapshot.exists()){
            //utente già presente nel db
            result = {code: 11};
            deferred_continue.resolve(result);
        }
        else
        {
          //inserisco l'utente nel db
          obj = {ign: coach.ign, elo: coach.elo, languages: coach.languages, role1: coach.role1, role2: coach.role2, cost: coach.cost, champions: coach.champions, schedule: coach.schedule};
          ref.set(obj, (error) => {
          if (error){
              //errore del database
              result = {code: 12};
              deferred_continue.resolve(result);
            }
            else
            {
                if(coach.upgrade){
                    var ref1 = USERS.child(coach.ign+'/isCoach');
                    
                    ref1.set(true, (error) => {
                    if (error){
                        //errore del database
                        result = {code: 12};
                        deferred_continue.resolve(result);
                    }
                    else
                    {
                        //inserimento avvenuto con successo
                        result = {code:10};
                        deferred_continue.resolve(result);
                    }       
                  });                  
                }
                else{
                  //inserimento avvenuto con successo
                  result = {code:10};
                  deferred_continue.resolve(result);
                }              
            }
          });
        }      
      });
    }
    else{
        deferred_continue.resolve(result);  
    }
    return deferred_continue.promise;
}

exports.login = (post_user) => {
    deferred_login = deferred();
    var ref = USERS.child(post_user.ign);
    var result;

  	ref.once('value').then(snapshot => {
   	if (snapshot.exists()){
   		//utente presente nel db
   		user = snapshot.val();
   		
   		if (user.password == post_user.password){
        if (user.isCoach == true){
          result = {code: 22};  
        }
        else{
          result = {code: 20};  
        }
      		deferred_login.resolve(result);	
   		}
   		else{
   			result = {code: 21};
      	    deferred_login.resolve(result);	
   		}
    }
   	else
   	{
  		result = {code: 21};
  		deferred_login.resolve(result);	
    }
    });
    return deferred_login.promise;
}

exports.saveToken = (user, token) => {
    var deferred_token = deferred();
    var ref = USERS.child(user + '/token');
    ref.set(token, error => {
      if(error){
        var result = {code:11};
        deferred_token.resolve(result);
      }
      else{
        var result = {code:10};
        deferred_token.resolve(result);
      }
    });
  }