import {Routes} from '@angular/router';
import { DashboardLayoutComponent } from './dashboard/layout/layout.component';

export const layoutRoutes: Routes = [
	{
		path: '',
		component: DashboardLayoutComponent
	},
	{
		path: 'dashboard',
		component: DashboardLayoutComponent
	},
];
