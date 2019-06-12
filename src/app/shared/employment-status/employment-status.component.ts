import { Component, Input, Output, EventEmitter } from '@angular/core';

// models:
import * as models from '../../rest/model/models';

// components:
// import { ArraySelectorComponent } from '../../shared/array-selector/array-selector.component';

@Component({
    selector: 'app-employment-status',
    templateUrl: './employment-status.component.html',
    styleUrls: ['./employment-status.component.css']
})
export class EmploymentStatusComponent {

    @Input() placeholderText: '';

    @Input() selectedItem: string;

    @Output() onSelect = new EventEmitter<models.EmitItem>();

    @Input() statuses: models.EmploymentStatus[] = [];

    @Input() error: string = '';

    onSelected(event: models.EmitItem) {
        this.onSelect.emit(event);
    }

}
