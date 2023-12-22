import React, { PropsWithChildren, useEffect, useState } from "react";
import * as RS from "reactstrap";
import { Accordion } from "../Accordion";
import {
  cancelUserBooking,
  deleteUserBooking,
  getEventBookingCSV,
  getEventBookings,
  promoteUserBooking,
  resendUserConfirmationEmail,
  selectors,
  showGroupEmailModal,
  useAppDispatch,
  useAppSelector,
} from "../../../state";
import {
  API_PATH,
  atLeastOne,
  bookingStatusMap,
  examBoardLabelMap,
  isAdmin,
  isEventLeader,
  sortOnPredicateAndReverse,
  stageLabelMap,
  zeroOrLess,
} from "../../../services";
import { PotentialUser } from "../../../../IsaacAppTypes";
import { BookingStatus, EventBookingDTO } from "../../../../IsaacApiTypes";
import { DateString } from "../DateString";

export const ManageExistingBookings = ({ user, eventBookingId }: { user: PotentialUser; eventBookingId: string }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getEventBookings(eventBookingId));
  }, [dispatch, eventBookingId]);

  const eventBookings = useAppSelector(selectors.events.eventBookings);
  const userIdToSchoolMapping = useAppSelector(selectors.admin.userSchoolLookup) || {};

  const [sortPredicate, setSortPredicate] = useState("date");
  const [reverse, setReverse] = useState(true);
  const [dropdownOpen, setOpen] = useState(false);

  const toggle = () => setOpen(!dropdownOpen);

  const setSortPredicateAndDirection = (predicate: string) => () => {
    setSortPredicate(predicate);
    setReverse(!reverse);
  };

  const augmentedEventBookings = eventBookings.map((booking: EventBookingDTO & { schoolName?: string }) => {
    if (booking.userBooked && booking.userBooked.id) {
      const schoolDetails = userIdToSchoolMapping[booking.userBooked.id];
      booking.schoolName = schoolDetails ? schoolDetails.name : "UNKNOWN";
    }
    return booking;
  });

  function relevantUsers(bookingType: string) {
    const idsToReturn: number[] = [];
    augmentedEventBookings.map((booking: EventBookingDTO & { schoolName?: string }) => {
      if (booking.userBooked?.id && booking.bookingStatus == bookingType) {
        idsToReturn.push(booking.userBooked.id);
      }
    });
    return idsToReturn;
  }

  const BookingHeaderButton = ({ sort, children }: PropsWithChildren<{ sort: string }>) => {
    return (
      <th>
        <RS.Button color="link" onClick={setSortPredicateAndDirection(sort)}>
          {children}
        </RS.Button>
      </th>
    );
  };

  return (
    <Accordion trustedTitle="Manage current bookings">
      {isEventLeader(user) && (
        <div className="bg-grey p-2 mb-3 text-center">
          As an event leader, you are only able to see the bookings of users who have granted you access to their data.
        </div>
      )}

      {atLeastOne(eventBookings.length) && (
        <div>
          <div className="overflow-auto">
            <RS.Table bordered className="mb-0 bg-white table-hover table-sm">
              <thead>
                <tr>
                  <th>Actions</th>
                  <BookingHeaderButton sort="userBooked.familyName">Name</BookingHeaderButton>
                  <BookingHeaderButton sort="userBooked.email">Email</BookingHeaderButton>
                  <BookingHeaderButton sort="userBooked.role">Account type</BookingHeaderButton>
                  <BookingHeaderButton sort="schoolName">School</BookingHeaderButton>
                  <th>
                    Job / <span className="text-nowrap">Year Group</span>
                  </th>
                  <BookingHeaderButton sort="bookingStatus">Booking status</BookingHeaderButton>
                  <th>Gender</th>
                  <BookingHeaderButton sort="bookingDate">Booking created</BookingHeaderButton>
                  <BookingHeaderButton sort="updated">Booking updated</BookingHeaderButton>
                  <th style={{ minWidth: "70px" }}>Stage</th>
                  <th style={{ minWidth: "100px" }}>Exam board</th>
                  <BookingHeaderButton sort="reservedById">Reserved by ID</BookingHeaderButton>
                  <th>Accessibility requirements</th>
                  <th style={{ minWidth: "120px" }}>Medical / Dietary</th>
                  <th>Emergency name</th>
                  <th>Emergency telephone</th>
                </tr>
              </thead>
              <tbody>
                {augmentedEventBookings.sort(sortOnPredicateAndReverse(sortPredicate, reverse)).map((booking) => {
                  const userId = booking.userBooked && booking.userBooked.id;
                  return (
                    <tr key={booking.bookingId}>
                      <td>
                        {["WAITING_LIST", "CANCELLED"].includes(booking.bookingStatus as string) && (
                          <RS.Button
                            color="success"
                            outline
                            block
                            className="btn-sm mb-1"
                            onClick={() => dispatch(promoteUserBooking(eventBookingId, userId))}
                          >
                            Promote
                          </RS.Button>
                        )}
                        {["WAITING_LIST", "CONFIRMED"].includes(booking.bookingStatus as string) && (
                          <RS.Button
                            color="primary"
                            outline
                            block
                            className="btn-sm mb-1 primary-button-hover"
                            onClick={() => dispatch(cancelUserBooking(eventBookingId, userId))}
                          >
                            Cancel
                          </RS.Button>
                        )}
                        {isAdmin(user) && (
                          <RS.Button
                            color="danger"
                            outline
                            block
                            className="btn-sm mb-1"
                            onClick={() => dispatch(deleteUserBooking(eventBookingId, userId))}
                          >
                            Delete
                          </RS.Button>
                        )}
                        <RS.Button
                          color="success"
                          outline
                          block
                          className="btn-sm mb-1"
                          onClick={() => dispatch(resendUserConfirmationEmail(eventBookingId, userId))}
                        >
                          Resend email
                        </RS.Button>
                      </td>
                      <td className="text-nowrap">
                        {booking.userBooked && (
                          <React.Fragment>
                            {booking.userBooked.familyName}, {booking.userBooked.givenName}
                          </React.Fragment>
                        )}
                      </td>
                      <td className="py-2 text-nowrap">{booking.userBooked && booking.userBooked.email}</td>
                      <td>{booking.userBooked && booking.userBooked.role}</td>
                      {/*TODO When full stats functionality works <Link to={`/admin/stats/schools/${userSchool.urn}/user_list`}>{userSchool.name}</Link>*/}
                      <td style={{ minWidth: "200px" }}>{booking.schoolName}</td>
                      <td>
                        {booking.additionalInformation &&
                          (booking.additionalInformation.jobTitle
                            ? booking.additionalInformation.jobTitle
                            : booking.additionalInformation.yearGroup)}
                      </td>
                      <td>{booking.bookingStatus}</td>
                      <td>{booking.userBooked && booking.userBooked.gender}</td>
                      <td>
                        <DateString>{booking.bookingDate}</DateString>
                      </td>
                      <td>
                        <DateString>{booking.updated}</DateString>
                      </td>
                      <td>
                        {Array.from(
                          new Set(booking.userBooked?.registeredContexts?.map((rc) => stageLabelMap[rc.stage!])),
                        ).join(", ")}
                      </td>
                      <td>
                        {Array.from(
                          new Set(
                            booking.userBooked?.registeredContexts?.map((rc) => examBoardLabelMap[rc.examBoard!]),
                          ),
                        ).join(", ")}
                      </td>
                      <td>{booking.reservedById || "-"}</td>
                      <td>
                        {booking.additionalInformation && booking.additionalInformation.accessibilityRequirements}
                      </td>
                      <td>{booking.additionalInformation && booking.additionalInformation.medicalRequirements}</td>
                      <td className=" text-nowrap">
                        {booking.additionalInformation && booking.additionalInformation.emergencyName}
                      </td>
                      <td className=" text-nowrap">
                        {booking.additionalInformation && booking.additionalInformation.emergencyNumber}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </RS.Table>
          </div>

          <div className="mt-3 text-right">
            <RS.ButtonDropdown isOpen={dropdownOpen} toggle={toggle}>
              <RS.DropdownToggle caret color="primary" outline className="mr-3 mt-1">
                Email Users
              </RS.DropdownToggle>
              <RS.DropdownMenu>
                {Object.keys(bookingStatusMap).map((key, index) => {
                  const usersWithStatus = relevantUsers(key);
                  if (atLeastOne(usersWithStatus.length)) {
                    return (
                      <RS.DropdownItem key={index} onClick={() => dispatch(showGroupEmailModal(usersWithStatus))}>
                        Email {bookingStatusMap[key as BookingStatus]} users
                      </RS.DropdownItem>
                    );
                  }
                })}
              </RS.DropdownMenu>
            </RS.ButtonDropdown>
            <RS.Button
              color="primary"
              outline
              className="btn-md mt-1"
              href={`${API_PATH}/events/${eventBookingId}/bookings/download`}
              onClick={() => dispatch(getEventBookingCSV(eventBookingId))}
            >
              Export as CSV
            </RS.Button>
          </div>
        </div>
      )}

      {zeroOrLess(eventBookings.length) && (
        <p className="text-center m-0">
          <strong>There aren&apos;t currently any bookings for this event.</strong>
        </p>
      )}
    </Accordion>
  );
};
