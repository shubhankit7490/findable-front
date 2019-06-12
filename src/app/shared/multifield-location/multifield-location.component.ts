import { Component, OnInit, OnChanges, Output, EventEmitter, ViewChild, Input, SimpleChanges } from '@angular/core';

// services:
import { DataService } from '../../rest/service/data.service';
import { AuthService } from '../../rest/service/auth.service';

// models
import * as models from '../../rest/model/models';

@Component({
	selector: 'app-multifield-location',
	templateUrl: './multifield-location.component.html',
	styleUrls: ['./multifield-location.component.css']
})
export class MultifieldLocationComponent implements OnInit, OnChanges {
	@Input('label') label = 'Location';
	@Input('required') required = true;
	@Input('disabled') disabled = false;
	@ViewChild('locationCity') locationCity;
	@ViewChild('locationCountry') locationCountry;
	@Output() onSelect = new EventEmitter();
	@Output() onChange = new EventEmitter();
	@Input() location: models.Location = {
		continent_id: null,
		continent_name: null,
		city_id: null,
		city_name: null,
		state_id: null,
		state_name: null,
		country_id: null,
		country_name: null,
		country_short_name_alpha_3: null,
		country_short_name_alpha_2: null,
	};
	public searchTermCity: string;
	public searchTermCountry: string;

	public resultsCities: models.DictionaryItem[];
	public resultsCountries: models.DictionaryItem[];
	public country: models.Country = {
		id: null,
		name: null,
		short_name_alpha_2: null,
		short_name_alpha_3: null
	};

	public state: models.State = {
		id: null,
		name: null
	};

	requestingCities: boolean = false;
	requestingCountries: boolean = false;

	public countries: models.Countries = [];
	public states: models.States = [];

	public formErrors: FormErrors = {
		location: { error: '', name: 'Location' }
	};

	public labelClass = '';

	constructor(public dataService: DataService, public authService: AuthService) {	}

	ngOnChanges(changes: SimpleChanges) {
		if ('location' in changes) {
			this.location = changes['location'].currentValue;
			this.parseInputModel();
		}
	}

	ngOnInit() {

		this.labelClass = this.required ? 'fnd-req' : '';
		this.getCountries();
		this.parseInputModel();
	}

	searchCity(event) {
		if (!event.query.length) {
			return;
		}

		this.requestingCities = true;
		this.dataService.locations_get(event.query, this.state.id, this.country.id).subscribe(
			response => {
				this.resultsCities = response;
				this.requestingCities = false;
			}
		);
	}

	onSelectAutoCompleteCity(e) {
		delete e.name;
		this.location = e;
		this.searchTermCity = this.locationCity.el.nativeElement.value = this.location.city_name;

		if (this.location.state_id !== null) {
			this.state = {
				id: this.location.state_id,
				name: this.location.state_name
			};

			if (this.location.country_id !== this.country.id) {
				this.setCountry();
				this.setState();
			}
		} else {
			this.resetStates();
		}

		if (this.location.state_id === null) {
			if (this.location.country_id !== this.country.id) {
				this.setCountry();
			}
		}

		this.onSelect.emit(this.location);
	}

	onSelectAutoCompleteCountry(e) {
		if (e.id !== this.country.id) {
			this.resetLocation();
		};

		this.country = e;
		this.searchTermCountry = this.locationCountry.el.nativeElement.value = e.name;
		this.setState();
	}

	clearAutocompleteCity() {
		setTimeout(function(){
			this.locationCity.hide();
		}.bind(this), 200);
	}

	clearAutocompleteCountry() {
		setTimeout(function(){
			this.locationCountry.hide();
		}.bind(this), 200);
	}

	searchCountry(event) {
		this.resetState();

		if (!event.query.length) {
			this.resetCountry();
			this.resetStates();
			this.resetLocation();
			return;
		}

		this.resultsCountries = [];
		for (let i = 0; i < this.countries.length; i++) {
			if (this.countries[i].name.toLocaleLowerCase().indexOf(event.query.toLowerCase()) > -1) {
				this.resultsCountries.push(this.countries[i]);
			}
		}
	}

	getCountries() {
		this.dataService.countries_get().subscribe(
			response => {
				this.countries = response;
			}
		);
	}

	selectState(e) {
		for (let i = 0; i < this.states.length; i++) {
			if (Number.parseInt(this.states[i].id.toString()) === Number.parseInt(e)) {
				this.state = this.states[i];
				break;
			}
		}
	}

	onChangeCity() {
		this.onChange.emit({
			input: 'city',
			value: this.locationCity.el.nativeElement.querySelector('input').value
		});
	}

	onChangeCountry() {
		this.onChange.emit({
			input: 'country',
			value: this.locationCountry.el.nativeElement.querySelector('input').value
		});
	}

	private setCountry() {
		this.searchTermCountry = this.location.country_name;

		this.country = {
			id: this.location.country_id,
			name: this.location.country_name,
			short_name_alpha_2: this.location.country_short_name_alpha_2,
			short_name_alpha_3: this.location.country_short_name_alpha_3
		};
	}

	private setState(set: Boolean = false) {
		this.resetStates();
		this.dataService.states_get(this.country.id).subscribe(
			response => {
				this.states = response;
				if (set) {
					this.selectState(this.state.id);
				}
			}
		);
	}

	private resetStates() {
		this.states = [];
	}

	private resetState() {
		this.state = {
			id: null,
			name: null
		};
	}

	private resetCountry() {
		this.searchTermCountry = '';
		this.country = {
			id: null,
			name: null,
			short_name_alpha_2: null,
			short_name_alpha_3: null
		};
	}

	private resetLocation() {
		this.searchTermCity = '';
		this.location = {
			continent_id: null,
			continent_name: null,
			city_id: null,
			city_name: null,
			state_id: null,
			state_name: null,
			country_id: null,
			country_name: null,
			country_short_name_alpha_3: null,
			country_short_name_alpha_2: null
		};
	}

	public parseInputModel() {
		if (this.location.city_id !== null) {
			this.country = {
				id: this.location.country_id,
				name: this.location.country_name,
				short_name_alpha_2: this.location.country_short_name_alpha_2,
				short_name_alpha_3: this.location.country_short_name_alpha_3
			};

			this.state = {
				id: this.location.state_id,
				name: this.location.state_name
			};

			this.searchTermCountry = this.location.country_name;
			this.searchTermCity = this.location.city_name;

			this.setState(true);
		}
	}
}

interface FormErrors {
	location: FormErrorItem;
}

interface FormErrorItem {
	error: string;
	name: string;
}