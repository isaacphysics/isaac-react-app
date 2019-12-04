import React, { useEffect, useState } from "react";
import {connect, useDispatch, useSelector} from "react-redux";
import {closeActiveModal, loadGroups, selectGroup, getGroupMembers, getEventBookingsForGroup} from "../../../state/actions";
import {store} from "../../../state/store";
import {
    Row,
    Col,
    Button
} from "reactstrap";
import {RegisteredUserDTO, UserGroupDTO, UserSummaryDTO} from "../../../../IsaacApiTypes";
import {AppState, user} from "../../../state/reducers";
import {groups} from '../../../state/selectors';
import { ShowLoading } from "../../handlers/ShowLoading";
import { AppGroup, AppGroupMembership } from "../../../../IsaacAppTypes";
import { NOT_FOUND } from "../../../services/constants";

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
    const { user, groups, loadGroups, currentGroup } = props;
    const dispatch = useDispatch();

    const [bookedUsers, setBookedUsers] = useState<UserSummaryDTO[]>([]);
    const [unbookedUsers, setUnbookedUsers] = useState<AppGroupMembership[]>([]);

    const selectedEvent = useSelector((state: AppState) => state && state.currentEvent !== NOT_FOUND && state.currentEvent || null);

    useEffect(() => {
        loadGroups(false);
    }, []);

    useEffect(() => {
        if (currentGroup && !currentGroup.members) {
            dispatch(getGroupMembers(currentGroup));
        } else if (currentGroup && currentGroup.members) {
            // TODO: Retrieve event status for members maybe?
        }
    }, [currentGroup]);

    useEffect(() => {
        if (selectedEvent && selectedEvent.id && currentGroup && currentGroup.id) {
            dispatch(getEventBookingsForGroup(selectedEvent.id, currentGroup.id));
        }
    }, [currentGroup]);
    
    const eventBookingsForGroup = useSelector((state: AppState) => state && state.eventBookingsForGroup || []);

    useEffect(() => {
        if (currentGroup && currentGroup.members && eventBookingsForGroup && eventBookingsForGroup.length > 0) {
            setBookedUsers(eventBookingsForGroup.map(booking => booking && booking.userBooked) as UserSummaryDTO[]);
        }
    }, [eventBookingsForGroup]);

    useEffect(() => {
        if (currentGroup && currentGroup.members) {
            const bookedUserIds = bookedUsers.map(user => user.id);
            setUnbookedUsers(currentGroup.members.filter(member => !bookedUserIds.includes(member.id as number)) as AppGroupMembership[]);
        }
    }, [bookedUsers])

    return <React.Fragment>
        <pre>
            booked: { JSON.stringify(bookedUsers) }<br />
            unbooked: { JSON.stringify(unbookedUsers) }
        </pre>
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
            {currentGroup && currentGroup.members && <Col>
                {currentGroup.members.length > 0 && currentGroup.members.map(member => (
                    <Row key={member.id}>
                        <Col>
                            { member.givenName } { member.familyName }
                        </Col>
                    </Row>
                ))}
                {currentGroup.members.length == 0 && <Col>
                    <Row>
                        <Col><p>This group has no members. Please select another group.</p></Col>
                    </Row>
                </Col>}
            </Col>}
            {(!currentGroup || !currentGroup.members) && <Col>
                <p>Select one of your groups from the list to see its members.</p>
            </Col>}
        </Row>
    </React.Fragment>
}

export const reservationsModal = () => {
    return {
        closeAction: () => {store.dispatch(closeActiveModal())},
        title: "Groups and Reservations",
        body: <ReservationsModal />,
        // buttons: [
        //     <RS.Button key={0} block color="primary" tag="a"  target="_blank" rel="noopener noreferer" onClick={() => {store.dispatch(closeActiveModal())}}>
        //         Download CSV
        //     </RS.Button>,
        // ]
    }
};

export const ReservationsModal = connect(stateToProps, dispatchToProps)(ReservationsModalComponent);