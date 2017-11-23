//Require Riot
var Riot = require("./Riot.js");
var functions = require("./Functions.js")


//firebase
var firebase = require("firebase");
var FCM = require("fcm-node");

var config = {
    apiKey: "AAAAmkyxv50:APA91bHW7nU98igv2hOa4ykspIJhU-Vx6B_LhuEHr_tLBchTuMKDnP6ErraYxn9uhsRu3JvE38qGGYGbKFUkMm-kPaKYEp7Mr0vbxgwd_GBWiinZYKziUN2CeiN-V8glmPQkjYmp_4eC",
    authDomain: "leagueoflegendscoaching-2645c.firebaseapp.com",
    databaseURL: "https://leagueoflegendscoaching-2645c.firebaseio.com",
    projectId: "leagueoflegendscoaching-2645c",
    storageBucket: "leagueoflegendscoaching-2645c.appspot.com",
    messagingSenderId: "662711680925"
  };
firebase.initializeApp(config);

var fcm = new FCM(config.apiKey);

var email = "cesaregri@gmail.com";
var password = "firebase1948";

firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
  var errorCode = error.code;
  var errorMessage = error.message;
});



//ottengo la reference al nodo Users del database
var USERS = firebase.database().ref('users/');
var COACHES = firebase.database().ref('coaches/');
var RESERVATIONS = firebase.database().ref('reservations/');
var RATINGS = firebase.database().ref('ratings/');


var exports = module.exports = {};

lastStep = function(result, response){
  console.log("last step code: "+result)
  response.end(result);
}

//funzione wrap per "register", serve per risolvere il problema dell'esecuzione asincrona del codice (result = undefined)
exports.registerUser = function(user, response){
Riot.checkSummoner(user, response, register);
} 

//funzione per registrare gli utenti
register = function(user, response, ok, lastStep){
  console.log('register');
  if (ok){
	  var ref = firebase.database().ref('users/' + user.ign);

  	ref.once('value').then(function(snapshot) {
   	if (snapshot.exists()){
   		//utente già presente nel db
      	var result = JSON.stringify({code: 11});
      	if(user.isCoach){
          console.log("continueCoach");
          continueCoach(user, response, result, lastStep);
        }
        else{
          console.log("else");
          lastStep(result, response);  
        }
    }
   	else
   	{
   		//inserisco l'utente nel db
   		obj = {ign: user.ign, password: user.password, isCoach: user.isCoach};
    	ref.set(obj, function (error) {
    	if (error){
    		//errore del database
      		var result = JSON.stringify({code: 12});
      		lastStep(result, response);
    }
    else{
    	//inserimento avvenuto con successo
      	var result = JSON.stringify({code:10});
        if(user.isCoach){
          console.log('register coach');
          continueCoach(user, response, result, lastStep)
        }
        else{
          lastStep(result, response);  
        }
    }
    });
   }      
  });
  }
  else{
    var result = JSON.stringify({code: 13});
    lastStep(result, response);
  }
}

exports.loginUser = function(ign, password, response){
	login(ign, password, response, lastStep)
} 

//funzione per loggare gli utenti
login = function(ign, password, response, callback){
	var ref = firebase.database().ref('users/' + ign);

  	ref.once('value').then(function(snapshot) {
   	if (snapshot.exists()){
   		//utente presente nel db
   		user = snapshot.val();
   		
   		if (user.password == password){
        if (user.isCoach == true){
          var result = JSON.stringify({code: 22});  
        }
        else{
          var result = JSON.stringify({code: 20});  
        }
      		lastStep(result, response);	
   		}
   		else{
   			var result = JSON.stringify({code: 21});
      	lastStep(result, response);	
   		}
    }
   	else
   	{
  		var result = JSON.stringify({code: 21});
  		lastStep(result, response);
    }
    });
}

exports.registerCoach = function(coach, response){
  Riot.checkSummoner(coach, response, register);
} 

