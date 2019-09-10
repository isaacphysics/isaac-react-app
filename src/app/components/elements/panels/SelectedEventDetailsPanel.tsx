import React, {useEffect} from "react";
import * as RS from "reactstrap";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../../../state/reducers";
import {Link} from "react-router-dom";
import {DateString} from "../DateString";
import {getEvent} from "../../../state/actions";
import {NOT_FOUND} from "../../../services/constants";
import {zeroOrLess} from "../../../services/validation";

export const SelectedEventDetailsPanel = ({eventId}: {eventId: string}) => {
    const dispatch = useDispatch();
    useEffect(() => {dispatch(getEvent(eventId))}, [eventId]);
    const selectedEvent = useSelector((state: AppState) => {return state && state.currentEvent;});

    return <RS.Card>
        <RS.CardBody>
            <h3 className="h-subtitle mb-1">Selected event details</h3>
            {selectedEvent && selectedEvent !== NOT_FOUND && <p className="m-0">
                <strong>Event: </strong>
                <Link to={`/events/${selectedEvent.id}`} target="_blank">
                    {selectedEvent.title} {selectedEvent.subtitle}
                </Link>
                <br />

                {selectedEvent.location && selectedEvent.location.address && selectedEvent.location.address.addressLine1 &&
                    <React.Fragment>
                        <strong>Location: </strong>
                        {selectedEvent.location.address.addressLine1}{", "}
                        {selectedEvent.location.address.town}{", "}
                        {selectedEvent.location.address.postalCode}
                        <br />
                    </React.Fragment>
                }

                <strong>Event status: </strong>
                {selectedEvent.eventStatus}
                <br />

                <strong>Event start: </strong>
                <DateString>{selectedEvent.date}</DateString> - <DateString>{selectedEvent.endDate}</DateString>
                <br />

                <strong>Booking deadline: </strong>
                <DateString>{selectedEvent.bookingDeadline}</DateString>
                <br />

                <strong>Prepwork deadline: </strong>
                <DateString>{selectedEvent.prepWorkDeadline}</DateString>
                <br />

                {/* Group token is currently JSON Ignored by the API */}
                {/*<strong>Group Auth Code:</strong>*/}
                {/*{selectedEvent.isaacGroupToken}*/}
                {/*<br />*/}

                <span className={zeroOrLess(selectedEvent.placesAvailable) ? "text-danger" : ""}>
                    <strong>Number of places available: </strong>
                    {selectedEvent.placesAvailable} / {selectedEvent.numberOfPlaces}
                </span>
            </p>}
        </RS.CardBody>
    </RS.Card>
};
