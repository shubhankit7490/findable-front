import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs/Observable';

// services:
import { ChartService, ChartItems, ChartGroups } from '../../rest/service/chart.service';
import { ChartDataService } from '../../services/chart-data.service';
import { DataService } from '../../rest/service/data.service';

// models:
import * as models from '../../rest/model/models';

@Component({
    selector: 'app-chart-responsibilities',
    templateUrl: './chart-responsibilities.component.html',
    styleUrls: ['./chart-responsibilities.component.css']
})
export class ChartResponsibilitiesComponent implements OnInit {

    @Input() userId: number;

    @Output() noData = new EventEmitter<any>();

    @Output() onLoaded = new EventEmitter<any>();

    requesting = false;

    focusItems: ChartItems;
    focusGroups: ChartGroups;
    focusTemplate: Function;
    focusOptions: {} = {
        end: new Date(),
        stack: false,
        stackSubgroups: true,
        max: new Date()
    }
    focus: Observable<models.Positions>;

    showAdditionalInfo = true;

    constructor(public dataService: DataService, public chartDataService: ChartDataService) { }

    ngOnInit() {
        this.loadResponsibilities();
    }

    loadResponsibilities() {
        this.requesting = true;
        this.focus = this.dataService.experience_get(this.userId);

        this.focusItems = [];
        this.focusGroups = [];

        this.focus = this.chartDataService.getData('experience', this.userId);

        if(!!Object.keys(this.focus).length) {
            this.requesting = false;
            this.handleChartData(this.focus)
        }
        else {
            this.focus = this.dataService.experience_get(this.userId);

            this.focus.subscribe(response => {
                this.requesting = false;

                this.chartDataService.add('experience', this.userId, response);

                this.handleChartData(response);
            });
        }
    }

    handleChartData(data) {
        let chartData = ChartService.getExperienceChartData(data);
        let focusChartData = ChartService.getFocusChartData(data);
        this.focusItems = focusChartData.items;

        if(!this.focusItems.length) {
            this.noData.emit()
            return;
        }
        
        this.onLoaded.emit()

        this.focusGroups = focusChartData.groups;
        this.focusTemplate = chartData.template;
    }

}
