import React, {useState} from "react";
import {Button, Card, CardBody, CardImg, Col, Container, Form, Input, Row, Alert, Badge} from "reactstrap";
import dayjs from "dayjs";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {
    openActiveModal,
    selectors,
    showErrorToast,
    showToast,
    useAppDispatch,
    useAppSelector,
    useGetEventQuery,
    useBookMyselfOnEventMutation,
    useAddMyselfToWaitingListMutation,
    useCancelMyBookingMutation
} from "../../state";
import {
    persistence,
    atLeastOne,
    EVENTS_CRUMB,
    formatAvailabilityMessage,
    formatBookingModalConfirmMessage,
    formatCancelBookingButtonMessage,
    formatEventDetailsDate,
    formatMakeBookingButtonMessage,
    formatWaitingListBookingStatusMessage,
    isDefined,
    isLoggedIn,
    isTeacherOrAbove,
    KEY,
    SITE_TITLE,
    studentOnlyEventMessage,
    userCanBeAddedToEventWaitingList,
    userCanMakeEventBooking,
    userCanReserveEventSpaces,
    userSatisfiesStudentOnlyRestrictionForEvent,
    validateBookingSubmission,
    zeroOrLess,
    isAdminOrEventManager,
    isEventLeader,
    isPhy,
    userBookedReservedOrOnWaitingList, confirmThen,
    siteSpecific,
    navigateComponentless,
} from "../../services";
import {AdditionalInformation, AugmentedEvent, PotentialUser} from "../../../IsaacAppTypes";
import {DateString} from "../elements/DateString";
import {Link, useLocation, useParams} from "react-router-dom";
import {EventBookingForm} from "../elements/EventBookingForm";
import {reservationsModal} from "../elements/modals/ReservationsModal";
import {IsaacContent} from "../content/IsaacContent";
import {MapContainer, Marker, Popup, TileLayer} from "react-leaflet";
import * as L from "leaflet";
import {teacherEventConfirmationModal} from "../elements/modals/TeacherEventConfirmationModal";
import {skipToken} from "@reduxjs/toolkit/query";
import {ShowLoadingQuery} from "../handlers/ShowLoadingQuery";
import { PageMetadata } from "../elements/PageMetadata";
import { MetadataContainer } from "../elements/panels/MetadataContainer";
import { Immutable } from "immer";
import classNames from "classnames";

function formatDate(date: Date | number) {
    return dayjs(date).format("YYYYMMDD[T]HHmmss");
}

