import {Action, UserSchoolLookup} from "../../../IsaacAppTypes";
import {ACTION_TYPE} from "../../services/constants";

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
