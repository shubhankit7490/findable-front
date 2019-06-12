import {Injectable} from '@angular/core';

// models:
import * as models from '../model/models';

declare let moment: any;

@Injectable()
export class ChartService {
	static labelInBarTimeDiff = 10518975;

	constructor() { }

	static getExperienceChartData(experiences: models.Position[]): ChartData {
		let items: ChartItem[] = [];
		let groups: ChartGroup[] = [];

		// Go over experience positions, format each position as a chart item and group.
		experiences.forEach(({ job_title, seniority, to, from, current, company }: models.Position, index): void => {
			// Subtracting 10 days to avoid to margin bug in the graph where to position's current = 1
			let endDate: number =
				Number.parseInt(current.toString())
					? new Date().setDate(new Date().getDate() - 10)
					: new Date(to.split(' ')[0]).setDate(new Date(to.split(' ')[0]).getDate() - 10);
			
			let endDateCalculations: Date =
				Number.parseInt(current.toString())
					? new Date()
					: new Date(to.split(' ')[0]);

			let positionLabel: string = (seniority.name === null) ? job_title.name : job_title.name + ' | ' + seniority.name;
			
			let timeDiffInSeconds: number =
				Math.floor(endDateCalculations.getTime() / 1000) - (new Date(from.split(' ')[0]).getTime() / 1000);

			let barLabel: string = ChartItem.getYearsLiteral(
					new Date(from.split(' ')[0]),
					endDateCalculations
				).replace(' ', '');

			if (timeDiffInSeconds <= ChartService.labelInBarTimeDiff) {
				positionLabel = barLabel + ' | ' + positionLabel;
			}

			let positionData: ChartItem = new ChartItem(
				new Date(from.split(' ')[0]),
				endDate,
				positionLabel,
				index,
				'fnd_color_' + index,
				endDateCalculations
			);
			let positionGroup: ChartGroup = new ChartGroup(
				index,
				company.name,
				'',
				'height: 40px;',
				index
			);

			items = [ ...items, positionData ];
			groups = [ ...groups, positionGroup ];
		});

		return { items, groups, template: ChartItem.chartTemplate };
	}

	/**
	 * Calculate and render education chart
	 * @param {models.ExistingEducation[]} educations
	 * @returns {ChartData} chart data
	 */
	static getEducationChartData(educations: models.ExistingEducation[]): ChartData {
		let items: ChartItem[] = [];
		let groups: ChartGroup[] = [];

		educations.forEach(({ name, from, to, current, level, fields }, index): void => {

			/**
			 * calculate end date
			 * If it is truthy, subtracting 10 days to avoid a margin bug
			 * in the graph.
			 *  If education @prop {number} to is null then @prop {string} current is true.
			 * @example 1466553600000
			 */
			let endDate: number = to !== null
				? Number(current)
					? new Date().setDate(new Date().getDate() - 10)
					: new Date(to.split(' ')[0]).setDate(new Date(to.split(' ')[0]).getDate() - 10)
				: new Date().setDate(new Date().getDate() - 10);

			/**
			 * calculate end date
			 * 
			 * @example Fri Feb 03 2017 02:00:00 GMT+0200 (Jerusalem Standard Time)
			 */
			let endDateCalculations: Date = to !== null
				? Number(current)
					? new Date()
					: new Date(to.split(' ')[0])
				: new Date();

			/**
			 * Calculate time difference in seconds
			 */
			let timeDiffInSeconds: number =
				Math.floor(endDateCalculations.getTime() / 1000) - (new Date(from.split(' ')[0]).getTime() / 1000);

			/**
			 * 
			 */
			let barLabel: string = ChartItem.getYearsLiteral(
					new Date(from.split(' ')[0]),
					endDateCalculations
				).replace(' ', '');

			// Education description is made of all study fields
			let studyFields: string = '';

			if (timeDiffInSeconds < ChartService.labelInBarTimeDiff) {
				studyFields += `${barLabel} | `;
			}

			if (fields.length > 0) {
				studyFields += fields[0].name;
			}
			if (fields.length > 1) {
				studyFields += ` and ${(fields.length - 1)} more`;
			}

			let educationItemLabel: string = fields.length > 0
				? `${studyFields} | ${level.name}`
				: level.name;

			let educationItemData: ChartItem
				= new ChartItem(
						new Date(from.split(' ')[0]),
						endDate,
						educationItemLabel,
						index,
						'fnd_color_' + index,
						endDateCalculations
					);
			
			let educationItemGroup: ChartGroup
				= new ChartGroup(
						index,
						name,
						'',
						'height: 40px;',
						index
					);

			items = [...items, educationItemData];
			groups = [...groups, educationItemGroup];
		});

		return { items, groups, template: ChartItem.chartTemplate };
	}

