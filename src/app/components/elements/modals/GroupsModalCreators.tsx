import React, {useState} from "react";
import {connect, ResolveThunks, useSelector} from "react-redux";
import {sortBy} from "lodash";
import {history} from "../../../services/history";
import * as RS from "reactstrap";

import {RegisteredUserDTO, UserSummaryWithEmailAddressDTO} from "../../../../IsaacApiTypes";
import {Action, AppGroup} from "../../../../IsaacAppTypes";

import {store} from "../../../state/store";
import {
    addGroupManager,
    closeActiveModal,
    deleteGroupManager,
    selectGroup,
    showGroupInvitationModal,
    showGroupManagersModal
} from "../../../state/actions";
import {AppState} from "../../../state/reducers";
import {selectors} from "../../../state/selectors";
import {bindActionCreators, Dispatch} from "redux";


interface CurrentGroupInviteModalProps {
    firstTime: boolean;
}

const CurrentGroupInviteModal = ({firstTime}: CurrentGroupInviteModalProps) => {
    const group = useSelector(selectors.groups.current);
    return group && <React.Fragment>
        {firstTime && <h1>Invite users</h1>}

        <p>Use one of the following methods to add users to your group. Students joining your group will be shown your name and account email and asked to confirm sharing data.</p>

        <RS.Jumbotron>
            <h2>Option 1: Share link</h2>
            <p>Share the following link with your students to have them join your group:</p>
            <span className="text-center h4 overflow-auto user-select-all d-block border bg-light p-1">
                {location.origin}/account?authToken={group.token}
            </span>
        </RS.Jumbotron>

        <RS.Jumbotron>
            <h2>Option 2: Share code</h2>
            <p>Ask your students to enter the following code into the Teacher Connections tab on their &lsquo;My account&rsquo; page:</p>
            <h3 className="text-center user-select-all d-block border bg-light p-1">{group.token}</h3>
        </RS.Jumbotron>

        <p>
            Now you&apos;ve made a group, you may want to:
        </p>
    </React.Fragment>;
};

export const groupInvitationModal = (firstTime: boolean) => {
    return {
        closeAction: () => {store.dispatch(closeActiveModal())},
        title: firstTime ? "Group Created" : "Invite Users",
        body: <CurrentGroupInviteModal firstTime={firstTime} />,
        buttons: [
            <RS.Row key={0}>
                <RS.Col>
                    <RS.Button block key={2} color="secondary" onClick={() => {
                        store.dispatch(closeActiveModal());
                        store.dispatch(showGroupManagersModal());
                    }}>
                        {firstTime ? "Add group managers" : "Edit group managers"}
                    </RS.Button>
                </RS.Col>
                <RS.Col>
                    <RS.Button block key={0} color="secondary" onClick={() => {
                        store.dispatch(closeActiveModal());
                        history.push("/set_assignments");
                    }}>
                        Set an assignment
                    </RS.Button>
                </RS.Col>
                <RS.Col>
                    <RS.Button block key={1} color="secondary" onClick={() => {
                        store.dispatch(closeActiveModal());
                        store.dispatch(selectGroup(null));
                    }}>
                        Create another group
                    </RS.Button>
                </RS.Col>
            </RS.Row>
        ]
    }
};

const mapStateToPropsForManagers = (state: AppState) => {return {
    group: selectors.groups.current(state),
    user: state && state.user && state.user.loggedIn && state.user || null
};};

interface CurrentGroupManagersModalProps {
    group: AppGroup | null;
    user: RegisteredUserDTO | null;
    addGroupManager: (group: AppGroup, managerEmail: string) => Promise<boolean>;
    deleteGroupManager: (group: AppGroup, manager: UserSummaryWithEmailAddressDTO) => void;
    showGroupInvitationModal: (firstTime: boolean) => void;
    userIsOwner: boolean;
}

