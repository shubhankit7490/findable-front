import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';

// services:
import { DataService } from '../../rest/service/data.service';

// models:
import * as models from '../../rest/model/models';

// components:
import { TagsInputComponent } from '../tags-input/tags-input.component';

@Component({
	selector: 'app-job-title',
	templateUrl: './job-title.component.html',
	styleUrls: ['./job-title.component.css']
})
export class JobTitleComponent implements OnInit {
	@ViewChild('tagInput') tagInput: TagsInputComponent;

	@Input() jobTitle: models.JobTitle;

	@Input() tags: models.JobTitle[] = [];

	@Input() query;

	@Output() onSelected = new EventEmitter<models.JobTitle>()

	@Output() onRemove = new EventEmitter<number>();

	@Output() onBlur = new EventEmitter<Event>();

	public jobTitles: models.JobTitle[];

	private jobTitles$: Subscription;

	public error = '';

	public requesting = false;

	constructor(public dataService: DataService) {	}

	ngOnInit() { }

	public searchJobTitle(searchPhrase: string) {
		this.requesting = true;
		this.jobTitles$ = this.dataService.dictionary_job_title_get('jobtitle', searchPhrase).subscribe(
			(response: models.JobTitle[]) => {
				this.jobTitles = response;
				this.requesting = false;
			},
			error => {
				this.error = error;
				this.requesting = false;
			}
		);
	}

	public onUpdate(event: Event) {
		this.onBlur.emit(event);
	}

	public removeJobTitle(id: number) {
		this.onRemove.emit(id);
	}

	public onSelect(jobTitle: models.JobTitle) {
		this.jobTitle = jobTitle;

		this.onSelected.emit(jobTitle);
	}
}
