import { Component, OnInit, ViewChild, HostBinding, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ModalModule, Modal } from 'ngx-modal';

// services:
import { AnalyticsService } from '../../../../services/analytics.service';
import { DataService } from '../../../../rest/service/data.service';
import { AuthService } from '../../../../rest/service/auth.service';

// models:
import * as models from '../../../../rest/model/models';

@Component({
	selector: 'app-share-section',
	templateUrl: './share-section.component.html',
	styleUrls: ['./share-section.component.css']
})

export class ShareSectionComponent implements OnInit {
	@ViewChild('downloadModal') modal: Modal;
	@ViewChild('shareModal') sharingModal: Modal;
	@ViewChild('pdfModal') content: Modal;
	@Output() onShareResume = new EventEmitter();
	@Output() openUploadResume = new EventEmitter();
	public shareButton: FormGroup;
	public pdfButton: FormGroup;
	public printButton: FormGroup;
	public showShareDialog = false;
	public blob: Blob;
	@HostBinding('id') comId = 'appShareSection';
	constructor(
		public authService: AuthService,
		public dataService: DataService,
		modal: ModalModule,
		public analyticsService: AnalyticsService,
	) {

		this.shareButton = new FormGroup({
			share: new FormControl()
		});

		this.pdfButton = new FormGroup({
			pdf: new FormControl()
		});

		this.printButton = new FormGroup({
			print: new FormControl()
		});
	}

	ngOnInit() {}

	pdf_profile(e: Event): void {
		this.modal.open();
		this.dataService.pdf(this.authService.getUserId()).subscribe(
			response => {
				this.analyticsService.emitEvent('Download', 'PDF', 'Desktop', this.authService.currentUser.user_id);
				if (response.token) {
					this.dataService.fetch_pdf(response.token).subscribe(
						pdfData => {
								let url = window.URL.createObjectURL(pdfData);
								let a = document.createElement("a");
								document.body.appendChild(a);
								a.setAttribute("style", "display: none");
								a.href = url;
                a.download = response.token + ".pdf";
								a.click();

								document.body.removeChild(a);
  							window.URL.revokeObjectURL(url);
								this.modal.close();
						},
						error => {
								console.log('error:', error);
						}
					);
				}
			},
			error => {
				console.log('pdf fetch error', error);
			}
		);
	}

	onOpenShare() {
		this.analyticsService.emitEvent('Sharing Method', 'Open', 'Desktop', this.authService.currentUser.user_id);
	}

	onCloseShare() {
		this.analyticsService.emitEvent('Sharing Method', 'Close', 'Desktop', this.authService.currentUser.user_id);
	}

	shareResumeAction(e: Event) {
		if (this.authService.currentUser.status === models.User.StatusEnum.Pending) {
			this.onShareResume.emit(e);
		} else {
			this.sharingModal.open();
		}
	}

	public openUploadResumeMethod() {
		this.openUploadResume.emit();
	}
}
