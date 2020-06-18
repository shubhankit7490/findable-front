import { Component, OnInit, ViewChild, HostBinding, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ModalModule, Modal } from 'ngx-modal';
import { Router, ActivatedRoute } from '@angular/router';

// services:
import { AnalyticsService } from '../../../../services/analytics.service';
import { DataService } from '../../../../rest/service/data.service';
import { AuthService } from '../../../../rest/service/auth.service';
import { SubscriptionComponent } from '../../../../shared/subscription/subscription.component';
import { GrowlService } from "../../../../rest/service/growl.service";
// models:
import * as models from '../../../../rest/model/models';
declare var $ :any;
@Component({
	selector: 'app-share-section',
	templateUrl: './share-section.component.html',
	styleUrls: ['./share-section.component.css']
})

export class ShareSectionComponent implements OnInit {
	@ViewChild('downloadModal') modal: Modal;
	@ViewChild('shareModal') sharingModal: Modal;
	@ViewChild('pdfModal') content: Modal;
	@ViewChild('subscriptionComp') subscriptionComponent: SubscriptionComponent;
	@Output() onShareResume = new EventEmitter();
	@Output() openUploadResume = new EventEmitter();
	public shareButton: FormGroup;
	public pdfButton: FormGroup;
	public printButton: FormGroup;
	public showShareDialog = false;
	public blob: Blob;
	public userid:number=0;
	public subscription: any;
	public blockingInfoStatus: boolean;
	public blockingInfoCanBuy: boolean;
	public blockingInfoSubEndsAt: number;
	public blockingInfoMode: string;
	public errorMessage: string = '';
	@HostBinding('id') comId = 'appShareSection';
	constructor(
		public authService: AuthService,
		public dataService: DataService,
		modal: ModalModule,
		public analyticsService: AnalyticsService,
		private route: ActivatedRoute,
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

	ngOnInit() {
		if(this.authService.getUserId()){
			this.userid=this.authService.getUserId();
		}else{
			this.userid=0;
		}
		
		this.getBlockInfoSubscriptionData();
	}
	copyLink(){
	let textarea = null;
    textarea = document.createElement("textarea");
    textarea.style.height = "0px";
    textarea.style.left = "-100px";
    textarea.style.opacity = "0";
    textarea.style.position = "fixed";
    textarea.style.top = "-100px";
    textarea.style.width = "0px";
    document.body.appendChild(textarea);
    // Set and select the value (creating an active Selection range).
    textarea.value = window.location.href;
    textarea.select();
    // Ask the browser to copy the current selection to the clipboard.
    let successful = document.execCommand("copy");
    if (successful) {
     GrowlService.message('Url coppied successfully Please share it', 'success');
    } else {
      // handle the error
    }
    if (textarea && textarea.parentNode) {
      textarea.parentNode.removeChild(textarea);
    }
	}
	pdf_profile(e: Event): void {
		if (this.blockingInfoStatus === undefined) { return; };
		if(this.authService.getUserId()){
			var userid=this.authService.getUserId();
		}else{
			var userid=this.route.snapshot.params['id'];
		}
		let _blockingInfoStatus = Number(e);
			this.modal.open();
			this.dataService.pdf(userid).subscribe(
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
	getBlockInfoSubscriptionData(){
		if(this.authService.getUserId()){
			var userid=this.authService.getUserId();
		}else{
			var userid=this.route.snapshot.params['id'];
		}
		this.dataService.subscription_get(userid).subscribe(
			(res:any) => {
				if(!res.data){
					this.blockingInfoStatus = false;
					this.blockingInfoCanBuy = true;
					this.blockingInfoSubEndsAt = null;
					this.blockingInfoMode = 'create';
				} else {
					this.subscription = res.data;

					let subStatus = res.data.subscription.status;
					let subCancelAtPeriodEnd = res.data.subscription.cancel_at_period_end;
					// Check for valid subscription
					if (subStatus == 'active' && !subCancelAtPeriodEnd) {
						// Everything OK. Toggle on. BTN off
						this.blockingInfoStatus = true;
						this.blockingInfoCanBuy = false;
						this.blockingInfoSubEndsAt = null;
						this.blockingInfoMode = 'delete';
					}  else if(subStatus != 'active' && !subCancelAtPeriodEnd){
						// Subscription not active. Toggle off. BTN on
						this.blockingInfoStatus = false;
						this.blockingInfoCanBuy = true;
						this.blockingInfoSubEndsAt = null;
						this.blockingInfoMode = 'create';
					} else if(subCancelAtPeriodEnd){
						// Subscription about to end. Toggle off. BTN on
						this.blockingInfoStatus = false;
						this.blockingInfoCanBuy = true;
						this.blockingInfoMode = 'update';
						this.blockingInfoSubEndsAt = res.data.subscription.current_period_end * 1000;
					} 
				}
			},
			error => {
				this.errorMessage = error.message;
				this.blockingInfoStatus = false;
				this.blockingInfoCanBuy = true;
				this.blockingInfoSubEndsAt = null;
			}
		)
	}
	shareResumeAction(e: Event) {
		if (this.authService.currentUser.status === models.User.StatusEnum.Pending) {
			this.onShareResume.emit(e);
		} else {
			
				this.sharingModal.open();
		}
	}
	openpaymentModel(){
		this.sharingModal.close();
		$('#purchaseModalheader').modal('toggle');
	}
	onSubscribed(e){
		if(e){
			$('#purchaseModalheader').modal('toggle');
			this.getBlockInfoSubscriptionData();
		}
	}
	public openUploadResumeMethod() {
		this.openUploadResume.emit();
	}
}
