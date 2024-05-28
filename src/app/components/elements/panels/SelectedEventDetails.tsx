import React, { useEffect } from "react";
import { Badge, Card, CardBody, CardTitle } from "reactstrap";
import { AppState, getEvent, selectors, useAppDispatch, useAppSelector } from "../../../state";
import { Link } from "react-router-dom";
import { DateString } from "../DateString";
import { NOT_FOUND, formatAddress, hubNames, zeroOrLess } from "../../../services";
import { EventBookingDTO, Location } from "../../../../IsaacApiTypes";
import { EventGenderDetails } from "./EventGenderDetails";

export const countStudentsAndTeachers = (eventBookings: EventBookingDTO[]) => {
  let studentCount = 0;
  let teacherCount = 0;
  let reservedCount = 0;

  eventBookings.forEach((booking) => {
    const role = booking.userBooked?.role;
    const bookingStatus = booking.bookingStatus;

    if (role && bookingStatus) {
      const validStatus = ["CONFIRMED", "ATTENDED", "ABSENT"].includes(bookingStatus);

      if (role === "STUDENT" && validStatus) {
        studentCount++;
      } else if (role === "TEACHER" && validStatus) {
        teacherCount++;
      } else if (bookingStatus === "RESERVED") {
        reservedCount++;
      }
    }
  });
  return {
    studentCount,
    teacherCount,
    reservedCount,
  };
};

export const LocationDetails = ({ isVirtual, location }: { isVirtual?: boolean; location?: Location }) => {
  return (
    <p className="mb-0">
      <strong>Location: </strong>
      {isVirtual ? "Online" : formatAddress(location)}
    </p>
  );
};

export const SelectedEventDetails = ({ eventId }: { eventId: string }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getEvent(eventId));
  }, [dispatch, eventId]);

  const selectedEvent = useAppSelector((state: AppState) => {
    return state && state.currentEvent;
  });
  const eventBookings = useAppSelector(selectors.events.eventBookings);
  const { studentCount, teacherCount, reservedCount } = countStudentsAndTeachers(eventBookings);

  return (
    <Card>
      <CardBody>
        <CardTitle tag="h3">Selected event details</CardTitle>
        {selectedEvent && selectedEvent !== NOT_FOUND && (
          <div className="m-0" data-testid="event-details">
            <p className="mb-0">
              <strong>Event: </strong>
              <Link to={`/events/${selectedEvent.id}`} target="_blank">
                {selectedEvent.title} - {selectedEvent.subtitle}
              </Link>
              {selectedEvent.isPrivateEvent && (
                <Badge className="ml-2" color="primary">
                  Private Event
                </Badge>
              )}
            </p>
            <p className="mb-0">
              <strong>Hub: </strong>
              {selectedEvent.hub ? hubNames[selectedEvent.hub] : "N/A"}
            </p>
            <LocationDetails isVirtual={selectedEvent.isVirtual} location={selectedEvent.location} />
            <p className="mb-0">
              <strong>Event status: </strong>
              <span className={selectedEvent.isCancelled ? "text-danger font-weight-bold" : ""}>
                {selectedEvent.eventStatus}
              </span>
            </p>
            <p className="mb-0">
              <strong>Event Date & Time: </strong>
              <DateString>{selectedEvent.date}</DateString> - <DateString>{selectedEvent.endDate}</DateString>
            </p>
            {selectedEvent.bookingDeadline && (
              <p className="mb-0">
                <strong>Booking deadline: </strong>
                <DateString>{selectedEvent.bookingDeadline}</DateString>
                <br />
              </p>
            )}
            {selectedEvent.prepWorkDeadline && (
              <p className="mb-0">
                <strong>Prepwork deadline: </strong>
                <DateString>{selectedEvent.prepWorkDeadline}</DateString>
              </p>
            )}
            {/* Group token is currently JSON Ignored by the API */}
            {/*<strong>Group Auth Code:</strong>*/}
            {/*{selectedEvent.isaacGroupToken}*/}
            {/*<br />*/}
            <p className={zeroOrLess(selectedEvent.placesAvailable) ? "text-danger mb-0" : "mb-0"}>
              <strong>Number of places available: </strong>
              {selectedEvent.placesAvailable} / {selectedEvent.numberOfPlaces}
            </p>
            <p className="mb-0">
              <strong>Number of students: </strong>
              {studentCount} / {selectedEvent.numberOfPlaces}
            </p>
            <p className="mb-0">
              <strong>Number of teachers: </strong>
              {teacherCount} / {selectedEvent.numberOfPlaces}
            </p>
            <p className="mb-0">
              <strong>Number of reservations: </strong>
              {reservedCount} / {selectedEvent.numberOfPlaces}
            </p>
            <EventGenderDetails eventBookings={eventBookings} />
          </div>
        )}
        {selectedEvent && selectedEvent === NOT_FOUND && (
          <p className="m-0" data-testid="event-details-not-found">
            Event details not found.
          </p>
        )}
      </CardBody>
    </Card>
  );
};
