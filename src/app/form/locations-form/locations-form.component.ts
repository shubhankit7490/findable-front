import { Component, Input, Output, OnInit, EventEmitter, ViewChild } from '@angular/core';

// services:
import { DataService } from '../../rest/service/data.service';

// models:
import * as models from '../../rest/model/models';
import { SingleDictionary } from '../../rest/model/SingleDictionary';
import { setTimeout } from 'timers';

declare let google: any;
declare let jQuery: any;

@Component({
	selector: 'app-locations-form',
	templateUrl: './locations-form.component.html',
	styleUrls: ['./locations-form.component.css']
})
export class LocationsFormComponent implements OnInit {
	@ViewChild('interesetLocations') interesetLocations;
	@Input() selectedLocations: Array<models.Location>;
	@Output() onLocationsChange = new EventEmitter<models.Locations>();
	public searchTerm: string;
	public results: SingleDictionary;
	public requesting = false;
	public location: models.Location = {
		continent_id: null,
		continent_name: null,
		city_id: null,
		city_name: null,
		state_id: null,
		state_name: null,
		state_short_name: null,
		country_id: null,
		country_name: null,
		country_short_name_alpha_2: null,
		country_short_name_alpha_3: null
	};
	public autocomplete: google.maps.places.Autocomplete = null;

	constructor(public dataService: DataService) {
		this.dataService = dataService;
	}

	public onDelete(index) {
		this.selectedLocations.splice(index, 1);
		this.onLocationsChange.emit(this.selectedLocations);
	}

	ngOnInit() {
	}

	loadGmaps() {
		this.autocomplete = new google.maps.places.Autocomplete((document.getElementById('city')), {types: ['(cities)']});
		google.maps.event.addDomListener(document.getElementById('city'), 'keydown', function(event) {
			if (event.keyCode === 13) {
				event.preventDefault();
			}
		});
		this.autocomplete.addListener('place_changed', this.getAutoCompleteLocation.bind(this));
	}

	getAutoCompleteLocation() {
		let place = this.autocomplete.getPlace();
		if (!place.geometry) {
			return;
		}

		this.location = {
			continent_id: null,
			continent_name: null,
			city_id: null,
			city_name: null,
			state_id: null,
			state_name: null,
			state_short_name: null,
			country_id: null,
			country_name: null,
			country_short_name_alpha_2: null,
			country_short_name_alpha_3: null
		};

		for (let i = 0; i < place.address_components.length; i++) {
			let addressType = place.address_components[i].types[0];
			switch (addressType) {
				case 'country':
					this.location.country_name = place.address_components[i]['long_name'];
					this.location.country_short_name_alpha_2 = place.address_components[i]['short_name'];
					break;
				case 'locality':
					this.location.city_name = place.address_components[i]['long_name'];
					break;
				case 'postal_town':
					if (this.location.city_name === null) {
						this.location.city_name = place.address_components[i]['long_name'];
					}
					break;
				case 'administrative_area_level_1':
					this.location.state_name = place.address_components[i]['long_name'];
					this.location.state_short_name = place.address_components[i]['short_name'];
					break;
				case 'administrative_area_level_2':
					if (this.location.state_name === null) {
						this.location.state_name = place.address_components[i]['long_name'];
						this.location.state_short_name = place.address_components[i]['short_name'];
					}
					break;
			}
		}

		let parsedLocationName = this.parseLocation(this.location);
		if (!parsedLocationName.length) {
			this.location = {
				continent_id: null,
				continent_name: null,
				city_id: null,
				city_name: null,
				state_id: null,
				state_name: null,
				state_short_name: null,
				country_id: null,
				country_name: null,
				country_short_name_alpha_2: null,
				country_short_name_alpha_3: null
			};
			this.clearInput();
			return;
		}

		for (let item of this.selectedLocations){
			if (item.city_name === this.location.city_name) {
				this.location = {
					continent_id: null,
					continent_name: null,
					city_id: null,
					city_name: null,
					state_id: null,
					state_name: null,
					state_short_name: null,
					country_id: null,
					country_name: null,
					country_short_name_alpha_2: null,
					country_short_name_alpha_3: null
				};
				this.clearInput();
				return;
			}
		}

		this.selectedLocations.push(this.location);
		this.onLocationsChange.emit(this.selectedLocations);
		this.clearInput();
	}

	clearInput() {
		let _input = jQuery('#city');
		_input.blur();
		setTimeout(() => {
			_input.val('');
			setTimeout(() => {
				_input.blur();
			}, 10);
		}, 10);
	}

	parseLocation(location: models.Location): string {
		let locationPartsArray = [];
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
		return (locationPartsArray.length > 0) ? locationPartsArray.join(', ') : '';
	}
	
	/**
	 * The following is commented out as it is not used, for now.
	 */
	// search(event) {
	// 	if (!event.query.length) {
	// 		return;
	// 	}
	// 	console.log('event:', event);
	// 	this.requesting = true;
	// 	this.dataService.locations_get(event.query).subscribe(
	// 		(response: SingleDictionary) => {
	// 			this.results = response;
	// 			this.requesting = false;
	// 		}
	// 	);
	// }

	// onSelectAutoComplete(e) {
	// 	for (let item of this.selectedLocations){
	// 		if (item.city_id === e.city_id) {
	// 			this.searchTerm = '';
	// 			return;
	// 		}
	// 	}

	// 	this.selectedLocations.push(e);
	// 	this.onLocationsChange.emit(this.selectedLocations);
	// 	this.clearAutocomplete(e);
	// }

	// clearAutocomplete(event) {
	// 	setTimeout(() => {
	// 		this.searchTerm = '';
	// 		this.interesetLocations.el.nativeElement.querySelector('input').value = '';
	// 		this.interesetLocations.hide();
	// 	}, 200);
	// }

	
}
