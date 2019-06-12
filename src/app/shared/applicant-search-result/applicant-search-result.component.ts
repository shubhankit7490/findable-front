import {AuthService} from '../../rest/service/auth.service';
import {Component, OnInit, Input, Output, ViewChild} from '@angular/core';
import {DataService} from '../../rest/service/data.service';
import {GrowlService} from '../../rest/service/growl.service';
import {MessageService} from '../../services/message.service';
import {ChartDataService} from '../../services/chart-data.service';

@Component({
	selector: 'app-applicant-search-result',
	templateUrl: './applicant-search-result.component.html',
	styleUrls: ['./applicant-search-result.component.css']
})
export class ApplicantSearchResultComponent implements OnInit {
	@ViewChild('profileComponent') profileComponent;
	@ViewChild('skypePop') skypePop;
	@ViewChild('phonePop') phonePop;
	@ViewChild('emailPop') emailPop;
	@ViewChild('websitePop') websitePop;
	@Input() userId: any;

	rowSections = 6;

	public reportOpened = false;

	loadedRowSections = 0;

	rowLoading = true;

	userDetails = {
		email: '',
		phone: '',
		skype: '',
		website: ''
	};

	charts = {
		experience: {active: false, loading: false, disabled: false},
		education: {active: false, loading: false, disabled: false},
		responsibilities: {active: false, loading: false, disabled: false},
		skills: {active: false, loading: false, disabled: false},
	};

	constructor(public dataService: DataService, public authService: AuthService, public messageService: MessageService, public chartDataService: ChartDataService) {
	}

	ngOnInit() {

		this.charts.experience.disabled = this.chartDataService.getData('experience', this.userId).disabled;
		this.charts.education.disabled = this.chartDataService.getData('education', this.userId).disabled;
		this.charts.responsibilities.disabled = this.chartDataService.getData('responsibilities', this.userId).disabled;
		this.charts.skills.disabled = this.chartDataService.getData('skills', this.userId).disabled;

		this.getContactDetails();

		this.messageService.getMessage().subscribe(
			response => {
				if (response.name === 'RELOAD_PROFILE' && response.data == this.userId) {
					this.loadedRowSections--;
					this.rowLoading = true;

					this.getContactDetails();
					this.profileComponent.profileGetRequest();
					this.profileComponent.setUserPurchasedInfo();
				}
			}
		);
	}

	closeSkypeTooltip(e: Event) {
		if (!!this.skypePop) {
			if (this.skypePop.isOpen) {
				if (e.srcElement.id !== 'skypeIcon' && e.srcElement.id !== 'skypeLink' && e.srcElement.className !== 'tooltip-inner') {
					this.skypePop.isOpen = false;
				}
			}
		}
	}

	closePhoneTooltip(e: Event) {
		if (!!this.phonePop) {
			if (this.phonePop.isOpen) {
				if (e.srcElement.id !== 'phoneIcon' && e.srcElement.className !== 'tooltip-inner') {
					this.phonePop.isOpen = false;
				}
			}
		}
	}

	closeEmailTooltip(e: Event) {
		if (!!this.emailPop) {
			if (this.emailPop.isOpen) {
				if (e.srcElement.id !== 'emailIcon' && e.srcElement.className !== 'tooltip-inner') {
					this.emailPop.isOpen = false;
				}
			}
		}
	}

	closeWebsiteTooltip(e: Event) {
		if (!!this.websitePop) {
			if (this.websitePop.isOpen) {
				if (e.srcElement.id !== 'websiteIcon' && e.srcElement.id !== 'websiteLink'  && e.srcElement.className !== 'tooltip-inner') {
					this.websitePop.isOpen = false;
				}
			}
		}
	}

	getContactDetails() {
		this.dataService.user_views_post(this.userId, this.authService.getUserId()).subscribe();

		this.getProfileData(this.userId).subscribe(
			response => {
				this.userDetails.email = response.email;
				this.userDetails.phone = response.phone;
				this.userDetails.skype = response.skype;
				this.userDetails.website = response.website;

				this.checkLoadingStatus();
			},
			error => {
				GrowlService.message('An error occured, please try again', 'error');
			}
		);
	}

	checkLoadingStatus() {
		this.loadedRowSections++;

		if (this.loadedRowSections >= this.rowSections) {
			this.rowLoading = false;
		} else {
			this.rowLoading = true;
		}
	}

	closeReportComponent(event) {
		setTimeout(() => {
			this.reportOpened = false;
		}, 2000);
	}

	/**
	 * Get user profile data
	 * @param {number} id User id
	 */
	getProfileData(id) {
		console.log('@applicant-search-result > getProfileData');
		return this.dataService.profile_get(id);
	}

	onNoData(dataType) {
		this.charts[dataType].loading = this.charts[dataType].active = false;
		this.charts[dataType].disabled = true;
		GrowlService.message(`Applicant did not provide ${dataType} data`, 'error');
		this.chartDataService.add(dataType, this.userId, {disabled: true});
	}

	printRow(event) {
		let thead = window.document.getElementsByTagName('thead')[0];
		thead.classList.add('to-print');

		event.path.forEach(key => {
			if (key.tagName === 'TR') {
				key.classList.add('to-print');
				key.previousElementSibling.classList.add('to-print');
				window.print();
				setTimeout(function () {
					key.previousElementSibling.classList.remove('to-print');
					key.classList.remove('to-print');
				}, 1000);
			}
		});
	}

	toggleActive(name, event?) {
		// Hide the other sections
		Object.keys(this.charts).reduce(function(r, e) {
			if (e !== name) {
				this.charts[e].active = false;
			}
		}.bind(this), {});

		this.charts[name].active = !this.charts[name].active;
		if (!this.charts[name].active) {
			setTimeout(() => {
				this.charts[name].loading = false;
			}, 0);
		}
	}

	openSkype(username) {
		window['redirect']('skype:' + username + '?chat', true);
	}

	openWebsite(url) {
		window['redirect'](url, true);
	}

	redirect(url = '', n?: boolean) {
		window['redirect'](url, n);
	}

}
