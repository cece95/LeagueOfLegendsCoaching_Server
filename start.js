//express
var express = require('express');
var app = express();

//body parser
var bodyParser = require('body-parser');
app.use(bodyParser.json());

//require Users
var Users = require("./Users.js");

app.post('/userRegistration', function (request, response) {

  response.setHeader("Access-Control-Allow-Origin", "*")
  response.setHeader("Content-Type", "application/json");    
  
  console.log("Register POST");

	var ign = request.body.ign;  
	var password = request.body.password;
  
  var user = {
    ign: ign,
    password: password,
    isCoach: false
  };

  Users.registerUser(user, response);  

});

app.post('/userLogin', function (request, response) {

  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Content-Type", "application/json");    
  
  console.log("Login POST");

  var ign = request.body.ign;  
  var password = request.body.password;
  
  Users.loginUser(ign, password, response);  

});

app.post('/saveToken', function(request, response){
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Content-Type", "application/json");    
  
  console.log("Save Token");

  var ign = request.body.ign;  
  var token = request.body.token;
  
  Users.saveToken(ign, token, response);  
});

app.post('/coachRegistration', function(request, response){
  
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Content-Type", "application/json"); 

  console.log("Coach Register");

  var coach = {
    ign: request.body.ign,  
    password: request.body.password,
    isCoach: true,
    elo: request.body.elo,
    languages: request.body.languages,
    role1: request.body.role1,
    role2: request.body.role2,
    cost: request.body.cost,
    upgrade: request.body.upgrade,
    schedule: request.body.schedule
  };
  

  Users.registerCoach(coach, response);

});

app.post('/updateInfo', function(request, response){

  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Content-Type", "application/json");

  var coach = {
    ign: request.body.ign,  
    password: request.body.password,
    isCoach: true,
    elo: request.body.elo,
    languages: request.body.languages,
    role1: request.body.role1,
    role2: request.body.role2,
    cost: request.body.cost,
    upgrade: request.body.upgrade,
    schedule: request.body.schedule
  };

  Users.updateInfo(coach, response);
});

app.post('/searchCoach', function(request, response){

  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Content-Type", "application/json");   

  var searchParams = {
    nameCoach: request.body.nameCoach,
    elo: request.body.elo,
    role: request.body.role,
    idChampion1: request.body.idChampion1,
    idChampion2: request.body.idChampion2,
    idChampion3: request.body.idChampion3,
    cost: request.body.cost,
    languages: request.body.languages,
  }

  Users.searchCoach(searchParams, response);
});

app.post('/getSchedule', function(request, response){

  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Content-Type", "application/json");

  var coach = request.body.user;

  Users.getReservations(coach, response);

});

app.post('/saveReservation', function(request, response){

  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Content-Type", "application/json");

  var student = request.body.student;
  var coach = { 
    name: request.body.coach,
    role1: request.body.role1,
    role2: request.body.role2,
    cost: request.body.cost
  }

  var schedule = {
    date: request.body.date,
    array: request.body.schedule,
    start: request.body.start,
    end: request.body.end
  }

  Users.reserve(schedule, coach, student, response);  
});

app.post('/getUserReservation', function(request, response){
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Content-Type", "application/json");

  var user = request.body.user;

  Users.getUserReservation(user, response);  
});

app.post('/deleteReservation', function(request, response){
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Content-Type", "application/json");

  var key = request.body.key;
  var coach = request.body.coach;
  var student = request.body.student;
  var schedule = {
    date: request.body.date,
    start: request.body.start,
    end: request.body.end
  }

  Users.deleteReservation(schedule, coach, student, key, response);  
});

app.post('/getCoachReservation', function(request, response){
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Content-Type", "application/json");

  var coach = request.body.user;

  Users.getCoachReservation(coach, response);
});

app.post('/getFavourites', function(request, response){
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Content-Type", "application/json");

  var user = request.body.user;

  Users.getFavourites(user, response);
})

app.post('/addFavourite', function(request, response){
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Content-Type", "application/json");

  var user = request.body.user;
  var coach = request.body.coach;

  Users.addFavourite(user, coach, response);

});

app.post('/removeFavourite', function(request, response){
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Content-Type", "application/json");

  var user = request.body.user;
  var coach = request.body.coach;

  Users.removeFavourite(user, coach, response);

});

app.post('/getRating', function(request, response){
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Content-Type", "application/json");

  var student = request.body.student;
  var coach = request.body.coach;

  Users.getRating(student, coach, response);
});

app.post('/saveRating', function(request, response){
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Content-Type", "application/json");

  var student = request.body.student;
  var coach = request.body.coach;
  var rate = request.body.rate;

  Users.getRating(student, coach, rate, response);
});

app.post('/refreshChampions', function(request, response){
   response.setHeader("Access-Control-Allow-Origin", "*");
   response.setHeader("Content-Type", "application/json");

   var user = {
    ign: request.body.ign
   }  

   Riot.refreshChampions(user, response);
});

app.listen(process.env.PORT || 5000);

