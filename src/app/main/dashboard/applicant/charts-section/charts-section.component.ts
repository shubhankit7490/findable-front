import { Component, OnInit, ViewChild, Input, HostBinding } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ModalModule, Modal } from 'ngx-modal';
import { TimelineOptions } from 'vis';
// services:
import { TourService } from '../../../../services/tour.service';
import { DataService } from '../../../../rest/service/data.service';
import { AuthService } from '../../../../rest/service/auth.service';
import { MessageService } from '../../../../services/message.service';
import { AnalyticsService } from '../../../../services/analytics.service';
import { ChartService, ChartItems, ChartGroups } from '../../../../rest/service/chart.service';

// modesl:
import * as models from '../../../../rest/model/models';

import { ExperienceModalComponent } from '../../../../form/experience-modal/experience-modal.component';

@Component({
	selector: 'app-charts-section',
	templateUrl: './charts-section.component.html',
	styleUrls: ['./charts-section.component.css']
})
export class ChartsSectionComponent implements OnInit {
	@Input() userId: number;
	@ViewChild('skillsModal') modal: Modal;
	@ViewChild('educationModal') educationModal: Modal;
	@ViewChild('experienceModal') experienceModal: Modal;
	@ViewChild('experienceModalForm') experienceModalForm: ExperienceModalComponent;
	anon: boolean = false;
	eduFullModel: models.Education;

	experience$: Observable<models.Position[]>;
	experienceClear: models.Position[];
	experienceItems: ChartItems;
	experienceGroups: ChartGroups;
	experienceTemplate: Function;
	experienceOptions: TimelineOptions = {
		moveable: false,
		margin: {
			item: {
				vertical: 0
			}
		},
		end: new Date(),
		max: new Date()
	};

	focusItems: ChartItems;
	focusGroups: ChartGroups;
	focusTemplate: Function;
	focusOptions: TimelineOptions = {
		end: new Date(),
		stack: false,
		stackSubgroups: true,
		max: new Date()
	}

	education$: Observable<models.ExistingEducation[]>;
	educationItems: ChartItems;
	educationGroups: ChartGroups;
	educationTemplate: Function;
	educationOptions: TimelineOptions = {
		moveable: false,
		margin: {
			item: {
				vertical: 0
			}
		},
		end: new Date(),
		max: new Date()
	};

	techSkills: Observable<models.TechSkill[]>;
	techSkillsClear: models.TechSkill[];
	educationClear: models.ExistingEducation[];
	techSkillsItems: ChartItems;
	techSkillsGroups: ChartGroups;
	techSkillsOptions: TimelineOptions = {
		moveable: false,
		margin: {
			item: {
				vertical: 0
			}
		},
		rtl: false,
		start: 1,
		end: 100,
		min: 1,
		max: 100
	};

	private enums$: Observable<models.Enums>;
	public enumAllData: models.EmploymentType;

	private educationLevel$: Observable<models.EducationLevel[]>;
	public enumDataEducationLevels: models.EducationLevel[];

	public showAdditionalInfo = {
		experience: true,
		focus: true,
		education: true,
		techSkills: true
	};

	constructor(
		public dataService: DataService,
		public authService: AuthService,
		public messageService: MessageService,
		public analyticsService: AnalyticsService,
		public tourService: TourService,
	) { }

	closeSkillsModal() {
		this.modal.close();
	}

	closeExperienceModal() {
		this.experienceModal.close();
	}

	closeEducationModal() {
		this.educationModal.close();
	}

	actionOnCloseExperience() {
		this.analyticsService.emitEvent('Experience', 'Close', 'Desktop', this.authService.currentUser.user_id);

		if (!this.experienceClear.length) {
			this.tourService.sleep();
		}
	}

	actionOnCloseEducation() {
		this.analyticsService.emitEvent('Education', 'Close', 'Desktop', this.authService.currentUser.user_id);

		if (!this.educationClear.length) {
			this.tourService.sleep();
		}
	}

	actionOnCloseSkills() {
		this.analyticsService.emitEvent('Skills', 'Close', 'Desktop', this.authService.currentUser.user_id);

		if (!this.techSkillsClear.length) {
			this.tourService.sleep();
		}
	}

	actionOnOpenExperience() {
		this.analyticsService.emitEvent('Experience', 'Open', 'Desktop', this.authService.currentUser.user_id);

		let domLooker = setInterval(() => {
			if (!!document.getElementById('location')) {
				this.experienceModalForm.loadGmaps();
				clearInterval(domLooker);
			}
		}, 50);
	}

