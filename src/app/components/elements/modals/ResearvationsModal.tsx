import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {
    cancelUserBooking,
    closeActiveModal,
    getEventBookingsForGroup,
    getGroupMembers,
    loadGroups,
    reserveUsersOnEvent,
    selectGroup
} from "../../../state/actions";
import {store} from "../../../state/store";
import {Button, Col, CustomInput, Row, Table} from "reactstrap";
import {AppState} from "../../../state/reducers";
import {groups} from '../../../state/selectors';
import {ShowLoading} from "../../handlers/ShowLoading";
import {AppGroupMembership} from "../../../../IsaacAppTypes";
import {bookingStatusMap, NOT_FOUND} from "../../../services/constants";
import _orderBy from "lodash/orderBy";
import {RegisteredUserDTO} from "../../../../IsaacApiTypes";
import {isLoggedIn} from "../../../services/user";

const ReservationsModal = () => {
    const dispatch = useDispatch();
    const user = useSelector((state: AppState) => isLoggedIn(state?.user) ? state?.user as RegisteredUserDTO : undefined);
    const activeGroups = useSelector(groups.active);
    const currentGroup = useSelector(groups.current);
    const selectedEvent = useSelector((state: AppState) => state && state.currentEvent !== NOT_FOUND && state.currentEvent || null);
    const eventBookingsForGroup = useSelector((state: AppState) => state && state.eventBookingsForGroup || []);
    const [unbookedUsers, setUnbookedUsers] = useState<AppGroupMembership[]>([]);
    const [userCheckboxes, setUserCheckboxes] = useState<{[key: number]: boolean}>({});
    const [checkAllCheckbox, setCheckAllCheckbox] = useState<boolean>(false);

    useEffect(() => {
        dispatch(loadGroups(false));
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


    useEffect(() => {
        if (currentGroup && currentGroup.members) {
            const bookedUserIds = eventBookingsForGroup
                .filter(booking => booking.bookingStatus !== "CANCELLED")
                .map(booking => booking.userBooked && booking.userBooked.id);
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
    }, [eventBookingsForGroup]);

    const toggleCheckboxForUser = (userId?: number) => {
        if (!userId) return;
        let checkboxes = { ...userCheckboxes };
        checkboxes[userId] = !checkboxes[userId];
        setUserCheckboxes(checkboxes);
        if (!Object.values(checkboxes).every(v => v)) {
            setCheckAllCheckbox(false);
        }
    };

    const toggleAllUnbooked = () => {
        setCheckAllCheckbox(!checkAllCheckbox);
        let checkboxes = { ...userCheckboxes };
        for (const id in userCheckboxes) {
            checkboxes[id] = !checkAllCheckbox;
        }
        setUserCheckboxes(checkboxes);
    };

    const requestReservations = () => {
        if (selectedEvent && selectedEvent.id && currentGroup && currentGroup.id) {
            const reservableIds = Object.entries(userCheckboxes).filter(c => c[1]).map(c => parseInt(c[0]));
            dispatch(reserveUsersOnEvent(selectedEvent.id, reservableIds, currentGroup.id));
        }
    };

    const cancelReservationForUserId = async (userId?: number) => {
        if (selectedEvent && selectedEvent.id && currentGroup && currentGroup.id) {
            await dispatch(cancelUserBooking(selectedEvent.id, userId));
            dispatch(getEventBookingsForGroup(selectedEvent.id, currentGroup.id));
        }
    };

    const isReservationLimitReached = () => {
        if (selectedEvent && selectedEvent.groupReservationLimit) {
            const bookings = eventBookingsForGroup.filter(booking => booking.reservedBy && booking.reservedBy.id === user?.id);
            const candidateBookings = Object.values(userCheckboxes).filter(c => c);
            return (candidateBookings.length + bookings.length) > selectedEvent.groupReservationLimit;
        }
        // By default, return true to disable all the checkboxes: prevents awkward situations.
        return true;
    };

    return <React.Fragment>
        <Col>
            <Row className="mb-5">
                <Col md={4}>
                    <ShowLoading until={activeGroups}>
                        {activeGroups && activeGroups.map(group => (
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
                            {eventBookingsForGroup.filter(booking => booking.bookingStatus !== "CANCELLED").map(booking => {
                                return (booking.userBooked && booking.userBooked.id && <tr key={booking.userBooked.id}>
                                    <td className="align-middle">
                                        {booking.userBooked &&
                                        (booking.reservedBy && booking.reservedBy.id === user?.id) &&
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
                                </tr>);
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

                    <Row className="toolbar">
                        <Col>
                            {isReservationLimitReached() && <p className="text-danger">
                                You can only reserve a maximum of {selectedEvent && selectedEvent.groupReservationLimit} group members onto this event.
                            </p>}
                            <Button disabled={!Object.values(userCheckboxes).some(v => v) || isReservationLimitReached()} onClick={requestReservations}>
                                Reserve
                            </Button>
                        </Col>
                    </Row>
                </Col>}
            </Row>
        </Col>
    </React.Fragment>
};

export const reservationsModal = () => {
    return {
        closeAction: () => {store.dispatch(closeActiveModal())},
        size: 'xl',
        title: "Group reservations",
        body: <ReservationsModal />,
    }
};
