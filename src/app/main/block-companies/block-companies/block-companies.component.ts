import { Component, OnInit, ViewChild } from '@angular/core';
import { Response } from "@angular/http";
import { Router, ActivatedRoute } from '@angular/router';
// services:
import { DataService } from '../../../rest/service/data.service';
import { AuthService } from '../../../rest/service/auth.service';
import { TourService } from '../../../services/tour.service';
import { AnalyticsService } from '../../../services/analytics.service';
import { GrowlService } from "../../../rest/service/growl.service";
import { Modal } from 'ngx-modal';

// models:
import * as models from '../../../rest/model/models';
import { Company } from '../../../rest/model/Company';
import { SingleDictionary } from '../../../rest/model/SingleDictionary';
import { Subscription } from 'rxjs';


import { PaymentComponent } from '../../../shared/payment/payment.component';
import { SubscriptionComponent } from '../../../shared/subscription/subscription.component';

declare var $ :any;

@Component({
	selector: 'block-companies',
	templateUrl: './block-companies.component.html',
	styleUrls: [ './block-companies.component.css' ]
})
export class BlockCompaniesComponent implements OnInit{
	@ViewChild('upload_resume') upload_resume: Modal;
	@ViewChild('upload_resume_input') upload_resume_input: HTMLInputElement;
	@ViewChild('paymentComponent') paymentComponent: PaymentComponent;
	@ViewChild('subscriptionComp') subscriptionComponent: SubscriptionComponent;

	public typeaheadLoading: boolean;
	public typeaheadNoResults: boolean;
	public companies: Company[] = [];
	public blockingStatus: boolean;
	public errorMessage: string = '';
	public disabled = false;
	public searchTerm: string = '';
	public results: SingleDictionary;
	public requestingJobtitle: boolean = false;
	private companiesObservable: Array<any>;
	private chosenCompany: Company;

	public subscription: any;
	public blockingInfoStatus: boolean;
	public blockingInfoCanBuy: boolean;
	public blockingInfoSubEndsAt: number;
	public blockingInfoMode: string;
	private paymentPost$: Subscription;
	public file;
	public uploadingResume: boolean = false;
 	public responseData: any;	
	public resume_status: string = 'Upload resume';
	@ViewChild('autocompleteInput') autocompleteInput;

	constructor(
		private dataService: DataService,
		private authService: AuthService,
		private analyticsService: AnalyticsService,
		private tourService: TourService,
		private router: Router,
		private route: ActivatedRoute,
	) {	}

	ngOnInit(): void {
		this.getCompanies();
		this.getBlockInfoSubscriptionData();
		this.tourService.sleep();
	}

	getCompanies() {
		this.disabled = true;
		this.dataService.blocked_companies_get(this.authService.getUserId()).subscribe(
			(response:any) => {
				this.blockingStatus = !!Number(response.block_all);
				this.companies = response.companies;
				this.disabled = false;
			},
			error => {
				this.errorMessage = error.message;
			}
		);
	}

	getBlockInfoSubscriptionData(){
		this.dataService.subscription_get(this.authService.getUserId()).subscribe(
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

	addCompany() {
		if (!this.chosenCompany) { return; };
		this.disabled = true;
		this.dataService.blocked_companies_post(this.authService.getUserId(), this.chosenCompany.id).subscribe(
			(response:any) => {
				this.analyticsService.emitEvent('Block Companies', 'Create', 'Desktop', this.authService.currentUser.user_id);
				this.companies.push(this.chosenCompany);
				this.chosenCompany = {};
				this.searchTerm = '';
				this.disabled = false;
				this.updateInputValue('');
			},
			error => {
				this.errorMessage = 'Company already exists';
			}
		);
	}

	removeCompany(companyId: number) {
		this.disabled = true;
		this.dataService.blocked_companies_delete(this.authService.getUserId(), companyId).subscribe(
			(response:any) => {
				this.analyticsService.emitEvent('Block Companies', 'Delete', 'Desktop', this.authService.currentUser.user_id);
				this.companies = this.companies.filter((val) => {
					return val.id !== companyId;
				});
				this.disabled = false;
			},
			error => {
				this.errorMessage = 'Processing error has occured. Please try again';
			}
		);
	}

	onSwitchChange(checked: boolean) {
		if (this.blockingStatus === undefined) { return; };
		let _blockingStatus = Number(checked);
		this.disabled = true;
		this.dataService.blocked_companies_put(this.authService.getUserId(), _blockingStatus).subscribe(
			(res:any) => {
				if(res.status){
					this.analyticsService.emitEvent('Block Companies', 'Update', 'Desktop', this.authService.currentUser.user_id);
					this.getCompanies();
					this.getBlockInfoSubscriptionData();
				} else {
					this.errorMessage = 'Processing error has occured. Please try again';
				}
			},
			error => {
				this.errorMessage = 'Processing error has occured. Please try again';
			}
		);
	}


	onBlockInfoSwitchChange(checked: boolean){
		if (this.blockingInfoStatus === undefined) { return; };
		let _blockingInfoStatus = Number(checked);
		console.log(this.blockingInfoMode);
		
		if(this.blockingInfoMode == 'create'){
			$('#purchaseModal').modal('toggle');
			console.log('New Subscription ');
		} else if(this.blockingInfoMode == 'delete' && _blockingInfoStatus == 0){
			this.dataService.subscription_delete(this.authService.currentUser.user_id).subscribe(
				(res: any) => {
					if (res.status) {
						GrowlService.message(res.message, 'success');
						this.getBlockInfoSubscriptionData();						
					}
				}
			);
		} else if(this.blockingInfoMode == 'update'){
			let billingName = this.authService.getItem('currentProfile').firstname + ' ' + this.authService.getItem('currentProfile').lastname; 

			this.paymentPost$ = this.dataService.subscription_put(this.authService.currentUser.user_id, this.subscription.payment_stripe_token, billingName).subscribe(
				(res: any) => {
					if (res.status) {
						GrowlService.message(res.message, 'success');
						this.analyticsService.emitEvent('Subscription', 'Update', 'Desktop', this.authService.currentUser.user_id);
						this.getBlockInfoSubscriptionData();						
					}
				},
				error => {
					this.errorMessage = error.message;
				}
			);
		}
		
	}

	onSubscribed(e){
		if(e){
			$('#purchaseModal').modal('toggle');
			this.getBlockInfoSubscriptionData();
		}
	}

	search(event) {
		this.chosenCompany = {};
		if (!event.query.length) {
			return;
		}
		this.requestingJobtitle = true;
		this.dataService.businesses_get(event.query).subscribe(
			(response: Company[]) => {
				this.results = response;
				this.requestingJobtitle = false;
			}
		);
	}

	onSelectAutoComplete(e: Company) {
		for (let item of this.companies){
			if (item.id === e.id) {
				this.searchTerm = e.name;
				return;
			}
		}

		this.updateInputValue(e.name);
		this.chosenCompany = e;
	}

	updateInputValue(value) {
		this.autocompleteInput.el.nativeElement.querySelector('input').value = value;
	}

}
