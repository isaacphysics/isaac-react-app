import React, { PropsWithChildren, useEffect, useState } from "react";
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
import { BookingStatus, DetailedEventBookingDTO } from "../../../../IsaacApiTypes";
import { DateString } from "../DateString";
import { Button, ButtonDropdown, DropdownItem, DropdownMenu, DropdownToggle, Table } from "reactstrap";

const BookingHeaderButton = ({ sort, children }: PropsWithChildren<{ sort: () => void }>) => (
  <th>
    <Button color="link" onClick={sort}>
      {children}
    </Button>
  </th>
);

const BookingHeaderRow = ({ sort }: { sort: (predicate: string) => () => void }) => {
  const headers = [
    { type: "th", label: "Actions" },
    { type: "button", key: "userBooked.familyName", label: "Name" },
    { type: "button", key: "userBooked.email", label: "Email" },
    { type: "button", key: "userBooked.role", label: "Account type" },
    { type: "button", key: "schoolName", label: "School" },
    { type: "th", label: "Job / Year Group" },
    { type: "button", key: "bookingStatus", label: "Booking status" },
    { type: "th", label: "Gender" },
    { type: "button", key: "bookingDate", label: "Booking created" },
    { type: "button", key: "updated", label: "Booking updated" },
    { type: "th", style: { minWidth: "70px" }, label: "Stage" },
    { type: "th", style: { minWidth: "100px" }, label: "Exam board" },
    { type: "button", key: "reservedById", label: "Reserved by ID" },
    { type: "th", label: "Accessibility requirements" },
    { type: "th", style: { minWidth: "120px" }, label: "Dietary requirements" },
    { type: "th", label: "Emergency name" },
    { type: "th", label: "Emergency telephone" },
  ];

  return (
    <tr>
      {headers.map((header) => {
        if (header.type === "button" && header.key) {
          return (
            <BookingHeaderButton key={header.key} sort={sort(header.key)}>
              {header.label}
            </BookingHeaderButton>
          );
        } else {
          const key = `${header.label}_${header.type}`;
          return (
            <th key={key} style={header.style}>
              {header.label === "Job / Year Group" ? (
                <>
                  Job / <span className="text-nowrap">Year Group</span>
                </>
              ) : (
                header.label
              )}
            </th>
          );
        }
      })}
    </tr>
  );
};

const UserBookingRow = ({
  booking,
  eventBookingId,
  user,
}: {
  booking: DetailedEventBookingDTO & {
    schoolName?: string;
  };
  eventBookingId: string;
  user: PotentialUser;
}) => {
  const dispatch = useAppDispatch();
  const userId = booking.userBooked?.id;
  return (
    <tr>
      <td>
        {["WAITING_LIST", "CANCELLED"].includes(booking.bookingStatus as string) && (
          <Button
            color="success"
            outline
            block
            className="btn-sm mb-1"
            onClick={() => dispatch(promoteUserBooking(eventBookingId, userId))}
          >
            Promote
          </Button>
        )}
        {["WAITING_LIST", "CONFIRMED"].includes(booking.bookingStatus as string) && (
          <Button
            color="primary"
            outline
            block
            className="btn-sm mb-1 primary-button-hover"
            onClick={() => dispatch(cancelUserBooking(eventBookingId, userId))}
          >
            Cancel
          </Button>
        )}
        {isAdmin(user) && (
          <Button
            color="danger"
            outline
            block
            className="btn-sm mb-1"
            onClick={() => dispatch(deleteUserBooking(eventBookingId, userId))}
          >
            Delete
          </Button>
        )}
        <Button
          color="success"
          outline
          block
          className="btn-sm mb-1"
          onClick={() => dispatch(resendUserConfirmationEmail(eventBookingId, userId))}
        >
          Resend email
        </Button>
      </td>
      <td className="text-nowrap">
        {booking.userBooked && (
          <React.Fragment>
            {booking.userBooked.familyName}, {booking.userBooked.givenName}
          </React.Fragment>
        )}
      </td>
      <td className="py-2 text-nowrap">{booking.userBooked?.email}</td>
      <td>{booking.userBooked?.role}</td>
      <td style={{ minWidth: "200px" }}>{booking.schoolName}</td>
      <td>
        {booking.additionalInformation &&
          (booking.additionalInformation.jobTitle
            ? booking.additionalInformation.jobTitle
            : booking.additionalInformation.yearGroup)}
      </td>
      <td>{booking.bookingStatus}</td>
      <td>{booking.userBooked?.gender}</td>
      <td>
        <DateString>{booking.bookingDate}</DateString>
      </td>
      <td>
        <DateString>{booking.updated}</DateString>
      </td>
      <td>
        {Array.from(new Set(booking.userBooked?.registeredContexts?.map((rc) => stageLabelMap[rc.stage!]))).join(", ")}
      </td>
      <td>
        {Array.from(
          new Set(booking.userBooked?.registeredContexts?.map((rc) => examBoardLabelMap[rc.examBoard!])),
        ).join(", ")}
      </td>
      <td>{booking.reservedById || "-"}</td>
      <td>{booking.additionalInformation?.accessibilityRequirements}</td>
      <td>{booking.additionalInformation?.dietaryRequirements}</td>
      <td className=" text-nowrap">{booking.additionalInformation?.emergencyName}</td>
      <td className=" text-nowrap">{booking.additionalInformation?.emergencyNumber}</td>
    </tr>
  );
};

