//require Users and functions
var functions = require("../Functions.js")

//require ids
const ids = require('./id');
const config = require('./config');
const axios = require('axios')
const deferred = require('deferred');

exports.checkSummoner = (user) => {
	var deferred_check = deferred();
	var summoner = user ? String(user.ign): "";
    var url = config.base_url+"summoner/v3/summoners/by-name/"+summoner+"?api_key="+config.key;
	console.log("url: ", url);
	axios.get(url).then(function(response){
		var code = response.getCode();
		if (code == "200"){
			var body = response.getBody();
			var accountId = body['accountId'];
			console.log('code 200');
			
			if(user.isCoach){
				mostplayedChamps(accountId, user).then( (res) => {deferred_check.resolve(res)});

			}
			else{
				deferred_check.resolve(user);	
			}
		}
		else{
			deferred_check.resolve(false);	
		}
	})
	.catch((err) => {
		res.end(err);
	})

	return deferred_check.promise;
};

exports.refreshChampions = (user) => {
	var deferred_refresh = deferred();
	var summoner = String(user);
	var url = base_url+"summoner/v3/summoners/by-name/"+summoner+"?api_key="+key;
	axios.get(url).then(response => {
		var code = response.getCode();
		if (code == "200"){
			var body = response.getBody();
			var accountId = body['accountId'];
			
			var url = 'https://euw1.api.riotgames.com/lol/match/v3/matchlists/by-account/'+accountId+'?season=9&api_key='+key;
			var champions = {};
			ids.forEach(id => {
				champions[id] = 0
			});
			
			axios.get(url).then(res => {
				var page = res.getBody()
				var matches = page['matches'];

				matches.forEach(function(obj) {
					var champ = JSON.stringify(obj.champion);
					var gameId = JSON.stringify(obj.gameId);
					champions[champ]++;
				});

				result = functions.sortDictionaryByValue(champions, 5);
				user.champions = result;

				deferred_refresh.resolve(user);
			});
		}
	});
	return deferred_refresh.promise;
};

const mostplayedChamps = (accountId, user) => {
	var deferred_champs = deferred();
	
	var url = 'https://euw1.api.riotgames.com/lol/match/v3/matchlists/by-account/'+accountId+'?season=9&api_key='+config.key;
	var champions = {};
	ids.forEach(function(id){
		champions[id] = 0
	});
    axios.get(url)
    .then((response) => {
		console.log("matches request");
		var page = response.getBody()
		var matches = page['matches'];

		matches.forEach((obj) => {
			var champ = JSON.stringify(obj.champion);
			var gameId = JSON.stringify(obj.gameId);
			champions[champ]++;
		});

		result = functions.sortDictionaryByValue(champions, 5);
		user.champions = result;
		deferred_champs.resolve(user);
	})
	return deferred_champs.promise;
};