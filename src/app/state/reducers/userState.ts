import {Action, UserPreferencesDTO, UserSchoolLookup} from "../../../IsaacAppTypes";
import {ACTION_TYPE} from "../../services/constants";
import {UserAuthenticationSettingsDTO} from "../../../IsaacApiTypes";

type UserAuthSettingsState = UserAuthenticationSettingsDTO | null;
export const userAuthSettings = (userAuthSettings: UserAuthSettingsState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.USER_AUTH_SETTINGS_RESPONSE_SUCCESS:
            return action.userAuthSettings;
        default:
            return userAuthSettings;
    }
};

type UserPreferencesState = UserPreferencesDTO | null;
export const userPreferences = (userPreferences: UserPreferencesState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.USER_PREFERENCES_RESPONSE_SUCCESS:
            return {...action.userPreferences};
        default:
            return userPreferences;
    }
};

export type UserSchoolLookupState = UserSchoolLookup | null;
export const userSchoolLookup = (userSchoolLookup: UserSchoolLookupState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.USER_SCHOOL_LOOKUP_REQUEST:
            return null;
        case ACTION_TYPE.USER_SCHOOL_LOOKUP_RESPONSE_SUCCESS:
            return {...action.schoolLookup};
        default:
            return userSchoolLookup;
    }
};
