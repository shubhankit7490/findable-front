import { GlobalModule } from '../../shared/global/global.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Routes, RouterModule } from '@angular/router';

import { HeaderModule } from '../../shared/header/header.module';
import { SharedDashboardModule } from '../../shared/dashboard/dashboard.module';
import { DashboardLayoutComponent } from './layout/layout.component';

const routes: Routes = [
    { path: '', component: DashboardLayoutComponent }
];

@NgModule({
    imports: [
        CommonModule,
        HeaderModule,
        GlobalModule,
        SharedDashboardModule,
        RouterModule.forChild(routes),
    ],
    exports: [DashboardLayoutComponent],
    declarations: [
        DashboardLayoutComponent
    ],
})
export class DashboardModule { }

