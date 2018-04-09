var fetch = require('node-fetch');
var fs = require('fs');
var readline = require('readline');

const hooksData = class hooksData {
	async getWeatherInCity(city, country, date) {
		var res = await fetch("http://api.hooksdata.io/v1/fetch", {
		    method: 'post',
		    headers: {
		      "Content-type": "application/json"
		    },
		    body: JSON.stringify({"query": "SELECT * FROM WeatherByCity(country.name = \"" 
		    	+ country + "\" and name = \"" 
		    	+ city + "\") WHERE start_datetime.datetime like \"%" 
		    	+ date + "T%\""})
		  }).then((res) => res.json())
		return res;
  	}

	async getNextRainyDaysInCity(city, country) {
		var today = [];
		var rainDays = [];

		today[0] = new Date();
		for (let i = 1; i < 5; ++i) {
			today[i] = new Date(today[i-1].getTime() + 86400000);
		}

		for (let i = 1; i < 5; ++i) {
			let date = String(today[i].getFullYear()) + "-" 
			+ (today[i].getMonth() < 10 ? "0" + String(today[i].getMonth() + 1) : String(today[i].getMonth() + 1)) + "-" 
			+ (today[i].getDate() < 10 ? "0" + String(today[i].getDate()) : String(today[i].getDate()));

	
			var res = await fetch("http://api.hooksdata.io/v1/fetch", {
			    method: 'post',
			    headers: {
			      "Content-type": "application/json"
			    },
			    body: JSON.stringify({"query": "SELECT * FROM WeatherByCity(country.name = \"" 
			    	+ country + "\" and name = \"" 
			    	+ city + "\") WHERE start_datetime.datetime like \"%" 
			    	+ date + "T%\" AND weather_conditions.main = \"Rain\" AND weather_conditions.description != \"light rain\""})
			  }).then((res) => res.json())
	
			if (res.matches_count >= 6)
				rainDays.push(date);

		}
		return rainDays;
  	}

  	async getCountriesList(city, code, state) {
		var res = await fetch("http://api.hooksdata.io/v1/fetch", {
		    method: 'post',
		    headers: {
		      "Content-type": "application/json"
		    },
		    body: JSON.stringify({"query": "SELECT * FROM WeatherByCity(name = \"" 
		    	+ city + "\" and country.name = \"" 
		    	+ code + "\" and admin1_code = \"" 
		    	+ state + "\")"})
		  }).then((res) => res.json())

		console.log(res);
		return res;
  	}

  	async getNextSnowyDaysInCity(city, country) {
		var today = [];
		var snowDays = [];

		today[0] = new Date();
		for (let i = 1; i < 5; ++i) {
			today[i] = new Date(today[i-1].getTime() + 86400000);
		}

		for (let i = 1; i < 5; ++i) {
			let date = String(today[i].getFullYear()) + "-" 
			+ (today[i].getMonth() < 10 ? "0" + String(today[i].getMonth() + 1) : String(today[i].getMonth() + 1)) + "-" 
			+ (today[i].getDate() < 10 ? "0" + String(today[i].getDate()) : String(today[i].getDate()));

	
			var res = await fetch("http://api.hooksdata.io/v1/fetch", {
			    method: 'post',
			    headers: {
			      "Content-type": "application/json"
			    },
			    body: JSON.stringify({"query": "SELECT * FROM WeatherByCity(country.name = \"" 
			    	+ country + "\" and name = \"" 
			    	+ city + "\") WHERE start_datetime.datetime like \"%" 
			    	+ date + "T%\" AND weather_conditions.main = \"Snow\""})
			  }).then((res) => res.json())
	
			if (res.matches_count >= 6)
				snowDays.push(date);

		}

		return snowDays;

  	}

  	async parseLeagues() {

  		var lineInterface = readline.createInterface({
			input: fs.createReadStream("leagues.conf", 'utf8')
		});

		var lineno = 0;
		var tmp;
		
		var leagues = await new Promise(function (resolve) {
			var leagues = [];
			lineInterface.on('line', function (line) {
				var tmp = [line.substring(0, line.indexOf('|')), line.substring(line.indexOf('|') + 1, line.length)];
				leagues[lineno] = tmp;
				lineno++;
			});
			lineInterface.on('close', () => resolve(leagues));
		})

  		return leagues;
  	}

  	async leagueGetter(country) {
  		var league = [];

  		var leagues = await this.parseLeagues();

  		if (country == undefined)
  			return league;
  		leagues.forEach(function(e) {
  			if (e[1] == country) {
  				league.push(e[0]);
  			}
  		})
  		return league;
  	}

  	async getSoccerGames(country) {
  		var league = await this.leagueGetter(country);

  		if (league.length == 0)
  			return [];
		var query = "(";
 		league.forEach(function(e) {
 			query += "(competition = \""
 			query += e;
 			query += "\") OR ";
  		});
  		query = query.substring(0, query.length - 4);
  		query += ")";
		var res = await fetch("http://api.hooksdata.io/v1/fetch", {
		    method: 'post',
		    headers: {
		      "Content-type": "application/json"
		    },
		    body: JSON.stringify({"query": "SELECT * FROM SoccerGames WHERE (status = \"FUTURE\") AND " + query})
		  }).then((res) => res.json())
		var games = [];

		if (res.matches_count > 0) {
			res.items.forEach(function(e) {
				games.push(e.start_datetime.datetime.substring(0, e.start_datetime.datetime.indexOf('T')) + " == " + e.home_team.team_name + " -VS- " + e.away_team.team_name);
			})
		}

		return games;
  	}

  	async getNFLGames(city, country, state) {
		var res = await fetch("http://api.hooksdata.io/v1/fetch", {
		    method: 'post',
		    headers: {
		      "Content-type": "application/json"
		    },
		    body: JSON.stringify({"query": "SELECT * FROM SoccerGames"})
		  }).then((res) => res.json())

		var games = [];

		if (res.matches_count > 0) {
			res.items.forEach(function(e) {
				if (!games.includes(e.competition))
					games.push(e.competition);
			})
		}

		games.sort();
		return games;
  	}

  	async getNHLGames(city, country, state) {
		var res = await fetch("http://api.hooksdata.io/v1/fetch", {
		    method: 'post',
		    headers: {
		      "Content-type": "application/json"
		    },
		    body: JSON.stringify({"query": "SELECT * FROM NHLGames WHERE status = \"FUTURE\""})
		  }).then((res) => res.json())

		return res;
  	}

  	async getNBAGames(city, country, state) {
		var res = await fetch("http://api.hooksdata.io/v1/fetch", {
		    method: 'post',
		    headers: {
		      "Content-type": "application/json"
		    },
		    body: JSON.stringify({"query": "SELECT * FROM NBAGames WHERE status = \"FUTURE\""})
		  }).then((res) => res.json())

		return res;
  	}

  	async getMLBGames(city, country, state) {
		var res = await fetch("http://api.hooksdata.io/v1/fetch", {
		    method: 'post',
		    headers: {
		      "Content-type": "application/json"
		    },
		    body: JSON.stringify({"query": "SELECT * FROM SoccerGames WHERE status = \"FINAL\""})
		  }).then((res) => res.json())

		return res;
  	}


}

module.exports = hooksData;



