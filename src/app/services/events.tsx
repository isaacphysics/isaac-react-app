import {
    atLeastOne,
    isAda,
    isDefined,
    isTeacherOrAbove,
    zeroOrLess
} from "./";
import {AugmentedEvent, PotentialUser} from "../../IsaacAppTypes";
import {DateString, FRIENDLY_DATE, SHORT_FRIENDLY_DATE, TIME_ONLY} from "../components/elements/DateString";
import React from "react";
import {Link} from "react-router-dom";
import {Immutable} from "immer";
import { Trans } from "react-i18next";
import i18next from "i18next";

export const studentOnlyEventMessage = (eventId?: string) => <React.Fragment>
    <Trans
        i18nKey="common:events.studentOnly.contact"
        components={{
            contactLink: <Link to={`/contact?subject=${encodeURI("Non-student attendance at " + eventId)}`} />,
        }}
    />
</React.Fragment>;

export const formatEventDetailsDate = (event: AugmentedEvent) => {
    if (event.isRecurring) {
        return <span>{i18next.t("common:events.date.seriesStarts")} <DateString>{event.date}</DateString></span>;
    } else if (event.isMultiDay) {
        return <><DateString>{event.date}</DateString>{" – "}<DateString>{event.endDate}</DateString></>;
    } else {
        return <><DateString>{event.date}</DateString>{" – "}<DateString formatter={TIME_ONLY}>{event.endDate}</DateString></>;
    }
};

export const formatEventCardDate = (event: AugmentedEvent, podView?: boolean) => {
    if (event.isRecurring) {
        return <span>{i18next.t("common:events.date.seriesStarts")} <DateString formatter={FRIENDLY_DATE}>{event.date}</DateString><br />
            <DateString formatter={TIME_ONLY}>{event.date}</DateString> – <DateString formatter={TIME_ONLY}>{event.endDate}</DateString>
        </span>;
    } else if (event.isMultiDay) {
        return <>
            {i18next.t("common:events.date.from")} <DateString>{event.date}</DateString><br/>
            {i18next.t("common:events.date.to")} <DateString>{event.endDate}</DateString>
        </>;
    } else {
        return <>
            <DateString formatter={FRIENDLY_DATE}>{event.endDate}</DateString>{podView ? " " : <br />}
            <DateString formatter={TIME_ONLY}>{event.date}</DateString> – <DateString formatter={TIME_ONLY}>{event.endDate}</DateString>
        </>;
    }
};

export const formatEventCardDateSlim = (event: AugmentedEvent) => {
    // no recurring events – these have moved to programs
    if (event.isMultiDay) {
        return <>
            <DateString formatter={SHORT_FRIENDLY_DATE}>{event.date}</DateString> – <DateString formatter={SHORT_FRIENDLY_DATE}>{event.endDate}</DateString>
        </>;
    } else {
        return <DateString formatter={FRIENDLY_DATE}>{event.date}</DateString>;

    }
};       

export const formatAvailabilityMessage = (event: AugmentedEvent) => {
    if (event.isWaitingListOnly) {
        //  in this case, the waiting list is for booking requests that must be approved
        return i18next.t("common:events.availability.requestAvailable");
    }
    // this is an event which can be freely joined, however it happens to be full
    return i18next.t("common:events.availability.waitingListAvailable");
};

export const formatWaitingListBookingStatusMessage = (event: AugmentedEvent) => {
    if (event.isWaitingListOnly) {
        return i18next.t("common:events.status.requestedPlace");
    }
    return i18next.t("common:events.status.onWaitingList");
};

export const formatMakeBookingButtonMessage = (event: AugmentedEvent) => {
    if (event.userBookingStatus === "RESERVED") {
        return i18next.t("common:events.book.confirmReservation");
    }
    if (event.isWaitingListOnly) {
        return i18next.t("common:events.book.requestPlace");
    }
    if (zeroOrLess(event.placesAvailable)) {
        return i18next.t("common:events.book.joinWaitingList");
    }
    if (isAda) {
        return i18next.t("ada:events.book.bookPlace");
    }
    return i18next.t("sci:events.book.bookEvent");
};

export const formatCancelBookingButtonMessage = (event: AugmentedEvent) => {
    if (event.userBookingStatus == "CONFIRMED") {
        return i18next.t("common:events.cancel.booking");
    }
    else if (event.userBookingStatus == "RESERVED") {
        return i18next.t("common:events.cancel.reservation");
    }
    else if (event.userBookingStatus == "WAITING_LIST") {
        return event.isWaitingListOnly ? i18next.t("common:events.cancel.request") : i18next.t("common:events.cancel.waitingList");
    }
};

export const formatManageBookingActionButtonMessage = (event: AugmentedEvent) => {
    if (event.userBookingStatus === "RESERVED") {
        return i18next.t("common:events.manage.confirmReservation");
    }
    if (event.isWaitingListOnly) {
        return i18next.t("common:events.manage.bookingRequest");
    }
    if (zeroOrLess(event.placesAvailable)) {
        return i18next.t("common:events.manage.addToWaitingList");
    }
    return i18next.t("common:events.manage.bookPlace");
};

export const formatBookingModalConfirmMessage = (event: AugmentedEvent, userCanMakeEventBooking?: boolean) => {
    if (userCanMakeEventBooking) {
        return i18next.t("common:events.modal.bookNow");
    }
    else {
        return event.isWithinBookingDeadline ? "Apply" : i18next.t("common:events.modal.applyPastDeadline");
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
