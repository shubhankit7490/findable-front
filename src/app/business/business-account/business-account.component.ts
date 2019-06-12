import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

// services:
import { DataService } from '../../rest/service/data.service';
import { AuthService } from '../../rest/service/auth.service';

// models:
import * as models from '../../rest/model/models';

import { AutoUnsubscribe } from '../../utils/autoUnsubscribe';
import { PaymentComponent } from '../../shared/payment/payment.component';

@Component({
	selector: 'business-account',
	templateUrl: './business-account.component.html',
	styleUrls: [ './business-account.component.css' ]
})
@AutoUnsubscribe()
export class BusinessAccountComponent implements OnInit {
	@ViewChild('paymentComponent') paymentComponent: PaymentComponent;
	public role: string = '';
	public step: number = 2;
	public package_id: number = null;
	public payment: models.PaymentObject = {
		id: null,
		last4: null,
		exp_month: null,
		exp_year: null,
		name: null,
		billing_name: null,
		address_line1: null,
		address_line2: null,
		address_city: null,
		address_country: null,
		address_state: null,
		address_zip: null,
	};
	public business: models.Business = {
		name: '',
		year_established: 2017,
		size: null,
		location: null,
		industry: {
			id: null,
			name: null
		},
		duns: null,
		type: 1,
		web_address: null,
		logo: null
	};
	public businessRecord: models.BusinessRecord = {
		name: null,
		year_established: null,
		size: null,
		location: null,
		industry: null,
		duns: null,
		type: null,
		web_address: null,
		logo: null
	};
	public credits: models.Credits = {
		left: null,
		spent: null,
		earned: null,
		auto_reload: false,
		reload_package_id: null
	};
	public packages: models.ModelPackage[] = [];
	public history: models.BusinessPurchase[] = [];
	public recruiters: models.Recruiter[] = [];
	private businessGet$: Subscription;

	constructor(
		public dataService: DataService,
		public authService: AuthService,
		private router: Router,
		public route: ActivatedRoute,
	) {
		this.role = this.authService.currentUser.role;
	}

	ngOnInit() {
		// get URL parameters
		this.route.params.subscribe(params => {
			this.setSection(params['id']);			
		});

		this.business.location = this.businessRecord.location = {
			continent_id: null,
			continent_name: null,
			city_id: null,
			city_name: null,
			state_id: null,
			state_name: null,
			country_id: null,
			country_name: null,
			country_short_name_alpha_3: null,
			country_short_name_alpha_2: null
		};

		this.businessRecord.type = this.businessRecord.industry = {
			id: null,
			name: null
		};

		this.businessRecord.logo = {
			id: null,
			url: null
		};

		this.loadRecordData();
	}

	/** Set Sidemenu Height
	 * @private
	 * @param {number} height is percentage
	 * 
	 * Sets the height of the sidemenu style by a percentage
	 * @returns {void} void
	 */
	private setSidemenuHeight(height: number): void {
		let sidemenu: HTMLElement = document.getElementById('personal-details-wrap');
		sidemenu.style.height = `${height}%`;
	}

	/** Sets the Section to be initially navigated to
	 * @private
	 * @param {string} step received from route param prop ID
	 * @returns {void} void
	 */
	private setSection(step?: string): void {
		switch (step) {
			case 'info':
				this.step = 1;
				this.setSidemenuHeight(134.4);
				break;
			case 'users':
				this.step = 2;
				break;
			case 'payment':
				this.step = 3;

				let domLooker = setInterval(() => {
					if (!!document.getElementById('city')) {
						this.paymentComponent.loadGmaps();
						clearInterval(domLooker);
					}
				}, 50);

				this.setSidemenuHeight(140);

				break;
			case 'package':
				this.step = 4;
				break;
			case 'history':
				this.step = 5;
				break;
			case 'embedding':
				this.step = 6;
				break;
			default:
				this.step = 1;
				break;
		}

		if (!(/payment|info/).test(step)) {
			this.setSidemenuHeight(100);
		}
	}

