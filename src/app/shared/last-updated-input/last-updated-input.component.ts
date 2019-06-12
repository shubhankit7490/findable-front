import { Component, Input, Output, EventEmitter } from '@angular/core';

// models
import * as models from '../../rest/model/models';

// components:

@Component({
    selector: 'app-last-updated-input',
    templateUrl: './last-updated-input.component.html',
    styleUrls: ['./last-updated-input.component.css']
})
export class LastUpdatedInputComponent {

    @Input() placeholderText: '';

    @Input() selectedItem: number;

    @Output() onSelect = new EventEmitter<models.EmitItem>();

    @Input() error: string = '';

    @Input() values = [
        {
            value: 1,
            label: 'Past 24 Hours'
        },
        {
            value: 7,
            label: 'Past Week'
        },
        {
            value: 14,
            label: 'Past 2 Weeks'
        },
        {
            value: 21,
            label: 'Past 3 Weeks'
        },
        {
            value: 30,
            label: 'Past 30 days'
        },
        {
            value: 90,
            label: 'Past 3 months'
        },
        {
            value: 180,
            label: 'Past 6 months'
        },
        {
            value: 365,
            label: 'Past year'
        }
    ];

    public onSelected(event: models.EmitItem) {
        this.onSelect.emit(event);
    }

}
