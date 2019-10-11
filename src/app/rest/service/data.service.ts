import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Response, Http } from '@angular/http';
import { DefaultApi, DictionaryApi, LocationApi, BusinessApi, EducationsApi, ExperiencesApi, LanguagesApi, SkillsApi, TraitsApi } from '../api/api';
import { Configuration } from '../configuration';
import { Observable } from "rxjs";


import * as models from '../model/models';

import { TransformerService } from "./transformer.service";

@Injectable()
export class DataService {
	userStatsObservable: Observable<models.UserStatistics>;
	userSavedSearches: Observable<models.SavedSearches>;
	profileObservable: Observable<models.Success>;
	profileMeObservable: Observable<models.PersonalDetails>;
	experienceObservable: Observable<models.Positions>;
	traitsObservable: Observable<models.Traits>;
	educationObservable: Observable<models.ExistingEducations>;
	skillsObservable: Observable<models.TechSkills>;
	businessesObservable: any;
	blockAllObservable: any;
	blockedCompaniesObservable: any;
	authApi: DefaultApi;
	dictionaryApi: DictionaryApi;
	locationApi: LocationApi;
	businessApi: BusinessApi;
	experiencesApi: ExperiencesApi;
	educationsApi: EducationsApi;
	languagesApi: LanguagesApi;
	skillsApi: SkillsApi;
	traitsApi: TraitsApi;
	apiKey = '';

	constructor(public router: Router, public http: Http) {
		this.http = http;
	}

	login(username, password, apply) {
		let api = new DefaultApi(this.http, null, null);
		let responsePromise = api.usersLoginPost(username, password, apply).share();
		responsePromise.subscribe(response => {
			this.apiKey = response.key;
		}, err => {

		});
		return responsePromise;
	}

	signup(firstname, lastname, email, password, role, invite, apply) {
		let api = new DefaultApi(this.http, null, null);
		let responsePromise = api.usersSignupPost(firstname, lastname, email, password, role, invite, apply).share();
		responsePromise.subscribe(response => {
			this.apiKey = response.key;
		}, err => {

		});
		return responsePromise;
	}

	forgot(email) {
		let api = new DefaultApi(this.http, null, null);
		let responsePromise = api.usersForgotPost(email).share();
		return responsePromise;
	}

