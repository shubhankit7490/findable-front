import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';

// services:
import { DataService } from '../../rest/service/data.service';

import * as models from '../../rest/model/models';

@Component({
	selector: 'app-note',
	templateUrl: './note.component.html',
	styleUrls: ['./note.component.css']
})
export class NoteComponent implements OnInit {
	@ViewChild('noteCheckbox') noteCheckbox: ElementRef;

	@Input() userId: number;

	@Input() placeholderText = 'Write something...';

	@Output() onOpen = new EventEmitter<any>();

	@Output() onBeforeOpen = new EventEmitter<any>();

	@Output() onClose = new EventEmitter<any>();

	@Output() onBeforeClose = new EventEmitter<any>();

	@Output() onUpdate = new EventEmitter<any>();

	public text: string;

	public errors = [];

	public isSubmitting: boolean = false;

	public isOpen: boolean = false;

	public loading: boolean = false;

	public standout: string = 'none';

	constructor(public dataService: DataService) { }

	ngOnInit() {
		this.getUserNote();
	}

	private getUserNote(): void {
		this.loading = true;
		this.dataService.user_note_get(this.userId).subscribe(
			response => {
				this.loading = false;

				this.text = decodeURIComponent(response);
				if(this.text.length == 1 && (/\s/).test(this.text)) {
					this.text = '';
				}

				if (this.text.length > 0) {
					this.standout = '6px 6px 5px yellow, -6px -6px 5px yellow, 6px -6px 5px yellow, -6px 6px 5px yellow';
				} else {
					this.standout = 'none';
				}
			},
			error => {
				this.handleErrors(JSON.parse(error._body), error.status);
				this.loading = false;
			}
		);
	}

	public updateUserNote(): void {
		this.isSubmitting = true;
		if(this.text.length == 0) {
			this.text = ' ';
		}
		this.dataService.user_note_put(this.userId, this.text).subscribe(
			response => {

				if(this.text.length == 1 && (/\s/).test(this.text)) {
					this.text = '';
				}

				if (this.text.length > 0) {
					this.standout = '6px 6px 5px yellow, -6px -6px 5px yellow, 6px -6px 5px yellow, -6px 6px 5px yellow';
				} else {
					this.standout = 'none';
				}
				this.isSubmitting = false;

				this.clearErrors();
				this.setMessage(['Note updated']);

				this.onUpdate.emit(true);

				setTimeout(() => {
					this.close();
				}, 2000);
			},
			error => {
				if (this.text.length > 0) {
					this.standout = '6px 6px 5px yellow, -6px -6px 5px yellow, 6px -6px 5px yellow, -6px 6px 5px yellow';
				} else {
					this.standout = 'none';
				}
				this.handleErrors(JSON.parse(error._body), error.status);
				this.isSubmitting = false;
			}
		);
	}

	public open(): void {
		this.onBeforeOpen.emit();

		this.noteCheckbox.nativeElement.checked = true;
		this.isOpen = true;

		this.onOpen.emit();

		if (this.userId) {
			this.getUserNote();
		}
	}

	public close(): void {
		this.onBeforeClose.emit();

		this.noteCheckbox.nativeElement.checked = false;
		this.isOpen = false;

		this.onClose.emit();
	}

	private clearErrors(): void {
		this.errors = [];
	}

	private setMessage(message: string[]): void {
		this.errors.push(message);
	}

	private handleErrors(data, status): void {
		this.clearErrors();

		if (status == 406) {
			// this.errors.push(data.message);
			data.message.forEach(v => {
				this.errors.push(v.error);
			});
		}
	}

}
