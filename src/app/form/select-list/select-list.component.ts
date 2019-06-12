import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { DataService } from '../../rest/service/data.service';
import { AnalyticsService } from '../../services/analytics.service';
import { TourService } from '../../services/tour.service';
import * as models from '../../rest/model/models';
import { DictionaryItem } from '../../rest/model/DictionaryItem';
import { SingleDictionary } from '../../rest/model/SingleDictionary';
import { AuthService } from '../../rest/service/auth.service';
import { Trait } from '../../rest/model/Trait';

@Component({
	selector: 'app-select-list',
	templateUrl: './select-list.component.html',
	styleUrls: ['./select-list.component.css'],
	providers: [DataService, AuthService]
})
export class SelectListComponent implements OnInit, OnChanges {
	@Input() selectedList: DictionaryItem[];
	@Input() traitsData: Trait[];
	@Input() entityName: string;
	@Input() levels: Array<string>;
	@Input() showLevels = true;
	@Input() showDrag = true;
	@Input() showColors = true;
	@Input() showIcons = true;
	@Output() updateTraits = new EventEmitter<models.Traits>();
	sendModel: Trait = {
		id: null,
		name: null,
		prominance: null
	};
	isSubmitting = false;
	tempTraitsData: Trait[];
	public typeaheadLoading: boolean;
	public typeaheadNoResults: boolean;
	public searchTerm: string;
	public results: SingleDictionary;
	updateMode = false;
	traitsGroup: FormGroup;
	traitsOverflow = false;
	sendEnabled = false;
	traitsLeft = 4;
	messageObject = {
		success: false,
		message: '',
	};

	traitsPool = [
		{ name: 'Active', 			id: 1 },
		{ name: 'Articulate', 	id: 2 },
		{ name: 'Confident', 		id: 3 },
		{ name: 'Creative', 		id: 4 },
		{ name: 'Decisive', 		id: 5 },
		{ name: 'Disciplined', 	id: 6 },
		{ name: 'Discrete', 		id: 7 },
		{ name: 'Enthusiastic', id: 8 },
		{ name: 'Focused', 			id: 9 },
		{ name: 'Loyal', 				id: 10 },
		{ name: 'Organized', 		id: 11 },
		{ name: 'Passionate', 	id: 12 },
		{ name: 'Practicle', 		id: 13 },
		{ name: 'Responsible', 	id: 14 },
		{ name: 'Sensitive', 		id: 15 },
		{ name: 'Genuine', 			id: 16 },
		{ name: 'Hardworking', 	id: 17 },
		{ name: 'Independent', 	id: 18 },
		{ name: 'Strong', 			id: 19 },
		{ name: 'Ambitious', 		id: 20 },
		{ name: 'Big Picture', 	id: 21 },
		{ name: 'Competitive', 	id: 22 },
		{ name: 'Adaptable', 		id: 23 },
		{ name: 'Analytical', 	id: 24 },
		{ name: 'Broad-Minded', id: 25 },
		{ name: 'Cautious', 		id: 26 },
		{ name: 'Diplomatic', 	id: 27 },
		{ name: 'Honest', 			id: 28 },
		{ name: 'Friendly', 		id: 29 },
		{ name: 'Leader', 			id: 30 },
		{ name: 'Reliable', 		id: 31 },
		{ name: 'Sociable', 		id: 32 },
		{ name: 'Charismatic', 	id: 33 },
	];

	constructor(
		public dataService: DataService,
		public authService: AuthService,
		public formBuilder: FormBuilder,
		public analyticsService: AnalyticsService,
		public tourService: TourService,
	) {
		this.updateMode = false;
		this.traitsOverflow = false;

		this.traitsGroup = this.formBuilder.group({
			traits: [{value: '', disabled: true}, Validators.required]
		});
	}

	ngOnInit() {
		this.checkIntegrity();
	}

	ngOnChanges(changes: any) {
		this.tempTraitsData = changes.traitsData.currentValue;
		this.checkIntegrity();
	}

	handleErrors(data, status?): void {
		switch (status) {
			case 400:
			case 403:
				this.setMessage(false, 'You cannot update a trait using the same skill level');
				break;
			case 406:
				this.setMessage(false, data.message[0].error);
				break;
		}
	}

	setMessage(success: boolean, message, timeout = 5000): void {
		this.messageObject = {
			success: success,
			message: message
		}

		if (success) {
			setTimeout(() => {
				this.messageObject = {
					success: false,
					message: '',
				};
			}, timeout);
		}
	}

	delete(id, e: Event) {
		e.preventDefault();

		for (let i = 0; i < this.tempTraitsData.length; i++) {
			if (this.tempTraitsData[i].id === id) {
				this.analyticsService.emitEvent('Personal Traits', 'Delete', 'Desktop', this.authService.currentUser.user_id);
				this.tempTraitsData.splice(i, 1);
				this.checkIntegrity();
				this.sendEnabled = true;
				break;
			}
		}
	}

	makeDirty(e: Event) {
		this.traitsGroup.controls['traits'].markAsDirty();
		this.sendEnabled = true;
	}

	onSubmit(e: Event) {
		e.preventDefault();

		this.isSubmitting = true;
		const sendObj = [];
		let i = 0;
		Object.keys(this.tempTraitsData).forEach(function (key) {
			i++;
			sendObj[key] = {
				id: this.tempTraitsData[key].id,
				name: this.tempTraitsData[key].name,
				prominance: Number(i)
			};
		}.bind(this));

		sendObj.sort(this.dynamicSort('prominance'));

		this.dataService.traits_put(this.authService.getUserId(), sendObj).subscribe(
			response => {
				this.analyticsService.emitEvent('Personal Traits', 'Update', 'Desktop', this.authService.currentUser.user_id);
				this.updateTraits.emit(sendObj);
				this.isSubmitting = false;
				this.hardreset();

				if (this.tourService.shown) {
					this.tourService.initSection(e);
				}
			},
			error => {
				this.handleErrors(JSON.parse(error._body), error.status);
			}
		);
	}

	dynamicSort(property) {
		let sortOrder = 1;
		if (property[0] === '-') {
			sortOrder = -1;
			property = property.substr(1);
		}
		return function (a, b) {
			const result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
			return result * sortOrder;
		};
	}

	onSelectAutoComplete(id) {
		for (let item of this.tempTraitsData) {
			if (Number(item.id) === Number.parseInt(id)) {
				this.hardreset(true);
				return;
			}
		}

		let tmpModel = this.traitsPool.filter((item) => {
			return item.id === Number.parseInt(id);
		});

		if (!tmpModel.length) {
			return;
		} else {
			this.updateMode = false;
			let numberOfProminance = this.tempTraitsData.length;

			this.sendModel = tmpModel[0];
			this.sendModel.prominance = numberOfProminance;

			this.tempTraitsData.push(this.sendModel);
			this.hardreset(true);
			this.checkIntegrity();
			this.sendEnabled = true;
		}
	}

	hardreset(group = true) {
		this.searchTerm = '';
		this.sendModel = {
			id: null,
			name: null,
			prominance: null
		};

		if (group) {
			this.traitsGroup.reset();
		}
	}

	checkIntegrity() {
		if (!!this.tempTraitsData) {
			if (this.tempTraitsData.length > 3) {
				this.traitsGroup.controls['traits'].disable();
			} else {
				this.traitsGroup.controls['traits'].enable();
			}

			this.traitsLeft = 4 - this.tempTraitsData.length;
		} else {
			this.traitsLeft = 4;
		}
	}
}