	email(email, subject, message) {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.authApi) {
			this.authApi = new DefaultApi(this.http, null, config);
		}
		let userEmailObservable = this.authApi.emailPost(email, subject, message);
		return userEmailObservable;
	}

	pdf(user_id) {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.authApi) {
			this.authApi = new DefaultApi(this.http, null, config);
		}
		let userDownloadObservable = this.authApi.usersUserIdDownloadPost(user_id);
		return userDownloadObservable;
	}

	fetch_pdf(token) {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.authApi) {
			this.authApi = new DefaultApi(this.http, null, config);
		}
		let userDownloadObservable$ = this.authApi.usersTokenPDFGet(token);
		return userDownloadObservable$;
	}

	usersResetPost(token, password) {
		let api = new DefaultApi(this.http, null, null);
		let responsePromise = api.usersResetPost(token, password).share();
		return responsePromise;
	}

	verify(token: string) {
		let api = new DefaultApi(this.http, null, null);
		let responsePromise = api.usersVerifyGet(token).share();
		responsePromise.subscribe(response => {
			this.apiKey = response.key;
		});
		return responsePromise;
	}

	confirm() {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.authApi) {
			this.authApi = new DefaultApi(this.http, null, config);
		}
		let confirmObservable = this.authApi.usersConfirmPost();
		return confirmObservable;
	}

	profile_get_me(userId) {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.authApi) {
			this.authApi = new DefaultApi(this.http, null, config);
		}
		return this.profileMeObservable = this.authApi.usersMeProfileGet(userId).share();
	}

	profile_get(userId: number,showdata=0) {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.authApi) {
			this.authApi = new DefaultApi(this.http, null, config);
		}
		return this.authApi.usersUserIdProfileGet(userId,showdata).share();
	}

	profile_put(userId: number, profile: models.PersonalDetails) {
		if (!this.profileObservable) {
			let config = new Configuration();
			config.apiKey = this.apiKey;
			if (!this.authApi) {
				this.authApi = new DefaultApi(this.http, null, config);
			}
			this.profileObservable = this.authApi.usersUserIdProfilePut(userId, profile);
		}
		return this.profileObservable;
	}

	user_status_put(userId: number, status: string) {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.authApi) {
			this.authApi = new DefaultApi(this.http, null, config);
		}
		return this.authApi.usersUserIdStatusPut(userId, status);
	}

	user_note_get(userId: number) {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.authApi) {
			this.authApi = new DefaultApi(this.http, null, config);
		}
		return this.authApi.usersUserIdNotesGet(userId).share();
	}

	public user_note_put(userId: number, note: string,type:string): Observable<Response> {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.authApi) {
			this.authApi = new DefaultApi(this.http, null, config);
		}
		return this.authApi.usersUserIdNotesPut(userId, note,type);
	}

	user_saved_searches_get(userId: number) {
		let userSavedSearches;
		if (!this.userSavedSearches) {
			let config = new Configuration();
			config.apiKey = this.apiKey;
			if (!this.authApi) {
				this.authApi = new DefaultApi(this.http, null, config);
			}
			userSavedSearches = this.authApi.usersUserIdSearchesGet(userId).share();
		}
		return userSavedSearches;
	}

	public user_saved_searches_post(userId: number, search: models.RecruiterSearchProfile) {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.authApi) {
			this.authApi = new DefaultApi(this.http, null, config);
		}
		return this.authApi.usersUserIdSearchesPost(userId, search);
	}

	user_saved_searches_delete(userId: number, record_id: number) {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.authApi) {
			this.authApi = new DefaultApi(this.http, null, config);
		}
		return this.authApi.usersUserIdSearchesIdDelete(userId, record_id);
	}

	public user_saved_searches_get_by_id(userId: number, record_id: number) {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.authApi) {
			this.authApi = new DefaultApi(this.http, null, config);
		}
		return this.authApi.usersUserIdSearchesIdGet(userId, record_id);
	}

	public user_upload_resume_parsing(file: any): Observable<any> {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.authApi) {
			this.authApi = new DefaultApi(this.http, null, config);
		}
		let fileUploadObservable = this.authApi.usersUserUploadResumeParsingPost(file);
		return fileUploadObservable;
	}

	public fetchUserResume(userId: string, filenType: string): Observable<any> {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.authApi) {
			this.authApi = new DefaultApi(this.http, null, config);
		}
		let fileUploadObservable = this.authApi.usersUserFetchResumeGet(userId, filenType);
		return fileUploadObservable;
	}

	public hasResume(userId: number): Observable<any> {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.authApi) {
			this.authApi = new DefaultApi(this.http, null, config);
		}
		let fileUploadObservable = this.authApi.usersUserHasResumeGet(userId);
		return fileUploadObservable;
	}

	traits_put(userId: number, traits: models.Traits) {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.traitsApi) {
			this.traitsApi = new TraitsApi(this.http, null, config);
		}
		let traitsObservable = this.traitsApi.usersUserIdTraitsPut(userId, traits);
		return traitsObservable;
	}

	preferences_get(userId: number) {
		// Get Preferences model from server
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.authApi) {
			this.authApi = new DefaultApi(this.http, null, config);
		}
		return this.authApi.usersUserIdPreferencesGet(userId).share().map(TransformerService.transformPreferences);
	}

	preferences_put(userId: number, preferences: models.UserPreferences): Observable<any> {
		// Transform preferences data for saving

		// Put Preferences model to server
		preferences = TransformerService.transformPreferencesPut(preferences);
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.authApi) {
			this.authApi = new DefaultApi(this.http, null, config);
		}
		return this.authApi.usersUserIdPreferencesPut(userId, preferences);
	}

	recentJob_get(userId: number) {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.experiencesApi) {
			this.experiencesApi = new ExperiencesApi(this.http, null, config);
		}
		return this.experiencesApi.usersUserIdExperienceGet(userId).share();
	}

	skills_get(userId: number) {
		if (!this.skillsObservable) {
			// Get Experience model from server
			let config = new Configuration();
			config.apiKey = this.apiKey;
			if (!this.skillsApi) {
				this.skillsApi = new SkillsApi(this.http, null, config);
			}
			this.skillsObservable = this.skillsApi.usersUserIdTechGet(userId).share();
		}
		return this.skillsObservable;

	}

	skills_put(userId: number, id: number, level: models.NewTechSkillLevel) {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.skillsApi) {
			this.skillsApi = new SkillsApi(this.http, null, config);
		}
		let dictionaryObservable = this.skillsApi.usersUserIdTechIdPut(userId, id, level);
		return dictionaryObservable;
	}

	skills_delete(userId: number, id: number) {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.skillsApi) {
			this.skillsApi = new SkillsApi(this.http, null, config);
		}
		let dictionaryObservable = this.skillsApi.usersUserIdTechIdDelete(userId, id);
		return dictionaryObservable;
	}

	skills_tech_post(userId: number, skill) {
		let dictionaryRequest: models.NewTechSkill = {
			id: skill.id,
			level: skill.level
		};
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.skillsApi) {
			this.skillsApi = new SkillsApi(this.http, null, config);
		}
		let dictionaryObservable = this.skillsApi.usersUserIdTechPost(userId, dictionaryRequest);
		return dictionaryObservable;
	}

	dictionary_tech_get(entityName: string, searchPhrase: string) {
		let dictionaryRequest = <models.DictionaryRequest>{
			name: entityName,
			filter: 'name', // Filter the entities on field "name"
			value: searchPhrase
		};
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.dictionaryApi) {
			this.dictionaryApi = new DictionaryApi(this.http, null, config);
		}
		let dictionaryObservable = this.dictionaryApi.dictionaryTechGet(dictionaryRequest.value);
		return dictionaryObservable;
	}

	// dictionary_tech_post(name: string) {
	// 	let dictionaryRequest = {
	// 		name: name
	// 	};
	// 	let config = new Configuration();
	// 	config.apiKey = this.apiKey;
	// 	if (!this.authApi) {
	// 		this.authApi = new DefaultApi(this.http, null, config);
	// 	}
	// 	let dictionaryObservable = this.authApi.dictionaryTechPost(dictionaryRequest.name);
	// 	return dictionaryObservable;
	// }
	dictionary_school_post(name: string) {

		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.dictionaryApi) {
			this.dictionaryApi = new DictionaryApi(this.http, null, config);
		}
		let dictionaryObservable = this.dictionaryApi.dictionarySchoolsPost(name);
		return dictionaryObservable;
	}

	dictionary_company_post(name: string) {

		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.dictionaryApi) {
			this.dictionaryApi = new DictionaryApi(this.http, null, config);
		}
		let dictionaryObservable = this.dictionaryApi.dictionaryCompanyPost(name);
		return dictionaryObservable;
	}

	dictionary_focusareas_post(name: string) {

		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.dictionaryApi) {
			this.dictionaryApi = new DictionaryApi(this.http, null, config);
		}
		let dictionaryObservable = this.dictionaryApi.dictionaryFocusareasPost(name);
		return dictionaryObservable;
	}

	dictionary_tech_post(name: string) {

		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.dictionaryApi) {
			this.dictionaryApi = new DictionaryApi(this.http, null, config);
		}
		let dictionaryObservable = this.dictionaryApi.dictionaryTechPost(name);
		return dictionaryObservable;
	}

	dictionary_jobtitle_post(name: string) {

		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.dictionaryApi) {
			this.dictionaryApi = new DictionaryApi(this.http, null, config);
		}
		let dictionaryObservable = this.dictionaryApi.dictionaryJobtitlePost(name);
		return dictionaryObservable;
	}

	dictionary_industry_post(name: string) {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.dictionaryApi) {
			this.dictionaryApi = new DictionaryApi(this.http, null, config);
		}
		let dictionaryObservable = this.dictionaryApi.dictionaryIndustryPost(name);
		return dictionaryObservable;
	}

	dictionary_studyfields_post(name: string) {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.dictionaryApi) {
			this.dictionaryApi = new DictionaryApi(this.http, null, config);
		}
		let dictionaryObservable = this.dictionaryApi.dictionaryStudyfieldsPost(name);
		return dictionaryObservable;
	}

	languages_get(userId: number) {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.languagesApi) {
			this.languagesApi = new LanguagesApi(this.http, null, config);
		}
		return this.languagesApi.usersUserIdLanguagesGet(userId).share().map(TransformerService.transformLanguages);
	}

	dictionary_languages_get(entityName: string, searchPhrase: string, extended?: boolean) {
		let dictionaryRequest = <models.DictionaryRequest>{
			name: entityName,
			filter: 'name', // Filter the entities on field "name"
			value: searchPhrase
		};
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.dictionaryApi) {
			this.dictionaryApi = new DictionaryApi(this.http, null, config);
		}
		let dictionaryObservable = this.dictionaryApi.dictionaryLanguagesGet(dictionaryRequest.value, extended);
		return dictionaryObservable;
	}

	languages_post(userId: number, language: models.Language) {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.languagesApi) {
			this.languagesApi = new LanguagesApi(this.http, null, config);
		}
		let dictionaryObservable = this.languagesApi.usersUserIdLanguagesPost(userId, language);
		return dictionaryObservable;
	}

	languages_delete(userId: number, id: number) {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.languagesApi) {
			this.languagesApi = new LanguagesApi(this.http, null, config);
		}
		return this.languagesApi.usersUserIdLanguagesIdDelete(userId, id);
	}

	languages_put(userId: number, id: number, level: number) {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.languagesApi) {
			this.languagesApi = new LanguagesApi(this.http, null, config);
		}
		return this.languagesApi.usersUserIdLanguagesIdPut(userId, id, level);
	}

	public dictionary_schools_get(entityName: string, searchPhrase: string): Observable<models.DictionaryItem[]> {
		let dictionaryRequest = <models.DictionaryRequest>{
			name: entityName,
			filter: 'name', // Filter the entities on field "name"
			value: searchPhrase
		};
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.dictionaryApi) {
			this.dictionaryApi = new DictionaryApi(this.http, null, config);
		}
		let dictionary$ = this.dictionaryApi.dictionarySchoolsGet(dictionaryRequest.value);
		return dictionary$;
	}

	dictionary_company_get(entityName: string, searchPhrase: string): Observable<models.DictionaryItem[]> {
		let dictionaryRequest = <models.DictionaryRequest>{
			name: entityName,
			filter: 'name', // Filter the entities on field "name"
			value: searchPhrase
		};
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.dictionaryApi) {
			this.dictionaryApi = new DictionaryApi(this.http, null, config);
		}
		let dictionary$ = this.dictionaryApi.dictionaryCompanyGet(dictionaryRequest.value);
		return dictionary$;
	}

	dictionary_industry_get(entityName: string, searchPhrase: string) {
		let dictionaryRequest = <models.DictionaryRequest>{
			name: entityName,
			filter: 'name', // Filter the entities on field "name"
			value: searchPhrase
		};
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.dictionaryApi) {
			this.dictionaryApi = new DictionaryApi(this.http, null, config);
		}
		let dictionaryObservable = this.dictionaryApi.dictionaryIndustryGet(dictionaryRequest.value);
		return dictionaryObservable;
	}

	dictionary_job_title_get(entityName: string, searchPhrase: string) {
		let dictionaryRequest = <models.DictionaryRequest>{
			name: entityName,
			filter: 'name', // Filter the entities on field "name"
			value: searchPhrase
		};
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.dictionaryApi) {
			this.dictionaryApi = new DictionaryApi(this.http, null, config);
		}
		let dictionaryObservable = this.dictionaryApi.dictionaryJobtitleGet(dictionaryRequest.value);
		return dictionaryObservable;
	}

	dictionary_seniority_get(entityName: string, searchPhrase: string) {
		let dictionaryRequest = <models.DictionaryRequest>{
			name: entityName,
			filter: 'name', // Filter the entities on field "name"
			value: searchPhrase
		};
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.dictionaryApi) {
			this.dictionaryApi = new DictionaryApi(this.http, null, config);
		}
		let dictionaryObservable = this.dictionaryApi.dictionarySeniorityGet(dictionaryRequest.value);
		return dictionaryObservable;
	}

	dictionary_locations_get(entityName: string, searchPhrase: string) {
		let dictionaryRequest = <models.DictionaryRequest>{
			name: entityName,
			filter: 'name', // Filter the entities on field "name"
			value: searchPhrase
		};
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.dictionaryApi) {
			this.dictionaryApi = new DictionaryApi(this.http, null, config);
		}
		let dictionaryObservable = this.dictionaryApi.locationsGet(dictionaryRequest.value);
		return dictionaryObservable;
	}


	locations_get(searchQuery: string, state?: number, country?: number, expand?: boolean) {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.dictionaryApi) {
			this.dictionaryApi = new DictionaryApi(this.http, null, config);
		}
		return this.dictionaryApi.locationsGet(searchQuery, state, country, expand)
			.map(TransformerService.transformLocations);
	}

	countries_get() {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.locationApi) {
			this.locationApi = new LocationApi(this.http, null, config);
		}
		return this.locationApi.locationsCountryGet();
	}

	states_get(id: number) {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.locationApi) {
			this.locationApi = new LocationApi(this.http, null, config);
		}
		return this.locationApi.locationsCountryIdGet(id);
	}

	personal_details_put(userId: number, personalDetails: models.PersonalDetails): Observable<models.Success> {
		// Transform preferences data for saving

		// Put Personal Details model to server
		//personalDetails = PersonalDetailsService.transformPersonalDetailsPut(personalDetails);
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.authApi) {
			this.authApi = new DefaultApi(this.http, null, config);
		}
		return this.authApi.usersUserIdProfilePut(userId, personalDetails);
	}

	personal_details_get(userId: number): Observable<models.PersonalDetails> {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.authApi) {
			this.authApi = new DefaultApi(this.http, null, config);
		}
		return this.authApi.usersMeProfileGet(userId).share();
	}

	user_traits_get(userId: number) {
		if (!this.traitsObservable) {
			// Get Languages model from server
			let config = new Configuration();
			config.apiKey = this.apiKey;
			if (!this.traitsApi) {
				this.traitsApi = new TraitsApi(this.http, null, config);
			}
			this.traitsObservable = this.traitsApi.usersUserIdTraitsGet(userId).share().map(TransformerService.transformTraits);
		}
		return this.traitsObservable;
	}

	user_statistics_get(userId: number, since: number) {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.authApi) {
			this.authApi = new DefaultApi(this.http, null, config);
		}
		let userStatsObservable = this.authApi.usersUserIdStatisticsGet(userId, since);
		return userStatsObservable;
	}

	experience_get(userId: number) {
		// Get Experience model from server
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.experiencesApi) {
			this.experiencesApi = new ExperiencesApi(this.http, null, config);
		}
		return this.experiencesApi.usersUserIdExperienceGet(userId).share();
	}

	education_get(userId: number) {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.educationsApi) {
			this.educationsApi = new EducationsApi(this.http, null, config);
		}
		return this.educationsApi.usersUserIdEducationGet(userId).share();
	}

	businesses_get(query: string) {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.dictionaryApi) {
			this.dictionaryApi = new DictionaryApi(this.http, null, config);
		}
		let businessesObservable = this.dictionaryApi.dictionaryBusinessGet(query);
		return businessesObservable;

	}


	blocked_companies_get(userId: number) {
		if (!this.blockedCompaniesObservable) {
			// Get Experience model from server
			let config = new Configuration();
			config.apiKey = this.apiKey;
			if (!this.authApi) {
				this.authApi = new DefaultApi(this.http, null, config);
			}
			this.blockedCompaniesObservable = this.authApi.usersUserIdBlockedGet(userId).share();
		}
		return this.blockedCompaniesObservable;

	}

	blocked_companies_post(userId: number, id: number) {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.authApi) {
			this.authApi = new DefaultApi(this.http, null, config);
		}
		let blockAllObservable = this.authApi.usersUserIdBlockedIdPost(userId, id);
		return blockAllObservable;
	}

	blocked_companies_put(userId: number, blockAll: number) {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.authApi) {
			this.authApi = new DefaultApi(this.http, null, config);
		}
		let blockAllObservable = this.authApi.usersUserIdBlockedPut(userId, blockAll);
		return blockAllObservable;
	}

	blocked_companies_delete(userId: number, id: number) {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.authApi) {
			this.authApi = new DefaultApi(this.http, null, config);
		}
		let blockAllObservable = this.authApi.usersUserIdBlockedIdDelete(userId, id);
		return blockAllObservable;
	}

	education_delete(userId: number, id: number) {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.educationsApi) {
			this.educationsApi = new EducationsApi(this.http, null, config);
		}
		let educationObservable = this.educationsApi.usersUserIdEducationIdDelete(userId, id);
		return educationObservable;
	}

	education_post(userId: number, education: models.Education) {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.educationsApi) {
			this.educationsApi = new EducationsApi(this.http, null, config);
		}
		let educationObservable = this.educationsApi.usersUserIdEducationPost(userId, education);
		return educationObservable;
	}

	experience_post(userId: number, position: models.Position) {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.experiencesApi) {
			this.experiencesApi = new ExperiencesApi(this.http, null, config);
		}
		let experienceObservable = this.experiencesApi.usersUserIdExperiencePost(userId, position);
		return experienceObservable;
	}

	public experience_delete(userId: number, id: number): Observable<Response> {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.experiencesApi) {
			this.experiencesApi = new ExperiencesApi(this.http, null, config);
		}
		let experience$ = this.experiencesApi.usersUserIdExperienceIdDelete(userId, id);
		return experience$;
	}

	experience_put(userId: number, id: number, experience: models.Position): Observable<Response> {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.experiencesApi) {
			this.experiencesApi = new ExperiencesApi(this.http, null, config);
		}
		let experience$ = this.experiencesApi.usersUserIdExperienceIdPut(userId, id, experience);
		return experience$;
	}

	education_put(userId: number, id: number, education: models.Education) {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.educationsApi) {
			this.educationsApi = new EducationsApi(this.http, null, config);
		}
		let educationObservable = this.educationsApi.usersUserIdEducationIdPut(userId, id, education);
		return educationObservable;
	}

	dictionary_studyfields_get(entityName: string, searchPhrase: string) {
		let dictionaryRequest = <models.DictionaryRequest>{
			name: entityName,
			filter: 'name', // Filter the entities on field "name"
			value: searchPhrase
		};
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.dictionaryApi) {
			this.dictionaryApi = new DictionaryApi(this.http, null, config);
		}
		let dictionaryObservable = this.dictionaryApi.dictionaryStudyfieldsGet(dictionaryRequest.value);
		return dictionaryObservable;
	}

	dictionary_traits_get(entityName: string, searchPhrase: string) {
		let dictionaryRequest = <models.DictionaryRequest>{
			name: entityName,
			filter: 'name', // Filter the entities on field "name"
			value: searchPhrase
		};
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.dictionaryApi) {
			this.dictionaryApi = new DictionaryApi(this.http, null, config);
		}
		let dictionaryObservable = this.dictionaryApi.dictionaryTraitsGet(dictionaryRequest.value);
		return dictionaryObservable;
	}

	dictionary_focusarea_get(entityName: string, searchPhrase: string, extended?: boolean) {
		let dictionaryRequest = <models.DictionaryRequest>{
			name: entityName,
			filter: 'name', // Filter the entities on field "name"
			value: searchPhrase
		};
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.dictionaryApi) {
			this.dictionaryApi = new DictionaryApi(this.http, null, config);
		}
		let dictionaryObservable = this.dictionaryApi.dictionaryFocusareasGet(dictionaryRequest.value, extended);
		return dictionaryObservable;
	}

	public dictionary_education_levels(): Observable<models.EducationLevel[]> {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.dictionaryApi) {
			this.dictionaryApi = new DictionaryApi(this.http, null, config);
		}
		let dictionary$ = this.dictionaryApi.dictionaryEducationLevelsGet();
		return dictionary$;
	}
	public dictionary_uploaded_candidate(): Observable<models.UploadCandidate[]> {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.dictionaryApi) {
			this.dictionaryApi = new DictionaryApi(this.http, null, config);
		}
		let dictionary$ = this.dictionaryApi.dictionaryUploadedCandidateGet();
		return dictionary$;
	}
	public search_applicants_post(offset: number, orderby?: string, order?: string, search?: models.ApplicantsSearchProfile | models.ApplicantsSearchProfileParsed): Observable<models.ApplicantsSearchResultProfiles> {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.authApi) {
			this.authApi = new DefaultApi(this.http, null, config);
		}
		return this.authApi.applicantsPost(offset, orderby, order, search);
	}

	/**
	 * Get dictionary table, filtered with a typeahead string
	 */
	dictionary_get(entityName: string, searchPhrase: string) {

		let dictionaryRequest = <models.DictionaryRequest>{
			name: entityName,
			filter: 'name', // Filter the entities on field "name"
			value: searchPhrase
		};
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.dictionaryApi) {
			this.dictionaryApi = new DictionaryApi(this.http, null, config);
		}
		let dictionaryObservable = this.dictionaryApi.dictionaryPost([dictionaryRequest]);
		return dictionaryObservable;
	}

	public dictionary_enums(): Observable<models.Enums> {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.dictionaryApi) {
			this.dictionaryApi = new DictionaryApi(this.http, null, config);
		}
		let dictionary$ = this.dictionaryApi.dictionaryEnumsGet();
		return dictionary$;
	}

	/**
	 * Get dictionary table, filtered with a typeahead string
	 */
	message_post(subject: string, message: string) {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.authApi) {
			this.authApi = new DefaultApi(this.http, null, config);
		}
		let messageObservable = this.authApi.messagePost(subject, message);
		return messageObservable;
	}

	/**
	 * Get a single business record
	 */
	business_get(businessId: number) {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.businessApi) {
			this.businessApi = new BusinessApi(this.http, null, config);
		}
		let businessGetObservable = this.businessApi.businessBusinessIdGet(businessId);
		return businessGetObservable;
	}

	/**
	 * Create a new business
	 */
	business_post(business?: models.Business) {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.businessApi) {
			this.businessApi = new BusinessApi(this.http, null, config);
		}
		let businessPost$ = this.businessApi.businessPost(business);
		return businessPost$;
	}

	/**
	 * Update the business profile
	 */
	business_put(businessId: number, business?: models.Business) {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.businessApi) {
			this.businessApi = new BusinessApi(this.http, null, config);
		}
		let businessObservable = this.businessApi.businessBusinessIdPutWithHttpInfo(businessId, business);
		return businessObservable;
	}

	/**
	 * Get the available packages
	 */
	public packages_get(): Observable<models.Packages> {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.authApi) {
			this.authApi = new DefaultApi(this.http, null, config);
		}
		let packages$ = this.authApi.packageGet();
		return packages$;
	}

	/**
	 * Get credits amount for a business
	 */
	public credits_get(businessId: number): Observable<models.Credits> {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.businessApi) {
			this.businessApi = new BusinessApi(this.http, null, config);
		}
		let creditsGet$ = this.businessApi.businessBusinessIdCreditsGet(businessId);
		return creditsGet$;
	}

	credits_put(businessId: number, settings: models.CreditsSettings) {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.businessApi) {
			this.businessApi = new BusinessApi(this.http, null, config);
		}
		let creditsSettingsObservable = this.businessApi.businessBusinessIdCreditsPut(businessId, settings);
		return creditsSettingsObservable;
	}

	/**
	 * Purchase credits for the business
	 */
	public credits_post(businessId: number, packageId: number, stripeToken: string = null, billingName?: string): Observable<Response> {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.businessApi) {
			this.businessApi = new BusinessApi(this.http, null, config);
		}
		let creditsPost$ = this.businessApi.businessBusinessIdCreditsPost(businessId, packageId, stripeToken, billingName);
		return creditsPost$;
	}


	/**
	 * Update the credit card details
	 */
	public getPaymentsByBusinessId(businessId: number): Observable<models.PaymentObject> {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.businessApi) {
			this.businessApi = new BusinessApi(this.http, null, config);
		}
		let payments$ = this.businessApi.businessBusinessIdPaymentsGet(businessId);
		return payments$;
	}

	/**
	 * Update the credit card details
	 */
	public payments_put(businessId: number, id: number, token?: models.StripeToken) {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.businessApi) {
			this.businessApi = new BusinessApi(this.http, null, config);
		}
		let paymentsPut$ = this.businessApi.businessBusinessIdPaymentsIdPut(businessId, id, token);
		return paymentsPut$;
	}
	
	about_put(id: number, about: string) {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.authApi) {
				this.authApi = new DefaultApi(this.http, null, config);
		}
		let paymentsObservable = this.authApi.usersUserIdAboutPut(id, about);
		return paymentsObservable;
	}    

	/**
	 * Get the purchase history of a business
	 */
	public purchase_history_get(businessId: number, months: number): Observable<models.BusinessPurchase[]> {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.businessApi) {
			this.businessApi = new BusinessApi(this.http, null, config);
		}
		let purchaseHistory$ = this.businessApi.businessBusinessIdPurchasesGet(businessId, months);
		return purchaseHistory$;
	}

	/**
	 * Get a collection of the business recruiters
	 */
	recruiters_get(businessId: number) {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.businessApi) {
			this.businessApi = new BusinessApi(this.http, null, config);
		}
		let recruitersGetObservable = this.businessApi.businessBusinessIdRecruitersGet(businessId);
		return recruitersGetObservable;
	}

	/**
	 * Change the credits purchase permission of a recruiter
	 */
	public recruiters_put(businessId: number, id: number, purchasePermission?: models.PurchasePermissions): Observable<Response> {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.businessApi) {
			this.businessApi = new BusinessApi(this.http, null, config);
		}
		let recruitersPutObservable = this.businessApi.businessBusinessIdRecruitersIdPut(businessId, id, purchasePermission);
		return recruitersPutObservable;
	}

	public recruiters_delete(businessId: number, id: number): Observable<Response> {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.businessApi) {
			this.businessApi = new BusinessApi(this.http, null, config);
		}
		let recruitersDelete$ = this.businessApi.businessBusinessIdRecruitersIdDelete(businessId, id);
		return recruitersDelete$;
	}

	/**
	 * Add a new recruiter to the business
	 */
	recruiters_post(businessId: number, recruiter?: models.NewRecruiter) {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.businessApi) {
			this.businessApi = new BusinessApi(this.http, null, config);
		}
		let recruitersPostObservable = this.businessApi.businessBusinessIdRecruitersPost(businessId, recruiter);
		return recruitersPostObservable;
	}

	/**
	 * Get the statistics of a business
	 */
	business_statistics_get(businessId: number) {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.businessApi) {
			this.businessApi = new BusinessApi(this.http, null, config);
		}
		let businessStatisticsGetObservable = this.businessApi.businessBusinessIdStatisticsGet(businessId);
		return businessStatisticsGetObservable;
	}

	/**
	 * Get the saved searches of the business
	 */
	business_searches_get(businessId: number, from?: Date, to?: Date) {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.businessApi) {
			this.businessApi = new BusinessApi(this.http, null, config);
		}
		let businessSearchesGetObservable = this.businessApi.businessBusinessIdSearchesGet(businessId, from, to);
		return businessSearchesGetObservable;
	}

	/**
	 * Update the status of a saved search
	 */
	business_searches_put(businessId: number, id: number, status?: models.SearchStatus) {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.businessApi) {
			this.businessApi = new BusinessApi(this.http, null, config);
		}
		let businessSearchesPutObservable = this.businessApi.businessBusinessIdSearchesIdPut(businessId, id, status);
		return businessSearchesPutObservable;
	}

	/**
	 * Get results for a certain saved search
	 */
	business_search_get_results(businessId: number, id: number) {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.businessApi) {
			this.businessApi = new BusinessApi(this.http, null, config);
		}
		let businessSearchResultsGetObservable = this.businessApi.businessBusinessIdResultsIdGet(businessId, id);
		return businessSearchResultsGetObservable;
	}

	purchase_applicants_post(fullname:string,company:string,message:string,recruitingfor:string,businessId: number, applicants: models.ApplicantsIds,exclusive_contact:any) {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.businessApi) {
			this.businessApi = new BusinessApi(this.http, null, config);
		}
		return this.businessApi.businessBusinessIdPurchasesPost(fullname,company,message,recruitingfor,businessId,exclusive_contact,applicants);
	}
	
	send_email_applicant(message:string,businessId: number) {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.businessApi) {
			this.businessApi = new BusinessApi(this.http, null, config);
		}
		return this.businessApi.businessBusinessSendEmail(message,businessId);
	}
	set_auth_token(code:string,scope:string) {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.businessApi) {
			this.businessApi = new BusinessApi(this.http, null, config);
		}

		return this.businessApi.businessBusinessSetAuthToken(code,scope);
	}
	update_applicant_status(status: string,businessId: number, applicants: models.ApplicantsIds) {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.businessApi) {
			this.businessApi = new BusinessApi(this.http, null, config);
		}
		return this.businessApi.businessBusinessChnageApplicantstatus(status,businessId,applicants);
	}

	/**
	 * Get a saved search object based on a provided token
	 */
	public search_token_get(token: string): Observable<models.ApplicantsSearchProfileParsed> {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.authApi) {
			this.authApi = new DefaultApi(this.http, null, config);
		}
		let search$ = this.authApi.searchTokenGet(token);
		return search$;
	}

	report_user_post(userId: number, reason: models.FaultReason) {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.authApi) {
			this.authApi = new DefaultApi(this.http, null, config);
		}
		return this.authApi.usersUserIdFaultsPost(userId, reason);
	}

	get_business_setup_status(businessId) {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.businessApi) {
			this.businessApi = new BusinessApi(this.http, null, config);
		} else {
			this.businessApi.configuration.apiKey = this.apiKey;
		}
		return this.businessApi.businessBusinessIdGet(businessId);
	}

	/**
	 * Update user profile views
	 */
	user_views_post(userId: number, viewerId: number) {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.authApi) {
			this.authApi = new DefaultApi(this.http, null, config);
		}
		return this.authApi.usersUserIdStatisticsPost(userId, viewerId);
	}

	user_apply_to_business(businessId: number) {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.businessApi) {
			this.businessApi = new BusinessApi(this.http, null, config);
		}
		return this.businessApi.businessBusinessIdApplicationPost(businessId);
	}

	update_user_config(userId, configData) {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.authApi) {
			this.authApi = new DefaultApi(this.http, null, config);
		}
		return this.authApi.usersUserIdConfigPut(userId, configData);
	}

	log(log = null) {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.authApi) {
			this.authApi = new DefaultApi(this.http, null, config);
		}
		return this.authApi.logPost(log);
	}

	add_profile_views(userId) {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.authApi) {
			this.authApi = new DefaultApi(this.http, null, config);
		}
		return this.authApi.usersUserIdViewsPost(userId);
	}

	send_contact_request(userId, fullname, company, email, phone, message) {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.authApi) {
			this.authApi = new DefaultApi(this.http, null, config);
		}
		return this.authApi.usersUserIdRequestsPost(userId, fullname, company, email, phone, message);
	}
	// conver url in tiny format
	public ConvertTinyurl(Url) {
		let config = new Configuration();
		config.apiKey = this.apiKey;
		if (!this.authApi) {
			this.authApi = new DefaultApi(this.http, null, config);
		}
		return this.authApi.UrlConverTinyUrl(Url);
	}


	// /**
	//  * Get Subscription information for user
	//  */
	public subscription_get(userId: number): Observable<Response> {
		let subscriptionsGet$ = this.authApi.userSubscriptionGet(userId);
		return subscriptionsGet$;
	}
	// /**
	//  * Get purchase information for user
	//  */
	public purches_get(userId: number): Observable<Response> {
		let purchesGet$ = this.authApi.userPurchesGet(userId);
		console.log('data',purchesGet$);
		return purchesGet$;
	}

	// /**
	//  * Subscription
	//  */
	public subscription_post(userId: number, stripeToken: string = null, billingName?: string): Observable<Response> {
		let subscriptionsPost$ = this.authApi.userSubscriptionPost(userId, stripeToken, billingName);
		return subscriptionsPost$;
	}


	public subscription_delete(userId: number): Observable<Response> {
		let subscriptionsDelete$ = this.authApi.userSubscriptionDelete(userId);
		return subscriptionsDelete$;
	}

	public subscription_put(userId: number, stripeToken: string = null, billingName?: string): Observable<Response> {
		let subscriptionsPut$ = this.authApi.userSubscriptionPut(userId, stripeToken, billingName);
		return subscriptionsPut$;
	}

}
