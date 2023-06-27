import {isaacApi} from "./baseApi";
import {EventBookingDTO, IsaacEventPageDTO} from "../../../../IsaacApiTypes";
import {onQueryLifecycleEvents} from "./utils";
import {AugmentedEvent} from "../../../../IsaacAppTypes";
import {apiHelper, isDefined} from "../../../services";

export const augmentEvent = (event: IsaacEventPageDTO): AugmentedEvent => {
    const augmentedEvent: AugmentedEvent = Object.assign({}, event);
    if (event.date != null) {
        const startDate = new Date(event.date);
        const now = Date.now();
        if (event.endDate != null) {  // Non-breaking change; if endDate not specified, behaviour as before
            const endDate = new Date(event.endDate);
            augmentedEvent.isMultiDay = startDate.toDateString() != endDate.toDateString();
            augmentedEvent.hasExpired = now > endDate.getTime();
            augmentedEvent.isInProgress = startDate.getTime() <= now && now <= endDate.getTime();
        } else {
            augmentedEvent.hasExpired = now > startDate.getTime();
            augmentedEvent.isInProgress = false;
            augmentedEvent.isMultiDay = false;
        }
        augmentedEvent.isWithinBookingDeadline =
            !augmentedEvent.hasExpired &&
            (event.bookingDeadline ? now <= new Date(event.bookingDeadline).getTime() : true);
    }

    if (event.tags) {
        augmentedEvent.isATeacherEvent = event.tags.includes("teacher");
        augmentedEvent.isAStudentEvent = event.tags.includes("student");
        augmentedEvent.isVirtual = event.tags.includes("virtual");
        augmentedEvent.isRecurring = event.tags.includes("recurring");
        augmentedEvent.isStudentOnly = event.tags.includes("student_only");
        if (event.tags.includes("physics")) {
            augmentedEvent.field = "physics";
        }
        if (event.tags.includes("maths")) {
            augmentedEvent.field = "maths";
        }
    }

    augmentedEvent.isNotClosed = !["CLOSED", "CANCELLED"].includes(event.eventStatus as string);
    augmentedEvent.isCancelled = event.eventStatus === "CANCELLED";
    augmentedEvent.isWaitingListOnly = event.eventStatus === "WAITING_LIST_ONLY";
    augmentedEvent.isReservationOnly = event.eventStatus === "RESERVATION_ONLY";

    // we have to fix the event image url.
    if(augmentedEvent.eventThumbnail && augmentedEvent.eventThumbnail.src) {
        augmentedEvent.eventThumbnail.src = apiHelper.determineImageUrl(augmentedEvent.eventThumbnail.src);
    } else {
        if (augmentedEvent.eventThumbnail == null) {
            augmentedEvent.eventThumbnail = {};
        }
        augmentedEvent.eventThumbnail.src = 'http://placehold.it/500x276';
    }

    return augmentedEvent;
};


export const eventsApi = isaacApi.enhanceEndpoints({
    addTagTypes: ["EventBookings", "Event", "EventGroupBookings", "AllEventGroupBookings"],
}).injectEndpoints({
    endpoints: (build) => ({
        getEvent: build.query<AugmentedEvent, string>({
            query: (eventId) => `/events/${eventId}`,
            providesTags: (event) => event ? [{type: "Event", id: event.id}] : [],
            transformResponse: augmentEvent,
        }),

        getEventBookings: build.query<EventBookingDTO[], string>({
            query: (eventId) => `/events/${eventId}/bookings`,
            providesTags: ["EventBookings"],
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Failed to load event bookings",
            })
        }),

        getEventBookingsForGroup: build.query<EventBookingDTO[], {eventId: string; groupId: number}>({
            query: ({eventId, groupId}) => `/events/${eventId}/bookings/for_group/${groupId}`,
            providesTags: (eventBookings, _, {eventId, groupId}) => isDefined(eventBookings) ? [{type: "EventGroupBookings", id: `${eventId}|${groupId}`}] : [],
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Failed to load event bookings",
            })
        }),

        getEventBookingsForAllGroups: build.query<EventBookingDTO[], string>({
            query: (eventId) => `/events/${eventId}/groups_bookings`,
            providesTags: (eventBookings, _, eventId) => isDefined(eventBookings) ? [{type: "AllEventGroupBookings", id: eventId}] : [],
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Failed to load event bookings",
            })
        }),

        cancelUsersReservationsOnEvent: build.mutation<void, {eventId: string; userIds: number[]; groupId?: number}>({
            query: ({eventId, userIds}) => ({
                url: `/events/${eventId}/reservations/cancel`,
                method: "POST",
                body: userIds,
            }),
            invalidatesTags: (_, error, {eventId, groupId}) => !error ? [{type: "Event", id: eventId}, {type: "AllEventGroupBookings" as const, id: eventId}, ...(groupId ? [{type: "EventGroupBookings" as const, id: `${eventId}|${groupId}`}] : [])] : [],
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Unable to cancel some of the reservations",
                successTitle: "Reservations cancelled",
                successMessage: "You have successfully cancelled students reservations for this event."
            })
        }),
    })
});

export const {
    useGetEventQuery,
    useGetEventBookingsQuery,
    useGetEventBookingsForGroupQuery,
    useGetEventBookingsForAllGroupsQuery,
    useCancelUsersReservationsOnEventMutation,
} = eventsApi;
