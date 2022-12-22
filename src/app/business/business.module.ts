import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { TextMaskModule } from 'angular2-text-mask';
import { Ng2IziToastModule } from 'ng2-izitoast';
import { HighlightJsModule, HighlightJsService } from 'angular2-highlight-js';
import { ClickOutsideModule } from 'ng-click-outside';
import { IonRangeSliderModule } from 'ng2-ion-range-slider';
import { TooltipModule } from 'ng2-bootstrap/tooltip';
import { SafeHtmlPipe } from '../form/preferences-form/safeHtml.pipe';
// services:
import { DataService } from 			'../rest/service/data.service';
import { AuthService } from 			'../rest/service/auth.service';
import { GrowlService } from 			'../rest/service/growl.service';
import { ChartDataService } from 	'../services/chart-data.service';
import { MessageService } from 		'../services/message.service';

// interjet & external modules:
import { UiSwitchModule } from 			'angular2-ui-switch/src';
import { FileUploadModule } from 		'interjet-primeng/components/fileupload/fileupload';
import { AutoCompleteModule } from 	'interjet-primeng/components/autocomplete/autocomplete';
import { DataTableModule } from 		'interjet-primeng/components/datatable/datatable';
import { ModalModule } from 'ngx-modal';

// shared modules:
import { GlobalModule } from '../shared/global/global.module';
import { HeaderModule } from '../shared/header/header.module';
import { DateModule } from '../shared/date/date.module';

// shared components:
import { SaveSearchComponent } from 						'../shared/save-search/save-search.component';
import { YearsExperienceComponent } from 				'../shared/years-experience/years-experience.component';
import { TagsInputComponent } from 							'../shared/tags-input/tags-input.component';
import { TagComponent } from 										'../shared/tags-input/tag/tag.component';
import { LocationComponent } from 							'../shared/location/location.component';
import { DrawerComponent } from 								'../shared/drawer/drawer.component';
import { CompanyInformationComponent } from 		'../shared/company-information/company-information.component';
import { MultifieldLocationComponent } from 		'../shared/multifield-location/multifield-location.component';
import { PersonalDetailsComponent } from 				'../shared/personal-details/personal-details.component';
import { PackageSelectorComponent } from 				'../shared/package-selector/package-selector.component';
import { ConfirmDialogComponent } from 					'../shared/confirm-dialog/confirm-dialog.component';
import { PaymentComponent } from 								'../shared/payment/payment.component';
import { CompanyNameComponent } from 						'../shared/company-name/company-name.component'
import { SchoolNameComponent } from 						'../shared/school-name/school-name.component'
import { IndustryComponent } from 							'../shared/industry/industry.component';
import { RatingSliderComponent } from 					'../shared/rating-slider/rating-slider.component';
import { SkillsComponent } from 								'../shared/skills/skills.component';
import { ResponsibilitiesComponent } from 			'../shared/responsibilities/responsibilities.component';
import { EducationLevelComponent } from 				'../shared/education-level/education-level.component';
import { LanguagesComponent } from 							'../shared/languages/languages.component';
import { TraitsComponent } from 								'../shared/traits/traits.component';
import { SalaryComponent } from 								'../shared/salary/salary.component';
import { BenefitsComponent } from 							'../shared/benefits/benefits.component';
import { EmploymentStatusComponent } from 			'../shared/employment-status/employment-status.component';
import { LastUpdatedInputComponent } from 			'../shared/last-updated-input/last-updated-input.component';
import { AccountIdComponent } from 							'../shared/account-id/account-id.component';
import { JobTitleComponent } from 							'../shared/job-title/job-title.component';
import { SenioritiesComponent } from 						'../shared/seniorities/seniorities.component';
import { SharedDashboardModule } from 					'../shared/dashboard/dashboard.module';
import { SearchProfileComponent } from 					'../shared/search-profile/search-profile.component';
import { ApplicantSearchResultComponent } from 	'../shared/applicant-search-result/applicant-search-result.component';
import { ChartExperienceComponent } from 				'../shared/chart-experience/chart-experience.component';
import { ChartEducationComponent } from 				'../shared/chart-education/chart-education.component';
import { ChartResponsibilitiesComponent } from 	'../shared/chart-responsibilities/chart-responsibilities.component';
import { ChartSkillsComponent } from 						'../shared/chart-skills/chart-skills.component';

