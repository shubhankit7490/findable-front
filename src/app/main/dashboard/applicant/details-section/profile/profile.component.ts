
import { MessageService } from '../../../../../services/message.service';
import {
	Component,
	OnInit,
	AfterViewInit,
	Input,
	ViewChild,
} from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Response } from '@angular/http';
import { Modal } from 'ngx-modal';

// services:
import { DataService } from '../../../../../rest/service/data.service';
import { AuthService } from '../../../../../rest/service/auth.service';
import { AnalyticsService } from '../../../../../services/analytics.service';
import { TransformerService } from '../../../../../rest/service/transformer.service';

// models:
import * as extModels from '../../../../../rest/service/extended-models/extended-models';
import * as models from '../../../../../rest/model/models';
import { PersonalDetails } from '../../../../../rest/model/PersonalDetails';
import { isNull } from 'util';

@Component({
	selector: 'app-profile',
	templateUrl: 'profile.component.html',
	styleUrls: ['profile.component.css']
})
export class ProfileComponent implements OnInit, AfterViewInit {
	@Input() userId: number;
	@ViewChild('aboutMeModal') modal: Modal;
	@ViewChild('contactApplicantModal') contactModal: Modal;
	aboutMe: Observable<extModels.AboutMeExt>;
	profile: Observable<any>;
	responseObs: Observable<Response>;
	profileSubscribe: PersonalDetails;
	updateAboutMe: PersonalDetails;
	aboutShown: boolean;
	aboutMeLength: number = 0;
	anon = true;
	seeFullDetails = false;
	public isFetching: boolean = false;
	public resumeExists: boolean = false;
	public gettingResume: boolean = true;
	public resumeFileType: string = '';
	public blob: Blob = null;
	public currentUserAutenticated: boolean = false;
	private isLoggedIn: boolean = false;
	public contact_applicant: boolean = true;
	constructor(
		private dataService: DataService,
		private authService: AuthService,
		private messageService: MessageService,
		private analyticsService: AnalyticsService,
	) {

		this.messageService.getMessage().subscribe(
			response => {
				if (response.action == 'UPDATE_USER_PROFILE') {
					this.profileGetRequest();
				}
			}
		);

	}

	ngOnInit() {
		this.profileGetRequest();
		this.setUserPurchasedInfo();
		this.aboutShown = false;
		this.userId = !!this.userId ? this.userId : this.authService.currentUser.user_id;
		this.isLoggedIn = this.authService.isLoggedIn;

		let user_id = this.authService.getUserId();

		this.currentUserAutenticated = this.userId === user_id && this.isLoggedIn;
		this.seeFullDetails = (!this.isLoggedIn || (this.userId !== user_id));
		this.anon = (this.userId != user_id);
	}
	
	ngAfterViewInit() {
		this.dataService.hasResume(this.userId).subscribe(
			response => {
				if (response.status) {
					this.resumeExists = true;
					this.resumeFileType = response.fileType;
				}
			},
			error => {
				console.log('@profile > [error]: ', error);
			}
		);
	}

	showPurchase() {
		if (this.authService.isLoggedIn && (this.authService.currentUser.role === 'manager' || this.authService.currentUser.role === 'recruiter')) {
			this.analyticsService.emitEvent('Contact Applicant', 'Open', 'Desktop', this.authService.currentUser.user_id);
			this.messageService.sendMessage({action: "SHOW_PURCHASE_DIALOG"});
		} else {
			// Pop the contact form
			this.contactModal.open();
		}
	}

	actionOnOpen() {
		this.analyticsService.emitEvent('About Me', 'Open', 'Desktop', this.authService.currentUser.user_id);
	}

	actionOnClose() {
		this.modal.close();
	}

	actionOnContactOpen() {
		this.analyticsService.emitEvent('Contact Applicant', 'Open', 'Desktop');
	}

	actionOnContactClose() {
		this.contactModal.close();
	}

	actionOnSubmit() {

	}

	onApplicantContact(e: Event) {
		this.analyticsService.emitEvent('Contact Applicant', 'Create', 'Desktop');
		this.contactModal.close();
		this.contact_applicant=false;
	}

	profileGetRequest() {
		console.log('@profile > profileGetRequest');
		this.profile = this.dataService.profile_get(this.userId);
		this.profile.subscribe((user: models.PersonalDetails) => {
			user.location = TransformerService.transformLocation(user.location);
			this.profileSubscribe = user;
			if (!!user.about) {
				this.aboutMeLength = (!!user.about.length) ? 300 - user.about.length : 300;
			} else {
				this.aboutMeLength = 300;
			}

			if (user.firstname) {
				this.seeFullDetails = false;
			}
		});
	}

	personalDetailsAboutUpdate(data) {

		this.aboutMeLength = 300 - data.length;

		this.dataService.about_put(this.userId, data).subscribe(
			response => {
				if (response) {
					this.analyticsService.emitEvent('About Me', 'Update', 'Desktop', this.authService.currentUser.user_id);
					this.profileGetRequest();
					this.actionOnClose();
				}
			},
			error => {
				alert(error);
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

	public getResumeOfUser(userId: string, resumeFileType: string) {
		if (!isNull(userId) && Number.isInteger(Number(userId)) && (/(pdf|doc|docx)/).test(resumeFileType) ) { // userId comes as a string of numbers
			// userId exists and is a number

			// show spinner and processing message...
			this.isFetching = true;
			
			this.dataService.fetchUserResume(userId, resumeFileType).subscribe(
				responseBlob => {
					if (responseBlob) {

						// let type = 'application/pdf';

						// if (resumeFileType === 'doc') { type = 'application/msword'; }
						// if (resumeFileType === 'doc') { type = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'; }

						this.blob = new Blob([responseBlob], { type: "application/force-download" });

						// this.downloadResumeUrl = window.URL.createObjectURL(this.blob);
						// this.downloadResumePath = `resume_${userId}.${resumeFileType}`; 

						// hide spinner and processing message....;
						this.isFetching = false;
						// swtich to show Click to Download button
						this.gettingResume = false;
						
					}
				},
				error => {
					console.log('@profile > getResumeOfUser :: [error]:', error);
					this.isFetching = false;
				}
			);

		}
	}

	public downloadResume(blob: Blob) {
		if (blob) {

			const url = window.URL.createObjectURL(blob);
			window.open(url, 'download_window');
			
		}

		if (!this.gettingResume) {
			// revert to Click to get Resume button
			this.gettingResume = true;
		}
	}
	setUserPurchasedInfo(){
		this.dataService.purches_get(this.userId).subscribe(
			(res:any) => {
				if(res.status){
					this.contact_applicant=false;
				}
				
			}
		);
	}
}
