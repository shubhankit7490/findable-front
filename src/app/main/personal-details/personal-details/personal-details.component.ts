import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Modal } from 'ngx-modal';
// services:
import { DataService } from '../../../rest/service/data.service';
import { AuthService } from '../../../rest/service/auth.service';
import { AnalyticsService } from '../../../services/analytics.service';
import { TourService } from '../../../services/tour.service';

//models:
import * as models from '../../../rest/model/models';

declare let moment: any;

import { environment } from 'environments/environment';

declare let orientation, rotation, Tour;
declare let google: any;

/**
 * Personal Detials
 * 
 * This component is displayed when logged in user
 * navigates to his My Account view.
 */
@Component({
	selector: 'app-personal-details',
	templateUrl: './personal-details.component.html',
	styleUrls: ['./personal-details.component.css']
})
export class PersonalDetailsComponent implements OnInit, AfterViewInit {
	@ViewChild('profileImage') profileImage;
	@ViewChild('activationModal') modal: any;
	@ViewChild('upload_resume') upload_resume: Modal;
	@ViewChild('upload_resume_input') upload_resume_input: HTMLInputElement;

	public userBirthday: number;
	public parsedLocation: string = '';
	public locationData: Location[] = [];
	public typeaheadLoading: boolean;
	public typeaheadNoResults: boolean;
	public datepickerShown: boolean = false;
	public hasBaseDropZoneOver: boolean = false;
	public hasAnotherDropZoneOve: boolean = false;
	public detailsForm: FormGroup;
	public userDetails: models.PersonalDetails = {};
	public profileImagePath: any = '';
	public submitting: boolean = false;
	public uploader: any;
	public file;
	public uploadingResume: boolean = false;
 	public responseData: any;	
	public resume_status: string = 'Upload resume';
	public currentUser: models.User;

	public authPending = models.Status.StatusEnum.Pending;
	
	public formErrors: FormErrors = {
		firstname: 	{error: '', name: 'First Name'},
		lastname: 	{error: '', name: 'Last Name'},
		phone: 			{error: '', name: 'Phone'},
		city: 			{error: '', name: 'Location'},
		birthday: 	{error: '', name: 'Birthday'},
		gender: 		{error: '', name: 'Gender'},
		email: 			{error: '', name: 'Email'},
		website: 		{error: '', name: 'Website'},
		skype: 			{error: '', name: 'Skype'}
	};
	public globalSuccess: string;
	public globalError: string;
	public UPLOAD_PATH: string = environment.baseApiPath + '/users/images';
	public searchTerm = '';
	public results: models.DictionaryItem[];
	public requesting = false;
	public autocomplete: google.maps.places.Autocomplete = null;
	private profileImagePathDefault: any = '';
	private userLocation: models.Location = {};
	private msgs: any[] = [];
	private uploadedFiles: File[] = [];
	private imageId: models.Image;
	private apiKey = '';
	public role: string;

	public tour;

	constructor(
		private router: Router,
		private dataService: DataService,
		private authService: AuthService,
		private formBuilder: FormBuilder,
		private analyticsService: AnalyticsService,
		private tourService: TourService,
		private route: ActivatedRoute,
	) {

		this.currentUser = this.authService.currentUser;
		this.role = this.currentUser.role;

		this.apiKey = this.currentUser.key;

		const { arrowClass, steps, label, label_exit } = this.tourService
		this.tour = {
			arrowClass,
			steps,
			label,
			label_exit,
		};

		this.globalSuccess = '';
		this.globalError = '';

		this.detailsForm = this.formBuilder.group({
			firstname: 	[ '', Validators.required ],
			lastname: 	[ '', Validators.required ],
			phone: 			[ '', Validators.required ],
			city: 			[ '', Validators.required ],
			skype: 			[ '' ],
			website: 		[ '' ],
			birthday: 	[ '' ],
			gender: 		[ '' ],
			email: 			[ '', [ Validators.required, Validators.pattern('.+\@.+\.+[a-zA-Z0-9]') ] ]
		});
	}

	ngOnInit(): void {
		this.getDetails();

		this.analyticsService.emitPageview('Personal Details');
		if (!!this.tourService.sections.personal) {
			this.tourService.pop('personal_details');
			this.tourService.markAsOpened('personal');
			this.tourService.markAsOpened('welcome');
		}

		this.autocomplete = new google.maps.places.Autocomplete((document.getElementById('city')), {types: ['(cities)']});
		google.maps.event.addDomListener(document.getElementById('city'), 'keydown', function (event) {
			if (event.keyCode === 13) {
				event.preventDefault();
			}
		});
		this.autocomplete.addListener('place_changed', this.getAutoCompleteLocation.bind(this));
		this.route.queryParams.subscribe(
			data => {
				if (data['uploadResume']) {
					this.router.navigate(['/user/personal-details']); // remove when daxtra feature is ready.
					this.upload_resume.open();
					this.tourService.tourEnded = true;
				}
			}
		);
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

		let parsedLocationName = this.parseLocation(this.userLocation);
		this.detailsForm.patchValue({
			city: parsedLocationName
		});

		if (!parsedLocationName.length) {
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
		}
	}

