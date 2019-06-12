import {Component, OnInit, ViewChild, ViewContainerRef, Input, EventEmitter, Output} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {DataService} from '../../../../../rest/service/data.service';
import {AuthService} from '../../../../../rest/service/auth.service';
import {AnalyticsService} from '../../../../../services/analytics.service';
import {TourService} from '../../../../../services/tour.service';

import * as models from '../../../../../rest/model/models';
import * as extModels from '../../../../../rest/service/extended-models/extended-models';
import {Language} from '../../../../../rest/model/Language';
import {ModalModule} from 'ngx-modal';
import {MessageService} from '../../../../../services/message.service';

@Component({
	selector: 'app-languages',
	templateUrl: './languages.component.html',
	styleUrls: ['./languages.component.css']
})
export class LanguagesComponent implements OnInit {
	@Input() userId: number;
	@Output() onLoaded = new EventEmitter<any>();
	@ViewChild('languageModal') modal: any;
	languages: Observable<extModels.LanguagesExt>;
	loading = false;
	langUi = {
		1: [],
		2: [],
		3: []
	};
	langFullModal: Language[];
	modalModule;
	errorObject = {};

	constructor(public dataService: DataService,
				public authService: AuthService,
				modal: ModalModule,
				viewRef: ViewContainerRef,
				public messageService: MessageService,
				public analyticsService: AnalyticsService,
				public tourService: TourService) {
		this.dataService = dataService;
		this.authService = authService;
		this.analyticsService = analyticsService;
		this.tourService = tourService;
		this.modalModule = modal;
	}

	ngOnInit() {
		this.loadData();
	}

	actionOnOpen(args?: any) {
		this.analyticsService.emitEvent('Languages', 'Open', 'Desktop', this.authService.currentUser.user_id);
	}

	actionOnClose() {
		this.modal.close();
		this.loadData();
		this.analyticsService.emitEvent('Languages', 'Close', 'Desktop', this.authService.currentUser.user_id);

		if (!this.langFullModal.length) {
			this.tourService.sleep();
		}
	}

	actionOnSubmit() {
	}

	loadData() {
		this.languages = this.dataService.languages_get(this.userId);

		this.languages.subscribe(
			response => {
				// Update the tourService
				this.tourService.collect('languages', response.length === 0);
				this.tourService.collect('languages_edit', response.length === 0);

				this.langFullModal = response;
				this.changeStats(response.length);
				this.langUi = {
					1: [],
					2: [],
					3: []
				};
				for (let lang of response) {
					this.langUi[lang.level].push(lang);
				}
				this.loading = false;

				this.onLoaded.emit(true);
			},
			error => {
				this.errorObject = error;
				this.onLoaded.emit(false);
			}
		);
	}

	onDeleteLanguage(data) {
		this.loading = true;

		this.dataService.languages_delete(this.userId, data.id).subscribe(
			response => {
				this.loadData();
				this.analyticsService.emitEvent('Languages', 'Delete', 'Desktop', this.authService.currentUser.user_id);
			},
			error => {
				this.errorObject = error;
			}
		);
	}

	onUpdateLanguage(data: Language) {
		this.loading = true;

		this.dataService.languages_post(this.userId, data).subscribe(
			response => {
				this.loadData();
				this.analyticsService.emitEvent('Languages', 'Create', 'Desktop', this.authService.currentUser.user_id);
			},
			error => {
				this.errorObject = error;
			}
		);
	}

	changeStats(num: number) {
		this.messageService.sendMessage({
			action: 'CHANGE_PROFILE_COMPLETION_POINTS',
			data: {parent: 'LANGUAGES', status: num}
		});
	}
}
