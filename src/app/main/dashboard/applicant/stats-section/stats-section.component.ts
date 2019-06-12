import { Component, OnInit, OnDestroy, ElementRef, Input, HostBinding } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { DataService } from '../../../../rest/service/data.service';
import { AuthService } from '../../../../rest/service/auth.service';
import { AnalyticsService } from '../../../../services/analytics.service';
import { UserStatistics } from '../../../../rest/model/models';
import { MalihuScrollbarService } from 'ngx-malihu-scrollbar';
import { Subscription } from 'rxjs/Subscription';
import { MessageService } from '../../../../services/message.service';

@Component({
	selector: 'app-stats-section',
	templateUrl: './stats-section.component.html',
	styleUrls: ['./stats-section.component.css']
})

export class StatsSectionComponent implements OnInit, OnDestroy {
	@Input() userId: number = null;
	@HostBinding('id') comId = 'appStatsSection';
	public scrollbarOptions = { axis: 'y', theme: 'inset-dark', setWidth: 240, setHeight: 'auto', advanced: { autoScrollOnFocus: false, updateOnContentResize: true }, autoHideScrollbar: true };
	public dateSelector: FormGroup;
	public period = 30;
	public data_service_error = '';
	public profileCompletionLoaded = false;
	public popups = {
		northamerica: true,
		southamerica: true,
		asia: true,
		africa: true,
		oceania: true,
		europe: true,
		antarctica: true
	};
	stats: UserStatistics = {
		businessViews: 0,
		profileCompletion: 28,
		yourStatus: {
			hired: 0,
			initial: 0,
			interviewing: 0,
			short: 0
		},
		yourViews: {
			northamerica: {
				count: 0,
				views: 0,
				businesses: []
			},
			southamerica: {
				count: 0,
				views: 0,
				businesses: []
			},
			europe: {
				count: 0,
				views: 0,
				businesses: []
			},
			asia: {
				count: 0,
				views: 0,
				businesses: []
			},
			oceania: {
				count: 0,
				views: 0,
				businesses: []
			},
			africa: {
				count: 0,
				views: 0,
				businesses: []
			},
			antarctica: {
				count: 0,
				views: 0,
				businesses: []
			}
		}
	};
	totalViews = 0;

	private subscription: Subscription;
	private tracker: Object = {
		'TRAITS': 0,
		'LANGUAGES': 0,
		'EXPERIENCE': 0,
		'EDUCATION': 0,
		'TECH': 0
	};

	constructor(public authService: AuthService, public dataService: DataService, private mScrollbarService: MalihuScrollbarService, private el: ElementRef, public messageService: MessageService, public analyticsService: AnalyticsService) {
		this.dataService = dataService;
		this.authService = authService;
		this.analyticsService = analyticsService;
		this.dateSelector = new FormGroup({
			report: new FormControl()
		});

		this.mScrollbarService = mScrollbarService;
		this.el = el;

		this.subscription = this.messageService.getMessage().subscribe(
			message => {
				if (message.action === 'CHANGE_PROFILE_COMPLETION_POINTS') {
					this.updateStats(message.data);
				}
			},
			error => {
				alert('An error occured while trying to fetch new data. Please try again');
			}
		);
	}

	calcTotalViews() {
		this.totalViews = 0;
		for (let continent in this.stats.yourViews) {
			if (this.stats.yourViews.hasOwnProperty(continent)) {
				this.totalViews += (this.stats.yourViews[continent].count  + this.stats.yourViews[continent].views);
			}
		}
	}

	requestStats(): void {
		this.dataService.user_statistics_get(this.userId, this.period).subscribe(
			response => {
				this.stats.businessViews = response.businessViews;
				this.stats.yourStatus = response.yourStatus;
				this.stats.yourViews = response.yourViews;

				this.calcTotalViews();

				this.profileCompletionLoaded = true;
			},
			error => {
				this.data_service_error = error.message;
			}
		);
	}

	updateStats(data: any) {
		let currentCompletionPoints = Number.parseInt(this.stats.profileCompletion.toString());
		let updatedCompletionPoints = 28; // We already have a profile & preferences object (14 points each)
		this.tracker[data.parent] = data.status;

		for (let child in this.tracker) {
			if (this.tracker.hasOwnProperty(child)) {
				if (this.tracker[child] > 0) {
					updatedCompletionPoints += 14;
				}
			}
		}
		if (updatedCompletionPoints > 95) {
			updatedCompletionPoints = 100;
		}
		if (currentCompletionPoints !== updatedCompletionPoints) {
			this.stats.profileCompletion = updatedCompletionPoints;
		}
	}

	ngOnDestroy() {
		this.popups = {
			northamerica: true,
			southamerica: true,
			asia: true,
			africa: true,
			oceania: true,
			europe: true,
			antarctica: true
		};
	}

	ngOnInit() {
		this.requestStats();
	}

	loadStats(report_period): void {
		this.analyticsService.emitEvent('Statistics', 'Update', 'Desktop', this.authService.currentUser.user_id);
		this.period = report_period;
		this.requestStats();
	}

	showCompanies(continent, el): void {
		this.popups[continent] = !this.popups[continent];
		el.querySelector('.mCustomScrollBox').style.maxHeight = 'none';
	}
}
