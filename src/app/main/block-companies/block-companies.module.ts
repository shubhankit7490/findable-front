import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TypeaheadModule } from 'ng2-bootstrap';
import { Routes, RouterModule } from '@angular/router';
import { ModalModule } from 'ngx-modal';
import { UiSwitchModule } from 'angular2-ui-switch/src';

// interjet components:
import { AutoCompleteModule } from 'interjet-primeng/components/autocomplete/autocomplete';

import { SubscriptionComponent } from '../../shared/subscription/subscription.component';

import { BlockCompaniesComponent } from './block-companies/block-companies.component';
import { FaqLayoutComponent } from './layout/layout.component';
import { BlockCompaniesFormComponent } from './block-companies-form/layout.component';

// shared modules:
import { HeaderModule } from '../../shared/header/header.module';
import { SharedDashboardModule } from '../../shared/dashboard/dashboard.module';
import { BusinessModule } from 'app/business/business.module';

const routes: Routes = [
	{ path: '', component: FaqLayoutComponent }
];

@NgModule({
	imports: [
		HeaderModule,
		CommonModule,
		UiSwitchModule,
		TypeaheadModule,
		RouterModule.forChild(routes),
		FormsModule,
		ModalModule,
		ReactiveFormsModule,
		NgbModule.forRoot(),
		AutoCompleteModule,
		SharedDashboardModule,
		BusinessModule
	],
	exports: [ FaqLayoutComponent ],
	declarations: [
		BlockCompaniesFormComponent,
		FaqLayoutComponent,
		BlockCompaniesComponent,
		SubscriptionComponent,
	],
})
export class BlockCompaniesModule {}
