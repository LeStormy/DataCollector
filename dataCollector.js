#!/usr/bin/env node

const DataCollector = require('./lib/hooksApi');

const parseArgs = require('minimist');
const arguments = parseArgs(process.argv);

(async() => {
	const collector = new DataCollector();

	let res;
	switch (arguments.a) {
		case "WeatherToday":
			res = await collector.getWeatherInCity(arguments.c, arguments.d, arguments.e);
			break;
		case "NextRainyDays":
			res = await collector.getNextRainyDaysInCity(arguments.c, arguments.d);
			break;
		case "NextSnowyDays":
			res = await collector.getNextSnowyDaysInCity(arguments.c, arguments.d);
			break;
		case "Countries":
			res = await collector.getCountriesList(arguments.c, arguments.f, arguments.s);
			break;
		case "Soccer":
			res = await collector.getSoccerGames(arguments.d);
			break;
		case "MLB":
			res = await collector.getMLBGames(arguments.c, arguments.f, arguments.s);
			break;
		case "NFL":
			res = await collector.getNFLGames(arguments.c, arguments.f, arguments.s);
			break;

	}

//		let leagues = [];
//		res.items.forEach(function(e) {
//			if (!leagues.includes(e.competition))
//				leagues.push(e.competition);
////			console.log(e);
////			console.log("\n\n====================================================\n\n");
//
//		});
//		leagues.sort();
//		console.log(leagues);
////		console.log(res.items[0].city.country.name);
		console.log(res);

})();