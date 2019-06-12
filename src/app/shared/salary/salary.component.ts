import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-salary',
    templateUrl: './salary.component.html',
    styleUrls: ['./salary.component.css']
})
export class SalaryComponent implements OnInit {

    salaryTypes = ['H','M','Y'];

    @Input() min = 0;

    @Input() max = 1000000;
    
    @Input() from = null;
    
    @Input() to = null;
    
    @Input() period = '';

    @Output() onChange = new EventEmitter<any>();

    @Output() onStart = new EventEmitter<any>();

    @Output() onFinish = new EventEmitter<any>();

    @Output() onPeriodSelected = new EventEmitter<any>();

    ngOnInit() {}

    sliderOnChange(event) {
        this.onChange.emit(event);
    }

    sliderOnFinish(event) {
        this.onFinish.emit(event);
    }

    sliderOnStart(event) {
        this.onStart.emit(event);
    }

    periodSelected(event) {
        let value = event.target.value;

        this.onPeriodSelected.emit(value);
    }

}
