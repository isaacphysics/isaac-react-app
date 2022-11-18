import React, {useState} from "react";
import {
    closeActiveModal,
    showAdditionalManagerSelfRemovalModal,
    showGroupInvitationModal,
    showGroupManagersModal,
    isaacApi,
    store,
    useAppDispatch,
} from "../../../state";
import {sortBy} from "lodash";
import {history, isTeacherOrAbove} from "../../../services";
import {Jumbotron, Row, Col, Form, Input, Table} from "reactstrap";
import {Button} from "reactstrap";
import {RegisteredUserDTO, UserSummaryWithEmailAddressDTO} from "../../../../IsaacApiTypes";
import {AppGroup} from "../../../../IsaacAppTypes";
import {ShowLoadingQuery} from "../../handlers/ShowLoadingQuery";
import {Loading} from "../../handlers/IsaacSpinner";

const AdditionalManagerSelfRemovalModalBody = ({group}: {group: AppGroup}) => <p>
    You are about to remove yourself as a manager from &apos;{group.groupName}&apos;. This group will no longer appear on your
    Assignment Progress page or on the Manage Groups page.  You will still have student connections with the
    students who agreed to share data with you.  The group owner will <strong>not</strong> be notified.
</p>;
export const additionalManagerSelfRemovalModal = (group: AppGroup, user: RegisteredUserDTO) => ({
    closeAction: () => store.dispatch(closeActiveModal()),
    title: "Remove yourself as a group manager",
    body: <AdditionalManagerSelfRemovalModalBody group={group} />,
    buttons: [
        <Row key={0}>
            <Col>
                <Button block outline color="primary" onClick={() => {
                    store.dispatch(closeActiveModal());
                }}>
                    Cancel
                </Button>
            </Col>
            <Col>
                <Button block color="secondary" onClick={() => {
                    if (group.id && user.id) {
                        store.dispatch(isaacApi.endpoints.deleteGroupManager.initiate({groupId: group.id, managerUserId: user.id}));
                    }
                    store.dispatch(closeActiveModal());
                }}>
                    Confirm
                </Button>
            </Col>
        </Row>
    ]
});

interface CurrentGroupInviteModalProps {
    firstTime: boolean;
    group: AppGroup;
}
const CurrentGroupInviteModal = ({firstTime, group}: CurrentGroupInviteModalProps) => {
    const tokenQuery = isaacApi.endpoints.getGroupToken.useQuery(group.id as number);
    return <>
        {firstTime && <h1>Invite users</h1>}
        <p>Use one of the following methods to add users to your group. Students joining your group will be shown your name and account email and asked to confirm sharing data.</p>
        <ShowLoadingQuery
            query={tokenQuery}
            defaultErrorTitle={"Error fetching group joining token"}
            thenRender={token => <>
                <Jumbotron>
                    <h2>Option 1: Share link</h2>
                    <p>Share the following link with your students to have them join your group:</p>
                    <span className="text-center h4 overflow-auto user-select-all d-block border bg-light p-1" data-testid={"share-link"}>
                        {location.origin}/account?authToken={token?.token}
                    </span>
                </Jumbotron>

                <Jumbotron>
                    <h2>Option 2: Share code</h2>
                    <p>Ask your students to enter the following code into the Teacher Connections tab on their &lsquo;My account&rsquo; page:</p>
                    <h3 className="text-center user-select-all d-block border bg-light p-1" data-testid={"share-code"}>{token?.token}</h3>
                </Jumbotron>
            </>}
        />
        <p>
            Now you&apos;ve made a group, you may want to:
        </p>
    </>;
};
export const groupInvitationModal = (group: AppGroup, user: RegisteredUserDTO, firstTime: boolean) => ({
    closeAction: () => store.dispatch(closeActiveModal()),
    title: firstTime ? "Group Created" : "Invite Users",
    body: <CurrentGroupInviteModal group={group} firstTime={firstTime} />,
    buttons: [
        <Row key={0}>
            {/* TUTOR only teachers should be able add group managers */}
            {isTeacherOrAbove(user) && <Col>
                <Button block color="secondary" onClick={() => {
                    store.dispatch(closeActiveModal());
                    store.dispatch(showGroupManagersModal({group, user}));
                }}>
                    {firstTime ? "Add group managers" : "Edit group managers"}
                </Button>
            </Col>}
            <Col>
                <Button block color="secondary" onClick={() => {
                    store.dispatch(closeActiveModal());
                    history.push("/set_assignments");
                }}>
                    Set an assignment
                </Button>
            </Col>
            <Col>
                <Button block color="secondary" onClick={() => {
                    store.dispatch(closeActiveModal());
                }}>
                    Create another group
                </Button>
            </Col>
        </Row>
    ]
});

