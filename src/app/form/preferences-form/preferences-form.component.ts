import { Component, OnInit, Input, Output, ViewChild, EventEmitter, ElementRef,OnChanges,SimpleChanges } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';

// services:
import { MessageService } from '../../services/message.service';
import { DataService } from '../../rest/service/data.service';
import { AuthService } from '../../rest/service/auth.service';
import { AnalyticsService } from '../../services/analytics.service';
import { TransformerService } from '../../rest/service/transformer.service';

// components:
import { LocationsFormComponent } from '../locations-form/locations-form.component';

// models:
import * as models from '../../rest/model/models';
import * as extModels from '../../rest/service/extended-models/extended-models';

const numberMask = createNumberMask({
	prefix: '$',
	suffix: ''
});

declare let moment: any;

@Component({
	selector: 'app-preferences-form',
	templateUrl: './preferences-form.component.html',
	styleUrls: ['./preferences-form.component.css']
})
export class PreferencesFormComponent implements OnInit,OnChanges{
	@Input() preferences: Observable<extModels.UserPreferencesExt>;
	@Input() user_id:number=0;
	@ViewChild('locationOfInteresetComponent') locationOfInteresetComponent: LocationsFormComponent;
	@ViewChild('fld_pref_start_time_date_picker') datePickerContainer: ElementRef;
	@Output() onSuccessfulUpdate = new EventEmitter<boolean>();
	public from: string;
	public isSubmitting: Boolean = false;
	public preferencesModel: extModels.UserPreferencesExt = {
		available: '',
		desired_salary_period_readable: '',
		employment_status: '',
		current_status: '',
		employment_type: '',
		desired_salary: null,
		desired_salary_period: '',
		benefits: null,
		available_from: null,
		start_time: '',
		legal_usa: null,
		only_current_location: null,
		relocation: null,
		locations: null,
	};
	public employmentStatuses: Array<string> = [
		'employed full time',
		'employed part time',
		'unemployed'
	];
	public currentStatuses: Array<string> = [
		'actively looking',
		'interested in offers',
		'not looking'
	];
	public salaryPeriods = ['H', 'M', 'Y'];
	public employmentTypes: Array<string> = ['full time', 'part time'];
	public available_from = ['immediately', 'one week', 'two weeks', 'one month', 'from'];

	private response$: Observable<Response>;
	private response: Response;

	// Form definition
	public form: FormGroup;

	// Form state
	public datePickerOpened = false;
	public datePickerTop = 1;
	public datePickerLeft = 1;

	// StartTime Date Picker properties
	public dt: Date = new Date();
	public minDate: Date = void 0;
	// public events: { date: Date, status: string }[];
	public tomorrow: Date;
	public afterTomorrow: Date;
	public dateDisabled: { date: Date, mode: string }[];
	public formats: string[] = ['DD-MM-YYYY', 'YYYY/MM/DD', 'DD.MM.YYYY', 'shortDate'];
	public format: string = this.formats[0];
	public dateOptions: any = {
		formatYear: 'YY',
		startingDay: 1
	};
	public mask: Array<string | RegExp>;
	private opened = false;
	private user_form_id:number=0;
	public formErrors: FormErrors = {
		employment_status: '',
		current_status: '',
		employment_type: '',
		desired_salary: '',
		desired_salary_period: '',
		benefits: '',
		available_from: '',
		start_time: '',
		legal_usa: '',
		only_current_location: '',
		relocation: ''
	};

