import {GlossaryTermDTO} from "../../../IsaacApiTypes";
import {Action} from "../../../IsaacAppTypes";
import {ACTION_TYPE} from "../../services";

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
