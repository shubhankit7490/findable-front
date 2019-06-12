import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonRangeSliderModule } from 'ng2-ion-range-slider';

// components:
import { NoteComponent } from '../note/note.component';
import { ReportComponentComponent } from '../report-component/report-component.component';
import { ArraySelectorComponent } from '../array-selector/array-selector.component';
import { StatusSelectorComponent } from '../status-selector/status-selector.component';
import { PurchaseApplicantComponent } from '../purchase-applicant/purchase-applicant.component';
import { SelectListItemComponent } from '../../form/select-list-item/select-list-item.component';
import { SpinningLoaderComponent } from '../../form/spinning-loader/spinning-loader.component';
import { InputLoaderComponent } from '../input-loader/input-loader.component';

// pipes:
import { DatexPipe } from '../../pipes/datex.pipe';
import { SalaryPipe } from '../../pipes/salary.pipe';
import { ModalModule } from 'ngx-modal';

@NgModule({
    imports: [
        CommonModule,
        IonRangeSliderModule,
        FormsModule,
        ReactiveFormsModule,
        ModalModule,
    ],
    declarations: [
        PurchaseApplicantComponent,
        SelectListItemComponent,
        SpinningLoaderComponent,
        SalaryPipe,
        DatexPipe,
        StatusSelectorComponent,
        ArraySelectorComponent,
        ReportComponentComponent,
        NoteComponent,
        InputLoaderComponent,
    ],
    exports: [
        PurchaseApplicantComponent,
        SelectListItemComponent,
        SpinningLoaderComponent,
        SalaryPipe,
        DatexPipe,
        StatusSelectorComponent,
        ArraySelectorComponent,
        ReportComponentComponent,
        NoteComponent,
        InputLoaderComponent,
        ModalModule
    ]
})
export class GlobalModule {}
