import {Component, OnInit, ViewChild} from '@angular/core';
import {DataService} from '../../rest/service/data.service';
import {AuthService} from '../../rest/service/auth.service';
import {AnalyticsService} from '../../services/analytics.service';
import {GrowlService} from '../../rest/service/growl.service';
import {AutoUnsubscribe} from '../../utils/autoUnsubscribe';

import {SavedBusinessSearches} from '../../rest/model/SavedBusinessSearches';
import {SavedBusinessSearch} from '../../rest/model/SavedBusinessSearch';
import {BusinessStatistics} from '../../rest/model/BusinessStatistics';
import {SearchStatus} from '../../rest/model/SearchStatus';

declare let moment: any;

@Component({
	selector: 'applicants-stats',
	templateUrl: './applicants-stats.component.html',
	styleUrls: ['./applicants-stats.component.css']
})

@AutoUnsubscribe()
export class ApplicantsStatsComponent implements OnInit {
	@ViewChild('dt') table;
	searches: SavedBusinessSearches = [];
	stats: BusinessStatistics = {
		applied: 0,
		purchased: 0,
		short_listed: 0,
		hired: 0
	};
	performance: any = {
		applied: '...',
		purchased: '...',
		initial_contact: '...',
		interviewing: '...',
		short: '...',
		rejected: '...',
		hired: '...'
	};

	status: SearchStatus = {
		status: null
	};

	loading = false;

	loaders = [];
	deleters = [];

	deleteSubscriber: any;
	getSearchesSubscriber: any;
	getStatsSubscriber: any;
	reportSubscriber: any;
	searchStatusUpdateSubscriber: any;

	from = moment();
	to = moment();
	now = moment();

	constructor(public dataService: DataService, public authService: AuthService, public analyticsService: AnalyticsService) {
	}

	ngOnInit() {
		this.resolveDates();
		this.getBusinessStats();
		this.getBusinessSearches();

		this.analyticsService.emitPageview('Applicants Stats');
	}

	/*
	 * getBusinessStats: Get the business statistics object
	 */
	getBusinessStats() {
		this.getStatsSubscriber = this.dataService.business_statistics_get(this.authService.currentUser.business_id).subscribe(
			response => {
				this.stats = response;
			},
			error => {
				this.parseErrors(error);
			}
		);
	}

	/*
	 * getBusinessSearches: Get the business searches collection
	 */
	getBusinessSearches(e?: Event) {
		if (this.validateSearch()) {
			this.loading = !!e;
			this.getSearchesSubscriber = this.dataService.business_searches_get(this.authService.currentUser.business_id, this.from, this.to).subscribe(
				response => {
					this.searches = response;
					for (let i = 0, l = this.searches.length; i < l; i++) {
						this.searches[i] = this.extendSelection(this.searches[i], this.performance, {loaded: false});
					}
					this.loading = false;
				},
				error => {
					this.parseErrors(error);
					this.loading = false;
				}
			);
		}
	}

	/*
	 * delete_search: Delete a saved search of a business user
	 */
	delete_search(e: Event, id: number = null) {
		e.preventDefault();
		e.stopPropagation();

		this.deleters[id] = true;

		let deleted = this.table.value.filter(search => search.id !== id);
		if (deleted.length > 0) {
			this.deleteSubscriber = this.dataService.user_saved_searches_delete(deleted[0].creator.id, deleted[0].id).subscribe(
				response => {
					this.analyticsService.emitEvent('Applicants Stats', 'Delete', 'Desktop', this.authService.currentUser.user_id);
					this.table.value = this.table.value.filter(search => search.id !== id);
					delete this.deleters[id];
					GrowlService.message('The search was deleted', 'success');
				},
				error => {
					GrowlService.message(JSON.parse(error._body).message, 'error');
					delete this.deleters[id];
				}
			);
		} else {
			GrowlService.message('Could not find the requested saved search');
		}
	}

	setDayDateFrom(day) {
		this.from = moment(this.from).date(moment(day).date()).format('YYYY-MM-DD HH:mm:ss');
	}

	setMonthDateFrom(month) {
		this.from = moment(this.from).month(moment(month).month()).format('YYYY-MM-DD HH:mm:ss');
	}

