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
import {isAdmin, isEventsLeader} from "../../../services/user";
import {UserSummaryWithEmailAddressDTO} from "../../../../IsaacApiTypes";
import {DateString} from "../DateString";
import {sortOnPredicateAndReverse} from "../../../services/sorting";

export const ManageExistingBookings = ({user, eventBookingId}: {user: LoggedInUser; eventBookingId: string}) => {
    const dispatch = useDispatch();
    useEffect(() => {dispatch(getEventBookings(eventBookingId))}, [eventBookingId]);
    const eventBookings = useSelector((state: AppState) => state && state.eventBookings || []);
    const userIdToSchoolMapping = useSelector((state: AppState) => state && state.userSchoolLookup || {});

    const [sortPredicate, setSortPredicate] = useState("date");
    const [reverse, setReverse] = useState(true);

    return <Accordion trustedTitle="Manage current bookings">
        {isEventsLeader(user) && <div className="bg-grey p-2 mb-3 text-center">
            As an event leader, you are only able to see the bookings of users who have granted you access to their data.
        </div>}
        {atLeastOne(eventBookings.length) && <div className="overflow-auto">
            <RS.Table bordered className="mb-0 bg-white">
                <thead>
                    <tr>
                        <th className="align-middle text-center">
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
                            Booking updated
                        </RS.Button></th>
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
                    {eventBookings
                        .sort(sortOnPredicateAndReverse(sortPredicate, reverse))
                        .map(booking => {
                            const userSchool = booking.userBooked && userIdToSchoolMapping[booking.userBooked.id as number];
                            const userId = booking.userBooked && booking.userBooked.id;
                            return <tr key={booking.bookingId}>
                                <td className="align-middle">
                                    {(booking.bookingStatus == 'WAITING_LIST' || booking.bookingStatus == 'CANCELLED') &&
                                        <RS.Button color="primary" outline block className="btn-sm mb-1" onClick={() => dispatch(promoteUserFromWaitingList(eventBookingId, userId))}>
                                            Promote
                                        </RS.Button>
                                    }
                                    {(booking.bookingStatus == 'WAITING_LIST' || booking.bookingStatus == 'CONFIRMED') &&
                                        <RS.Button color="primary" outline block className="btn-sm mb-1" onClick={() => dispatch(cancelUserBooking(eventBookingId, userId))}>
                                            Cancel
                                        </RS.Button>
                                    }
                                    {isAdmin(user) && <RS.Button color="primary" outline block className="btn-sm mb-1" onClick={() => dispatch(deleteUserBooking(eventBookingId, userId))}>
                                        Delete
                                    </RS.Button>}
                                    <RS.Button color="primary" outline block className="btn-sm mb-1" onClick={() => dispatch(resendUserConfirmationEmail(eventBookingId, userId))}>
                                        Resend email
                                    </RS.Button>
                                </td>
                                <td className="align-middle text-center">
                                    {booking.userBooked && <React.Fragment>{booking.userBooked.familyName}, {booking.userBooked.givenName}</React.Fragment>}
                                </td>
                                <td className="align-middle">{booking.userBooked && (booking.userBooked as UserSummaryWithEmailAddressDTO).email}</td>
                                <td className="align-middle">{booking.userBooked && booking.userBooked.role}</td>
                                {(userSchool === undefined || !userSchool.urn) && <td className="align-middle">
                                    {userSchool && userSchool.name}
                                </td>}
                                {userSchool && userSchool.urn !== undefined && <td className="align-middle">
                                    {/*TODO When full stats functionality works <Link to={`/admin/stats/schools/${userSchool.urn}/user_list`}>{userSchool.name}</Link>*/}
                                    {userSchool.name}
                                </td>}
                                <td className="align-middle">
                                    {booking.additionalInformation && (booking.additionalInformation.jobTitle ? booking.additionalInformation.jobTitle : booking.additionalInformation.yearGroup)}
                                </td>
                                <td className="align-middle">{booking.bookingStatus}</td>
                                <td className="align-middle"><DateString>{booking.bookingDate}</DateString></td>
                                <td className="align-middle"><DateString>{booking.updated}</DateString></td>
                                <td className="align-middle">{booking.additionalInformation && booking.additionalInformation.accessibilityRequirements}</td>
                                <td className="align-middle">{booking.additionalInformation && booking.additionalInformation.medicalRequirements}</td>
                                <td className="align-middle">{booking.additionalInformation && booking.additionalInformation.emergencyName}</td>
                                <td className="align-middle">{booking.additionalInformation && booking.additionalInformation.emergencyNumber}</td>
                            </tr>
                        })
                    }
                </tbody>
            </RS.Table>
        </div>}
        {zeroOrLess(eventBookings.length) && <p className="text-center m-0">
            <strong>There aren&apos;t currently any bookings for this event.</strong>
        </p>}
    </Accordion>
};
