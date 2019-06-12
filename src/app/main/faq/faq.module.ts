import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TypeaheadModule, ProgressbarModule, PopoverModule } from 'ng2-bootstrap';
import { DatepickerModule } from 'ng2-bootstrap/datepicker';
import { AccordionModule } from 'ng2-bootstrap/accordion';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ModalModule } from 'ngx-modal';

// routes:
import { appRoutes } from '../../app.routes';

// modules:
import { HeaderModule } from '../../shared/header/header.module';
import { SharedDashboardModule } from '../../shared/dashboard/dashboard.module';

// components:
import { FaqLayoutComponent } from './layout/layout.component';
import { FaqFormComponent } from './faqform/layout.component';
import { FaqComponent } from './faq/faq.component';


const routes: Routes = [
	{ path: '', component: FaqLayoutComponent }
];

@NgModule({
	imports: [
		CommonModule,
		HeaderModule,
		RouterModule.forChild(routes),
		ModalModule,
		FormsModule,
		ReactiveFormsModule,
		SharedDashboardModule,
		NgbModule.forRoot(),
		DatepickerModule.forRoot(),
		AccordionModule.forRoot(),
		ProgressbarModule.forRoot(),
		TypeaheadModule.forRoot(),
		PopoverModule.forRoot()
	],
	exports: [ FaqLayoutComponent ],
	declarations: [
		FaqFormComponent,
		FaqLayoutComponent,
		FaqComponent
	],
})
export class FaqModule { }
