import { Component, Input, Output, OnInit, EventEmitter } from '@angular/core';

import { DataService } from '../../rest/service/data.service';
import { AnalyticsService } from '../../services/analytics.service';

import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { AuthService } from '../../rest/service/auth.service';

@Component({
	selector: 'app-about-me',
	styles: [`
        .wrapper {
            border: 1px solid #c5c8d3;
            font-size: 18px;
            color: #1e3d66;
            border-radius: 3px;
            padding: 10px 10px;
            width: 100%;
            height: 270px;
        }

        .form-wrapper {
            margin: 5px 0 5px 0px;
        }

        :host >>> textarea:focus {
            outline: 0;
        }

        :host >>> .type-hint {
            width: 150px;
            position: absolute;
            right: 150px;
            color: #cecece;
        }
	`],
	template: `
        <form [formGroup]="aboutMeForm" (ngSubmit)="onSubmit()" class="form-wrapper" autocomplete="off">
        <textarea maxlength="300" formControlName="aboutMe" (keyup)="CalculateFieldValue($event, typeHint)"
                  [ngModel]="profile" class="wrapper" placeholder="Write some text about yourself, max 300 letters">
        </textarea>
            <div class="fnd-form-submit-container">
                <div #typeHint class="type-hint">
                    {{aboutMeLength}} Characters Left
                </div>
                <button type="submit" class="btn btn-success" [disabled]="!aboutMeForm.valid">Done</button>
            </div>
        </form>`
})
export class AboutMeComponent implements OnInit {
	aboutMeForm: FormGroup;
	@Output() personalDetailsAbout = new EventEmitter<string>();
	@Input() profile: string;
	@Input() aboutMeLength: Number;

	constructor(public authService: AuthService, public dataService: DataService, public formBuilder: FormBuilder, public analyticsService: AnalyticsService) {
		this.aboutMeForm = this.formBuilder.group({
			aboutMe: ['', Validators.required]
		});
		this.dataService = dataService;
		this.authService = authService;
		this.analyticsService = analyticsService;
	}

	ngOnInit() {
	}

	onSubmit() {
		this.personalDetailsAbout.emit(this.aboutMeForm.value.aboutMe);
	}

	CalculateFieldValue(ev, el) {
		this.aboutMeLength = 300 - ev.target.value.length;
		el.innerHTML = this.aboutMeLength + ' Characters left';
	}
}