// components:
import { BusinessSetupFormComponent } from './business-setup/setup-form/setup-form.component';
import { BusinessSetupComponent } from 		'./business-setup/business-setup.component';
import { BusinessAccountComponent } from 	'./business-account/business-account.component';
import { CurrentPackageComponent } from 	'./business-account/current-package/current-package.component';
import { PurchaseHistoryComponent } from 	'./business-account/purchase-history/purchase-history.component';
import { GeneralEmbeddingComponent } from './business-account/general-embedding/general-embedding.component';
import { AccountUsersComponent } from 		'./business-account/account-users/account-users.component';
import { ApplicantsStatsComponent } from 	'./applicants-stats/applicants-stats.component';
import { SearchComponent } from 			'./search/search.component';
import { Partner } from 			'./partner/partner.component';

// utilities:
import { AutoUnsubscribe } from '../utils/autoUnsubscribe';

// pipes:
import { FirstWordPipe } from '../pipes/firstWord.pipe';

const routes: Routes = [
	{ path: 'setup', component: BusinessSetupComponent },
	{ path: 'search', component: SearchComponent },
	{ path: 'partners', component: Partner },
	{ path: 'account', component: BusinessAccountComponent },
	{ path: 'account/:id', component: BusinessAccountComponent },
	{ path: 'stats', component: ApplicantsStatsComponent },
];

@NgModule({
	imports: [
		CommonModule,
		HeaderModule,
		GlobalModule,
		FileUploadModule,
		AutoCompleteModule,
		FormsModule,
		DateModule,
		ReactiveFormsModule,
		Ng2IziToastModule,
		UiSwitchModule,
		HighlightJsModule,
		DataTableModule,
		RouterModule.forChild(routes),
		IonRangeSliderModule,
		TextMaskModule,
		DataTableModule,
		SharedDashboardModule,
		TooltipModule.forRoot(),
		ClickOutsideModule,
		ModalModule
	],
	declarations: [
		CompanyInformationComponent,
		MultifieldLocationComponent,
		BusinessSetupComponent,
		BusinessSetupFormComponent,
		PersonalDetailsComponent,
		PackageSelectorComponent,
		ConfirmDialogComponent,
		PaymentComponent,
		CurrentPackageComponent,
		PurchaseHistoryComponent,
		GeneralEmbeddingComponent,
		AccountUsersComponent,
		SearchComponent,
		Partner,
		SaveSearchComponent,
		YearsExperienceComponent,
		TagsInputComponent,
		TagComponent,
		LocationComponent,
		DrawerComponent,
		CompanyNameComponent,
		IndustryComponent,
		RatingSliderComponent,
		SkillsComponent,
		ResponsibilitiesComponent,
		EducationLevelComponent,
		SchoolNameComponent,
		LanguagesComponent,
		TraitsComponent,
		SalaryComponent,
		BenefitsComponent,
		EmploymentStatusComponent,
		LastUpdatedInputComponent,
		AccountIdComponent,
		JobTitleComponent,
		SenioritiesComponent,
		SearchProfileComponent,
		ApplicantSearchResultComponent,
		ChartExperienceComponent,
		ChartEducationComponent,
		ChartResponsibilitiesComponent,
		ChartSkillsComponent,
		BusinessAccountComponent,
		SaveSearchComponent,
		ApplicantsStatsComponent,
		FirstWordPipe,
		SafeHtmlPipe
	],
	providers: [
		DataService,
		AuthService,
		GrowlService,
		HighlightJsService,
		ChartDataService,
		MessageService
	],
	exports: [PaymentComponent,SafeHtmlPipe]
})

export class BusinessModule { }
