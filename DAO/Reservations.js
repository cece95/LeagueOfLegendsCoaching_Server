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

exports.getCoachSchedule = (user) => {
    var deferred_schedule = deferred();
    var ref = RESERVATIONS.child(user);
    ref.once('value').then(snapshot => {
      if (snapshot.exists()){
        var daySchedule = snapshot;
        deferred_schedule.resolve(daySchedule);
      }
      else{
        obj = {status: 0};
        ref.set(obj, error => {
        if (error){
          deferred_schedule.resolve({code: 13})
      }
      else{
        deferred_schedule.resolve(obj);
      }
    });
    }
    });
    return deferred_schedule.promise;
};

exports.reserve = (reservation, coach, student) => {
    var deferred_reserve = deferred();
    var key = USERS.child(student+'/reservations/'+reservation.date).push().key;
    var updates = {};
    updates['users/'+student+/reservations/+reservation.date+"/"+key] = coach;
  
    var ref = RESERVATIONS.child(coach.name+'/'+reservation.date);
    ref.once('value').then(snapshot => {
      if (snapshot.exists()){
        updates['reservations/'+coach.name+'/'+reservation.date+'/'+key] = {start: reservation.start, end: reservation.end, user: student}; 
      }
      else{
        updates['reservations/'+coach.name] = {status:1, [reservation.date]:{array: reservation.array, [key]: {start: reservation.start, end: reservation.end, user: student}}};
      }
  
      firebase.database().ref().update(updates, error => {
        if (error){
          var result = {code:13};
          deferred_reserve.resolve(result);
        }
        else{
          var idRef = firebase.database().ref('users/'+coach.name+'/token');
          idRef.once('value').then(id => {
            deferred_reserve.resolve({id: id});
          });
        }
     });
    });
    return deferred_reserve.promise;
  }

  exports.createReserveNotifications = (id, student) => {
    var def = deferred();
    var message = {
          to: id, 
          collapse_key: 'reservation',
          
          notification: {
              title: 'New reservation', 
              body: student+' created a new reservation for you' 
          }
      };
    fcm.send(message, (err, response) => {
        if (err) {
            def.resolve({code:13});
        } else {
            def.resolve({code:10});
        }
    });
    return def.promise;
}