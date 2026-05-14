import React, {useState} from "react";
import {Accordion} from "../Accordion";
import {
    showGroupEmailModal,
    useAppDispatch,
    useCancelUserBookingMutation,
    useDeleteUserBookingMutation,
    usePromoteUserBookingMutation,
    useResendUserConfirmationEmailMutation
} from "../../../state";
import {
    API_PATH,
    atLeastOne,
    bookingStatusMap,
    examBoardLabelMap,
    isAdmin,
    isAda,
    isEventLeader,
    sortOnPredicateAndReverse,
    stageLabelMap,
    zeroOrLess, confirmThen, isDefined
} from "../../../services";
import {PotentialUser, UserSchoolLookup} from "../../../../IsaacAppTypes";
import {BookingStatus, EventBookingDTO, UserSummaryWithEmailAddressDTO} from "../../../../IsaacApiTypes";
import {DateString} from "../DateString";
import {produce} from "immer";
import {RenderNothing} from "../RenderNothing";
import { Table, Button, ButtonDropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";
import { useTranslation } from 'react-i18next'

interface ManageExistingBookingsProps {
    user: PotentialUser;
    eventId: string;
    eventBookings: EventBookingDTO[];
    userIdToSchoolMapping: UserSchoolLookup;
}
export const ManageExistingBookings = ({user, eventId, eventBookings, userIdToSchoolMapping}: ManageExistingBookingsProps) => {
    const { t } = useTranslation()
    const dispatch = useAppDispatch();

    const [sortPredicate, setSortPredicate] = useState("date");
    const [reverse, setReverse] = useState(true);
    const [dropdownOpen, setOpen] = useState(false);

    const toggle = () => setOpen(!dropdownOpen);

    const setSortPredicateAndDirection = (predicate: string) => () => {
        setSortPredicate(predicate);
        setReverse(!reverse);
    };

    const augmentedEventBookings = eventBookings?.map(produce((booking: EventBookingDTO & {schoolName?: string}) => {
        if (booking.userBooked && booking.userBooked.id) {
            const schoolDetails = userIdToSchoolMapping?.[booking.userBooked.id];
            booking.schoolName = schoolDetails ? schoolDetails.name : t('unknown', 'UNKNOWN');
        }
        return booking;
    }));

    function relevantUsers (bookingType: string) {
        const idsToReturn: number[] = [];
        augmentedEventBookings?.map((booking: EventBookingDTO & {schoolName?: string}) => {
            if (booking.userBooked?.id && booking.bookingStatus == bookingType) {
                idsToReturn.push(booking.userBooked.id);
            }
        });
        return idsToReturn;
    }

    const [promoteUserBooking] = usePromoteUserBookingMutation();
    const [cancelUserBooking] = useCancelUserBookingMutation();
    const [deleteUserBooking] = useDeleteUserBookingMutation();
    const [resendUserConfirmationEmail] = useResendUserConfirmationEmailMutation();

    return <Accordion trustedTitle="Manage current bookings">
        {isEventLeader(user) && <div className="bg-grey p-2 mb-3 text-center">
            {t('asAnEventLeaderYouAreOnlyAbleToSeeTheBookingsOfUsersWhoHaveGrantedYouAccessToTheirData', 'As an event leader, you are only able to see the bookings of users who have granted you access to their data.')}
        </div>}

        {eventBookings && atLeastOne(eventBookings.length) && <div>
            <div className="overflow-auto">
                <Table bordered className="mb-0 bg-white">
                    <thead>
                        <tr>
                            <th className="align-middle text-center">
                                {t('actions', 'Actions')}
                            </th>
                            <th className="align-middle">
                                <Button color="link" onClick={setSortPredicateAndDirection('userBooked.familyName')}>
                                    Name
                                </Button>
                            </th>
                            <th className="align-middle">
                                <Button color="link" onClick={setSortPredicateAndDirection('userBooked.email')}>
                                    {t('email2', 'Email')}
                                </Button>
                            </th>
                            <th className="align-middle">
                                <Button color="link" onClick={setSortPredicateAndDirection('userBooked.role')}>
                                    {t('accountType', 'Account type')}
                                </Button>
                            </th>
                            <th className="align-middle">
                                <Button color="link" onClick={setSortPredicateAndDirection('schoolName')}>
                                    {t('school', 'School')}
                                </Button>
                            </th>
                            <th className="align-middle">
                                {t('jobYearGroup', 'Job / year group')}
                            </th>
                            <th className="align-middle">
                                <Button color="link" onClick={setSortPredicateAndDirection('bookingStatus')}>
                                    {t('bookingStatus', 'Booking status')}
                                </Button>
                            </th>
                            <th className="align-middle">
                                <Button color="link" onClick={setSortPredicateAndDirection('bookingDate')}>
                                    {t('bookingCreated', 'Booking created')}
                                </Button>
                            </th>
                            <th className="align-middle">
                                <Button color="link" onClick={setSortPredicateAndDirection('updated')}>
                                    {t('bookingUpdated', 'Booking updated')}
                                </Button>
                            </th>
                            <th className="align-middle">
                                {t('stage', 'Stage')}
                            </th>
                            {isAda && <th className="align-middle">
                                {t('examBoard', 'Exam board')}
                            </th>}
                            <th className="align-middle">
                                <Button color="link" onClick={setSortPredicateAndDirection('reservedById')}>
                                    {t('reservedById', 'Reserved by ID')}
                                </Button>
                            </th>
                            <th className="align-middle">
                                {t('levelOfTeachingExperience', 'Level of teaching experience')}
                            </th>
                            <th className="align-middle">
                                {t('accessibilityRequirements', 'Accessibility requirements')}
                            </th>
                            <th className="align-middle">
                                {t('medicalDietary', 'Medical / dietary')}
                            </th>
                            <th className="align-middle">
                                {t('emergencyName', 'Emergency name')}
                            </th>
                            <th className="align-middle">
                                {t('emergencyTelephone', 'Emergency telephone')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...augmentedEventBookings]?.sort(sortOnPredicateAndReverse(sortPredicate, reverse))
                            .map(booking => {
                                const userId = booking.userBooked && booking.userBooked.id;
                                return !isDefined(userId) ? RenderNothing : <tr key={booking.bookingId}>
                                    <td className="align-middle">
                                        {(['WAITING_LIST', 'CANCELLED'].includes(booking.bookingStatus as string)) &&
                                            <Button color="keyline" block className="btn-sm mb-1" onClick={() =>
                                                confirmThen(
                                                    "Are you sure you want to convert this to a confirmed booking?",
                                                    () => promoteUserBooking({eventId, userId})
                                                )
                                            }>
                                                {t('promote', 'Promote')}
                                            </Button>
                                        }
                                        {(['WAITING_LIST', 'CONFIRMED'].includes(booking.bookingStatus as string)) &&
                                            <Button color="keyline" block className="btn-sm mb-1" onClick={() =>
                                                confirmThen(
                                                    "Are you sure you want to cancel this booking?",
                                                    () => cancelUserBooking({eventId, userId})
                                                )
                                            }>
                                                {t('cancel', 'Cancel')}
                                            </Button>
                                        }
                                        {isAdmin(user) &&
                                            <Button color="keyline" block className="btn-sm mb-1" onClick={() =>
                                                confirmThen(
                                                    "Are you sure you want to delete this booking permanently?",
                                                    () => deleteUserBooking({eventId, userId})
                                                )
                                            }>
                                                {t('delete', 'Delete')}
                                            </Button>
                                        }
                                        <Button color="keyline" block className="btn-sm mb-1" onClick={() =>
                                            confirmThen(
                                                "Are you sure you want to resend the confirmation email for this booking?",
                                                () => resendUserConfirmationEmail({eventId, userId})
                                            )
                                        }>
                                            {t('resendEmail', 'Resend email')}
                                        </Button>
                                    </td>
                                    <td className="align-middle text-center">
                                        {booking.userBooked && <React.Fragment>{t('familynameGivenname', '{{familyName}}, {{givenName}}', { familyName: booking.userBooked.familyName, givenName: booking.userBooked.givenName })}</React.Fragment>}
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
                                    {isAda && <td className="align-middle">
                                        {Array.from(new Set(booking.userBooked?.registeredContexts?.map(rc => examBoardLabelMap[rc.examBoard!]))).join(", ")}
                                    </td>}
                                    <td className="align-middle text-center">{booking.reservedById || "-"}</td>
                                    <td className="align-middle">{booking.additionalInformation && booking.additionalInformation.experienceLevel}</td>
                                    <td className="align-middle">{booking.additionalInformation && booking.additionalInformation.accessibilityRequirements}</td>
                                    <td className="align-middle">{booking.additionalInformation && booking.additionalInformation.medicalRequirements}</td>
                                    <td className="align-middle">{booking.additionalInformation && booking.additionalInformation.emergencyName}</td>
                                    <td className="align-middle">{booking.additionalInformation && booking.additionalInformation.emergencyNumber}</td>
                                </tr>;
                            })
                        }
                    </tbody>
                </Table>
            </div>

            <div className="mt-3 text-end">
                <ButtonDropdown isOpen={dropdownOpen} toggle={toggle}>
                    <DropdownToggle caret color="primary" outline className="me-3 mt-1">
                        {t('emailUsers2', 'Email Users')}
                    </DropdownToggle>
                    <DropdownMenu>
                        {Object.keys(bookingStatusMap).map((key, index)  => {
                            const usersWithStatus = relevantUsers(key);
                            if (atLeastOne(usersWithStatus.length)) {
                                return <DropdownItem key={index} onClick={() => dispatch(showGroupEmailModal(usersWithStatus))}>
                                    {t('email2', 'Email')} {bookingStatusMap[key as BookingStatus]} users
                                </DropdownItem>;
                            }
                        })}
                    </DropdownMenu>
                </ButtonDropdown>
                <Button
                    color="keyline" className="btn-md mt-1"
                    href={`${API_PATH}/events/${eventId}/bookings/download`}
                >
                    {t('exportAsCsv', 'Export as CSV')}
                </Button>
            </div>
        </div>}

        {(!eventBookings || zeroOrLess(eventBookings.length)) && <p className="text-center m-0">
            <strong>{t('thereArenapostCurrentlyAnyBookingsForThisEvent', 'There aren&apos;t currently any bookings for this event.')}</strong>
        </p>}
    </Accordion>;
};
