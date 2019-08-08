import { Component, OnInit, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { DataService } from '../../rest/service/data.service';
import { AuthService } from '../../rest/service/auth.service';
import { AnalyticsService } from '../../services/analytics.service';

import { ContactApplicantComponent } from '../../form/contact-applicant/contact-applicant.component';

import { PersonalDetails } from "../../rest/model/PersonalDetails";
import { MessageService } from '../../services/message.service';

import { Modal } from 'ngx-modal';

@Component({
	selector: 'app-search-profile',
	templateUrl: 'search-profile.component.html',
	styleUrls: ['search-profile.component.css']
})
export class SearchProfileComponent implements OnInit {
	@Input() userId: number;
	@Input() displayright: number;
	@Input() creator_id:any;
	@Output() onLoaded = new EventEmitter<any>();
	@Output() setprofilevalue= new EventEmitter<any>();
	@ViewChild('contactApplicant') contactModal: Modal;

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

	public subscription: any = null;
	public fullname: string = '';
	public businessName: string = '';
	public see_subscription_model = true;
	public login_user_id:number;
	constructor(
		public dataService: DataService,
		public authService: AuthService,
		public messageService: MessageService,
		private analyticsService: AnalyticsService
	) {	}

	ngOnInit() {
		this.login_user_id=this.authService.getUserId();
		this.profileGetRequest();
		this.aboutShown = false;
		this.anon = (!!this.authService.isLoggedIn && (this.userId != this.authService.getUserId()));
		this.getUserSubscription();
		this.setBusinessInfo();
		this.setUserPurchasedInfo();
	}

	profileGetRequest() {
		console.log('@search-profile > profileGetRequest');
		this.profile = this.dataService.profile_get(this.userId);
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
}
