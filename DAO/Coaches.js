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

exports.searchCoach = (params) => {
  var deferred_search = deferred();
  var namelist = [];
  //ricerca per nome
  if (params.nameCoach != ''){
    var ref = COACHES.child(params.nameCoach);

    ref.once('value').then(snapshot => {
      if (snapshot.exists()){
        user = snapshot.val();
        namelist.push(user)
        deferred_search.resolve(namelist);
      }
    });
  }
  else{
    //filtro per elo
    var result = []
    var ref = COACHES;
    ref.once('value').then(snapshot => {
      snapshot.forEach(coach_db => {
        coach = coach_db.val();
        
        var points = 0;
        //role
        if((coach.role1 == params.role) || (coach.role2 == params.role)){
          points = points + 10;
        }
        //elo
        if(coach.elo >= params.elo){
          points = points + 10*coach.elo;
        }
        //cost
        if(coach.cost <= params.cost){
          points = points + (params.cost - coach.cost);
        }
        //champions
        coach.champions.forEach(champ => {
          if ((champ.id == params.idChampion1) || (champ.id == params.idChampion2) || (champ.id == params.idChampion3)){
            points = points + 10;
          }
        });        
        //languages
        var planguages = Functions.getLanguages(params.languages);
        planguages.forEach(function(pLang){
          coach.languages.forEach(function(cLang){
            if (pLang == cLang){
              points = points + 1;
            }
          });
        });
        //aggiungo il coach con relativi punti ai risultati
        if (points > 0){
          coach.points = points;
          result.push(coach); 
        }
      });

      res = Functions.sortResults(result, 10);
      deferred_search.resolve(res);
    });
  }
  return deferred_search.promise;
}


exports.updateInfo = (coach) => {
    var deferred_update = deferred();
    var ref = COACHES.child(coach.ign);
    updates = {}
    updates['elo'] = coach.elo;
    updates['languages'] = coach.languages;
    updates['role1'] = coach.role1;
    updates['role2'] = coach.role2;
    updates['cost'] = coach.cost;
    updates['schedule'] = coach.schedule;
    
    ref.update(updates, error => {
    if (error){
      //errore del database
      var result = {code: 12};
      deferred_update.resolve(result);
    }
    else
    {
    //inserimento avvenuto con successo
    var result = {code:10};
    deferred_update.resolve(result);
    }
    });
    return deferred_update.promise;
  }

  exports.updateChampions = (user) => {
    var deferred_update_champions = deferred()
    var ref = COACHES.child(user.ign + '/champions');
    ref.set(user.champions, function(error){
      if(error){
          var result = {code: 11};
          deferred_update_champions.resolve(result);
        }
        else {
          var result = {code: 10};
          deferred_update_champions.resolve(result);
        }
    });
  };

  