function continueCoach(coach, response, result, lastStep){
    result_parsed = JSON.parse(result);
    if ((result_parsed.code == 10) || (result_parsed.code == 11 && coach.upgrade)){
        var ref = firebase.database().ref('coaches/' + coach.ign);

        ref.once('value').then(function(snapshot) {
        if (snapshot.exists()){
          console.log("se leggi questo piangi");
            //utente già presente nel db
            var result = JSON.stringify({code: 11});
            lastStep(result, response);
        }
        else
        {
          //inserisco l'utente nel db
          obj = {ign: coach.ign, elo: coach.elo, languages: coach.languages, role1: coach.role1, role2: coach.role2, cost: coach.cost, champions: coach.champions, schedule: coach.schedule};
          ref.set(obj, function (error) {
          if (error){
              //errore del database
              var result = JSON.stringify({code: 12});
              lastStep(result, response);
            }
            else
            {
                if(coach.upgrade){
                  console.log("sulla strada giusta");
                  var ref1 = firebase.database().ref('users/' + coach.ign+'/isCoach');
                  ref1.set(true, function(error){
                    if (error){
                      //errore del database
                      var result = JSON.stringify({code: 12});
                      lastStep(result, response);
                    }
                    else
                    {
                       //inserimento avvenuto con successo
                      console.log('coach registered');
                      var result = JSON.stringify({code:10});
                      lastStep(result, response);
                    }       
                  });                  
                }
                else{
                  //inserimento avvenuto con successo
                  console.log('coach registered');
                  var result = JSON.stringify({code:10});
                  lastStep(result, response);  
                }              
            }
          });
        }      
      });
    }else{
      lastStep(result, response);  
    }
    
}

