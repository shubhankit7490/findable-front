import { Component, OnInit, ViewChild,Output, ViewChildren, QueryList,AfterViewInit,ElementRef,EventEmitter } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Location } from '@angular/common';
import { Subscription, Observable } from 'rxjs';
import { DataTable } from 'interjet-primeng/components/datatable/datatable'; 

// models
import * as models from '../../rest/model/models';
import { Modal } from 'ngx-modal';
// Services
import { DataService } from '../../rest/service/data.service';
import { AuthService } from '../../rest/service/auth.service';
import { GrowlService } from '../../rest/service/growl.service';
import { MessageService } from '../../services/message.service';
import { AnalyticsService } from '../../services/analytics.service';
import { ChartDataService } from '../../services/chart-data.service';

import { UserPreferencesExt } from '../../rest/service/extended-models/UserPreferencesExt';
// components
import { OnPurchaseData, PurchaseApplicantComponent } from '../../shared/purchase-applicant/purchase-applicant.component';
import { EmitArraySelector, ArraySelectorComponent } from '../../shared/array-selector/array-selector.component';
import { RatingSliderComponent, RatedItem } from '../../shared/rating-slider/rating-slider.component';
import { NoteComponent } from '../../shared/note/note.component';
import { PreferencesFormComponent } from '../../form/preferences-form/preferences-form.component';
import { TourService } from '../../services/tour.service';
import * as JSZip from 'jszip';
import { saveAs } from 'file-saver';
declare let JSZipUtils: any;
@Component({
	selector: 'app-search',
	templateUrl: './search.component.html',
	styleUrls: ['./search.component.css']
})

export class SearchComponent implements OnInit,AfterViewInit {
	@ViewChild('table') table: DataTable;
	@ViewChild('actionSelector') actionSelector: ArraySelectorComponent;
	@ViewChild('candidateTypeSelector') candidateTypeSelector: ArraySelectorComponent;
	@ViewChild('purchaseApplicantBlock') purchaseApplicantBlock: PurchaseApplicantComponent;
	@ViewChild('jobTitleComponent') jobTitleComponent;
	@ViewChild('skillsComponent') skillsComponent;
	@ViewChild('educationLevelComponent') educationLevelComponent;
	@ViewChild('lastUpdatedComponent') lastUpdatedComponent;
	@ViewChild('preferencesModal') preferencesModal: Modal;
	@ViewChild('preferencesModalForm') preferencesModalForm: PreferencesFormComponent;
	@ViewChildren(NoteComponent) noteComponents: QueryList<NoteComponent>
	@ViewChildren(PreferencesFormComponent) preferencesFormComponent: QueryList<PreferencesFormComponent>
	@Output() onLoaded = new EventEmitter<any>();
	
	public preferences$: Observable<UserPreferencesExt>;
	private preferencesClear: UserPreferencesExt;
	public enums: models.Enums;
	public selectedApplicants = [];
	public results: models.ApplicantsSearchResultProfiles = {};
	public total: number;
	public user_id: number;
	public user_status: string;
	public currentResultsCount = 0;
	public firstVisit = false;
	public selectedid='all';
	// Applicant purchase
	public purchaseVisible = false;
	public applicantsToPurchase: number[] = [];
	public applicant_chnage_status: number[] = [];
	public applicant_resume_url: string[] = [];

	// Job title
	public selectedJobTitles: models.JobTitle[] = [];

	// Experience
	public company: models.Company = null;
	public industry: models.Industry = null;
	public responsibilities: models.AreaOfFocus[] = [];
	public school: models.DictionaryItem = null;
	public updated: number;
	
	public minYears = 0;
	public maxYears = 30;
	public prefrence=null;
	// Education
	public selectedEducationLevel: models.DictionaryItem[] = [];
	public educationLevels: models.DictionaryItem[] = [];
	public uploadedCandidate: models.UploadCandidate[] = [];
	public totaluploadedCandidate=0;
	// Skills
	@ViewChild('skillSlider') skillSlider: RatingSliderComponent;
	public selectedSkills: models.TechSkill[] = [];
	
	// Personal
	public selectedLanguages: models.DictionaryItem[] = [];
	public selectedTraits: models.Trait[] = [];

	// Preferences
	public minSalary = 0;
	public maxSalary = 1000000;

	// Search functionality
	public offset = 0;
	public orderby = 'salary';
	public order = 'asc';
	public loadingResults: boolean = false;
	public resetingSearch: boolean = false;
	// sortTypes = [
	// 	{id: 'location', name: 'Location'},
	// 	{id: 'jobtitle', name: 'Job Title'},
	// 	{id: 'experience', name: 'Experience'},
	// 	{id: 'seniority', name: 'Seniority'},
	// 	{id: 'salary', name: 'Salary'}
	// ]

	public salaryTypes = [
		{ id: 'H', name: 'Hourly' },
		{ id: 'M', name: 'Monthly' },
		{ id: 'Y', name: 'Annually' },
	]

