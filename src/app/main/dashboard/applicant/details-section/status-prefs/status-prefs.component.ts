import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Modal } from 'ngx-modal';

// services:
import { AnalyticsService } from '../../../../../services/analytics.service';
import { MessageService } from '../../../../../services/message.service';
import { DataService } from '../../../../../rest/service/data.service';
import { AuthService } from '../../../../../rest/service/auth.service';
import { TourService } from '../../../../../services/tour.service';

// models:
import { UserPreferencesExt } from '../../../../../rest/service/extended-models/UserPreferencesExt';

import { PreferencesFormComponent } from '../../../../../form/preferences-form/preferences-form.component';

@Component({
	selector: 'app-status-prefs',
	templateUrl: './status-prefs.component.html',
	styleUrls: ['./status-prefs.component.css']
})
export class StatusPrefsComponent implements OnInit {
	@Input() userId: number;
	@Output() onLoaded = new EventEmitter<any>();
	public preferences$: Observable<UserPreferencesExt>;
	private preferencesClear: UserPreferencesExt;
	@ViewChild('preferencesModal') preferencesModal: Modal;
	@ViewChild('preferencesModalForm') preferencesModalForm: PreferencesFormComponent;

	constructor(
		public dataService: DataService,
		public authService: AuthService,
		public messageService: MessageService,
		public analyticsService: AnalyticsService,
		public tourService: TourService,
	) { }

	ngOnInit() {
		this.getPreferences();

		this.messageService.getMessage().subscribe(
			data => {
				if (data.action === 'UPDATE_SALARY') {
					this.getPreferences();
				}
			}
		);
	}

	getPreferences() {
		this.preferences$ = this.dataService.preferences_get(this.userId);

		this.preferences$.subscribe(
			(response: UserPreferencesExt) => {
				this.preferencesClear = response;
				// Update the tourService
				this.tourService.collect('status', response.employment_status === null);
				this.tourService.collect('status_edit', response.employment_status === null);
				this.onLoaded.emit(true);
			},
			error => {
				this.onLoaded.emit(false);
			}
		);
	}

	toNumber(number) {
		if (number) {
			return Number(number.replace(/,/g, ''));
		}
	}

	actionOnOpen() {
		this.analyticsService.emitEvent('Status And Preferences', 'Open', 'Desktop', this.authService.currentUser.user_id);

		let domLooker = setInterval(() => {
			if (!!document.getElementById('city')) {
				this.preferencesModalForm.locationOfInteresetComponent.loadGmaps();
				clearInterval(domLooker);
			}
		}, 50);
	}

	actionOnClose() {
		this.analyticsService.emitEvent('Status And Preferences', 'Close', 'Desktop', this.authService.currentUser.user_id);

		if (!this.preferencesClear.employment_status) {
			this.tourService.sleep();
		}
	}

	actionOnSubmit() {
	}

	closeStatusModal(e) {
		this.preferencesModal.close();
		if (this.tourService.shown) {
			this.tourService.initSection();
		}
	}

}
