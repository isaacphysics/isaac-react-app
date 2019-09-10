import React, {useEffect, useState} from "react";
import * as RS from "reactstrap";
import {Accordion} from "../Accordion";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../../../state/reducers";
import {atLeastOne, zeroOrLess} from "../../../services/validation";
import {
    cancelUserBooking,
    deleteUserBooking,
    getEventBookings,
    promoteUserFromWaitingList,
    resendUserConfirmationEmail
} from "../../../state/actions";
import {LoggedInUser} from "../../../../IsaacAppTypes";
import {isAdmin} from "../../../services/user";
import {UserSummaryWithEmailAddressDTO} from "../../../../IsaacApiTypes";
import {DateString} from "../DateString";

export const ManageExistingBookingsPanel = ({user, eventBookingId}: {user: LoggedInUser; eventBookingId: string}) => {
    const dispatch = useDispatch();
    useEffect(() => {dispatch(getEventBookings(eventBookingId))}, [eventBookingId]);
    const eventBookings = useSelector((state: AppState) => state && state.eventBookings || []);
    const userIdToSchoolMapping = useSelector((state: AppState) => state && state.userSchoolLookup || {});

    const [sortPredicate, setSortPredicate] = useState("date");
    const [reverse, setReverse] = useState(true);
    // TODO handle "." in predicates
    function sortOnPredicateAndReverse(a: object, b: object) {
        // @ts-ignore
        if (a[sortPredicate] < b[sortPredicate]) {return reverse ? 1 : -1;}
        // @ts-ignore
        else if (a[sortPredicate] > b[sortPredicate]) {return reverse ? -1 : 1;}
        else {return 0;}
    }

    return <Accordion title="Manage current bookings">
        {atLeastOne(eventBookings.length) && <div className="overflow-auto">
            <RS.Table bordered className="mb-0">
                <thead>
                    <tr>
                        <th className="align-middle">
                            Actions
                        </th>
                        <th className="align-middle"><RS.Button color="link" onClick={() => {setSortPredicate('userBooked.familyName'); setReverse(!reverse);}}>
                            Name
                        </RS.Button></th>
                        <th className="align-middle"><RS.Button color="link" onClick={() => {setSortPredicate('userBooked.email'); setReverse(!reverse);}}>
                            Email
                        </RS.Button></th>
                        <th className="align-middle">
                            Account type
                        </th>
                        <th className="align-middle">
                            School
                        </th>
                        <th className="align-middle">
                            Job / year group
                        </th>
                        <th className="align-middle"><RS.Button color="link" onClick={() => {setSortPredicate('bookingStatus'); setReverse(!reverse);}}>
                            Booking status
                        </RS.Button></th>
                        <th className="align-middle"><RS.Button color="link" onClick={() => {setSortPredicate('bookingDate'); setReverse(!reverse);}}>
                            Booking created
                        </RS.Button></th>
                        <th className="align-middle"><RS.Button color="link" onClick={() => {setSortPredicate('updated'); setReverse(!reverse);}}>
                            Booking Updated
                        </RS.Button></th>
                        <th className="align-middle">
                            Accessibility Requirements
                        </th>
                        <th className="align-middle">
                            Medical Requirements
                        </th>
                        <th className="align-middle">
                            Emergency Name
                        </th>
                        <th className="align-middle">
                            Emergency Telephone
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {eventBookings.sort(sortOnPredicateAndReverse).map(booking => {
                        const userSchool = booking.userBooked && userIdToSchoolMapping[booking.userBooked.id as number];
                        const userId = booking.userBooked && booking.userBooked.id;
                        return <tr key={booking.bookingId}>
                            <td>
                                {(booking.bookingStatus == 'WAITING_LIST' || booking.bookingStatus == 'CANCELLED') && <RS.Button
                                    color="tertiary" block className="btn-sm mb-1" onClick={() => dispatch(promoteUserFromWaitingList(eventBookingId, userId))}
                                >
                                    Promote
                                </RS.Button>}
                                {(booking.bookingStatus == 'WAITING_LIST' || booking.bookingStatus == 'CONFIRMED') && <RS.Button
                                    color="tertiary" block className="btn-sm mb-1" onClick={() => dispatch(cancelUserBooking(eventBookingId, userId))}
                                >
                                    Cancel
                                </RS.Button>}
                                {isAdmin(user) && <RS.Button
                                    color="tertiary" block className="btn-sm mb-1" onClick={() => dispatch(deleteUserBooking(eventBookingId, userId))}
                                >
                                    Delete
                                </RS.Button>}
                                <RS.Button color="tertiary" block className="btn-sm mb-1" onClick={() => dispatch(resendUserConfirmationEmail(eventBookingId, userId))}>
                                    Resend Email
                                </RS.Button>
                            </td>
                            <td>{booking.userBooked && <React.Fragment>{booking.userBooked.familyName}, {booking.userBooked.givenName}</React.Fragment>}</td>
                            <td>{booking.userBooked && (booking.userBooked as UserSummaryWithEmailAddressDTO).email}</td>
                            <td>{booking.userBooked && booking.userBooked.role}</td>
                            {(userSchool === undefined || !userSchool.urn) && <td>{userSchool && userSchool.name}</td>}
                            {userSchool && userSchool.urn !== undefined && <td>
                                {/*TODO When full stats functionality works <Link to={`/admin/stats/schools/${userSchool.urn}/user_list`}>{userSchool.name}</Link>*/}
                                {userSchool.name}
                            </td>}
                            <td>
                                {booking.additionalInformation && (booking.additionalInformation.jobTitle ? booking.additionalInformation.jobTitle : booking.additionalInformation.yearGroup)}
                            </td>
                            <td>{booking.bookingStatus}</td>
                            <td><DateString>{booking.bookingDate}</DateString></td>
                            <td><DateString>{booking.updated}</DateString></td>
                            <td>{booking.additionalInformation && booking.additionalInformation.accessibilityRequirements}</td>
                            <td>{booking.additionalInformation && booking.additionalInformation.medicalRequirements}</td>
                            <td>{booking.additionalInformation && booking.additionalInformation.emergencyName}</td>
                            <td>{booking.additionalInformation && booking.additionalInformation.emergencyNumber}</td>
                        </tr>
                    })}
                </tbody>
            </RS.Table>
        </div>}
        {zeroOrLess(eventBookings.length) && <p className="text-center m-0">
            <strong>There aren&apos;t currently any bookings for this event.</strong>
        </p>}
    </Accordion>
};