	public candidateTypes = [
		/*{ id: 'uploaded candidates', name: 'Uploaded Candidates' },*/
		{ id: 'initial', name: 'Initial contact' },
		{ id: 'short', name: 'Short listed' },
		{ id: 'hired', name: 'Hired' },
		{ id: 'interviewing', name: 'Interviewing' },
		{ id: 'irrelevant', name: 'Irrelevant' },
		{ id: 'rejected-expensive', name: 'Rejected – Too expensive' },
		{ id: 'rejected-experience', name: 'Rejected – Not enough experience' }
	]
	public candidateTypes_my = [
		{ id: 'all', name: 'All Candidates' },
		{ id: 'uploaded candidates', name: 'My Candidates' },
	]
	// orderTypes = [
	// 	{id: 'asc', name: 'Ascending'},
	// 	{id: 'desc', name: 'Descending'}
	// ]

	public actions = [
		{ id: 'fulldetails', name: 'Contact Recruiter' },
		{ id: 'open', name: 'Open / Close selected' }
	];

	public actions_uploded_candidate = [
		{ id: 'fulldetails', name: 'Email Candidate' },
		{ id: 'open', name: 'Open / Close selected' },
		{ id: 'addtomarket', name: 'Add to market' },
		{ id: 'removefrommarket', name: 'Remove from market'},
		{ id: 'deleteandremove', name: 'Delete & Remove'},
		/*{ id: 'print', name: 'print'},*/
		{ id: 'download_resume', name: 'Download Resume'},
	];

	public searchModel: models.ApplicantsSearchProfileParsed | models.ApplicantsSearchProfile = {
		jobtitles: [],
		experience_from: null,
		experience_to: null,
		location: {
			continent_id: null,
			continent_name: '',
			city_id: null,
			city_name: '',
			state_id: null,
			state_name: '',
			country_id: null,
			country_name: '',
			country_short_name_alpha_3: '',
			country_short_name_alpha_2: '',
		},
		position_type: 'full time',
		company_id: null,
		seniority: null,
		industry: null,
		technical_abillities: [],
		areas_of_focus: [],
		education_level: [],
		school_name: null,
		languages: [],
		traits: [],
		salary_from: {
			salary: null,
			salary_period: ''
		},
		salary_to: {
			salary: null,
			salary_period: ''
		},
		benefits: '',
		employment_status: '',
		relocation: false,
		legal_usa: null,
		updated: null,
		status: null,
		uploaded_date: null,
		user_type: null,
		account_id: null,
		user_name: null,
	}

    // Summary variables
	public avgExperience: number = null;
	public avgSalary = '0';
	public avgSalaryMonthly = '0';
	public totalSalary = '0';

	// Temporary data holder
	private tmpJobtitle = '';
	private tmpCompany = '';
	private tmpIndustry = '';
	private tmpSchool = '';
	private tmpSkill = '';
	private tmpResponsibility = '';
	private tmpLanguage = '';
	private tmpTrait = '';
	private tmpEducationlevel = '';

	public jobTitleQuery: string = '';
	public skillQuery = '';
	public responsibilityQuery = '';
	public languageQuery = '';
	public traitQuery = '';
	public educationLevelQuery = '';

	public role: string;

	constructor(
		private authService: AuthService,
		private dataService: DataService,
		private chartDataService: ChartDataService,
		private messageService: MessageService,
		private location: Location,
		private analyticsService: AnalyticsService,
		private activatedRoute: ActivatedRoute,
		private router: Router,
		private elementRef: ElementRef,
		public tourService: TourService,
	) {
		this.role = this.authService.currentUser.role;
	}

