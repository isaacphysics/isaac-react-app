import {apiHelper, atLeastOne, isStudent, isTeacher, siteSpecific, STAGE, STAGES_CS, STAGES_PHY, zeroOrLess} from "./";
import {IsaacEventPageDTO} from "../../IsaacApiTypes";
import {AugmentedEvent, PotentialUser} from "../../IsaacAppTypes";
import {DateString, FRIENDLY_DATE, TIME_ONLY} from "../components/elements/DateString";
import React from "react";
import {Link} from "react-router-dom";

export const studentOnlyEventMessage = (eventId?: string) => <React.Fragment>
    {"This event is aimed at students. If you are not a student but still wish to attend, please "}
    <Link to={`/contact?subject=${encodeURI("Non-student attendance at " + eventId)}`}>contact us</Link>.
</React.Fragment>;

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

    augmentedEvent.isNotClosed = false; //!["CLOSED", "CANCELLED"].includes(event.eventStatus as string);
    augmentedEvent.isCancelled = true; //event.eventStatus === "CANCELLED";
    augmentedEvent.isWaitingListOnly = event.eventStatus === "WAITING_LIST_ONLY";

    // we have to fix the event image url.
    if(augmentedEvent.eventThumbnail && augmentedEvent.eventThumbnail.src) {
        augmentedEvent.eventThumbnail.src = apiHelper.determineImageUrl(augmentedEvent.eventThumbnail.src);
    } else {
        if (augmentedEvent.eventThumbnail == null) {
            augmentedEvent.eventThumbnail = {};
        }
        augmentedEvent.eventThumbnail.src = 'http://placehold.it/500x276';
        augmentedEvent.eventThumbnail.altText = 'placeholder image.';
    }

    return augmentedEvent;
};

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
            <DateString>{event.date}</DateString><br/>
            <DateString>{event.endDate}</DateString>
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
        return "Bookings available by request!"
    }
    // this is an event which can be freely joined, however it happens to be full
    return "Waiting list booking is available!"
}

export const formatWaitingListBookingStatusMessage = (event: AugmentedEvent) => {
    if (event.isWaitingListOnly) {
        return "You have requested a place on this event."
    }
    return "You are on the waiting list for this event."
}

export const formatMakeBookingButtonMessage = (event: AugmentedEvent) => {
    if (event.userBookingStatus === "RESERVED") {
        return "Confirm your reservation"
    }
    if (event.isWaitingListOnly) {
        return "Request a place"
    }
    if (zeroOrLess(event.placesAvailable)) {
        return "Join waiting list"
    }
    return "Book a place"
}

export const formatCancelBookingButtonMessage = (event: AugmentedEvent) => {
    if (event.userBookingStatus == "CONFIRMED") {
        return "Cancel your booking"
    }
    else if (event.userBookingStatus == "RESERVED") {
        return "Cancel your reservation"
    }
    else if (event.userBookingStatus == "WAITING_LIST") {
        return event.isWaitingListOnly ? "Cancel booking request" : "Leave waiting list"
    }
}

export const formatManageBookingActionButtonMessage = (event: AugmentedEvent) => {
    if (event.userBookingStatus === "RESERVED") {
        return "Confirm reservation"
    }
    if (event.isWaitingListOnly) {
        return "Make booking request"
    }
    if (zeroOrLess(event.placesAvailable)) {
        return "Add to waiting list"
    }
    return "Book a place"
}

export const formatBookingModalConfirmMessage = (event: AugmentedEvent, userCanMakeEventBooking?: boolean) => {
    if (userCanMakeEventBooking) {
        return "Book now"
    }
    else {
        return event.isWithinBookingDeadline ? "Apply" : "Apply - deadline past"
    }
}

export const stageExistsForSite = (stage: string) => {
    const stagesForSite = siteSpecific(STAGES_PHY, STAGES_CS);
    return stagesForSite.has(stage as STAGE);
}

export const userSatisfiesStudentOnlyRestrictionForEvent = (user: PotentialUser | null, event: AugmentedEvent) => {
    return event.isStudentOnly ? isStudent(user) : true;
}

export const userIsTeacherAtAStudentEvent = (user: PotentialUser | null, event: AugmentedEvent) => {
    return event.isAStudentEvent && isTeacher(user);
}

export const userCanMakeEventBooking = (user: PotentialUser | null, event: AugmentedEvent) => {
    return event.isNotClosed &&
        event.isWithinBookingDeadline &&
        !event.isWaitingListOnly &&
        event.userBookingStatus !== "CONFIRMED" &&
        userSatisfiesStudentOnlyRestrictionForEvent(user, event) &&
        (atLeastOne(event.placesAvailable) || userIsTeacherAtAStudentEvent(user, event) ||
            event.userBookingStatus === "RESERVED");
}

export const userCanBeAddedToEventWaitingList = (user: PotentialUser | null, event: AugmentedEvent) => {
    return !userCanMakeEventBooking(user, event) &&
        event.isNotClosed &&
        !event.hasExpired &&
        (event.userBookingStatus === undefined ||
            !["WAITING_LIST", "CONFIRMED", "RESERVED"].includes(event.userBookingStatus)) &&
        userSatisfiesStudentOnlyRestrictionForEvent(user, event)
}

export const userCanReserveEventSpaces = (user: PotentialUser | null, event: AugmentedEvent) => {
    return event.allowGroupReservations &&
        event.isNotClosed &&
        event.isWithinBookingDeadline &&
        !event.isWaitingListOnly &&
        isTeacher(user);
}
