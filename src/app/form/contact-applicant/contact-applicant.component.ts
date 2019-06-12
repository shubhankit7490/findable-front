import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';

import { DataService } from '../../rest/service/data.service';
import { GrowlService } from '../../rest/service/growl.service';
import { AnalyticsService } from '../../services/analytics.service';

import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { AuthService } from '../../rest/service/auth.service';

import { CustomValidators } from 'ng2-validation';

@Component({
	selector: 'app-contact-applicant',
	templateUrl: './contact-applicant.component.html',
	styleUrls: ['./contact-applicant.component.css']
})
export class ContactApplicantComponent implements OnInit {
	contactApplicantForm: FormGroup;
	@Input('userId') userId: number;

	@Input('fullname') fullname: string = '';
	@Input('businessName') businessName: string = '';

	@Output() onUpdate = new EventEmitter();
	isSubmitting = false;

	// Error messaging object
	public email: string = '';
	public phone: string = '';
	public controls: any = {
		fields: {
			fullname: 'Full name',
			company: 'Company',
			email: 'Email',
			phone: 'Phone',
			message: 'Message'
		},
		errors: {
			url: '{field} does not contain a valid url',
			required: '{field} field is required',
			email: '{field} contain invalid email address'
		},
		messages: {
			fullname: '',
			company: '',
			email: '',
			phone: '',
			message: '',
			global: ''
		}
	};

	constructor(public authService: AuthService, public dataService: DataService, public formBuilder: FormBuilder, public analyticsService: AnalyticsService) {
		this.dataService = dataService;
		this.authService = authService;
		this.analyticsService = analyticsService;
	}

	ngOnInit() {
		this.controls.messages = {
			fullname: '',
			company: '',
			email: '',
			phone: '',
			message: '',
			global: ''
		};
		this.email=this.authService.getItem('currentProfile').email;
		this.phone=this.authService.getItem('currentProfile').phone;
		this.contactApplicantForm = this.formBuilder.group({
			fullname: [this.fullname, Validators.required],
			email: [this.email, [Validators.required, CustomValidators.email]],
			company: ['', Validators.required],
			phone: [''],
			message: ['']
		});
	}

	/*
	 * validatex: A generic error validation function based on the mapping object (controls)
	 */
	validate(key?: string, slient?: Boolean) {
		let __v = 0;
		if (!key) {
			for (let c in this.contactApplicantForm.controls) {
				if (this.contactApplicantForm.controls.hasOwnProperty(c) && !this.contactApplicantForm.controls[c].valid) {
					for (let e in this.contactApplicantForm.controls[c].errors) {
						if (this.contactApplicantForm.controls[c].errors.hasOwnProperty(e) && this.controls.errors.hasOwnProperty(e)) {
							if (!slient) {
								this.controls.messages[c] = this.controls.errors[e].replace('{field}', this.controls.fields[c]);
							}
							__v++;
							break;
						}
					}
				} else {
					this.controls.messages[c] = '';
				}
			}
		} else {
			if (!this.contactApplicantForm.controls[key].valid) {
				for (let e in this.contactApplicantForm.controls[key].errors) {
					if (this.contactApplicantForm.controls[key].errors.hasOwnProperty(e) && this.controls.errors.hasOwnProperty(e)) {
						if (!slient) {
							this.controls.messages[key] = this.controls.errors[e].replace('{field}', this.controls.fields[key]);
						}
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

	onSubmit(e: Event) {
		e.preventDefault();
		e.stopPropagation();

		if (this.validate()) {
			this.isSubmitting = true;
			let fullname = this.contactApplicantForm.value.fullname;
			let company = this.contactApplicantForm.value.company;
			let email = this.contactApplicantForm.value.email;
			let phone = this.contactApplicantForm.value.phone;
			let message = this.contactApplicantForm.value.message;

			this.dataService.send_contact_request(this.userId, fullname, company, email, phone, message).subscribe(
				response => {
					if (response.status) {
						this.onUpdate.emit(e);
						GrowlService.message('Your contact request was send to the applicant', 'success');
						this.hardreset();
					} else {
						GrowlService.message('Failed to send your contact request', 'success');
					}

					this.isSubmitting = false;
				},
				error => {
					this.isSubmitting = false;
					this.handleErrors(error);
				}
			);
		}
	}

	hardreset() {
		this.contactApplicantForm.reset();
		this.controls.messages = {
			fullname: '',
			company: '',
			email: '',
			phone: '',
			message: '',
			global: ''
		};
	}
}
