import { Component, Input, Output, OnInit, EventEmitter, ViewChild } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { IonRangeSliderComponent } from 'ng2-ion-range-slider';
import { AutoComplete } from 'interjet-primeng/components/autocomplete/autocomplete';

// services:
import { ChartItems, ChartGroups } from '../../rest/service/chart.service';
import { AnalyticsService } from '../../services/analytics.service';
import { AuthService } from '../../rest/service/auth.service';
import { DataService } from '../../rest/service/data.service';
import { TourService } from '../../services/tour.service';


import * as models from '../../rest/model/models';

@Component({
	selector: 'app-skills-modal',
	templateUrl: './skills-modal.component.html',
	styleUrls: ['./skills-modal.component.css']
})
export class SkillsModalComponent implements OnInit {
	@Input() items: ChartItems;
	@Input() groups: ChartGroups;
	@Input() techSkillsClear: models.TechSkill[];
	@Output() updateSkills = new EventEmitter<boolean>();
	@Output() onClose = new EventEmitter<any>();
	@ViewChild('rangeSlider') rangeSlider: IonRangeSliderComponent;
	@ViewChild('skillsAutocomplete') skillsAutocomplete: AutoComplete;
	isSubmitting = false;
	skillModel: models.TechSkill = {
		id: null,
		name: '',
		level: 1
	};
	skillsGroup: FormGroup;
	public html = `<button class="btn btn-warning" (click)="done()">You are about to lose your data, are you sure?</button>`;
	public searchTerm: string;
	public results: models.DictionaryItem[];
	public requesting = false;
	level: number = 0;
	dictionaryIndexed: boolean = true;
	updateMode: boolean = false;
	messageObject = {
		success: false,
		message: '',
	};

	constructor(
		public authService: AuthService,
		public dataService: DataService,
		public formBuilder: FormBuilder,
		public analyticsService: AnalyticsService,
		public tourService: TourService,
	) {
		
		this.requesting = false;
		this.updateMode = false;
		this.dictionaryIndexed = true;
		
		this.skillsGroup = this.formBuilder.group({
			skills: ['', Validators.required]
		});
	}

	handleErrors(data, status?): void {
		switch (status) {
			case 400:
				this.setMessage(false, 'You cannot update a skill using the same skill level');
				break;
			case 406:
				this.setMessage(false, data.message[0].error);
				break;
		}
	}

