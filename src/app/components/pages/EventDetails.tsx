import React, {useEffect, useState} from "react";
import * as RS from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../../state/reducers";
import {ShowLoading} from "../handlers/ShowLoading";
import {EVENTS_CRUMB} from "../../services/constants";
import {AugmentedEvent} from "../../../IsaacAppTypes";
import {getEvent} from "../../state/actions";
import {DateString} from "../elements/DateString";
import {IsaacContent} from "../content/IsaacContent";
import {Link} from "react-router-dom";

export const EventDetails = ({match: {params: {eventId}}}: {match: {params: {eventId: string}}}) => {
    const dispatch = useDispatch();
    const currentEvent = useSelector((state: AppState) => state && state.currentEvent);
    const user = useSelector((state: AppState) => state && state.user);
    const [bookingFormOpen, setBookingFormOpen] = useState(false);

    useEffect(() => {dispatch(getEvent(eventId))}, [eventId]);

    return <ShowLoading until={currentEvent} render={(event: AugmentedEvent) => <RS.Container className="mb-5">
        <TitleAndBreadcrumb
            currentPageTitle={event.title as string} subTitle={event.subtitle}
            breadcrumbTitleOverride="Event details" intermediateCrumbs={[EVENTS_CRUMB]}
        />

        <RS.Card className="mt-4 pt-2">
            <RS.CardBody>
                {/* Detail Main */}
                <RS.Row>
                    <RS.Col lg={8} className={event.expired ? "expired" : ""}>
                        {/* TODO Student/Teacher/Virtual icon */}
                        {/* TODO add to calendar if staff user - <a ng-click="googleCalendarTemplate()" ng-if="isStaffUser"><span className="calendar-img" alt="Add to Google Calendar">Add to Calendar</span></a>*/}

                        {/* Key event info */}
                        <RS.Table borderless className="event-key-info mb-4">
                            {event.field && <tr>
                                <td>Field:</td>
                                <td>event.field</td>
                            </tr>}
                            <tr>
                                <td>When:</td>
                                <td>
                                    <><DateString>{event.date}</DateString> {event.date != event.endDate && <span> &#8212; </span>}</>
                                    {event.date != event.endDate && <><DateString>{event.endDate}</DateString></>}{/* TODO short dates if not multiDay would be nice here */}
                                    {event.expired && <div className="alert-danger text-center">This event is in the past.</div>}
                                </td>
                            </tr>
                            {event.location && event.location.address && event.location.address.addressLine1 && <tr>
                                <td>Location:</td>
                                <td>
                                    {event.location.address.addressLine1}, {event.location.address.addressLine2}, {event.location.address.town}, {event.location.address.postalCode}
                                </td>
                            </tr>}
                            {event.numberOfPlaces && event.placesAvailable && event.eventStatus != 'CLOSED' && !event.expired && <tr>
                                <td>Availability:</td>
                                <td>
                                    {event.placesAvailable > 0 && <div>{event.placesAvailable} spaces</div>}
                                    {event.placesAvailable <= 0 && <div>
                                        <strong className="text-danger">FULL</strong>
                                        {event.tags && !event.tags.includes('student') && user && user.loggedIn && user.role != 'STUDENT' && <span> - for student bookings</span>}
                                    </div>}
                                    {user && user.loggedIn && user.email && event.userBooked && <span> - <span className="text-success">You are booked on this event!</span></span>}
                                    {!event.userBooked && !event.userOnWaitList && event.placesAvailable <= 0 && !(event.tags && event.tags.indexOf('student') != -1 && user && user.loggedIn && user.role != 'STUDENT') && <span> - Waiting list booking is available!</span>}
                                    {user && user.loggedIn && user.email && event.userOnWaitList && <span> - You are on the waiting list for this event.</span>}
                                </td>
                            </tr>}
                            {event.bookingDeadline && <tr>
                                <td>Booking Deadline:</td>
                                <td>
                                    <DateString>{event.bookingDeadline}</DateString>
                                    {!event.withinBookingDeadline && <div className="alert-danger text-center">The booking deadline for this event has passed.</div>}
                                </td>
                            </tr>}
                        </RS.Table>

                        {/* Event body copy */}
                        <IsaacContent doc={event} />

                        {/* Booking form */}
                        {user && user.loggedIn && event.eventStatus != 'CLOSED' && !event.expired && bookingFormOpen && !(event.userBooked || event.userOnWaitList) && <span>
                            {/* TODO Booking form component */}
                            <h1>BOOKING FORM COMPONENT</h1>

                            <div>
                                {event.numberOfPlaces && event.numberOfPlaces > 0 && !event.userBooked && event.withinBookingDeadline &&
                                (event.placesAvailable && event.placesAvailable > 0 || (event.tags && event.tags.indexOf('student') != -1 && user.role != 'STUDENT')) && <p>
                                    <small>
                                        By requesting to book on this event, you are granting event organisers access to the information provided in the form above.
                                        You are also giving them permission to set you pre-event work and view your progress. You can manage access to your progress data in your
                                        <Link to="/account#teacherconnections">account settings</Link>.
                                    </small>
                                </p>}

                                {event.numberOfPlaces && event.numberOfPlaces > 0 && !event.userBooked && event.withinBookingDeadline && event.eventStatus != 'WAITING_LIST_ONLY' &&
                                (event.placesAvailable && event.placesAvailable > 0 || (event.tags && event.tags.indexOf('student') != -1 && user.role != 'STUDENT')) && <RS.Button
                                    onClick={() => {/* TODO requestBooking() */}}
                                >
                                    Book now
                                </RS.Button>}

                                {user && user.loggedIn && event.numberOfPlaces && event.numberOfPlaces > 0 && !event.userBooked && !event.userOnWaitList &&
                                (event.eventStatus == 'WAITING_LIST_ONLY' || (event.placesAvailable && event.placesAvailable <= 0) || !event.withinBookingDeadline) &&
                                !(event.tags && event.tags.indexOf('student') != -1 && user.role != 'STUDENT') &&
                                <RS.Button
                                    onClick={() => {/* TODO addToWaitingList() */}}
                                >
                                    Apply {!event.withinBookingDeadline && <> - deadline past</>}
                                </RS.Button>}
                            </div>
                        </span>}

                        {/* Options for un-logged-in users */}
                        {!(user && user.loggedIn) && event.eventStatus != 'CLOSED' && !event.expired && <span>
                            {event.numberOfPlaces && event.numberOfPlaces > 0 && event.withinBookingDeadline && <RS.Button
                                onClick={() => {/* TODO login({target: $root.relativeCanonicalUrl=='/' ? null : $root.relativeCanonicalUrl}) */}}
                            >
                                Login to book
                            </RS.Button>}
                            {(event.numberOfPlaces && event.numberOfPlaces <= 0 || !event.withinBookingDeadline) && <RS.Button
                                onClick={() => {/* TODO login({target: $root.relativeCanonicalUrl=='/' ? null : $root.relativeCanonicalUrl}) */}}
                            >
                                Login to apply
                            </RS.Button>}
                        </span>}

                        {/* Options for logged-in users */}
                        {user && user.loggedIn && <span>
                            {event.eventStatus != 'CLOSED' && !event.expired && !bookingFormOpen && !(event.userBooked || event.userOnWaitList) && event.withinBookingDeadline && <RS.Button
                                onClick={() => {setBookingFormOpen(true)}}
                            >
                                Open booking form
                            </RS.Button>}
                            {bookingFormOpen && !(event.userBooked || event.userOnWaitList) && <RS.Button
                                onClick={() => {setBookingFormOpen(false)}}
                            >
                                Close booking form
                            </RS.Button>}
                            {event.userBooked && !event.expired && <RS.Button onClick={() => {/* TODO cancelEventBooking() */}}>
                                Cancel your booking
                            </RS.Button>}
                            {event.userOnWaitList && !event.expired && <RS.Button onClick={() => {/* cancelEventBooking()*/}}>
                                Remove from waiting list
                            </RS.Button>}
                        </span>}

                        <RS.Button tag={Link} to="/events">Back to events</RS.Button>
                    </RS.Col>
                </RS.Row>

            </RS.CardBody>
        </RS.Card>

    </RS.Container>} />;
};