	ngOnInit() {

		this.getEnums();
		this.getEducationLevels();
		this.getUploadDetail();
		this.getPreferences();
		this.activatedRoute.queryParams.subscribe(params => {
			if (params['first']) {
				this.firstVisit = true;
			}
			if(params['page']=='upload-resume'){
					this.searchModel.user_type='uploaded candidates';
			}
			if(params['uploaded_id']!='' && params['uploaded_id']!=undefined){
					this.searchModel.uploaded_date =params['uploaded_id'];
			}
			if(params['code']!='' && params['code']!=undefined){
					this.setauthtoken(params['code'],params['scope']);
			}
			if (params['token']) {
					this.getSearchModelByToken(params['token']);
				
			} else {
				/**
				 * When navigating to Account Settings and returning, the route will not have a token
				 * and a initial default search will be performed
				 */
				this.performSearch();
			}
		});

		this.messageService.getMessage().subscribe(
			response => {
				if (response.action === 'CONTACT_APPLICANT') {
					this.applicantsToPurchase = [response.data];
					this.analyticsService.emitEvent('Search', 'Contact', 'Desktop', this.authService.currentUser.user_id);
					this.openPurchase();
				}
			}
		);

		this.analyticsService.emitPageview('Search');
	}
	setauthtoken(token,scope){
		this.dataService.set_auth_token(token,scope).subscribe(
			(res:any) => {
				if(res.status==1){
					GrowlService.message(res.message, 'success');
				}else if(res.status==0){
					GrowlService.message(res.message, 'error');
				}
				
			},
			error => {
				GrowlService.message(JSON.parse(error._body).message, 'error');
			}
		)
	}
	getPreferences() {
		this.preferences$ = this.dataService.preferences_get(261);

		this.preferences$.subscribe(
			(response: UserPreferencesExt) => {
				this.preferencesClear = response;
				// Update the tourService
				/*this.tourService.collect('status', response.employment_status === null);
				this.tourService.collect('status_edit', response.employment_status === null);
				this.onLoaded.emit(true);*/
			},
			error => {
				/*this.onLoaded.emit(false);*/
			}
		);
	}
	public handleResetButton() {
		this.resetingSearch = true;

		this.searchModel = {
			jobtitles: [],
			experience_from: null,
			experience_to: null,
			location: {
				continent_id: null,
				continent_name: '',
				city_id: null,
				city_name: '',
				state_id: null,
				state_name: '',
				country_id: null,
				country_name: '',
				country_short_name_alpha_3: '',
				country_short_name_alpha_2: '',
			},
			position_type: 'full time',
			company_id: null,
			seniority: null,
			industry: null,
			technical_abillities: [],
			areas_of_focus: [],
			education_level: [],
			school_name: null,
			languages: [],
			traits: [],
			salary_from: {
				salary: null,
				salary_period: ''
			},
			salary_to: {
				salary: null,
				salary_period: ''
			},
			benefits: '',
			employment_status: '',
			relocation: false,
			legal_usa: null,
			updated: null,
			account_id: null,
		}
		this.selectedTraits = [];
		this.selectedSkills = [];
		this.responsibilities = [];
		this.selectedJobTitles = [];
		this.selectedLanguages = [];
		this.industry = { id: null, name: '' };
		this.company = { id: null, name: '' };
		this.school = { id: null, name: '' };

		// Hard reset (Jobtitle)
		this.jobTitleQuery = '';
		this.tmpJobtitle = '';
		this.selectedJobTitles = [];
		this.jobTitleComponent.tagInput.autocompleteElement.input.value = "";

		// Hard reset (Skills)
		this.skillSlider.slider.update({from: 1})

		// Hard reset (Education level tags)
		this.educationLevelComponent.tags = [];
		
		// Hard reset (Profile updated)
		this.lastUpdatedComponent.selectedItem = 'undefined';

		this.performSearch(true);
	}

	public onSubmit(e: Event) {
		e.preventDefault();
		e.stopPropagation();
		this.performSearch(true);
	}

	/**
	 * Get a saved search object by providing a token
	 */
	private getSearchModelByToken(token: string) {
		this.dataService.search_token_get(token).subscribe(
			(response: models.ApplicantsSearchProfileParsed) => {
				let r = response;

				this.searchModel = this.mapSearchData(response);
				this.performSearch();
			},
			error => {
				//console.log('@search > getSearchModelByToken [ERROR]:', error);
				GrowlService.message(JSON.parse(error._body).message, 'error');
			}
		);
	}

	private mapSearchData(data: models.ApplicantsSearchProfileParsed | models.ApplicantsSearchProfile): models.ApplicantsSearchProfileParsed | models.ApplicantsSearchProfile {
		this.parseJobTitles(data.jobtitles);
		this.company = (data.company_id) ? data.company_id : null;
		this.industry = (data.industry) ? data.industry : null;
		this.parseSkills(data.technical_abillities);
		this.parseResponsibilities(data.areas_of_focus);
		this.parseLanguages(data.languages);
		this.parseTraits(data.traits);
		this.parseEducationLevel(data.education_level);

		this.school = (data.school_name) ? data.school_name : null;
		this.updated = (Number(data.updated)) ? Number(data.updated) : null;

		data.seniority = (data.seniority) ? data.seniority['id'] : null;
		data.school_name = (data.school_name) ? data.school_name : null;
		data.industry = (data.industry) ? data.industry : null;
		data.company_id = (data.company_id) ? data.company_id : null;

		return data;
	}

	private parseTraits(data: models.DictionaryItem[]) {
		if (!data || !data.length) {
			this.selectedTraits = [];
		} else {
			this.selectedTraits = data.filter(trait => {
				return trait['id'] !== null;
			});

			let traitsFreeText = data.filter(trait => {
				return trait['id'] === null;
			});

			if (traitsFreeText.length > 0) {
				this.traitQuery = traitsFreeText[0]['name'];
			}
		}

		this.onTraitSelection();
	}

	private parseLanguages(data: models.DictionaryItem[]) {
		if (!data || !data.length) {
			this.selectedLanguages = [];
		} else {
			this.selectedLanguages = data.filter(language => {
				return language['id'] !== null;
			});

			let languagesFreeText = data.filter(language => {
				return language['id'] === null;
			});

			if (languagesFreeText.length > 0) {
				this.languageQuery = languagesFreeText[0]['name'];
			}
		}

		this.onLanguageSelection();
	}

	private parseResponsibilities(data: models.DictionaryItem[]) {
		if (!data || !data.length) {
			this.responsibilities = [];
		} else {
			this.responsibilities = data.filter(skill => {
				return skill['id'] !== null;
			});

			let responsibilitiesFreeText = data.filter(responsibility => {
				return responsibility['id'] === null;
			});

			if (responsibilitiesFreeText.length > 0) {
				this.responsibilityQuery = responsibilitiesFreeText[0]['name'];
			}
		}
	}

