import {Component, OnInit, Input, ViewChild, OnChanges, Output, EventEmitter } from '@angular/core';
import {ChartItems, ChartGroups} from '../../../rest/service/chart.service';
import {Timeline, TimelineOptions} from 'vis'; //, DataSet, Node, Edge, IdType } from 'vis';

@Component({
	selector: 'app-chart',
	templateUrl: 'chart.component.html',
	styleUrls: ['chart.component.css']
})

export class ChartComponent implements OnInit, OnChanges {
	@ViewChild('container') container;
	@Input() items: ChartItems;
	@Input() groups: ChartGroups;
	@Input() template: () => void;
	@Input() nominal: boolean = false;
	@Input() direction: String = 'ltr';
	@Input() showAdditionalInfo: boolean = true;
	@Input() options: TimelineOptions = {};
	@Output() updateTimeline = new EventEmitter();

	timeline: Timeline;
	defaultOptions: {} = {
		'moveable': false,
		'margin': {
			'item': {
				'vertical': 0
			}
		},
		'rtl': false
	};

	constructor() {}

	ngOnChanges(changes) {
		if (changes.showAdditionalInfo) {
			this.toggleAdditionalInfo(changes.showAdditionalInfo.currentValue);
		}
	}

	toggleAdditionalInfo(state): void {
		let items = this.container.nativeElement.getElementsByClassName('fnd-chart-item-additional');

		for (let i = 0; i < items.length; i++) {
			let item = items[i];
			if (!state) {
				items[i].style.display = 'none';
			} else {
				items[i].style.display = 'block';
			}
		}
	}

	ngOnInit() {
		// Add custom template for chart items if delivered by ChartService
		if (this.template) {
			this.defaultOptions['template'] = this.template;
		}

		// If chart x-axis is nominal (e.g. low-mid-high scale) add options for displaying
		// Nominal axis labels.
		// TODO: Format custom labels for Skills when this bug is fixed:
		// https://github.com/almende/vis/issues/2850
		if (this.nominal) {
			this.defaultOptions['showMinorLabels'] = false;
			this.defaultOptions['showMajorLabels'] = false;
		}

		// Update RTL option on init, so the input parameter (direction) already have a value.
		this.defaultOptions['rtl'] = (this.direction === 'rtl');

		// Create the timeline, init it with data.
		let timeline = new Timeline(this.container.nativeElement, this.items, this.groups);
		timeline.setOptions(<TimelineOptions>this.defaultOptions);
		timeline.setOptions(<TimelineOptions>this.options);
		// post-processing of chart template additional data items
		if (this.template) {
			// Workaround for this issue: http://stackoverflow.com/questions/34535989/getting-a-callback-after-visjs-finishes-loading-chart
			// TODO: Check for a solution instead.
			setTimeout(function () {
				// 'changed' event is used to position additional info beside chart items.
				// This can't be done on init or in the template function, because items are not drawn yet.
				timeline.on('changed', function () {

					// Get chart items
					let items = this.dom.container.getElementsByClassName('vis-item-content');
					for (let i = 0; i < items.length; i++) {
						// Get internal items and their properties
						let item = items[i];
						let group = item.closest('.vis-group');
						let range = item.closest('.vis-item.vis-range');

                        let additionalInfoElements: HTMLCollection = item.getElementsByClassName('fnd-chart-item-additional');
                        let additionalInfoElement: HTMLElement = <HTMLElement>additionalInfoElements[0];
                        let rangeOffset: number = parseFloat(range.style.right.split('px', 1)[0]);
                        let rangeWidth: number = parseFloat(range.style.width.split('px', 1)[0]);
                        let additionalInfoWidth = additionalInfoElement.clientWidth;

                        // Calc additional info position
                        let hasSpaceBefore = (rangeOffset - additionalInfoWidth) > 0;
                        let padding = 12;
                        
                        // If the total width of the item + additional info is greater than the available space, 
                        // move the info text to the inside of the item
                        if((additionalInfoWidth + rangeWidth + rangeOffset) > group.clientWidth) {
                            if (hasSpaceBefore) {
                                additionalInfoElement.style.right = (0 - additionalInfoWidth - padding) + 'px';
                            } else {
                                additionalInfoElement.style.right = (rangeWidth - additionalInfoWidth - padding) + 'px';
                                additionalInfoElement.style.color = '#ffffff';
                            }
                        }
                        else {
                            additionalInfoElement.style.right = (rangeWidth + padding) + 'px';
                        }

						// Style is different according to chart direction (rtl / ltr)
						let direction = 'ltr';
						let containerElement: Element = item.closest('.chart-container');
						let container: HTMLElement = <HTMLElement>containerElement;
						if (container.style.hasOwnProperty('direction')) {
							direction = container.style.direction;
						}
						// Fix rtl style
						if (direction === 'rtl') {
							item.style.width = '100%';
						} else {
							// HACK ALERT! using rtl to find out if we are at the skills chart - it's the only
							// one that is NOT flipped RTL.

							// If chart is nominal (using fixed values and not dates) we format the time labels into values.
							let nominalFormat = {
								minorLabels: function (date, scale, step) {
									return '';
								},
								majorLabels: function (date: Date, scale, step) {
									let year = new Date(date).getFullYear();
									let level: string = '';
									switch (year) {
										case 2015:
											level = 'Basic';
											break;
										case 2016:
											level = 'Good';
											break;
										case 2017:
											level = 'Expert';
											break;
									}
									return level;
								}
							};

							let nominalOptions = {
								'showMinorLabels': false,
								'format': nominalFormat,
								'end': new Date('2017-02-01')
							};

							this.setOptions(nominalOptions);
							this.redraw();
						}

					}
				});
			}, 0);
		}



		// Redraw required to eliminate the situation:
		// Template function is executed on first element only after redraw.
		// Without it the first element shows default template.
		// TODO: Find a solution to this work-around.
		timeline.redraw();

		this.updateTimeline.emit(true);

		this.timeline = timeline;
	}

}
