import {Action} from "../../../IsaacAppTypes";
import {ACTION_TYPE} from "../../services";
import {UserAuthenticationSettingsDTO} from "../../../IsaacApiTypes";
import {userApi} from "../index";

type UserAuthSettingsState = UserAuthenticationSettingsDTO | null;
export const userAuthSettings = (userAuthSettings: UserAuthSettingsState = null, action: Action) => {
    if (userApi.endpoints.setupAccountMFA.matchFulfilled(action)) {
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
