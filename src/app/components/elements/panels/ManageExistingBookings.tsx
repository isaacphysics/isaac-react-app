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
import { useTranslation } from "react-i18next";

interface ManageExistingBookingsProps {
    user: PotentialUser;
    eventId: string;
    eventBookings: EventBookingDTO[];
    userIdToSchoolMapping: UserSchoolLookup;
}
export const ManageExistingBookings = ({user, eventId, eventBookings, userIdToSchoolMapping}: ManageExistingBookingsProps) => {
    const { t } = useTranslation();
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
            booking.schoolName = schoolDetails ? schoolDetails.schoolName : "UNKNOWN";
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

    return <Accordion id="manage-current-bookings" trustedTitle={t("common:events.manageBookings.title")}>
        {isEventLeader(user) && <div className="bg-grey p-2 mb-3 text-center">
            {t("common:events.manageBookings.leaderRestriction")}
        </div>}

        {eventBookings && atLeastOne(eventBookings.length) && <div>
            <div className="overflow-auto">
                <Table bordered className="mb-0 bg-white">
                    <thead>
                        <tr>
                            <th className="align-middle text-center">
                                {t("common:events.bookingsTable.actions")}
                            </th>
                            <th className="align-middle">
                                <Button color="link" onClick={setSortPredicateAndDirection('userBooked.familyName')}>
                                    {t("common:events.bookingsTable.name")}
                                </Button>
                            </th>
                            <th className="align-middle">
                                <Button color="link" onClick={setSortPredicateAndDirection('userBooked.email')}>
                                    {t("common:events.bookingsTable.email")}
                                </Button>
                            </th>
                            <th className="align-middle">
                                <Button color="link" onClick={setSortPredicateAndDirection('userBooked.role')}>
                                    {t("common:events.bookingsTable.accountType")}
                                </Button>
                            </th>
                            <th className="align-middle">
                                <Button color="link" onClick={setSortPredicateAndDirection('schoolName')}>
                                    {t("common:events.bookingsTable.school")}
                                </Button>
                            </th>
                            <th className="align-middle">
                                {t("common:events.bookingsTable.jobYearGroup")}
                            </th>
                            <th className="align-middle">
                                <Button color="link" onClick={setSortPredicateAndDirection('bookingStatus')}>
                                    {t("common:events.manageBookings.table.bookingStatus")}
                                </Button>
                            </th>
                            <th className="align-middle">
                                <Button color="link" onClick={setSortPredicateAndDirection('bookingDate')}>
                                    {t("common:events.bookingsTable.bookingCreated")}
                                </Button>
                            </th>
                            <th className="align-middle">
                                <Button color="link" onClick={setSortPredicateAndDirection('updated')}>
                                    {t("common:events.bookingsTable.bookingUpdated")}
                                </Button>
                            </th>
                            <th className="align-middle">
                                {t("common:events.manageBookings.table.stage")}
                            </th>
                            {isAda && <th className="align-middle">
                                {t("ada:events.manageBookings.table.examBoard")}
                            </th>}
                            <th className="align-middle">
                                <Button color="link" onClick={setSortPredicateAndDirection('reservedById')}>
                                    {t("common:events.manageBookings.table.reservedById")}
                                </Button>
                            </th>
                            <th className="align-middle">
                                {t("common:events.manageBookings.table.teachingExperience")}
                            </th>
                            <th className="align-middle">
                                {t("common:events.bookingsTable.accessibility")}
                            </th>
                            <th className="align-middle">
                                {t("common:events.manageBookings.table.medicalDietary")}
                            </th>
                            <th className="align-middle">
                                {t("common:events.bookingsTable.emergencyName")}
                            </th>
                            <th className="align-middle">
                                {t("common:events.bookingsTable.emergencyPhone")}
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
                                                    t("common:events.manageBookings.confirmPromote"),
                                                    () => promoteUserBooking({eventId, userId})
                                                )
                                            }>
                                                {t("common:events.manageBookings.actions.promote")}
                                            </Button>
                                        }
                                        {(['WAITING_LIST', 'CONFIRMED'].includes(booking.bookingStatus as string)) &&
                                            <Button color="keyline" block className="btn-sm mb-1" onClick={() =>
                                                confirmThen(
                                                    t("common:events.manageBookings.confirmCancel"),
                                                    () => cancelUserBooking({eventId, userId})
                                                )
                                            }>
                                                {t("common:events.manageBookings.actions.cancel")}
                                            </Button>
                                        }
                                        {isAdmin(user) &&
                                            <Button color="keyline" block className="btn-sm mb-1" onClick={() =>
                                                confirmThen(
                                                    t("common:events.manageBookings.confirmDelete"),
                                                    () => deleteUserBooking({eventId, userId})
                                                )
                                            }>
                                                {t("common:events.manageBookings.actions.delete")}
                                            </Button>
                                        }
                                        <Button color="keyline" block className="btn-sm mb-1" onClick={() =>
                                            confirmThen(
                                                t("common:events.manageBookings.confirmResendEmail"),
                                                () => resendUserConfirmationEmail({eventId, userId})
                                            )
                                        }>
                                            {t("common:events.manageBookings.actions.resendEmail")}
                                        </Button>
                                    </td>
                                    <td className="align-middle text-center">
                                        {booking.userBooked && <React.Fragment>{booking.userBooked.familyName}, {booking.userBooked.givenName}</React.Fragment>}
                                    </td>
                                    <td className="align-middle">{booking.userBooked && (booking.userBooked as UserSummaryWithEmailAddressDTO).email}</td>
                                    <td className="align-middle">{booking.userBooked && booking.userBooked.role}</td>
                                    {/*TODO When full stats functionality works <Link to={`/admin/stats/schools/${userSchool.schoolId}/user_list`}>{userSchool.name}</Link>*/}
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
                    <DropdownToggle caret color="keyline" className="me-3 mt-1">
                        {t("common:events.manageBookings.emailDropdown.toggle")}
                    </DropdownToggle>
                    <DropdownMenu>
                        {Object.keys(bookingStatusMap).map((key, index)  => {
                            const usersWithStatus = relevantUsers(key);
                            if (atLeastOne(usersWithStatus.length)) {
                                return <DropdownItem key={index} onClick={() => dispatch(showGroupEmailModal(usersWithStatus))}>
                                    {t("common:events.manageBookings.emailDropdown.item", { bookingStatus: bookingStatusMap[key as BookingStatus] })}
                                </DropdownItem>;
                            }
                        })}
                    </DropdownMenu>
                </ButtonDropdown>
                <Button
                    color="keyline" className="btn-md mt-1"
                    href={`${API_PATH}/events/${eventId}/bookings/download`}
                >
                    {t("common:events.manageBookings.exportCsv")}
                </Button>
            </div>
        </div>}

        {(!eventBookings || zeroOrLess(eventBookings.length)) && <p className="text-center m-0">
            <strong>{t("common:events.manageBookings.emptyState")}</strong>
        </p>}
    </Accordion>;
};
