import {Action, PotentialUser, UserPreferencesDTO, UserSchoolLookup} from "../../../IsaacAppTypes";
import {ACTION_TYPE} from "../../services/constants";
import {UserAuthenticationSettingsDTO} from "../../../IsaacApiTypes";
import {isaacApi} from "../slices/api";

type UserState = PotentialUser | null;
export const user = (user: UserState = null, action: Action): UserState => {
    switch (action.type) {
        case ACTION_TYPE.USER_LOG_IN_REQUEST:
            return {loggedIn: false, requesting: true};
        case ACTION_TYPE.USER_LOG_IN_RESPONSE_SUCCESS:
        case ACTION_TYPE.CURRENT_USER_RESPONSE_SUCCESS:
        case ACTION_TYPE.USER_DETAILS_UPDATE_RESPONSE_SUCCESS:
            return {loggedIn: true, ...action.user};
        case ACTION_TYPE.CURRENT_USER_RESPONSE_FAILURE:
        case ACTION_TYPE.USER_LOG_OUT_RESPONSE_SUCCESS:
        case ACTION_TYPE.USER_LOG_OUT_EVERYWHERE_RESPONSE_SUCCESS:
            return {loggedIn: false};
        default:
            return user;
    }
};

type UserAuthSettingsState = UserAuthenticationSettingsDTO | null;
export const userAuthSettings = (userAuthSettings: UserAuthSettingsState = null, action: Action) => {
    if (isaacApi.endpoints.setupAccountMFA.matchFulfilled(action)) {
        return {
            ...userAuthSettings,
            mfaStatus: true
        }
    }
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

type TotpChallengePendingState = boolean | null;
export const totpChallengePending = (totpChallengePending: TotpChallengePendingState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.USER_AUTH_MFA_CHALLENGE_REQUIRED:
            return true;
        case ACTION_TYPE.USER_AUTH_MFA_CHALLENGE_SUCCESS:
            return false;
        default:
            return totpChallengePending;
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
