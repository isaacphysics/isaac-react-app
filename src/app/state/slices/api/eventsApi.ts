import {isaacApi} from "./baseApi";
import {EventBookingDTO, IsaacEventPageDTO} from "../../../../IsaacApiTypes";
import {onQueryLifecycleEvents} from "./utils";
import {AdditionalInformation, AugmentedEvent, EventOverview} from "../../../../IsaacAppTypes";
import {apiHelper, EventStatusFilter, EventTypeFilter, isDefined, STAGE} from "../../../services";
import {EventOverviewFilter} from "../../../components/elements/panels/EventOverviews";

const augmentEvent = (event: IsaacEventPageDTO): AugmentedEvent => {
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

type EventsQueryParams = {
    typeFilter: EventTypeFilter;
    statusFilter: EventStatusFilter;
    stageFilter: STAGE[];
    startIndex: number;
    limit: number;
}

export const eventsApi = isaacApi.enhanceEndpoints({
    addTagTypes: ["EventBookings", "Event", "EventsList", "EventGroupBookings", "AllEventGroupBookings", "AdminEventsList"],
}).injectEndpoints({
    endpoints: (build) => ({
        getEvent: build.query<AugmentedEvent, string>({
            query: (eventId) => `/events/${eventId}`,
            providesTags: (event) => event ? [{type: "Event", id: event.id}] : [],
            transformResponse: augmentEvent,
        }),

        getEvents: build.query<{events: AugmentedEvent[], total: number}, EventsQueryParams>({
            query: ({startIndex, limit, stageFilter, statusFilter, typeFilter}) => ({
                url: "/events",
                params: {
                    tags: typeFilter !== EventTypeFilter["All groups"] ? typeFilter : undefined,
                    start_index: startIndex,
                    limit,
                    show_active_only: statusFilter === EventStatusFilter["Upcoming events"],
                    show_booked_only: statusFilter === EventStatusFilter["My booked events"],
                    show_reservations_only: statusFilter === EventStatusFilter["My event reservations"],
                    show_stage_only: !stageFilter.includes(STAGE.ALL) ? stageFilter.join(',') : undefined
                }
            }),
            transformResponse: (data: {results: IsaacEventPageDTO[], totalResults: number}) => ({events: data.results.map(augmentEvent), total: data.totalResults}),
            serializeQueryArgs: ({endpointName}) => {
                return endpointName;
            },
            merge: ({events: currentEvents}, {events: newEvents, total}, { arg }) => {
                if (arg.startIndex === 0) {
                    return {events: newEvents, total};
                }
                
                return {events: Array.from(new Set([...currentEvents, ...newEvents])), total};
            },
            // i.e. choose the query args that cause the query to be rerun, to update what is currently in the cache.
            // As far as I can tell, forceRefetch should be entirely disjoint from serializeQueryArgs (and visa versa).
            forceRefetch: ({currentArg, previousArg}) => {
                return currentArg !== previousArg;
            },
            providesTags: ["EventsList"],
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Events request failed",
            })
        }),

        adminGetEventOverviews: build.query<{eventOverviews: EventOverview[], total: number}, {startIndex: number; limit: number; eventOverviewFilter: EventOverviewFilter}>({
            query: ({startIndex, limit, eventOverviewFilter}) => ({
                url: "/events/overview",
                params: {
                    start_index: startIndex,
                    limit,
                    filter: eventOverviewFilter
                }
            }),
            transformResponse: (data: {results: EventOverview[], totalResults: number}) => ({eventOverviews: data.results, total: data.totalResults}),
            serializeQueryArgs: ({queryArgs}) => {
                const {eventOverviewFilter} = queryArgs;
                return {eventOverviewFilter};
            },
            merge: ({eventOverviews: currentEvents}, {eventOverviews: newEvents, total}) => {
                return {eventOverviews: Array.from(new Set([...currentEvents, ...newEvents])), total};
            },
            forceRefetch: ({currentArg, previousArg}) => {
                return currentArg?.startIndex !== previousArg?.startIndex || currentArg?.limit !== previousArg?.limit;
            },
            providesTags: ["AdminEventsList"],
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Failed to load event overviews",
            })
        }),

        // === Self booking endpoints ===

        bookMyselfOnEvent: build.mutation<void, {eventId: string; additionalInformation: AdditionalInformation}>({
            query: ({eventId, additionalInformation}) => ({
                url: `/events/${eventId}/bookings`,
                method: "POST",
                body: additionalInformation
            }),
            invalidatesTags: (_, __, {eventId}) => [{type: "Event", id: eventId}],
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Event booking failed",
                successTitle: "Event booking confirmed",
                successMessage: "You have been successfully booked onto this event.",
            })
        }),

        // The way `waitingListOnly` is used here is kind of bad practice since it's only used for toasts. This isn't
        // really a problem for mutations, but it's not great for queries, because it means that the query will be
        // refetched when the "useless" parameter changes. In cases like that, using a lazy query hook would work.
        addMyselfToWaitingList: build.mutation<void, {eventId: string; additionalInformation: AdditionalInformation; waitingListOnly?: boolean}>({
            query: ({eventId, additionalInformation}) => ({
                url: `/events/${eventId}/waiting_list`,
                method: "POST",
                body: additionalInformation
            }),
            invalidatesTags: (_, __, {eventId}) => [{type: "Event", id: eventId}],
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Event booking failed",
                successTitle: ({waitingListOnly}) => waitingListOnly
                    ? "Booking request received"
                    : "Waiting list booking confirmed",
                successMessage: ({waitingListOnly}) => waitingListOnly
                    ? "You have requested a place on this event."
                    : "You have been successfully added to the waiting list for this event.",
            })
        }),

        cancelMyBooking: build.mutation<void, string>({
            query: (eventId) => ({
                url: `/events/${eventId}/bookings/cancel`,
                method: "DELETE"
            }),
            invalidatesTags: (_, __, eventId) => [{type: "Event", id: eventId}],
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Event booking cancellation failed",
                successTitle: "Your booking has been cancelled",
                successMessage: "Your booking has successfully been cancelled.",
            })
        }),

        // === Booking management ===

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

        bookUserOnEvent: build.mutation<void, {eventId: string; userId: number; additionalInformation: AdditionalInformation}>({
            query: ({eventId, userId, additionalInformation}) => ({
                url: `/events/${eventId}/bookings/${userId}`,
                method: "POST",
                body: additionalInformation
            }),
            invalidatesTags: ["EventBookings"],
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "The action on behalf of the user was unsuccessful",
                successTitle: "Action successful",
                successMessage: "The action on behalf of the user was successful."
            })
        }),

        reserveUsersOnEvent: build.mutation<void, {eventId: string; userIds: number[]}>({
            query: ({eventId, userIds}) => ({
                url: `/events/${eventId}/reservations`,
                method: "POST",
                body: userIds
            }),
            invalidatesTags: (_, __, {eventId}) => ["EventGroupBookings", {type: "Event", id: eventId}],
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Reservation failed",
                successTitle: "Reservations confirmed",
                successMessage: "You have successfully reserved students onto this event."
            })
        }),

        // === Admin event manager endpoints ===

        promoteUserBooking: build.mutation<void, {eventId: string; userId: number}>({
            query: ({eventId, userId}) => ({
                url: `/events/${eventId}/bookings/${userId}/promote`,
                method: "POST",
                body: {eventId, userId} // TODO <--- is this body even needed?
            }),
            invalidatesTags: ["EventBookings"],
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Failed to promote event booking"
            })
        }),

        resendUserConfirmationEmail: build.mutation<void, {eventId: string; userId: number}>({
            query: ({eventId, userId}) => ({
                url: `/events/${eventId}/bookings/${userId}/resend_confirmation`,
                method: "POST"
            }),
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Failed to resend email for event booking",
                successTitle: "Event email sent",
                successMessage: ({userId}) => `Email sent to ${userId}`
            })
        }),

        cancelUserBooking: build.mutation<void, {eventId: string; userId: number}>({
            query: ({eventId, userId}) => ({
                url: `/events/${eventId}/bookings/${userId}/cancel`,
                method: "DELETE"
            }),
            invalidatesTags: ["EventBookings"],
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Failed to cancel event booking",
            })
        }),

        deleteUserBooking: build.mutation<void, {eventId: string; userId: number}>({
            query: ({eventId, userId}) => ({
                url: `/events/${eventId}/bookings/${userId}`,
                method: "DELETE",
            }),
            invalidatesTags: ["EventBookings"],
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Failed to un-book user from event"
            })
        }),

        recordUserEventAttendance: build.mutation<void, {eventId: string; userId: number; attended: boolean}>({
            query: ({eventId, userId, attended}) => ({
                url: `/events/${eventId}/bookings/${userId}/record_attendance?attended=${attended}`,
                method: "POST"
            }),
            invalidatesTags: ["EventBookings"],
            onQueryStarted: onQueryLifecycleEvents({
                errorTitle: "Failed to record event attendance"
            })
        }),
    })
});

export const {
    useGetEventQuery,
    useLazyGetEventsQuery,
    useGetEventBookingsQuery,
    useLazyAdminGetEventOverviewsQuery,
    useGetEventBookingsForGroupQuery,
    useCancelUsersReservationsOnEventMutation,
    useRecordUserEventAttendanceMutation,
    useCancelUserBookingMutation,
    useDeleteUserBookingMutation,
    usePromoteUserBookingMutation,
    useResendUserConfirmationEmailMutation,
    useAddMyselfToWaitingListMutation,
    useBookMyselfOnEventMutation,
    useCancelMyBookingMutation,
    useBookUserOnEventMutation,
    useReserveUsersOnEventMutation
} = eventsApi;