	setMessage(success: boolean, message: string, timeout: number = 5000): void {
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

	ngOnInit() {
	}

	updateLevel(level: number) {
		this.skillModel.level = level;
		if (this.updateMode) {
			this.skillsGroup.controls['skills'].markAsDirty();
		}
	}

	setLevel(e: Event, level: number) {
		if (!!this.skillModel.name) {
			this.skillModel.level = level;
			this.updateSlider(level);
			this.skillsGroup.controls['skills'].markAsDirty();
		}
	}

	updateSlider(level: number) {
		this.rangeSlider.update({from: level});
	}

	sliderOnFinish(event) {
		this.skillsGroup.controls['skills'].markAsDirty();
		if (this.skillModel) {
			this.skillModel.level = event.from;
		}
	}

	int2Label(level: number) {
		if (level < 33) {
			return 'Basic';
		} else if (level > 66) {
			return 'Expert';
		} else {
			return 'Pretty good';
		}
	}

	label2Int(label: string) {
		if (label === 'Basic') {
			return 33;
		} else if (label === 'Expert') {
			return 100;
		} else {
			return 66;
		}
	}

	updateSkill(skill: models.TechSkill) {
		this.updateMode = true;
		this.skillModel = skill;
		this.level = this.skillModel.level;
		this.updateSlider(this.skillModel.level);
		this.skillsGroup.setValue({
			'skills': this.skillModel.name
		});
	}

	updateSkillsForm(event) {
		let _e = event.srcElement || event.target;
		if (_e.value.length > 0) {
			this.skillsGroup.controls['skills'].markAsDirty();
		} else {
			this.skillsGroup.reset();
			this.skillsGroup.patchValue({
				'skills': ''
			});
		}
	}

	onSubmit(e: Event) {
		e.preventDefault();
		this.isSubmitting = true;
		this.dictionaryIndexed = true;

		if (this.skillModel.name !== null) {
			if (this.skillModel.name.length > 0 && this.skillModel.id === null) {
				this.dictionaryIndexed = false;

				let filteredByNameAndLevel = this.techSkillsClear.filter(skill => {
					return skill.name.toLowerCase() === this.skillModel.name.toLowerCase() && Number.parseInt(skill.level.toString()) === this.skillModel.level;
				});

				let filteredByName = this.techSkillsClear.filter(skill => {
					return skill.name.toLowerCase() === this.skillModel.name.toLowerCase() && Number.parseInt(skill.level.toString()) !== this.skillModel.level;
				});

				if (filteredByNameAndLevel.length > 0) {
					this.isSubmitting = false;
					this.updateSlider(1);
					this.hardreset();
				} else if (filteredByName.length > 0) {
					this.dictionaryIndexed = true;
					this.isSubmitting = false;
					this.updateSlider(1);
					this.updateMode = true;
					this.skillModel.id = Number.parseInt(filteredByName[0].id.toString());
				} else {
					this.dataService.dictionary_tech_post(this.skillModel.name).subscribe(
						response => {
							this.skillModel.id = response.id;

							let filteredById = this.techSkillsClear.filter(skill => {
								return Number.parseInt(skill.id.toString()) === this.skillModel.id;
							});

							if (filteredById.length > 0) {
								this.updateMode = true;
							}

							this.isSubmitting = false;
							this.updateSkills.emit(true);
							this.updateSlider(1);
							this.onSubmit(e);
						},
						error => {
							this.handleErrors(JSON.parse(error._body), error.status);
							this.isSubmitting = false;
						}
					);
				}
			}
		}

		if (this.dictionaryIndexed) {
			if (this.updateMode) {
				this.dataService.skills_put(this.authService.getUserId(), this.skillModel.id, this.skillModel.level).subscribe(
					response => {
						this.analyticsService.emitEvent('Skills', 'Update', 'Desktop', this.authService.currentUser.user_id);
						this.isSubmitting = false;
						this.updateSlider(1);
						this.updateSkills.emit(true);

						let filtered = this.techSkillsClear.filter(skill => {
							return Number.parseInt(skill.id.toString()) === this.skillModel.id;
						});

						if (filtered.length > 0) {
							filtered[0].level = this.skillModel.level;
						}

						this.hardreset();
						this.setMessage(true, 'Skill updated successfully');
					},
					error => {
						this.handleErrors(JSON.parse(error._body), error.status);
						this.isSubmitting = false;
					}
				);
			} else {
				this.dataService.skills_tech_post(this.authService.getUserId(), this.skillModel).subscribe(
					response => {
						this.analyticsService.emitEvent('Skills', 'Create', 'Desktop', this.authService.currentUser.user_id);
						this.isSubmitting = false;
						this.updateSlider(1);
						this.updateSkills.emit(true);
						this.hardreset();
						this.setMessage(true, 'Skill added successfully');
					},
					error => {
						this.handleErrors(JSON.parse(error._body), error.status);
						this.isSubmitting = false;
					}
				);
			}
		}
	}

	done(e: Event) {
		if (this.tourService.shown) {
			if (this.techSkillsClear.length > 0) {
				this.tourService.initSection(e);
			} else {
				this.tourService.sleep();
			}
		}

		this.onClose.emit(true);
	}

	onDelete(skill: models.TechSkill) {
		this.isSubmitting = true;
		this.skillModel = skill;
		this.dataService.skills_delete(this.authService.getUserId(), this.skillModel.id).subscribe(
			response => {
				this.analyticsService.emitEvent('Skills', 'Delete', 'Desktop', this.authService.currentUser.user_id);
				this.skillModel = {
					id: null,
					name: '',
					level: 1
				};
				this.updateSkills.emit(true);
				this.isSubmitting = false;
				this.updateMode = false;
			}
		);
	}

	search(event) {
		this.skillModel = {
			id: null,
			name: event.query,
			level: 1
		}

		if (!event.query.length) {
			return;
		}

		this.requesting = true;
		this.updateMode = false;
		this.dataService.dictionary_tech_get('focusareas', event.query).subscribe(
			response => {
				this.results = response;
				this.requesting = false;
			}
		);
	}

	onSelectAutoComplete(e) {
		for (let item of this.techSkillsClear) {
			if (item.id === e.id) {
				this.searchTerm = '';
				return;
			}
		}

		this.skillsGroup.setValue({
			'skills': e.name
		});

		this.updateMode = false;
		this.skillModel = e;
		this.updateLevel(1);
	}

	hardreset() {
		if (this.skillsAutocomplete.el.nativeElement.querySelector('input') !== null) {
			this.skillsAutocomplete.el.nativeElement.querySelector('input').value = '';
		}

		this.skillsGroup.reset();
		this.searchTerm = '';
		this.skillsGroup.patchValue({
			skills: ''
		});
		this.skillModel = {
			id: null,
			name: '',
			level: 1
		};

		this.skillsAutocomplete.hide();
	}
}
