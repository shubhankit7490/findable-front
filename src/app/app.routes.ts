import { Routes } from '@angular/router';

// services:
import { AuthguardService } from './guards/authguard.service';

// components:
import { LoginOnBehalfComponent } from './login-on-behalf/login-on-behalf.component';
import { SignupLayoutComponent } from './login/layout/layout.component';
import { LogoutComponent } from './login/logout/logout.component';
import { ApplyComponent } from './shared/apply/apply.component';
import { LandingComponent } from './landing/landing.component';
import { PartnerComponent } from './business/partner/partner.component';

export const LOGIN_ROUTE_PATH = 'user/login';
export const ROOT_ROUTE_PATH = '/';
export const appRoutes: Routes = [
	{
		path: 'dashboard',
		loadChildren: 'app/main/dashboard/dashboard.module#DashboardModule',
		canActivate: [AuthguardService]
	},
	{
		path: 'connector',
		component: LoginOnBehalfComponent
	},
	{
		path: 'user/personal-details',
		loadChildren: 'app/main/personal-details/personal-details.module#PersonalDetailsModule',
		canActivate: [AuthguardService]
	},
	{
		path: 'user/block',
		loadChildren: 'app/main/block-companies/block-companies.module#BlockCompaniesModule',
		canActivate: [AuthguardService]
	},
	{
		path: 'user/login',
		component: SignupLayoutComponent
	},
	{
		path: 'user/login/:id',
		component: SignupLayoutComponent
	},
	{
		path: 'business/login',
		component: SignupLayoutComponent
	},
	{
		path: 'recruiter/login',
		component: SignupLayoutComponent
	},
	{
		path: 'user/signup',
		component: SignupLayoutComponent
	},
	{
		path: 'business/signup',
		component: SignupLayoutComponent
	},
	{
		path: 'recruiter/signup',
		component: SignupLayoutComponent
	},
	{
		path: 'user/signup/thank',
		component: SignupLayoutComponent
	},
	{
		path: 'signup',
		component: SignupLayoutComponent
	},
	{
		path: 'verify',
		component: SignupLayoutComponent
	},
	{
		path: 'business',
		loadChildren: 'app/business/business.module#BusinessModule',
		canActivate: [AuthguardService]
	},
	{
		path: 'user/password/forgot',
		component: SignupLayoutComponent
	},
	{
		path: 'user/password/thank',
		component: SignupLayoutComponent
	},
	{
		path: 'user/:id',
		loadChildren: 'app/main/applicant-profile/dashboard.module#DashboardModule',
	},
	{
		path: 'apply/:businessId',
		component: ApplyComponent
	},
	{
		path: 'reset',
		component: SignupLayoutComponent
	},
	{
		path: 'faq',
		loadChildren: 'app/main/faq/faq.module#FaqModule',
		canActivate: [AuthguardService]
	},
	{
		path: 'logout',
		component: LogoutComponent,
		canActivate: [AuthguardService]
	},
	{
		path: '',
		component: LandingComponent
	},
];
