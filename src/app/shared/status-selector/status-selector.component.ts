import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

// service:
import { DataService } from '../../rest/service/data.service';

// components:
import { ArraySelectorComponent } from '../array-selector/array-selector.component';

@Component({
    selector: 'app-status-selector',
    templateUrl: './status-selector.component.html',
    styleUrls: ['./status-selector.component.css']
})
export class StatusSelectorComponent implements OnInit {

    itemsArray = ['short', 'interviewing', 'initial', 'hired', 'irrelevant'];

    itemsLabels = ['Short Listed', 'Interviewing', 'Initial Contact', 'Hire', 'Irrelevant'];

    @Input() userId;

    @Input() selectedItem = null;

    @Input() placeholderText: string;

    @Output() onSelect = new EventEmitter<any>();

    @Output() onStatusChanged = new EventEmitter<any>();

    error: '';

    submitting = false;

    constructor(public dataService: DataService) { }

    ngOnInit() {}

    onSelectChange(event) {
        this.updateUserStatus(event.item.name)

        this.onSelect.emit(event);
    }

    updateUserStatus(status) {
        this.submitting = true;

        this.dataService.user_status_put(this.userId, status).subscribe(
            response => {
                this.onStatusChanged.emit()
            },
            error => {
                this.error = error.message;
            },
            () => {
                this.submitting = false;
            }
        )
    }

}


