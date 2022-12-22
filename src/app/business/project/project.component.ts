import { AuthService } from '../../rest/service/auth.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit, ViewChild } from '@angular/core';
import { GrowlService } from '../../rest/service/growl.service';
import { Modal } from 'ngx-modal';
import * as models from '../../rest/model/models';
import { DataService } from '../../rest/service/data.service';
import { environment } from 'environments/environment';
@Component({
	selector: 'business-project',
	templateUrl: 'project.component.html',
	styleUrls: ['project.component.css'],
})

export class Project implements OnInit {
	public userId: number;
	public role: string;
	public currentUser: models.User;
  	public file;
	public uploadingResume: boolean = false;
	public filesupported: boolean = true;
 	public responseData: any;	
	public resume_status: string = 'Upload resume';
	@ViewChild('upload_resume') upload_resume: Modal;
	@ViewChild('upload_resume_input') upload_resume_input: HTMLInputElement;
	public UPLOAD_PATH: string = environment.baseApiPath + '/users/resumes';
	constructor(
		private dataService: DataService,
		private authService: AuthService,
		private router: Router,) {}
	ngOnInit() {
		this.userId = this.authService.getUserId();
		this.currentUser = this.authService.currentUser;
		this.role = this.currentUser.role;
	}
	public openFileInput(upload_resume_input) {
		upload_resume_input.click();
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
	this.file = (event.target as HTMLInputElement).files;
			// const supportedFiles = 'doc'; //'|docx|pdf|rtf'
			for (var x = 0; x < this.file.length; x++) {
				if (this.file[x] && this.file[x].name && (/\.(doc|docx|pdf|rtf')$/).test(this.file[x].name.toLowerCase())) {
					this.filesupported=true;
				}else{
					this.filesupported=false;
					break;
				}
			}
			if (this.filesupported) {
				this.uploadingResume = true;
				this.resume_status = 'Processing...'
				this.dataService.user_upload_resume_parsing(this.file).subscribe(
					response => {
						console.log('The following is the response:', response);
		
						if (response.status) {
							this.uploadingResume = false;
							this.resume_status = 'successful!';
							setTimeout(() => {
								this.uploadingResume = false;
								this.resume_status = 'Upload resume';
							}, 7000);
							// make sure page is refreshed with new data.
							this.router.navigate(['/search'], { queryParams: {page: 'upload-resume',uploaded_id:response.uploaded_id}});
							this.closeUploadResumeModal();
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
				}, 5000);
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
		//this.router.navigate(['/dashboard']);
	}
	
	public openUploadResume() {
		this.upload_resume.open();
	}

}