	ngAfterViewInit(): void {
		if (this.tourService.activeSection !== 'personal' && this.tourService.activeSection !== 'personal_details') {
			this.tourService.sleep();
		}
	}

	openConfirmDialog(e: Event) {
		e.preventDefault();
		this.modal.open();
	}

	actionOnOpen() {
	}

	actionOnClose() {
	}

	actionOnSubmit() {
	}

	setValues(): void {
		this.detailsForm.setValue({
			firstname: this.userDetails.firstname,
			lastname: this.userDetails.lastname,
			phone: this.userDetails.phone,
			city: (this.userLocation.city_name) ? this.parseLocation(this.userLocation) : '',
			skype: this.userDetails.skype,
			website: this.userDetails.website,
			birthday: this.userBirthday,
			gender: this.userDetails.gender,
			email: this.userDetails.email
		});
	}

	getDetails(): void {
		this.dataService.personal_details_get(this.authService.getUserId()).subscribe(
			(response: models.PersonalDetails) => {
				this.userDetails = response;
				this.userLocation = response.location;
				this.userBirthday = (!!response.birthday) ? response.birthday : null;
				this.profileImagePath = response.image.url || '../../../../assets/images/dashboard_profile_avatar.png';
				this.profileImagePathDefault = this.profileImagePath;
				this.imageId = response.image;

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
				if (fieldName === 'location[city_name]') {
					fieldName = 'city';
					error = 'Please select a location from the list';
			}
			this.formErrors[fieldName].error = error;

		} else {
			let _field = '';
			for (let key in this.formErrors) {

				if (this.formErrors.hasOwnProperty(key)) {
					if (!!fieldName) {
						if (key !== fieldName) {
							continue;
						}
						;
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
		this.imageId = response.id;
		this.sendForm();
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

		if (validationErrors) {
			return;
		}
		;

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

	sendForm(): void {
		/**
		 * @todo UserDetials model is not insync
		 * @prop {object} image with two properties:
		 * 	@prop {number} id
		 * 	@prop {string} url
		 * 
		 * this.imageId receives a number as id.
		 * weird fact, image is still sent and updated correctly.
		 * it works.
		 */
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
			image: this.imageId
		};


		this.dataService.personal_details_put(this.authService.getUserId(), this.userDetails).subscribe(
			response => {
				if (response.status === true) {
					this.analyticsService.emitEvent('Personal Details', 'Update', 'Desktop', this.currentUser.user_id);
					this.globalSuccess = 'Profile updated successfully.';
					this.submitting = false;
					setTimeout(() => {
						this.tourService.initSection();
						if (this.currentUser.role === 'applicant') {
							this.router.navigate(['/dashboard']);
						} else {
							this.router.navigate(['/business/search']);
						}
					}, 2000);
					let el = <HTMLElement>document.querySelector('.ui-fileupload-row img');
					if (el) {
						el.style.display = 'none';
					}
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

	resetError(key) {
		this.formErrors[key].error = '';
	}

	public initTourSection(event) {
		this.tourService.initSection(event);
	}

	public neverTourAgain(event) {
		this.tourService.neverAgain(event);
	}
	public openFileInput(upload_resume_input) {
		upload_resume_input.click();
	}
	public onSelectresume(event: Event): void {
		this.file = (event.target as HTMLInputElement).files[0];
		// const supportedFiles = 'doc'; //'|docx|pdf|rtf'
		if (this.file && this.file.name && (/\.(doc|docx|pdf|rtf')$/).test(this.file.name.toLowerCase())) {
			this.uploadingResume = true;
			this.resume_status = 'Processing...'
			this.dataService.user_upload_resume_parsing(this.file).subscribe(
				response => {
					console.log('The following is the response:', response);
	
					if (response.status) {
						this.uploadingResume = false;
						this.resume_status = 'successful!';
						// make sure page is refreshed with new data.
						this.router.navigate(['/dashboard']);
						window.location.reload();
					} else {
						this.resume_status = 'Unsupported file!';
						setTimeout(() => {
							this.uploadingResume = false;
							this.resume_status = 'Upload resume';
						}, 3000);
					}
				},
				error => {
					console.log('@onSelect > uploadResume: [error]', error);
					this.resume_status = 'File Unprocessable';
					this.uploadingResume = false;
					setTimeout(() => {
						this.resume_status = 'Upload resume';
					}, 3000);
				} 
			);
		} else {
			this.uploadingResume = false;
			this.resume_status = 'Unsupported File!';
			setTimeout(() => {
				this.resume_status = 'Upload resume';
			}, 3000);
		}
	}
	openUploadResumeModal() {
		this.upload_resume.open();
	}

	/**
	 * Upload Resume should close
	 */
	closeUploadResumeModal() {
		this.upload_resume.close();
		// does not refresh page, as long as url route is already on here
		// will change it but not refresh when uploadResume=true param exists
		this.router.navigate(['/faq']);
	}
	public openUploadResume() {
		this.upload_resume.open();
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