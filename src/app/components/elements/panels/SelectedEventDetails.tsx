import React, { useEffect } from "react";
import { Badge, Card, CardBody, CardTitle, ListGroup, ListGroupItem, UncontrolledTooltip } from "reactstrap";
import { AppState, getEvent, selectors, useAppDispatch, useAppSelector } from "../../../state";
import { Link } from "react-router-dom";
import { DateString } from "../DateString";
import { NOT_FOUND, formatAddress, asPercentage, zeroOrLess } from "../../../services";
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

export const countGenders = (eventBookings: EventBookingDTO[]) => {
  const genders = {
    male: 0,
    female: 0,
    other: 0,
    preferNotToSay: 0,
    unknown: 0,
  };

  eventBookings.forEach((booking) => {
    const gender = booking.userBooked?.gender;
    const bookingStatus = booking.bookingStatus;

    if (booking.userBooked && bookingStatus && ["CONFIRMED", "ATTENDED"].includes(bookingStatus)) {
      switch (gender) {
        case "MALE":
          genders.male++;
          break;
        case "FEMALE":
          genders.female++;
          break;
        case "OTHER":
          genders.other++;
          break;
        case "PREFER_NOT_TO_SAY":
          genders.preferNotToSay++;
          break;
        case "UNKNOWN":
        case undefined:
          genders.unknown++;
          break;
        default:
          break;
      }
    }
  });
  return genders;
};

export const LocationDetails = ({ isVirtual, location }: { isVirtual?: boolean; location?: Location }) => {
  return (
    <p className="mb-0">
      <strong>Location: </strong>
      {isVirtual ? "Online" : formatAddress(location)}
    </p>
  );
};

export const GenderDetails = ({ eventBookings }: { eventBookings: EventBookingDTO[] }) => {
  const { male, female, other, preferNotToSay, unknown } = countGenders(eventBookings);
  const numberOfConfirmedOrAttendedBookings = eventBookings.filter((eventBooking) => {
    return eventBooking.bookingStatus === "CONFIRMED" || eventBooking.bookingStatus === "ATTENDED";
  }).length;

  const genderData = [
    { label: "Male", value: male },
    { label: "Female", value: female },
    { label: "Other", value: other },
    { label: "Prefer not to say", value: preferNotToSay },
    { label: "Unknown", value: unknown },
  ];

  return (
    <>
      <p className="mb-0" data-testid="event-genders">
        <strong>Gender:</strong>
        <span id={`gender-stats-tooltip`} className="icon-help ml-1" />
        <UncontrolledTooltip className="text-nowrap" target={`gender-stats-tooltip`} placement="right">
          User gender of CONFIRMED or ATTENDED bookings
        </UncontrolledTooltip>
      </p>
      <ListGroup>
        {genderData.map(({ label, value }) => (
          <ListGroupItem key={label} className="py-0">
            {`${label}: ${value} (${asPercentage(value, numberOfConfirmedOrAttendedBookings)}%)`}
          </ListGroupItem>
        ))}
      </ListGroup>
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
            <GenderDetails eventBookings={eventBookings} />
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
