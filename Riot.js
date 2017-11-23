//require Users and functions
var Users = require("./Users.js");
var functions = require("./Functions.js")

//require ids
var ids = require('./id.json');

var requestify = require('requestify'); 

var server = 'euw1';
var key = 'RGAPI-455222f8-717b-4063-9230-76018a90c65a';
var base_url = "https://euw1.api.riotgames.com/lol/";

var exports = module.exports = {};

exports.checkSummoner = function(user, res, callback){
	console.log("checkSummoner");
	var summoner = String(user.ign);
	console.log("user: "+ user.ign);
	var url = base_url+"summoner/v3/summoners/by-name/"+summoner+"?api_key="+key;
	console.log("url: "+url);
	requestify.get(url).then(function(response){
		var code = response.getCode();
		console.log("code: "+code);
		if (code == "200"){
			console.log("ok");
			var ok = true;
			var body = response.getBody();
			var accountId = body['accountId'];
			console.log('accountId: '+accountId);
			
			if(user.isCoach){
				mostplayedChamps(accountId, user, res, ok, lastStep, callback);

			}
			else{
				callback(user, res, ok, lastStep);	
			}
		}
		else{
			var ok = false;
			console.log("sto per chiamare callback");
			console.log(user);
			callback(user, res, ok, lastStep);
		}
	});
}

function mostplayedChamps(accountId, user, res, ok, lastStep, callback){
	var url = 'https://euw1.api.riotgames.com/lol/match/v3/matchlists/by-account/'+accountId+'?season=9&api_key='+key;
	console.log('url: '+ url);
	var champions = {};
	ids.forEach(function(id){
		champions[id] = 0
	});
	// ok
	requestify.get(url).then(function(response){
		console.log("matches request");
		var page = response.getBody()
		var matches = page['matches'];

		matches.forEach(function(obj) {
			var champ = JSON.stringify(obj.champion);
			var gameId = JSON.stringify(obj.gameId);
			champions[champ]++;
		});

		result = functions.sortDictionaryByValue(champions, 5);
		console.log('result: '+result)
		user.champions = result;
		callback(user, res, ok, lastStep);
	});
}

exports.refreshChampions = function(user, response){
	var summoner = String(user.ign);
	var url = base_url+"summoner/v3/summoners/by-name/"+summoner+"?api_key="+key;
	requestify.get(url).then(function(response){
		var code = response.getCode();
		if (code == "200"){
			var body = response.getBody();
			var accountId = body['accountId'];
			
			var url = 'https://euw1.api.riotgames.com/lol/match/v3/matchlists/by-account/'+accountId+'?season=9&api_key='+key;
			var champions = {};
			ids.forEach(function(id){
				champions[id] = 0
			});
			
			requestify.get(url).then(function(res){
				var page = res.getBody()
				var matches = page['matches'];

				matches.forEach(function(obj) {
					var champ = JSON.stringify(obj.champion);
					var gameId = JSON.stringify(obj.gameId);
					champions[champ]++;
				});

				result = functions.sortDictionaryByValue(champions, 5);
				user.champions = result;

				Users.updateChamps(user, response);
			});
		}
	});
}