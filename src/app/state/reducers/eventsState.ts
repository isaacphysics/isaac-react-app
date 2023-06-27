import {Action, EventOverview} from "../../../IsaacAppTypes";
import {ACTION_TYPE} from "../../services";

type EventOverviewsState = EventOverview[] | null;
export const eventOverviews = (eventOverviews: EventOverviewsState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.EVENT_OVERVIEWS_REQUEST:
            return null;
        case ACTION_TYPE.EVENT_OVERVIEWS_RESPONSE_SUCCESS:
            return [...action.eventOverviews];
        default:
            return eventOverviews;
    }
};
