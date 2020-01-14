import React, { useEffect, useState } from "react";
import { connect, useDispatch, useSelector } from "react-redux";
import { closeActiveModal, loadGroups, selectGroup, getGroupMembers, getEventBookingsForGroup, reserveUsersOnEvent, cancelUserBooking } from "../../../state/actions";
import { store } from "../../../state/store";
import {
    Button,
    Col,
    CustomInput,
    Row,
    Table
} from "reactstrap";
import { RegisteredUserDTO, UserGroupDTO } from "../../../../IsaacApiTypes";
import { AppState } from "../../../state/reducers";
import { groups } from '../../../state/selectors';
import { ShowLoading } from "../../handlers/ShowLoading";
import { AppGroup, AppGroupMembership } from "../../../../IsaacAppTypes";
import { NOT_FOUND, bookingStatusMap } from "../../../services/constants";
import _orderBy from "lodash/orderBy";

const stateToProps = (state: AppState) => ({
    user: (state && state.user) as RegisteredUserDTO,
    groups: groups.active(state),
    currentGroup: groups.current(state)
});
const dispatchToProps = { groups, loadGroups, selectGroup, getGroupMembers };

interface ReservationsModalProps {
    user: RegisteredUserDTO;
    groups: UserGroupDTO[] | null;
    currentGroup: AppGroup | null;
    loadGroups: (archivedGroupsOnly: boolean) => void;
    selectGroup: (group: UserGroupDTO | null) => void;
    getGroupMembers: (group: UserGroupDTO) => void;
}

