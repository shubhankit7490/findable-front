import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';

// services:
import { DataService } from '../../rest/service/data.service';
import { AuthService } from '../../rest/service/auth.service';
import { AnalyticsService } from '../../services/analytics.service';

// models:
import { PersonalDetails } from '../../rest/model/PersonalDetails';
import { Location } from '../../rest/model/Location';
import { SingleDictionary } from '../../rest/model/SingleDictionary';

import { environment } from 'environments/environment';

// declare let moment: any;
declare let orientation, rotation;
declare let google: any;

@Component({
	selector: 'app-personal-details',
	templateUrl: './personal-details.component.html',
	styleUrls: ['./personal-details.component.css']
})
export class PersonalDetailsComponent implements OnInit {
	@Input('mode') mode = 'create';
	@Output() onComplete = new EventEmitter();
	@ViewChild('profileImage') profileImage;

	public parsedLocation = '';
	public locationData = [];
	public userBirthday: any;
	public datepickerShown: boolean = false;
	public hasBaseDropZoneOver: boolean = false;
	public hasAnotherDropZoneOver: boolean = false;
	public detailsForm: FormGroup;
	private userLocation: Location;
	public userDetails: PersonalDetails = {};
	public profileImagePath: any = '';
	private profileImagePathDefault: any = '';
	public submitting: boolean = false;
	public uploader: any;
	msgs: any[] = [];
	uploadedFiles: File[] = [];
	apiKey = '';
	public formErrors: FormErrors = {
		firstname: { error: '', name: 'First Name' },
		lastname:  { error: '', name: 'Last Name' },
		phone:     { error: '', name: 'Phone' },
		city:      { error: '', name: 'Location' },
		birthday:  { error: '', name: 'Birthday' },
		gender:    { error: '', name: 'Gender' },
		email:     { error: '', name: 'Email' },
		website:   { error: '', name: 'Website' },
		skype:     { error: '', name: 'Skype' }
	};
	public globalSuccess: string;
	public globalError: string;
	public UPLOAD_PATH: string = environment.baseApiPath + '/users/images';
	public searchTerm = '';
	public results: SingleDictionary;
	public requesting: boolean = false;

	// Places API
	public autocomplete: google.maps.places.Autocomplete = null;

	constructor(public dataService: DataService, public authService: AuthService, public formBuilder: FormBuilder, public analyticsService: AnalyticsService) {
		this.apiKey = this.authService.currentUser.key;
		this.globalSuccess = '';
		this.globalError = '';

		this.detailsForm = this.formBuilder.group({
			firstname: ['', Validators.required],
			lastname:  ['', Validators.required],
			phone:     ['', Validators.required],
			city:      ['', Validators.required],
			skype:     [''],
			website:   [''],
			birthday:  [''],
			gender:    [''],
			email:     ['', [Validators.required, Validators.pattern('.+\@.+\.+[a-zA-Z0-9]')]]
		});
	}

	ngOnInit() {
		this.getDetails();

		this.analyticsService.emitPageview('Personal Details');
	}

	loadGmaps() {
		setTimeout(() => {
			this.autocomplete = new google.maps.places.Autocomplete((document.getElementById('city')), {types: ['(cities)']});
			google.maps.event.addDomListener(document.getElementById('city'), 'keydown', function(event) {
				if (event.keyCode === 13) {
					event.preventDefault();
				}
			});
			this.autocomplete.addListener('place_changed', this.getAutoCompleteLocation.bind(this));
		}, 20);
	}

