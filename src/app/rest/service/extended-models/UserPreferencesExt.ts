import {UserPreferences} from "../../model/UserPreferences";
/**
 * Created by benyamin on 2/13/17.
 */

export interface UserPreferencesExt extends UserPreferences {
	available: string;
	desired_salary_period_readable: string;
}