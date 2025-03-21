import {
    atLeastOne,
    isDefined,
    isTeacherOrAbove,
    zeroOrLess
} from "./";
import {AugmentedEvent, PotentialUser} from "../../IsaacAppTypes";
import {DateString, FRIENDLY_DATE, TIME_ONLY} from "../components/elements/DateString";
import React from "react";
import {Link} from "react-router-dom";
import {Immutable} from "immer";

export const studentOnlyEventMessage = (eventId?: string) => <React.Fragment>
    {"This event is aimed at students. If you are not a student but still wish to attend, please "}
    <Link to={`/contact?subject=${encodeURI("Non-student attendance at " + eventId)}`}>contact us</Link>.
</React.Fragment>;

export const formatEventDetailsDate = (event: AugmentedEvent) => {
    if (event.isRecurring) {
        return <span>Series starts <DateString>{event.date}</DateString></span>;
    } else if (event.isMultiDay) {
        return <><DateString>{event.date}</DateString>{" — "}<DateString>{event.endDate}</DateString></>;
    } else {
        return <><DateString>{event.date}</DateString>{" — "}<DateString formatter={TIME_ONLY}>{event.endDate}</DateString></>;
    }
};

export const formatEventCardDate = (event: AugmentedEvent, podView?: boolean) => {
    if (event.isRecurring) {
        return <span>Series starts <DateString formatter={FRIENDLY_DATE}>{event.date}</DateString><br />
            <DateString formatter={TIME_ONLY}>{event.date}</DateString> — <DateString formatter={TIME_ONLY}>{event.endDate}</DateString>
        </span>;
    } else if (event.isMultiDay) {
        return <>
            From <DateString>{event.date}</DateString><br/>
            to <DateString>{event.endDate}</DateString>
        </>;
    } else {
        return <>
            <DateString formatter={FRIENDLY_DATE}>{event.endDate}</DateString>{podView ? " " : <br />}
            <DateString formatter={TIME_ONLY}>{event.date}</DateString> — <DateString formatter={TIME_ONLY}>{event.endDate}</DateString>
        </>;
    }
};

export const formatAvailabilityMessage = (event: AugmentedEvent) => {
    if (event.isWaitingListOnly) {
        //  in this case, the waiting list is for booking requests that must be approved
        return "Bookings available by request!";
    }
    // this is an event which can be freely joined, however it happens to be full
    return "Waiting list booking is available!";
};

export const formatWaitingListBookingStatusMessage = (event: AugmentedEvent) => {
    if (event.isWaitingListOnly) {
        return "You have requested a place on this event.";
    }
    return "You are on the waiting list for this event.";
};

export const formatMakeBookingButtonMessage = (event: AugmentedEvent) => {
    if (event.userBookingStatus === "RESERVED") {
        return "Confirm your reservation";
    }
    if (event.isWaitingListOnly) {
        return "Request a place";
    }
    if (zeroOrLess(event.placesAvailable)) {
        return "Join waiting list";
    }
    return "Book a place";
};

export const formatCancelBookingButtonMessage = (event: AugmentedEvent) => {
    if (event.userBookingStatus == "CONFIRMED") {
        return "Cancel your booking";
    }
    else if (event.userBookingStatus == "RESERVED") {
        return "Cancel your reservation";
    }
    else if (event.userBookingStatus == "WAITING_LIST") {
        return event.isWaitingListOnly ? "Cancel booking request" : "Leave waiting list";
    }
};

export const formatManageBookingActionButtonMessage = (event: AugmentedEvent) => {
    if (event.userBookingStatus === "RESERVED") {
        return "Confirm reservation";
    }
    if (event.isWaitingListOnly) {
        return "Make booking request";
    }
    if (zeroOrLess(event.placesAvailable)) {
        return "Add to waiting list";
    }
    return "Book a place";
};

export const formatBookingModalConfirmMessage = (event: AugmentedEvent, userCanMakeEventBooking?: boolean) => {
    if (userCanMakeEventBooking) {
        return "Book now";
    }
    else {
        return event.isWithinBookingDeadline ? "Apply" : "Apply - deadline past";
    }
};

export const userSatisfiesStudentOnlyRestrictionForEvent = (user: Immutable<PotentialUser> | null, event: AugmentedEvent) => {
    return event.isStudentOnly ? !isTeacherOrAbove(user) : true;
};

export const userIsTeacherAtAStudentEvent = (user: Immutable<PotentialUser> | null, event: AugmentedEvent) => {
    return event.isAStudentEvent && isTeacherOrAbove(user);
};

export const userBookedReservedOrOnWaitingList = (user: Immutable<PotentialUser> | null, event: AugmentedEvent) => {
    return isDefined(event.userBookingStatus) && ["WAITING_LIST", "CONFIRMED", "RESERVED"].includes(event.userBookingStatus);
};

export const ifEventIsReservationsOnlyThenUserIsTeacherOrUserIsReserved = (user: Immutable<PotentialUser> | null, event: AugmentedEvent) => {
    return event.isReservationOnly ? (isTeacherOrAbove(user) || event.userBookingStatus === "RESERVED") : true;
};

export const userCanMakeEventBooking = (user: Immutable<PotentialUser> | null, event: AugmentedEvent) => {
    return event.isNotClosed &&
        event.isWithinBookingDeadline &&
        !event.isWaitingListOnly &&
        event.userBookingStatus !== "CONFIRMED" &&
        userSatisfiesStudentOnlyRestrictionForEvent(user, event) &&
        ifEventIsReservationsOnlyThenUserIsTeacherOrUserIsReserved(user, event) &&
        (atLeastOne(event.placesAvailable) || userIsTeacherAtAStudentEvent(user, event) ||
            event.userBookingStatus === "RESERVED");
};

export const userCanBeAddedToEventWaitingList = (user: Immutable<PotentialUser> | null, event: AugmentedEvent) => {
    return !userCanMakeEventBooking(user, event) &&
        event.isNotClosed &&
        !event.hasExpired &&
        !event.isReservationOnly &&
        !userBookedReservedOrOnWaitingList(user, event) &&
        userSatisfiesStudentOnlyRestrictionForEvent(user, event);
};

// Tutors cannot reserve event spaces for members of their groups
export const userCanReserveEventSpaces = (user: Immutable<PotentialUser> | null, event: AugmentedEvent) => {
    return event.allowGroupReservations &&
        event.isNotClosed &&
        event.isWithinBookingDeadline &&
        !event.isWaitingListOnly &&
        isTeacherOrAbove(user);
};
