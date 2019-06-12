import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

// services:
import { AuthService } from '../../rest/service/auth.service';
import { AnalyticsService } from '../../services/analytics.service';

// models:
import * as models from '../../rest/model/models';

// components:
import { BusinessSetupFormComponent } from './setup-form/setup-form.component';

@Component({
	selector: 'business-setup',
	templateUrl: './business-setup.component.html',
	styleUrls: [ './business-setup.component.css' ]
})
export class BusinessSetupComponent implements OnInit {
	@ViewChild('companyInformationComponent') companySetupFormComponent: BusinessSetupFormComponent;	
	constructor(
		private router: Router,
		private authService: AuthService,
		private analyticsService: AnalyticsService,
	) {	}

	ngOnInit() {
		if (this.authService.currentUser.role !== 'manager' || !!this.authService.currentUser.business_id) {
			this.authService.checkUserStatus(this.authService.currentUser);
		}
		
		this.analyticsService.emitPageview('Business Setup');
	}

	/** Complete Setup 
	 * @public .
	 * 
	 * Triggered once sendPersonalDetails returns a response in setup-form component.
	 * Once triggered, will navigate to business/search route and marks visit as very first - 
	 * triggering the tour service.
	 * @returns {void} void
	 */
	public completeSetup(): void {
		/** navigate to to search view as first ever visit: */
		this.router.navigate(['/business/search'], { queryParams: { first: true } } );
	}
}
