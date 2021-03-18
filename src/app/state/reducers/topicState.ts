import {IsaacTopicSummaryPageDTO} from "../../../IsaacApiTypes";
import {Action, NOT_FOUND_TYPE} from "../../../IsaacAppTypes";
import {ACTION_TYPE, NOT_FOUND} from "../../services/constants";

export type CurrentTopicState = IsaacTopicSummaryPageDTO | NOT_FOUND_TYPE | null;
export const currentTopic = (currentTopic: CurrentTopicState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.TOPIC_REQUEST:
            return null;
        case ACTION_TYPE.TOPIC_RESPONSE_SUCCESS:
            return action.topic;
        case ACTION_TYPE.TOPIC_RESPONSE_FAILURE:
            return NOT_FOUND;
        case ACTION_TYPE.ROUTER_PAGE_CHANGE:
            return null;
        default:
            return currentTopic;
    }
};
