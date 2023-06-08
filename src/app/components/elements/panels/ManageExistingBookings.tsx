import React, {useEffect, useState} from "react";
import * as RS from "reactstrap";
import {Accordion} from "../Accordion";
import {
    AppState,
    cancelUserBooking,
    deleteUserBooking,
    getEventBookingCSV,
    getEventBookings,
    promoteUserBooking,
    resendUserConfirmationEmail,
    selectors,
    showGroupEmailModal,
    useAppDispatch,
    useAppSelector
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
    zeroOrLess
} from "../../../services";
import {PotentialUser} from "../../../../IsaacAppTypes";
import {BookingStatus, EventBookingDTO, UserSummaryWithEmailAddressDTO} from "../../../../IsaacApiTypes";
import {DateString} from "../DateString";

export const ManageExistingBookings = ({user, eventBookingId}: {user: PotentialUser; eventBookingId: string}) => {
    const dispatch = useAppDispatch();
    useEffect(() => {dispatch(getEventBookings(eventBookingId))}, [eventBookingId]);
    const eventBookings = useAppSelector((state: AppState) => state && state.eventBookings || []);
    const userIdToSchoolMapping = useAppSelector(selectors.admin.userSchoolLookup) || {};

    const [sortPredicate, setSortPredicate] = useState("date");
    const [reverse, setReverse] = useState(true);
    const [dropdownOpen, setOpen] = useState(false);

    const toggle = () => setOpen(!dropdownOpen);

    const setSortPredicateAndDirection = (predicate: string) => () => {
        setSortPredicate(predicate);
        setReverse(!reverse);
    };

    let augmentedEventBookings = eventBookings.map((booking: EventBookingDTO & {schoolName?: string}) => {
        if (booking.userBooked && booking.userBooked.id) {
            const schoolDetails = userIdToSchoolMapping[booking.userBooked.id];
            booking.schoolName = schoolDetails ? schoolDetails.name : "UNKNOWN";
        }
        return booking
    });

    function relevantUsers (bookingType: string) {
        let idsToReturn: number[] = [];
        augmentedEventBookings.map((booking: EventBookingDTO & {schoolName?: string}) => {
            if (booking.userBooked?.id && booking.bookingStatus == bookingType) {
                idsToReturn.push(booking.userBooked.id)
            }
        });
        return idsToReturn;
    }

    return <Accordion trustedTitle="Manage current bookings">
        {isEventLeader(user) && <div className="bg-grey p-2 mb-3 text-center">
            As an event leader, you are only able to see the bookings of users who have granted you access to their data.
        </div>}

        {atLeastOne(eventBookings.length) && <div>
            <div className="overflow-auto">
                <RS.Table bordered className="mb-0 bg-white">
                    <thead>
                        <tr>
                            <th className="align-middle text-center">
                                Actions
                            </th>
                            <th className="align-middle">
                                <RS.Button color="link" onClick={setSortPredicateAndDirection('userBooked.familyName')}>
                                    Name
                                </RS.Button>
                            </th>
                            <th className="align-middle">
                                <RS.Button color="link" onClick={setSortPredicateAndDirection('userBooked.email')}>
                                    Email
                                </RS.Button>
                            </th>
                            <th className="align-middle">
                                <RS.Button color="link" onClick={setSortPredicateAndDirection('userBooked.role')}>
                                    Account type
                                </RS.Button>
                            </th>
                            <th className="align-middle">
                                <RS.Button color="link" onClick={setSortPredicateAndDirection('schoolName')}>
                                    School
                                </RS.Button>
                            </th>
                            <th className="align-middle">
                                Job / year group
                            </th>
                            <th className="align-middle">
                                <RS.Button color="link" onClick={setSortPredicateAndDirection('bookingStatus')}>
                                    Booking status
                                </RS.Button>
                            </th>
                            <th className="align-middle">
                                <RS.Button color="link" onClick={setSortPredicateAndDirection('bookingDate')}>
                                    Booking created
                                </RS.Button>
                            </th>
                            <th className="align-middle">
                                <RS.Button color="link" onClick={setSortPredicateAndDirection('updated')}>
                                    Booking updated
                                </RS.Button>
                            </th>
                            <th className="align-middle">
                                Stage
                            </th>
                            <th className="align-middle">
                                Exam board
                            </th>
                            <th className="align-middle">
                                <RS.Button color="link" onClick={setSortPredicateAndDirection('reservedById')}>
                                    Reserved by ID
                                </RS.Button>
                            </th>
                            <th className="align-middle">
                                Level of teaching experience
                            </th>
                            <th className="align-middle">
                                Accessibility requirements
                            </th>
                            <th className="align-middle">
                                Medical / dietary
                            </th>
                            <th className="align-middle">
                                Emergency name
                            </th>
                            <th className="align-middle">
                                Emergency telephone
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {augmentedEventBookings
                            .sort(sortOnPredicateAndReverse(sortPredicate, reverse))
                            .map(booking => {
                                const userId = booking.userBooked && booking.userBooked.id;
                                return <tr key={booking.bookingId}>
                                    <td className="align-middle">
                                        {(['WAITING_LIST', 'CANCELLED'].includes(booking.bookingStatus as string)) &&
                                            <RS.Button color="primary" outline block className="btn-sm mb-1" onClick={() => dispatch(promoteUserBooking(eventBookingId, userId))}>
                                                Promote
                                            </RS.Button>
                                        }
                                        {(['WAITING_LIST', 'CONFIRMED'].includes(booking.bookingStatus as string)) &&
                                            <RS.Button color="primary" outline block className="btn-sm mb-1" onClick={() => dispatch(cancelUserBooking(eventBookingId, userId))}>
                                                Cancel
                                            </RS.Button>
                                        }
                                        {isAdmin(user) &&
                                            <RS.Button color="primary" outline block className="btn-sm mb-1" onClick={() => dispatch(deleteUserBooking(eventBookingId, userId))}>
                                                Delete
                                            </RS.Button>
                                        }
                                        <RS.Button color="primary" outline block className="btn-sm mb-1" onClick={() => dispatch(resendUserConfirmationEmail(eventBookingId, userId))}>
                                            Resend email
                                        </RS.Button>
                                    </td>
                                    <td className="align-middle text-center">
                                        {booking.userBooked && <React.Fragment>{booking.userBooked.familyName}, {booking.userBooked.givenName}</React.Fragment>}
                                    </td>
                                    <td className="align-middle">{booking.userBooked && (booking.userBooked as UserSummaryWithEmailAddressDTO).email}</td>
                                    <td className="align-middle">{booking.userBooked && booking.userBooked.role}</td>
                                    {/*TODO When full stats functionality works <Link to={`/admin/stats/schools/${userSchool.urn}/user_list`}>{userSchool.name}</Link>*/}
                                    <td className="align-middle">{booking.schoolName}</td>
                                    <td className="align-middle">
                                        {booking.additionalInformation && (booking.additionalInformation.jobTitle ? booking.additionalInformation.jobTitle : booking.additionalInformation.yearGroup)}
                                    </td>
                                    <td className="align-middle">{booking.bookingStatus}</td>
                                    <td className="align-middle"><DateString>{booking.bookingDate}</DateString></td>
                                    <td className="align-middle"><DateString>{booking.updated}</DateString></td>
                                    <td className="align-middle">
                                        {Array.from(new Set(booking.userBooked?.registeredContexts?.map(rc => stageLabelMap[rc.stage!]))).join(", ")}
                                    </td>
                                    <td className="align-middle">
                                        {Array.from(new Set(booking.userBooked?.registeredContexts?.map(rc => examBoardLabelMap[rc.examBoard!]))).join(", ")}
                                    </td>
                                    <td className="align-middle text-center">{booking.reservedById || "-"}</td>
                                    <td className="align-middle">{booking.additionalInformation && booking.additionalInformation.experienceLevel}</td>
                                    <td className="align-middle">{booking.additionalInformation && booking.additionalInformation.accessibilityRequirements}</td>
                                    <td className="align-middle">{booking.additionalInformation && booking.additionalInformation.medicalRequirements}</td>
                                    <td className="align-middle">{booking.additionalInformation && booking.additionalInformation.emergencyName}</td>
                                    <td className="align-middle">{booking.additionalInformation && booking.additionalInformation.emergencyNumber}</td>
                                </tr>
                            })
                        }
                    </tbody>
                </RS.Table>
            </div>

            <div className="mt-3 text-right">
                <RS.ButtonDropdown isOpen={dropdownOpen} toggle={toggle}>
                    <RS.DropdownToggle caret color="primary" outline className="mr-3 mt-1">
                        Email Users
                    </RS.DropdownToggle>
                    <RS.DropdownMenu>
                        {Object.keys(bookingStatusMap).map((key, index)  => {
                            let usersWithStatus = relevantUsers(key);
                            if (atLeastOne(usersWithStatus.length)) {
                                return <RS.DropdownItem key={index} onClick={() => dispatch(showGroupEmailModal(usersWithStatus))}>
                                    Email {bookingStatusMap[key as BookingStatus]} users
                                </RS.DropdownItem>;
                            }
                        })}
                    </RS.DropdownMenu>
                </RS.ButtonDropdown>
                <RS.Button
                    color="primary" outline className="btn-md mt-1"
                    href={`${API_PATH}/events/${eventBookingId}/bookings/download`}
                    onClick={() => dispatch(getEventBookingCSV(eventBookingId))}
                >
                    Export as CSV
                </RS.Button>
            </div>
        </div>}

        {zeroOrLess(eventBookings.length) && <p className="text-center m-0">
            <strong>There aren&apos;t currently any bookings for this event.</strong>
        </p>}
    </Accordion>
};
