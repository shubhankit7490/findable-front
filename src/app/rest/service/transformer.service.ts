import {Injectable} from '@angular/core';
import * as models from '../model/models';
import * as extModels from './extended-models/extended-models';

declare let moment: any;

@Injectable()
/**
 * TransformerService is a collection of map functions called on Observable objects
 * when data arrives from the server.
 * Each function transforms a specific model, preparing it's data for display.
 */
export class TransformerService {

	constructor() {
	}

	/**
	 * Transform UserPreferences model.
	 * Adding "available" property with custom availability value.
	 * @param value - UserPreferencesExt model
	 * @param index
	 * @returns {any}
	 */
	public static transformPreferences(value, index) {
		if (value.current_status === 'not looking') {
			value.available = 'Not available';
		} else {
			switch (value.available_from) {
				case 'immediately':
					value.available = 'Immediately';
					break;
				case 'from':
					let days = moment.duration(
						moment(value.start_time).diff(moment(), 'days')
					);
					if (days < 2) {
						value.available = 'Immediately';
					} else {
						value.available = 'In ' + days + ' days';
					}
					break;
				case 'one week':
					value.available = 'One week notice';
					break;
				case 'two weeks':
					value.available = 'Two weeks notice';
					break;
				case 'one month':
					value.available = 'One month notice';
					break;
			}
		}

		// Format start time for display
		value.start_time = moment(value.start_time).format();

		// Format salary period
		if (value.desired_salary_period === 'M') {
			value.desired_salary_period_readable = 'monthly';
		} else if (value.desired_salary_period === 'Y') {
			value.desired_salary_period_readable = 'annually';
		} else if (value.desired_salary_period === 'H') {
			value.desired_salary_period_readable = 'hourly';
		}

		// Desired salary
		if (!!value.desired_salary) {
			value.desired_salary = value.desired_salary.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,');
		}

		return value;
	}

	public static transformPreferencesPut(preferences) {
		preferences.start_time = moment(preferences.start_time).format('YYYY-MM-DD HH:mm:ss');
		// Remove extended properties before sending to server
		delete preferences.available;
		delete preferences.desired_salary_period_readable;
		return preferences;
	}

	public static transformLocations(locations: extModels.LocationsExt) {
		let readableLocations: extModels.LocationsExt = [];
		let locationPartsArray = [];
		locations.forEach(function(location){
			if (!!location.city_name && !!location.state_name && !!location.country_name) {
				// Show a city
				locationPartsArray = [
					location.city_name,
					location.state_short_name,
					location.country_short_name_alpha_2
				];
			} else if (!location.city_name && !!location.state_name && !!location.country_name) {
				// Show a state
				locationPartsArray = [
					location.state_name,
					location.country_short_name_alpha_2
				];
			} else if (!location.city_name && !location.state_name && !!location.country_name) {
				// Show a country
				locationPartsArray = [
					location.country_name
				];
			}
			location.name = locationPartsArray.join(', ');
			readableLocations.push(location);
		});
		return readableLocations;
	}

	public static transformLocation(location: models.Location) {
		let readableLocations: extModels.LocationExt = {
			name: null,
			continent_id: null,
			continent_name: null,
			city_id: null,
			city_name: null,
			state_id: null,
			state_short_name: null,
			state_name: null,
			country_id: null,
			country_name: null,
			country_short_name_alpha_2: null,
			country_short_name_alpha_3: null
		};
		for (let prop in location) {
			if (location.hasOwnProperty(prop)) {
				readableLocations[prop] = location[prop];
			}
		}

		let locationPartsArray = [
			location.state_short_name
				? location.city_name + ','
				: location.city_name,
			location.state_short_name
				? location.state_short_name + ','
				: null,
			location.country_name
		];
		
		readableLocations.name = locationPartsArray.join(' ');
		return readableLocations;
	}

	public static transformLanguages(languages: extModels.LanguagesExt) {
		let langsFlags = {
			'Amharic': 'et',
			'Arabic': 'eg',
			'Azerbaijani': 'az',
			'Belarusian': 'by',
			'Bengali': 'bd',
			'Bulgarian': 'bg',
			'Burmese': 'mm',
			'Chinese': 'cn',
			'Croatian': 'hr',
			'Czech': 'cz',
			'Dutch': 'nl',
			'English': 'us',
			'French': 'fr',
			'German': 'de',
			'Greek': 'gr',
			'Gujarati': 'in',
			'Haitian': 'ht',
			'Hebrew': 'il',
			'Hindi': 'in',
			'Hungarian': 'hu',
			'Indonesian': 'id',
			'Italian': 'it',
			'Japanese': 'jp',
			'Javanese': 'id',
			'Korean': 'kr',
			'mandarin': 'cn',
			'Nepali': 'np',
			'Panjabi': 'pk',
			'Pashto': 'af',
			'Persian': 'ir',
			'Polish': 'pl',
			'Portuguese': 'pt',
			'Romanian': 'ro',
			'Russian': 'ru',
			'Somali': 'so',
			'Spanish': 'es',
			'Sundanese': 'sd',
			'Swedish': 'se',
			'Tamil': 'lk',
			'Tatar': 'ru',
			'Thai': 'th',
			'Turkish': 'tr',
			'Ukrainian': 'ua',
			'Urdu': 'pk',
			'Uzbek': 'uz',
			'Vietnamese': 'vn',
			'Wu': 'cn',
			'Telugu': 'in',
			'Marathi': 'in',
			'Yue': 'cn',
			'Jin': 'cn'
		};
		languages.forEach(function(language){
			language.flag = langsFlags[language.name];
		});
		return languages;
	}

	public static transformTraits(traits: extModels.TraitsExt) {
		traits.forEach(function(trait) {
			trait.icon = TransformerService.convertToClassName(trait.name);
		});
		return traits;
	}

	private static convertToClassName(traitName) {
		traitName = traitName.toLowerCase();
		traitName = traitName.replace(' ', '-');
		return 'trait-' + traitName;
	}

}
