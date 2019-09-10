import React, {useEffect, useState} from "react";
import * as RS from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../../state/reducers";
import {ShowLoading} from "../handlers/ShowLoading";
import {EVENTS_CRUMB} from "../../services/constants";
import {AugmentedEvent} from "../../../IsaacAppTypes";
import {cancelMyBooking, getEvent} from "../../state/actions";
import {DateString} from "../elements/DateString";
import {IsaacContent} from "../content/IsaacContent";
import {Link} from "react-router-dom";
import {EventBookingForm} from "../elements/EventBookingForm";
import * as persistence from "../../services/localStorage";
import {KEY} from "../../services/localStorage";
import {history} from "../../services/history";
import {atLeastOne, zeroOrLess} from "../../services/validation";
import {isTeacher} from "../../services/user";

interface EventDetailsProps {
    match: {params: {eventId: string}};
    location: {pathname: string};
}
export const EventDetails = ({match: {params: {eventId}}, location: {pathname}}: EventDetailsProps) => {
    const dispatch = useDispatch();
    const currentEvent = useSelector((state: AppState) => state && state.currentEvent);
    const user = useSelector((state: AppState) => state && state.user);
    const [bookingFormOpen, setBookingFormOpen] = useState(false);

    useEffect(() => {dispatch(getEvent(eventId))}, [eventId]);

    function loginAndReturn() {
        persistence.save(KEY.AFTER_AUTH_PATH, pathname);
        history.push("/login");
    }

    return <ShowLoading until={currentEvent} render={(event: AugmentedEvent) => <RS.Container className="events mb-5">
        <TitleAndBreadcrumb
            currentPageTitle={event.title as string} subTitle={event.subtitle}
            breadcrumbTitleOverride="Event details" intermediateCrumbs={[EVENTS_CRUMB]}
        />

        <RS.Card className="mt-4 pt-2">
            <RS.CardBody>
                {/* Detail Main */}
                <RS.Row>
                    <RS.Col lg={4}>
                        {event.eventThumbnail && <div className="mt-2">
                            <RS.CardImg
                                alt={event.eventThumbnail.altText || `Illustration for ${event.title}`}
                                className='m-auto restrict-height' top src={event.eventThumbnail.src}
                            />
                            <div className="border px-2 py-1 mt-3 bg-light">
                                <strong>{event.title}</strong>
                            </div>
                        </div>}
                    </RS.Col>
                    <RS.Col lg={8} className={event.expired ? "expired" : ""}>
                        {/* TODO Student/Teacher/Virtual icon */}
                        {/* TODO add to calendar import if staff user - <a ng-click="googleCalendarTemplate()" ng-if="isStaffUser"><span className="calendar-img" alt="Add to Google Calendar">Add to Calendar</span></a>*/}

                        {/* Key event info */}
                        <RS.Table borderless className="event-key-info mb-4">
                            <tbody>
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
                                {event.eventStatus != 'CLOSED' && !event.expired && <tr>
                                    <td>Availability:</td>
                                    <td>
                                        {atLeastOne(event.placesAvailable) && <div>{event.placesAvailable} spaces</div>}
                                        {zeroOrLess(event.placesAvailable) && <div>
                                            <strong className="text-danger">FULL</strong>
                                            {event.tags && !event.tags.includes('student') && user && user.loggedIn && user.role != 'STUDENT' && <span> - for student bookings</span>}
                                        </div>}
                                        {user && user.loggedIn && user.email && event.userBooked && <span> - <span className="text-success">You are booked on this event!</span></span>}
                                        {!event.userBooked && !event.userOnWaitList && zeroOrLess(event.placesAvailable) && !(event.tags && event.tags.indexOf('student') != -1 && user && isTeacher(user)) && <span> - Waiting list booking is available!</span>}
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
                            </tbody>
                        </RS.Table>

                        {/* Event body copy */}
                        <div className="mb-3">
                            <IsaacContent doc={event} />
                        </div>

                        {/* Booking form */}
                        {user && user.loggedIn && event.eventStatus != 'CLOSED' && !event.expired && bookingFormOpen && !(event.userBooked || event.userOnWaitList) && <span>
                            <EventBookingForm event={event} user={user} />
                        </span>}

                        <div>
                            {/* Options for un-logged-in users */}
                            {!(user && user.loggedIn) && event.eventStatus != 'CLOSED' && !event.expired && <span>
                                {atLeastOne(event.numberOfPlaces) && event.withinBookingDeadline && <RS.Button onClick={loginAndReturn}>
                                    Login to book
                                </RS.Button>}
                                {(zeroOrLess(event.numberOfPlaces) || !event.withinBookingDeadline) && <RS.Button onClick={loginAndReturn}>
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
                                    color="primary" outline onClick={() => {setBookingFormOpen(false)}}
                                >
                                    Close booking form
                                </RS.Button>}
                                {event.userBooked && !event.expired && <RS.Button
                                    color="primary" outline onClick={() => {dispatch(cancelMyBooking(eventId))}}
                                >
                                    Cancel your booking
                                </RS.Button>}
                                {event.userOnWaitList && !event.expired && <RS.Button
                                    color="primary" outline onClick={() => {dispatch(cancelMyBooking(eventId))}}
                                >
                                    Remove from waiting list
                                </RS.Button>}
                            </span>}

                            <RS.Button tag={Link} to="/events" color="primary" outline>Back to events</RS.Button>
                        </div>
                    </RS.Col>
                </RS.Row>

            </RS.CardBody>
        </RS.Card>

    </RS.Container>} />;
};
