const express = require('express');
var router = express.Router();

const Riot = require('../riot/riot');
const Coaches = require('../DAO/Coaches');

router.use(express.json());

//searchCoach
router.get('/', (req, res) => {
    var searchParams = req.body;
    Coaches.searchCoach(params)
    .then(result => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(result);
    });
});


//upgrade to coach
router.post('/', (req, res) => {
    
});

//update coach info
router.put('/', (req, res) => {
    var coach = req.body;
    Coaches.updateInfo(coach)
    .then(result => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(result);
    });
});

//refresh most played champions
router.post('/refreshChampions', (req, res) => {
    var user = req.body.ign;
    Riot.refreshChampions(user) 
    .then(result_user => {
        Coaches.refreshChampions(result_user)
        .then(result => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(result);
        }); 
    });
});
