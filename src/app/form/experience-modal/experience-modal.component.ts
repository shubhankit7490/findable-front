import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Response } from '@angular/http';
import { Positioning } from '@ng-bootstrap/ng-bootstrap/util/positioning';
import { ConfirmOptions, Position } from 'angular2-bootstrap-confirm';
import { AutoComplete } from 'interjet-primeng/components/autocomplete/autocomplete';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';

// services:
import {TourService} from '../../services/tour.service';
import { DataService } from '../../rest/service/data.service';
import { AuthService } from '../../rest/service/auth.service';
import { MessageService } from '../../services/message.service';
import { AnalyticsService } from '../../services/analytics.service';
import { TransformerService } from '../../rest/service/transformer.service';

// models:
import * as extModels from '../../rest/service/extended-models/extended-models';
import * as models from '../../rest/model/models';

// component:
import { FocusAndExpertiseComponent } from './focus-and-expertise/focus-and-expertise.component';
import { MonthComponent } from '../datePicker/month.component';
import { YearComponent } from '../datePicker/year.component';

const numberMask = createNumberMask({
	prefix: '$',
	suffix: ''
});

declare let moment: any;
declare let google: any;

@Component({
	selector: 'app-experience-modal',
	templateUrl: './experience-modal.component.html',
	styleUrls: ['./experience-modal.component.css'],
	providers: [
		ConfirmOptions,
		{ provide: Position, useClass: Positioning }
	]
})
export class ExperienceModalComponent implements OnInit {
	@ViewChild('jobtitle') jobTitleInput: AutoComplete;
	@ViewChild('senioritySelect') senioritySelect: ElementRef;
	@ViewChild('responsibilities') responsibilitiesInput: FocusAndExpertiseComponent;
	@ViewChild('monthFrom') monthFrom: MonthComponent;
	@ViewChild('monthTo') monthTo: MonthComponent;
	@ViewChild('yearFrom') yearFrom: YearComponent;
	@ViewChild('yearTo') yearTo: YearComponent;
	// @ViewChild('location') location;
	@ViewChild('company') company: AutoComplete;
	@ViewChild('industry') industry: AutoComplete;
	@Input() experienceClear: models.Position[];
	@Input() enumAllData: models.EmploymentType[] | any;
	@Output() updateExperience = new EventEmitter<boolean>();
	@Output() onClose = new EventEmitter<any>();
	public experienceGroup: FormGroup;
	public current: boolean;
	public areasOfFocus: models.AreaOfFocus[];
	public sendModelExperience: models.Position = {};
	// sendSeniority: models.Seniority;
	public typeSelected: string;
	private setLocation: string;
	private setModelCompany: models.Company = {
		id: null,
		name: ''
	};
	private setModelLocation: models.Location = {
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
	private setModelLocationExtended: extModels.LocationExt;
	private setModelIndustry: models.Industry = {
		id: null,
		name: ''
	};
	private setModelJobTitle: models.JobTitle = {
		id: null,
		name: ''
	};
	public setModelSeniority: models.Seniority;
	public setModelId: number;
	public setAreasOfFocus: models.AreaOfFocus[];
	public salaryPeriodModel: string[] = ['H', 'M', 'Y'];
	public from: string;
	public to: string;
	// Search term model
	public searchTerm: string;
	public searchTermLocation: string;
	public searchTermIndustry: string;
	public searchTermJobTitle: string;
	public mask: Array<string | RegExp>;
	public now: Date;
	public formErrors: FormErrors = {
		company: '',
		city: '',
		date: '',
		salary: '',
		salary_period: '',
		seniority: '',
		job_title: '',
		type: '',
		industry: '',
		areas_of_focus: '',
		global: '',
		from: '',
		to: '',	
	};
	public isSubmitting: boolean;
	public seniorities: models.Seniority[] = [
		{ id: 1,  name: 'Unpaid'	  	},
		{ id: 2,  name: 'Internship'	},
		{ id: 3,  name: 'Entry'	  		},
		{ id: 4,  name: 'Associate'	  },
		{ id: 5,  name: 'Junior'	  	},
		{ id: 6,  name: 'Senior'	  	},
		{ id: 7,  name: 'Manager'	  	},
		{ id: 8,  name: 'Director'	  },
		{ id: 9,  name: 'VP'	  			},
		{ id: 10, name: 'President'	  },
		{ id: 11, name: 'Partner'	  	},
		{ id: 12, name: 'Owner'	  		},
		{ id: 13, name: 'Founder'	  	}
	];

	public resultsJobtitle: models.DictionaryItem[];
	public resultsCompany: models.DictionaryItem[];
	public resultsLocation: models.DictionaryItem[];
	public resultsIndustry: models.DictionaryItem[];

	public requestingJobtitle = false;
	public requestingCompany = false;
	public requestingLocation = false;
	public requestingIndustry = false;
	public updateMode = false;
	public dictionaryIndexed = true;

	/* Confirm Parameters */
	public title = 'Deleting Item';
	public message = 'Please confirm you want to delete this item';
	public confirmClicked = false;
	public cancelClicked = false;
	public isOpen = false;

	/* Places AutoComplete */
	public autocomplete: google.maps.places.Autocomplete = null;

	public showStartDatePickerTo = false;

	constructor(
		public authService: AuthService,
		public dataService: DataService,
		public formBuilder: FormBuilder,
		public messageService: MessageService,
		public analyticsService: AnalyticsService,
		public tourService: TourService,
	) {
		this.experienceGroup = this.formBuilder.group({
			companyName: ['', Validators.required],
			location: ['', Validators.required],
			industry: [''],
			jobTitle: ['', Validators.required],
			from: [''],
			to: [''],
			salary: [''],
			seniority: [''],
			salary_period: [''],
			current: [false],
			type: [''],
		});
		this.mask = numberMask;
		this.now = new Date();
		this.resetErrors();
	}

	private resetErrors() {
		this.formErrors = {
			company: '',
			city: '',
			date: '',
			salary: '',
			salary_period: '',
			seniority: '',
			job_title: '',
			type: '',
			industry: '',
			areas_of_focus: '',
			global: '',
			from: '',
			to: '',
		};
	}

	public onSelectSeniority(event: Event): void {
		let id = Number((event.target as HTMLInputElement).value);
		let name = (event.target as HTMLSelectElement)
			.options[(event.target as HTMLSelectElement).selectedIndex].text;
		this.setModelSeniority = { id, name };
	}

	ngOnInit() {
		this.newExperience();
		this.messageService.getMessage().subscribe(
			response => {
				if (response.action === 'SELECT_RECENT_JOB') {
					if (this.experienceClear && this.experienceClear.length) {
						this.edit(this.experienceClear[0]);
					}
				}
			},
			error => {
				console.log('@experience-modal > onInit getMessage [ERROR]:', error);
			}
		);
	}

	public loadGmaps() {
		this.autocomplete = new google.maps.places.Autocomplete((document.getElementById('location')), {types: ['(cities)']});
		google.maps.event.addDomListener(document.getElementById('location'), 'keydown', function(event) {
			if (event.keyCode === 13) {
				event.preventDefault();
			}
		});
		this.autocomplete.addListener('place_changed', this.getAutoCompleteLocation.bind(this));
	}

	private getAutoCompleteLocation() {
		let place = this.autocomplete.getPlace();
		if (!place.geometry) {
			return;
		}

		this.setModelLocation = {
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
					this.setModelLocation.country_name = place.address_components[i]['long_name'];
					this.setModelLocation.country_short_name_alpha_2 = place.address_components[i]['short_name'];
					break;
				case 'locality':
					this.setModelLocation.city_name = place.address_components[i]['long_name'];
					break;
				case 'postal_town':
					if (this.setModelLocation.city_name === null) {
						this.setModelLocation.city_name = place.address_components[i]['long_name'];
					}
					break;
				case 'administrative_area_level_1':
					this.setModelLocation.state_name = place.address_components[i]['long_name'];
					this.setModelLocation.state_short_name = place.address_components[i]['short_name'];
					break;
				case 'administrative_area_level_2':
					if (this.setModelLocation.state_name === null) {
						this.setModelLocation.state_name = place.address_components[i]['long_name'];
						this.setModelLocation.state_short_name = place.address_components[i]['short_name'];
					}
					break;
			}
		}

		let parsedLocationName = this.parseLocation(this.setModelLocation);
		this.experienceGroup.patchValue({
			location: parsedLocationName
		});

		if (!parsedLocationName.length) {
			this.setModelLocation = {
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

	public onAreasEdit(areas: models.AreaOfFocus[]) {
		this.setAreasOfFocus = areas;
		// Marking any field as dirty so the save button will be activated
		this.experienceGroup.controls['from'].markAsDirty();
	}

	public onSalary(data: string) {
		this.sendModelExperience.salary = Number(data);
	}

	public onChangeType(type: string) {
		let levelExperience = this.enumAllData.filter((item) => item === type);
		this.sendModelExperience.type = levelExperience[0].toLowerCase();
		this.typeSelected = levelExperience[0].toLowerCase();
	}

	public onChangeCurrent(current: boolean) {
		this.sendModelExperience.current = current;
		this.experienceGroup.patchValue({ current });
	}

	public onChangeSalary_period(period: string) {
		this.sendModelExperience.salary_period = period;
	}

	private setDate(method: string, prop: string, time: number) {
		// console.log(`@experience-modal > setDate ${prop} time:`, time);
		// prop can be 'from' | 'to'
		let { [prop]: n } = this.sendModelExperience;
		if (!this[prop]) {
			this[prop] = method === 'month'
				? moment().month(new Date(time).getMonth()).format('YYYY-MM-DD hh:mm:ss')
				:	moment().year(new Date(time).getFullYear()).format('YYYY-MM-DD hh:mm:ss');
		} else {
			this[prop] = method === 'month'
				? moment(n).month(new Date(time).getMonth()).format('YYYY-MM-DD hh:mm:ss')
				: moment(n).year(new Date(time).getFullYear()).format('YYYY-MM-DD hh:mm:ss');
		}

		if (this[prop] !== n) {
			this.experienceGroup.controls[prop].markAsDirty();
		}
		this.sendModelExperience[prop] = this[prop];
	}

	public setYearDate(time: number) { this.setDate('year', 'from', time); }
	public setMonthDate(time: number) {	this.setDate('month', 'from', time); }
	public setYearDateTo(time: number) { this.setDate('year', 'to', time); }
	public setMonthDateTo(time: number) { this.setDate('month', 'to', time); }

	private resetResponsibilities() {
		const { responsibilitiesAutcompleteComponent: component } = this.responsibilitiesInput;
		component.hide();
		if (component.el.nativeElement.querySelector('input') !== null) {
			component.el.nativeElement.querySelector('input').value = '';
		}
	}

	public newPosition(event: Event, { company }: models.Position) {
		event.preventDefault();
		event.stopPropagation();

		this.resetResponsibilities();
		this.resetModels();
		this.resetErrors();

		this.setModelId = null;
		this.areasOfFocus = [];
		this.setAreasOfFocus = [];
		this.setModelCompany = company;
		this.experienceGroup.reset();
		this.experienceGroup.patchValue({
			companyName: company.name,
			location: '',
			industry: '',
			jobTitle: '',
			from: '',
			to: '',
			salary: '',
			seniority: '',
			salary_period: 'Y',
		});

		this.sendModelExperience = {
			id: null,
			company,
			location: null,
			industry: null,
			job_title: null,
			from: null,
			to: null,
			salary: null,
			salary_period: 'Y',
			seniority: null,
			current: false,
			type: null
		};

		this.jobTitleInput.el.nativeElement.querySelector('input').focus();
		this.updateMode = false;
	}

	public newExperience() {
		this.resetResponsibilities();
		this.resetModels();
		this.resetErrors();

		this.to = null;
		this.from = null;

		this.setModelId = null;
		this.areasOfFocus = [];
		this.setAreasOfFocus = [];
		this.experienceGroup.setValue({
			companyName: '',
			location: '',
			industry: '',
			jobTitle: '',
			from: '',
			to: '',
			salary: '',
			seniority: '',
			current: false,
			type: '',
			salary_period: 'Y',
		});

		this.sendModelExperience = {
			id: null,
			company: null,
			location: null,
			industry: null,
			job_title: null,
			from: null,
			to: null,
			salary: null,
			salary_period: 'Y',
			seniority: null,
			current: false,
			type: null
		};

		this.updateMode = false;
	}

	public delete(experienceData: models.Position, event: Event = null) {
		if (!!event) {
			event.preventDefault();
			event.stopPropagation();
		}

		this.dataService.experience_delete(this.authService.getUserId(), experienceData.id).subscribe(
			(response: Response) => {
				this.analyticsService.emitEvent('Experience', 'Delete', 'Desktop', this.authService.currentUser.user_id);
				this.updateMode = false;
				this.updateExperience.emit(true);
				this.messageService.sendMessage({action: 'updateExperience', data: {}});
				this.resetModels();
			},
			error => {
				console.log('@experience-modal > delete [ERROR]:', error);
			}
		);
	}

	public edit(experienceData: models.Position) {
		if (this.setModelId == experienceData.id) { return; }
		this.updateMode = true;
		this.typeSelected = '';
		// console.log('@experience-modal > edit experienceData', experienceData);
		this.resetResponsibilities();
		this.resetModels();
		this.resetErrors();

		const {
			id,
			company,
			location,
			industry,
			job_title,
			type: jobType,
			salary,
			salary_period,
			seniority,
			from: start,
			to: until,
			current,
			areas_of_focus,
		} = experienceData;

		this.setModelId = id;
		this.setAreasOfFocus = areas_of_focus;

		// typeof current === 'string' is true 
		if (current == true) {
			this.current = true; // '1'
		} else {
			this.current = false; // '0'
		}
		
		let type = (!!jobType) ? jobType.toLowerCase() : null
		
		if ('type' in experienceData) {
			this.typeSelected = type;
		} else {
			this.typeSelected = jobType;
		}

		this.from = start;
		
		// is current?
		this.to = until ? until : null;
		
		this.setModelCompany = company;
		this.setModelIndustry = industry;
		this.setModelJobTitle = job_title;
		this.setModelSeniority = seniority;
		this.setModelLocation = location || {
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

		// Transform location and get name:
		this.setModelLocationExtended = TransformerService.transformLocation(this.setModelLocation);
		this.searchTermLocation = this.setModelLocationExtended.name;

		let from = moment(start).format('MM/YYYY');
		let to = moment(until).format('MM/YYYY');
		this.experienceGroup.reset();
		this.experienceGroup.patchValue({
			'companyName': company.name,
			'location': this.searchTermLocation,
			'industry': industry.name,
			'jobTitle': job_title.name,
			'from': from,
			'to': to,
			'salary': salary,
			'current': this.current,
			'type': type,
			'seniority': seniority.name,
			'salary_period': salary_period
		});

		from = moment(start).format('YYYY-MM-DD HH:mm:ss');
		to = moment(until).format('YYYY-MM-DD HH:mm:ss');
		this.sendModelExperience = {
			id,
			company,
			'location': this.setModelLocation,
			industry,
			job_title,
			from,
			to,
			salary,
			salary_period,
			seniority,
			current,
			type,
		};

		this.senioritySelect.nativeElement.selectedIndex = Number(seniority.id);
	}

	private prepareToAddDictionaryEntity(model, method) {
		return (event: Event, closeAfter) => {
			const { id, name } = this[model];
			if (name !== null) {
				if (name.length > 0 && id === null && this.dictionaryIndexed) {
					this.dictionaryIndexed = false;
					this.dataService[method](name).subscribe(
						({ id }: models.NewDictionaryEntry) => {
							this[model].id = id;
							this.isSubmitting = false;
							this.onSubmit(event, closeAfter);
						},
						error => {
							console.log(`@experience-modal > ${model} ${method} [ERROR]:`, error);
							this.handleErrors(error);
						}
					);
				}
			}
		}
	}

	public onSubmit(event: Event, closeAfter = false) {
		event.preventDefault();

		this.isSubmitting = true;
		this.dictionaryIndexed = true;

		this.resetErrors();

		let addJobTitleAsDictionaryEntity = this.prepareToAddDictionaryEntity('setModelJobTitle', 'dictionary_jobtitle_post');
		addJobTitleAsDictionaryEntity(event, closeAfter);

		let addCompanyAsDictionaryEntity = this.prepareToAddDictionaryEntity('setModelCompany', 'dictionary_company_post');
		addCompanyAsDictionaryEntity(event, closeAfter);
		
		let addIndustryAsDictionaryEntity = this.prepareToAddDictionaryEntity('setModelIndustry', 'dictionary_industry_post');
		addIndustryAsDictionaryEntity(event, closeAfter);
		
		if (this.dictionaryIndexed) {
			let position_salary = this.experienceGroup.value.salary;

			if (this.updateMode) {
				this.sendModelExperience = {
					id: Number(this.setModelId),
					from: this.from,
					to: (this.experienceGroup.value.current) ? null : this.to,
					salary: (this.experienceGroup.value.salary !== null) ? this.experienceGroup.value.salary.replace('$', '').replace(' ', '').replace(/,/g, '') : null,
					current: this.experienceGroup.value.current,
					type: (!!this.experienceGroup.value.type && this.experienceGroup.value.type !== 'null') ? this.experienceGroup.value.type : null,
					salary_period: this.sendModelExperience.salary_period
				};
				this.sendModelExperience.company = this.setModelCompany;
				this.sendModelExperience.location = this.setModelLocation;
				this.sendModelExperience.industry = this.setModelIndustry;
				this.sendModelExperience.job_title = this.setModelJobTitle;
				this.sendModelExperience.seniority = this.setModelSeniority;
				this.sendModelExperience.areas_of_focus = this.setAreasOfFocus; // areasOfFocus
				
				this.dataService.experience_put(this.authService.getUserId(), this.sendModelExperience.id, this.sendModelExperience).subscribe(
					(response: Response) => {
						this.analyticsService.emitEvent('Experience', 'Update', 'Desktop', this.authService.currentUser.user_id);
						this.sendModelExperience.salary = position_salary;
						this.updateExperience.emit(true);
						this.messageService.sendMessage({ action: 'updateExperience' });
						this.formErrors['global'] = 'Position updated successfully';
						this.isSubmitting = false;

						setTimeout(() => {
							this.formErrors['global'] = '';
						}, 5000);

						if (closeAfter) {
							this.closeModal(event);
						}
					},
					error => {
						this.isSubmitting = false;
						this.handleErrors(error);
					}
				);
			} else {
				this.sendModelExperience.company = this.setModelCompany;
				this.sendModelExperience.location = this.setModelLocation;
				this.sendModelExperience.industry = this.setModelIndustry;
				this.sendModelExperience.job_title = this.setModelJobTitle;
				this.sendModelExperience.seniority = this.setModelSeniority;
				this.sendModelExperience.type = (!!this.typeSelected) ? this.typeSelected : null;
				this.sendModelExperience.areas_of_focus = this.setAreasOfFocus;
				this.sendModelExperience.salary = (this.experienceGroup.value.salary !== null) ? this.experienceGroup.value.salary.replace('$', '').replace(' ', '').replace(/,/g, '') : null,
				this.sendModelExperience.to = (this.experienceGroup.value.current) ? null : this.to;
				this.sendModelExperience.from = this.from;
				this.sendModelExperience.current = this.experienceGroup.value.current;
				this.sendModelExperience.salary_period = this.experienceGroup.value.salary_period;
				
				this.dataService.experience_post(this.authService.getUserId(), this.sendModelExperience).subscribe(
					response => {
						this.analyticsService.emitEvent('Experience', 'Create', 'Desktop', this.authService.currentUser.user_id);
						this.sendModelExperience.salary = position_salary;
						this.updateExperience.emit(true);
						this.setModelId = Number.parseInt(response['message']);
						this.messageService.sendMessage({action: 'updateExperience'})
						this.formErrors['global'] = 'Position updated successfully';
						this.isSubmitting = false;
						this.updateMode = true;

						setTimeout(() => {
							this.formErrors['global'] = '';
						}, 5000);

						if (closeAfter) {
							this.closeModal(event);
						}
					},
					error => {
						this.handleErrors(error);
						this.isSubmitting = false;
					}
				);
			}
		}
	}

	public saveAndClose(event: Event) {
		if (this.experienceGroup.dirty) {
			this.onSubmit(event, true);
		} else {
			this.closeModal(event);
		}
	}

	private closeModal(event: Event) {
		if (this.tourService.shown) {
			if (this.experienceClear.length > 0) {
				this.tourService.initSection(event);
			} else {
				this.tourService.sleep();
			}
		}

		this.onClose.emit(true);
	}

	handleErrors(error) {
		let err_body = JSON.parse(error._body);
		if (error.status === 406) {
			for (let i = 0; i < err_body.message.length; i++) {
				if (err_body.message[i].field === 'job_title[id]') {
					this.formErrors['job_title'] = err_body.message[i]['error'];
				} else {
					this.formErrors[err_body.message[i].field] = err_body.message[i]['error'];
				}
			}
		}

		if (error.status === 403 || error.status === 400) {
			this.formErrors['global'] = err_body.message;
		}
	}

	UpdateCompanyState(event) {
		let _e = event.srcElement || event.target;

		if (_e.value.length > 0) {
			this.experienceGroup.controls['companyName'].markAsDirty();
		} else {
			this.experienceGroup.patchValue({
				'company': ''
			});
		}
	}

	validateCompany(element) {
		setTimeout(function () {
			this.company.hide();
		}.bind(this), 200);

		this.experienceGroup.patchValue({
			'companyName': element.target.value
		});

		this.setModelCompany = {
			id: null,
			name: element.target.value
		};

		if (!element.target.value) {
			this.formErrors['company'] = 'Please type or choose a company name';
		} else {
			this.formErrors['company'] = '';
		}
	}

	UpdateJobtitleState(event) {
		let _e = event.srcElement || event.target;

		if (_e.value.length > 0) {
			this.experienceGroup.controls['jobTitle'].markAsDirty();
		} else {
			this.experienceGroup.patchValue({
				'jobTitle': ''
			});
		}
	}

	validateJobTitle(element) {
		setTimeout(function () {
			this.jobTitleInput.hide();
		}.bind(this), 200);

		this.experienceGroup.patchValue({
			jobTitle: (<HTMLInputElement>element.target).value
		});

		this.setModelJobTitle = {
			id: null,
			name: (<HTMLInputElement>element.target).value
		};

		if (!(<HTMLInputElement>element.target).value) {
			this.formErrors['job_title'] = 'Please type or choose a job title';
		} else {
			this.formErrors['job_title'] = '';
		}
	}

	searchJobtitle(event) {
		this.setModelJobTitle = {
			id: null,
			name: event.query
		}

		if (!event.query.length) {
			return;
		}

		this.requestingJobtitle = true;
		this.dataService.dictionary_job_title_get('jobtitle', event.query).subscribe(
			response => {
				this.resultsJobtitle = response;
				this.requestingJobtitle = false;
			}
		);
	}

	onSelectJobtitleAutoComplete(e) {
		this.experienceGroup.patchValue({
			'jobTitle': e.name
		});

		this.setModelJobTitle = e;
		this.formErrors['job_title'] = '';
	}

	searchCompany(event) {
		this.setModelCompany = {
			id: null,
			name: event.query
		}

		if (!event.query.length) {
			return;
		}

		this.requestingCompany = true;
		this.dataService.dictionary_company_get('company', event.query).subscribe(
			response => {
				this.resultsCompany = response;
				this.requestingCompany = false;
			}
		);
	}

	onSelectCompanyAutoComplete(e) {
		this.experienceGroup.patchValue({
			companyName: e.name
		});

		this.setModelCompany = e;
		this.formErrors['company'] = '';
	}

	searchLocation(event) {
		this.setModelLocation = {
			continent_id: null,
			continent_name: null,
			city_id: null,
			city_name: event.query,
			state_id: null,
			state_name: null,
			country_id: null,
			country_name: null,
			country_short_name_alpha_2: null,
			country_short_name_alpha_3: null
		}

		if (!event.query.length) {
			return;
		}

		this.requestingLocation = true;
		this.dataService.locations_get(event.query).subscribe(
			response => {
				this.resultsLocation = response;
				this.requestingLocation = false;
			}
		);
	}

	hideIndustryAutoComplete(event) {
		setTimeout(function () {
			this.industry.hide();
		}.bind(this), 200);
	}

	searchIndustry(event) {
		this.setModelIndustry = {
			id: null,
			name: event.query
		}

		if (!event.query.length) {
			return;
		}

		this.experienceGroup.get('industry').markAsDirty();

		this.requestingIndustry = true;
		this.dataService.dictionary_industry_get('industry', event.query).subscribe(
			response => {
				this.resultsIndustry = response;
				this.requestingIndustry = false;
			}
		);
	}

	onSelectIndustryAutoComplete(e) {
		this.experienceGroup.patchValue({
			'industry': e.name
		});

		this.setModelIndustry = e;
	}

	private resetModels() {
		this.setModelJobTitle = {
			id: null,
			name: ''
		};

		this.setModelCompany = {
			id: null,
			name: ''
		};

		this.setModelIndustry = {
			id: null,
			name: ''
		};

		this.setModelLocation = {
			continent_id: null,
			continent_name: null,
			city_id: null,
			city_name: null,
			state_id: null,
			state_name: null,
			country_id: null,
			country_name: null,
			country_short_name_alpha_2: null,
			country_short_name_alpha_3: null
		};

		// Reset the search terms
		this.searchTerm = '';
		this.searchTermLocation = '';
		this.searchTermIndustry = '';
		this.searchTermJobTitle = '';

		this.from = null;
		this.to = null;

		this.typeSelected = '';

		if (!!this.industry.input) {
			this.industry.input.value = '';
		}
	}

	/**
	 * @todo implement method
	 */
	onSelectionDateTo() {

	}
}

export interface FormErrors {
	company: string;
	city: string;
	date: string;
	salary: string;
	salary_period: string;
	seniority: string;
	job_title: string;
	type: string;
	industry: string;
	areas_of_focus: string;
	global: string;
	from: string;
	to: string;
}
