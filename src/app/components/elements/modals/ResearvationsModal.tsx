import React, { useEffect, useState } from "react";
import {connect, useDispatch} from "react-redux";
import {closeActiveModal, loadGroups, selectGroup, getGroupMembers} from "../../../state/actions";
import {store} from "../../../state/store";
import {
    Row,
    Col,
    Button
} from "reactstrap";
import {RegisteredUserDTO, UserGroupDTO} from "../../../../IsaacApiTypes";
import {AppState, user} from "../../../state/reducers";
import {groups} from '../../../state/selectors';
import { ShowLoading } from "../../handlers/ShowLoading";
import { AppGroup } from "../../../../IsaacAppTypes";

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
                                            {group.groupName}
                                        </Button>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    ))}
                </ShowLoading>
            </Col>
            {currentGroup && currentGroup.members && <Col>
                {currentGroup.members.map(member => (
                    <Row key={member.id}>
                        <Col>
                            { member.givenName } { member.familyName }
                        </Col>
                    </Row>
                ))}
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