	constructor(
		public dataService: DataService,
		public authService: AuthService,
		formBuilder: FormBuilder,
		public messageService: MessageService,
		public analyticsService: AnalyticsService,
	) {
		// Init form object
		this.form = formBuilder.group({
			employment_status: 		 [ '', Validators.required ],
			current_status: 			 [ '', Validators.required ],
			employment_type: 			 [ '', Validators.required ],
			desired_salary: 			 [ '' ],
			desired_salary_period: [ '' ],
			benefits: 						 [ '' ],
			locations: 						 [ '' ],
			relocation: 					 [ '0' ],
			available_from: 			 [ '' ],
			start_time: 					 [ '' ],
			legal_usa: 						 [ '' ]
		});
		// Init date picker
		(this.tomorrow = new Date()).setDate(this.tomorrow.getDate() + 1);
		(this.afterTomorrow = new Date()).setDate(this.tomorrow.getDate() + 2);
		(this.minDate = new Date()).setDate(this.minDate.getDate() - 1000);
		(this.dateDisabled = []);
		// this.events = [
		// 	{ date: this.tomorrow, status: 'full' },
		// 	{ date: this.afterTomorrow, status: 'partially' }
		// ];

		this.mask = numberMask;
	}
	ngOnChanges(changes: SimpleChanges){
			this.preferences.subscribe((response: extModels.UserPreferencesExt) => {
			this.preferencesModel = response;
			response.desired_salary_period = (response.desired_salary_period==null)? 'Y' :response.desired_salary_period;
			const {
				start_time: startTime,
				employment_status,
				current_status,
				employment_type,
				desired_salary: expectedSalary,
				desired_salary_period,
				benefits,
				locations,
				relocation: relocate,
				only_current_location,
				available_from,
				legal_usa,
			} = response;

			this.from = (startTime)
				? moment(startTime).format('YYYY-MM-DD hh:mm:ss')
				: moment().set('month', 0).format('YYYY-MM-DD hh:mm:ss');

			let start_time = moment(startTime).format('MM/YYYY');

			let desired_salary = (expectedSalary !== null) ? expectedSalary : '';
			let relocation = +relocate ? '1' : '0';
			this.form.patchValue({
				employment_status,
				current_status,
				employment_type,
				desired_salary,
				desired_salary_period,
				benefits,
				locations,
				relocation,
				available_from,
				start_time,
				legal_usa,
			});
			
		});

		this.observeForm();
		this.user_form_id=this.user_id;
	}
	ngOnInit() {
		this.preferences.subscribe((response: extModels.UserPreferencesExt) => {
			this.preferencesModel = response;
			
			const {
				start_time: startTime,
				employment_status,
				current_status,
				employment_type,
				desired_salary: expectedSalary,
				desired_salary_period,
				benefits,
				locations,
				relocation: relocate,
				only_current_location,
				available_from,
				legal_usa,
			} = response;

			this.from = (startTime)
				? moment(startTime).format('YYYY-MM-DD hh:mm:ss')
				: moment().set('month', 0).format('YYYY-MM-DD hh:mm:ss');

			let start_time = moment(startTime).format('MM/YYYY');

			let desired_salary = (expectedSalary !== null) ? expectedSalary : '';

			let relocation = relocate ? '1' : '0';

			this.form.patchValue({
				employment_status,
				current_status,
				employment_type,
				desired_salary,
				desired_salary_period,
				benefits,
				locations,
				relocation,
				available_from,
				start_time,
				legal_usa,
			});
			
		});

		this.observeForm();
		this.user_form_id=this.authService.getUserId();
	}

	public onSubmit(event: Event) {
		event.preventDefault();
		this.isSubmitting = true;

		this.formErrors = {
			employment_status: '',
			current_status: '',
			employment_type: '',
			desired_salary: '',
			desired_salary_period: '',
			benefits: '',
			available_from: '',
			start_time: '',
			legal_usa: '',
			only_current_location: '',
			relocation: ''
		};

		let desiredSalary = this.form.get('desired_salary').value;

		this.prepareModel();

		if (!!this.preferencesModel.desired_salary && !this.preferencesModel.desired_salary_period) {
			this.formErrors.desired_salary_period = 'Please select the salary period';
			this.isSubmitting = false;
			return;
		}

		this.response$ = this.dataService.preferences_put(
			this.user_form_id,
			this.preferencesModel
		);
		this.response$.subscribe(
			(response: Response) => {
				this.form.reset();
				const {
					employment_status,
					current_status,
					employment_type,
					desired_salary,
					desired_salary_period,
					benefits,
					locations,
					relocation: relocate,
					only_current_location,
					available_from,
					start_time,
					legal_usa
				} = this.preferencesModel;

				let relocation = relocate ? '1' : '0';

				this.form.patchValue({
					employment_status,
					current_status,
					employment_type,
					desired_salary,
					desired_salary_period,
					benefits,
					locations,
					relocation,
					available_from,
					start_time,
					legal_usa
				});

				this.messageService.sendMessage({
					action: 'UPDATE_SALARY'
				});
				this.response = response;
				this.analyticsService.emitEvent('Status And Preferences', 'Update', 'Desktop',this.user_form_id);
				this.onSuccessfulUpdate.emit(true);
				if (desiredSalary !== null) {
					this.preferencesModel.desired_salary = desiredSalary.replace(' ', '').replace('$', '').replace(/,/g, '');
				} else {
					this.preferencesModel.desired_salary = null;
				}

				TransformerService.transformPreferences(this.preferencesModel, 0);
				this.isSubmitting = false;
			}, error => {
				this.isSubmitting = false;
				this.handleErrors(error);
			}
		);
	}

