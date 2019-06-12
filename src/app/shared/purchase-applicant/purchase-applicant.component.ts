import { Component, OnInit, Input, Output, EventEmitter,ViewChild } from '@angular/core';
import { Router } from '@angular/router';

// services:
//import { ContactApplicantComponent } from '../../form/contact-applicant/contact-applicant.component';
import { AuthService } from '../../rest/service/auth.service';
import { DataService } from '../../rest/service/data.service';
import { GrowlService } from '../../rest/service/growl.service';
import { AnalyticsService } from '../../services/analytics.service';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { CustomValidators } from 'ng2-validation';
// models:
import * as models from '../../rest/model/models';
import { Modal } from 'ngx-modal';
@Component({
	selector: 'app-purchase-applicant',
	templateUrl: './purchase-applicant.component.html',
	styleUrls: ['./purchase-applicant.component.css']
})
export class PurchaseApplicantComponent implements OnInit {
	contactApplicantForm: FormGroup;
	@Input() applicants: number[] = [];

	@Input() applicantCost: number = 1;

	@Output() onPurchase = new EventEmitter<OnPurchaseData>();

	@Output() onCancel = new EventEmitter<any>();
	@ViewChild('cnfmodel') cnfmodel: Modal;
	@Output() onUpdate = new EventEmitter();
	isSubmitting = false;
	public remainingCredits: any = null;

	private requesting: boolean;

	public submitting: boolean;

	public subscription: any = null;
	public fullname: string = '';
	public businessName: string = '';
	public userId: number;
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
	constructor(
	 public authService: AuthService, 
	 public dataService: DataService, 
	 private router: Router,
	 private analyticsService: AnalyticsService,
	 public formBuilder: FormBuilder
	 ) {
		this.dataService = dataService;
		this.authService = authService;
		this.analyticsService = analyticsService;
	}

	ngOnInit() {
		this.submitting = true;
		this.getBusinessBalance();
		this.getUserSubscription();
		this.fullname = this.authService.getItem('currentProfile').firstname + ' ' + this.authService.getItem('currentProfile').lastname;
		this.businessName = this.authService.getItem('currentBusiness').name;
		this.userId=this.applicants[0];
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

	confirmseb(event) {
		if(this.subscription && this.subscription.status == 'active'){
			this.submitting = true;
			this.cnfmodel.open();
		}else{
			this.submitrequest();
		}
		
	}
	actionOnOpen() {
		this.analyticsService.emitEvent('Contact Applicant', 'Open', 'Desktop');
	}

	actionOnClose() {
		this.onCancel.emit({data: null, event});
		this.cnfmodel.close();
	}

	actionOnSubmit() {

	}
	submitrequest(){
		this.submitting = true;

		this.applicants = this.applicants.map(value => {
			return value = Number(value);
		})

		this.dataService.purchase_applicants_post(this.authService.currentUser.business_id, this.applicants).subscribe(
			(response: models.PurchasedSuccess) => {
				this.submitting = false;

				this.applicants.forEach(value => {
					this.onPurchase.emit({
						data: {
							userId: value,
							remainingCredits: this.remainingCredits
						},
						event: event
					});
				})
				if (response.skipped.length) {
					GrowlService.message(`Purchase successful. ${response.skipped.length} applicants were already purchased and have not been charged for`, 'success');
				}
				else {
					GrowlService.message('Purchase successful', 'success');
				}
			},
			error => {
				this.submitting = false;

				GrowlService.message(JSON.parse(error._body).message, 'error');
			}
		)
	}
	addPackageRedirect() {
		this.router.navigate(['/business/account/package']);
	}

	cancel(event) {
		this.onCancel.emit({data: null, event});
	}
	onApplicantContact(e: Event) {
		this.analyticsService.emitEvent('Contact Applicant', 'Create', 'Desktop');
		this.cnfmodel.close();
	}
	getBusinessBalance() {
		this.requesting = true;
		this.dataService.credits_get(this.authService.currentUser.business_id).subscribe(
			response => {
				this.requesting = false;
				this.remainingCredits = Number.parseInt(response.left.toString());
			},
			error => {
				this.requesting = false;
				GrowlService.message(JSON.parse(error._body).message, 'error');
			}
		)
	}

	getUserSubscription(){
		this.applicants = this.applicants.map(value => {
			return value = Number(value);
		})
		this.dataService.subscription_get(this.applicants[0]).subscribe(
			(res:any) => {
				if(res.data){
					this.subscription = res.data.subscription;
					this.submitting = false;
				}else{
					this.submitting = false;
				}
			}
		);
	}
	getType(variable) {
		return typeof variable;
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
						//GrowlService.message('Your contact request was send to the applicant', 'success');
						this.hardreset();
						this.submitrequest();
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

export interface OnPurchaseData {
	data: {
		userId: number;
		remainingCredits: any;
	},
	event: Event;
}