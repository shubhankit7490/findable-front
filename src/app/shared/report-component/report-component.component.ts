import { Component, OnInit, AfterViewInit, Input, Output, ViewChild, EventEmitter } from '@angular/core';

// services:
import { GrowlService } from '../../rest/service/growl.service';
import { DataService } from '../../rest/service/data.service';

import { FaultReason } from '../../rest/model/FaultReason';

@Component({
	selector: 'app-report-component',
	templateUrl: './report-component.component.html',
	styleUrls: ['./report-component.component.css']
})
export class ReportComponentComponent implements OnInit {

	@Input() userId: number;
    
	@Input() closeBtn: boolean = true;

	@Input() arrowDirection: string; // down, up

	@Input() arrowOffsetTop: number;
	
	@Input() arrowOffsetBottom: number;

	@Input() arrowOffsetLeft: number;

	@Output() onError = new EventEmitter<any>();

	@Output() onSuccess = new EventEmitter<any>();

	@Output() onSend = new EventEmitter<any>();
    
	@Output() onClose = new EventEmitter<any>();

	public reportText: string;

	public reportReason: string;

	public placeholder: string;

	public submitting: boolean;

	public formErrors = {
		global: ''
	}

	constructor(public dataService: DataService) { }

	ngOnInit() {
		this.placeholder = 'Write something...';
		this.submitting = false;
	}

	close(evnet?) {
			this.onClose.emit();
	}

	private reportUser(reason: FaultReason): void {
		this.submitting = true;

		this.dataService.report_user_post(this.userId, reason).subscribe(
			response => {
				this.submitting = false;
				this.reportReason = this.reportText = '';
				GrowlService.message('User reported successfully.', 'success');

				this.onSend.emit(true);
				this.onSuccess.emit(true);
			},
			error => {
				this.submitting = false;
				GrowlService.message(JSON.parse(error._body).message, 'error');

				this.onSend.emit(true);
				this.onError.emit(true);
			}
		);
	}

	onSubmit(event?) {
		if (this.reportReason === 'other' && !this.reportReason) {
			GrowlService.message('Invalid complaint text', 'error');
		}

		let reason = (this.reportReason === 'gross') ? this.reportReason : this.reportText;
		this.reportUser({reason});
	}
}