const CurrentGroupManagersModal = ({groupId, archived, userIsOwner, user}: {groupId: number, archived: boolean, userIsOwner: boolean, user: RegisteredUserDTO}) => {
    const dispatch = useAppDispatch();
    const {data: groups} = isaacApi.endpoints.getGroups.useQuery(archived);
    const group = groups?.find(g => g.id === groupId);
    const [addGroupManager] = isaacApi.endpoints.addGroupManager.useMutation();
    const [deleteGroupManager] = isaacApi.endpoints.deleteGroupManager.useMutation();

    const additionalManagers = group && sortBy(group.additionalManagers, manager => manager.familyName && manager.familyName.toLowerCase()) || [];

    const [newManagerEmail, setNewManagerEmail] = useState("");

    function addManager(event: any) {
        if (event) {
            event.preventDefault();
        }
        if (group?.id) {
            addGroupManager({groupId: group.id, managerEmail: newManagerEmail}).then((result) => {
                if ("data" in result) {
                    // Successful addition, clear new manager email field
                    setNewManagerEmail("");
                }
            });
        }
    }

    function removeManager(manager: UserSummaryWithEmailAddressDTO) {
        if (group?.id) {
            if (confirm("Are you sure you want to remove this teacher from the group?\nThey may still have access to student data until students revoke the connection from their My account pages.")) {
                deleteGroupManager({groupId: group.id, managerUserId: manager.id as number})
            }
        }
    }

    function removeSelf(manager: RegisteredUserDTO | null) {
        if (manager && group) {
            dispatch(closeActiveModal());
            dispatch(showAdditionalManagerSelfRemovalModal({group, user: manager}));
        }
    }

    return !group ? <Loading/> : <div className={"mb-4"}>
        <h2>Selected group: {group.groupName}</h2>

        <p>
            Sharing this group lets other teachers add and remove students, set new assignments and view assignment progress.
            It will not automatically let additional teachers see detailed mark data unless students give access to the new teacher.
        </p>

        {!userIsOwner && group.ownerSummary && <div>
            <h4>Group owner:</h4>
            <Table className="group-table">
                <tbody>
                    <tr key={group.ownerSummary.email} data-testid={"group-owner"}>
                        <td><span className="group-table-person" />{group.ownerSummary.givenName} {group.ownerSummary.familyName} ({group.ownerSummary.email})
                        </td>
                    </tr>
                </tbody>
            </Table>
        </div>}

        <h4>Current group managers</h4>

        {additionalManagers.length == 0 &&
            <p>There are no additional group managers for this group.</p>}
        {additionalManagers.length == 1 && user && additionalManagers[0].id == user.id &&
            <p>You are the only additional manager for this group.</p>}
        {!(additionalManagers.length == 0 || (additionalManagers.length == 1 && user && additionalManagers[0].id == user.id)) &&
            <p>The users below have permission to manage this group.</p>}

        <Table className="group-table">
            <tbody>
                {additionalManagers && additionalManagers.map(manager =>
                    <tr key={manager.email} data-testid={"group-manager"}>
                        <td><span className="icon-group-table-person" />{manager.givenName} {manager.familyName} ({manager.email})</td>
                        {(userIsOwner || user?.id === manager.id) && <td className="group-table-delete">
                            <Button className="d-none d-sm-inline" size="sm" color="tertiary" onClick={() => userIsOwner ?
                                removeManager(manager) : removeSelf(manager)}>
                            Remove
                        </Button></td>}
                    </tr>
                )}
            </tbody>
        </Table>

        {userIsOwner && <>
            <h4>Add additional managers</h4>
            <p>Enter the email of another Isaac teacher account below to add them as a group manager. Note that this will share their email address with the students.</p>
            <Form onSubmit={addManager}>
                <Input type="text" value={newManagerEmail} placeholder="Enter email address here" onChange={event => setNewManagerEmail(event.target.value)}/>
                <p>
                    <small><strong>Remember:</strong> Students may need to reuse the <a
                        onClick={() => dispatch(showGroupInvitationModal({group, user, firstTime: false}))}>group link</a> to approve access to their data for any new teachers.
                    </small>
                </p>
                <Button block onClick={addManager}>Add group manager</Button>
            </Form>
        </>}
    </div>;
};
export const groupManagersModal = (group: AppGroup, user: RegisteredUserDTO) => {
    const userIsOwner = user?.id === group.ownerId;
    return {
        closeAction: () => store.dispatch(closeActiveModal()),
        title: userIsOwner ? "Share your group" : "Shared group",
        body: <CurrentGroupManagersModal groupId={group.id as number} archived={!!group.archived} userIsOwner={userIsOwner} user={user} />,
    };
};

interface GroupEmailModalProps {
    users?: number[];
}
const CurrentGroupEmailModal = ({users}: GroupEmailModalProps) => {
    return <Col>
        <Row>
            An admin user can use the user IDs below to email these users:
        </Row>
        <Row className="my-3">
            <pre>
                {users && users.sort((a, b) => a - b).join(",")}
            </pre>
        </Row>
    </Col>;
};
export const groupEmailModal = (users?: number[]) => ({
    closeAction: () => store.dispatch(closeActiveModal()),
    title: "Email Users",
    body: <CurrentGroupEmailModal users={users} />
});
