import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { ModalModule } from 'ngx-modal';
import { ConfirmOptions, Position } from 'angular2-bootstrap-confirm';
import { Positioning } from '@ng-bootstrap/ng-bootstrap/util/positioning';

// services:
import { AuthService } from '../../rest/service/auth.service';
import { DataService } from '../../rest/service/data.service';
import { AnalyticsService } from '../../services/analytics.service';
import { TourService } from '../../services/tour.service';

// models:
import * as models from '../../rest/model/models';

declare let moment: any;

@Component({
	selector: 'app-education-modal',
	templateUrl: './education-modal.component.html',
	styleUrls: ['./education-modal.component.css'],
	providers: [
		ConfirmOptions,
		{ provide: Position, useClass: Positioning }
	]
})
export class EducationModalComponent implements OnInit {
	@ViewChild('educationModal') modal: any;
	@ViewChild('schoolName') schoolName;
	@Input() educationClear: models.ExistingEducation[];
	@Input() enumsData: any;
	@Output() updateEducation = new EventEmitter<boolean>();
	@Output() onClose = new EventEmitter<any>();
	selectedEducation: models.ExistingEducation = {
		id: null,
		school_id: null,
		name: '',
		from: null,
		to: null,
		current: false,
		level: null,
		fields: []
	};
	educationGroup: FormGroup;
	sendModelEducation: models.ExistingEducation = {
		id: null,
		school_id: null,
		name: '',
		from: null,
		to: null,
		current: false,
		level: null,
		fields: []
	};
	fields: models.StudyField[];
	checkbox: boolean;
	indexOfLevel: number;
	newEducation = false;
	showStartDatePickerFrom = false;
	showStartDatePickerTo = false;
	setId;
	from: string;
	to: string;
	public isSubmitting: boolean;
	public searchTerm: string;
	public formErrors: FormErrors = {
		name: '',
		from: '',
		to: '',
		current: '',
		level: '',
		global: '',
		success: ''
	};
	public now: Date;
	public results: models.DictionaryItem[];
	public requesting = false;
	public dictionaryIndexed = true;
	public updateMode = false;

	/* Confirm Parameters */
	public title = 'Deleting Item';
	public message = 'Please confirm you want to delete this item';
	public confirmClicked = false;
	public cancelClicked = false;
	public isOpen = false;

	constructor(
		public authService: AuthService,
		public dataService: DataService,
		public formBuilder: FormBuilder,
		public modalModule: ModalModule,
		public analyticsService: AnalyticsService,
		public tourService:TourService
	) {
		this.educationGroup = this.formBuilder.group({
			name: ['', Validators.required],
			from: [''],
			to: [''],
			current: [false],
			level: ['', Validators.required]
		});
		this.now = new Date();
	}

	ngOnInit() {
		this.addEducation();
	}

	onChangeLevel(level) {
		let levelEducation = this.enumsData.filter((item: models.EducationLevel) => item.id === level);
		this.sendModelEducation.level = levelEducation[0];
	}

	onChangeCurrent(current: boolean) {
		this.sendModelEducation.current = current;
		this.educationGroup.patchValue({ current });
	}

	setYearDate(year: Date) {
		if (!this.from) {
			this.from = moment().year(new Date(year).getFullYear()).format('YYYY-MM-DD hh:mm:ss');
		} else {
			this.from = moment(this.sendModelEducation.from).year(new Date(year).getFullYear()).format('YYYY-MM-DD hh:mm:ss');
		}

		if (this.from !== this.sendModelEducation.from) {
			this.educationGroup.controls['from'].markAsDirty();
		}
		this.sendModelEducation.from = this.from;
	}

	setMonthDate(month) {
		if (!this.from) {
			this.from = moment().month(new Date(month).getMonth()).format('YYYY-MM-DD hh:mm:ss');
		} else {
			this.from = moment(this.sendModelEducation.from).month(new Date(month).getMonth()).format('YYYY-MM-DD hh:mm:ss');
		}

		if (this.from !== this.sendModelEducation.from) {
			this.educationGroup.controls['from'].markAsDirty();
		}
		this.sendModelEducation.from = this.from;
	}

	setYearDateTo(year) {
		if (!this.to) {
			this.to = moment().year(new Date(year).getFullYear()).format('YYYY-MM-DD hh:mm:ss');
		} else {
			this.to = moment(this.sendModelEducation.to).year(new Date(year).getFullYear()).format('YYYY-MM-DD hh:mm:ss');
		}

		if (this.to !== this.sendModelEducation.to) {
			this.educationGroup.controls['to'].markAsDirty();
		}
		this.sendModelEducation.to = this.to;
	}

