import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ChartService, ChartItems, ChartGroups } from '../../rest/service/chart.service';
import { DataService } from '../../rest/service/data.service';
import { Positions } from '../../rest/model/Positions';
import { Observable } from 'rxjs/Observable';
import { ChartDataService } from '../../services/chart-data.service';

@Component({
    selector: 'app-chart-experience',
    templateUrl: './chart-experience.component.html',
    styleUrls: ['./chart-experience.component.css']
})
export class ChartExperienceComponent implements OnInit {

    @Input() userId: number;

    @Output() noData = new EventEmitter<any>();

    @Output() onLoaded = new EventEmitter<any>();

    requesting = false;

    experience: Observable<Positions>;
    experienceClear: Positions;
    experienceItems: ChartItems;
    experienceGroups: ChartGroups;
    experienceTemplate: Function;
    experienceOptions: {} = {
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
        this.loadExperience();
    }

    loadExperience() {
        this.requesting = true;
        this.experienceItems = [];
        this.experienceGroups = [];

        this.experience = this.chartDataService.getData('experience', this.userId);

        if(!!Object.keys(this.experience).length) {
            this.requesting = false;
            this.handleChartData(this.experience)
        }
        else {
            this.experience = this.dataService.experience_get(this.userId);

            this.experience.subscribe(response => {
                this.requesting = false;
                this.experienceClear = response;

                this.chartDataService.add('experience', this.userId, response);

                this.handleChartData(response);
            });
        }
    }

    handleChartData(data) {
        let chartData = ChartService.getExperienceChartData(data);
        this.experienceItems = chartData.items;

        if(!this.experienceItems.length) {
            this.noData.emit()
            return;
        }

        this.onLoaded.emit()
        this.experienceGroups = chartData.groups;
        this.experienceTemplate = chartData.template;
    }
}