	private parseSkills(data: models.TechSkill[]) {
		if (!data || !data.length) {
			this.selectedSkills = [];
		} else {
			this.selectedSkills = data.filter(skill => {
				return skill['id'] !== null;
			});

			let skillFreeText = data.filter(skill => {
				return skill['id'] === null;
			});

			if (skillFreeText.length > 0) {
				this.skillQuery = skillFreeText[0]['name'];
			}
		}
	}

	private parseEducationLevel(levels: models.DictionaryItem[]) {
		if (!levels) {
			this.selectedEducationLevel = [];
		} else {
			this.selectedEducationLevel = levels
				.filter(
					({ id }: models.DictionaryItem): boolean => id !== null
				);

			let educationLevelFreeText = levels
				.filter(
					({ id }: models.DictionaryItem): boolean => id === null
				)[0];

			if (educationLevelFreeText) {
				this.educationLevelQuery = String(educationLevelFreeText.id);
			}
		}

		this.onEducationSelected();
	}

	private parseJobTitles(data: models.DictionaryItem[]) {
		if (!data) {
			this.selectedJobTitles = [];
		} else {
			this.selectedJobTitles = data.filter(jobtitle => {
				return jobtitle['id'] !== null;
			});

			let jobtitlesFreeText = data.filter(jobtitle => {
				return jobtitle['id'] === null;
			});

			if (jobtitlesFreeText.length > 0) {
				this.jobTitleQuery = jobtitlesFreeText[0]['name'];
			}
		}

		this.onJobTitleChange();
	}

	/**
	 * Job Title - on job title selection
	 */
	public onJobTitleChange(jobTitle?: models.JobTitle) {
		this.tmpJobtitle = '';
		this.searchModel.jobtitles = this.selectedJobTitles.map(
			(value, index) => value
		);
	}

	public onJobTitleUpdate(event: Event) {
		this.tmpJobtitle = (event.srcElement as HTMLInputElement).value;
	}

	/**
	 * Job Title - on job title removal
	 */
	public onJobTitleRemove(id: number) {
		this.selectedJobTitles = this.selectedJobTitles.filter(value => {
			return Number(id) !== Number(value.id)
		});

		this.searchModel.jobtitles = this.selectedJobTitles
			.filter(value => {
				return Number(id) !== Number(value.id);
			})
			.map(value => {
				return value;
			});

		this.performSearch();
	}


	/**
	 * Years Experience - on time span selection
	 */
	public onYearsChosen(event) {
		this.searchModel.experience_to = event.to;
		this.searchModel.experience_from = event.from;
	}

    /**
     * Position type - on position type selection
     */
	public onPositionTypeSelected(event) {
		this.searchModel.position_type = (event.item.id === 'null') ? null : event.item.name;
	}

	/**
	 * On location selection
	 */
	public onLocationSelected(location: models.Location) {
		this.searchModel.location = location;
	}

	/**
	 * Experience - on company name selection
	 */
	public onCompanyNameSelected(event) {
		this.tmpCompany = '';
		this.searchModel.company_id = event.item;
	}

	public onCompanyNameChange(event) {
		this.tmpCompany = (event.item.srcElement as HTMLInputElement).value;
	}

    /**
     * Experience - on seniority selection
     */
	public onSenioritySelection(event) {
		this.searchModel.seniority = (event.item.id === 'null') ? null : event.item.id;
	}

	/**
	 * Experience - on industry selection
	 */
	public onIndustrySelected(event) {
		this.tmpIndustry = '';
		this.searchModel.industry = event.item;
	}

	public onIndustryChange(event) {
		this.tmpIndustry = event.item.srcElement.value;
	}

	/**
	 * Tech Abilities - on skill selection
	 */
	public onSkillSelected(item) {
		item.level = 1;
		for (let i = 0; i < this.selectedSkills.length; i++) {
			if (this.selectedSkills[i].id == item.id) {
				return false;
			}
		}

		this.tmpSkill = '';
		this.selectedSkills.push(item);

		this.skillSlider.selectItem(this.skillSlider.items.indexOf(item));

		this.searchModel.technical_abillities = this.selectedSkills;
	}

	public onSkillChange(event) {
		let _e = event.srcElement || event.target;
		this.tmpSkill = _e.value;
	}

	/**
	 * Responsibilities - on responsibility selection
	 */
	public onResponsibilitySelected(item: models.DictionaryItem) {
		for (let i = 0; i < this.searchModel.areas_of_focus.length; i++) {
			if (this.searchModel.areas_of_focus[i].id == item.id) {
				return false;
			}
		}

		this.tmpResponsibility = '';
		if (this.searchModel.areas_of_focus === null) {
			this.searchModel.areas_of_focus = [];
		}

		this.searchModel.areas_of_focus.push(item);
	}

	public onResponsibilityChanged(event: Event) {
		this.tmpResponsibility = (event.srcElement as HTMLInputElement).value;
	}