const ReservationsModalComponent = (props: ReservationsModalProps) => {
    const { groups, loadGroups, currentGroup } = props;
    const currentUser = props.user;
    const dispatch = useDispatch();

    const [unbookedUsers, setUnbookedUsers] = useState<AppGroupMembership[]>([]);
    const [userCheckboxes, setUserCheckboxes] = useState<{[key: number]: boolean}>({});
    const [checkAllCheckbox, setCheckAllCheckbox] = useState<boolean>(false);
    // const [reservationLimitReached, setReservationLimitReached] = useState<boolean>(false);

    const selectedEvent = useSelector((state: AppState) => state && state.currentEvent !== NOT_FOUND && state.currentEvent || null);

    useEffect(() => {
        loadGroups(false);
    }, []);

    useEffect(() => {
        if (currentGroup && !currentGroup.members) {
            dispatch(getGroupMembers(currentGroup));
        } else if (currentGroup && currentGroup.members) {
            // af599 TODO: Retrieve event status for members maybe?
        }
    }, [currentGroup]);

    useEffect(() => {
        if (selectedEvent && selectedEvent.id && currentGroup && currentGroup.id) {
            dispatch(getEventBookingsForGroup(selectedEvent.id, currentGroup.id));
        }
    }, [currentGroup]);
    
    const eventBookingsForGroup = useSelector((state: AppState) => state && state.eventBookingsForGroup || []);

    useEffect(() => {
        // af599 TODO:
        //   Check the API (EventsFacade), it returns the wrong type of users
        //   (i.e., the one with an email address attached) even when the
        //   request comes from a TEACHER.
        if (currentGroup && currentGroup.members) {
            const bookedUserIds = eventBookingsForGroup.filter(booking => booking.bookingStatus !== "CANCELLED").map(booking => booking.userBooked && booking.userBooked.id);
            const newUnbookedUsers = _orderBy(
                currentGroup.members.filter(member => !bookedUserIds.includes(member.id as number)),
                ['authorisedFullAccess', 'familyName', 'givenName'], ['desc', 'asc', 'asc']
            );
            let newUserCheckboxes: boolean[] = [];
            for (const user of newUnbookedUsers) {
                if (!user.id || !user.authorisedFullAccess) continue;
                newUserCheckboxes[user.id] = false;
            }
            setUserCheckboxes(newUserCheckboxes);
            setCheckAllCheckbox(false);
            setUnbookedUsers(newUnbookedUsers);
        }
    }, [eventBookingsForGroup])

    const toggleCheckboxForUser = (userId?: number) => {
        if (!userId) return;
        let checkboxes = { ...userCheckboxes };
        checkboxes[userId] = !checkboxes[userId];
        setUserCheckboxes(checkboxes);
        if (!Object.values(checkboxes).every(v => v)) {
            setCheckAllCheckbox(false);
        }
    }

    const toggleAllUnbooked = () => {
        setCheckAllCheckbox(!checkAllCheckbox);
        let checkboxes = { ...userCheckboxes };
        for (const id in userCheckboxes) {
            checkboxes[id] = !checkAllCheckbox;
        }
        setUserCheckboxes(checkboxes);
    }

    const requestReservations = () => {
        if (selectedEvent && selectedEvent.id && currentGroup && currentGroup.id) {
            const reservableIds = Object.entries(userCheckboxes).filter(c => c[1]).map(c => parseInt(c[0]));
            dispatch(reserveUsersOnEvent(selectedEvent.id, reservableIds, currentGroup.id));
        }
    }

    const cancelReservationForUserId = async (userId?: number) => {
        if (selectedEvent && selectedEvent.id && currentGroup && currentGroup.id) {
            await dispatch(cancelUserBooking(selectedEvent.id, userId));
            dispatch(getEventBookingsForGroup(selectedEvent.id, currentGroup.id) as any);
        }
    }

    const isReservationLimitReached = () => {
        if (eventBookingsForGroup && selectedEvent && selectedEvent.groupReservationLimit) {
            // af599 TODO: Do we want a limit on currently open reservations, or a limit on how many reserved and confirmed students a teacher can reserve?
            //             The following does the latter. The one commented does the former. Remember to change the API to match.
            const bookings = eventBookingsForGroup.filter(booking => booking.reservedBy && booking.reservedBy.id === currentUser.id);
            // const bookings = eventBookingsForGroup.filter(booking => booking.bookingStatus === 'RESERVED' && booking.reservedBy && booking.reservedBy.id === currentUser.id);
            const candidateBookings = Object.values(userCheckboxes).filter(c => c);
            return (candidateBookings.length + bookings.length) > selectedEvent.groupReservationLimit;
        }
        // By default, return true to disable all the checkboxes: prevents awkward situations.des
        return true;
    }

    return <React.Fragment>
        <Row>
            <Col md={4}>
                <ShowLoading until={groups}>
                    {groups && groups.map(group => (
                        <Row key={group.id}>
                            <Col>
                                <div className="group-item p-2">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <Button color="link text-left" className="flex-fill" onClick={() => {dispatch(selectGroup(group))}}>
                                            {(currentGroup === group ? "»" : "")} {group.groupName}
                                        </Button>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    ))}
                </ShowLoading>
            </Col>
            {(!currentGroup || !currentGroup.members) && <Col>
                <p>Select one of your groups from the list to see its members.</p>
            </Col>}
            {currentGroup && currentGroup.members && currentGroup.members.length == 0 && <Col>
                <p>This group has no members. Please select another group.</p>
            </Col>}
            {currentGroup && currentGroup.members && currentGroup.members.length > 0 && <Col>
                <Table bordered className="bg-white">
                    <thead>
                        <tr>
                            <th className="align-middle">
                                &nbsp;
                            </th>
                            <th className="align-middle">
                                Student
                            </th>
                            <th className="align-middle">
                                Booking Status
                            </th>
                            <th className="align-middle">
                                Reserved By
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {/* af599 TODO: Probably find a better way of filtering these, but doing so on the useSelector above breaks things. */}
                        {eventBookingsForGroup.filter(booking => booking.bookingStatus !== "CANCELLED").length > 0 &&
                         eventBookingsForGroup.filter(booking => booking.bookingStatus !== "CANCELLED").map(booking => {
                             return (booking.userBooked && booking.userBooked.id && <tr key={booking.userBooked.id}>
                                 <td className="align-middle">
                                     {booking.userBooked &&
                                      (booking.reservedBy && booking.reservedBy.id === currentUser.id) &&
                                      (booking.bookingStatus == 'RESERVED') &&
                                        <Button key={booking.userBooked.id}
                                            id={`${booking.userBooked.id}`}
                                            color="link" outline block className="btn-sm mb-1"
                                            onClick={() => cancelReservationForUserId(booking.userBooked && booking.userBooked.id)}
                                        >Cancel</Button>}
                                 </td>
                                 <td className="align-middle">{booking.userBooked && (booking.userBooked.givenName + " " + booking.userBooked.familyName)}</td>
                                 <td className="align-middle">{booking.bookingStatus && bookingStatusMap[booking.bookingStatus]}</td>
                                 <td className="align-middle">{booking.reservedBy && (booking.reservedBy.givenName + " " + booking.reservedBy.familyName)}</td>
                             </tr>)
                         })}
                        {eventBookingsForGroup.length == 0 && <tr><td colSpan={4}>None of the members of this group are booked in for this event.</td></tr>}
                    </tbody>
                </Table>

                <Table bordered className="mt-3 bg-white">
                    <thead>
                        <tr>
                            <th colSpan={2}>Other students in this group</th>
                        </tr>
                        <tr>
                            <th className="w-auto text-nowrap align-middle">
                                <CustomInput
                                    id="check_all_unbooked"
                                    type="checkbox"
                                    label="Select all"
                                    checked={checkAllCheckbox}
                                    onChange={() => toggleAllUnbooked()}
                                    disabled={unbookedUsers.filter(user => user.authorisedFullAccess).length === 0}
                                />
                            </th>
                            <th className="w-100 align-middle">
                                Student
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {unbookedUsers.length > 0 && unbookedUsers.map(user => {
                            return (user.id && <tr key={user.id}>
                                <td className="w-auto align-middle">
                                    <CustomInput
                                        key={user.id}
                                        id={`${user.id}`}
                                        type="checkbox"
                                        name={`unbooked_student-${user.id}`}
                                        checked={userCheckboxes[user.id]}
                                        disabled={!user.authorisedFullAccess}
                                        onChange={() => toggleCheckboxForUser(user.id)}
                                    />
                                </td>
                                <td className="w-100 align-middle">{user.givenName + " " + user.familyName}</td>
                            </tr>)
                        })}
                    </tbody>
                </Table>

                <Row className="mb-5 toolbar">
                    <Col>
                        {isReservationLimitReached() && <p className="text-danger">You can only reserve a maximum of {selectedEvent && selectedEvent.groupReservationLimit} group members onto this event.</p>}
                        <Button disabled={!Object.values(userCheckboxes).some(v => v) || isReservationLimitReached()} onClick={requestReservations}>Reserve</Button>
                    </Col>
                </Row>
            </Col>}
        </Row>
    </React.Fragment>
}

export const reservationsModal = () => {
    return {
        closeAction: () => {store.dispatch(closeActiveModal())},
        size: 'xl',
        title: "Groups and Reservations",
        body: <ReservationsModal />,
        // af599 TODO: Wouldn't it be nice if we coul move the Reserve button
        //             here instead of having it in the component? Would it even
        //             be possible?
        // buttons: [
        //     <Button key={0} block color="primary" tag="a"  target="_blank" rel="noopener noreferer" onClick={requestReservation}>
        //         Download CSV
        //     </Button>,
        // ]
    }
};

export const ReservationsModal = connect(stateToProps, dispatchToProps)(ReservationsModalComponent);