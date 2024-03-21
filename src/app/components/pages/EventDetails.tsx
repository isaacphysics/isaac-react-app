import React, { useEffect, useState } from "react";
import { Badge, Button, Card, CardBody, CardImg, Col, Container, Form, Input, Row, Table, Alert } from "reactstrap";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import {
  addMyselfToWaitingList,
  AppState,
  bookMyselfOnEvent,
  cancelMyBooking,
  getEvent,
  openActiveModal,
  selectors,
  showToast,
  useAppDispatch,
  useAppSelector,
} from "../../state";
import { ShowLoading } from "../handlers/ShowLoading";
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
  history,
  isDefined,
  isLoggedIn,
  isStaff,
  isTeacherOrAbove,
  KEY,
  SITE_SUBJECT_TITLE,
  studentOnlyEventMessage,
  userCanBeAddedToEventWaitingList,
  userCanMakeEventBooking,
  userCanReserveEventSpaces,
  userSatisfiesStudentOnlyRestrictionForEvent,
  validateBookingSubmission,
  zeroOrLess,
  isAdminOrEventManager,
  isEventLeader,
  googleCalendarTemplate,
  formatAddress,
  hubNames,
} from "../../services";
import { AdditionalInformation } from "../../../IsaacAppTypes";
import { DateString } from "../elements/DateString";
import { Link } from "react-router-dom";
import { EventBookingForm } from "../elements/EventBookingForm";
import { reservationsModal } from "../elements/modals/ReservationsModal";
import { IsaacContent } from "../content/IsaacContent";
import { EditContentButton } from "../elements/EditContentButton";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import * as L from "leaflet";

interface EventDetailsProps {
  match: { params: { eventId: string } };
  location: { pathname: string };
}