	setMonthDateTo(month) {
		if (!this.to) {
			this.to = moment().month(new Date(month).getMonth()).format('YYYY-MM-DD hh:mm:ss');
		} else {
			this.to = moment(this.sendModelEducation.to).month(new Date(month).getMonth()).format('YYYY-MM-DD hh:mm:ss');
		}

		if (this.to !== this.sendModelEducation.to) {
			this.educationGroup.controls['to'].markAsDirty();
		}
		this.sendModelEducation.to = this.to;
	}

	edit(id) {
		this.setId = id;

		this.selectedEducation = this.educationClear.filter((item: models.ExistingEducation): boolean => item.id === id)[0];

		this.indexOfLevel = this.selectedEducation.level.id;
		let levelEducation = this.selectedEducation.level;
		if (this.selectedEducation.current === true) {
			this.checkbox = true;
		} else {
			this.checkbox = false;
		}
		this.fields = this.selectedEducation.fields;
		this.from = this.selectedEducation.from;
		this.to = this.selectedEducation.to;

		this.educationGroup.reset();
		this.educationGroup.setValue({
			name: this.selectedEducation.name,
			from: this.from,
			to: this.to,
			current: this.checkbox,
			level: this.indexOfLevel
		});

		this.formErrors = {
			name: '',
			from: '',
			to: '',
			current: '',
			level: '',
			global: '',
			success: ''
		};

		this.sendModelEducation = {
			id: id,
			name: this.selectedEducation.name,
			school_id: this.selectedEducation.school_id,
			from: this.from,
			to: this.selectedEducation.to,
			current: this.checkbox,
			level: levelEducation,
			fields: this.selectedEducation.fields
		};
		this.updateMode = true;
	}

	onFieldsEdit(fields) {
		let Modelfields = fields;
		this.sendModelEducation.fields = Modelfields;
		this.educationGroup.controls['level'].markAsDirty(); // Mark the level as a dirty form control to enable the save button
	}

	UpdateSchoolName(event) {
		let _e = event.srcElement || event.target;
		if (_e.value.length > 0) {
			this.educationGroup.controls['name'].markAsDirty();
		} else {
			this.educationGroup.patchValue({
				'name': ''
			});
		}
	}

	validateSchoolName(event) {
		setTimeout(function () {
			this.schoolName.hide();
		}.bind(this), 200);

		this.educationGroup.patchValue({
			'name': event.target.value
		});

		this.sendModelEducation.name = event.target.value;

		if (!event.target.value) {
			this.formErrors['name'] = 'Please type or choose a school name';
		} else {
			this.formErrors['name'] = '';
		}
	}

	delete(id) {
		this.isSubmitting = true;

		let deleteEducation = this.dataService.education_delete(this.authService.getUserId(), id);
		deleteEducation.subscribe(response => {
			this.analyticsService.emitEvent('Education', 'Delete', 'Desktop', this.authService.currentUser.user_id);
			this.updateEducation.emit(true);
			this.formErrors['success'] = 'Successfully deleted the education place';

			setTimeout(function () {
				this.formErrors['success'] = '';
			}.bind(this), 3000);

			this.isSubmitting = false;
		});
		this.fields = [];
		this.educationGroup.reset();
		this.educationGroup.setValue({
			name: '',
			from: '',
			to: '',
			current: false,
			level: '',
		});
		this.onChangeCurrent(false);

		this.setId = '';
		this.from = null;
		this.to = null;
		this.updateMode = false;
	}

	addEducation() {
		this.from = null;
		this.to = null;

		this.educationGroup.reset();
		this.educationGroup.setValue({
			name: '',
			from: '',
			to: '',
			current: false,
			level: ''
		});
		this.onChangeCurrent(false);

		this.formErrors = {
			name: '',
			from: '',
			to: '',
			current: '',
			level: '',
			global: '',
			success: ''
		};

		this.fields = [];
		this.newEducation = true;
		this.setId = '';
		this.updateMode = false;
	}

	handleErrors(error) {
		let err_body = JSON.parse(error._body);
		if (error.status === 406) {
			for (let i = 0; i < err_body.message.length; i++) {
				this.formErrors[err_body.message[i].field] = err_body.message[i]['error'];
			}
		}

		if (error.status === 403 || error.status === 400) {
			this.formErrors['global'] = err_body.message;
		}
	}

