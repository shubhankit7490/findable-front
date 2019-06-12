import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-benefits',
    templateUrl: './benefits.component.html',
    styleUrls: ['./benefits.component.css']
})
export class BenefitsComponent implements OnInit {

    @Input() placeholderText: '';

    @Input() selectedItem: string;

    @Input() error: string = '';
    
    @Output() onSelect = new EventEmitter<any>();

    benefits = [
        {
            key: 'all',
            name: 'All benefits'
        },
        {
            key: 'not',
            name: 'No benefits'
        },
        {
            key: 'only',
            name: 'Only benefits'
        }
    ]

    constructor() { }

    ngOnInit() {}

    onSelected(event) {
        this.onSelect.emit(event);
    }

}
