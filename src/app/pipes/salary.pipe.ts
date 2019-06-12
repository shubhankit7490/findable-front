import {Pipe, PipeTransform} from '@angular/core';

@Pipe({
	name: 'salary'
})
export class SalaryPipe implements PipeTransform {
	salaryTypes = {
		H: 'Hourly',
		M: 'Monthly',
		Y: 'Annually'
	};

	transform(value: any, args?: any): any {
		return this.salaryTypes[value];
	};
}
