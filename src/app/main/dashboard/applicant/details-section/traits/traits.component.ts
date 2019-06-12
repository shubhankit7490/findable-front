import {Component, OnInit, ViewChild, Input, Output, EventEmitter} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {DataService} from '../../../../../rest/service/data.service';
import {AuthService} from '../../../../../rest/service/auth.service';
import {AnalyticsService} from '../../../../../services/analytics.service';
import {TourService} from '../../../../../services/tour.service';
import * as extModels from '../../../../../rest/service/extended-models/extended-models';
import {MessageService} from '../../../../../services/message.service';

@Component({
	selector: 'app-traits',
	templateUrl: './traits.component.html',
	styleUrls: ['./traits.component.css']
})
export class TraitsComponent implements OnInit {
	@Input() userId: number;
	@Output() onLoaded = new EventEmitter<any>();
	@ViewChild('traitsModal') modal: any;
	traits: Observable<any>;
	traitsData;

	constructor(public dataService: DataService, public authService: AuthService, public messageService: MessageService, public analyticsService: AnalyticsService, public tourService: TourService) {
		this.dataService = dataService;
		this.authService = authService;
		this.analyticsService = analyticsService;
		this.tourService = tourService;
	}

	ngOnInit() {
		this.updateTraits();
	}

	updateTraits(data?: any) {
		if (!!data) {
			this.changeStats(data.length);
			this.modal.close();
		}
		this.traits = this.dataService.user_traits_get(this.userId);
		this.traits.subscribe(
			response => {
				this.tourService.collect('traits', response.length === 0);
				this.tourService.collect('traits_edit', response.length === 0);

				this.traitsData = [];
				this.traitsData = response;
				this.changeStats(response.length);
				this.onLoaded.emit(true);
			},
			error => {
				this.onLoaded.emit(false);
			}
		);
	}

	actionOnOpen() {
		this.analyticsService.emitEvent('Personal Traits', 'Open', 'Desktop', this.authService.currentUser.user_id);
	}

	actionOnClose() {
		this.modal.close();
		this.analyticsService.emitEvent('Personal Traits', 'Close', 'Desktop', this.authService.currentUser.user_id);

		if (!this.traitsData.length) {
			this.tourService.sleep();
		}
	}

	actionOnSubmit() {
	}

	changeStats(num: number) {
		this.messageService.sendMessage({
			action: 'CHANGE_PROFILE_COMPLETION_POINTS',
			data: {parent: 'TRAITS', status: num}
		});
	}
}
