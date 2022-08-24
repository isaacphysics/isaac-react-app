import {GlossaryTermDTO} from "../../../IsaacApiTypes";
import {Action} from "../../../IsaacAppTypes";
import {ACTION_TYPE} from "../../services/constants";

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

type GlossaryTermsState = GlossaryTermDTO[] | null;
export const glossaryTerms = (glossaryTerms: GlossaryTermsState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.GLOSSARY_TERMS_RESPONSE_SUCCESS:
            return action.terms;
        case ACTION_TYPE.GLOSSARY_TERMS_RESPONSE_FAILURE:
        default:
            return glossaryTerms;
    }
};
