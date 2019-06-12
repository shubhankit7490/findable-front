import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { ChartService, ChartItems, ChartGroups } from '../../rest/service/chart.service';
import { DataService } from '../../rest/service/data.service';
import { TechSkill } from '../../rest/model/TechSkill';
import { TechSkills } from '../../rest/model/TechSkills';
import { Observable } from 'rxjs/Observable';
import { ChartDataService } from '../../services/chart-data.service';

@Component({
    selector: 'app-chart-skills',
    templateUrl: './chart-skills.component.html',
    styleUrls: ['./chart-skills.component.css']
})
export class ChartSkillsComponent implements OnInit {
    @ViewChild('chartElement') chartElement;
    @ViewChild('chartWrap') chartWrap;

    @Output() noData = new EventEmitter<any>();

    @Output() onLoaded = new EventEmitter<any>();

    @Input() userId: number;

    requesting = false;

    techSkills: Observable<TechSkills>;
    techSkillsClear: TechSkill[];
    techSkillsItems: ChartItems;
    techSkillsGroups: ChartGroups;
    techSkillsOptions: {} = {
        moveable: false,
        margin: {
            item: {
                vertical: 0
            }
        },
        rtl: false,
        autoResize: false,
        start: 1,
        end: 100,
        min: 1,
        max: 100
    };

    showAdditionalInfo = true;

    constructor(public dataService: DataService, public chartDataService: ChartDataService) { }
    ngOnInit(){
        this.loadSkills();
    }

    loadSkills() {
        this.requesting = true;
        this.techSkillsItems = [];
        this.techSkillsGroups = [];

        this.techSkills = this.chartDataService.getData('skills', this.userId);

        if(!!Object.keys(this.techSkills).length) {
            this.requesting = false;
            this.handleChartData(this.techSkills)
        }
        else {
            this.techSkills = this.dataService.skills_get(this.userId);

            this.techSkills.subscribe(response => {
                this.requesting = false;
                this.techSkillsClear = response;

                this.chartDataService.add('skills', this.userId, response);

                this.handleChartData(response);
            });
        }

    }

    updateTimelineComponent() {
        setTimeout(() => {
            let skillChartWidth = (<HTMLElement>this.chartElement.container.nativeElement.querySelector('.vis-center')).style.width;
            let skillParsedChartWidth = Number.parseInt(skillChartWidth);
            let windowWidth = Number.parseInt((<HTMLElement>this.chartElement.container.nativeElement.querySelector('.vis-horizontal')).style.width);
        }, 100)
    }

    generateChartLabels() {
        return ['Basic', 'Pretty good', 'Expert'];
    }

    handleChartData(data) {
        let chartData = ChartService.getSkillsChartData(data);
        this.techSkillsItems = chartData.items;

        if(!this.techSkillsItems.length) {
            this.noData.emit()
            return;
        }

        this.onLoaded.emit()

        this.techSkillsGroups = chartData.groups;
    }

}
