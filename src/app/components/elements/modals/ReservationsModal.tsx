import React, {useEffect, useMemo, useState} from "react";
import {
    AppState,
    cancelReservationsOnEvent,
    closeActiveModal,
    getEventBookingsForAllGroups,
    getEventBookingsForGroup,
    isaacApi,
    reserveUsersOnEvent,
    store,
    useAppDispatch,
    useAppSelector
} from "../../../state";
import {Button, Col, CustomInput, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Row, Table} from "reactstrap";
import {ShowLoading} from "../../handlers/ShowLoading";
import {ActiveModal, AppGroup, AppGroupMembership} from "../../../../IsaacAppTypes";
import {RegisteredUserDTO} from "../../../../IsaacApiTypes";
import {bookingStatusMap, isLoggedIn, NOT_FOUND} from "../../../services";
import _orderBy from "lodash/orderBy";
import {Link} from "react-router-dom";
import classNames from "classnames";
import {sortBy} from "lodash";

const ReservationsModal = () => {
    const dispatch = useAppDispatch();
    const user = useAppSelector((state: AppState) => isLoggedIn(state?.user) ? state?.user as RegisteredUserDTO : undefined);

    const {data: activeGroups} = isaacApi.endpoints.getGroups.useQuery(false);
    const [getGroupMembers] = isaacApi.endpoints.getGroupMembers.useLazyQuery();
    const sortedActiveGroups = useMemo<AppGroup[]>(() => sortBy(activeGroups ?? [], g => g.groupName), [activeGroups]);

    const [selectedGroupId, setSelectedGroupId] = useState<number>();
    const selectedGroup = sortedActiveGroups && sortedActiveGroups.find(g => g.id === selectedGroupId);
    // Select first group in list when groups are initially fetched
    useEffect(() => {
        if (!selectedGroup && sortedActiveGroups && sortedActiveGroups.length > 0) {
            setSelectedGroupId(sortedActiveGroups[0].id);
        }
    }, [sortedActiveGroups]);

    const selectedEvent = useAppSelector((state: AppState) => state && state.currentEvent !== NOT_FOUND && state.currentEvent || null);
    const eventBookingsForGroup = useAppSelector((state: AppState) => state && state.eventBookingsForGroup || []);
    const eventBookingsForAllGroups = useAppSelector((state: AppState) => state && state.eventBookingsForAllGroups || []);

    const [unbookedUsers, setUnbookedUsers] = useState<AppGroupMembership[]>([]);
    const [userCheckboxes, setUserCheckboxes] = useState<{[key: number]: boolean}>({});
    const [checkAllCheckbox, setCheckAllCheckbox] = useState<boolean>(false);
    const [cancelReservationCheckboxes, setCancelReservationCheckboxes] = useState<{[key: number]: boolean}>({});
    const [checkAllCancelReservationsCheckbox, setCheckAllCancelReservationsCheckbox] = useState<boolean>();
    const [groupDropdownOpen, setGroupDropdownOpen] = useState(false);
    const [unbookedUsersById, setUnbookedUsersById] = useState<{[id: number]: AppGroupMembership}>({});

    useEffect(() => {
        setUnbookedUsersById(unbookedUsers.reduce((acc: {[id: number]: AppGroupMembership}, u) => ({...acc, [u.id as number]: u}), {}));
    }, [unbookedUsers]);

    const [modifiedBookingsForAllGroups, setModifiedBookingsForAllGroups] = useState(eventBookingsForAllGroups);

    useEffect(() => {
        if (selectedEvent && selectedEvent.id) {
            dispatch(getEventBookingsForAllGroups(selectedEvent.id));
        }
    }, [dispatch, selectedEvent]);

    useEffect(() => {
        const flattenedGroupBookings = eventBookingsForAllGroups.flat();
        const uniqueBookings = flattenedGroupBookings.filter((v,i,a)=> a.findIndex(t => (t.bookingId === v.bookingId)) === i);
        setModifiedBookingsForAllGroups(uniqueBookings);
    }, [eventBookingsForAllGroups]);

    useEffect(() => {
        if (selectedGroup?.id && !selectedGroup.members) {
            getGroupMembers(selectedGroup.id);
        }
        if (selectedEvent && selectedEvent.id && selectedGroup && selectedGroup.id) {
            dispatch(getEventBookingsForGroup(selectedEvent.id, selectedGroup.id));
        }
    }, [dispatch, selectedEvent, selectedGroup]);

    useEffect(() => {
        const bookedUserIds = modifiedBookingsForAllGroups
            .filter(booking => booking.bookingStatus !== "CANCELLED")
            .map(booking => booking.userBooked && booking.userBooked.id);
        let newCancelReservationCheckboxes: boolean[] = [];
        for (const userId of bookedUserIds) {
            if (userId) {
                newCancelReservationCheckboxes[userId] = false;
            }
        }
        setCancelReservationCheckboxes(newCancelReservationCheckboxes);

        const newUnbookedUsers = _orderBy(
            modifiedBookingsForAllGroups
                .filter(booking => !bookedUserIds.includes(booking.userBooked?.id as number))
                // do not allow the reservation of teachers on a student only event
                .filter(booking => !(selectedEvent?.isStudentOnly && booking.userBooked?.role !== "STUDENT")),
            ['authorisedFullAccess', 'familyName', 'givenName'], ['desc', 'asc', 'asc']
        );
        let newUserCheckboxes: boolean[] = [];
        for (const user of newUnbookedUsers) {
            if (!user.userBooked?.id || !user.userBooked?.authorisedFullAccess) continue;
            newUserCheckboxes[user.userBooked?.id] = false;
        }
        setUserCheckboxes(newUserCheckboxes);
        setCheckAllCheckbox(false);

    }, [modifiedBookingsForAllGroups]);

    useEffect(() => {
        if (selectedGroup && selectedGroup.members) {
            const bookedUserIds = eventBookingsForGroup
                .filter(booking => booking.bookingStatus !== "CANCELLED")
                .map(booking => booking.userBooked && booking.userBooked.id);
            let newCancelReservationCheckboxes: boolean[] = [];
            for (const userId of bookedUserIds) {
                if (userId) {
                    newCancelReservationCheckboxes[userId] = false;
                }
            }
            setCancelReservationCheckboxes(newCancelReservationCheckboxes);

            const newUnbookedUsers = _orderBy(
                selectedGroup.members
                    .filter(member => !bookedUserIds.includes(member.id as number))
                    // do not allow the reservation of teachers on a student only event
                    .filter(member => !(selectedEvent?.isStudentOnly && member.role !== "STUDENT")),
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
    }, [selectedGroup, eventBookingsForGroup]);

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
            if (unbookedUsersById[id].emailVerificationStatus === "VERIFIED") {
                checkboxes[id] = !checkAllCheckbox;
            }
        }
        setUserCheckboxes(checkboxes);
    };

    const toggleCancelReservationCheckboxForUser = (userId?: number) => {
        if (!userId) return;
        let checkboxes = { ...cancelReservationCheckboxes };
        checkboxes[userId] = !checkboxes[userId];
        setCancelReservationCheckboxes(checkboxes);
        if (!Object.values(checkboxes).every(v => v)) {
            setCheckAllCancelReservationsCheckbox(false);
        }
    };

    const toggleAllCancelReservationCheckboxes = () => {
        setCheckAllCancelReservationsCheckbox(!checkAllCancelReservationsCheckbox);
        let checkboxes = { ...cancelReservationCheckboxes };
        for (const id in cancelReservationCheckboxes) {
            checkboxes[id] = !checkAllCancelReservationsCheckbox;
        }
        setCancelReservationCheckboxes(checkboxes);
    };

    const requestReservations = () => {
        if (selectedEvent && selectedEvent.id && selectedGroup && selectedGroup.id) {
            const reservableIds = Object.entries(userCheckboxes).filter(c => c[1]).map(c => parseInt(c[0]));
            dispatch(reserveUsersOnEvent(selectedEvent.id, reservableIds, selectedGroup.id));
        }
        setCheckAllCheckbox(false);
    };

    const cancelReservations = () => {
        if (selectedEvent && selectedEvent.id) { // do we need this group id
            const cancellableIds = Object.entries(cancelReservationCheckboxes).filter(c => c[1]).map(c => parseInt(c[0]));
            selectedGroup?.id ? dispatch(cancelReservationsOnEvent(selectedEvent.id, cancellableIds, selectedGroup.id)) :
                dispatch(cancelReservationsOnEvent(selectedEvent.id, cancellableIds, undefined));
        }
        setCheckAllCancelReservationsCheckbox(false);
    };

    const isReservationLimitReached = () => {
        if (selectedEvent && selectedEvent.groupReservationLimit) {
            const bookings = eventBookingsForGroup
                .filter(booking =>
                    (booking.bookingStatus === "CONFIRMED" || booking.bookingStatus === "RESERVED" || booking.bookingStatus ==="WAITING_LIST")
                    && booking.reservedById === user?.id
                )
                // teachers should not count toward student event limits
                .filter(booking => !selectedEvent.isAStudentEvent || booking.userBooked?.role === "STUDENT");

            const candidateBookings = Object.entries(userCheckboxes)
                .filter(([,selected]) => selected)
                // teachers should not count toward student event limits
                .filter(([id,]) => !selectedEvent.isAStudentEvent || unbookedUsersById[id as any]?.role === "STUDENT");

            return (candidateBookings.length + bookings.length) > selectedEvent.groupReservationLimit;
        }
        // By default, return true to disable all the checkboxes: prevents awkward situations.
        return true;
    };

    return <React.Fragment>
        <div id="reservation-modal">
            {!selectedEvent?.allowGroupReservations && <p>This event does not allow group reservations.</p>}
            {selectedEvent?.allowGroupReservations && <Col>
                <Row className="mb-5">
                    <Col md={3}>
                        <ShowLoading until={sortedActiveGroups}>
                            <React.Fragment>
                                {sortedActiveGroups && sortedActiveGroups.length > 0 && <Dropdown isOpen={groupDropdownOpen} toggle={() => setGroupDropdownOpen(!groupDropdownOpen)}>
                                    <DropdownToggle caret color="primary mb-4">
                                        {selectedGroup ? selectedGroup.groupName : "Select group"}
                                    </DropdownToggle>
                                    <DropdownMenu>
                                        {sortedActiveGroups.map(group =>
                                            <DropdownItem onClick={() => setSelectedGroupId(group.id)}
                                                key={group.id}
                                                active={selectedGroup?.id === group.id}
                                            >
                                                {group.groupName}
                                            </DropdownItem>
                                        )}
                                    </DropdownMenu>
                                </Dropdown>}
                            </React.Fragment>
                        </ShowLoading>
                    </Col>
                    {sortedActiveGroups && sortedActiveGroups.length === 0 && <p>Create a groups from the <Link to="/groups" onClick={() => dispatch(closeActiveModal())}>Manage groups</Link> page to book your students onto an event</p>}
                    <Col cols={12} lg={{size: 8, offset: 1}} xl={{size: 9, offset: 0}}>
                        {sortedActiveGroups && sortedActiveGroups.length > 0 && (!selectedGroup || !selectedGroup.members) && <p>Select one of your groups from the dropdown menu to see its members.</p>}
                        {selectedGroup && selectedGroup.members && selectedGroup.members.length == 0 && <p>This group has no members. Please select another group.</p>}
                        <React.Fragment>
                            <Table bordered responsive className="bg-white reserved">
                                <thead>
                                <tr>
                                    <th colSpan={4}>All current reservations</th>
                                </tr>
                                    <tr>
                                        <th className="align-middle checkbox">
                                            <CustomInput
                                                id="check_all_reserved"
                                                type="checkbox"
                                                label="All"
                                                checked={checkAllCancelReservationsCheckbox || false}
                                                onChange={() => toggleAllCancelReservationCheckboxes()}
                                            />
                                        </th>
                                        <th className="align-middle student-name">
                                            Student
                                        </th>
                                        <th className="align-middle booking-status">
                                            Booking status
                                        </th>
                                        <th className="align-middle reserved-by">
                                            Reserved by
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {modifiedBookingsForAllGroups.map(booking => {
                                        const bookingCancelled = booking.bookingStatus === "CANCELLED";
                                        return (booking.userBooked && booking.userBooked.id && <tr key={booking.userBooked.id} className={classNames({"bg-light text-muted": bookingCancelled})}>
                                            <td className="align-middle text-center">
                                                <CustomInput key={booking.userBooked.id}
                                                    id={`${booking.userBooked.id}`}
                                                    type="checkbox"
                                                    name={`reserved_student-${booking.userBooked.id}`}
                                                    checked={cancelReservationCheckboxes[booking.userBooked.id] ?? false}
                                                    // I'm including the full access autorisation here because we do the same in the next table
                                                    disabled={bookingCancelled || (!booking.userBooked.authorisedFullAccess && booking.userBooked.emailVerificationStatus !== 'VERIFIED')}
                                                    onChange={() => toggleCancelReservationCheckboxForUser(booking.userBooked?.id)}
                                                />
                                            </td>
                                            <td className="align-middle">
                                                {booking.userBooked.givenName + " " + booking.userBooked.familyName}
                                                {booking.userBooked.emailVerificationStatus !== 'VERIFIED' && <div className="text-danger">E-mail not verified</div>}
                                            </td>
                                            <td className="align-middle">{booking.bookingStatus && bookingStatusMap[booking.bookingStatus]}</td>
                                            <td className="align-middle">{!booking.reservedById ? '' : (booking.reservedById === user?.id ? 'You' : 'Someone else')}</td>
                                        </tr>);
                                    })}
                                    {eventBookingsForAllGroups.length == 0 && <tr><td colSpan={4}>None of the members of this group are booked in for this event.</td></tr>}
                                </tbody>
                            </Table>

                            <div className="text-center mb-3">
                                <Button color="primary" outline disabled={!Object.values(cancelReservationCheckboxes).some(v => v)} onClick={cancelReservations}>
                                    Cancel reservations
                                </Button>
                            </div>
                        </React.Fragment>
                        {selectedGroup && selectedGroup.members && selectedGroup.members.length > 0 && <React.Fragment>
                            <Table bordered responsive className="mt-3 bg-white unreserved">
                                <thead>
                                    <tr>
                                        <th colSpan={2}>Other students in this group</th>
                                    </tr>
                                    <tr>
                                        <th className="w-auto text-nowrap align-middle checkbox">
                                            <CustomInput
                                                id="check_all_unbooked"
                                                type="checkbox"
                                                label="All"
                                                checked={checkAllCheckbox || false}
                                                onChange={() => toggleAllUnbooked()}
                                                disabled={unbookedUsers.filter(user => user.authorisedFullAccess).length === 0}
                                            />
                                        </th>
                                        <th className="w-100 align-middle student-name">
                                            Student
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {unbookedUsers.length > 0 && unbookedUsers.map(user => {
                                        return (user.id && <tr key={user.id}>
                                            <td className="w-auto align-middle text-center">
                                                <CustomInput
                                                    key={user.id}
                                                    id={`${user.id}`}
                                                    type="checkbox"
                                                    name={`unbooked_student-${user.id}`}
                                                    checked={userCheckboxes[user.id] || false}
                                                    disabled={!user.authorisedFullAccess || user.emailVerificationStatus !== 'VERIFIED'}
                                                    onChange={() => toggleCheckboxForUser(user.id)}
                                                />
                                            </td>
                                            <td className="w-100 align-middle">
                                                {user.givenName + " " + user.familyName}
                                                {user.emailVerificationStatus !== 'VERIFIED' && <div className="text-danger">E-mail not verified</div>}
                                            </td>
                                        </tr>)
                                    })}
                                </tbody>
                            </Table>

                            <Row className="toolbar">
                                <Col>
                                    {isReservationLimitReached() && <p className="text-danger">
                                        You can only reserve a maximum of {selectedEvent && selectedEvent.groupReservationLimit} group members onto this event.
                                    </p>}
                                    <div className="text-center">
                                        <Button color="primary" disabled={!Object.values(userCheckboxes).some(v => v) || isReservationLimitReached()} onClick={requestReservations}>
                                            Reserve places
                                        </Button>
                                    </div>
                                </Col>
                            </Row>
                        </React.Fragment>}
                    </Col>
                </Row>
            </Col>}
        </div>
    </React.Fragment>
};

export const reservationsModal = (): ActiveModal => {
    return {
        closeAction: () => {store.dispatch(closeActiveModal())},
        size: 'xl',
        title: "Group reservations",
        body: <ReservationsModal />,
        overflowVisible: true
    }
};
