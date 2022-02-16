import {IsaacPodDTO} from "../../../IsaacApiTypes";
import {Action} from "../../../IsaacAppTypes";
import {ACTION_TYPE} from "../../services/constants";

type NewsState = {news: IsaacPodDTO[]} | null;
export const news = (news: NewsState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.NEWS_RESPONSE_SUCCESS:
            return {news: Array.from(action.theNews)};
        default:
            return news;
    }
};

type ConstantsState = {units?: string[]; segueVersion?: string; segueEnvironment?: string} | null;
export const constants = (constants: ConstantsState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.CONSTANTS_UNITS_RESPONSE_SUCCESS:
            return {...constants, units: action.units};
        case ACTION_TYPE.CONSTANTS_SEGUE_VERSION_RESPONSE_SUCCESS:
            return {...constants, segueVersion: action.segueVersion};
        case ACTION_TYPE.CONSTANTS_SEGUE_ENVIRONMENT_RESPONSE_SUCCESS:
            return {...constants, segueEnvironment: action.segueEnvironment};
        default:
            return constants;
    }
};