	public onResponsibilityRemoved(id: number) {
		this.searchModel.areas_of_focus = this.searchModel.areas_of_focus
			.filter((value: models.DictionaryItem): boolean => {
				return id !== value.id;
			});
	}

    /**
     * Education - on education selection
     */
	public onEducationSelected(item?: models.DictionaryItem) {
		this.tmpEducationlevel = '0';
		
		this.searchModel.education_level = this.selectedEducationLevel
			.map( (value, index) => value );
	}

	public onEducationLevelRemove(id: number) {
		this.selectedEducationLevel = this.selectedEducationLevel
			.filter( value => ( Number(id) !== Number(value.id) ) );

		this.searchModel.education_level = this.selectedEducationLevel
			.filter( value => ( Number(id) !== Number(value.id) ) )
			.map( value => value );
	}

	/**
	 * Education - on school selection
	 */
	public onSchoolSelected(school: models.DictionaryItem) {
		this.tmpSchool = '';
		this.searchModel.school_name = school;
	}

	public onSchoolChange(event: Event) {
		this.tmpSchool = (event.srcElement as HTMLInputElement).value;
	}

	/**
	 * Personal - on language selection
	 */
	public onLanguageSelection(language?: models.DictionaryItem) {
		this.tmpLanguage = '';
		this.searchModel.languages = this.selectedLanguages.map(
			(value, index): models.DictionaryItem => value );
	}

	public removeSelectedLanguage(id: number) {
		this.selectedLanguages = this.selectedLanguages
			.filter( value => ( Number(id) !== Number(value.id) ) );

		this.searchModel.languages = this.selectedLanguages
			.filter( value => ( Number(id) !== Number(value.id) ) )
			.map( value => value );
	}

	public onLanguageChange(event) {
		this.tmpLanguage = event.srcElement.value;
	}

	/**
	 * Personal - on trait selection
	 */
	public onTraitSelection(event?: models.Trait) {
		this.tmpTrait = '';
		this.searchModel.traits = this.selectedTraits
			.map( (value, index): models.DictionaryItem => value );
	}

	public onTraitChange(event) {
		this.tmpTrait = event.srcElement.value;
	}

	public onSalaryChanged(event) {
		this.searchModel.salary_from.salary = event.from;
		this.searchModel.salary_to.salary = event.to;
	}

	public onSalaryPeriodSelected(value, doSearch: boolean) {
		if (value === 'null' || value == 'Period') {
			this.searchModel.salary_from.salary_period = this.searchModel.salary_to.salary_period = null;
		} else {
			this.searchModel.salary_from.salary_period = this.searchModel.salary_to.salary_period = value;
		}

		if (doSearch) {
			this.performSearch();
		}
	}

    /**
     * Preferences - on benefit selection
     */
	public onBenefitSelected(event) {
		this.searchModel.benefits = (event.item.id === 'null') ? null : event.item.id;
	}

    /**
     * Preferences - on employment status selection
     */
	public onEmploymentSelected({ item }: models.EmitItem) {
		this.searchModel.employment_status = (item.id === 'null') ? null : item.name;
	}

    /**
     * Preferences - on profile last updated selection
     */
	public onProfileLastUpdatedSelected({ item }: models.EmitItem ) {
		this.searchModel.updated = (item.id === 'null') ? null : item.id;
	}

	public onCandidateTypeSelected(typeObject: EmitArraySelector) {

		switch (typeObject.item.id) {
			case 'all':
				this.router.navigate(['/'], { skipLocationChange: true })
					.then(() => { this.router.navigate(['business/search']); });
			break;
			case 'initial':
			case 'short':
			case 'hired':
			case 'interviewing':
			case 'my candidates':
			case 'rejected-expensive':
			case 'rejected-experience':
			case 'uploaded candidates':
			case 'irrelevant':
				this.searchModel['status'] = typeObject.item.id;
				this.performSearch();
			break;
			default:
				this.searchModel['status'] = null;
				this.performSearch();
			break;
		}
	}

	public onUploadedDateSelected(event) {
		//console.log(event.target.value);
		this.searchModel.uploaded_date = (event.target.value === 'null') ? null : event.target.value;
		this.performSearch();
	}
	public onUploadedusertypeSelected(typeObject: EmitArraySelector) {
		//console.log(event.target.value);
		this.selectedid=typeObject.item.id;
		this.searchModel.user_type = (typeObject.item.id === 'null') ? null : typeObject.item.id;
		this.performSearch();
	}
	public onSortTypeSelected(type: string) {
		this.order = 'asc';
		this.orderby = type;
		this.performSearch();
	}

