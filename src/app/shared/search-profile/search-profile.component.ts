import { Component, OnInit, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { DataService } from '../../rest/service/data.service';
import { AuthService } from '../../rest/service/auth.service';
import { AnalyticsService } from '../../services/analytics.service';

import { ContactApplicantComponent } from '../../form/contact-applicant/contact-applicant.component';

import { PersonalDetails } from "../../rest/model/PersonalDetails";
import { MessageService } from '../../services/message.service';
import { GrowlService } from '../../rest/service/growl.service';
import { Modal } from 'ngx-modal';

import { FormGroup, Validators, FormBuilder } from '@angular/forms';

import * as models from '../../rest/model/models';

@Component({
	selector: 'app-search-profile',
	templateUrl: 'search-profile.component.html',
	styleUrls: ['search-profile.component.css']
})
export class SearchProfileComponent implements OnInit {
	contactApplicantForm: FormGroup;
	@Input() userId: number;
	@Input() displayright: number;
	@Input() creator_id:any;
	@Input() display_edit:any=0;
	@Output() onLoaded = new EventEmitter<any>();
	@Output() setprofilevalue= new EventEmitter<any>();
	@ViewChild('contactApplicant') contactModal: Modal;
	@ViewChild('EmailVerification') email_verification: Modal;
	// aboutMe: Observable<extModels.AboutMeExt>;
	// responseObs: Observable<Response>;
	public profile;
	public profile_data;
	public aboutShown: Boolean;
	public seeFullDetails = false;
	public aboutMeLength: number = 0;
	public profileSubscribe: PersonalDetails;
	private updateAboutMe: PersonalDetails;
	private anon = true;
	public submitting: boolean;
	public subscription: any = null;
	public fullname: string = '';
	public businessName: string = '';
	public see_subscription_model = true;
	public login_user_id:number;
	isSubmitting = false;
	public controls: any = {
		fields: {
			message: 'Message',
		},
		errors: {
			url: '{field} does not contain a valid url',
			required: '{field} field is required',
			message: '{field} field is required',
		},
		messages: {
			email: '',	
		}
	};
	constructor(
		public dataService: DataService,
		public authService: AuthService,
		public messageService: MessageService,
		private analyticsService: AnalyticsService,
		public formBuilder: FormBuilder
	) {	}

	ngOnInit() {
		this.login_user_id=this.authService.getUserId();
		this.profileGetRequest();
		this.aboutShown = false;
		this.anon = (!!this.authService.isLoggedIn && (this.userId != this.authService.getUserId()));
		this.getUserSubscription();
		this.setBusinessInfo();
		this.setUserPurchasedInfo();
		this.contactApplicantForm = this.formBuilder.group({
			message: ['', Validators.required]
		});
	}

	profileGetRequest() {
		if(this.display_edit=='true'){

			var showprofile=1;
		}else{
			var showprofile=0;
		}
		console.log(showprofile);
		console.log(this.display_edit);
		this.profile = this.dataService.profile_get(this.userId,showprofile);
		this.profile.subscribe((data:any) => {
			this.profileSubscribe = data;
			if (!!data.about) {
				this.aboutMeLength = (!!data.about.length) ? 300 - data.about.length : 300;
			} else {
				this.aboutMeLength = 300;
			}

			if(data.firstname && !!data.firstname.length) {
					this.seeFullDetails = true;
			}

			this.onLoaded.emit(true);
			this.setprofilevalue.emit(this.profileSubscribe);
		},
		error => {
			this.onLoaded.emit(false);
		});
	}
	sendemail(){
		if(this.profileSubscribe.is_google_auth==0){
			this.email_verification.open();
		}else{
			this.submitrequest('create auth');
		}
	}
	/**
	 * Upload Resume should open
	 */
	openemailverification() {

		this.email_verification.open();
	}

	/**
	 * Upload Resume should close
	 */
	closeemailverification() {
		this.isSubmitting = false;
		this.email_verification.close();
		// does not refresh page, as long as url route is already on here
		// will change it but not refresh when uploadResume=true param exists
		//this.router.navigate(['/dashboard']);
	}


	personalDetailsAboutUpdate(data) {
		this.updateAboutMe = {
			firstname: this.profileSubscribe.firstname,
			lastname: this.profileSubscribe.lastname,
			email: this.profileSubscribe.email,
			phone: this.profileSubscribe.phone,
			skype: this.profileSubscribe.skype,
			website: this.profileSubscribe.website,
			location: this.profileSubscribe.location,
			image: this.profileSubscribe.image,
			about: data,
			gender: this.profileSubscribe.gender,
			birthday: this.profileSubscribe.birthday
		}

		this.aboutMeLength = 300 - data.length;

		this.profileSubscribe.about = data;

		this.dataService.personal_details_put(this.userId, this.updateAboutMe).subscribe(
			(response:any) => {
				if (response) {
					this.profileGetRequest();
				}
			},
			error => {
				alert(error);
			}
		);
	}

	onContactClick(event) {
		this.messageService.sendMessage({
				action: 'CONTACT_APPLICANT',
				data: this.userId
			});
		//this.contactModal.open();
	/*	if(this.subscription && this.subscription.status == 'active'){
			//this.contactModal.open();
			// Pop the contact form
			if(this.see_subscription_model){
				this.contactModal.open();
			}else{
				this.messageService.sendMessage({
				action: 'CONTACT_APPLICANT',
				data: this.userId
			});
			}
			
		} else {
			this.messageService.sendMessage({
				action: 'CONTACT_APPLICANT',
				data: this.userId
			});
		}*/
	}


	getUserSubscription(){
		this.dataService.subscription_get(this.userId).subscribe(
			(res:any) => {
				if(res.data){
					this.subscription = res.data.subscription;
				}
			}
		);
	}
	
	setBusinessInfo(){
		this.fullname = this.authService.getItem('currentProfile').firstname + ' ' + this.authService.getItem('currentProfile').lastname;
		this.businessName = this.authService.getItem('currentBusiness').name;
	}
	setUserPurchasedInfo(){
		this.dataService.purches_get(this.userId).subscribe(
			(res:any) => {
				if(res.status){
					this.see_subscription_model=false;
				}
				
			}
		);
	}
	showAbout(e: Event, elem): void {
		if (!this.aboutShown) {
			elem.style.height = 'auto';
		} else {
			elem.style.height = '60px';
		}

		this.aboutShown = !this.aboutShown;
	}

	redirect(url = '', n?: boolean) {
		window['redirect'](url, n);
	}


	actionOnOpen() {
		this.analyticsService.emitEvent('Contact Applicant', 'Open', 'Desktop');
	}

	actionOnClose() {
		this.contactModal.close();
	}

	actionOnSubmit() {

	}

	onApplicantContact(e: Event) {
		this.analyticsService.emitEvent('Contact Applicant', 'Create', 'Desktop');
		this.contactModal.close();
	}
	onSubmit(e: Event) {
		//e.preventDefault();
		//e.stopPropagation();
		if (this.validate()) {
			this.isSubmitting = true;
			let message = this.contactApplicantForm.value.message;
		//this.onUpdate.emit(e);
		//GrowlService.message('Your contact request was send to the applicant', 'success');
		this.hardreset();
		this.submitrequest(message);
		}
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
						console.log(this.controls.errors.hasOwnProperty(e));
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

	hardreset() {
		this.contactApplicantForm.reset();
		this.controls.messages = {
			email: '',
		};
	}
	submitrequest(message){
		this.submitting = true;


		this.dataService.send_email_applicant(message,this.userId).subscribe(
			(res:any) => {
				if(res.status==1){
					window['redirect'](res.authurl,false);
				}else if(res.status==2){
					this.isSubmitting = false;
					this.closeemailverification();
					GrowlService.message(res.msg, 'success');
				}
				
			},
			error => {
				this.isSubmitting = false;
				this.submitting = false;

				GrowlService.message(JSON.parse(error._body).message, 'error');
			}
		)
	}
}