	actionOnOpenEducation() {
		this.analyticsService.emitEvent('Education', 'Open', 'Desktop', this.authService.currentUser.user_id);
	}

	actionOnOpenSkills() {
		this.analyticsService.emitEvent('Skills', 'Open', 'Desktop', this.authService.currentUser.user_id);
	}

	openExperience() {
		this.experienceModal.open();
	}

	updateTimelineComponent() {
		let skillChartWidth = (<HTMLElement>document.getElementById('skillChartComponent').querySelector('.vis-center')).style.width;
		let skillParsedChartWidth = Number.parseInt(skillChartWidth);
		let windowWidth = Number.parseInt((<HTMLElement>document.querySelector('.vis-horizontal')).style.width);
	}

	ngOnInit() {
		this.anon = (!this.authService.isLoggedIn || (this.userId !== this.authService.getUserId()))
		this.loadSkills();
		this.loadEducation();
		this.loadEnums();
		this.loadAllEnums();
		this.loadExperience();

		this.messageService.getMessage().subscribe(
			response => {
				if (response.action === 'OPEN_EXPERIENCE_MODAL') {
					this.openExperience();
				}
			}
		);
	}

	toggleAdditionalInfo(skill) {
		this.showAdditionalInfo[skill] = !this.showAdditionalInfo[skill];
	}

	loadExperience() {
		this.experienceItems = [];
		this.experienceGroups = [];
		this.focusItems = [];
		this.focusGroups = [];
		// Get experience data from dataService. This data is used for 2 charts: Experience and Focus.
		this.experience$ = this.dataService.experience_get(this.userId);
		// When data arrives convert it to charting format with the ChartService
		this.experience$.subscribe((response: models.Position[]) => {
			this.tourService.collect('experience', response.length === 0);
			this.tourService.collect('experience_edit', response.length === 0);

			this.experienceClear = response;
			let { items, groups, template } = ChartService.getExperienceChartData(response);
			this.experienceItems = items;
			this.experienceGroups = groups;
			this.experienceTemplate = template;

			let focusChartData = ChartService.getFocusChartData(response);
			this.focusItems = focusChartData.items;
			this.focusGroups = focusChartData.groups;
			this.focusTemplate = template;
		});
	}

	loadSkills() {
		this.techSkillsItems = [];
		this.techSkillsGroups = [];
		this.techSkills = this.dataService.skills_get(this.userId);
		this.techSkills.subscribe((response: models.TechSkill[]) => {
			// Update the tourService
			this.tourService.collect('skills', response.length === 0);
			this.tourService.collect('skills_edit', response.length === 0);

			this.techSkillsClear = response;
			this.changeStats('TECH', response.length);
			let { items, groups } = ChartService.getSkillsChartData(response);
			this.techSkillsItems = items;
			this.techSkillsGroups = groups;
		});
	}

	loadEducation() {
		this.educationItems = [];
		this.educationGroups = [];
		this.education$ = this.dataService.education_get(this.userId);
		this.education$.subscribe((response: models.ExistingEducation[]) => {
			// Update the tourService
			this.tourService.collect('education', response.length === 0);
			this.tourService.collect('education_edit', response.length === 0);

			this.educationClear = response;
			this.changeStats('EDUCATION', response.length);
			let { items, groups, template } = ChartService.getEducationChartData(response);
			this.educationItems = items;
			this.educationGroups = groups;
			this.educationTemplate = template;
		});
	}

	loadAllEnums() {
		if (this.authService.currentUser) {
			this.enums$ = this.dataService.dictionary_enums();
			this.enums$.subscribe((response: models.Enums) => {
				this.enumAllData = response.employment_type;
			});
		}
	}

	loadEnums() {
		if (this.authService.currentUser) {
			this.educationLevel$ = this.dataService.dictionary_education_levels();
			this.educationLevel$.subscribe((response: models.EducationLevel[]) => {
				this.enumDataEducationLevels = response;
			});
		}
	}

	generateChartLabels() {
		return ['Basic', 'Pretty good', 'Expert'];
	}

	generateChartNumbers(min, max) {
		let nums = [];
		for (let i = min; i <= max; ++i) {
			nums.push(i * 10);
		}
		;
		return nums;
	}

	onUpdateSkills(event?) {
		this.loadSkills();
	}

	onUpdateEducation(event?) {
		this.loadEducation();
	}

	onUpdateExperience(event?) {
		this.loadExperience();
	}

	changeStats(_parent: string, num: number) {
		this.messageService.sendMessage({
			action: 'CHANGE_PROFILE_COMPLETION_POINTS',
			data: {parent: _parent, status: num}
		});
	}

}