	public onOrderTypeSelected(type: string) {
		this.order = type;
		this.performSearch();
	}
	// upload multiple resume
	public downloadresume(){
		var zip = new JSZip();
		var count = 0;
		var totalresume=this.table.selection.length;
		var zipFilename = "Resumes.zip";
		this.table.selection.forEach(function(value){
			var filedata = value.resume_url.split('/').pop();
		    var filextention = filedata.split('.').pop();
		    var filename = value.firstname+value.id+'.'+filextention;
		  if(value.resume_url){
			  
			  JSZipUtils.getBinaryContent(value.resume_url, function (err, data) {
			    if(data){
			     	zip.file(filename, data, {binary:true});
			    }
				count++;
			     if (count == totalresume) {
			     	 zip.generateAsync({type:'blob'}).then(function(content) {
					      saveAs(content, zipFilename);
					  });
			     }
			  });
			}
		});	
	}
	// print resume 
	public  printResume() {
		
		this.table.selection.forEach(function(value){
			window.open('https://drive.google.com/viewerng/viewer?url='+value.resume_url+'',"_blank");
		});

		 // window.open('https://drive.google.com/viewerng/viewer?url=',"_blank");
	}
	public updateuserstatus(status: string){
		this.applicant_chnage_status = this.table.selection
		.filter(value => {
			return Number(value.id);
		})
		.map(value => {
			return Number(value.id);
		});
		
		this.dataService.update_applicant_status(status,this.authService.currentUser.user_id,this.applicant_chnage_status).subscribe(
			(response: models.PurchasedSuccess) => {
				GrowlService.message('update successful', 'success');
				if(status=='deleteandremove'){
					this.performSearch(true);
				}else{
					this.applicant_chnage_status.forEach(value => {
					this.onchnagestatus(value);
					})
				}
			},
			error => {
				GrowlService.message(JSON.parse(error._body).message, 'error');
			}
		)
	}
	public onActionSelected(event) {		
		switch (event.item.id) {
			case 'fulldetails':
				this.applicantsToPurchase = this.table.selection
					.filter(value => {
						return value.id;
					})
					.map(value => {
						return value.id;
					});

				this.openPurchase();
			break;

			case 'open':
				this.table.selection.forEach(row => {
					this.table.toggleRow(row, event.originalEvent);
				});
			break;
			case 'addtomarket':
				if(confirm("Are you sure want to add to market place")) {
				    this.updateuserstatus('addtomarket');	
				  }
			break;
			case 'removefrommarket':
				if(confirm("Are you sure want to remove from market place")) {
				    this.updateuserstatus('removefrommarket');
				  }
			break;
			case 'deleteandremove':
				if(confirm("Are you sure want to delete and remove from market place")) {
				    this.updateuserstatus('deleteandremove');
				  }
			break;
			case 'print':
				this.printResume();
			break;
			case 'download_resume':
				this.downloadresume();
			break;
		}
	}
	private openPurchase() {
		this.purchaseVisible = true;
	}

	public closePurchase(data) {
		this.purchaseVisible = false;
	}

	public onPurchase(profile: OnPurchaseData) {
		this.purchaseVisible = false;
		if (profile) {
			this.messageService.sendMessage({ name: 'RELOAD_PROFILE', data: profile.data.userId });
		}
		this.dataService.profile_get(profile.data.userId,0).subscribe(
			response => {
				let value = this.table.value.find(value => value.id == profile.data.userId && value );
				Object.assign(value, response);
			}
		);
	}

	public onchnagestatus(userid) {
		this.purchaseVisible = false;
		if (userid) {
			this.messageService.sendMessage({ name: 'RELOAD_PROFILE', data: userid });
		}
		this.dataService.profile_get(userid,1).subscribe(
			response => {
				let value = this.table.value.find(value => value.id == userid && value );
				Object.assign(value, response);
			}
		);
	}
	public loadData(event) {
		this.offset = event.first;

		this.performSearch();
	}

	public performSearch(resetOffset = false) {
		this.prependData();

		this.loadingResults = true;

		if (!Number(this.searchModel.account_id)) {
			this.searchModel.account_id = null;
		}

		if (resetOffset && this.currentResultsCount > 0) {
			this.offset = 0;

			// When the search model is updated, reseting the table should trigger the OnLazyLoad event
			this.table.reset();
			this.resetingSearch = false;
		} else {
			this.dataService.search_applicants_post(this.offset, this.orderby, this.order, this.searchModel).subscribe(
				(response: models.ApplicantsSearchResultProfiles) => {
					this.analyticsService.emitEvent('Search', 'Search', 'Desktop', this.authService.currentUser.user_id);
					// console.log('@search performSearch results:', response);
					this.results = response;
					this.total = response.total;
					this.currentResultsCount = response.applicants.length;

					// Parse the summary of the result
					this.setAvarageExperience(response.applicants);
					this.setAvarageMonthlySalary(response.applicants);

					this.loadingResults = false;
					this.resetingSearch = false;
					this.location.replaceState(`/business/search?token=${response.token}`);
				},
				error => {
					this.loadingResults = false;
					this.resetingSearch = false;
					GrowlService.message(JSON.parse(error._body).message, 'error');
				}
			);
		}
	}

	/**
	 * Event to be fired on table row click
	 */
	public onRowClick(event) {
		if((event.originalEvent.target).className!='glyphicon glyphicon-edit'){
		this.analyticsService.emitEvent('Search', 'Open', 'Desktop', this.authService.currentUser.user_id);
		this.toggleCurrentRow(event);
				}
	}

	private toggleCurrentRow(event) {
		let row_id = Number(event.data.id);
		
		this.table.toggleRow(event.data, event.originalEvent);


		setTimeout(() => {
			//this.table.selection = this.table.expandedRows;
		}, 0);
	}

