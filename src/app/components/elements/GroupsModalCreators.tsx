import React from "react";
import {Link} from "react-router-dom";
import {store} from "../../state/store";
import {closeActiveModal, selectGroup} from "../../state/actions";
import * as RS from "reactstrap";
import {AppGroup} from "../../../IsaacAppTypes";
import {AppState} from "../../state/reducers";
import {groups} from "../../state/selectors";
import {connect} from "react-redux";

const mapStateToProps = (state: AppState) => {return {group: groups.current(state)};};

interface CurrentGroupInviteModalProps {
    group: AppGroup | null;
    firstTime: boolean;
}

const CurrentGroupInviteModal = ({group, firstTime}: CurrentGroupInviteModalProps) => {
    return group && <React.Fragment>
        {firstTime && <h1>Invite users</h1>}

        <p>Use one of the following methods to add users to your group. Students joining your group will be shown your name and account email and asked to confirm sharing data.</p>

        <RS.Jumbotron>
            <h2>Option 1: Share link</h2>
            <p>Share the following link with your students to have them join your group:</p>
            <p>{location.origin}/account?authToken={group.token}</p>
        </RS.Jumbotron>

        <RS.Jumbotron>
            <h2>Option 2: Share token</h2>
            <p>Ask your students to enter the following code into the Teacher Connections tab on their My Account page:</p>
            <h3 className="text-center">{group.token}</h3>
        </RS.Jumbotron>

        <p>
            Now you&apos;ve made a group, you may want to:
        </p>
    </React.Fragment>;
};

const ConnectedCurrentGroupInviteModal = connect(mapStateToProps)(CurrentGroupInviteModal);

export const groupInvitationModal = (firstTime: boolean) => {
    return {
        closeAction: () => {store.dispatch(closeActiveModal())},
        title: firstTime ? "Group Created" : "Invite Users",
        body: <ConnectedCurrentGroupInviteModal firstTime={firstTime} />,
        buttons: [
            <RS.Button key={1} color="secondary" outline onClick={() => {
                store.dispatch(closeActiveModal());
                store.dispatch(selectGroup(null));
            }}>
                Create another group
            </RS.Button>,
            <RS.Button key={0} color="secondary" tag={Link} to="/set_assignments">
                Set an assignment
            </RS.Button>,
        ]
    }
};

