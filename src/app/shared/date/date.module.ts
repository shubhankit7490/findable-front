import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DayComponent } from '../../form/datePicker/day.component';
import { YearComponent } from '../../form/datePicker/year.component';
import { MonthComponent } from '../../form/datePicker/month.component';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        DayComponent,
        YearComponent,
        MonthComponent
    ],
    exports: [
        DayComponent,
        YearComponent,
        MonthComponent
    ]
})
export class DateModule {}