const EmailOrExport = ({
  augmentedEventBookings,
  dropdownOpen,
  toggle,
  eventBookingId,
}: {
  augmentedEventBookings: (DetailedEventBookingDTO & { schoolName?: string })[];
  dropdownOpen: boolean;
  toggle: () => void;
  eventBookingId: string;
}) => {
  const dispatch = useAppDispatch();

  function relevantUsers(bookingType: string) {
    const idsToReturn: number[] = [];
    augmentedEventBookings.map((booking: DetailedEventBookingDTO & { schoolName?: string }) => {
      if (booking.userBooked?.id && booking.bookingStatus == bookingType) {
        idsToReturn.push(booking.userBooked.id);
      }
    });
    return idsToReturn;
  }

  return (
    <div className="mt-3 text-right">
      <ButtonDropdown isOpen={dropdownOpen} toggle={toggle}>
        <DropdownToggle caret color="primary" outline className="mr-3 mt-1">
          Email Users
        </DropdownToggle>
        <DropdownMenu>
          {Object.keys(bookingStatusMap).map((key, index) => {
            const usersWithStatus = relevantUsers(key);
            if (atLeastOne(usersWithStatus.length)) {
              return (
                <DropdownItem
                  key={`${Object.keys(bookingStatusMap)[index]}-email`}
                  onClick={() => dispatch(showGroupEmailModal(usersWithStatus))}
                >
                  Email {bookingStatusMap[key as BookingStatus]} users
                </DropdownItem>
              );
            }
          })}
        </DropdownMenu>
      </ButtonDropdown>
      <Button
        color="primary"
        outline
        className="btn-md mt-1"
        href={`${API_PATH}/events/${eventBookingId}/bookings/download`}
        onClick={() => dispatch(getEventBookingCSV(eventBookingId))}
      >
        Export as CSV
      </Button>
    </div>
  );
};

export const ManageExistingBookings = ({ user, eventBookingId }: { user: PotentialUser; eventBookingId: string }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(getEventBookings(eventBookingId));
  }, [dispatch, eventBookingId]);

  const eventBookings = useAppSelector(selectors.events.eventBookings);
  const userIdToSchoolMapping = useAppSelector(selectors.admin.userSchoolLookup) || {};

  const [sortPredicate, setSortPredicate] = useState("date");
  const [reverse, setReverse] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggle = () => setDropdownOpen(!dropdownOpen);

  const setSortPredicateAndDirection = (predicate: string) => () => {
    setSortPredicate(predicate);
    setReverse(!reverse);
  };

  const augmentedEventBookings = eventBookings.map((booking: DetailedEventBookingDTO & { schoolName?: string }) => {
    if (booking.userBooked?.id) {
      const schoolDetails = userIdToSchoolMapping[booking.userBooked.id];
      booking.schoolName = schoolDetails ? schoolDetails.name : "UNKNOWN";
    }
    return booking;
  });

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
            <Table bordered className="mb-0 bg-white table-hover table-sm">
              <thead>
                <BookingHeaderRow sort={setSortPredicateAndDirection} />
              </thead>
              <tbody>
                {augmentedEventBookings.sort(sortOnPredicateAndReverse(sortPredicate, reverse)).map((booking) => (
                  <UserBookingRow
                    key={booking.bookingId}
                    booking={booking}
                    eventBookingId={eventBookingId}
                    user={user}
                  />
                ))}
              </tbody>
            </Table>
          </div>
          <EmailOrExport
            augmentedEventBookings={augmentedEventBookings}
            eventBookingId={eventBookingId}
            dropdownOpen={dropdownOpen}
            toggle={toggle}
          />
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
