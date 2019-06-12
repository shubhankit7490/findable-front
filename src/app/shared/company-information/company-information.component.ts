import { Component, OnInit, OnChanges, SimpleChanges, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
import { Subscription } from 'rxjs/Subscription';

// services:
import { DataService } from '../../rest/service/data.service';
import { AuthService } from '../../rest/service/auth.service';
import { AnalyticsService } from '../../services/analytics.service';
import { GrowlService } from '../../rest/service/growl.service';

// models:
import * as models from '../../rest/model/models';

import { environment } from 'environments/environment';
import { AutoUnsubscribe } from '../../utils/autoUnsubscribe';
import { FileUpload } from 'interjet-primeng/components/fileupload/fileupload';

declare let moment: any;
declare let orientation, rotation;
declare let google: any;

@Component({
	selector: 'app-company-information',
	templateUrl: './company-information.component.html',
	styleUrls: ['./company-information.component.css']
})
@AutoUnsubscribe()
export class CompanyInformationComponent implements OnInit, OnChanges {
	@ViewChild('industrySelector') industrySelector;
	@ViewChild('profileImage') profileImage;
	@Input('mode') mode = 'create';
	@Output() onComplete: EventEmitter<models.Business> = new EventEmitter();

	public companyFormGroup: FormGroup;
	public businessModel: models.Business = {
		name: null,
		year_established: 2017,
		size: null,
		location: null,
		industry: {
			id: null,
			name: null
		},
		duns: null,
		type: 1,
		web_address: null,
		logo: null
	};

	@Input() businessRecord: models.BusinessRecord = {
		name: null,
		year_established: null,
		size: null,
		location: null,
		industry: null,
		duns: null,
		type: null,
		web_address: null,
		logo: null
	};

	public submitting: boolean = false;

	public companyTypes = [
		{
			id: 1,
			name: 'Enterprise'
		},
		{
			id: 2,
			name: 'Startup'
		}
	];

	// Error messaging object
	public controls: any = {
		fields: {
			name: 'Company name',
			established: 'Year established',
			location: 'Location',
			web: 'Web address'
		},
		errors: {
			url: '{field} does not contain a valid url',
			required: '{field} field is required'
		},
		messages: {
			name: '',
			established: '',
			location: '',
			web: '',
			global: ''
		}
	};

	public companySizes = [
		{ value: 1, text: '1-5' },
		{ value: 5, text: '5-10' },
		{ value: 10, text: '10-50' },
		{ value: 50, text: '50-100' },
		{ value: 100, text: '100-500' },
		{ value: 500, text: '500-1000' },
		{ value: 1000, text: '1000-10000' },
		{ value: 10001, text: '10000+' }
	];

	// Auto complete variables
	public industries: models.DictionaryItem[];
	public industry: models.Industry = { id: null, name: null };
	public requestingIndustry: boolean = false;

	public dictionaryIndexed: boolean = true;

	private industryDictionaryPostSubscriber: Subscription;
	public industryDictionarySubscriber: Subscription;
	private businessPostSubscriber: Subscription;
	private businessPutSubscriber: Subscription;
	private businessGetSubscriber: Subscription;

	// Image upload configuration variables
	public uploader: any;
	public profileImagePath: any = '';
	private profileImagePathDefault: any = '';
	UPLOAD_PATH: string = environment.baseApiPath + '/business/images';

	// Places API
	public autocomplete: google.maps.places.Autocomplete = null;

	constructor(
		public dataService: DataService,
		public authService: AuthService,
		public formBuilder: FormBuilder,
		public analyticsService: AnalyticsService,
	) {
		this.companyFormGroup = this.formBuilder.group({
			name: ['', Validators.required],
			established: ['2017', Validators.required],
			size: [''],
			location: [''],
			industry: [''],
			duns: [''],
			type: [{value: '', disabled: !this.companyTypes.length}],
			web: ['https://', [Validators.required, CustomValidators.url]]
		});
	}

	ngOnInit() {
		if (this.mode === 'create') {
			this.resetModels();
		}

		this.controls.messages = {
			name: '',
			established: '',
			location: '',
			web: ''
		};

		this.analyticsService.emitPageview('Company Information');
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

		this.businessModel.location = {
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
					this.businessModel.location.country_name = place.address_components[i]['long_name'];
					this.businessModel.location.country_short_name_alpha_2 = place.address_components[i]['short_name'];
					break;
				case 'locality':
					this.businessModel.location.city_name = place.address_components[i]['long_name'];
					break;
				case 'postal_town':
					if (this.businessModel.location.city_name === null) {
						this.businessModel.location.city_name = place.address_components[i]['long_name'];
					}
					break;
				case 'administrative_area_level_1':
					this.businessModel.location.state_name = place.address_components[i]['long_name'];
					this.businessModel.location.state_short_name = place.address_components[i]['short_name'];
					break;
				case 'administrative_area_level_2':
					if (this.businessModel.location.state_name === null) {
						this.businessModel.location.state_name = place.address_components[i]['long_name'];
						this.businessModel.location.state_short_name = place.address_components[i]['short_name'];
					}
					break;
			}
		}
	}

	ngOnChanges(changes: SimpleChanges) {
		if ('businessRecord' in changes) {
			if (changes['businessRecord'].currentValue.name !== null) {
				this.loadModelData();
			}
		}
	}

	// getModelData() {
	// 	this.businessGetSubscriber = this.dataService.business_get(this.authService.currentUser.business_id).subscribe(
	// 		response => {
	// 			this.businessRecord = response;
	// 			this.loadModelData();
	// 		},
	// 		error => {
	// 			console.log('error', error);
	// 		}
	// 	);
	// }

	loadModelData() {
		this.businessModel.name = this.businessRecord.name;
		this.businessModel.year_established = this.businessRecord.year_established;
		this.businessModel.size = this.businessRecord.size;
		this.businessModel.duns = this.businessRecord.duns;
		this.businessModel.industry = this.businessRecord.industry;
		this.businessModel.type = this.businessRecord.type.id || 1;
		this.businessModel.location = this.businessRecord.location;
		this.businessModel.web_address = this.businessRecord.web_address;

		// Industry
		this.industry = this.businessModel.industry;

		// Image
		this.profileImagePath = this.businessRecord.logo.url || '';
		this.businessModel.logo = this.businessRecord.logo.id || null;

		// Form values
		this.companyFormGroup.patchValue({
			name: this.businessModel.name,
			established: this.businessModel.year_established,
			location: this.parseLocation(this.businessModel.location),
			industry: this.businessModel.industry.name,
			duns: this.businessModel.duns,
			web: this.businessModel.web_address,
			size: this.businessModel.size
		});

		this.loadGmaps();
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

	onSubmit(e: Event) {
		e.preventDefault();
		e.stopPropagation();

		this.dictionaryIndexed = true;

		if (this.validate()) {

			// Adding the company as a dictionary entity
			if (this.industry.name !== null) {
				if (this.industry.name.length > 0 && this.industry.id === null && this.dictionaryIndexed) {
					this.dictionaryIndexed = false;
					this.submitting = true;
					this.industryDictionaryPostSubscriber = this.dataService.dictionary_industry_post(this.industry.name).subscribe(
						response => {
							this.submitting = false;
							this.industry.id = response.id;
							this.businessModel.industry = this.industry;
							this.businessRecord.industry = this.industry;
							this.onSubmit(e);
						},
						error => {
							this.submitting = false;
							this.handleErrors(error);
						}
					);
				}
			}

			this.businessModel.name = this.companyFormGroup.value.name;
			this.businessModel.size = this.companyFormGroup.value.size;
			this.businessModel.duns = this.companyFormGroup.value.duns;
			this.businessModel.web_address = this.companyFormGroup.value.web;

			if (this.mode === 'create') {
				this.submitting = true;
				this.businessPostSubscriber = this.dataService.business_post(this.businessModel).subscribe(
					response => {
						this.analyticsService.emitEvent('Company Information', 'Create', 'Desktop', this.authService.currentUser.user_id);
						this.submitting = false;
						this.authService.currentUser.business_id = response.message;
						this.authService.update('currentUser', this.authService.currentUser);

						this.businessRecord.name = this.businessModel.name;
						this.businessRecord.year_established = this.businessModel.year_established;
						this.businessRecord.size = this.businessModel.size;
						this.businessRecord.duns = this.businessModel.duns;
						this.businessRecord.industry = this.businessModel.industry;
						this.businessRecord.type = {
							id: this.businessModel.type || 1
						};
						this.businessRecord.location = this.businessModel.location;
						this.businessRecord.web_address = this.businessModel.web_address;

						this.authService.update('currentBusiness', this.businessRecord);
						this.onComplete.emit(this.businessModel);
					},
					error => {
						console.log('@company-info > onSubmit mode=create [ERROR]:', error);
						this.submitting = false;
						this.handleErrors(error);
					}
				);
			} else if (this.mode === 'update') {
				this.submitting = true;
				this.businessPutSubscriber = this.dataService.business_put(this.authService.currentUser.business_id, this.businessModel).subscribe(
					response => {
						this.analyticsService.emitEvent('Company Information', 'Update', 'Desktop', this.authService.currentUser.user_id);
						this.submitting = false;
						this.onComplete.emit(this.businessModel);
						GrowlService.message('Successfully updated your company information', 'success');
					},
					error => {
						this.submitting = false;
						this.handleErrors(error);
					}
				);
			}
		}
	}

	handleErrors(error) {
		let err_body = JSON.parse(error._body);
		if (error.status === 406) {
			for (let i = 0; i < err_body.message.length; i++) {
				this.controls.messages[err_body.message[i].field] = err_body.message[i]['error'];
			}
		}

		if (error.status === 403 || error.status === 400) {
			this.controls.messages.global = err_body.message;
			GrowlService.message(err_body.message, 'error');
		}
	}

	validate(key?: string) {
		let __v = 0;
		if (!key) {
			for (let c in this.companyFormGroup.controls) {
				if (this.companyFormGroup.controls.hasOwnProperty(c) && !this.companyFormGroup.controls[c].valid) {
					for (let e in this.companyFormGroup.controls[c].errors) {
						if (this.companyFormGroup.controls[c].errors.hasOwnProperty(e) &&  this.controls.errors.hasOwnProperty(e)) {
							this.controls.messages[c] = this.controls.errors[e].replace('{field}', this.controls.fields[c]);
							__v++;
							break;
						}
					}
				}
			}
		} else {
			if (!this.companyFormGroup.controls[key].valid) {
				for (let e in this.companyFormGroup.controls[key].errors) {
					if (this.companyFormGroup.controls[key].errors.hasOwnProperty(e) &&  this.controls.errors.hasOwnProperty(e)) {
						this.controls.messages[key] = this.controls.errors[e].replace('{field}', this.controls.fields[key]);
						__v++;
						break;
					}
				}
			} else {
				this.controls.messages[key] = '';
			}
		}

		return __v === 0;
	}

	setEstablished(e: any) {
		this.setModel('year_established', Number.parseInt(moment(e).format('YYYY')));
	}

	setModel(key: string, e: any) {
		this.businessModel[key] = e;
	}

	resetLocation(e: any) {
		this.businessModel.location = {
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

	searchIndustry(event) {
		// stop if length === 0
		if (!event.query.length) return;
		this.industry = {
			id: null,
			name: event.query
		};

		// start spinner:
		this.requestingIndustry = true;

		this.industryDictionarySubscriber = this.dataService.dictionary_industry_get('industry', event.query).subscribe(
			(response: models.DictionaryItem[]) => {
				this.industries = response;
				// stop spinner:
				this.requestingIndustry = false;
			},
			error => {
				console.log(error);
				this.requestingIndustry = false;
			}
		);
	}

	setState(key, event) {
		let _e = event.srcElement || event.target,
		_k = {};

		_k[key] = '';

		if (_e.value.length > 0) {
			this.companyFormGroup.controls[key].markAsDirty();
			this[key] = {
				id: null,
				name: _e.value
			};
		} else {
			this.companyFormGroup.patchValue(_k);
			this[key] = {
				id: null,
				name: null
			};
		}

		this.setModel(key, this[key]);
	}

	public onSelectIndustry(industry: models.Industry) {
		this.companyFormGroup.patchValue({
			industry: industry.name
		});
		this.industry = industry;
		this.setModel('industry', this.industry);
	}

	// Image upload methods
	onBeforeSend(event): void {
		event.xhr.setRequestHeader('X-API-KEY', this.authService.currentUser.key);
	}

	onSelect(event, fileInput: FileUpload): void {
		this.uploader = fileInput;
		this.profileImagePath = '';

		orientation(this.uploader.files[0], (base64img, value) => {
			this.profileImage.nativeElement.src = base64img
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

		this.uploader.upload();
	}

	onUpload(event): void {
		let response = JSON.parse(event.xhr.response);
		let el = <HTMLElement>document.querySelector('.ui-fileupload-row img');
		el.style.display = 'none';
		this.setModel('logo', response.id);
		this.profileImage.nativeElement.style.maxHeight = '210px';
		this.profileImage.nativeElement.style.transform = rotation[1];
		el.style.display = 'initial';

		this.profileImagePath = this.profileImagePathDefault = response.path;
	}

	uploadError(event): void {
		console.log(event);
	}

	onClear(): void {
		this.profileImagePath = this.profileImagePathDefault = this.profileImagePathDefault;
	}

	private resetModels() {
		this.businessModel.location = this.businessRecord.location = {
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

		this.businessRecord.type = this.businessRecord.industry = {
			id: null,
			name: null
		};

		this.businessRecord.logo = {
			id: null,
			url: null
		};
	}

	checkSiteText() {
		let model = this.companyFormGroup.get('web');

		if (model.value.indexOf('https://') < 0) {
			model.setValue('https://');
		}
	}
}