	/** Update the URI Dependent on the current Step 
	 * @private .
	 * 
	 * Using a switch statement, there are 6 different cases -
	 * each case will push to a new route. 
	 * @returns {void} void
	 */
	private updateURI(): void {
		switch (this.step) {
			case 1:
				this.router.navigateByUrl('/business/account/info');
				break;
			case 2:
				this.router.navigateByUrl('/business/account/users');
				break;
			case 3:
				this.router.navigateByUrl('/business/account/payment');
				break;
			case 4:
				this.router.navigateByUrl('/business/account/package');
				break;
			case 5:
				this.router.navigateByUrl('/business/account/history');
				break;
			case 6:
				this.router.navigateByUrl('/business/account/embedding');
				break;
		}
	}

	getStep() {
		return this.step;
	}

	/** Update Model 
	 * @public
	 * @param {{ name: string, model: any }} event receives an emited event
	 * from the component it is used in.
	 * @returns {void} void
	 */
	public updateModel(event: any): void {
		this[event.name] = event.model;
	}

	/** Set Class Business object with Emitted Business Data 
	 * @public
	 * @param {models.Business} business received as an emitted event
	 * from the component it is used in. 
	 * @param {number} step for chaniging the step -> currently not used 
	 * 
	 * Receives the emitted data, assigns to Class object business and
	 * envokes Class method syncRecordData.
	 * @returns {void} void
	 */
	setDataModel(business: models.Business, step?: number) {
		this.business = business;
		this.syncRecordData();
	}

	/** Set Step for Displaying Content
	 * @public
	 * @param {number} step the step used for each content
	 * 
	 * recieves the number and assigns to the new step. Envoke
	 * Class method updateURI which will navigate the screen to
	 * the appropriate destination.
	 * @returns {void} void
	 */
	public setStep(step: number): void {
		this.step = step;
		this.updateURI();
	}

	setPackage(event: number) {
		this.package_id = event;
		this.setStep(4);
	}

	/** Load Model with GET Business Response Data
	 * @private .
	 *  
	 * Assigning received business record to business properties.
	 * @returns {void} void
	 */
	private loadModelData(): void {
		this.business.name = this.businessRecord.name;
		this.business.year_established = this.businessRecord.year_established;
		this.business.size = this.businessRecord.size;
		this.business.duns = this.businessRecord.duns;
		this.business.industry = this.businessRecord.industry;
		this.business.type = this.businessRecord.type.id || 1;
		this.business.location = this.businessRecord.location;
		this.business.web_address = this.businessRecord.web_address;
		this.business.logo = this.businessRecord.logo.id || null;
	}

	/** Sync Business Record Data with Business object properties
	 * @private .
	 *  
	 * Assigning business record with business properties.
	 * @returns {void} void
	 */
	private syncRecordData(): void {
		this.businessRecord.name = this.business.name;
		this.businessRecord.year_established = this.business.year_established;
		this.businessRecord.size = this.business.size;
		this.businessRecord.duns = this.business.duns;
		this.businessRecord.industry = this.business.industry;
		this.businessRecord.type.id = this.business.type;
		this.businessRecord.location = this.business.location;
		this.businessRecord.web_address = this.business.web_address;
		this.businessRecord.logo.id = this.business.logo;
	}

	/** Load Business Record Data
	 * @private .
	 * 
	 * GET business with LocalStorage currentUser objects' business ID property &
	 * subscribe to it. Its response assigned to Class object businessRecord and
	 * envoke Class method loadModelData.
	 * @returns {void} void
	 * 
	 */
	private loadRecordData(): void {
		this.businessGet$ = this.dataService.business_get(this.authService.currentUser.business_id).subscribe(
			(response: models.BusinessRecord) => {
				this.businessRecord = response;
				this.loadModelData();
			},
			error => {
				console.log('error', error);
			}
		);
	}
}