	setYearDateFrom(year) {
		this.from = moment(this.from).year(moment(year).year()).format('YYYY-MM-DD HH:mm:ss');
	}

	setDayDateTo(day) {
		this.to = moment(this.to).date(moment(day).date()).format('YYYY-MM-DD HH:mm:ss');
	}

	setMonthDateTo(month) {
		this.to = moment(this.to).month(moment(month).month()).format('YYYY-MM-DD HH:mm:ss');
	}

	setYearDateTo(year) {
		this.to = moment(this.to).year(moment(year).year()).format('YYYY-MM-DD HH:mm:ss');
	}

	/*
	 * set_status: Set the status of the passed search object
	 */
	set_status(e: Event, id: number = null) {
		e.preventDefault();
		e.stopPropagation();

		this.parseStatus((<HTMLSelectElement>e.target).value);

		this.searchStatusUpdateSubscriber = this.dataService.business_searches_put(this.authService.currentUser.business_id, id, this.status).subscribe(
			response => {
				this.analyticsService.emitEvent('Applicants Stats', 'Update', 'Desktop', this.authService.currentUser.user_id);
				GrowlService.message('The status of the search was updated', 'success');
			},
			error => {
				this.parseErrors(error);
			}
		);
	}

	/*
	 * load_stats: Load the performance object of the search ID being passed as an argument
	 */
	load_stats(e: Event, id: number = null) {
		e.preventDefault();
		e.stopPropagation();

		this.loaders[id] = true;
		let selectedSearch = this.table.value.filter(search => search.id === id);

		if (selectedSearch.length > 0) {
			this.reportSubscriber = this.dataService.business_search_get_results(this.authService.currentUser.business_id, id).subscribe(
				response => {
					this.analyticsService.emitEvent('Applicants Stats', 'Load', 'Desktop', this.authService.currentUser.user_id);
					this.performance = response;
					selectedSearch[0] = this.extendSelection(selectedSearch[0], this.performance, {loaded: true});
					delete this.loaders[id];
				},
				error => {
					GrowlService.message(JSON.parse(error._body).message, 'error');
					delete this.loaders[id];
				}
			);
		} else {
			GrowlService.message('Could not find the requested saved search', 'error');
		}
	}

	/*
	 * validateSearch: Perform various client side validation before fetching the business searches collection from the API
	 */
	private validateSearch() {
		if (this.loading) {
			GrowlService.message('Looking for saved searches... please wait', 'warning');
			return false;
		} else if (moment(this.to).format('X') <= moment(this.from).format('X')) {
			GrowlService.message('End date should be after the start date', 'error');
			return false;
		}

		return true;
	}

	/*
	 * parseStatus: Parse the status enum form the selected string value
	 */
	private parseStatus(status?: string) {
		if (SearchStatus.StatusEnum.InProgress.toString() === status) {
			this.status.status = SearchStatus.StatusEnum.InProgress;
		} else if (SearchStatus.StatusEnum.Closed.toString() === status) {
			this.status.status = SearchStatus.StatusEnum.Closed;
		} else {
			this.status.status = null;
		}
	}

	/*
	 * parseErrors: Parses the error object and display the message usin the Growl Service
	 */
	private parseErrors(error) {
		if (Object.prototype.toString.call(JSON.parse(error._body).message) === '[object Array]') {
			for (let i = 0, l = JSON.parse(error._body).message.length; i < l; i++) {
				GrowlService.message(JSON.parse(error._body).message[i].error, 'error');
			}
		} else {
			GrowlService.message(JSON.parse(error._body).message, 'error');
		}
	}

	/*
	 * resolveDates: Set the intial date to one year ago from the current date
	 */
	private resolveDates() {
		this.from = moment().year(moment().year() - 1).format('YYYY-MM-DD HH:mm:ss');
		this.to = moment().format('YYYY-MM-DD HH:mm:ss');
	}

	/*
	 * extendSelection: Extend the first passed object with the rest of the objects
	 */
	private extendSelection(t, o: any, o2: any, o3?: any, o4?: any) {
		for (let s, i = 1, n = arguments.length; i < n; i++) {
			s = arguments[i];
			for (let p in s) {
				if (Object.prototype.hasOwnProperty.call(s, p)) {
					t[p] = s[p];
				}
			}
		}
		return t;
	}
}
