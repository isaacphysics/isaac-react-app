import React, { useEffect } from "react";
import {connect} from "react-redux";
import {closeActiveModal, loadGroups} from "../../../state/actions";
import {store} from "../../../state/store";
import * as RS from "reactstrap";
import {RegisteredUserDTO, UserGroupDTO} from "../../../../IsaacApiTypes";
import {AppState} from "../../../state/reducers";
import {groups} from '../../../state/selectors';

const stateToProps = (state: AppState) => ({
    user: (state && state.user) as RegisteredUserDTO,
    groups: groups.active(state)
});
const dispatchToProps = { groups, loadGroups };

interface ReservationsModalProps {
    user: RegisteredUserDTO;
    groups: UserGroupDTO[] | null;
    loadGroups: (archivedGroupsOnly: boolean) => void;
}

const ReservationsModalComponent = (props: ReservationsModalProps) => {
    const { user, groups, loadGroups } = props;

    useEffect(() => {
        loadGroups(false);
    }, []);

    return <div>ReservationsModal {JSON.stringify(groups)}</div>
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