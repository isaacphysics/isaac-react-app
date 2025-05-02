import React, {useState} from "react";
import {
    closeActiveModal,
    showAdditionalManagerSelfRemovalModal,
    showGroupManagersModal,
    store,
    useAppDispatch,
    mutationSucceeded,
    useGetGroupsQuery,
    useUpdateGroupMutation,
    useAddGroupManagerMutation,
    useDeleteGroupManagerMutation,
    usePromoteGroupManagerMutation,
    useGetGroupTokenQuery,
    groupsApi,
} from "../../../state";
import sortBy from "lodash/sortBy";
import {history, isAda, isDefined, isPhy, isTeacherOrAbove, PATHS, siteSpecific} from "../../../services";
import {Row, Col, Form, Input, Table, Alert, Label} from "reactstrap";
import {Button} from "reactstrap";
import {RegisteredUserDTO, UserSummaryWithEmailAddressDTO} from "../../../../IsaacApiTypes";
import {AppGroup, AppGroupTokenDTO} from "../../../../IsaacAppTypes";
import {ShowLoadingQuery} from "../../handlers/ShowLoadingQuery";
import {Loading} from "../../handlers/IsaacSpinner";
import classNames from "classnames";
import {skipToken} from "@reduxjs/toolkit/query";

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
                        store.dispatch(groupsApi.endpoints.deleteGroupManager.initiate({groupId: group.id, managerUserId: user.id}));
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
    const tokenQuery = useGetGroupTokenQuery(group.id as number);
    return <>
        {firstTime && <span className={siteSpecific("h3 mb-3", "h1")}>Invite users</span>}
        <p>Use one of the following methods to add users to your group. Students joining your group will be shown your name and account email and asked to confirm sharing data.</p>
        <ShowLoadingQuery
            query={tokenQuery}
            defaultErrorTitle={"Error fetching group joining token"}
            thenRender={token => <>
                <div className={classNames("jumbotron rounded px-3 px-sm-4", siteSpecific("pt-2", "py-3 py-sm-5"))}>
                    <span className={siteSpecific("h4", "h2 font-size-1-5")}>Option 1: Share link</span>
                    <p>Share the following link with your students to have them join your group:</p>
                    <span className="text-center h4 overflow-auto user-select-all d-block border bg-light p-1" data-testid={"share-link"}>
                        {location.origin}/account?authToken={token?.token}
                    </span>
                </div>
                <div className={classNames("jumbotron rounded px-3 px-sm-4", siteSpecific("pt-2", "py-3 py-sm-5"))}>
                    <span className={siteSpecific("h4", "h2 font-size-1-5")}>Option 2: Share code</span>
                    <p>Ask your students to enter the following code into the Teacher Connections tab on their &lsquo;My account&rsquo; page:</p>
                    <span className={classNames("text-center user-select-all d-block border bg-light p-1", siteSpecific("h4", "h3"))} data-testid={"share-code"}>{token?.token}</span>
                </div>
            </>}
        />
        <p>
            {firstTime ? "Now you've made a group, you may want to:" : "Once you have invited users to the group, you may want to:"}
        </p>
    </>;
};
export const groupInvitationModal = (group: AppGroup, user: RegisteredUserDTO, firstTime: boolean, backToCreateGroup?: () => void) => ({
    closeAction: () => store.dispatch(closeActiveModal()),
    title: firstTime ? "Group Created" : "Invite Users",
    body: <CurrentGroupInviteModal group={group} firstTime={firstTime} />,
    buttons: [
        <Row key={0}>
            {/* Only teachers are allowed to add additional managers to a group. */}
            {firstTime && isTeacherOrAbove(user) && <Col className="pb-0 pb-md-2 pd-lg-0" xs={siteSpecific(undefined, 12)} lg={siteSpecific(undefined, "auto")}>
                <Button block color="secondary" size={siteSpecific(undefined, "sm")} className={siteSpecific("btn-keyline", "text-nowrap mb-3")} onClick={() => {
                    store.dispatch(closeActiveModal());
                    store.dispatch(showGroupManagersModal({group, user}));
                }}>
                    Add group managers
                </Button>
            </Col>}
            <Col className="pb-0 pb-md-2 pd-lg-0" xs={siteSpecific(undefined, 12)} lg={siteSpecific(undefined, "auto")}>
                <Button block color="secondary" size={siteSpecific(undefined, "sm")} className={siteSpecific("btn-keyline", "text-nowrap mb-3")} onClick={() => {
                    store.dispatch(closeActiveModal());
                    history.push(PATHS.SET_ASSIGNMENTS);
                }}>
                    Set an assignment
                </Button>
            </Col>
            {firstTime && <Col xs={siteSpecific(undefined, 12)} lg={siteSpecific(undefined, "auto")}>
                <Button block color="secondary" size={siteSpecific(undefined, "sm")} className={siteSpecific("btn-keyline", "text-nowrap mb-3")} onClick={() => {
                    store.dispatch(closeActiveModal());
                    backToCreateGroup?.();
                }}>
                    Create another group
                </Button>
            </Col>}
        </Row>
    ]
});

