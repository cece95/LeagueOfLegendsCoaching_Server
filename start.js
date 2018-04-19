//express
var express = require('express');
var app = express();

//body parser
app.use(express.json());

//require Users
var Users = require("./Users.js");
var UserRouter = require('./routes/userRouter');
var CoachRouter = require('./routes/coachRouter');
var ReservationRouter = require('./routes/reservationRouter')

app.use('/users', UserRouter);
app.use('/coaches', CoachRouter);
app.use('/reservations', ReservationRouter);

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

