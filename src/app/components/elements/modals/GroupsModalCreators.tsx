import React, {lazy, startTransition, useState} from "react";
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
    useCreateGroupMutation,
    showGroupInvitationModal,
} from "../../../state";
import sortBy from "lodash/sortBy";
import {
    below,
    isAda,
    isDefined,
    isTeacherOrAbove,
    PATHS,
    SITE_TITLE_SHORT,
    siteSpecific,
    useDeviceSize
} from "../../../services";
import {Row, Col, Form, Input, Table, Alert, Label, FormFeedback, FormGroup, DropdownToggle, DropdownMenu, DropdownItem, UncontrolledDropdown} from "reactstrap";
import {Button} from "reactstrap";
import {RegisteredUserDTO, UserSummaryWithEmailAddressDTO} from "../../../../IsaacApiTypes";
import {ActiveModalProps, AppGroup, AppGroupTokenDTO} from "../../../../IsaacAppTypes";
import {ShowLoadingQuery} from "../../handlers/ShowLoadingQuery";
import {Loading} from "../../handlers/IsaacSpinner";
import classNames from "classnames";
import {skipToken} from "@reduxjs/toolkit/query";
import {useDispatch} from "react-redux";
import {ReadonlyClipboardInput} from "../inputs/ReadonlyClipboardInput";
import { Spacer } from "../Spacer";
import { StyledCheckbox } from "../inputs/StyledCheckbox";
import { useNavigate } from "react-router";

// Avoid loading the (large) QRCode library unless necessary:
const GroupQRPanel = lazy(() => import("../panels/GroupQRPanel").catch(() => ({default: () => <i>Failed to load QR code panel.</i>})));

const AdditionalManagerSelfRemovalModalBody = ({group}: {group: AppGroup}) => <p>
    You are about to remove yourself as a manager from &apos;{group.groupName}&apos;. This group will no longer appear on your
    &apos;Assignment progress&apos; page or on the &apos;Manage groups&apos; page.  You will still have student connections with the
    students who agreed to share data with you.  The group owner will <strong>not</strong> be notified.