const CurrentGroupManagersModal = ({groupId, archived, userIsOwner, user}: {groupId: number, archived: boolean, userIsOwner: boolean, user: RegisteredUserDTO}) => {
    const dispatch = useAppDispatch();
    const {data: groups} = useGetGroupsQuery(archived);
    const group = groups?.find(g => g.id === groupId);
    const [addGroupManager] = useAddGroupManagerMutation();
    const [deleteGroupManager] = useDeleteGroupManagerMutation();
    const [promoteGroupManager] = usePromoteGroupManagerMutation();
    const [updateGroup] = useUpdateGroupMutation();

    const additionalManagers = group && sortBy(group.additionalManagers, manager => manager.familyName && manager.familyName.toLowerCase()) || [];

    const [newManagerEmail, setNewManagerEmail] = useState("");

    function addManager(event: any) {
        if (event) {
            event.preventDefault();
        }
        if (group?.id) {
            addGroupManager({groupId: group.id, managerEmail: newManagerEmail}).then((result) => {
                if (mutationSucceeded(result)) {
                    // Successful addition, clear new manager email field
                    setNewManagerEmail("");
                }
            });
        }
    }

    function promoteManager(manager: UserSummaryWithEmailAddressDTO) {
        let confirm_text = "";
        if (group?.additionalManagerPrivileges) {
            confirm_text = `
Are you sure you want to promote this manager to group owner?
They will inherit the ability to add additional managers to, archive and delete this group.
You will be demoted to an additional group manager.
You will no longer be able to add or remove other managers, but you will still be able to modify or delete assignments, archive or rename the group or remove group members.
            `;
        } else {
            confirm_text = `
Are you sure you want to promote this manager to group owner?
They will inherit the ability to add additional managers to, archive and delete this group.
You will be demoted to an additional group manager, and will not be able to modify or delete assignments, archive or rename the group or remove group members.
If you wish to retain these privileges, but transfer ownership, click 'cancel' here and then tick the box to give additional managers extra privileges before transferring ownership.
            `;
        }

        if (group?.id) {
            if (confirm(confirm_text)) {
                promoteGroupManager({groupId: group.id, managerUserId: manager.id as number}).then(response => {
                    if (mutationSucceeded(response)) {
                        dispatch(closeActiveModal());
                    }
                });
            }
        }
    }

    function setAdditionalManagerPrivileges(additionalManagerPrivileges: boolean) {
        if (group) {
            const updatedGroup = {...group, additionalManagerPrivileges};
            updateGroup({
                updatedGroup
            });
        }
    }

    function removeManager(manager: UserSummaryWithEmailAddressDTO) {
        if (group?.id) {
            if (confirm("Are you sure you want to remove this teacher from the group?\nThey may still have access to student data until students revoke the connection from their My account pages.")) {
                deleteGroupManager({groupId: group.id, managerUserId: manager.id as number});
            }
        }
    }

    function removeSelf(manager: RegisteredUserDTO | null) {
        if (manager && group) {
            dispatch(closeActiveModal());
            dispatch(showAdditionalManagerSelfRemovalModal({group, user: manager}));
        }
    }

    const tokenQuery = useGetGroupTokenQuery(group?.id ?? skipToken);
    const generateGroupLinkReminder = (token?: AppGroupTokenDTO) => <p>
        <small><strong>Remember:</strong> Students may need to reuse the group link{token && <>&nbsp;(<code>{location.origin}/account?authToken={token?.token}</code>)</>} to approve access to their data for any new teachers.</small>
    </p>;

    return !group ? <Loading/> : <div className={"mb-4"}>
        <div className={siteSpecific("h3", "h2")}>Selected group: {group.groupName}</div>
        <b>Sharing permissions</b>
        <p>
            When you share this group, other teachers can:
            <ul>
                <li>Add and remove students</li>
                <li>Set new assignments or tests</li>
                <li>View student progress</li>
            </ul>
            Additional {siteSpecific("managers", "teachers")} will not automatically see detailed mark data unless students give them access.
        </p>

        {isPhy && <p>
            {group.additionalManagerPrivileges
                ? <>Additional managers have been allowed by the group owner to:
                    <ul>
                        <li>Modify and delete all assignments to the group</li>
                        <li>Remove group members</li>
                        <li>Archive the group</li>
                        <li>Rename the group</li>
                    </ul>
                    Additional managers cannot add or remove other managers.
                </>
                : "Additional managers cannot modify or delete each others assignments by default, archive and rename the group, or remove group members, but these features can be enabled by the group owner."
            }
        </p>}

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
                        <td className={"align-middle"}>
                            <span className="icon-group-table-person" />{manager.givenName} {manager.familyName} {user.id === manager.id && <span className={"text-muted"}>(you)</span>} ({manager.email})
                        </td>
                        {userIsOwner && <td className={"text-center"}>
                            <Button outline={isAda} className="d-none d-sm-inline" size="sm" color={siteSpecific("tertiary", "secondary")} onClick={() => promoteManager(manager)}>
                                Make owner
                            </Button>
                        </td>}
                        {(userIsOwner || user?.id === manager.id) && <td className={"text-center"}>
                            <Button className="d-none d-sm-inline" size="sm" color={siteSpecific("tertiary", "secondary")} 
                                onClick={() => userIsOwner ? removeManager(manager) : removeSelf(manager)}
                            >
                                Remove
                            </Button>
                        </td>}
                    </tr>
                )}
            </tbody>
        </Table>

        {userIsOwner && <Alert className={classNames("px-2 py-2 mb-2", {"my-3": isAda})} color={group.additionalManagerPrivileges ? siteSpecific("danger", "info") : "warning"}>
            <div>
                <Input
                    id="additional-manager-privileges-check"
                    checked={group.additionalManagerPrivileges}
                    className={"mb-2 checkbox-bold"}
                    type="checkbox"
                    onChange={e => setAdditionalManagerPrivileges(e.target.checked)}
                />
                <Label for="additional-manager-privileges-check" className="ms-2 mb-0">Give additional managers extra privileges</Label>
            </div>
            {group.additionalManagerPrivileges
                ? <>
                    <span className={"fw-bold"}>Caution</span>: All other group managers are allowed to:
                    <ul>
                        <li>Modify or delete <b>all assignments</b>, including those set by the owner</li>
                        <li>Remove group members</li>
                        <li>Archive and rename the group</li>
                    </ul>                                                       
                    Additional managers cannot add or remove other managers. <br/>
                    Un-tick the above box if you would like to remove these additional privileges.
                </>
                : <>
                    Enabling this option allows additional managers to:
                    <ul>
                        <li>Modify or delete <b>all assignments</b>, including those set by the owner</li>
                        <li>Remove group members</li>
                        <li>Archive and rename the group</li>
                    </ul>
                </>
            }
        </Alert>}

        {userIsOwner && <>
            <h4 className={classNames({"mt-2": isAda})}>Add additional managers</h4>
            <p>Enter the email of another {siteSpecific("Isaac", "Ada")} teacher account below to add them as a group manager. Note that this will share their email address with the students.</p>
            <Form onSubmit={addManager}>
                <Input type="text" value={newManagerEmail} placeholder="Enter email address here" onChange={event => setNewManagerEmail(event.target.value)}/>
                <ShowLoadingQuery
                    query={tokenQuery}
                    placeholder={generateGroupLinkReminder()}
                    ifError={() => generateGroupLinkReminder()}
                    thenRender={generateGroupLinkReminder}
                />
                <Button block className={siteSpecific("groups-modal-btn", "")} onClick={addManager} disabled={!isDefined(newManagerEmail) || newManagerEmail === ""}>Add group manager</Button>
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
