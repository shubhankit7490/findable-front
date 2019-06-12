import { Router, ActivatedRoute, Params } from '@angular/router';
import { Component, OnInit } from '@angular/core';

// services:
import { AnalyticsService } from '../../services/analytics.service';
import { ProviderService } from '../../services/provider.service';
import { DataService } from '../../rest/service/data.service';
import { AuthService } from '../../rest/service/auth.service';
import { TourService } from '../../services/tour.service';

@Component({
	selector: 'app-verify',
	templateUrl: 'verify.component.html',
	styleUrls: ['verify.component.css']
})
export class VerifyComponent implements OnInit {
	verificationText = 'Verifying your email address, please hold on.';

	constructor(
		private authService: AuthService,
		private activatedRoute: ActivatedRoute,
		public dataService: DataService,
		public router: Router,
		public analyticsService: AnalyticsService,
		public tourService: TourService,
		public providerService: ProviderService) {
	}

	ngOnInit() {
		this.analyticsService.emitPageview('Verify Account');

		this.activatedRoute.queryParams.subscribe((params: Params) => {
			let token = params['token'];
			this.dataService.verify(token).subscribe(
				response => {
					this.authService.currentUser = response;
					this.authService.isLoggedIn = true;
					this.authService.updateItem('currentUser', this.authService.currentUser);

					this.dataService.apiKey = response.key;
					this.providerService.getData();

					// Delete any previous record of the tour service
					this.authService.deleteItem('tour-ended');
					this.tourService.resetCollection();

					if (response['role'] == 'applicant') {
						// like the recruiter route below, a param is passed to indicate that a upload resume popup should be displayed on very first login
						this.router.navigate(['/dashboard']);
					} else if (response['role'] == 'manager') {
						this.router.navigate(['/business/setup']);
					} else if (response['role'] == 'recruiter') {
						this.router.navigate(['/business/search'], { queryParams: { first: true } });
					}
				},
				error => {
					this.verificationText = 'Verification failed';

					setTimeout(() => {
						this.router.navigate(['/']);
					}, 5000);
				}
			);
		});
	}

}
