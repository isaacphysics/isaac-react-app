import React from "react";
import {Card, CardBody} from "reactstrap";
import {Link} from "react-router-dom";
import {DateString} from "../DateString";
import {zeroOrLess} from "../../../services";
import {AugmentedEvent} from "../../../../IsaacAppTypes";
import { useTranslation, Trans } from 'react-i18next'

interface SelectedEventDetailsProps {
    event: AugmentedEvent;
}
export const SelectedEventDetails = ({event}: SelectedEventDetailsProps) => {
    const { t } = useTranslation()
    return <Card>
        <CardBody>
            <h3 className="h-subtitle mb-1">{t('selectedEventDetails', 'Selected event details')}</h3>
            <p className="m-0">
                <strong>{t('event', 'Event:')} </strong>
                <Link to={`/events/${event.id}`} target="_blank">
                    {event.title} {event.subtitle}
                </Link>
                <br />

                {event.location && event.location.address && event.location.address.addressLine1 &&
                    <>
                        <strong>{t('location', 'Location:')} </strong>
                        {event.location.address.addressLine1}{", "}
                        {event.location.address.town}{", "}
                        {event.location.address.postalCode}
                        <br />
                    </>
                }

                <strong>{t('eventStatus', 'Event status:')} </strong>
                <span className={event.isCancelled ? "text-danger fw-bold" : ""}>{event.eventStatus}</span>
                <br />

                <strong>{t('eventStart', 'Event start:')} </strong>
                <DateString>{event.date}</DateString> - <DateString>{event.endDate}</DateString>
                <br />

                <strong>{t('bookingDeadline', 'Booking deadline:')} </strong>
                <DateString>{event.bookingDeadline}</DateString>
                <br />

                <strong>{t('prepworkDeadline', 'Prepwork deadline:')} </strong>
                <DateString>{event.prepWorkDeadline}</DateString>
                <br />

                {/* Group token is currently JSON Ignored by the API */}
                {/*<strong>Group Auth Code:</strong>*/}
                {/*{selectedEvent.isaacGroupToken}*/}
                {/*<br />*/}

                <span className={zeroOrLess(event.placesAvailable) ? "text-danger" : ""}><Trans i18nKey="strongnumberOfPlacesAvailableStrongPlacesavailableEventplacesavailableNumberofplacesEventnumberofplaces"><strong>Number of places available: </strong>
                    {{ placesAvailable: event.placesAvailable }} / {{ numberOfPlaces: event.numberOfPlaces }}</Trans></span>
            </p>
        </CardBody>
    </Card>;
};