exports.searchCoach = function(params, response){
  var namelist = [];
  console.log('searchCoach');
  //ricerca per nome
  if (params.nameCoach != ''){
    console.log("nameCoach not empty")
    var ref = firebase.database().ref('coaches/' + params.nameCoach);

    ref.once('value').then(function(snapshot) {
      if (snapshot.exists()){
        user = snapshot.val();
        console.log(JSON.stringify(user))
        namelist.push(user)
        lastStep(JSON.stringify(namelist), response)  
      }
    });
  }
  else{
    //filtro per elo
    console.log('name empty');
    var result = []
    var ref = firebase.database().ref('coaches/');
    ref.once('value').then(function(snapshot) {
      console.log('snapshot: '+JSON.stringify(snapshot));  
      snapshot.forEach(function(coach_db) {
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
        coach.champions.forEach(function(champ){
          if ((champ.id == params.idChampion1) || (champ.id == params.idChampion2) || (champ.id == params.idChampion3)){
            points = points + 10;
          }
        });        
        //languages
        var planguages = getLanguages(params.languages);
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

      res = sortResults(result, 10);
      lastStep(JSON.stringify(res), response);
    });
  }
}


/* FUNCTIONS */

function getLanguages(languages){
  s1 = languages.replace('[', '');
  s2 = s1.replace(']', '');
  temp = s2.split(", ");

  return temp;
}

function sortResults(items, limit){
  items.sort(function(a, b) {
    return parseInt(b.points) - parseInt(a.points);
  });

  tempList = items.slice(0, limit);
  result = [];
  tempList.forEach(function(item){
    result.push(item);
  });

  return result;
}

/* SCHEDULE */

exports.getReservations = function(coach, response){

  console.log("coach: "+coach);
  var ref = firebase.database().ref('reservations/'+coach);
  ref.once('value').then(function(snapshot) {
    if (snapshot.exists()){
      console.log("snap: "+snapshot);
      var daySchedule = snapshot;
      console.log("ARRAY "+JSON.stringify(daySchedule))
      lastStep(JSON.stringify(daySchedule), response);
    }
    else{
      console.log('non trovato');
      obj = {status: 0};
      ref.set(obj, function (error) {
      if (error){
        console.log("error");
    }
    else{
      console.log("tutto ok");
      lastStep(JSON.stringify(obj), response);
    }
  });
  }
  });
}      

global.response;

exports.reserve = function(reservation, coach, student, response){
  global.response = response;
  var key = firebase.database().ref('users/'+student+'/reservations/'+reservation.date).push().key;
  var updates = {};
  updates['users/'+student+/reservations/+reservation.date+"/"+key] = {user: coach.name, start: reservation.start, end: reservation.end, role1: coach.role1, role2: coach.role2, cost: coach.cost}

  var ref =  firebase.database().ref('reservations/'+coach.name+'/'+reservation.date)
  ref.once('value').then(function(snapshot){
    if (snapshot.exists()){
      updates['reservations/'+coach.name+'/'+reservation.date+'/'+key] = {start: reservation.start, end: reservation.end, user: student}; 
    }
    else{
      updates['reservations/'+coach.name] = {status:1, [reservation.date]:{array: reservation.array, [key]: {start: reservation.start, end: reservation.end, user: student}}};
    }

    firebase.database().ref().update(updates, function(error){
      if (error){
        var result = JSON.stringify({code:11});
        lastStep(result, response);
      }
      else{
        //var result = JSON.stringify({code:10});
        //lastStep(result, response);
        var idRef = firebase.database().ref('users/'+coach.name+'/token');
        idRef.once('value').then(function(id){
          createReserveNotifications(id, student);
        });
      }
   });
  });
}

exports.getUserReservation = function(user, response){
  var ref = firebase.database().ref('users/'+user+'/reservations');
  ref.once('value').then(function(snapshot) {
    if (snapshot.exists()){
      var reservations = snapshot;
      lastStep(JSON.stringify(reservations), response);
    }
    else{
      console.log('non trovato');
      lastStep(JSON.stringify({}), response);
    }
  });
}

exports.getCoachReservation = function(coach, response){
  var ref = firebase.database().ref('reservations/'+coach);
  ref.once('value').then(function(snapshot) {
    if (snapshot.exists()){
      var reservations = snapshot;
      lastStep(JSON.stringify(reservations), response);
    }
    else{
      console.log('non trovato');
      lastStep(JSON.stringify({}), response);
    }
  });
}

exports.deleteReservation = function(schedule, coach, student, key, response){
  var ref = firebase.database().ref('users/'+student+'/reservations/'+schedule.date+"/"+key);
  ref.remove(function(error){
  if(error){
    var result = JSON.stringify({code: 11});
    lastStep(result, response);
  }
  else{
     var ref2 = firebase.database().ref('reservations/'+coach+"/"+schedule.date+"/array");
     ref2.once('value').then(function(jsonArray) {
      console.log("start: "+ schedule.start+" end: "+schedule.end);
      console.log(JSON.stringify(jsonArray));
      var array = JSON.parse(JSON.stringify(jsonArray));

      for (var i = schedule.start; i < schedule.end; i++) {
        console.log("I: "+i);
        array[i] = false;
      }
      console.log("array"+ JSON.stringify(array));
      ref2.set(array, function(error){
        if(error){
          var result = JSON.stringify({code: 12});
          lastStep(result, response);
        }
        else{
          var ref3 = firebase.database().ref('reservations/'+coach+"/"+schedule.date+"/"+key);
          ref3.remove(function(error){
            if(error){
              var result = JSON.stringify({code: 11});
              lastStep(result, response);
            }
            else {
              var result = JSON.stringify({code: 10});
              global.response = response;
              createDeleteNotifications(coach,student);
              }
          });
        }
      });
     });
  }
});
}

exports.getFavourites = function(user, response){
  var ref = firebase.database().ref('users/'+user+'/favourites');
  var result = [];
  ref.once('value').then(function(favourites) {
    if (favourites.exists()){
      favourites.forEach(function(coach){
        var refcoach = firebase.database().ref('coaches/' + coach);
        var velue = refcoach.val();
        result.push(value);
        console.log("value: "+value);
      });
      lastStep(JSON.stringify(result), response);
    }
    else{
      lastStep(JSON.stringify({}), response);
    }
 });
}


exports.addFavourite = function(user, coach, response){
   var ref = firebase.database().ref('users/'+user+'/favourites');
   ref.once('value').then(function(favourites) {
    var set = new Set(favourites);
    set.add(coach);
    ref.set(set, function(error){
      if(error){
        var result = JSON.stringify({code: 11});
        lastStep(result, response);
      }
      else {
        var result = JSON.stringify({code: 10});
        lastStep(result, response);
      }
    });
   });
}

exports.deleteFavourite = function(user, coach, response){
  var ref = firebase.database().ref('users/'+user+'/favourites');
   ref.once('value').then(function(favourites) {
    var set = new Set(favourites);
    set.remove(coach);
    ref.set(set, function(error){
      if(error){
        var result = JSON.stringify({code: 11});
        lastStep(result, response);
      }
      else {
        var result = JSON.stringify({code: 10});
        lastStep(result, response);
      }
    });
   });
}

exports.updateInfo = function(coach, response){
  var ref = firebase.database().ref('coaches/' + coach.ign);
  updates = {}
  updates['elo'] = coach.elo;
  updates['languages'] = coach.languages;
  updates['role1'] = coach.role1;
  updates['role2'] = coach.role2;
  updates['cost'] = coach.cost;
  updates['schedule'] = coach.schedule;
  

  ref.update(updates, function (error) {
  if (error){
    //errore del database
    var result = JSON.stringify({code: 12});
    lastStep(result, response);
  }
  else
  {
  //inserimento avvenuto con successo
  console.log('coach updated');
  var result = JSON.stringify({code:10});
  lastStep(result, response);
  }
  });
}

//NOTIFICATIONS

//save token
exports.saveToken = function(user, token, response){
  var ref = firebase.database().ref('users/' + user + '/token');
  ref.set(token, function(error){
    if(error){
      var result = JSON.stringify({code:11});
      lastStep(result, response);
    }
    else{
      var result = JSON.stringify({code:10});
      lastStep(result, response);
    }
  });
}


//push notifications
function createReserveNotifications(id, student){
  console.log(student+' created a new reservation for you')
  console.log('token: '+JSON.stringify(id));
  var message = {
        to: id, 
        collapse_key: 'reservation',
        
        notification: {
            title: 'New reservation', 
            body: student+' created a new reservation for you' 
        }
    };
    console.log('body: '+ message.notification.body);
    fcm.send(message, function(err, response){
        if (err) {
            console.log("Something has gone wrong!");
            console.log(err);
        } else {
            console.log("Successfully sent with response:", response);
            result = JSON.stringify({code:10});
            lastStep(result, global.response);
        }
    });
}

function createDeleteNotifications(coach, student){
  var coachIdRef = firebase.database().ref('users/'+coach+'/token');
    coachIdRef.once('value').then(function(id){
      var message = {
        to: id, 
        collapse_key: 'reservation',
        
        notification: {
            title: 'reservation deleted', 
            body: 'A reservation made by '+student+' was deleted' 
        }
    };

    fcm.send(message, function(err, response){
        if (err) {
            console.log("Something has gone wrong!");
            console.log(err);
        } else {
            console.log("Successfully sent with response:", response);
            
            //student message
            var studentIdRef = firebase.database().ref('users/'+student+'/token');
            studentIdRef.once('value').then(function(id){
              var message = {
                to: id, 
                collapse_key: 'reservation',
        
                notification: {
                title: 'reservation deleted', 
                body: 'A reservation made for '+coach+' was deleted' 
                }
             };
             fcm.send(message, function(err, response){
              if (err) {
                console.log("Something has gone wrong!");
                console.log(err);
              } else {
                console.log("Successfully sent with response:", response);
                result = JSON.stringify({code:10});
                lastStep(result, global.response);
              }
            }); 
          });
        }
    });
  });
}