</p>;
export const additionalManagerSelfRemovalModal = (group: AppGroup, user: RegisteredUserDTO) => ({
    closeAction: () => store.dispatch(closeActiveModal()),
    title: "Remove yourself as a group manager",
    body: <AdditionalManagerSelfRemovalModalBody group={group} />,
    buttons: [
        <Row key={0}>
            <Col>
                <Button block color="keyline" onClick={() => {
                    store.dispatch(closeActiveModal());
                }}>
                    Cancel
                </Button>
            </Col>
            <Col>
                <Button block color="solid" onClick={() => {
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
    const [showQR, setShowQR] = useState(false);
    return <div>
        <ShowLoadingQuery
            query={tokenQuery}
            defaultErrorTitle={"Error fetching group joining token"}
            thenRender={token => <div className="d-flex flex-column gap-3">
                <div>
                    {firstTime && <h3>Invite members to join</h3>}
                    <p>Share the link or code to invite people to your group.</p>
                    <p className={"mb-0"}>Students will see the name and email address on your account when they join.</p>
                </div>
                <div>
                    <h3>Share this link</h3>
                    <p>Share this link with students so they can join your group:</p>
                    <ReadonlyClipboardInput data-testid={"share-link"} value={`${location.origin}/account?authToken=${token?.token}`} />
                </div>
                <div>
                    <h3>Generate a QR Code</h3>
                    <p>Students can scan a QR code on their device to join your group:</p>
                    {showQR
                        ? <GroupQRPanel link={`${location.origin}/account?authToken=${token?.token}`} groupName={group.groupName} />
                        : <Button color={siteSpecific("primary", "keyline")} onClick={() => {
                            startTransition(() => {
                                setShowQR(true);
                            });
                        }}>
                            Generate QR Code
                        </Button>
                    }
                </div>
                <div>
                    <h3>Or use this code</h3>
                    <p>Students can enter this code in their {SITE_TITLE_SHORT} account. They’ll need to go to <b>My account</b>, then <b>Teacher Connections</b>.</p>
                    <ReadonlyClipboardInput data-testid={"share-code"} value={token?.token} />
                </div>
                <div>
                    <h3>What to do next</h3>
                </div>
            </div>}
        />
    </div>;
};

const GroupInvitationModalButtons = ({firstTime, group, user}: {firstTime: boolean, group: AppGroup, user: RegisteredUserDTO}) => {
    const navigate = useNavigate();

    return <Row key={0} className="w-100">
        <Col className="pb-0 pb-md-2 pb-lg-0" xs={siteSpecific(undefined, 12)} lg={siteSpecific(undefined, "auto")}>
            <Button block color="primary" className={siteSpecific("btn-keyline", "text-nowrap mb-3")} onClick={() => {
                store.dispatch(closeActiveModal());
                void navigate(PATHS.SET_ASSIGNMENTS);
            }}>
                Set an assignment
            </Button>
        </Col>
        {/* Only teachers are allowed to add additional managers to a group. */}
        {firstTime && isTeacherOrAbove(user) && <Col className="pb-0 pb-md-2 pb-lg-0" xs={siteSpecific(undefined, 12)} lg={siteSpecific(undefined, "auto")}>
            <Button outline block color="secondary" className={siteSpecific("btn-keyline", "text-nowrap mb-3")} onClick={() => {
                void store.dispatch(closeActiveModal());
                void store.dispatch(showGroupManagersModal({group, user}));
            }}>
                Add group managers
            </Button>
        </Col>}
    </Row>;
};

export const groupInvitationModal = (group: AppGroup, user: RegisteredUserDTO, firstTime: boolean, backToCreateGroup?: () => void) => ({
    closeAction: () => store.dispatch(closeActiveModal()),
    title: firstTime ? "Group created" : "Invite users",
    body: <CurrentGroupInviteModal group={group} firstTime={firstTime} />,
    buttons: [
        <GroupInvitationModalButtons key={0} firstTime={firstTime} group={group} user={user} />
    ],
    bodyContainerClassName: "mb-0 pb-0"
});

const CurrentGroupManagersModal = ({groupId, archived, userIsOwner, user}: {groupId: number, archived: boolean, userIsOwner: boolean, user: RegisteredUserDTO}) => {
    const dispatch = useAppDispatch();
    const deviceSize = useDeviceSize();
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
Are you sure you want to promote this manager to group owner?\n
• They will inherit the ability to add additional managers to, archive and delete this group.\n
• You will be demoted to an additional group manager.\n
• You will no longer be able to add or remove other managers, but you will still be able to modify or delete assignments, archive or rename the group or remove group members.
            `;
        } else {
            confirm_text = `
Are you sure you want to promote this manager to group owner?\n
• They will inherit the ability to add additional managers to, archive and delete this group.\n
• You will be demoted to an additional group manager, and will not be able to modify or delete assignments, archive or rename the group or remove group members.\n
• If you wish to retain these privileges, but transfer ownership, click 'cancel' here and then tick the box to give additional managers extra privileges before transferring ownership.
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
            if (confirm("Are you sure you want to remove this teacher from the group?\n\nThey may still have access to student data until students revoke the connection from their " + siteSpecific("\"My Account\"", "\"My account\"") + " page.")) {
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
        <h3>Selected group: {group.groupName}</h3>
        <h4>Sharing permissions</h4>
        <p>
            When you share this group, other teachers can:
            <ul>
                <li>Add and remove students</li>
                <li>Set new assignments or tests</li>
                <li>View student progress</li>
            </ul>
            Additional {siteSpecific("managers", "teachers")} will not automatically see detailed mark data unless students give them access.
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

        <ul className="group-table p-0 mb-3">
            {additionalManagers && additionalManagers.map(manager =>
                <li key={manager.email} className="d-flex align-items-center py-2" data-testid={"group-manager"}>
                    {siteSpecific(
                        <i className="icon icon-my-isaac me-2" />,
                        <span className="icon-group-table-person" />
                    )}
                    <span>{manager.givenName} {manager.familyName} {user.id === manager.id && <span className={"text-muted"}>(you)</span>} ({manager.email})</span>
                    <Spacer />
                    {userIsOwner && <Button className="d-none d-lg-inline" size="sm" color={siteSpecific("tertiary", "keyline")} onClick={() => promoteManager(manager)}>
                        Make owner
                    </Button>}
                    {(userIsOwner || user?.id === manager.id || group.additionalManagerPrivileges) && !(userIsOwner && below["md"](deviceSize)) &&
                        <Button className="d-inline ms-2" size="sm" color={siteSpecific("tertiary", "secondary")}
                            onClick={() => user?.id === manager.id ? removeSelf(manager) : removeManager(manager)}
                        >
                            Remove
                        </Button>}

                    {userIsOwner && <UncontrolledDropdown className="d-inline d-lg-none ms-2">
                        <DropdownToggle caret className="d-flex align-items-center">
                            Actions
                        </DropdownToggle>
                        <DropdownMenu>
                            <DropdownItem onClick={() => promoteManager(manager)}>Make owner</DropdownItem>
                            <DropdownItem onClick={() => (user?.id === manager.id) ? removeSelf(manager) : removeManager(manager)}>Remove</DropdownItem>
                        </DropdownMenu>
                    </UncontrolledDropdown>}
                </li>
            )}
        </ul>

        {userIsOwner && <Alert className={classNames("px-2 py-2 mb-2", {"my-3": isAda})} color={group.additionalManagerPrivileges ? siteSpecific("danger", "info") : "warning"}>
            <StyledCheckbox
                id="additional-manager-privileges-check"
                checked={group.additionalManagerPrivileges}
                className={classNames("mb-2", {"checkbox-bold": isAda})}
                onChange={e => setAdditionalManagerPrivileges(e.target.checked)}
                label={<span>Give additional managers extra privileges</span>}
            />
            {group.additionalManagerPrivileges
                ? <>
                    <span className={"fw-bold"}>Caution</span>: All other group managers are allowed to:
                    <ul>
                        <li>Modify or delete <b>all assignments</b>, including those set by the owner</li>
                        <li>Remove group members</li>
                        <li>Archive and rename the group</li>
                        <li>Add or remove other managers</li>
                    </ul>
                    Un-tick the above box if you would like to remove these additional privileges.
                </>
                : <>
                    Enabling this option allows additional managers to:
                    <ul>
                        <li>Modify or delete <b>all assignments</b>, including those set by the owner</li>
                        <li>Remove group members</li>
                        <li>Archive and rename the group</li>
                        <li>Add or remove other managers</li>
                    </ul>
                </>
            }
        </Alert>}

        {(userIsOwner || group.additionalManagerPrivileges) && <>
            <h4 className="mt-3">Add additional managers</h4>
            <p>Enter the email of another {SITE_TITLE_SHORT} teacher account below to add them as a group manager. Note that this will share their email address with the students.</p>
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

interface GroupCreateModalProps {
    user: RegisteredUserDTO
}

const GroupCreateModal = ({user}: GroupCreateModalProps) => {
    const [newGroupName, setNewGroupName] = useState("");
    const [submissionAttempted, setSubmissionAttempted] = useState(false);
    const [createGroup] = useCreateGroupMutation();
    const dispatch = useDispatch();

    const validateGroupName = () => {
        return !!newGroupName;
    };

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmissionAttempted(true);

        if (!validateGroupName()) {
            return;
        }

        return createGroup(newGroupName).then(async (result) => {
            if (mutationSucceeded(result) && result.data?.id) {
                dispatch(closeActiveModal());
                dispatch(showGroupInvitationModal({group: result.data, user: user, firstTime: true}));
                return true;
            }
            return false;
        });
    };

    return <>
        <Form onSubmit={submit}>
            <FormGroup className="form-group">
                <Label className={classNames("fw-bold form-required")} htmlFor="group-name-input">
                   Enter your group name
                </Label>
                {isAda && <p className="d-block input-description mb-2">Students will see this group name when they are invited to join.</p>}
                <Input invalid={submissionAttempted && !validateGroupName()} id={"group-name-input"} onChange={event => setNewGroupName(event.target.value)} data-testid={"group-name-input"} />
                <FormFeedback id="givenNameValidationMessage">
                    Please enter a valid name.
                </FormFeedback>
            </FormGroup>
            <Button block type={"submit"} className={"mt-4"}>
                Create group
            </Button>
        </Form>
    </>;
};

export const groupCreateModal = (user: RegisteredUserDTO): ActiveModalProps => ({
    closeAction: () => store.dispatch(closeActiveModal()),
    title: "Create a group",
    body: <GroupCreateModal user={user}/>,
    size: "md",
    centered: true
});

const GroupArchiveModal = ({group, toggleArchived}: {group: AppGroup; toggleArchived: () => void;}) => {
    const dispatch = useAppDispatch();

    return <div className="d-flex flex-column gap-3">
        <p>Are you sure you want to archive &quot;{group.groupName}&quot;? You will no longer be able to set assignments or tests to this group, and the group will not be visible {siteSpecific(<>on the <strong>Assignment progress</strong> or <strong>Assignment schedule</strong> pages.</>, <>in the Markbook.</>)}</p>
        <p>A group can be unarchived at any time by navigating to the group in the &quot;Archived&quot; section of this page and clicking &quot;Unarchive group&quot;.</p>
        <div className="text-end">
            <Button color="keyline" className="me-2" onClick={() => dispatch(closeActiveModal())}>
                Cancel
            </Button>
            <Button color="solid" onClick={() => {
                toggleArchived();
                dispatch(closeActiveModal());
            }}>
                Archive
            </Button>
        </div>
    </div>;
};

export const groupArchiveModal = (group: AppGroup, toggleArchived: () => void): ActiveModalProps => ({
    closeAction: () => store.dispatch(closeActiveModal()),
    title: "Archive group",
    body: <GroupArchiveModal group={group} toggleArchived={toggleArchived} />,
    size: "md",
    centered: true
});
