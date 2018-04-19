const express = require('express');
var router = express.Router();

const Reservations = require('../DAO/Reservations');

router.use(express.json());

//get schedule
router.post('/getCoachSchedule', (req, res) => {
    var coach = req.body.user;
    Reservations.getCoachSchedule(coach)
    .then(result => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(result);
    });
});

//getUserSchedule


//save reservations
router.post('/', (req, res) => {
    var student = req.body.student;
    var coach = req.body.schedule;
    var reservation = req.body.reservation;

    Reservations.reserve(reservation, coach, student)
    .then(result => {
        if (result.id){
            Reservations.createReserveNotifications(result.id, student)
            .then(result => {
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json(result);
            });
        }
        else{
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(result);
        }
    })
});
