import React, {useEffect, useState} from "react";
import * as RS from "reactstrap";
import dayjs from "dayjs";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../../state/reducers";
import {ShowLoading} from "../handlers/ShowLoading";
import {EVENTS_CRUMB, NOT_FOUND} from "../../services/constants";
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
import {Link} from "react-router-dom";
import {EventBookingForm} from "../elements/EventBookingForm";
import * as persistence from "../../services/localStorage";
import {KEY} from "../../services/localStorage";
import {history} from "../../services/history";
import {atLeastOne, validateBookingSubmission, zeroOrLess} from "../../services/validation";
import {SITE, SITE_SUBJECT, SITE_SUBJECT_TITLE} from "../../services/siteConstants";
import {isLoggedIn, isStaff, isStudent, isTeacher} from "../../services/user";
import {selectors} from "../../state/selectors";
import {reservationsModal} from "../elements/modals/ReservationsModal";
import {IsaacContent} from "../content/IsaacContent";
import {formatEventDetailsDate, studentOnlyEventMessage} from "../../services/events";
import {EditContentButton} from "../elements/EditContentButton";
import { isDefined } from "../../services/miscUtils";
import { Map, Marker, Popup, TileLayer } from "react-leaflet";
import * as L from "leaflet";

function formatDate(date: Date|number) {
    return dayjs(date).format("YYYYMMDD[T]HHmmss");
}