	// Close all opened notes
	private closeNotes() {
		if (this.noteComponents && this.noteComponents['_results']) {
			this.noteComponents['_results'].forEach(note => {
				note.close();
			});
		}
	}

	/** On note icon click */
	public onNoteClick() {
		this.closeNotes();
	}

	private getEnums() {
		this.dataService.dictionary_enums().subscribe(
			response => {
				this.enums = response;
			}
		);
	}

	private getEducationLevels() {
		this.dataService.dictionary_education_levels().subscribe(
			(response: models.EducationLevel[]) => {
				this.educationLevels = response;
			},
			error => {
				//console.log('@search > getEducationLevel [ERROR]:', error);
			}
		)
	}

	private getUploadDetail() {
		this.dataService.dictionary_uploaded_candidate().subscribe(
			(response: models.UploadCandidate[]) => {
				this.uploadedCandidate = response;
				this.totaluploadedCandidate=this.uploadedCandidate.length;
			},
			error => {
				//console.log('@search > getEducationLevel [ERROR]:', error);
			}
		)
	}

	/**
	 * format number to a human readable number with a separator
	 * @param {number} number applicant salary
	 * @param {string} sep number separator
	 */
	formatNumber(value, sep) {
		if (!sep) {
			sep = ',';
		}
		if (!value && value !== 0) {
			return;
		}
		if (value.toString() === value.toLocaleString()) {
			let parts = value.toString().split('.')
			parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, sep);
			value = parts[1] ? parts.join('.') : parts[0];
		} else {
			value = value.toLocaleString();
		}

