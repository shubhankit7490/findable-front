import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ChartService, ChartItems, ChartGroups } from '../../rest/service/chart.service';
import { Observable } from 'rxjs/Observable';

// services:
import { DataService } from '../../rest/service/data.service';
import { ChartDataService } from '../../services/chart-data.service';

// models:
import * as models from '../../rest/model/models';

@Component({
    selector: 'app-chart-education',
    templateUrl: './chart-education.component.html',
    styleUrls: ['./chart-education.component.css']
})
export class ChartEducationComponent implements OnInit {

    @Input() userId: number;

    @Output() noData = new EventEmitter<any>();

    @Output() onLoaded = new EventEmitter<any>();

    requesting = false;

    educationClear: models.ExistingEducation[];
    education: Observable<models.ExistingEducations>;
    educationItems: ChartItems;
    educationGroups: ChartGroups;
    educationTemplate: Function;
    educationOptions: {} = {
        moveable: false,
        margin: {
            item: {
                vertical: 0
            }
        },
        end: new Date(),
        max: new Date()
    };

    showAdditionalInfo = true;

    constructor(public dataService: DataService, public chartDataService: ChartDataService) { }

    ngOnInit() {
        this.loadEducation();
    }

    loadEducation() {
        this.requesting = true;
        this.educationItems = [];
        this.educationGroups = [];

        this.education = this.chartDataService.getData('education', this.userId);

        if(!!Object.keys(this.education).length) {
            this.requesting = false;
            this.handleChartData(this.education)
        }
        else {
            this.education = this.dataService.education_get(this.userId);
            
            this.education.subscribe(response => {
                this.requesting = false;
                this.educationClear = response;

                this.chartDataService.add('education', this.userId, response);

                this.handleChartData(response);
            });
        }
    }

    handleChartData(data) {
        let chartData = ChartService.getEducationChartData(data);
        this.educationItems = chartData.items;

        if(!this.educationItems.length) {
            this.noData.emit()
            return;
        }

        this.onLoaded.emit()
        this.educationGroups = chartData.groups;
        this.educationTemplate = chartData.template;
    }

}