interface EventDetailsProps {
    match: {params: {eventId: string}};
    location: {pathname: string};
}
export const EventDetails = ({match: {params: {eventId}}, location: {pathname}}: EventDetailsProps) => {
    const dispatch = useDispatch();
    const event = useSelector((state: AppState) => state && state.currentEvent);
    const user = useSelector(selectors.user.orNull);
    useEffect(() => {dispatch(getEvent(eventId))}, [dispatch, eventId]);

    const [bookingFormOpen, setBookingFormOpen] = useState(false);
    const [additionalInformation, setAdditionalInformation] = useState<AdditionalInformation>({});
    function updateAdditionalInformation(update: AdditionalInformation) {
        setAdditionalInformation(Object.assign({}, additionalInformation, update));
    }

    function loginAndReturn() {
        persistence.save(KEY.AFTER_AUTH_PATH, pathname);
        history.push("/login");
    }

    function googleCalendarTemplate() {
        if (event && event !== NOT_FOUND) {
            // https://calendar.google.com/calendar/event?action=TEMPLATE&text=[event_name]&dates=[start_date as YYYYMMDDTHHMMSS or YYYYMMDD]/[end_date as YYYYMMDDTHHMMSS or YYYYMMDD]&details=[extra_info]&location=[full_address_here]
            const address = event.location && event.location.address ? [event.location.address.addressLine1, event.location.address.addressLine2, event.location.address.town, event.location.address.county, event.location.address.postalCode, event.location.address.country] : [];

            const calendarTemplateUrl = [
                "https://calendar.google.com/calendar/event?action=TEMPLATE",
                event.title && "text=" + encodeURI(event.title),
                event.date && "dates=" + encodeURI(formatDate(event.date)) + (event.endDate ? '/' + encodeURI(formatDate(event.endDate)) : ""),
                event.subtitle && "details=" + encodeURI(event.subtitle),
                "location=" + encodeURI(address.filter(s => !!s).join(', '))
            ];

            window.open(calendarTemplateUrl.filter(s => !!s).join('&'), '_blank');
        }
    }

    return <ShowLoading until={event} thenRender={event => {
        const studentOnlyRestrictionSatisfied = event.isStudentOnly ? isStudent(user) : true;
        const teacherAtAStudentEvent = event.isAStudentEvent && isTeacher(user);

        const canMakeABooking =
            event.isNotClosed &&
            event.isWithinBookingDeadline &&
            !event.isWaitingListOnly &&
            event.userBookingStatus !== "CONFIRMED" &&
            studentOnlyRestrictionSatisfied &&
            (atLeastOne(event.placesAvailable) || teacherAtAStudentEvent || event.userBookingStatus === "RESERVED");

        const canBeAddedToWaitingList =
            !canMakeABooking &&
            event.isNotClosed &&
            !event.hasExpired &&
            event.userBookingStatus !== "WAITING_LIST" &&
            studentOnlyRestrictionSatisfied;

        const canReserveSpaces =
            event.allowGroupReservations &&
            event.isNotClosed &&
            event.isWithinBookingDeadline &&
            !event.isWaitingListOnly &&
            isTeacher(user);

        const submissionTitle = canMakeABooking ?
            "Book now" :
            event.isWithinBookingDeadline ? "Apply" : "Apply - deadline past";

        const isVirtual = event.tags?.includes("virtual");

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

        function openAndScrollToBookingForm() {
            document.getElementById("open_booking_form_button")?.scrollIntoView({ behavior: 'smooth' });
            document.getElementById("booking_form")?.scrollIntoView({ behavior: 'smooth' });
            setBookingFormOpen(true);
        }

        // This is UGLY but there's a weird issue between the leaflet.css file and how webpack loads url()s that makes everything go kaboom.
        // There are various places online discussing this issue, but this one is a good starting point: https://github.com/Leaflet/Leaflet/issues/4968
        // _______
        // WARNING 2022-03-01 - This will need to be reconsidered when we upgrade the front-end dependencies
        // ¯¯¯¯¯¯¯
        let icon = L.icon({
            iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png').default,
            iconUrl: require('leaflet/dist/images/marker-icon.png'),
            shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
            iconAnchor: [12, 41]
        });

        return <RS.Container className="events mb-5">
            <TitleAndBreadcrumb
                currentPageTitle={event.title as string} subTitle={event.subtitle}
                breadcrumbTitleOverride="Event details" intermediateCrumbs={[EVENTS_CRUMB]}
            />
            <EditContentButton doc={event} />

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
                                {isDefined(event.location) &&
                                 isDefined(event.location?.latitude) &&
                                 isDefined(event.location?.longitude) &&
                                    <div className="border px-2 py-1 mt-3 bg-light">
                                        <Map center={[event.location.latitude, event.location.longitude]} zoom={13}>
                                            <TileLayer
                                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                                            />
                                            <Marker position={[event.location.latitude, event.location.longitude]} icon={icon}>
                                                <Popup>
                                                    {event.location?.address?.addressLine1}<br />{event.location?.address?.addressLine2}<br />{event.location?.address?.town}<br />{event.location?.address?.postalCode}
                                                </Popup>
                                            </Marker>
                                        </Map>
                                    </div>
                                }
                            </div>}
                        </RS.Col>
                        <RS.Col lg={8} className={event.hasExpired ? "expired" : ""}>
                            {/* TODO Student/Teacher/Virtual icon */}
                            {isStaff(user) &&
                                <RS.Button color="link" onClick={googleCalendarTemplate} className="calendar-img mx-2" title="Add to Google Calendar">
                                    Add to Calendar
                                </RS.Button>
                            }

                            {/* Key event info */}
                            <RS.Table borderless className="event-key-info mb-4">
                                <tbody>
                                    <tr>
                                        <td>When:</td>
                                        <td>
                                            {formatEventDetailsDate(event)}
                                            {event.hasExpired && <div className="alert-danger text-center">This event is in the past.</div>}
                                        </td>
                                    </tr>
                                    {event.location && event.location.address && event.location.address.addressLine1 && !isVirtual && <tr>
                                        <td>Location:</td>
                                        <td>
                                            {event.location.address.addressLine1}, {event.location.address.addressLine2}, {event.location.address.town}, {event.location.address.postalCode}
                                        </td>
                                    </tr>}
                                    {event.isNotClosed && !event.hasExpired && <tr>
                                        <td>Availability:</td>
                                        <td>
                                            {atLeastOne(event.placesAvailable) && <div>{event.placesAvailable} spaces</div>}
                                            {zeroOrLess(event.placesAvailable) && <div>
                                                <strong className="text-danger">FULL</strong>
                                                {event.isAStudentEvent && isTeacher(user) && <span> - for student bookings</span>}
                                            </div>}
                                            {event.userBookingStatus === "CONFIRMED" && <span> - <span className="text-success">You are booked on this event!</span></span>}
                                            {event.userBookingStatus === 'RESERVED' && <span> - <span className="text-success">
                                                You have been reserved a place on this event!
                                                <RS.Button color="link text-success" onClick={openAndScrollToBookingForm}>
                                                    <u>Complete your registration below</u>.
                                                </RS.Button>
                                            </span></span>}
                                            {canBeAddedToWaitingList && <span> - Waiting list booking is available!</span>}
                                            {event.userBookingStatus === "WAITING_LIST" && <span> - You are on the waiting list for this event.</span>}
                                            {event.isStudentOnly && !studentOnlyRestrictionSatisfied &&
                                                <div className="text-muted font-weight-normal">
                                                    {studentOnlyEventMessage(eventId)}
                                                </div>
                                            }
                                        </td>
                                    </tr>}
                                    {event.bookingDeadline && <tr>
                                        <td>Booking Deadline:</td>
                                        <td>
                                            <DateString>{event.bookingDeadline}</DateString>
                                            {!event.isWithinBookingDeadline && !event.hasExpired && <div className="alert-danger text-center">
                                                The booking deadline for this event has passed.
                                            </div>}
                                        </td>
                                    </tr>}
                                </tbody>
                            </RS.Table>

                            {/* Event body copy */}
                            <div className="mb-3">
                                <IsaacContent doc={event} />
                            </div>

                            {/* Booking form */}
                            {bookingFormOpen && user?.loggedIn && 'CONFIRMED' !== event.userBookingStatus && <span>
                                <RS.Card className="mb-4">
                                    <RS.CardBody>
                                        <h3>Event booking form</h3>
                                        <RS.Form onSubmit={submitBooking}>
                                            <EventBookingForm
                                                event={event} targetUser={user}
                                                additionalInformation={additionalInformation}
                                                updateAdditionalInformation={updateAdditionalInformation}
                                            />
                                            <div>
                                                <p className="mb-3">
                                                    <small>
                                                        By requesting to book on this event, you are granting event organisers access to the information provided in the form above.
                                                        You are also giving them permission to set you pre-event work and view your progress.
                                                        You can manage access to your progress data in your <Link to="/account#teacherconnections" target="_blank">account settings</Link>.
                                                        <br />
                                                        Your data will be processed in accordance with Isaac {SITE_SUBJECT_TITLE}&apos;s <Link to="/privacy" target="_blank">privacy policy</Link>.
                                                        <br />
                                                        If you have unsubscribed from assignment email notifications you may miss out on pre-work set for the event.
                                                        You can enable this in your <Link to="/account#emailpreferences" target="_blank">account settings</Link>.
                                                    </small>
                                                </p>

                                                <div className="text-center mt-4 mb-2">
                                                    <RS.Input type="submit" value={submissionTitle} className="btn btn-xl btn-secondary border-0" />
                                                </div>
                                            </div>
                                        </RS.Form>
                                    </RS.CardBody>
                                </RS.Card>
                            </span>}

                            {/* Buttons */}
                            <div>
                                {/* Options for un-logged-in users */}
                                {!isLoggedIn(user) && event.isNotClosed && !event.hasExpired &&
                                    <RS.Button onClick={loginAndReturn}>
                                        {atLeastOne(event.placesAvailable) && event.isWithinBookingDeadline ?
                                            "Login to book" :
                                            "login to apply"
                                        }
                                    </RS.Button>
                                }

                                {/* Options for logged-in users */}
                                {isLoggedIn(user) && !event.hasExpired && <React.Fragment>
                                    {(canMakeABooking || canBeAddedToWaitingList) && !bookingFormOpen && !['CONFIRMED'].includes(event.userBookingStatus || '') &&
                                        <RS.Button onClick={() => {setBookingFormOpen(true)}}>
                                            {event.userBookingStatus === 'RESERVED' ? 'Confirm your reservation' : 'Book a place'}
                                        </RS.Button>
                                    }
                                    {canReserveSpaces &&
                                        <RS.Button color="primary" onClick={() => {dispatch(openActiveModal(reservationsModal()))}}>
                                            Manage reservations
                                        </RS.Button>
                                    }
                                    {(event.userBookingStatus === "CONFIRMED" || event.userBookingStatus === "WAITING_LIST" || event.userBookingStatus === "RESERVED") &&
                                        <RS.Button color="primary" outline onClick={() => {dispatch(cancelMyBooking(eventId))}}>
                                            {{
                                                CONFIRMED: "Cancel your booking",
                                                WAITING_LIST: "Leave waiting list",
                                                RESERVED: "Cancel your reservation"
                                            }[event.userBookingStatus]}
                                        </RS.Button>
                                    }
                                </React.Fragment>}

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
