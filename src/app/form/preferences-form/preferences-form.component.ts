import { Component, OnInit, Input, Output, ViewChild, EventEmitter, ElementRef,OnChanges,SimpleChanges } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import createNumberMask from 'text-mask-addons/dist/createNumberMask';
import { AutoComplete } from 'interjet-primeng/components/autocomplete/autocomplete';
// services:
import { MessageService } from '../../services/message.service';
import { DataService } from '../../rest/service/data.service';
import { AuthService } from '../../rest/service/auth.service';
import { AnalyticsService } from '../../services/analytics.service';
import { TransformerService } from '../../rest/service/transformer.service';
import { Router, ActivatedRoute } from '@angular/router';
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
declare var CKEDITOR: any;
@Component({
	selector: 'app-preferences-form',
	templateUrl: './preferences-form.component.html',
	styleUrls: ['./preferences-form.component.css']
})
export class PreferencesFormComponent implements OnInit,OnChanges{
	config: any;
  	mycontent: string;
  	log: string = '';

	@Input() preferences: Observable<extModels.UserPreferencesExt>;
	@Input() user_id:number=0;
	@Input() user_status:string=null;
	@Input() prefrence:string=null;
	@ViewChild('jobtitle') jobTitleInput: AutoComplete;
	@ViewChild('locationOfInteresetComponent') locationOfInteresetComponent: LocationsFormComponent;
	@ViewChild('fld_pref_start_time_date_picker') datePickerContainer: ElementRef;
	@Output() onSuccessfulUpdate = new EventEmitter<boolean>();
	recentJob: models.Position;
	public sendModelExperience: models.Position = {};
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
	public notdes:string=''
	public requestingJobtitle = false;
	public previous_status: Boolean= false;;
	public resultsJobtitle: models.DictionaryItem[];
	private setModelJobTitle: models.JobTitle = {
		id: null,
		name: ''
	};
	public setModelSeniority: models.Seniority;
	public seniorities: models.Seniority[] = [
		{ id: 1,  name: 'Unpaid'	  	},
		{ id: 2,  name: 'Internship'	},
		{ id: 3,  name: 'Entry'	  		},
		{ id: 4,  name: 'Associate'	  },
		{ id: 5,  name: 'Junior'	  	},
		{ id: 6,  name: 'Senior'	  	},
		{ id: 7,  name: 'Manager'	  	},
		{ id: 8,  name: 'Director'	  },
		{ id: 9,  name: 'VP'	  	  },
		{ id: 10, name: 'President'	  },
		{ id: 11, name: 'Partner'	  	},
		{ id: 12, name: 'Owner'	  		},
		{ id: 13, name: 'Founder'	  	},
		{ id: 14, name: 'Nonmanager'	 },
		{ id: 15, name: 'Management'	  	}
	];
	// Form state
	public datePickerOpened = false;
	public datePickerTop = 1;
	public datePickerLeft = 1;
	public searchTermJobTitle: string;
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
	public editorinstance:any='';
	public mask: Array<string | RegExp>;
	private opened = false;
	private user_form_id:number=0;
	public type_data=[] ;
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
		relocation: '',
		jobTitle: '',
		seniority: '',
		type:'',
		status:'',
		text:''
	};

	constructor(
		public dataService: DataService,
		public authService: AuthService,
		formBuilder: FormBuilder,
		public messageService: MessageService,
		public analyticsService: AnalyticsService,
		private router: Router
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
			legal_usa: 						 [ '' ],
			jobTitle: 						 [ '', Validators.required ],
			seniority:[ '', Validators.required ],
			type:[''],
			status:[''],
			text:[''],
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
			//CKEDITOR.replace( 'editor1' );
			/*if(window.CKEDITOR) {
		           window.CKEDITOR.replace('editor1');
		       }*/

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
		if(this.prefrence=='edit'){
			this.dataService.user_note_get(this.user_id).subscribe(
				(response:any) => {
					this.form.patchValue({
					'text': response.note,
					'type':response.type,
					});
					if(response.note == undefined) {
						this.form.patchValue({
						'text': '',
						'type':'Personal',
						});
					}
					for(var name in CKEDITOR.instances)
					{
						CKEDITOR.instances[name].destroy();
					}
						setTimeout(()=>{ 
							this.editorinstance =CKEDITOR.replace('notdes');
							var editorins=this.editorinstance.name;
							if(response.note == undefined) {
								CKEDITOR.instances[editorins].setData(''); 
							}else{
								CKEDITOR.instances[editorins].setData(response.note); 
							}
						 }, 500);	
					},
			
			);
			// get recent job for client
			this.dataService.recentJob_get(this.user_id).subscribe(
				(response:any) => {
					this.recentJob = response[0];
						console.log(this.recentJob.seniority);
						let id = Number(this.recentJob.seniority.id);
						let name = this.recentJob.seniority.name;
						let jobTitle=this.recentJob.job_title.name;
						this.setModelSeniority = { id, name };
						this.form.patchValue({
						'seniority':id,
						 'jobTitle':jobTitle
						});
						this.searchTermJobTitle=jobTitle;
						this.sendModelExperience.id=this.recentJob.id;
						this.sendModelExperience.company = this.recentJob.company;
						this.sendModelExperience.location = this.recentJob.location;
						this.sendModelExperience.industry = this.recentJob.industry;
						this.sendModelExperience.type = this.recentJob.type;
						this.sendModelExperience.areas_of_focus = this.recentJob.areas_of_focus;
						this.sendModelExperience.salary =this.recentJob.salary;
						this.sendModelExperience.to =this.recentJob.to;
						this.sendModelExperience.from = this.recentJob.from;
						this.sendModelExperience.current = this.recentJob.current;
						this.sendModelExperience.salary_period = this.recentJob.salary_period;
						this.setModelJobTitle=  this.recentJob.job_title;
						this.setModelSeniority=  this.recentJob.seniority;
				}
			);
			if(this.user_status=='short'){
				this.previous_status=true;
				this.form.patchValue({
						'status':true,
						});
			}else{
				this.previous_status=false;
				this.form.patchValue({
						'status':false,
				});
			}
		}
	}
	ngOnInit() {
		/*if(CKEDITOR.instances['editor1']){
				console.log('df');
				CKEDITOR.instances['editor1'].destroy();
		}*/
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
		if(this.authService.currentUser.role=='manager'){
			this.type_data=['Personal','Personal & Share'] ;
		}else{
			this.type_data=['Personal','Share with recruiters','Personal & Share'] ;
		}
		this.config = {
		   allowedContent: false,
		    forcePasteAsPlainText: true
		};

	}
	onPaste($event: any): void {
    	console.log("onPaste");
    //this.log += new Date() + "<br />";
  	}
  	onChange($event: any): void {
    	console.log("onChange");
    //this.log += new Date() + "<br />";
 	 }
 	public close(){
 		/*CKEDITOR.instances['editor1'].destroy();
 		//CKEDITOR.replace('body');
 		location.reload();*/
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
			relocation: '',
			jobTitle:'',
			seniority: '',
			status:'',
			type:'',
			text:'',
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
				setTimeout(function () {
					this.onSuccessfulUpdate.emit(true);
				}.bind(this), 500);

				if (desiredSalary !== null) {
					this.preferencesModel.desired_salary = desiredSalary.replace(' ', '').replace('$', '').replace(/,/g, '');
				} else {
					this.preferencesModel.desired_salary = null;
				}

				TransformerService.transformPreferences(this.preferencesModel, 0);
				this.isSubmitting = false;
				if(this.prefrence=='edit'){
					this.updateusernote();
					this.updateuserexp();
					if(this.previous_status!=this.form.get('status').value){
						this.updatestatus();
					}
				}
				this.form.reset();
			}, error => {
				this.isSubmitting = false;
				this.handleErrors(error);
			}
		);
	}
	private updateuserexp(){
		this.sendModelExperience.job_title = this.setModelJobTitle;
		this.sendModelExperience.seniority = this.setModelSeniority;
		this.dataService.experience_put(this.user_id, this.sendModelExperience.id, this.sendModelExperience).subscribe(
			(response: Response) => {
			}
		);
	}
	private updatestatus(){
			if(this.form.get('status').value){
				var current_status='short';
			}else{
				var current_status='null';
			}
			this.dataService.user_status_put(this.user_id, current_status).subscribe(
            response => {
               // this.onStatusChanged.emit()
            },
            error => {
                //this.error = error.message;
            },
            () => {
                //this.submitting = false;
            }
        )
	}
	private updateusernote(){
		var data=CKEDITOR.instances[this.editorinstance.name].getData();
		if(data!=''){
			this.dataService.user_note_put(this.user_id,data,this.form.get('type').value).subscribe(
				response => {

				}
			);
		}
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
	public onSelectSeniority(event: Event): void {
		let id = Number((event.target as HTMLInputElement).value);
		let name = (event.target as HTMLSelectElement)
			.options[(event.target as HTMLSelectElement).selectedIndex].text;
		this.setModelSeniority = { id, name };
		console.log(this.setModelSeniority);
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

	UpdateJobtitleState(event) {
		let _e = event.srcElement || event.target;

		if (_e.value.length > 0) {
			this.form.controls['jobTitle'].markAsDirty();
		} else {
			this.form.patchValue({
				'jobTitle': ''
			});
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
	validateJobTitle(element) {
		setTimeout(function () {
			this.jobTitleInput.hide();
		}.bind(this), 200);

		this.form.patchValue({
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
	onSelectJobtitleAutoComplete(e) {
		console.log('form',this.form.value);
		this.form.patchValue({
			jobTitle: e.name
		});
		this.setModelJobTitle = e;
		this.formErrors['job_title'] = '';

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
	jobTitle:string;
	seniority: string,
	type:string,
	status:string,
	text:string,
}
