import { Component, OnInit, ViewChild,AfterViewInit,ElementRef} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Modal } from 'ngx-modal';

// services:
import { AnalyticsService } from '../../../services/analytics.service';
import { GrowlService } from '../../../rest/service/growl.service';
import { DataService } from '../../../rest/service/data.service';
import { AuthService } from '../../../rest/service/auth.service';
import { TourService } from '../../../services/tour.service';

import { environment } from 'environments/environment';

import * as models from '../../../rest/model/models';

@Component({
	selector: 'dashboard-layout',
	templateUrl: './layout.component.html',
	styleUrls: ['./layout.component.css']
})
export class DashboardLayoutComponent implements OnInit,AfterViewInit {
	public userId: number;
	public role: string;
	public currentUser: models.User;
  	public file;
	public uploadingResume: boolean = false;
 	public responseData: any;	
	public resume_status: string = 'Upload resume';

	@ViewChild('upload_resume') upload_resume: Modal;
	@ViewChild('upload_resume_input') upload_resume_input: HTMLInputElement;
	@ViewChild('activationModal') modal: Modal;

	public UPLOAD_PATH: string = environment.baseApiPath + '/users/resumes';

	public tourLabel = '';
	public tourEndLabel = '';
	public tourArrowClass = '';
	public steps;
	public authPending = models.Status.StatusEnum.Pending;

	public tourStepsList: { id: string, congratesMessage: string, currentTask: string }[];

	constructor(
		private dataService: DataService,
		private authService: AuthService,
		private router: Router,
		private route: ActivatedRoute,
		private analyticsService: AnalyticsService,
		private tourService: TourService,
		private elementRef: ElementRef
	) {	}

	ngOnInit() {
		this.userId = this.authService.getUserId();
		this.currentUser = this.authService.currentUser;
		this.role = this.currentUser.role;
		
		this.analyticsService.emitPageview('Dashboard');

		this.tourLabel = this.tourService.label;
		this.tourEndLabel = this.tourService.label_exit;
		this.tourArrowClass = this.tourService.arrowClass;
		this.steps = this.tourService.steps;
		this.tourStepsList= this.tourService.tourStepsList;

		this.route.queryParams.subscribe(
			data => {
				if (data['businessId']) {
					this.dataService.user_apply_to_business(data['businessId']).subscribe(
						response => {
							GrowlService.message('Applied successfully', 'success');
						},
						error => {
							GrowlService.message('An error occured. Please try again', 'warning');
						}
					);
				}
				if (data['uploadResume']) {
					this.router.navigate(['/dashboard']); // remove when daxtra feature is ready.
					this.upload_resume.open();
					this.tourService.tourEnded = true;
				}
			}
		);
	}

	openConfirmDialog(e: Event) {
		e.preventDefault();
		this.modal.open();
	}

	actionOnOpen() {
		this.modal.open();
	}

	actionOnClose() {
		this.modal.close();
	}

	actionOnSubmit() {
		// this.modal.close();
	}

	public openFileInput(upload_resume_input) {
		upload_resume_input.click();
	}

	public initTourSection(event) {
		this.tourService.initSection(event);
	}

	public neverTourAgain(event) {
		this.tourService.neverAgain(event);
	}


	/** Applicant resume file uploader input method
   * @public
   * @func onSelect fires when option is selected
   * @param {Event} event 
   * @param {FileUpload} fileInput .
   * 
   * Getting the file input, assigning to this.file
   * 
   * @returns {void} void
   */
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
		this.router.navigate(['/dashboard']);
	}
	
	public openUploadResume() {
		this.upload_resume.open();
	}
	ngAfterViewInit() {
		const s = document.createElement('script');
		 s.type = 'text/javascript';
		 s.innerHTML="googletag.cmd.push(function() { googletag.display('div-gpt-ad-1546199565287-0'); });";
		 const __this = this;
		 s.onload = function () { __this.afterScriptAdded(); };
    	 document.getElementById("div-gpt-ad-1546199565287-0").appendChild(s);
	}
	afterScriptAdded() {
    const params= {
     
    };
      if (typeof (window['functionFromExternalScript']) === 'function') {
        window['functionFromExternalScript'](params);
      }
    }
}
