const express = require('express');
var router = express.Router();

const Riot = require('../riot/riot');
const Users = require('../DAO/Users');

router.use(express.json());

router.all('/', (req, res) => {
    res.statusCode = 403;
    res.setHeader('Content-Type', 'text/plain');
    res.send('Route not supported');
})

router.post('/register', (req, res) => {
    var user = req.body;
    if (user.ign && user.password){
        if (!user.isCoach){
            user.isCoach = false;
        }
        

        Riot.checkSummoner(user)
        .then(check => {
            if (check){
                Users.register(user)
                .then(result => {
                    res.statusCode = 200;
                    res.setHeader('Content-Type', 'application/json');
                    res.json(result);
                });
            }
            else{
                res.statusCode = 200;
                res.setHeader('Content-Type', 'application/json');
                res.json({code: 13});
            }  
        });
    }
    else{
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.json({code: 400, error: "Wrong params in request"});
    }
    
});

router.post('/login', (req, res) => {
    var user = req.body;
    if (user.ign && user.password){
        Users.login(user)
        .then(result => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(result);
        })
    }
    else{
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.json({code: 400, error: "Wrong params in request"});
    }
});

router.post('/token', (req, res) => {
    var ign = request.body.ign;  
    var token = request.body.token;
  
    Users.saveToken(ign, token)
    .then(result => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(result);
    });
});

module.exports = router;