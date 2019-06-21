import {DOCUMENT_TYPE} from "./constants";
import {ContentDTO, IsaacTopicSummaryPageDTO} from "../../IsaacApiTypes";

// TODO In the future we should limit the size of these page caches but currently I doubt we have enough pages to worry about it
export const documentCache: {[documentType in DOCUMENT_TYPE]: {[id: string]: ContentDTO}} = {
    [DOCUMENT_TYPE.CONCEPT]: {},
    [DOCUMENT_TYPE.QUESTION]: {},
    [DOCUMENT_TYPE.GENERIC]: {},
    [DOCUMENT_TYPE.FRAGMENT]: {},
    [DOCUMENT_TYPE.SHORTCUT]: {},
};

export const topicCache: {[tag: string]: IsaacTopicSummaryPageDTO} = {};
