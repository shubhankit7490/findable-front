import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { Observable } from 'rxjs';

import { TourService } from '../../../../../services/tour.service';
import { DataService } from '../../../../../rest/service/data.service';
import { AuthService } from '../../../../../rest/service/auth.service';
import { MessageService } from '../../../../../services/message.service';
import { AnalyticsService } from '../../../../../services/analytics.service';

import * as models from '../../../../../rest/model/models';

// function getWindow() {
// 	return window;
// }

@Component({
	selector: 'app-recent-job',
	templateUrl: './recent-job.component.html',
	styleUrls: ['./recent-job.component.css']
})
export class RecentJobComponent implements OnInit, OnDestroy {
	@Input() userId: number;
	@Output() onLoaded = new EventEmitter<boolean>();
	positions$: Observable<models.Position[]>;
	recentJob: models.Position;
	enum$: Observable<models.Enums>;
	enumAllData: models.EmploymentType;
	// _window: Window = getWindow();
	message: any;
	subscription: Subscription;
	public experienceClear;

	constructor(
		public dataService: DataService,
		public authService: AuthService,
		public messageService: MessageService,
		public analyticsService: AnalyticsService,
		public tourService: TourService,
	) { }

	openPopup() {
		this.messageService.sendMessage({ action: 'OPEN_EXPERIENCE_MODAL', data: {} });
		this.messageService.sendMessage({ action: 'SELECT_RECENT_JOB', data: {} });
	}

	getRecentJob() {
		this.enum$ = this.dataService.dictionary_enums();
		this.enum$.subscribe((response: models.Enums) => {
			this.enumAllData = response.employment_type;
		});

		this.positions$ = this.dataService.recentJob_get(this.userId);
		this.positions$.subscribe(
			(response: models.Position[]) => {
				this.changeStats(response.length);
				this.recentJob = response[0];
				this.onLoaded.emit(true);
			},
			error => {
				this.onLoaded.emit(false);
			}
		);
	}

	ngOnInit() {
		this.subscription = this.messageService.getMessage().subscribe(
			message => {
				if (message.action === 'updateExperience') {
					this.getRecentJob();
				}
			},
			error => {
				alert('An error occured while trying to fetch new data. Please try again');
			}
		);

		this.getRecentJob();
	}

	ngOnDestroy() {
		this.subscription.unsubscribe();
	}

	actionOnOpen() {
	}

	actionOnClose() {
	}

	actionOnSubmit() {
	}

	changeStats(num: number) {
		this.messageService.sendMessage({
			action: 'CHANGE_PROFILE_COMPLETION_POINTS',
			data: { parent: 'EXPERIENCE', status: num }
		});
	}

	onUpdateExperience(event?) {}
}
