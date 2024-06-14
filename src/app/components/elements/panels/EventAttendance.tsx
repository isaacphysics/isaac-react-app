import React, { PropsWithChildren, useState } from "react";
import { Accordion } from "../Accordion";
import { AppState, getEvent, recordEventAttendance, selectors, useAppDispatch, useAppSelector } from "../../../state";
import { atLeastOne, isEventLeader, NOT_FOUND, sortOnPredicateAndReverse } from "../../../services";
import { DetailedEventBookingDTO, UserSummaryWithEmailAddressAndGenderDTO } from "../../../../IsaacApiTypes";
import { DateString } from "../DateString";
import { ATTENDANCE, PotentialUser } from "../../../../IsaacAppTypes";
import {
  Button,
  CardTitle,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Input,
  Table,
  UncontrolledButtonDropdown,
} from "reactstrap";

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

const AttendanceHeaderButton = ({ onClick, children }: PropsWithChildren<{ onClick: () => void }>) => (
  <th className="align-middle">
    <Button color="link" onClick={onClick}>
      {children}
    </Button>
  </th>
);

export const EventAttendance = ({ user, eventId }: { user: PotentialUser; eventId: string }) => {
  const dispatch = useAppDispatch();
  const selectedEvent = useAppSelector(
    (state: AppState) => (state && state.currentEvent !== NOT_FOUND && state.currentEvent) || null,
  );
  const bookings = useAppSelector(selectors.events.eventBookings);
  const userIdToSchoolMapping = useAppSelector(selectors.admin.userSchoolLookup) || {};

  const [sortPredicate, setSortPredicate] = useState("bookingDate");
  const [reverse, setReverse] = useState(true);
  const [familyNameFilter, setFamilyNameFilter] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [userUpdating, setUserUpdating] = useState(false);

  const selectAllToggle = () => {
    if (bookings.length === selectedUserIds.length) {
      setSelectedUserIds([]);
    } else {
      setSelectedUserIds(bookings.filter((result) => !!result).map((result) => result.userBooked?.id as number));
    }
  };

  const updateUserSelection = (userId: number, checked: boolean) => {
    if (checked) {
      setSelectedUserIds([...selectedUserIds, userId]);
    } else {
      setSelectedUserIds(selectedUserIds.filter((selectedId) => selectedId !== userId));
    }
  };

  const modifyAttendanceStatusAndUpdateResults = async (status: ATTENDANCE) => {
    setUserUpdating(true);
    await dispatch(recordEventAttendance(eventId, selectedUserIds, status));
    dispatch(getEvent(eventId));
    setSelectedUserIds([]);
    setUserUpdating(false);
  };

  function filterOnSurname(booking: DetailedEventBookingDTO) {
    return (
      // If the family name is undefined (which can happen with Google accounts),
      // we should show it if the filter is empty, otherwise attendance can't be marked
      (booking.userBooked?.familyName === undefined && familyNameFilter === "") ||
      booking.userBooked?.familyName?.toLocaleLowerCase().includes(familyNameFilter.toLocaleLowerCase())
    );
  }

  let canRecordAttendance = false;
  if (selectedEvent?.date) {
    const morningOfEvent = new Date(selectedEvent.date);
    morningOfEvent.setUTCHours(0, 0);
    canRecordAttendance = morningOfEvent <= new Date();
  }

  const sortBooking = (predicate: string) => {
    setSortPredicate(predicate);
    setReverse(!reverse);
  };

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
          <CardTitle className="d-flex" data-testid="record-attendance-controls">
            <h4 className="pl-1 pr-3 pt-1">Selected ({selectedUserIds.length})</h4>
            <UncontrolledButtonDropdown>
              <DropdownToggle caret disabled={userUpdating} color="primary">
                Mark Attendance
              </DropdownToggle>
              <DropdownMenu data-testid="modify-booking-options">
                <DropdownItem header>Update selected users booking status to:</DropdownItem>
                {[ATTENDANCE.ATTENDED, ATTENDANCE.ABSENT].map((status) => (
                  <DropdownItem
                    key={status}
                    disabled={selectedUserIds.length === 0}
                    onClick={() => modifyAttendanceStatusAndUpdateResults(status)}
                  >
                    {status === ATTENDANCE.ATTENDED ? "ATTENDED" : "ABSENT"}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </UncontrolledButtonDropdown>
          </CardTitle>
          <div className="overflow-auto">
            <Table bordered className="mb-0 bg-white table-sm table-hover" data-testid="record-attendance-table">
              <thead>
                <tr>
                  <th className="align-middle">
                    <Button onClick={selectAllToggle} color="link" data-testid="select-all-toggle">
                      Select
                    </Button>
                  </th>
                  <AttendanceHeaderButton onClick={() => sortBooking("bookingStatus")}>
                    Attendance
                  </AttendanceHeaderButton>
                  <th className="align-middle" style={{ minWidth: "140px" }}>
                    <Button color="link" onClick={() => sortBooking("userBooked.familyName")}>
                      Name
                    </Button>
                    <Input
                      type="text"
                      className="py-2"
                      value={familyNameFilter}
                      onChange={(e) => setFamilyNameFilter(e.target.value)}
                      placeholder="Surname filter"
                    />
                  </th>
                  <th className="align-middle">Job / year group</th>
                  <th className="align-middle">School</th>
                  <th className="align-middle">Account type</th>
                  <AttendanceHeaderButton onClick={() => sortBooking("userBooked.email")}>Email</AttendanceHeaderButton>
                  <AttendanceHeaderButton onClick={() => sortBooking("bookingDate")}>
                    Booking created
                  </AttendanceHeaderButton>
                  <AttendanceHeaderButton onClick={() => sortBooking("updated")}>
                    Booking updated
                  </AttendanceHeaderButton>
                </tr>
              </thead>
              <tbody>
                {bookings
                  .sort(sortOnPredicateAndReverse(sortPredicate, reverse))
                  .filter(filterOnSurname)
                  .map((booking) => {
                    const userBooked = booking.userBooked as UserSummaryWithEmailAddressAndGenderDTO;
                    const additionalInformation = booking.additionalInformation;
                    const userSchool = booking.userBooked && userIdToSchoolMapping[booking.userBooked.id as number];

                    return (
                      <tr key={booking.bookingId}>
                        <td className="align-middle" key={booking.userBooked?.id}>
                          <Input
                            type="checkbox"
                            className="m-0 position-relative"
                            checked={
                              (booking.userBooked?.id && selectedUserIds.includes(booking.userBooked.id)) || false
                            }
                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                              booking.userBooked?.id &&
                                updateUserSelection(booking.userBooked.id, event.target.checked);
                            }}
                          />
                        </td>
                        <td className="align-middle text-center">{displayAttendanceAsSymbol(booking.bookingStatus)}</td>
                        <td className="align-middle">
                          {userBooked.familyName}, {userBooked.givenName}
                        </td>
                        <td className="align-middle">
                          {additionalInformation?.jobTitle ?? additionalInformation?.yearGroup ?? ""}
                        </td>
                        {!userSchool?.urn && <td className="align-middle">{userSchool?.name ?? ""}</td>}
                        {userSchool?.urn && <td className="align-middle">{userSchool.name}</td>}
                        <td className="align-middle">{userBooked.role}</td>
                        <td className="align-middle">{userBooked.email}</td>
                        <td className="align-middle">
                          <DateString>{booking.bookingDate}</DateString>
                        </td>
                        <td className="align-middle">
                          <DateString>{booking.updated}</DateString>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </Table>
          </div>
        </Accordion>
      )}
    </React.Fragment>
  );
};
