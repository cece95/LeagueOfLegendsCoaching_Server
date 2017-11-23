var exports = module.exports = {};

exports.sortDictionaryByValue = function(dict, limit){
	var items = Object.keys(dict).map(function(key) {
    return [key, dict[key]];
	});

	// Sort the array based on the second element
	items.sort(function(first, second) {
    	return second[1] - first[1];	
	});

	// Create a new array with only the first 5 items
	tempList = items.slice(0, limit);
	result = [];
	tempList.forEach(function(item){
		var champ = {
			id: item[0],
			n_games: item[1] 
		}
		result.push(champ);
	});
	return result;
}

exports.getLanguages = function(languages){
  s1 = languages.replace('[', '');
  s2 = s1.replace(']', '');
  temp = s2.split(", ");

  return temp;
}

exports.sortResults = function(items, limit){
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