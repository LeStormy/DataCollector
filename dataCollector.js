#!/usr/bin/env node

const DataCollector = require('./lib/hooksApi');

const parseArgs = require('minimist');
const arguments = parseArgs(process.argv);
const readline = require('readline');

(async() => {
	const collector = new DataCollector();

	let res;

	switch (arguments.a) {
		case "WeatherOnDay":
			res = await collector.getWeatherInCityByDate(arguments.c, arguments.d, arguments.e);
			break;
		case "WeatherNow":
			res = await collector.getWeatherInCityNow(arguments.c, arguments.d);
			break;
		case "NextRainyDays":
			res = await collector.getNextRainyDaysInCity(arguments.c, arguments.d);
			break;
		case "NextSnowyDays":
			res = await collector.getNextSnowyDaysInCity(arguments.c, arguments.d);
			break;
		case "Soccer":
			res = await collector.getSoccerGames(arguments.d);
			break;

	}

	console.log(res);

})();