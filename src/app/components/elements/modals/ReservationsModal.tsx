import React, {useEffect, useMemo, useState} from "react";
import {
    AppState,
    cancelReservationsOnEvent,
    closeActiveModal,
    getEventBookingsForAllGroups,
    getEventBookingsForGroup,
    getGroupMembers,
    loadGroups,
    reserveUsersOnEvent,
    selectGroup,
    selectors,
    store,
    useAppDispatch,
    useAppSelector
} from "../../../state";
import {Button, Col, CustomInput, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Row, Table} from "reactstrap";
import {ShowLoading} from "../../handlers/ShowLoading";
import {ActiveModalSpecification, AppGroup, AppGroupMembership} from "../../../../IsaacAppTypes";
import {RegisteredUserDTO} from "../../../../IsaacApiTypes";
import {bookingStatusMap, isLoggedIn, NOT_FOUND} from "../../../services";
import _orderBy from "lodash/orderBy";
import {Link} from "react-router-dom";
import classNames from "classnames";

const ReservationsModal = () => {
    const dispatch = useAppDispatch();
    const user = useAppSelector((state: AppState) => isLoggedIn(state?.user) ? state?.user as RegisteredUserDTO : undefined);
    const activeGroups = useAppSelector(selectors.groups.active);
    const activeFilteredGroups = useMemo(() => activeGroups?.filter(group => !group.archived), [activeGroups])?.sort((a: AppGroup, b: AppGroup): number => {
        if (!a.groupName || !b.groupName || (a.groupName === b.groupName)) return 0;
        if (a.groupName > b.groupName) return 1;
        return -1;
    });
    const currentGroup = useAppSelector(selectors.groups.current);
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
        const _unbookedUsersById: {[id: number]: AppGroupMembership} = {};
        unbookedUsers.forEach(unbookedUser => _unbookedUsersById[unbookedUser.id || 0] = unbookedUser);
        setUnbookedUsersById(_unbookedUsersById);
    }, [unbookedUsers]);

    const [modifiedBookingsForAllGroups, setModifiedBookingsForAllGroups] = useState(eventBookingsForAllGroups);

    useEffect(() => {
        dispatch(loadGroups(false));
    }, [dispatch]);

    useEffect(() => {
        if (selectedEvent && selectedEvent.id) {
            dispatch(getEventBookingsForAllGroups(selectedEvent.id));
        }
    }, [dispatch, selectedEvent]);

    useEffect(() => {
        const flattenedGroupBookings = eventBookingsForAllGroups.flat();
        const uniqueBookings = flattenedGroupBookings.filter((v,i,a)=> a.findIndex(t=>(t.bookingId === v.bookingId))===i);
        setModifiedBookingsForAllGroups(uniqueBookings);
    }, [eventBookingsForAllGroups]);

    useEffect(() => {
        if (currentGroup && !currentGroup.members) {
            dispatch(getGroupMembers(currentGroup));
        }
        if (selectedEvent && selectedEvent.id && currentGroup && currentGroup.id) {
            dispatch(getEventBookingsForGroup(selectedEvent.id, currentGroup.id));
        }
    }, [dispatch, selectedEvent, currentGroup]);

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
        if (currentGroup && currentGroup.members) {
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
                currentGroup.members
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
    }, [currentGroup, eventBookingsForGroup]);

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
        if (selectedEvent && selectedEvent.id && currentGroup && currentGroup.id) {
            const reservableIds = Object.entries(userCheckboxes).filter(c => c[1]).map(c => parseInt(c[0]));
            dispatch(reserveUsersOnEvent(selectedEvent.id, reservableIds, currentGroup.id));
        }
        setCheckAllCheckbox(false);
    };

    const cancelReservations = () => {
        if (selectedEvent && selectedEvent.id) { // do we need this group id
            const cancellableIds = Object.entries(cancelReservationCheckboxes).filter(c => c[1]).map(c => parseInt(c[0]));
            currentGroup?.id ? dispatch(cancelReservationsOnEvent(selectedEvent.id, cancellableIds, currentGroup.id)) :
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
                        <ShowLoading until={activeFilteredGroups}>
                            <React.Fragment>
                                {activeFilteredGroups && activeFilteredGroups.length > 0 && <Dropdown isOpen={groupDropdownOpen} toggle={() => setGroupDropdownOpen(!groupDropdownOpen)}>
                                    <DropdownToggle caret color="primary mb-4">
                                        {currentGroup ? currentGroup.groupName : "Select group"}
                                    </DropdownToggle>
                                    <DropdownMenu>
                                        {activeFilteredGroups.map(group =>
                                            <DropdownItem onClick={() => dispatch(selectGroup(group))}
                                                key={group.id}
                                                active={currentGroup === group}
                                            >
                                                {group.groupName}
                                            </DropdownItem>
                                        )}
                                    </DropdownMenu>
                                </Dropdown>}
                            </React.Fragment>
                        </ShowLoading>
                    </Col>
                    {activeFilteredGroups && activeFilteredGroups.length === 0 && <p>Create a groups from the <Link to="/groups" onClick={() => dispatch(closeActiveModal())}>Manage groups</Link> page to book your students onto an event</p>}
                    <Col cols={12} lg={{size: 8, offset: 1}} xl={{size: 9, offset: 0}}>
                        {activeFilteredGroups && activeFilteredGroups.length > 0 && (!currentGroup || !currentGroup.members) && <p>Select one of your groups from the dropdown menu to see its members.</p>}
                        {currentGroup && currentGroup.members && currentGroup.members.length == 0 && <p>This group has no members. Please select another group.</p>}
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
                        {currentGroup && currentGroup.members && currentGroup.members.length > 0 && <React.Fragment>
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

export const reservationsModal = (): ActiveModalSpecification => {
    return {
        closeAction: () => {store.dispatch(closeActiveModal())},
        size: 'xl',
        title: "Group reservations",
        body: <ReservationsModal />,
        overflowVisible: true
    }
};
