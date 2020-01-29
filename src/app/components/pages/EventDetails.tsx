import React, {useEffect, useState} from "react";
import * as RS from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../../state/reducers";
import {ShowLoading} from "../handlers/ShowLoading";
import {EVENTS_CRUMB} from "../../services/constants";
import {AdditionalInformation} from "../../../IsaacAppTypes";
import {
    addMyselfToWaitingList,
    bookMyselfOnEvent,
    cancelMyBooking,
    getEvent,
    openActiveModal,
    showToast
} from "../../state/actions";
import {DateString} from "../elements/DateString";
import {IsaacContent} from "../content/IsaacContent";
import {Link} from "react-router-dom";
import {EventBookingForm} from "../elements/EventBookingForm";
import * as persistence from "../../services/localStorage";
import {KEY} from "../../services/localStorage";
import {history} from "../../services/history";
import {atLeastOne, validateBookingSubmission, zeroOrLess} from "../../services/validation";
import {isTeacher} from "../../services/user";
import {reservationsModal} from "../../components/elements/modals/ResearvationsModal";

interface EventDetailsProps {
    match: {params: {eventId: string}};
    location: {pathname: string};
}
export const EventDetails = ({match: {params: {eventId}}, location: {pathname}}: EventDetailsProps) => {
    const dispatch = useDispatch();
    const event = useSelector((state: AppState) => state && state.currentEvent);
    const user = useSelector((state: AppState) => state && state.user);
    useEffect(() => {dispatch(getEvent(eventId))}, [eventId]);

    const [bookingFormOpen, setBookingFormOpen] = useState(false);
    const [additionalInformation, setAdditionalInformation] = useState<AdditionalInformation>({});
    function updateAdditionalInformation(update: AdditionalInformation) {
        setAdditionalInformation(Object.assign({}, additionalInformation, update));
    }

    function loginAndReturn() {
        persistence.save(KEY.AFTER_AUTH_PATH, pathname);
        history.push("/login");
    }

    return <ShowLoading until={event} thenRender={event => {
        const userIsNotAStudent = user && user.loggedIn && user.role !== "STUDENT";
        const isStudentEvent = event.tags !== undefined && event.tags.indexOf('student') != -1;
        const canMakeABooking = event.withinBookingDeadline && event.eventStatus != 'WAITING_LIST_ONLY' && (atLeastOne(event.placesAvailable) || (isStudentEvent && userIsNotAStudent));
        const canBeAddedToWaitingList = !event.userOnWaitList && (event.eventStatus == 'WAITING_LIST_ONLY' || zeroOrLess(event.placesAvailable) || !event.withinBookingDeadline) && !(isStudentEvent && userIsNotAStudent);
        const submissionTitle = canMakeABooking ? "Book now" : event.withinBookingDeadline ? "Apply" : "Apply -deadline past";

        function submitBooking(formEvent: React.FormEvent<HTMLFormElement>) {
            formEvent.preventDefault();

            if (user && user.loggedIn) {
                const failureToastOrTrue = validateBookingSubmission(event, user, additionalInformation);

                if (failureToastOrTrue !== true) {
                    dispatch(showToast(failureToastOrTrue));
                } else if (canMakeABooking) {
                    dispatch(bookMyselfOnEvent(event.id as string, additionalInformation));
                } else if (canBeAddedToWaitingList) {
                    dispatch(addMyselfToWaitingList(event.id as string, additionalInformation));
                }
            }
        }

        return <RS.Container className="events mb-5">
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
                                            {user && user.loggedIn && user.email && event.userBookingStatus === 'CONFIRMED' && <span> - <span className="text-success">You are booked on this event!</span></span>}
                                            {user && user.loggedIn && user.email && event.userBookingStatus === 'RESERVED' && <span> - <span className="text-success">You have been reserved a place on this event! Scroll down to complete your registration.</span></span>}
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
                                <RS.Card className="mb-4">
                                    <RS.CardBody>
                                        <h3>Event booking form</h3>
                                        <RS.Form onSubmit={submitBooking}>
                                            <EventBookingForm event={event} targetUser={user}
                                                additionalInformation={additionalInformation} updateAdditionalInformation={updateAdditionalInformation}
                                            />
                                            <div>
                                                {atLeastOne(event.numberOfPlaces) && !event.userBooked && event.withinBookingDeadline &&
                                                (atLeastOne(event.placesAvailable) || (isStudentEvent && userIsNotAStudent)) && <p className="mb-3">
                                                    <small>
                                                        By requesting to book on this event, you are granting event organisers access to the information provided in the form above.
                                                        You are also giving them permission to set you pre-event work and view your progress.
                                                        You can manage access to your progress data in your <Link to="/account#teacherconnections" target="_blank">account settings</Link>.
                                                        <br />
                                                        Your data will be processed in accordance with Isaac Computer Science&apos;s <Link to="/privacy" target="_blank">privacy policy</Link>.
                                                    </small>
                                                </p>}

                                                {atLeastOne(event.numberOfPlaces) && !event.userBooked && (canMakeABooking || canBeAddedToWaitingList) && <div className="text-center mt-4 mb-2">
                                                    <RS.Input type="submit" value={submissionTitle} className="btn btn-xl btn-secondary border-0" />
                                                </div>}
                                            </div>
                                        </RS.Form>
                                    </RS.CardBody>
                                </RS.Card>
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
                                {user && user.loggedIn && !event.expired && <span>
                                    {event.eventStatus != 'CLOSED' && !bookingFormOpen && !(event.userBooked || event.userOnWaitList) && <RS.Button
                                        onClick={() => {setBookingFormOpen(true)}}
                                    >
                                        Open booking form
                                    </RS.Button>}
                                    {bookingFormOpen && !(event.userBooked || event.userOnWaitList) && <RS.Button
                                        color="primary" outline onClick={() => {setBookingFormOpen(false)}}
                                    >
                                        Close booking form
                                    </RS.Button>}
                                    {event.eventStatus != 'CLOSED' && userIsNotAStudent && <RS.Button
                                        color="primary" onClick={() => { dispatch(openActiveModal(reservationsModal())) }}
                                    >
                                        Reserve spaces
                                    </RS.Button>}
                                    {event.userBookingStatus && ["CONFIRMED", "RESERVED"].includes(event.userBookingStatus) && <RS.Button
                                        color="primary" outline onClick={() => {dispatch(cancelMyBooking(eventId))}}
                                    >
                                        Cancel your booking
                                    </RS.Button>}
                                    {event.userOnWaitList && <RS.Button
                                        color="primary" outline onClick={() => {dispatch(cancelMyBooking(eventId))}}
                                    >
                                        Remove from waiting list
                                    </RS.Button>}
                                </span>}

                                <RS.Button tag={Link} to="/events" color="primary" outline>
                                    Back to events
                                </RS.Button>
                            </div>
                        </RS.Col>
                    </RS.Row>

                </RS.CardBody>
            </RS.Card>

        </RS.Container>}
    } />;
};
