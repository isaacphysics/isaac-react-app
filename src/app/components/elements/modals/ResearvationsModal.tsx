import React, { useEffect, useState } from "react";
import {connect} from "react-redux";
import {closeActiveModal, loadGroups, getGroupMembers} from "../../../state/actions";
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

const stateToProps = (state: AppState) => ({
    user: (state && state.user) as RegisteredUserDTO,
    groups: groups.active(state),
    groupMembers: [] as Array<RegisteredUserDTO>
});
const dispatchToProps = { groups, loadGroups, getGroupMembers };

interface ReservationsModalProps {
    user: RegisteredUserDTO;
    groups: UserGroupDTO[] | null;
    groupMembers: RegisteredUserDTO[] | null;
    loadGroups: (archivedGroupsOnly: boolean) => void;
    getGroupMembers: (group: UserGroupDTO) => void;
}

const ReservationsModalComponent = (props: ReservationsModalProps) => {
    const { user, groups, loadGroups, getGroupMembers } = props;

    const [groupMembers, setGroupMembers] = useState();

    useEffect(() => {
        loadGroups(false);
    }, []);

    useEffect(() => {
        // Promise here...
        console.log(groupMembers);
    }, [groupMembers]);

    return <React.Fragment>
        <Row>
            <Col md={4}>
                <ShowLoading until={groups}>
                    {groups && groups.map(g => (
                        <Row key={g.id}>
                            <Col>
                                <div className="group-item p-2">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <Button color="link text-left" className="flex-fill" onClick={() => {setGroupMembers(getGroupMembers(g))}}>
                                            {g.groupName}
                                        </Button>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    ))}
                </ShowLoading>
            </Col>
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