		return value;
	};

	getRowClass(data, index) {
		let className = 'fnd-search-row';

		if (!!data.firstname || !!data.lastname) {
			className += ' applicant-row-purchased';	
		}

		return className;
	}

	public loadSavedSearch(savedSearch: models.ApplicantsSearchProfileParsed): void {
		this.searchModel = this.mapSearchData(savedSearch);
		this.performSearch();
	}

	public saveSearchItemDeleted(deletedSavedSearch: models.SavedSearch) {
		this.location.replaceState(`/business/search?token=${this.results.token}`);
	}

	public closeWelcomeScreen(): void {
		this.firstVisit = false;
		this.location.replaceState('/business/search');
	}

	private setAvarageExperience(collection: models.ApplicantsSearchResultProfile[] = []) {
		let avg = 0;
		collection.forEach(function(item){
			if (!!item.experience) {
				avg += Number.parseFloat(String(item.experience));
			}
		});

		this.avgExperience = Number((avg / collection.length).toFixed(1));
		if (isNaN(this.avgExperience)) {
			this.avgExperience = 0;
		}
	};

	private setAvarageMonthlySalary(collection = []) {
		let sum = 0, count = 0, total = 0, annual = 0;
		collection.forEach((item) => {
			// added the condition for excuding the users with $0 in average calculation//
			if (!!item.salary.salary && !!item.salary.salary_period && item.salary.salary>0) {
				total += Number.parseFloat(item.salary.salary);
				switch (item.salary.salary_period) {
					case 'M':
						annual += Number.parseFloat(item.salary.salary) * 12;
						sum += Number.parseFloat(item.salary.salary);
						count++;
						break;
					case 'W':
						annual += Number.parseFloat(item.salary.salary) * 48;
						sum += Number.parseFloat(item.salary.salary) * 4;
						count++;
						break;
					case 'Y':
						annual += Number.parseFloat(item.salary.salary);
						sum += Number.parseFloat(item.salary.salary) / 12;
						count++;
						break;
				}
			}
		});
		this.avgSalary = annual > 1 ? this.formatNumber(Number.parseFloat((annual / count).toFixed(1)), ',') : 0;
		this.totalSalary = this.formatNumber(Number.parseFloat(total.toFixed(1)), ',');
		this.avgSalaryMonthly = sum > 1 ? this.formatNumber(Number.parseFloat((sum / count).toFixed(1)), ',') : 0;
	}

	OnDestroy() {
	}

	public prependData() {
		let found = 0;
		if (this.tmpJobtitle.length > 0) {
			if (this.searchModel.jobtitles === null) {
				this.searchModel.jobtitles = [{
					id: null,
					name: this.tmpJobtitle
				}];
			} else {
				found = this.searchModel.jobtitles.filter(item => {
					return item.name === this.tmpJobtitle;
				}).length;
				if (!found ) {
					this.searchModel.jobtitles.push({
						id: null,
						name: this.tmpJobtitle
					});
				}
			}
		}

		if (this.tmpCompany.length > 0) {
			this.searchModel.company_id = {
				id: null,
				name: this.tmpCompany
			};
		}

		if (this.tmpIndustry.length > 0) {
			this.searchModel.industry = {
				id: null,
				name: this.tmpIndustry
			};
		}

		if (this.tmpSchool.length > 0) {
			this.searchModel.school_name = {
				id: null,
				name: this.tmpSchool
			};
		}

		if (this.tmpSkill.length > 0) {
			if (this.searchModel.technical_abillities === null) {
				this.searchModel.technical_abillities = [{
					id: null,
					name: this.tmpSkill,
					level: 1
				}];
			} else {
				found = this.searchModel.technical_abillities.filter(item => {
					return item.name === this.tmpSkill;
				}).length;
				if (!found ) {
					this.searchModel.technical_abillities.push({
						id: null,
						name: this.tmpSkill,
						level: 1
					});
				}
			}
		}

		if (this.tmpResponsibility.length > 0) {
			if (this.searchModel.areas_of_focus === null) {
				this.searchModel.areas_of_focus = [{
					id: null,
					name: this.tmpResponsibility
				}];
			} else {
				found = this.searchModel.areas_of_focus.filter(item => {
					return item.name === this.tmpResponsibility;
				}).length;
				if (!found ) {
					this.searchModel.areas_of_focus.push({
						id: null,
						name: this.tmpResponsibility
					});
				}
			}
		}

		if (this.tmpLanguage.length > 0) {
			if (this.searchModel.languages === null) {
				this.searchModel.languages = [{
					id: null,
					name: this.tmpLanguage
				}];
			} else {
				found = this.searchModel.languages.filter(item => {
					return item.name === this.tmpLanguage;
				}).length;
				if (!found ) {
					this.searchModel.languages.push({
						id: null,
						name: this.tmpLanguage
					});
				}
			}
		}

		if (this.tmpTrait.length > 0) {
			if (this.searchModel.traits === null) {
				this.searchModel.traits = [{
					id: null,
					name: this.tmpTrait
				}];
			} else {
				found = this.searchModel.traits.filter(item => {
					return item.name === this.tmpTrait;
				}).length;
				if (!found ) {
					this.searchModel.traits.push({
						id: null,
						name: this.tmpTrait
					});
				}
			}
		}

		// if (this.tmpEducationlevel.length > 0) {
		// 	if (this.searchModel.education_level === null) {
		// 		this.searchModel.education_level = [{
		// 			id: Number(this.tmpEducationlevel),
		// 			name: 'Select Education Level'
		// 		}];
		// 	} else {
		// 		found = this.searchModel.education_level
		// 			.filter(item => item.name === this.tmpEducationlevel).length;
		// 		if (!found ) {
		// 			const pushToEducationLevel = this.unfoundPushToSearchModelprop('education_level');
		// 			pushToEducationLevel(this.tmpEducationlevel);					
		// 		}
		// 	}
		// }
	}

	/**
	 * @private .
	 * @abstract .
	 * @param {string} model 
	 * @param {string} arr 
	 * 
	 * Pushes a new item into an array with id defaulted to null
	 * and a name given from a returned function.
	 * @returns {Function}
	 */
	private unfoundPushToSearchModelprop(arr: string): Function {
		return (name: string) => { this.searchModel[arr].push({ id: null, name }) };
	}

	/* Salary Period Template Resolver  */
	getApplicantSalary(salary = 0, period = null) {
		if (period === 'M') {
			return this.formatNumber(salary * 12, ',') + ' Yearly';
		} else if (period === 'Y') {
			return this.formatNumber(salary, ',') + ' Yearly';
		} else if (period === 'W') {
			return this.formatNumber(salary * 48, ',') + ' Yearly';
		} else if (period === 'H') {
			return this.formatNumber(salary, ',') + ' Hourly';
		} else {
			return '';
		}
	}
	// diaply ad after view render
	ngAfterViewInit() {
		const s = document.createElement('script');
		 s.type = 'text/javascript';
		 s.innerHTML="googletag.cmd.push(function() { googletag.display('div-gpt-ad-1546199654905-0'); });";
		 const __this = this;
		 s.onload = function () { __this.afterScriptAdded(); };
    	 document.getElementById("div-gpt-ad-1546199654905-0").appendChild(s);
	}
	afterScriptAdded() {
    const params= {
     
    };
      if (typeof (window['functionFromExternalScript']) === 'function') {
        window['functionFromExternalScript'](params);
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
		/*this.analyticsService.emitEvent('Status And Preferences', 'Close', 'Desktop', this.authService.currentUser.user_id);
			this.preferencesFormComponent.forEach(note => {
				note.close();
			});
		*/
		this.preferencesModal.close();
		/*if (!this.preferencesClear.employment_status) {
			this.tourService.sleep();
		}*/
	}
	actionOnSubmit() {
	}
	closeStatusModal(e) {
		this.preferencesModal.close();
		this.performSearch(true);
	}
	update_status(e) {
		this.performSearch(true);
	}
	openprefrencesmodel(userid,status){
		this.prefrence='edit';
		this.user_id=userid;
		this.user_status=status;
		this.preferences$ = this.dataService.preferences_get(userid);
		this.preferences$.subscribe(
			(response: UserPreferencesExt) => {
				this.preferencesClear = response;
				// Update the tourService
				this.tourService.collect('status', response.employment_status === null);
				this.tourService.collect('status_edit', response.employment_status === null);
				this.onLoaded.emit(true);
				this.preferencesModal.open();
			},
			error => {
				this.onLoaded.emit(false);
			}
		);
	}
}
