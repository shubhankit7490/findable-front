import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';

import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TypeaheadModule, ProgressbarModule, PopoverModule } from 'ng2-bootstrap';
import { DatepickerModule } from 'ng2-bootstrap/datepicker';
import { AccordionModule } from 'ng2-bootstrap/accordion';
import { ModalModule } from 'ngx-modal';
import { CookieModule } from 'ngx-cookie';

// modules:
import { AppComponent } from './app.component';
import { LoginModule } from './login/login.module';
import { BusinessModule } from './business/business.module';
import { SharedDashboardModule } from './shared/dashboard/dashboard.module';

// routes:
import { appRoutes } from './app.routes';

// services:
import { DataService } from './rest/service/data.service';
import { AnalyticsService } from './services/analytics.service';
import { TourService } from './services/tour.service';
import { ProviderService } from './services/provider.service';
import { AuthguardService } from './guards/authguard.service';
import { AuthService } from './rest/service/auth.service';
import { TransformerService } from './rest/service/transformer.service';

// components:
import { LandingComponent } from './landing/landing.component';
import { LocationFormComponent } from './form/location-form/locations-form.component';
import { LoginComponent } from './login/login.component';
import { ApplyComponent } from './shared/apply/apply.component';
import { LoginOnBehalfComponent } from './login-on-behalf/login-on-behalf.component';

@NgModule({
	declarations: [
		AppComponent,
		LandingComponent,
		LocationFormComponent,
		LoginComponent,
		ApplyComponent,
		LoginOnBehalfComponent
	],
	imports: [
		BrowserModule,
		FormsModule,
		ReactiveFormsModule,
		HttpModule,
		RouterModule.forRoot(appRoutes),
		LoginModule,
		NgbModule.forRoot(),
		ModalModule,
		TypeaheadModule.forRoot(),
		DatepickerModule.forRoot(),
		AccordionModule.forRoot(),
		ProgressbarModule.forRoot(),
		PopoverModule.forRoot(),
		CookieModule.forRoot(),
		BusinessModule,
		SharedDashboardModule
	],
	exports: [ RouterModule ],
	providers: [
		DataService,
		AuthguardService,
		AuthService,
		TransformerService,
		AnalyticsService,
		TourService,
		ProviderService,
	],
	bootstrap: [ AppComponent ]
})
export class AppModule { }
