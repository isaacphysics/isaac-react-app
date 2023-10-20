import React, { useEffect } from "react";
import * as RS from "reactstrap";
import { AppState, getEvent, selectors, useAppDispatch, useAppSelector } from "../../../state";
import { Link } from "react-router-dom";
import { DateString } from "../DateString";
import { NOT_FOUND, zeroOrLess } from "../../../services";
import { EventBookingDTO, Location } from "../../../../IsaacApiTypes";

export const countStudentsAndTeachers = (eventBookings: EventBookingDTO[]) => {
  let studentCount = 0;
  let teacherCount = 0;

  eventBookings.forEach((booking) => {
    const role = booking.userBooked?.role;
    const bookingStatus = booking.bookingStatus;

    if (role && bookingStatus) {
      const validStatus = ["CONFIRMED", "ATTENDED", "ABSENT"].includes(bookingStatus);

      if (role === "STUDENT" && validStatus) {
        studentCount++;
      } else if (role === "TEACHER" && validStatus) {
        teacherCount++;
      }
    }
  });
  return {
    studentCount,
    teacherCount,
  };
};

export const formatAddress = (location: Location | undefined) => {
  if (!location) return "Unknown Location";
  const addressLine1 = location.address?.addressLine1 || "";
  const town = location.address?.town || "";
  const postalCode = location.address?.postalCode || "";
  const addressComponents = [addressLine1, town, postalCode].filter(Boolean);
  return addressComponents.join(", ");
};

export const LocationDetails = ({ isVirtual, location }: { isVirtual?: boolean; location?: Location }) => {
  formatAddress(location);
  return (
    <>
      <strong>Location: </strong>
      {isVirtual ? "Online" : formatAddress(location)}
      <br />
    </>
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

  const { studentCount, teacherCount } = countStudentsAndTeachers(eventBookings);

  return (
    <RS.Card>
      <RS.CardBody>
        <h3 className="h-subtitle mb-1">Selected event details</h3>
        {selectedEvent && selectedEvent !== NOT_FOUND && (
          <p className="m-0" data-testid="event-details">
            <strong>Event: </strong>
            <Link to={`/events/${selectedEvent.id}`} target="_blank">
              {selectedEvent.title} {selectedEvent.subtitle}
            </Link>
            <br />
            <LocationDetails isVirtual={selectedEvent.isVirtual} location={selectedEvent.location} />
            <strong>Event status: </strong>
            <span className={selectedEvent.isCancelled ? "text-danger font-weight-bold" : ""}>
              {selectedEvent.eventStatus}
            </span>
            <br />
            <strong>Event Date & Time: </strong>
            <DateString>{selectedEvent.date}</DateString> - <DateString>{selectedEvent.endDate}</DateString>
            <br />
            <strong>Booking deadline: </strong>
            <DateString>{selectedEvent.bookingDeadline}</DateString>
            <br />
            {selectedEvent.prepWorkDeadline && (
              <>
                <strong>Prepwork deadline: </strong>
                <DateString>{selectedEvent.prepWorkDeadline}</DateString>
                <br />
              </>
            )}
            {/* Group token is currently JSON Ignored by the API */}
            {/*<strong>Group Auth Code:</strong>*/}
            {/*{selectedEvent.isaacGroupToken}*/}
            {/*<br />*/}
            <span className={zeroOrLess(selectedEvent.placesAvailable) ? "text-danger" : ""}>
              <strong>Number of places available: </strong>
              {selectedEvent.placesAvailable} / {selectedEvent.numberOfPlaces}
            </span>
            <br />
            <strong>Number of students: </strong>
            {studentCount} / {selectedEvent.numberOfPlaces}
            <br />
            <strong>Number of teachers: </strong>
            {teacherCount} / {selectedEvent.numberOfPlaces}
          </p>
        )}
        {selectedEvent && selectedEvent === NOT_FOUND && (
          <p className="m-0" data-testid="event-details">
            Event details not found.
          </p>
        )}
      </RS.CardBody>
    </RS.Card>
  );
};