const CurrentGroupManagersModal = ({group, user, addGroupManager, deleteGroupManager, showGroupInvitationModal, userIsOwner}: CurrentGroupManagersModalProps) => {
    const additionalManagers = group && sortBy(group.additionalManagers, manager => manager.familyName && manager.familyName.toLowerCase()) || [];

    const [newManagerEmail, setNewManagerEmail] = useState("");

    function addManager(event: any) {
        if (event) {
            event.preventDefault();
        }
        if (group) {
            addGroupManager(group, newManagerEmail).then((result: boolean) => {
                if (result) {
                    setNewManagerEmail("");
                }
            });
        }
    }

    function removeManager(manager: UserSummaryWithEmailAddressDTO) {
        if (group) {
            if (confirm("Are you sure you want to remove this teacher from the group?\nThey may still have access to student data until students revoke the connection from their My account pages.")) {
                deleteGroupManager(group, manager)
            }
        }
    }

    return group && <React.Fragment>
        <h2>Selected group: {group.groupName}</h2>

        <p>Sharing this group lets other teachers edit the group name, add and remove students, set new assignments and view assignment progress. It will not automatically let additional teachers see detailed mark data unless students give access to the new teacher.</p>

        {!userIsOwner && group.ownerSummary && <div>
            <h4>Group owner:</h4>
            <RS.Table className="group-table">
                <tbody>
                    <tr>
                        <td><span className="group-table-person" />{group.ownerSummary.givenName} {group.ownerSummary.familyName} ({group.ownerSummary.email})
                        </td>
                    </tr>
                </tbody>
            </RS.Table>
        </div>}

        <h4>Current group managers</h4>

        {additionalManagers.length == 0 &&
            <p>There are no additional group managers for this group.</p>}
        {additionalManagers.length == 1 && user && additionalManagers[0].id == user.id &&
            <p>You are the only additional manager for this group.</p>}
        {!(additionalManagers.length == 0 || (additionalManagers.length == 1 && user && additionalManagers[0].id == user.id)) &&
            <p>The users below have permission to manage this group.</p>}

        <RS.Table className="group-table">
            <tbody>{additionalManagers && additionalManagers.map(manager =>
                <tr key={manager.email}>
                    <td><span className="icon-group-table-person" />{manager.givenName} {manager.familyName} ({manager.email})</td>
                    {userIsOwner && <td className="group-table-delete"><a className="delete-icon" href="javascript:void(0)"
                        onClick={() => removeManager(manager)} aria-label="Remove manager">X</a></td>}
                </tr>
            )}</tbody>
        </RS.Table>

        {userIsOwner && <React.Fragment>
            <h4>Add additional managers</h4>
            <p>Enter the email of another Isaac teacher account below to add them as a group manager. Note that this will share their email address with the students.</p>
            <RS.Form onSubmit={addManager}>
                <RS.Input type="text" value={newManagerEmail} placeholder="Enter email address here" onChange={event => setNewManagerEmail(event.target.value)}/>
                <p>
                    <small><strong>Remember:</strong> Students may need to reuse the <a href="javascript:void(0)"
                        onClick={() => showGroupInvitationModal(false)}>group link</a> to approve access to their data for any new teachers.
                    </small>
                </p>
                <RS.Button block onClick={addManager}>Add group manager</RS.Button>
            </RS.Form>
        </React.Fragment>}
    </React.Fragment>;
};

// action creator binding of deleteGroupManager has to happen not at the top-level because we are in a circular dependency,
// so deleteGroupManager is undefined at the top-level in this file.
function mapDispatch(dispatch: Dispatch<Action>) {
    return bindActionCreators({addGroupManager, deleteGroupManager, showGroupInvitationModal}, dispatch);
}

// This is built into connect, but we can't use it because of the above.
function resolve<T>(f: (dispatch: Dispatch<Action>) => T): (dispatch: Dispatch<Action>) => ResolveThunks<T> {
    // @ts-ignore
    return f;
}

const ConnectedCurrentGroupManagersModal = connect(mapStateToPropsForManagers, resolve(mapDispatch))(CurrentGroupManagersModal);
export const groupManagersModal = (userIsOwner: boolean) => {
    return {
        closeAction: () => {store.dispatch(closeActiveModal())},
        title: userIsOwner ? "Share your group" : "Shared group",
        body: <ConnectedCurrentGroupManagersModal userIsOwner={userIsOwner} />,
        buttons: []
    }
};
