import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-account-id',
    templateUrl: './account-id.component.html',
    styleUrls: ['./account-id.component.css']
})
export class AccountIdComponent implements OnInit {
    @Input() accountId = null;

    @Input() error: string = '';
    
    @Output() onBlur = new EventEmitter<any>();

    @Output() onKeyUp = new EventEmitter<any>();

    constructor() {}

    ngOnInit() {
    }

    triggerOnBlur(event) {
        this.onBlur.emit({ accountId: this.accountId, event });
    }

    triggerOnKeyUp(event) {
        this.onBlur.emit(event);
    }

}
