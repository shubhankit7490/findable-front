// Modules
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { DatepickerModule } from 'ng2-bootstrap/datepicker';
import { AccordionModule } from 'ng2-bootstrap/accordion';
import { ModalModule } from 'ngx-modal';
import { MalihuScrollbarModule } from 'ngx-malihu-scrollbar';
import { DndModule } from 'ng2-dnd';
import { TextMaskModule } from 'angular2-text-mask';
import { DateModule } from '../date/date.module';
import { TypeaheadModule, ProgressbarModule, PopoverModule } from 'ng2-bootstrap';
import { AutoCompleteModule } from 'interjet-primeng/components/autocomplete/autocomplete';
import { GlobalModule } from '../global/global.module';
import { IonRangeSliderModule } from 'ng2-ion-range-slider';
import { CookieModule } from 'ngx-cookie';
import { ConfirmModule } from 'angular2-bootstrap-confirm';
import { FileUploadModule } from 'interjet-primeng/components/fileupload/fileupload';

// Components
import { SortGridPipe } from '../../form/select-list/sort.pipe';
import { StatsSectionComponent } from '../../main/dashboard/applicant/stats-section/stats-section.component';
import { ShareSectionComponent } from '../../main/dashboard/applicant/share-section/share-section.component';
import { DetailsSectionComponent } from '../../main/dashboard/applicant/details-section/details-section.component';
import { ChartsSectionComponent } from '../../main/dashboard/applicant/charts-section/charts-section.component';
import { ProfileComponent } from '../../main/dashboard/applicant/details-section/profile/profile.component';
import { ContactInfoComponent } from '../../main/dashboard/applicant/details-section/contact-info/contact-info.component';
import { StatusPrefsComponent } from '../../main/dashboard/applicant/details-section/status-prefs/status-prefs.component';
import { RecentJobComponent } from '../../main/dashboard/applicant/details-section/recent-job/recent-job.component';
import { LanguagesComponent } from '../../main/dashboard/applicant/details-section/languages/languages.component';
import { TraitsComponent } from '../../main/dashboard/applicant/details-section/traits/traits.component';
import { ContactApplicantComponent } from '../../form/contact-applicant/contact-applicant.component';
import { ChartComponent } from '../../main/main-common/chart/chart.component';
import { PreferencesFormComponent } from '../../form/preferences-form/preferences-form.component';
import { SelectListComponent } from '../../form/select-list/select-list.component';
import { LocationsFormComponent } from '../../form/locations-form/locations-form.component';
import { SharingModalComponent } from '../../form/sharing-method/sharing-modal.component';
import { DownloadModalComponent } from '../../form/download-pdf/download-modal.component';
import { AboutMeComponent } from '../../form/about-me/about-me.component';
import { LanguagesModalComponent } from '../../form/languages-modal/languages-modal.component';
import { SkillsModalComponent } from '../../form/skills-modal/skills-modal.component';
import { ConfirmEmailComponent } from '../../form/confirm-email/confirm-email.component';
import { EducationModalComponent } from '../../form/education-modal/education-modal.component';
import { FieldOfDegreeComponent } from '../../form/field-of-degree/field-of-degree.component';
import { ExperienceModalComponent } from '../../form/experience-modal/experience-modal.component';
import { FocusAndExpertiseComponent } from '../../form/experience-modal/focus-and-expertise/focus-and-expertise.component';

import { MessageService } from '../../services/message.service';

@NgModule({
	imports: [
		RouterModule,
		CommonModule,
		ReactiveFormsModule,
		FormsModule,
		NgbModule,
		TypeaheadModule,
		ProgressbarModule,
		PopoverModule,
		DatepickerModule,
		AccordionModule,
		ModalModule,
		MalihuScrollbarModule,
		DndModule.forRoot(),
		TextMaskModule,
		DateModule,
		AutoCompleteModule,
		GlobalModule,
		IonRangeSliderModule,
		CookieModule.forRoot(),
		ConfirmModule,
		FileUploadModule
	],
	declarations: [
		StatsSectionComponent,
		ShareSectionComponent,
		DetailsSectionComponent,
		ChartsSectionComponent,
		ProfileComponent,
		ContactInfoComponent,
		StatusPrefsComponent,
		RecentJobComponent,
		LanguagesComponent,
		TraitsComponent,
		ChartComponent,
		PreferencesFormComponent,
		SelectListComponent,
		LocationsFormComponent,
		SharingModalComponent,
		DownloadModalComponent,
		AboutMeComponent,
		LanguagesModalComponent,
		SkillsModalComponent,
		EducationModalComponent,
		FieldOfDegreeComponent,
		ExperienceModalComponent,
		FocusAndExpertiseComponent,
		SortGridPipe,
		ContactApplicantComponent,
		ConfirmEmailComponent,
	],
	exports: [
		CommonModule,
		StatsSectionComponent,
		ShareSectionComponent,
		DetailsSectionComponent,
		ChartsSectionComponent,
		ProfileComponent,
		ContactInfoComponent,
		StatusPrefsComponent,
		RecentJobComponent,
		LanguagesComponent,
		TraitsComponent,
		ChartComponent,
		PreferencesFormComponent,
		SelectListComponent,
		LocationsFormComponent,
		SharingModalComponent,
		DownloadModalComponent,
		AboutMeComponent,
		LanguagesModalComponent,
		SkillsModalComponent,
		EducationModalComponent,
		FieldOfDegreeComponent,
		ExperienceModalComponent,
		FocusAndExpertiseComponent,
		SortGridPipe,
		ConfirmEmailComponent,
		ContactApplicantComponent
	],
	providers: [
		MessageService
	]
})
export class SharedDashboardModule { }
