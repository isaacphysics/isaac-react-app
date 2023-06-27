import {Action, AugmentedEvent, EventMapData, EventOverview} from "../../../IsaacAppTypes";
import {ACTION_TYPE} from "../../services";

type EventsState = {events: AugmentedEvent[]; total: number} | null;
export const events = (events: EventsState = null, action: Action) => {
    const currentEvents = events ? events.events : [];
    switch (action.type) {
        case ACTION_TYPE.EVENTS_RESPONSE_SUCCESS:
            return {events: Array.from(new Set([...currentEvents, ...action.augmentedEvents])), total: action.total};
        case ACTION_TYPE.EVENTS_CLEAR:
            return null;
        default:
            return events;
    }
};

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

type EventMapDataState = EventMapData[] | null;
export const eventMapData = (eventMapData: EventMapDataState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.EVENT_MAP_DATA_REQUEST:
            return null;
        case ACTION_TYPE.EVENT_MAP_DATA_RESPONSE_SUCCESS:
            return [...action.eventMapData];
        default:
            return eventMapData;
    }
};
