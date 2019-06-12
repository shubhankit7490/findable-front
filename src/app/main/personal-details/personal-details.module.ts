import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PersonalDetailsComponent } from './personal-details/personal-details.component';
import { Routes, RouterModule } from "@angular/router";
import { TypeaheadModule, DatepickerModule } from 'ng2-bootstrap';
import { ReactiveFormsModule } from '@angular/forms';
import { FileUploadModule } from 'interjet-primeng/components/fileupload/fileupload';
import { DateModule } from '../../shared/date/date.module';
import { HeaderModule } from '../../shared/header/header.module';
import { AutoCompleteModule } from 'interjet-primeng/components/autocomplete/autocomplete';
import { ModalModule } from 'ngx-modal';
import { SharedDashboardModule } from '../../shared/dashboard/dashboard.module';

const routes: Routes = [
	{ path: '', component: PersonalDetailsComponent }
];

@NgModule({
	imports: [
		HeaderModule,
		RouterModule.forChild(routes),
		DatepickerModule,
		TypeaheadModule,
		CommonModule,
		ReactiveFormsModule,
		FileUploadModule,
		RouterModule,
		DateModule,
		AutoCompleteModule,
		ModalModule,
		SharedDashboardModule
	],
	declarations: [
		PersonalDetailsComponent
	]
})
export class PersonalDetailsModule { }