	/**
	 * Calculate and render job positions chart
	 * @param {models.Position[]} experiences
	 * @returns {ChartData} chart data
	 */
	static getFocusChartData(experiences: models.Position[]): ChartData {
		let items: ChartItem[] = [];
		let groups: ChartGroup[] = [];
		let color: number = 0;

		experiences.forEach(({ company, location, industry, current, from, to, areas_of_focus }: models.Position, index): void => {
			// Subtracting 10 days to avoid to margin bug in the graph where to position's current = 1
			let endDate: number =
				Number.parseInt(current.toString())
					? new Date().setDate(new Date().getDate() - 10)
					: new Date(to.split(' ')[0]).setDate(new Date(to.split(' ')[0]).getDate() - 10);
			
			let endDateCalculations: Date =
				Number.parseInt(current.toString())
					? new Date()
					: new Date(to.split(' ')[0]);

			let timeDiffInSeconds: number =
				Math.floor(endDateCalculations.getTime() / 1000) - (new Date(from.split(' ')[0]).getTime() / 1000);

			let barLabel: string = ChartItem.getYearsLiteral(
					new Date(from.split(' ')[0]),
					endDateCalculations
				).replace(' ', '');

			let positionLabel: string = company.name;

			if (timeDiffInSeconds < ChartService.labelInBarTimeDiff) {
				positionLabel = `${barLabel} | ${positionLabel}`;
			}

			// For each position, loop over all areas of focus
			areas_of_focus.forEach(({ name }: models.AreaOfFocus, index): void => {
				let focusData: ChartItem
				= new ChartItem(
						new Date(from.split(' ')[0]),
						endDate,
						positionLabel,
						color,
						'fnd_color_' + color,
						endDateCalculations
					);

				let focusGroup: ChartGroup
					= new ChartGroup(
						color,
						name,
						'',
						'height: 40px;',
						color
					);
				
				items = [ ...items, focusData];
				groups = [...groups, focusGroup];
				color++;
			});
		});

		return { items, groups, template: ChartItem.chartTemplate };
	}

	/**
	 * 
	 * @param skills 
	 */
	static getSkillsChartData(skills: models.TechSkill[]): ChartData {
		let items: ChartItem[] = [];
		let groups: ChartGroup[] = [];

		skills.forEach(({ level, name }, index): void => {
			let startDate: number = 1;
			let calcLevel: number = (level > 90) ? level - 0.9 : level;
			let endDate: number = Number.parseInt(calcLevel.toString());

			let skillData: ChartItem = new ChartItem(
				startDate,
				endDate,
				'',
				name,
				'fnd_color_' + index
			);

			let skillGroup: ChartGroup = new ChartGroup(
				name,
				name,
				'',
				'height: 40px;',
				index
			);

			items = [ ...items, skillData ];
			groups = [ ...groups, skillGroup ];
		});

		return { items, groups };
	}

}

export class ChartItem {
	constructor(
		public start: any,
		public end: number,
		public content: string,
		public group: any,
		public className: string,
		public desc: any = null,
	) {}

	/**
	 * getYearsLiteral takes a start date and end date, and returns the number
	 * of years between them, rounded to 1 decimal point, with "years" literal
	 * @param start - Start date
	 * @param end - End date
	 * @returns {string} years difference, in readable format e.g. "2.3 years"
	 */
	public static getYearsLiteral(start: Date, end: Date): string {
		// Item content on the bar is number of years in the position
		end = end ? end : new Date();
		let years: number = moment(end).diff(start, 'years', true);
		let roundedYears: number = Number(years.toFixed(1));
		let yearsLiteral: string = '';
		if (roundedYears < 1) {
			roundedYears = Math.round(moment(end).diff(start, 'months', true));
			yearsLiteral = 'M';
		} else {
			yearsLiteral = 'years';
		}
		return roundedYears + ' ' + yearsLiteral;
	}

	// Add formatting power to String.
	public static format(template: string, args: Array<any>): string {
		return template.replace(/{(\d+)}/g, function (match: string, number: number) {
			return typeof args[number] != 'undefined'
				? args[number]
				: match
				;
		});
	}

	/**
	 * Define item template for education
	 * @param {ChartItem} params0:{ start, desc, content } 
	 * @param {HTMLElement} element 
	 */
	public static chartTemplate({ start, desc, content }: ChartItem, element: HTMLElement) {
		// Define the template and render it with data
		let template = '<div class="fnd-chart-item-additional">{0}</div><div class="fnd-chart-value">{1}</div>';
		let timeDiffInSeconds = Math.floor(desc.getTime() / 1000) - (new Date(start).getTime() / 1000);
		let render: string;
		if (timeDiffInSeconds < ChartService.labelInBarTimeDiff) {
			render = ChartItem.format(template, [content, '']);
		} else {
			render = ChartItem.format(template, [content, ChartItem.getYearsLiteral(start, desc)]);
		}
		return render;
	}

}

export class ChartGroup {
	constructor(public id: any, public content: string, public className: string, public style: string, public order: any) {}
}

export class ChartItems extends Array<ChartItem> {
}
export class ChartGroups extends Array<ChartGroup> {
}

export interface ChartData {
	items: ChartItem[];
	groups: ChartGroup[];
	template?: (item: ChartItem, element: HTMLElement) => string | number[];
}