	onSubmit(e: Event, closeAfter = false) {
		let isInValid = false; 
		if (!this.from) {
			this.formErrors.from = 'Start date required';
			isInValid = true;
		}
		if (!this.educationGroup.value.current && !this.to) {
			this.formErrors.to = 'End date required';
			isInValid = true;
		}
		if (isInValid) return;

		e.preventDefault();
		this.isSubmitting = true;
		this.dictionaryIndexed = true;
		
		this.sendModelEducation.from = this.from;
		this.sendModelEducation.to = this.to;

		if (this.sendModelEducation.name.length > 0 && this.sendModelEducation.school_id === null) {
			this.dictionaryIndexed = false;
			this.dataService.dictionary_school_post(this.sendModelEducation.name).subscribe(
				response => {
					this.sendModelEducation.school_id = response.id;
					this.isSubmitting = false;
					this.onSubmit(e, closeAfter);
				},
				error => {
					this.handleErrors(error);
				}
			);
		}

		this.formErrors = {
			name: '',
			from: '',
			to: '',
			current: '',
			level: '',
			global: '',
			success: ''
		};

		if (this.dictionaryIndexed) {
			if (this.updateMode) {
				this.dataService.education_put(this.authService.getUserId(), this.sendModelEducation.id, this.sendModelEducation).subscribe(
					response => {
						this.analyticsService.emitEvent('Education', 'Update', 'Desktop', this.authService.currentUser.user_id);
						this.isSubmitting = false;
						this.updateEducation.emit(true);
						this.formErrors['success'] = 'Successfully updated the education place';

						setTimeout(function () {
							this.formErrors['success'] = '';
						}.bind(this), 3000);

						this.isSubmitting = false;

						if (closeAfter) {
							this.closeModal(e);
						}
					},
					error => {
						this.isSubmitting = false;
						this.handleErrors(error);
					}
				);
			} else {
				this.dataService.education_post(this.authService.getUserId(), this.sendModelEducation).subscribe(
					response => {
						this.analyticsService.emitEvent('Education', 'Create', 'Desktop', this.authService.currentUser.user_id);
						this.updateEducation.emit(true);
						this.formErrors['success'] = 'Successfully added a new education place';

						setTimeout(function () {
							this.formErrors['success'] = '';
						}.bind(this), 3000);

						this.isSubmitting = false;
						this.hardreset();

						if (closeAfter) {
							this.closeModal(e);
						}
					},
					error => {
						this.isSubmitting = false;
						this.handleErrors(error);
					}
				);
			}
		}
	}

	saveAndClose(e: Event) {
		if (this.educationGroup.dirty) {
			this.onSubmit(e, true);
		} else {
			this.closeModal(e);
		}
	}

	closeModal(e: Event) {
		if (this.tourService.shown) {
			if (this.educationClear.length > 0) {
				this.tourService.initSection(e);
			} else {
				this.tourService.sleep();
			}
		}

		this.onClose.emit(true);
	}

	clearFields() {
		this.fields = [];
		this.educationGroup.reset();
		this.educationGroup.setValue({
			'name': '',
			'from': '',
			'to': '',
			'current': false,
			'level': '',
		});
	}

	validateEducationFields(): any {
		if (new Date(this.sendModelEducation.to) > new Date(this.sendModelEducation.from)) {
			this.formErrors['to'] = 'Start date is greater then end date';
			return false;
		}

		return true;
	}

	search(event) {
		this.sendModelEducation.name = event.query;
		this.sendModelEducation.school_id = null;

		if (!event.query.length) {
			return;
		}

		this.requesting = true;
		this.dataService.dictionary_schools_get('schools', event.query).subscribe(
			response => {
				this.results = response;
				this.requesting = false;
			}
		);
	}

	validateLevel(event) {
		if (!event.target.value) {
			this.formErrors['level'] = 'Please select an Education level';
		}
	}

	onSelectAutoComplete(e) {
		this.educationGroup.patchValue({
			'name': e.name
		});

		this.sendModelEducation.school_id = e.id;
		this.sendModelEducation.name = e.name;
	}

	hardreset() {
		this.fields = [];
		this.educationGroup.reset();
		this.to = null;
		this.from = null;
		this.sendModelEducation = {
			id: null,
			school_id: null,
			name: '',
			from: null,
			to: null,
			current: false,
			level: null,
			fields: []
		};
	}
}

interface FormErrors {
	name: string;
	from: string;
	to: string;
	current: string;
	level: string;
	global: string;
	success: string;
}
