import {Action, AugmentedEvent, EventMapData, EventOverview, NOT_FOUND_TYPE} from "../../../IsaacAppTypes";
import {ACTION_TYPE, NOT_FOUND} from "../../services/constants";
import {EventBookingDTO} from "../../../IsaacApiTypes";
import {routerPageChange} from "../index";

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

export type CurrentEventState = AugmentedEvent | NOT_FOUND_TYPE | null;
export const currentEvent = (currentEvent: CurrentEventState = null, action: Action) => {
    if (routerPageChange.match(action)) {
        return null;
    }
    switch (action.type) {
        case ACTION_TYPE.EVENT_RESPONSE_SUCCESS:
            return {...action.augmentedEvent};
        case ACTION_TYPE.EVENT_RESPONSE_FAILURE:
            return NOT_FOUND;
        case ACTION_TYPE.EVENT_REQUEST:
            return null;
        default:
            return currentEvent;
    }
};

export type EventBookingsState = EventBookingDTO[] | null;
export const eventBookings = (eventBookings: EventBookingsState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.EVENT_BOOKINGS_RESPONSE_SUCCESS:
            return [...action.eventBookings];
        case ACTION_TYPE.EVENT_BOOKING_REQUEST:
            return null;
        default:
            return eventBookings;
    }
};

export const eventBookingsForGroup = (eventBookingsForGroup: EventBookingsState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.EVENT_BOOKINGS_FOR_GROUP_RESPONSE_SUCCESS:
            return [...action.eventBookingsForGroup];
        case ACTION_TYPE.EVENT_BOOKINGS_FOR_GROUP_REQUEST:
            return null;
        default:
            return eventBookingsForGroup;
    }
};

export const eventBookingsForAllGroups = (eventBookingsForAllGroups: EventBookingsState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.EVENT_BOOKINGS_FOR_ALL_GROUPS_RESPONSE_SUCCESS:
            return [...action.eventBookingsForAllGroups];
        case ACTION_TYPE.EVENT_BOOKINGS_FOR_ALL_GROUPS_REQUEST:
            return null;
        default:
            return eventBookingsForAllGroups;
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