	getAutoCompleteLocation() {
		let place = this.autocomplete.getPlace();
		if (!place.geometry) {
			return;
		}

		this.userLocation = {
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
					this.userLocation.country_name = place.address_components[i]['long_name'];
					this.userLocation.country_short_name_alpha_2 = place.address_components[i]['short_name'];
					break;
				case 'locality':
					this.userLocation.city_name = place.address_components[i]['long_name'];
					break;
				case 'postal_town':
					if (this.userLocation.city_name === null) {
						this.userLocation.city_name = place.address_components[i]['long_name'];
					}
					break;
				case 'administrative_area_level_1':
					this.userLocation.state_name = place.address_components[i]['long_name'];
					this.userLocation.state_short_name = place.address_components[i]['short_name'];
					break;
				case 'administrative_area_level_2':
					if (this.userLocation.state_name === null) {
						this.userLocation.state_name = place.address_components[i]['long_name'];
						this.userLocation.state_short_name = place.address_components[i]['short_name'];
					}
					break;
			}
		}
	}

	setValues(): void {
		this.detailsForm.setValue({
			firstname: this.userDetails.firstname,
			lastname:  this.userDetails.lastname,
			phone:     this.userDetails.phone,
			city:      (this.userLocation.city_name) ? this.parseLocation(this.userLocation) : '',
			skype:     this.userDetails.skype,
			website:   this.userDetails.website,
			birthday:  this.userBirthday,
			gender:    this.userDetails.gender,
			email:     this.userDetails.email
		});
	}

	getDetails(): void {
		this.dataService.personal_details_get(this.authService.getUserId()).subscribe(
			response => {
				this.userDetails = response;
				this.userLocation = response.location;
				this.userBirthday = (!!response.birthday) ? response.birthday : moment().format('YYYY-MM-DD HH:mm:ss');
				this.profileImagePath = response.image.url || '../../../../assets/images/dashboard_profile_avatar.png';
				this.profileImagePathDefault = this.profileImagePath;

				this.setValues();
			},
			error => {
				console.log('there was an error');
			}
		);
	}

	validate(fieldName?: string, error?: string): any {
		let errors = 0;

		if (fieldName && error) {
			this.formErrors[fieldName].error = error;
		} else {
			let _field = '';
			for (let key in this.formErrors) {
				if (this.formErrors.hasOwnProperty(key)) {
					if (!!fieldName) {
						if (key !== fieldName) { continue; };
					}

					this.formErrors[key].error = '';
					_field = this.formErrors[key].name;

					if (fieldName === 'city' && !this.userLocation) {
						this.formErrors[key].error = `${_field} field is invalid`;
					} else if (!this.detailsForm.controls[key].valid) {
						if ('required' in this.detailsForm.controls[key].errors) {
							this.formErrors[key].error = `${_field} field is required`;
						}
						if ('pattern' in this.detailsForm.controls[key].errors && key === 'email') {
							this.formErrors[key].error = `Invalid email address`;
						}

						errors++;
					}
				}
			}

			return errors;
		}
	}

	parseLocation(location: Location): string {
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

	setYear(year) {
		if (!this.userBirthday) {
			this.userBirthday = moment().year(new Date(year).getFullYear()).format('YYYY-MM-DD hh:mm:ss');
		} else {
			this.userBirthday = moment(this.userBirthday).year(new Date(year).getFullYear()).format('YYYY-MM-DD hh:mm:ss');
		}
	}

	setMonth(month) {
		if (!this.userBirthday) {
			this.userBirthday = moment().month(new Date(month).getMonth()).format('YYYY-MM-DD hh:mm:ss');
		} else {
			this.userBirthday = moment(this.userBirthday).month(new Date(month).getMonth()).format('YYYY-MM-DD hh:mm:ss');
		}
	}

	setDay(day) {
		if (!this.userBirthday) {
			this.userBirthday = moment().date(new Date(day).getDate()).format('YYYY-MM-DD hh:mm:ss');
		} else {
			this.userBirthday = moment(this.userBirthday).date(new Date(day).getDate()).format('YYYY-MM-DD hh:mm:ss');
		}
	}

	onBeforeSend(event): void {
		event.xhr.setRequestHeader('X-API-KEY', this.apiKey);
	}

	onSelect(event, fileInput): void {
		this.uploader = fileInput;
		this.profileImagePath = '';

		orientation(this.uploader.files[0], (base64img, value) => {
			this.profileImage.nativeElement.src = base64img;
			let el = <HTMLElement>document.querySelector('.ui-fileupload-row img');

			if (value > 1) {
				this.profileImage.nativeElement.style.maxHeight = '160px';
				this.profileImage.nativeElement.style.transform = rotation[value];
				el.style.display = 'none';
			} else {
				this.profileImage.nativeElement.style.maxHeight = '210px';
				this.profileImage.nativeElement.style.transform = rotation[1];
				el.style.display = 'initial';
			}
		});
	}

	onUpload(event): void {
		let response = JSON.parse(event.xhr.response);
		let el = <HTMLElement>document.querySelector('.ui-fileupload-row img');
		el.style.display = 'none';
		this.sendForm(response.id);
		this.profileImage.nativeElement.style.maxHeight = '210px';
		this.profileImage.nativeElement.style.transform = rotation[1];
		el.style.display = 'initial';

		this.profileImagePath = this.profileImagePathDefault = response.path;
	}

	uploadError(event): void {
		console.log(event);
	}

	onSubmit(e): void {
		e.preventDefault();
		let validationErrors = this.validate();

		if (!this.userLocation) {
			this.formErrors['city'].error = 'Please select a location from the list';
			validationErrors++;
		}

		if (validationErrors) { return; };

		this.submitting = true;

		if (!this.uploader || !this.uploader.files) {
			this.sendForm();
		} else {
			this.uploader.upload();
		}
	}

	onClear(): void {
		this.profileImagePath = this.profileImagePathDefault = this.profileImagePathDefault;
	}

	sendForm(image_id: any = null): void {
		this.userDetails = {
			location: this.userLocation,
			birthday: this.userBirthday,
			email: this.detailsForm.value.email,
			firstname: this.detailsForm.value.firstname,
			lastname: this.detailsForm.value.lastname,
			gender: this.detailsForm.value.gender,
			phone: this.detailsForm.value.phone,
			skype: this.detailsForm.value.skype,
			website: this.detailsForm.value.website,
			image: image_id
		};

		this.userDetails.image = image_id;

		if (this.mode === 'create') {
			this.dataService.personal_details_put(this.authService.getUserId(), this.userDetails).subscribe(
				response => {
					this.analyticsService.emitEvent('Personal Details', 'Update', 'Desktop', this.authService.currentUser.user_id);
					if (response.status === true) {
						this.globalSuccess = '';
						this.submitting = false;
						let el = <HTMLElement>document.querySelector('.ui-fileupload-row img');
						if (el !== null) {
							el.style.display = 'none';
						}

						this.onComplete.emit(true);
					}
				},
				error => {
					let _error = JSON.parse(error._body);
					for (let i in _error.message) {
						if (_error.message.hasOwnProperty(i)) {
							this.validate(_error.message[i].field, _error.message[i].error);
						}
					}

					this.submitting = false;
				}
			);
		}
	}

	goto(step: number) {
		this.onComplete.emit(step);
	}

}

export interface FormErrors {
	firstname: FormError;
	lastname: FormError;
	phone: FormError;
	city: FormError;
	birthday: FormError;
	gender: FormError;
	email: FormError;
	website: FormError;
	skype: FormError;
}

interface FormError {
	name: string;
	error: string;
}
