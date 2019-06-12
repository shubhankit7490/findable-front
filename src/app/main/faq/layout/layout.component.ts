import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Modal } from 'ngx-modal';
import { Router, ActivatedRoute } from '@angular/router';
// services:
import { AuthService } from '../../../rest/service/auth.service';
import { DataService } from '../../../rest/service/data.service';
import { AnalyticsService } from '../../../services/analytics.service';
import { TourService } from '../../../services/tour.service';

import * as models from '../../../rest/model/models';
@Component({
	selector: 'faqLayout',
	templateUrl: './layout.component.html',
	styleUrls: [ './layout.component.css' ]
})

export class FaqLayoutComponent implements OnInit {
	@ViewChild('activationModal') modal: Modal;
	@ViewChild('upload_resume') upload_resume: Modal;
	@ViewChild('upload_resume_input') upload_resume_input: HTMLInputElement;
	public currentUser: models.User;
	public file;
	public uploadingResume: boolean = false;
 	public responseData: any;	
	public resume_status: string = 'Upload resume';
	public authPending = models.Status.StatusEnum.Pending;

	public role: string;
	
	constructor(
		private dataService: DataService,
		private authService: AuthService,
		private analyticsService: AnalyticsService,
		private tourService: TourService,
		private router: Router,
		private formBuilder: FormBuilder,
		private route: ActivatedRoute,
	) {
		this.currentUser = this.authService.currentUser;
		this.role = this.currentUser.role;
	}

	ngOnInit() {
		this.analyticsService.emitPageview('FAQ');
		this.tourService.sleep();
		this.route.queryParams.subscribe(
			data => {
				if (data['uploadResume']) {
					this.router.navigate(['/faq']); // remove when daxtra feature is ready.
					this.upload_resume.open();
					this.tourService.tourEnded = true;
				}
			}
		);
	}
	public openFileInput(upload_resume_input) {
		upload_resume_input.click();
	}
	public onSelect(event: Event): void {
		this.file = (event.target as HTMLInputElement).files[0];
		// const supportedFiles = 'doc'; //'|docx|pdf|rtf'
		if (this.file && this.file.name && (/\.(doc|docx|pdf|rtf')$/).test(this.file.name.toLowerCase())) {
			this.uploadingResume = true;
			this.resume_status = 'Processing...'
			this.dataService.user_upload_resume_parsing(this.file).subscribe(
				response => {
					console.log('The following is the response:', response);
	
					if (response.status) {
						this.uploadingResume = false;
						this.resume_status = 'successful!';
						// make sure page is refreshed with new data.
						this.router.navigate(['/dashboard']);
						window.location.reload();
					} else {
						this.resume_status = 'Unsupported file!';
						setTimeout(() => {
							this.uploadingResume = false;
							this.resume_status = 'Upload resume';
						}, 3000);
					}
				},
				error => {
					console.log('@onSelect > uploadResume: [error]', error);
					this.resume_status = 'File Unprocessable';
					this.uploadingResume = false;
					setTimeout(() => {
						this.resume_status = 'Upload resume';
					}, 3000);
				} 
			);
		} else {
			this.uploadingResume = false;
			this.resume_status = 'Unsupported File!';
			setTimeout(() => {
				this.resume_status = 'Upload resume';
			}, 3000);
		}
	}
	openConfirmDialog(e: Event) {
		e.preventDefault();
		this.modal.open();
	}
	/**
	 * Upload Resume should open
	 */
	openUploadResumeModal() {
		this.upload_resume.open();
	}

	/**
	 * Upload Resume should close
	 */
	closeUploadResumeModal() {
		this.upload_resume.close();
		// does not refresh page, as long as url route is already on here
		// will change it but not refresh when uploadResume=true param exists
		this.router.navigate(['/faq']);
	}
	public openUploadResume(){
		this.upload_resume.open();
	}
	actionOnOpen() {}
	actionOnClose() {}
	actionOnSubmit() {}
}
