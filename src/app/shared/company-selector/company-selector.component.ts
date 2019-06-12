import { GrowlService } from '../../rest/service/growl.service';
import { AuthService } from '../../rest/service/auth.service';
import { DataService } from '../../rest/service/data.service';
import { Output, Input, EventEmitter } from '@angular/core';
import { Company } from '../../rest/model/Company';
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-company-selector',
    templateUrl: './company-selector.component.html',
    styleUrls: ['./company-selector.component.css']
})
export class CompanySelectorComponent implements OnInit {
    @Input() companies: Company[];

    @Output() onCompanySelected = new EventEmitter<any>();

    selectedCompany: Company;

    submitting: boolean;

    constructor(public authService: AuthService, public dataService: DataService) { }

    ngOnInit() {}

    selectCompany(event, company) {
        this.dataService.update_user_config(this.authService.currentUser.user_id, { active_business_id: company.id }).subscribe(
            response => {
                console.log(response);
                this.onCompanySelected.emit(company.id);
            },
            error => {
                this.handleErrors(error);
            }
        )
    }

    handleErrors(error) {
		let err_body = JSON.parse(error._body);
		if (error.status === 406) {
			for (let i = 0; i < err_body.message.length; i++) {
				GrowlService.message(err_body.message[i]['error'], 'error');
			}
		}

		if (error.status === 403 || error.status === 400) {
			GrowlService.message(err_body.message, 'error');
		}
	}

}