	private prepareModel() {
		this.preferencesModel.employment_status = this.form.get('employment_status').value;
		this.preferencesModel.current_status = this.form.get('current_status').value;
		this.preferencesModel.employment_type = this.form.get('employment_type').value;
		this.preferencesModel.desired_salary = this.form.get('desired_salary').value.replace('$', '').replace(' ', '').replace(',', '').replace(/,/g, '');
		this.preferencesModel.desired_salary_period = this.form.get('desired_salary_period').value;
		this.preferencesModel.benefits = this.form.get('benefits').value;
		this.preferencesModel.only_current_location = this.form.get('relocation').value == true;
		this.preferencesModel.relocation = this.form.get('relocation').value == true;
		this.preferencesModel.available_from = this.form.get('available_from').value;
		this.preferencesModel.start_time = this.from;
		this.preferencesModel.legal_usa = this.form.get('legal_usa').value;
	}

	onLocationsChange(locations: models.Location[]) {
		this.preferencesModel.locations = locations;
		this.form.controls['locations'].markAsDirty();
	}

	onDatePickerToggle(event: Event) {
		if (this.datePickerOpened) {
			this.datePickerOpened = false;
		} else {
			let datePickerButton = event.currentTarget as HTMLElement;
			let position = this.getPosition(datePickerButton);
			this.datePickerTop = position.y + datePickerButton.offsetHeight;
			this.datePickerLeft = datePickerButton.offsetLeft + datePickerButton.offsetWidth - 300;
			this.datePickerOpened = true;
		}
	}

	availableFromChange(event: Event) {
		let value = (event.target as HTMLInputElement).value,
			timeToAdd;

		switch (value) {
			case 'immediately':
				timeToAdd = 0;
				break;
			case 'one week':
				timeToAdd = 7;
				break;
			case 'two weeks':
				timeToAdd = 14;
				break;
			case 'one month':
				timeToAdd = 30;
				break;
			case 'from':
				timeToAdd = null;
				break;
		}

		if (timeToAdd !== null) {
			this.from = moment().add(timeToAdd, 'days').format('YYYY-MM-DD hh:mm:ss');
		} else {
			this.from = moment().set('month', 0).format('YYYY-MM-DD hh:mm:ss');
		}
	}

	getPosition(element) {
		let xPosition = 0;
		let yPosition = 0;

		while (element) {
			xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
			yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
			element = element.offsetParent;
		}

		return {x: xPosition, y: yPosition};
	}

	setYearDate(year) {
		this.from = moment(year).format('YYYY-MM-DD hh:mm:ss');
		this.form.controls['start_time'].markAsDirty();
	}

	setMonthDate(month) {
		this.from = moment(month).format('YYYY-MM-DD hh:mm:ss');
		this.form.controls['start_time'].markAsDirty();
	}

	handleErrors(error) {
		let err_body = JSON.parse(error._body);
		if (error.status === 406) {
			for (let i = 0; i < err_body.message.length; i++) {
				this.formErrors[err_body.message[i].field] = err_body.message[i]['error'];
			}
		}

		if (error.status === 403 || error.status === 400) {
			this.formErrors['email'] = err_body.message;
		}
	}

	updateSalaryPeriod(e: Event) {
		this.form.patchValue({
			'desired_salary': ''
		});

		if (this.form.get('employment_type').value === 'part time') {
			this.salaryPeriods = ['H'];
			this.form.patchValue({
				'desired_salary_period': 'H'
			});
		} else {
			this.salaryPeriods = ['M', 'Y'];
			this.form.patchValue({
				'desired_salary_period': 'Y'
			});
		}
	}

	/*
	 * observeForm: Subscribe for changes in the FormGroup
	 */
	private observeForm() {
		this.form.get('current_status').valueChanges.subscribe(
			(data: extModels.UserPreferencesExt) => {
				if (!!data) {
					if (data.current_status === 'not looking' && this.form.controls['available_from'].enabled) {
						this.form.controls['available_from'].disable();
					} else if (data.current_status !== 'not looking' && !this.form.controls['available_from'].enabled) {
						this.form.controls['available_from'].enable();
					}
				}
			}
		);

		this.form.get('employment_type').valueChanges.subscribe(
			(data: extModels.UserPreferencesExt) => {
				if (!!data) {
					if (data.employment_type === 'full time') {
						this.salaryPeriods = ['H'];
					} else {
						this.salaryPeriods = ['M', 'Y'];
					}
				}
			}
		);
	}

	onStartTimeChange() {}
}

export interface FormErrors {
	employment_status: string;
	current_status: string;
	employment_type: string;
	desired_salary: string;
	desired_salary_period: string;
	benefits: string;
	available_from: string;
	start_time: string;
	legal_usa: string;
	only_current_location: string;
	relocation: string;
}
