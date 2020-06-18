import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

// services:
import { MessageService } from '../../../services/message.service';
import { DataService } from '../../../rest/service/data.service';
import { AuthService } from '../../../rest/service/auth.service';
import { AnalyticsService } from '../../../services/analytics.service';

// models:
import * as models from '../../../rest/model/models';

@Component({
	selector: 'dashboard-layout',
	templateUrl: './layout.component.html',
	styleUrls: ['./layout.component.css']
})
export class DashboardLayoutComponent implements OnInit {
	userId: number = null;
	viewedUser: number = null;
	userObject: models.ApplicantsSearchResultProfile;
	purchaseVisible: boolean = false;
	applicantsToPurchase: number[] = [];
	reportOpened: boolean = false;

	constructor(
		public dataService: DataService,
		public authService: AuthService,
		private router: Router,
		private route: ActivatedRoute,
		public messageService: MessageService,
		public analyticsService: AnalyticsService,
	) { }

	ngOnInit() {
		var base64regex =  /^(?:[A-Z0-9+\/]{4})*(?:[A-Z0-9+\/]{2}==|[A-Z0-9+\/]{3}=|[A-Z0-9+\/]{4})$/i;
		if(base64regex.test(this.route.snapshot.params['id'])){
			this.viewedUser = Number(atob(this.route.snapshot.params['id']));
		}else{
			this.viewedUser =Number(this.route.snapshot.params['id']);
		}
		this.viewedUser =Number(this.route.snapshot.params['id']);
		this.userId = (this.authService.currentUser)
			? (this.userId === this.authService.getUserId())
				? this.authService.getUserId()
				: +this.viewedUser
			: +this.viewedUser;
		this.applicantsToPurchase = [this.userId];

		let viewerId = Number(this.authService.getUserId());
		

		if (!!viewerId && viewerId != this.viewedUser && (this.authService.currentUser.role === 'manager' || this.authService.currentUser.role === 'recruiter')) {
			this.dataService.user_views_post(this.viewedUser, viewerId).subscribe();
		} else {
			this.dataService.add_profile_views(this.viewedUser).subscribe();
		}

		this.getUserStatus();

		this.messageService.getMessage().subscribe(
			response => {
				if (response.action === 'SHOW_PURCHASE_DIALOG') {
					this.openPurchase();
				}
			}
		);

		this.analyticsService.emitPageview('Applicant Profile');
	}

	getUserStatus() {
		if (this.authService.currentUser && this.authService.currentUser.role !== 'applicant') {
			this.dataService.search_applicants_post(0, 'jobtitle', 'asc', <models.ApplicantsSearchProfile>[{ account_id: this.userId }]).subscribe(
				(response: models.ApplicantsSearchResultProfiles) => {
					this.userObject = response.applicants[0];
				}
			);
		}
	}

	openPurchase() {
		this.purchaseVisible = true;
	}

	closePurchase(data, event) {
		this.purchaseVisible = false;
	}

	onPurchase(data, event) {
		this.purchaseVisible = false;
		this.messageService.sendMessage({ action: 'UPDATE_USER_PROFILE' });
	}
}