const EventDetails = ({
  match: {
    params: { eventId },
  },
  location: { pathname },
}: EventDetailsProps) => {
  const dispatch = useAppDispatch();
  const event = useAppSelector((state: AppState) => state && state.currentEvent);
  const user = useAppSelector(selectors.user.orNull);
  useEffect(() => {
    dispatch(getEvent(eventId));
  }, [dispatch, eventId]);

  const [bookingFormOpen, setBookingFormOpen] = useState(false);
  const [additionalInformation, setAdditionalInformation] = useState<AdditionalInformation>({});

  function updateAdditionalInformation(update: AdditionalInformation) {
    setAdditionalInformation(Object.assign({}, additionalInformation, update));
  }

  function loginAndReturn() {
    persistence.save(KEY.AFTER_AUTH_PATH, pathname);
    history.push("/login");
  }

  return (
    <ShowLoading
      until={event}
      thenRender={(event) => {
        const studentOnlyRestrictionSatisfied = userSatisfiesStudentOnlyRestrictionForEvent(user, event);

        const canMakeABooking = userCanMakeEventBooking(user, event);
        const canBeAddedToWaitingList = userCanBeAddedToEventWaitingList(user, event);
        const canReserveSpaces = userCanReserveEventSpaces(user, event);

        const isVirtual = event.tags?.includes("virtual");

        function submitBooking(formEvent?: React.FormEvent<HTMLFormElement>) {
          formEvent?.preventDefault();

          if (user && user.loggedIn) {
            const failureToastOrTrue = validateBookingSubmission(event, user, additionalInformation);

            if (failureToastOrTrue !== true) {
              dispatch(showToast(failureToastOrTrue));
            } else if (canMakeABooking) {
              dispatch(bookMyselfOnEvent(event.id as string, additionalInformation));
            } else if (canBeAddedToWaitingList) {
              dispatch(addMyselfToWaitingList(event.id as string, additionalInformation, event.isWaitingListOnly));
            }
          }
        }

        function openAndScrollToBookingForm() {
          document.getElementById("open_booking_form_button")?.scrollIntoView({ behavior: "smooth" });
          document.getElementById("booking_form")?.scrollIntoView({ behavior: "smooth" });
          setBookingFormOpen(true);
        }

        // This is UGLY but there's a weird issue between the leaflet.css file and how webpack loads url()s that makes everything go kaboom.
        // There are various places online discussing this issue, but this one is a good starting point: https://github.com/Leaflet/Leaflet/issues/4968
        // _______
        // WARNING 2022-03-01 - This will need to be reconsidered when we upgrade the front-end dependencies
        // ¯¯¯¯¯¯¯
        const icon = L.icon({
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png").default,
          iconUrl: require("leaflet/dist/images/marker-icon.png"),
          shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
          iconAnchor: [12, 41],
        });

        return (
          <Container className="events mb-5">
            <TitleAndBreadcrumb
              currentPageTitle={event.title as string}
              subTitle={event.subtitle}
              breadcrumbTitleOverride="Event details"
              intermediateCrumbs={[EVENTS_CRUMB]}
            />
            <EditContentButton doc={event} />

            <Card className="mt-4 pt-2">
              <CardBody>
                {/* Detail Main */}
                <Row>
                  <Col lg={4}>
                    {event.eventThumbnail && (
                      <div className="mt-2">
                        <CardImg
                          aria-hidden={true}
                          alt={"" /* Decorative image, should be hidden from screenreaders */}
                          className="m-auto restrict-height"
                          top
                          src={event.eventThumbnail.src}
                          data-testid="event-details-image"
                        />
                        <div className="border px-2 py-1 mt-3 bg-light" data-testid="event-details-title">
                          <strong>{event.title}</strong>
                          {event.isPrivateEvent && (
                            <Row className="mx-0 mt-2">
                              <Badge color="primary" className="mr-1">
                                Private Event
                              </Badge>
                            </Row>
                          )}
                        </div>
                        {isDefined(event.location) &&
                          isDefined(event.location?.latitude) &&
                          isDefined(event.location?.longitude) && (
                            <div className="border px-2 py-1 mt-3 bg-light" data-testid="event-map">
                              <MapContainer center={[event.location.latitude, event.location.longitude]} zoom={13}>
                                <TileLayer
                                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                  attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                                />
                                <Marker position={[event.location.latitude, event.location.longitude]} icon={icon}>
                                  <Popup>
                                    {event.location?.address?.addressLine1}
                                    <br />
                                    {event.location?.address?.addressLine2}
                                    <br />
                                    {event.location?.address?.town}
                                    <br />
                                    {event.location?.address?.postalCode}
                                  </Popup>
                                </Marker>
                              </MapContainer>
                            </div>
                          )}
                      </div>
                    )}
                  </Col>
                  <Col lg={8} className={event.hasExpired ? "expired" : ""}>
                    {/* TODO Student/Teacher/Virtual icon */}
                    {isStaff(user) && (
                      <Button
                        color="link"
                        onClick={() => googleCalendarTemplate(event)}
                        className="calendar-img mx-2"
                        title="Add to Google Calendar"
                      >
                        Add to Calendar
                      </Button>
                    )}

                    {/* Key event info */}
                    <Table borderless className="event-key-info mb-4">
                      <tbody>
                        <tr>
                          <td>When:</td>
                          <td data-testid="event-date">
                            {formatEventDetailsDate(event)}
                            {event.hasExpired && (
                              <div className="alert-danger text-center">This event is in the past.</div>
                            )}
                          </td>
                        </tr>
                        {(isEventLeader(user) || isAdminOrEventManager(user)) && event.hub && (
                          <tr>
                            <td>Hub:</td>
                            <td data-testid="event-hub">{hubNames[event.hub]}</td>
                          </tr>
                        )}
                        <tr>
                          <td>Location:</td>
                          <td data-testid="event-location">{isVirtual ? "Online" : formatAddress(event.location)}</td>
                        </tr>
                        {event.isNotClosed && !event.hasExpired && (
                          <tr>
                            <td>Availability:</td>
                            <td data-testid="event-availability">
                              {atLeastOne(event.placesAvailable) && <div>{event.placesAvailable} spaces</div>}
                              {zeroOrLess(event.placesAvailable) && (
                                <>
                                  <Badge className="mr-1">Full</Badge>
                                  {/* Tutors cannot book on full events, as they are considered students w.r.t. events */}
                                  {event.isAStudentEvent && isTeacherOrAbove(user) && <span>for student bookings</span>}
                                </>
                              )}
                              {event.userBookingStatus === "CONFIRMED" && (
                                <span>
                                  {" - "}
                                  <span className="text-success">You are booked on this event!</span>
                                </span>
                              )}
                              {event.userBookingStatus === "RESERVED" && (
                                <span>
                                  {" - "}
                                  <span className="text-success">
                                    You have been reserved a place on this event!
                                    <Button color="link text-success" onClick={openAndScrollToBookingForm}>
                                      <u>Complete your registration below</u>.
                                    </Button>
                                  </span>
                                </span>
                              )}
                              {canBeAddedToWaitingList && event.isWithinBookingDeadline && (
                                <span> - {formatAvailabilityMessage(event)}</span>
                              )}
                              {event.userBookingStatus === "WAITING_LIST" && (
                                <span> - {formatWaitingListBookingStatusMessage(event)}</span>
                              )}
                              {event.isStudentOnly && !studentOnlyRestrictionSatisfied && (
                                <div className="text-muted font-weight-normal">{studentOnlyEventMessage(eventId)}</div>
                              )}
                            </td>
                          </tr>
                        )}
                        {(!event.isCancelled || isEventLeader(user) || isAdminOrEventManager(user)) &&
                          event.bookingDeadline && (
                            <tr>
                              <td>Booking Deadline:</td>
                              <td data-testid="event-booking-deadline">
                                <DateString>{event.bookingDeadline}</DateString>
                                {!event.isWithinBookingDeadline && !event.hasExpired && (
                                  <div className="alert-danger text-center" data-testid="deadline-warning">
                                    The booking deadline for this event has passed.
                                  </div>
                                )}
                              </td>
                            </tr>
                          )}
                      </tbody>
                    </Table>

                    {event.isCancelled && <Alert color={"danger"}>This event has been cancelled.</Alert>}

                    {/* Event body copy */}
                    <div className="mb-3">
                      <IsaacContent doc={event} />
                    </div>

                    {/* Booking form */}
                    {bookingFormOpen && user?.loggedIn && "CONFIRMED" !== event.userBookingStatus && (
                      <span>
                        <Card className="mb-4">
                          <CardBody>
                            <h3>Event booking form</h3>
                            <Form onSubmit={submitBooking}>
                              <EventBookingForm
                                event={event}
                                targetUser={user}
                                additionalInformation={additionalInformation}
                                updateAdditionalInformation={updateAdditionalInformation}
                              />
                              <div>
                                <p className="mb-3">
                                  <small>
                                    {
                                      "By requesting to book on this event, you are granting event organisers access to the information provided in the form above. You are also giving them permission to set you pre-event work and view your progress. You can manage access to your progress data in your "
                                    }
                                    <Link to="/account#teacherconnections" target="_blank">
                                      account settings
                                    </Link>
                                    .
                                    <br />
                                    {`Your data will be processed in accordance with Isaac ${SITE_SUBJECT_TITLE}'s `}
                                    <Link to="/privacy" target="_blank">
                                      privacy policy
                                    </Link>
                                    .
                                    <br />
                                    {
                                      "If you have unsubscribed from assignment email notifications you may miss out on pre-work set for the event. You can enable this in your "
                                    }
                                    <Link to="/account#emailpreferences" target="_blank">
                                      account settings
                                    </Link>
                                    .
                                  </small>
                                </p>

                                <div className="text-center mt-4 mb-2">
                                  <Input
                                    type="submit"
                                    value={formatBookingModalConfirmMessage(event, canMakeABooking)}
                                    className="btn btn-xl btn-secondary border-0"
                                  />
                                </div>
                              </div>
                            </Form>
                          </CardBody>
                        </Card>
                      </span>
                    )}

                    {/* Buttons */}
                    <div>
                      {/* Options for un-logged-in users */}
                      {!isLoggedIn(user) && event.isNotClosed && !event.hasExpired && (
                        <Button onClick={loginAndReturn}>
                          {atLeastOne(event.placesAvailable) && event.isWithinBookingDeadline
                            ? "Login to book"
                            : "Login to apply"}
                        </Button>
                      )}

                      {/* Options for logged-in users */}
                      {isLoggedIn(user) && !event.hasExpired && (
                        <React.Fragment>
                          {(canMakeABooking || canBeAddedToWaitingList) &&
                            event.isWithinBookingDeadline &&
                            !bookingFormOpen &&
                            !["CONFIRMED"].includes(event.userBookingStatus || "") && (
                              <Button
                                onClick={() => {
                                  setBookingFormOpen(true);
                                }}
                              >
                                {formatMakeBookingButtonMessage(event)}
                              </Button>
                            )}
                          {canReserveSpaces && (
                            <Button
                              color="primary"
                              onClick={() => {
                                dispatch(openActiveModal(reservationsModal()));
                              }}
                            >
                              Manage reservations
                            </Button>
                          )}
                          {(event.userBookingStatus === "CONFIRMED" ||
                            event.userBookingStatus === "WAITING_LIST" ||
                            event.userBookingStatus === "RESERVED") && (
                            <Button
                              color="primary"
                              outline
                              onClick={() => {
                                dispatch(cancelMyBooking(eventId));
                              }}
                            >
                              {formatCancelBookingButtonMessage(event)}
                            </Button>
                          )}
                        </React.Fragment>
                      )}
                      <Button tag={Link} to="/events" color="primary" outline>
                        Back to events
                      </Button>
                    </div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Container>
        );
      }}
    />
  );
};
export default EventDetails;