interface EventBookingProps {
    user: Immutable<PotentialUser> | null;
    event: AugmentedEvent;
    eventId: string;
    pathname: string;
    isVirtual: boolean;
    canMakeABooking: boolean;
    bookingFormOpen: boolean;
    setBookingFormOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const KeyEventInfo = ({user, event, eventId, isVirtual, canMakeABooking, bookingFormOpen, setBookingFormOpen}: EventBookingProps) => {

    function openAndScrollToBookingForm() {
        document.getElementById("booking_form")?.scrollIntoView({behavior: 'smooth'});
        setBookingFormOpen(true);
    }

    const firstColumnWidths = siteSpecific("col-4 col-sm-3 col-md-2", "col-4 col-xl-3");
    const canBeAddedToWaitingList = userCanBeAddedToEventWaitingList(user, event);
    const studentOnlyRestrictionSatisfied = userSatisfiesStudentOnlyRestrictionForEvent(user, event);

    const KeyInfo = siteSpecific("div", Card);

    return <>
        <MetadataContainer className={siteSpecific("", "mt-3")}>
            <KeyInfo className={classNames("event-key-info", siteSpecific("px-4", "gap-3 p-4"))}>
                <Row>
                    <Col className={firstColumnWidths}>
                        {siteSpecific(
                            <b>When:</b>, 
                            <span className="d-inline-flex align-items-center"><i className="icon icon-md icon-event-upcoming me-2" color="secondary"/><b>When</b></span>
                        )}
                    </Col>
                    <Col>
                        {formatEventDetailsDate(event)}
                        {event.hasExpired && <div>
                            <b>This event is in the past.</b>
                        </div>}
                    </Col>
                </Row>
                {<Row>
                    <Col className={firstColumnWidths}>
                        {siteSpecific(
                            <b>Location:</b>, 
                            <span className="d-inline-flex align-items-center"><i className="icon icon-md icon-location me-2" color="secondary"/><b>Location</b></span>
                        )}
                    </Col>
                    {event.location && event.location.address && event.location.address.addressLine1 && !isVirtual && <Col>
                        {event.location.address.addressLine1}, {event.location.address.addressLine2}, {event.location.address.town}, {event.location.address.postalCode}
                    </Col>}
                    {isVirtual && <Col>Online</Col>}
                </Row>}
                {event.isNotClosed && !event.hasExpired &&
                    <Row>
                        <Col className={firstColumnWidths}>
                            {siteSpecific(
                                <b>Availability:</b>, 
                                <span className="d-inline-flex align-items-center"><i className="icon icon-md icon-person me-2" color="secondary"/><b>Availability</b></span>
                            )}
                        </Col>
                        <Col>
                            {atLeastOne(event.placesAvailable) && <div>{event.placesAvailable} spaces</div>}
                            {zeroOrLess(event.placesAvailable) && <div>
                                <strong className="text-danger">FULL</strong>
                                {/* Tutors cannot book on full events, as they are considered students w.r.t. events */}
                                {event.isAStudentEvent && isTeacherOrAbove(user) && <span> - for student bookings.</span>}
                            </div>}
                            {event.userBookingStatus === "CONFIRMED" && <span> - <span className="text-success">You are booked on this event!</span></span>}
                            {event.userBookingStatus === 'RESERVED' && <span> - <span className="text-success">
                                You have been reserved a place on this event!
                                <Button color="link text-success" onClick={openAndScrollToBookingForm}>
                                    <u>Complete your registration below</u>.
                                </Button>
                            </span></span>}
                            {canBeAddedToWaitingList && <span className="ms-1">{formatAvailabilityMessage(event)}</span>}
                            {event.userBookingStatus === "WAITING_LIST" && <span> - {formatWaitingListBookingStatusMessage(event)}</span>}
                            {event.isStudentOnly && !studentOnlyRestrictionSatisfied && 
                                <div className="text-muted fw-normal">
                                    {studentOnlyEventMessage(eventId)}
                                </div>
                            }
                        </Col>
                    </Row>}
                {(!event.isCancelled || isEventLeader(user) || isAdminOrEventManager(user)) && event.bookingDeadline &&
                    <Row>
                        <Col className={firstColumnWidths}>
                            {siteSpecific(
                                <b>Booking deadline:</b>, 
                                <span className="d-inline-flex align-items-center"><i className="icon icon-md icon-event-complete me-2" color="secondary"/><b>Booking deadline</b></span>
                            )}
                        </Col>
                        <Col>
                            <DateString>{event.bookingDeadline}</DateString>
                            {!event.isWithinBookingDeadline && !event.hasExpired &&
                                <div className="ms-1">
                                    (The booking deadline for this event has passed.)
                                </div>
                            }
                        </Col>
                    </Row>
                }
            </KeyInfo>
        </MetadataContainer>
        {isPhy && isLoggedIn(user) && !event.hasExpired && (canMakeABooking || canBeAddedToWaitingList) && !bookingFormOpen && !['CONFIRMED'].includes(event.userBookingStatus || '') &&
            <Button color="solid" onClick={openAndScrollToBookingForm} className="d-flex ms-auto text-nowrap">
                {formatMakeBookingButtonMessage(event)}
            </Button>
        }
    </>;
};

const BookingForm = ({user, event, eventId, pathname, canMakeABooking, bookingFormOpen, setBookingFormOpen}: EventBookingProps) => {
    function loginAndReturn() {
        persistence.save(KEY.AFTER_AUTH_PATH, pathname);
        void navigateComponentless("/login");
    }

    function stopBookingIfStudent() {
        setBookingFormOpen(false);
        dispatch(showErrorToast("Event booking cancelled", "You cannot sign up to a teacher event as a student."));
    }

    function checkTeacherStatusThenSubmitBooking(formEvent: React.FormEvent<HTMLFormElement>) {
        formEvent.preventDefault();
        dispatch(openActiveModal(teacherEventConfirmationModal(submitBooking, stopBookingIfStudent)));
    }

    function submitBooking(formEvent?: React.FormEvent<HTMLFormElement>) {
        formEvent?.preventDefault();

        if (user && user.loggedIn) {
            const failureToastOrTrue = validateBookingSubmission(event, user, additionalInformation);

            if (failureToastOrTrue !== true) {
                dispatch(showToast(failureToastOrTrue));
            } else if (canMakeABooking) {
                bookMyselfOnEvent({eventId: event.id as string, additionalInformation});
            } else if (canBeAddedToWaitingList) {
                addMyselfToWaitingList({eventId: event.id as string, additionalInformation, waitingListOnly: event.isWaitingListOnly});
            }
        }
    }

    const dispatch = useAppDispatch();

    const [cancelMyBooking] = useCancelMyBookingMutation();
    const [bookMyselfOnEvent] = useBookMyselfOnEventMutation();
    const [addMyselfToWaitingList] = useAddMyselfToWaitingListMutation();

    const checkTeacherStatus = isPhy && event.isATeacherEvent && !isTeacherOrAbove(user);
    const canReserveSpaces = userCanReserveEventSpaces(user, event);
    const canBeAddedToWaitingList = userCanBeAddedToEventWaitingList(user, event);

    const [additionalInformation, setAdditionalInformation] = useState<AdditionalInformation>({});

    return <div id="booking_form">
        {bookingFormOpen && user?.loggedIn && 'CONFIRMED' !== event.userBookingStatus && <span>
            <Card className="mb-4">
                <CardBody>
                    <h3>Event booking form</h3>
                    <Form onSubmit={checkTeacherStatus ? checkTeacherStatusThenSubmitBooking : submitBooking}>
                        <EventBookingForm
                            event={event} targetUser={user}
                            additionalInformation={additionalInformation}
                            updateAdditionalInformation={(update) => setAdditionalInformation(info => ({ ...info, ...update }))}
                        />
                        <div>
                            <p className="mb-3">
                                <small>
                                    By requesting to book on this event, you are granting event organisers access to the information provided in the form above.
                                    You are also giving them permission to set you pre-event work and view your progress.
                                    You can manage access to your progress data in your <Link to="/account#teacherconnections" target="_blank">account settings</Link>.
                                    <br/>
                                    Your data will be processed in accordance with {SITE_TITLE}&apos;s <Link to="/privacy" target="_blank">privacy policy</Link>.
                                    <br/>
                                    If you have unsubscribed from assignment email notifications you may miss out on pre-work set for the event.
                                    You can enable this in your <Link to="/account#emailpreferences" target="_blank">account settings</Link>.
                                </small>
                            </p>

                            <div className="mt-4 mb-2 d-flex justify-content-center">
                                <Input
                                    type="submit"
                                    value={formatBookingModalConfirmMessage(event, canMakeABooking)}
                                    className="w-fit-content btn btn-solid border-0"
                                />
                            </div>
                        </div>
                    </Form>
                </CardBody>
            </Card>
        </span>}

        {/* Buttons */}
        <div className="d-flex flex-column">
            <div>
                {/* Options for un-logged-in users */}
                {!isLoggedIn(user) && event.isNotClosed && !event.hasExpired &&
                    <Button onClick={loginAndReturn}>
                        {atLeastOne(event.placesAvailable) && event.isWithinBookingDeadline ?
                            "Login to book" :
                            "Login to apply"
                        }
                    </Button>
                }

                {/* Options for logged-in users */}
                {isLoggedIn(user) && !event.hasExpired && <>
                    {event.isReservationOnly && !canReserveSpaces && !isTeacherOrAbove(user) && !userBookedReservedOrOnWaitingList(user, event) && <Alert color={"warning"}>
                        Places on this event can only be reserved by teachers.{" "}
                        Please ask your teacher to reserve a place for you.{" "}
                        You will need to be accompanied by a teacher to the event.{" "}
                    </Alert>
                    }
                    {(canMakeABooking || canBeAddedToWaitingList) && !bookingFormOpen && !['CONFIRMED'].includes(event.userBookingStatus || '') &&
                    <Button color="solid" className="mb-3 me-3" onClick={() => {
                        setBookingFormOpen(true);
                    }}>
                        {formatMakeBookingButtonMessage(event)}
                    </Button>
                    }
                    {canReserveSpaces &&
                    <Button className="mb-3 me-3" onClick={() => {
                        dispatch(openActiveModal(reservationsModal({event})));
                    }}>
                        Manage reservations
                    </Button>
                    }
                    {(event.userBookingStatus === "CONFIRMED" || event.userBookingStatus === "WAITING_LIST" || event.userBookingStatus === "RESERVED") &&
                    <Button className="mb-3 me-3 btn btn-keyline" onClick={() =>
                        confirmThen(
                            "Are you sure you want to cancel your booking on this event? You may not be able to re-book, especially if there is a waiting list.",
                            () => cancelMyBooking(eventId)
                        )
                    }>
                        {formatCancelBookingButtonMessage(event)}
                    </Button>
                    }
                </>}
            </div>
        </div>
    </div>;
};

const ImageAndMap = ({event}: EventBookingProps) => {
    return <div className="ms-3 mb-3 float-none float-md-end w-30">
        {isPhy && <div className={"d-none d-lg-block"}>
            {event.eventThumbnail && <div className="px-0 align-self-center">
                <CardImg
                    aria-hidden={true}
                    alt={""}
                    className={siteSpecific("my-3", "m-auto restrict-height")} src={event.eventThumbnail.src}
                />
            </div>}
        </div>}

        {isDefined(event.location) && isDefined(event.location?.latitude) && isDefined(event.location?.longitude) 
        && <Col xs={12} sm={6} lg={12} className="mt-3 px-0">
            <MapContainer center={[event.location.latitude, event.location.longitude]} zoom={13}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
                />
                <Marker position={[event.location.latitude, event.location.longitude]}>
                    <Popup>
                        {event.location?.address?.addressLine1}<br/>{event.location?.address?.addressLine2}<br/>{event.location?.address?.town}<br/>{event.location?.address?.postalCode}
                    </Popup>
                </Marker>
            </MapContainer>
        </Col>}
    </div>;
};

const EventDetails = () => {
    const { eventId = "" } = useParams();
    const location = useLocation();
    const user = useAppSelector(selectors.user.orNull);
    const eventQuery = useGetEventQuery(eventId || skipToken);
    const [bookingFormOpen, setBookingFormOpen] = useState(false);

    return <ShowLoadingQuery
        query={eventQuery}
        defaultErrorTitle={"Event not found"}
        thenRender={event => {

            const isTeacherEvent = event.tags?.includes("teacher") && !event.tags?.includes("student");
            const canMakeABooking = userCanMakeEventBooking(user, event) ?? false;
            const isVirtual = event.tags?.includes("virtual") ?? false;
            const hasExpired = event.hasExpired;
            const bookingDeadlineSoon = event.bookingDeadline && event.isWithinBookingDeadline && (new Date(event.bookingDeadline).getTime() - Date.now()) < 604800000; // 1 week

            const eventBookingProps : EventBookingProps = {
                user, event, eventId, pathname: location.pathname, isVirtual,
                canMakeABooking, bookingFormOpen, setBookingFormOpen
            };

            return <Container className="events mb-5">
                {isPhy ?
                    <TitleAndBreadcrumb
                        currentPageTitle="Events" icon={{type: "icon", icon: "icon-events"}}
                        breadcrumbTitleOverride="Event details" intermediateCrumbs={[EVENTS_CRUMB]}
                    /> :
                    <TitleAndBreadcrumb
                        currentPageTitle={event.title as string} subTitle={event.subtitle}
                        breadcrumbTitleOverride="Event details" intermediateCrumbs={[EVENTS_CRUMB]}
                    />
                }
                <PageMetadata 
                    doc={event}
                    badges={<>
                        <Badge color="primary" className="fs-6 rounded-pill">
                            {isTeacherEvent ? "Teacher event" : "Student event"}
                        </Badge>
                        {hasExpired && <Badge className="fs-6 rounded-pill" color="" style={{backgroundColor: "#6f6f78"}}>
                            EXPIRED
                        </Badge>}
                        {bookingDeadlineSoon && <span className="fs-6 warning-tag">
                            Booking deadline soon!
                        </span>}
                    </>}
                >
                    <KeyEventInfo {...eventBookingProps} />
                </PageMetadata>
                <div className={siteSpecific("", "mt-4 pt-2 card")}>
                    <div className={siteSpecific("", "card-body")}>
                        <Row> 
                            <Col>
                                <div className="d-flex flex-column-reverse d-md-block">
                                    <ImageAndMap {...eventBookingProps} />
                                    <IsaacContent doc={event}/>
                                </div>
                                <BookingForm {...eventBookingProps} />
                            </Col>
                        </Row>
                    </div>
                </div>
                <Button tag={Link} to="/events" color="keyline" className="float-end my-4">
                    More events
                </Button>
            </Container>;
        }}/>;
};
export default EventDetails;
