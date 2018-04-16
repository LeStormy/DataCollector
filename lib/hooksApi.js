var fetch = require('node-fetch');
var fs = require('fs');
var readline = require('readline');

const hooksData = class hooksData {
	async getWeatherInCityByDate(city, country, date) {
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

		var weather = [];
		if (res.matches_count > 0) {
			res.items.forEach(function(e) {
				weather.push([e.start_datetime.timestamp, e.weather_conditions[0].main]);
			})
		}

		var data = JSON.stringify({
			items: weather.map((item) => (
				{ time: item[0], weather: item[1] }
			))
		});
		return data;
	}

	async getWeatherInCityNow(city, country) {
		var tmp = new Date();
		var date = String(tmp.getFullYear()) + "-"
		+ (tmp.getMonth() < 10 ? "0" + String(tmp.getMonth() + 1) : String(tmp.getMonth() + 1)) + "-"
		+ (tmp.getDate() < 10 ? "0" + String(tmp.getDate()) : String(tmp.getDate())) + "T"
		+ (tmp.getHours() < 10 ? "0" + String(tmp.getHours()) : String(tmp.getHours()));
		var res = await fetch("http://api.hooksdata.io/v1/fetch", {
			method: 'post',
			headers: {
				"Content-type": "application/json"
			},
			body: JSON.stringify({"query": "SELECT * FROM WeatherByCity(country.name = \""
			+ country + "\" and name = \""
			+ city + "\") WHERE start_datetime.datetime like \"%"
			+ date + "%\""})
		}).then((res) => res.json())

		return res.items[0].weather_conditions[0].main;
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
				+ date + "T%\" AND weather_conditions.main = \"Rain\""})
			}).then((res) => res.json())

			if (res.matches_count >= 8)
			rainDays.push(date);

		}
		return rainDays;
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

		var lineno = 0;

		var leagues = [];
		leaguesList.forEach(function(e) {
			var tmp = [e.substring(0, e.indexOf('|')), e.substring(e.indexOf('|') + 1, e.length)];
			leagues[lineno] = tmp;
			lineno++;
		});

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

	async getSoccerGames(country, date) {
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
			body: JSON.stringify({"query": "SELECT * FROM SoccerGames WHERE (status = \"FUTURE\") AND start_datetime.datetime like \"%"
			+ date + "T%\" AND " + query})
		}).then((res) => res.json())
		var games = [];

		if (res.matches_count > 0) {
			res.items.forEach(function(e) {
					games.push([e.start_datetime.timestamp, e.home_team.team_name, e.away_team.team_name]);
				})
			}

			var data = JSON.stringify({
				items: games.map((item) => (
					{ datetime: item[0], country: country, home_team: item[1], away_team: item[2] }
				))
			});
			return data;
		}

	}

	module.exports = hooksData;


	var leaguesList = [
		"Ascenso MX|Mexico",
		"Australian A-League|Australia",
		"Austrian Bundesliga|Austria",
		"Belgian Jupiler League|Belgium",
		"Brazilian Campeonato Carioca|Brazil",
		"Brazilian Campeonato Gaucho|Brazil",
		"Brazilian Campeonato Paulista|Brazil",
		"Chinese Super League|China",
		"Copa Libertadores|South America",
		"Copa Sudamericana|South America",
		"Danish SAS-Ligaen|Denmark",
		"Dutch Eerste Divisie|Netherlands",
		"Dutch Eredivisie|Netherlands",
		"EFL Trophy|England",
		"EFL Trophy|United Kingdom",
		"English League Championship|United Kingdom",
		"English League One|United Kingdom",
		"English League Two|United Kingdom",
		"English National League|England",
		"English National League|United Kingdom",
		"English Premier League|United Kingdom",
		"French Ligue 1|France",
		"French Ligue 2|France",
		"German 2. Bundesliga|Germany",
		"German Bundesliga|Germany",
		"Indonesian Super League|Indonesia",
		"Italian Serie A|Italy",
		"Italian Serie B|Italy",
		"Japanese J League|Japan",
		"League of Ireland Premier Division|Ireland",
		"Liga Bancomer|Mexico",
		"Liga Nacional de Guatemala|Guatemala",
		"Liga Profesional Boliviana|Bolivia",
		"Liga Águila|Colombia",
		"Major League Soccer|North America",
		"Major League Soccer|United States",
		"Major League Soccer|Canada",
		"Nacional B de Argentina|Argentina",
		"Nigeria Professional League|Nigeria",
		"Northern Irish Premiership|Northern Ireland",
		"Norwegian Eliteserien|Norway",
		"Portuguese Liga|Portugal",
		"Primera A de Ecuador|Ecuador",
		"Primera B Colombia|Colombia",
		"Primera División A de Argentina|Argentina",
		"Primera División B de Argentina|Argentina",
		"Primera División C de Argentina|Argentina",
		"Primera División D de Argentina|Argentina",
		"Primera División de Chile|Chile",
		"Primera División de Costa Rica|Costa Rica",
		"Primera División de El Salvador|El Salvador",
		"Primera División de Honduras|Honduras",
		"Primera División de Paraguay|Paraguay",
		"Primera División de Uruguay|Uruguay",
		"Primera División de Venezuela|Venezuela",
		"Primera Profesional de Perú|Peru",
		"Russian Premier League|Russia",
		"Scottish Championship|Scotland",
		"Scottish League One|Scotland",
		"Scottish League Two|Scotland",
		"Scottish Premiership|Scotland",
		"Singapore S-League|Singapore",
		"South African National First Division|South Africa",
		"South African Premiership|South Africa",
		"Spanish Primera División|Spain",
		"Spanish Segunda División|Spain",
		"Superliga Argentina|Argentina",
		"Swedish Allsvenskanliga|Sweden",
		"Swiss Super League|Switzerland",
		"Turkish Super Lig|Turkey",
		"UEFA Europa League|Europe",
		"Welsh Premier League|Wales"
	]
