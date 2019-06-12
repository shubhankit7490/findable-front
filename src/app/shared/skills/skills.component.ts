import { Component, OnInit, AfterViewInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

// services:
import { DataService } from '../../rest/service/data.service';

// models:
import { TechSkill } from '../../rest/model/TechSkill';

@Component({
	selector: 'app-skills',
	templateUrl: './skills.component.html',
	styleUrls: ['./skills.component.css']
})
export class SkillsComponent implements OnInit, AfterViewInit {
	@ViewChild('autocompleteElement') autocompleteElement;

	@Output() onSelected = new EventEmitter<any>();

	@Output() onBlur = new EventEmitter<any>();

	@Input() skill: TechSkill;

	@Input() skills: TechSkill[];

	@Input() query = '';

	@Input() skillInField = true;

	@Input() clearOnSelect = true;

	skillsObservable: Subscription;

	error = '';

	requesting = false;

	constructor(public dataService: DataService) {
	}

	ngOnInit() {
	}

	searchSkill(event) {
		this.requesting = true;
		this.skillsObservable = this.dataService.dictionary_tech_get('techskill', event.query).subscribe(
			response => {
				this.requesting = false;
				this.skills = response;
			},
			error => {
				this.requesting = false;
				this.error = error.message;
			}
		);
	}

	onSelect(event) {
		this.setSkillText(event.name);
		this.skill = event;

		this.onSelected.emit(event);

		if (this.clearOnSelect) {
			this.autocompleteElement.el.nativeElement.querySelector('input').value = '';
		}
	}

	onFocusOut(event) {
		this.skill = event;

		this.onBlur.emit(event);
	}

	setSkillText(text) {
		if (this.skillInField) {
			this.autocompleteElement.el.nativeElement.querySelector('input').value = text;
		}
	}

	ngAfterViewInit() {
		if (this.skill) {
			this.setSkillText(this.skill.name);
		}
	}

}
