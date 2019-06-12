import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

// services:
import { DataService } from '../../rest/service/data.service';

// models:
import { Seniority } from '../../rest/model/Seniority';

// components:
import { ArraySelectorComponent } from '../array-selector/array-selector.component';

@Component({
    selector: 'app-seniorities',
    templateUrl: './seniorities.component.html',
    styleUrls: ['./seniorities.component.css']
})
export class SenioritiesComponent implements OnInit {

    @Input() itemsArray: Seniority[] = [];

    @Input() selectedItem: Seniority;
    
    @Input() placeholderText: string;

    @Output() onSelect = new EventEmitter<any>();

    error: '';

    constructor(public dataService: DataService) { }

    ngOnInit() {
        if(!this.itemsArray.length) {
            this.populate();
        }
    }

    populate() {

        this.dataService.dictionary_seniority_get('seniority', '*').subscribe(
            response => {
                this.itemsArray = response;
            },
            error => {
                this.error = error;
            }
        )

    }

    onSelectChange(event) {
        this.onSelect.emit(event);
    }

}


