import {FormControl, FormGroup} from "@angular/forms";

export class FormValidator {
	public static validateEmail(control: FormControl): {[key: string]: any} {
		//RegExp from http://emailregex.com/
		let emailRegexp = /^[a-z0-9!#$%&'*+\/=?^_`{|}~.-]+@[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i;
		return control.value && !emailRegexp.test(control.value) ? {'invalidEmail': true} : null;
	}
	public static passwordMatchValidator(passwordKey: string, confirmPasswordKey: string) {
	return (formGroup: FormGroup): {[key: string]: any} => {
		let password = formGroup.get(passwordKey).value;
		let confirmPassword = formGroup.get(confirmPasswordKey).value;

		return password === confirmPassword ? null : {'mismatchedPasswords': true};
	}
}
}

