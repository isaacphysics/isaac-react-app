import React from "react";
import {Card, CardBody} from "reactstrap";
import {Link} from "react-router-dom";
import {DateString} from "../DateString";
import {zeroOrLess} from "../../../services";
import {AugmentedEvent} from "../../../../IsaacAppTypes";
import { useTranslation } from "react-i18next";

interface SelectedEventDetailsProps {
    event: AugmentedEvent;
}
export const SelectedEventDetails = ({event}: SelectedEventDetailsProps) => {
    const { t } = useTranslation();
    return <Card>
        <CardBody>
            <h3 className="h-subtitle mb-1">{t("common:events.selectedDetails.title")}</h3>
            <p className="m-0">
                <strong>{t("common:events.selectedDetails.eventLabel")} </strong>
                <Link to={`/events/${event.id}`} target="_blank">
                    {event.title} {event.subtitle}
                </Link>
                <br />

                {event.location && event.location.address && event.location.address.addressLine1 &&
                    <>
                        <strong>{t("common:events.selectedDetails.locationLabel")} </strong>
                        {event.location.address.addressLine1}{", "}
                        {event.location.address.town}{", "}
                        {event.location.address.postalCode}
                        <br />
                    </>
                }

                <strong>{t("common:events.selectedDetails.statusLabel")} </strong>
                <span className={event.isCancelled ? "text-danger fw-bold" : ""}>{event.eventStatus}</span>
                <br />

                <strong>{t("common:events.selectedDetails.startDateLabel")} </strong>
                <DateString>{event.date}</DateString> - <DateString>{event.endDate}</DateString>
                <br />

                <strong>{t("common:events.selectedDetails.bookingDeadlineLabel")} </strong>
                <DateString>{event.bookingDeadline}</DateString>
                <br />

                <strong>{t("common:events.selectedDetails.prepWorkDeadlineLabel")} </strong>
                <DateString>{event.prepWorkDeadline}</DateString>
                <br />

                {/* Group token is currently JSON Ignored by the API */}
                {/*<strong>Group Auth Code:</strong>*/}
                {/*{selectedEvent.isaacGroupToken}*/}
                {/*<br />*/}

                <span className={zeroOrLess(event.placesAvailable) ? "text-danger" : ""}>
                    <strong>{t("common:events.selectedDetails.placesAvailableLabel")} </strong>
                    {event.placesAvailable} / {event.numberOfPlaces}
                </span>
            </p>
        </CardBody>
    </Card>;
};
