import React, { useState } from "react";
import * as RS from "reactstrap";
import { Accordion } from "../Accordion";
import { AppState, recordEventAttendance, selectors, useAppDispatch, useAppSelector } from "../../../state";
import { atLeastOne, isEventLeader, NOT_FOUND, sortOnPredicateAndReverse } from "../../../services";
import { EventBookingDTO, UserSummaryWithEmailAddressDTO } from "../../../../IsaacApiTypes";
import { DateString } from "../DateString";
import { ATTENDANCE, PotentialUser } from "../../../../IsaacAppTypes";

function displayAttendanceAsSymbol(status?: string) {
  switch (status) {
    case "ATTENDED":
      return "✔️";
    case "ABSENT":
      return "❌";
    default:
      return "";
  }
}

export const EventAttendance = ({ user, eventId }: { user: PotentialUser; eventId: string }) => {
  const dispatch = useAppDispatch();
  const selectedEvent = useAppSelector(
    (state: AppState) => (state && state.currentEvent !== NOT_FOUND && state.currentEvent) || null,
  );
  const bookings = useAppSelector((state: AppState) => (state && state.eventBookings) || []);
  const userIdToSchoolMapping = useAppSelector(selectors.admin.userSchoolLookup) || {};

  const [sortPredicate, setSortPredicate] = useState("bookingDate");
  const [reverse, setReverse] = useState(true);
  const [familyNameFilter, setFamilyNameFilter] = useState("");

  function filterOnSurname(booking: EventBookingDTO) {
    return (
      booking.userBooked &&
      booking.userBooked.familyName !== undefined &&
      booking.userBooked.familyName.toLocaleLowerCase().includes(familyNameFilter.toLocaleLowerCase())
    );
  }

  let canRecordAttendance = false;
  if (selectedEvent && selectedEvent.date) {
    const morningOfEvent = new Date(selectedEvent.date);
    morningOfEvent.setUTCHours(0, 0);
    canRecordAttendance = morningOfEvent <= new Date();
  }

  return (
    <React.Fragment>
      {canRecordAttendance && atLeastOne(bookings.length) && (
        <Accordion
          trustedTitle="Record event attendance"
          disabled={selectedEvent?.isCancelled && "You cannot record attendance for a cancelled event"}
        >
          {isEventLeader(user) && (
            <div className="bg-grey p-2 mb-3 text-center">
              As an event leader, you are only able to see the bookings of users who have granted you access to their
              data.
            </div>
          )}
          <div className="overflow-auto">
            <RS.Table bordered className="mb-0 bg-white">
              <thead>
                <tr>
                  <th className="align-middle">Actions</th>
                  <th className="align-middle">
                    <RS.Button
                      color="link"
                      onClick={() => {
                        setSortPredicate("bookingStatus");
                        setReverse(!reverse);
                      }}
                    >
                      Attendance
                    </RS.Button>
                  </th>
                  <th className="align-middle">
                    <RS.Button
                      color="link"
                      onClick={() => {
                        setSortPredicate("userBooked.familyName");
                        setReverse(!reverse);
                      }}
                    >
                      Name
                    </RS.Button>
                    <RS.Input
                      className="w-auto"
                      value={familyNameFilter}
                      onChange={(e) => setFamilyNameFilter(e.target.value)}
                      placeholder="Surname filter"
                    />
                  </th>
                  <th className="align-middle">Job / year group</th>
                  <th className="align-middle">School</th>
                  <th className="align-middle">Account type</th>
                  <th className="align-middle">
                    <RS.Button
                      color="link"
                      onClick={() => {
                        setSortPredicate("userBooked.email");
                        setReverse(!reverse);
                      }}
                    >
                      Email
                    </RS.Button>
                  </th>
                  <th className="align-middle">
                    <RS.Button
                      color="link"
                      onClick={() => {
                        setSortPredicate("bookingDate");
                        setReverse(!reverse);
                      }}
                    >
                      Booking created
                    </RS.Button>
                  </th>
                  <th className="align-middle">
                    <RS.Button
                      color="link"
                      onClick={() => {
                        setSortPredicate("updated");
                        setReverse(!reverse);
                      }}
                    >
                      Booking updated
                    </RS.Button>
                  </th>
                  <th className="align-middle">Accessibility requirements</th>
                  <th className="align-middle">Medical requirements</th>
                  <th className="align-middle">Emergency name</th>
                  <th className="align-middle">Emergency telephone</th>
                </tr>
              </thead>
              <tbody>
                {bookings
                  .sort(sortOnPredicateAndReverse(sortPredicate, reverse))
                  .filter(filterOnSurname)
                  .map((booking) => {
                    const userBooked = booking.userBooked as UserSummaryWithEmailAddressDTO;
                    const additionalInformation = booking.additionalInformation;
                    const userSchool = booking.userBooked && userIdToSchoolMapping[booking.userBooked.id as number];

                    return (
                      <tr key={booking.bookingId}>
                        <td className="align-middle">
                          {booking.bookingStatus != "ATTENDED" && (
                            <RS.Button
                              color="primary"
                              outline
                              className="btn-sm mb-2"
                              onClick={() =>
                                dispatch(recordEventAttendance(eventId, userBooked.id as number, ATTENDANCE.ATTENDED))
                              }
                            >
                              Mark&nbsp;as Attended
                            </RS.Button>
                          )}
                          {booking.bookingStatus != "ABSENT" && (
                            <RS.Button
                              color="primary"
                              outline
                              className="btn-sm mb-2"
                              onClick={() =>
                                dispatch(recordEventAttendance(eventId, userBooked.id as number, ATTENDANCE.ABSENT))
                              }
                            >
                              Mark&nbsp;as Absent
                            </RS.Button>
                          )}
                        </td>
                        <td className="align-middle text-center">{displayAttendanceAsSymbol(booking.bookingStatus)}</td>
                        <td className="align-middle">
                          {userBooked.familyName}, {userBooked.givenName}
                        </td>
                        <td className="align-middle">
                          {additionalInformation?.jobTitle || additionalInformation?.yearGroup || ""}
                        </td>
                        {(userSchool === undefined || !userSchool.urn) && (
                          <td className="align-middle">{userSchool ? userSchool.name : ""}</td>
                        )}
                        {userSchool && userSchool.urn && <td className="align-middle">{userSchool.name}</td>}{" "}
                        {/* In future can add link to school stats page */}
                        <td className="align-middle">{userBooked.role}</td>
                        <td className="align-middle">{userBooked.email}</td>
                        <td className="align-middle">
                          <DateString>{booking.bookingDate}</DateString>
                        </td>
                        <td className="align-middle">
                          <DateString>{booking.updated}</DateString>
                        </td>
                        <td className="align-middle">{additionalInformation?.accessibilityRequirements || ""}</td>
                        <td className="align-middle">{additionalInformation?.medicalRequirements || ""}</td>
                        <td className="align-middle">{additionalInformation?.emergencyName || ""}</td>
                        <td className="align-middle">{additionalInformation?.emergencyNumber || ""}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </RS.Table>
          </div>
        </Accordion>
      )}
    </React.Fragment>
  );
};
