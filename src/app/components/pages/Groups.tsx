import React, {MutableRefObject, useEffect, useMemo, useRef, useState} from "react";
import {
    Button,
    ButtonDropdown,
    Card,
    CardBody,
    Col,
    Container,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Form,
    FormFeedback,
    Input,
    InputGroup,
    InputGroupAddon,
    Nav,
    NavItem,
    NavLink,
    Row, Table,
    UncontrolledButtonDropdown,
    UncontrolledTooltip
} from "reactstrap"
import {Link} from "react-router-dom";
import {
    resetMemberPassword,
    showGroupManagersModal,
    showGroupInvitationModal,
    showGroupEmailModal,
    showAdditionalManagerSelfRemovalModal,
    showErrorToast,
    useAppDispatch,
    mutationSucceeded,
    useGetGroupsQuery,
    useDeleteGroupMutation,
    useCreateGroupMutation,
    useDeleteGroupMemberMutation,
    useUpdateGroupMutation,
    useLazyGetGroupMembersQuery
} from "../../state";
import {ShowLoading} from "../handlers/ShowLoading";
import sortBy from "lodash/sortBy";
import {AppGroup, AppGroupMembership} from "../../../IsaacAppTypes";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {ifKeyIsEnter, isAda, isDefined, isPhy, isStaff, isTeacherOrAbove, siteSpecific} from "../../services";
import {RegisteredUserDTO} from "../../../IsaacApiTypes";
import {ShowLoadingQuery} from "../handlers/ShowLoadingQuery";
import classNames from "classnames";
import {PageFragment} from "../elements/PageFragment";
import {RenderNothing} from "../elements/RenderNothing";

enum SortOrder {
    Alphabetical = "Alphabetical",
    DateCreated = "Date Created"
}

interface GroupCreatorProps {
    createNewGroup: (newGroupName: string) => Promise<boolean>;
}
let tooltip = 0;
const Tooltip = ({children, tipText, ...props}: any) => {
    const [tooltipId] = useState("forTooltip-" + tooltip++);
    return <>
        <span id={tooltipId} {...props}>{children}</span>
        <UncontrolledTooltip target={`#${tooltipId}`}>{tipText}</UncontrolledTooltip>
    </>;
};

const canSendPasswordResetRequest = function(user: AppGroupMembership, passwordRequestSent: boolean) {
    return !passwordRequestSent && user.authorisedFullAccess && user.emailVerificationStatus != 'DELIVERY_FAILED';
};

const passwordResetInformation = function(member: AppGroupMembership, passwordRequestSent: boolean) {
    let message = 'Cannot send password reset request email.';
    if (canSendPasswordResetRequest(member, passwordRequestSent)) {
        message = 'Send a password reset request to this user\'s email address.';
    } else if (passwordRequestSent) {
        message = 'Password reset request sent.';
    } else if (member.emailVerificationStatus == 'DELIVERY_FAILED') {
        message = 'Password reset request cannot be sent because this user\'s account email address is either invalid or not accepting email.';
    }
    return message;
};

interface MemberInfoProps {
    group: AppGroup;
    member: AppGroupMembership;
    user: RegisteredUserDTO;
}
const MemberInfo = ({group, member, user}: MemberInfoProps) => {
    const dispatch = useAppDispatch();
    const [passwordRequestSent, setPasswordRequestSent] = useState(false);
    const [deleteMember] = useDeleteGroupMemberMutation();

    function resetPassword() {
        setPasswordRequestSent(true);
        dispatch(resetMemberPassword(member));
    }

    function confirmDeleteMember() {
        if (confirm(`Are you sure you want to remove this user from the group '${group.groupName}'?`)) {
            deleteMember({groupId: group.id as number, userId: member.id as number});
        }
    }

    const userHasAdditionalGroupPrivileges = (isDefined(user.id) && isDefined(group.ownerId) && user.id === group.ownerId ? true : group.additionalManagerPrivileges) ?? false;

    return <div className="p-2 member-info-item d-flex justify-content-between" data-testid={"member-info"}>
        <div className="pt-1 d-flex flex-fill">
            <span className="d-inline-block icon-group-table-person" />
            <div>
                {member.authorisedFullAccess ?
                    <Link to={`/progress/${member.groupMembershipInformation.userId}`}
                          className={"align-text-top d-flex align-items-stretch"}>
                        <span className="pl-1">{member.givenName} {member.familyName}</span>
                    </Link> :
                    <span className="not-authorised"><span className="pl-1 struck-out">{member.givenName} {member.familyName}</span> (Not Sharing)</span>
                }
            </div>
            <div>
                {member.emailVerificationStatus == "DELIVERY_FAILED" &&
                    <Tooltip tipText={<>
                        This user&apos;s account email address is invalid or not accepting email.<br />
                        They will not be able to reset their password or receive update emails. Ask them to login and update it, or contact us to help resolve the issue.
                    </>} className="icon-email-status failed" />
                }
                {member.emailVerificationStatus == "NOT_VERIFIED" &&
                    <Tooltip tipText="This user has not yet verified their email." className="icon-email-status unverified" />
                }
                {member.groupMembershipInformation && member.groupMembershipInformation.status == "INACTIVE" &&
                    <Tooltip tipText="This user has set their status to inactive for this group. This means they will no longer see new assignments."> (inactive in group)</Tooltip>
                }
            </div>
        </div>
        <div className="d-flex">
            {isTeacherOrAbove(user) && <>
                <Tooltip tipText={passwordResetInformation(member, passwordRequestSent)} className="text-right d-none d-sm-block">
                    <Button color="link" size="sm" className="mx-2" onClick={resetPassword}
                            disabled={!canSendPasswordResetRequest(member, passwordRequestSent)}>
                        {!passwordRequestSent ? 'Reset Password' : 'Reset email sent'}
                    </Button>
                </Tooltip>
            </>}
            {userHasAdditionalGroupPrivileges &&
                <Tooltip tipText="Remove this user from the group." className="text-right d-none d-sm-block">
                    <Button color="link" size="sm" className="mx-2" onClick={confirmDeleteMember} aria-label="Remove member">
                        Remove
                    </Button>
                </Tooltip>
            }
        </div>
    </div>;
};

interface GroupEditorProps {
    user: RegisteredUserDTO;
    group?: AppGroup;
    allGroups?: AppGroup[];
    groupNameInputRef?: MutableRefObject<HTMLInputElement | null>;
}
const GroupEditor = ({group, allGroups, user, createNewGroup, groupNameInputRef}: GroupCreatorProps & GroupEditorProps) => {
    const dispatch = useAppDispatch();

    const [updateGroup] = useUpdateGroupMutation();

    const [isExpanded, setExpanded] = useState(false);
    const [newGroupName, setNewGroupName] = useState(group ? group.groupName : "");
    const isUserGroupOwner = group ? user.id === group.ownerId : false;

    useEffect(() => {
        setExpanded(false);
        setNewGroupName(group?.groupName ?? "");
    }, [group?.id]);

    function saveUpdatedGroup(event: React.FormEvent) {
        event?.preventDefault();
        if (!newGroupName || newGroupName.length === 0 || newGroupName.trim().length === 0) {
            dispatch(showErrorToast(`Cannot ${group ? "rename" : "create"} group`, "The group name must be specified."));
            return;
        }
        if (group) {
            const updatedGroup = {...group, groupName: newGroupName};
            updateGroup({updatedGroup});
        } else {
            createNewGroup(newGroupName);
        }
    }

    function toggleArchived() {
        if (group) {
            const updatedGroup = {...group, archived: !group.archived};
            updateGroup({
                updatedGroup,
                message: "Group " + group.groupName + (updatedGroup.archived ? " archived" : " unarchived")
            });
        }
    }

    function groupUserIds(group?: AppGroup) {
        let groupUserIdList: number[] = [];
        group && group.members && group.members.map((member: AppGroupMembership) =>
            member.groupMembershipInformation.userId && member.authorisedFullAccess &&
            member.groupMembershipInformation.status == "ACTIVE" &&
            groupUserIdList.push(member.groupMembershipInformation.userId)
        );
        return groupUserIdList;
    }

    const bigGroup = group && group.members && group.members.length > 100;

    const usersInGroup = groupUserIds(group);
    const additionalManagers = useMemo(() => {
        const additionalManagers = group && sortBy(group.additionalManagers, manager => manager.familyName && manager.familyName.toLowerCase()) || [];
        return group?.ownerSummary ? [group.ownerSummary, ...additionalManagers] : additionalManagers;
    }, [group]);

    const canArchive = group && (isUserGroupOwner || group.additionalManagerPrivileges);
    const canEmailUsers = isStaff(user) && usersInGroup.length > 0;

    const existingGroupWithConflictingName = allGroups?.find(g => g.groupName == newGroupName && (isDefined(group) ? group.id != g.id : true));
    const isGroupNameInvalid = isDefined(newGroupName) && isDefined(existingGroupWithConflictingName);
    const isGroupNameValid = isDefined(newGroupName) && newGroupName.length > 0 && !allGroups?.some(g => g.groupName == newGroupName) && (isDefined(group) ? newGroupName !== group.groupName : true);
    
    return <Card>
        <CardBody>
            <h4 className={"mb-2"}>{group ? "Manage group" : "Create group"}</h4>
            {isAda && <hr/>}
            <Row>
                <Col xs={12} sm={canArchive ? 8 : 12}>
                    <Form inline onSubmit={saveUpdatedGroup}>
                        <InputGroup className="w-100 separate-input-group">
                            <Input
                                innerRef={groupNameInputRef} length={50} placeholder="Group name" value={newGroupName}
                                onChange={e => setNewGroupName(e.target.value)} aria-label="Group Name" disabled={isDefined(group) && !(isUserGroupOwner || group.additionalManagerPrivileges)}
                                invalid={isGroupNameInvalid}
                                valid={isGroupNameValid}
                            />
                            {(!isDefined(group) || isUserGroupOwner || group.additionalManagerPrivileges) && <InputGroupAddon addonType="append">
                                <Button
                                    color={siteSpecific("secondary", "primary")}
                                    className={classNames("py-0", {"px-0 border-dark": isPhy})} disabled={newGroupName === "" || (isDefined(group) && newGroupName === group.groupName)}
                                    onClick={saveUpdatedGroup}
                                    size="sm"
                                >
                                    {group ? "Update" : "Create"}
                                </Button>
                            </InputGroupAddon>}
                            <FormFeedback>A{existingGroupWithConflictingName?.archived ? <>n archived</> : <></>} group with that name already exists.</FormFeedback>
                        </InputGroup>
                    </Form>
                </Col>
                {canArchive && <Col xs={12} sm={4} className={"mt-2 mt-sm-0"}>
                    <Button title={group?.archived ? "Unarchive this group" : "Archive this group"} block size="sm" outline={isAda} color={siteSpecific("tertiary", "secondary")} onClick={toggleArchived}>
                        {group?.archived ? "Unarchive" : "Archive"}
                    </Button>
                </Col>}
            </Row>
            <Row className="pt-1 mb-3">
                <Col className="text-right text-muted">
                    *Group name is shared with students
                </Col>
            </Row>
            {group && <>
                <Row className={siteSpecific("mb-2", "mb-3")}>
                    <Col xs={12} sm={"auto"}>
                        <h4 className={isAda ? "py-1" : ""}>Group managers</h4>
                    </Col>
                    {isTeacherOrAbove(user) && <Col xs={12} sm={"auto"} className={"mt-1 mt-sm-0 ml-auto"}>
                        {/* Only teachers and above can add group managers */}
                        <Button outline={isAda} className="w-100 w-sm-auto d-inline-block text-nowrap" size="sm" color={siteSpecific("tertiary", "secondary")} onClick={() => dispatch(showGroupManagersModal({group, user}))}>
                            {isUserGroupOwner
                                ? <>Add {additionalManagers.length > 1 ? <>/ remove</> : <></>}<span className="d-none d-xl-inline">{" "}group managers</span></>
                                : <>More info<span className="d-none d-sm-inline">rmation</span></>
                            }
                        </Button>
                    </Col>}
                </Row>

                {additionalManagers.length == 1 && user && additionalManagers[0].id == user.id &&
                    (user.id === group.ownerId
                        ? <p>You are the owner of this group.</p>
                        : <p>You are the only additional manager for this group.</p>
                    )
                }
                {!(additionalManagers.length == 0 || (additionalManagers.length == 1 && user && additionalManagers[0].id == user.id)) &&
                    <p>The {additionalManagers.length} user(s) below have permission to manage this group.</p>}

                {additionalManagers && <Table className={classNames("group-table", {"mt-1": isAda})}>
                    <tbody>
                    {additionalManagers.map((manager, i) =>
                        <tr key={manager.email} data-testid={"group-manager"} className={classNames({"border-0 bg-transparent": isAda})}>
                            <td className={classNames("align-middle", {"border-top-0": i === 0, "border-0 p-2 bg-transparent": isAda})}>
                                <span className="icon-group-table-person" />{manager.givenName} {manager.familyName} {manager.id === group.ownerId && "(group owner)"} {user.id === manager.id && "(you)"}
                            </td>
                        </tr>
                    )}
                    </tbody>
                </Table>}
            </>}
            {group && <>
                <hr/>
                <Row className="mt-2 mb-1">
                    <Col>
                        <ShowLoading until={group.members}>
                            {group.members && <div>
                                <Row className={siteSpecific("mb-2", "mb-3")}>
                                    <Col xs={12} sm={"auto"}>
                                        <h4 className={isAda ? "py-1" : ""}>Group members</h4>
                                    </Col>
                                    <Col xs={canEmailUsers ? 6 : 12} sm={"auto"} className={classNames("ml-auto", {"pr-1": canEmailUsers})}>
                                        <Button
                                            size="sm" className={"d-inline-block text-nowrap w-100 w-sm-auto"}
                                            color={siteSpecific("primary", "secondary")}
                                            onClick={() => dispatch(showGroupInvitationModal({group, user, firstTime: false}))}
                                        >
                                            Invite users
                                        </Button>
                                    </Col>
                                    {isStaff(user) && usersInGroup.length > 0 && <Col xs={6} sm={"auto"} className={"pl-1"}>
                                        <Button
                                            size="sm" className={"d-inline-block text-nowrap w-100 w-sm-auto"}
                                            color={siteSpecific("primary", "secondary")}
                                            onClick={() => dispatch(showGroupEmailModal(usersInGroup))}
                                        >
                                            Email users
                                        </Button>
                                    </Col>}
                                </Row>
                                <div>
                                    There are {group.members.length} users in this group {" "}
                                    {bigGroup && !isExpanded &&
                                        <ButtonDropdown className="float-right" toggle={() => setExpanded(true)}>
                                            <DropdownToggle caret>Show</DropdownToggle>
                                        </ButtonDropdown>
                                    }
                                </div>
                                <div>
                                    {(!bigGroup || isExpanded) && group.members.map((member: AppGroupMembership) => (
                                        <MemberInfo
                                            key={member.groupMembershipInformation.userId}
                                            member={member}
                                            group={group}
                                            user={user}
                                        />
                                    ))}
                                </div>
                            </div>}
                        </ShowLoading>
                    </Col>
                </Row>
            </>}
        </CardBody>
    </Card>;
};

const MobileGroupCreatorComponent = ({className, createNewGroup, allGroups}: GroupCreatorProps & {className: string, allGroups: AppGroup[]}) => {
    const dispatch = useAppDispatch();
    const [newGroupName, setNewGroupName] = useState("");

    function saveUpdatedGroup() {
        if (!newGroupName || newGroupName.length === 0 || newGroupName.trim().length === 0) {
            dispatch(showErrorToast("Cannot create group", "The group name must be specified."));
            return;
        }
        createNewGroup(newGroupName).then(success => {
            if (success) {
                setNewGroupName("");
            }
        });
    }

    const existingGroupWithConflictingName = allGroups?.find(g => g.groupName == newGroupName);
    const isGroupNameInvalid = isDefined(newGroupName) && isDefined(existingGroupWithConflictingName);
    const isGroupNameValid = isDefined(newGroupName) && newGroupName.length > 0 && !allGroups?.some(g => g.groupName == newGroupName);

    return <Row className={className}>
        <Col size={12} className={siteSpecific("mt-2", "")}>
            <h6 className={siteSpecific("", "font-weight-semi-bold")}>Create New Group</h6>
        </Col>
        <Col size={12} className="mb-2">
            <Form>
                <InputGroup>
                    <Input length={50} placeholder="Enter the name of your group here" value={newGroupName}
                        onChange={e => setNewGroupName(e.target.value)} aria-label="Group Name"
                        invalid={isGroupNameInvalid}
                        valid={isGroupNameValid}
                        />
                    <FormFeedback>A{existingGroupWithConflictingName?.archived ? <>n archived</> : <></>} group with that name already exists.</FormFeedback>
                </InputGroup>
            </Form>
        </Col>
        <Col size={12} className={siteSpecific("", "mt-2")}>
            <Button block color="primary" outline={isAda} onClick={saveUpdatedGroup} disabled={newGroupName == ""}>
                Create group
            </Button>
        </Col>
    </Row>;
};

export const Groups = ({user}: {user: RegisteredUserDTO}) => {
    const dispatch = useAppDispatch();
    const [showArchived, setShowArchived] = useState(false);
    const groupQuery = useGetGroupsQuery(showArchived);
    const { currentData: groups, isLoading, isFetching } = groupQuery;
    const otherGroups = useGetGroupsQuery(!showArchived);

    const allGroups = [...(groups ?? []) , ...(otherGroups.currentData ?? [])];

    const [createGroup] = useCreateGroupMutation();
    const [deleteGroup] = useDeleteGroupMutation();

    const [selectedGroupId, setSelectedGroupId] = useState<number>();
    const selectedGroup = (isLoading || isFetching) ? undefined : groups?.find(g => g.id === selectedGroupId);

    // Clear the selected group when switching between tabs
    const switchTab = (archived: boolean) => {
        setShowArchived(archived);
        setSelectedGroupId(undefined);
    }
    const tabs = [
        {
            name: "Active",
            active: () => !showArchived,
            activate: () => switchTab(false)
        },
        {
            name: "Archived",
            active: () => showArchived,
            activate: () => switchTab(true)
        }
    ];

    const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.Alphabetical);

    const sortedGroups = useMemo(() => {
        if (!groups) return [];
        switch(sortOrder) {
            case SortOrder.Alphabetical:
                return groups.slice().sort((a, b) => {
                    if (a.groupName && b.groupName) return (a.groupName.localeCompare(b.groupName, undefined, { numeric: true, sensitivity: 'base' }));
                    return 1;
                });
            case SortOrder.DateCreated:
                return sortBy(groups, g => g.created).reverse();
        }
    }, [groups, sortOrder]);

    const createNewGroup: (newGroupName: string) => Promise<boolean> = async (newGroupName: string) => {
        setShowArchived(false);
        return createGroup(newGroupName).then(async (result) => {
            if (mutationSucceeded(result)) {
                const group = result.data;
                if (!group.id) return false;
                dispatch(showGroupInvitationModal({group, user, firstTime: true, backToCreateGroup: () => setSelectedGroupId(undefined)}));
                setSelectedGroupId(group.id);
                return true;
            }
            return false;
        });
    };

    const confirmDeleteGroup = (groupToDelete: AppGroup) => {
        if (user.id === groupToDelete.ownerId) {
            if (confirm("Are you sure you want to permanently delete the group '" + groupToDelete.groupName + "' and remove all associated assignments?\n\nThis action cannot be undone!")) {
                deleteGroup(groupToDelete.id as number).then(result => {
                    if (mutationSucceeded(result)) {
                        setSelectedGroupId(undefined);
                    }
                });
            }
        } else {
            if (confirm("You cannot delete this group, because you are not the group owner.  Do you want to remove yourself as a manager of '" + groupToDelete.groupName + "'?")) {
                dispatch(showAdditionalManagerSelfRemovalModal({group: groupToDelete, user}));
            }
        }
    };

    // Get member data for selected group
    const [getGroupMembers] = useLazyGetGroupMembersQuery();
    useEffect(() => {
        if (selectedGroup?.id) {
            getGroupMembers(selectedGroup.id);
        }
    }, [selectedGroup?.id]); // This can't just be group, because group changes when the members change, causing an infinite reload loop

    const groupNameInputRef = useRef<HTMLInputElement>(null);

    const pageHelp = <span>
        Use this page to manage groups. You can add users to a group by giving them the group code and asking them paste it into their account settings page.
        <br />
        You can find the code for an existing group by selecting the group and clicking <i>Invite Users</i>.
    </span>;

    return <Container>
        <TitleAndBreadcrumb currentPageTitle="Manage groups" className="mb-4" help={pageHelp} modalId="groups_help_modal" />
        <PageFragment fragmentId={"groups_help"} ifNotFound={RenderNothing} />
        <ShowLoadingQuery query={groupQuery} defaultErrorTitle={"Error fetching groups"}>
            <Row className="mb-5">
                <Col lg={4}>
                    <Card>
                        <CardBody>
                            <MobileGroupCreatorComponent className="d-block d-lg-none" createNewGroup={createNewGroup} allGroups={allGroups}/>
                            <div className="d-none d-lg-block mb-3">
                                <Button block color="primary" outline onClick={() => {
                                    setSelectedGroupId(undefined);
                                    if (groupNameInputRef.current) {
                                        groupNameInputRef.current.focus();
                                    }
                                }}>Create new group</Button>
                            </div>
                            <hr/>
                            <div className="text-left mt-3">
                                <strong className={"mr-2"}>Groups:</strong>
                                <UncontrolledButtonDropdown size="sm">
                                    <DropdownToggle color={siteSpecific("tertiary", "secondary")} caret size={"sm"}>
                                        {sortOrder}
                                    </DropdownToggle>
                                    <DropdownMenu>
                                        {Object.values(SortOrder).map(item =>
                                            <DropdownItem key={item} onClick={() => setSortOrder(item)}>{item}</DropdownItem>
                                        )}
                                    </DropdownMenu>
                                </UncontrolledButtonDropdown>
                            </div>
                            <Nav tabs className={classNames("d-flex flex-wrap guaranteed-single-line mt-3", {"mb-3": isPhy})}>
                                {tabs.map((tab, index) => {
                                    return <NavItem key={index} className={classNames({"px-2": isPhy, "active": tab.active()})}>
                                        <NavLink
                                            className={classNames("text-center", {"px-2": isAda})} tabIndex={0}
                                            onClick={tab.activate} onKeyDown={ifKeyIsEnter(tab.activate)}
                                        >
                                            {tab.name}
                                        </NavLink>
                                    </NavItem>;
                                })}
                            </Nav>
                            <div className="mt-3 mt-lg-0">
                                {sortedGroups && sortedGroups.length > 0
                                    ? sortedGroups.map((g: AppGroup) =>
                                        <div key={g.id} className="group-item p-2" data-testid={"group-item"}>
                                            <div className="d-flex justify-content-between align-items-center group-name-buttons">
                                                <Button title={isStaff(user) ? `Group id: ${g.id}` : undefined} color="link text-left" data-testid={"select-group"} className="px-1 flex-fill group-name" onClick={() => setSelectedGroupId(g.id)}>
                                                    {g.groupName}
                                                </Button>
                                                {showArchived &&
                                                    <button
                                                        onClick={(e) => {e.stopPropagation(); confirmDeleteGroup(g);}}
                                                        aria-label="Delete group" className="bin-icon ml-1" title={"Delete group"}
                                                    >
                                                    </button>
                                                }
                                            </div>
                                            {selectedGroup && selectedGroup.id === g.id && <div className="d-lg-none py-2">
                                                <GroupEditor user={user} group={selectedGroup} allGroups={allGroups} createNewGroup={createNewGroup}/>
                                            </div>}
                                        </div>)
                                    : <div className={"group-item p-2"}>No {showArchived ? "archived" : "active"} groups</div>
                                }
                            </div>
                        </CardBody>
                    </Card>
                </Col>
                <Col lg={8} className="d-none d-lg-block" data-testid={"group-editor"}>
                    <GroupEditor group={selectedGroup} allGroups={allGroups} groupNameInputRef={groupNameInputRef} user={user} createNewGroup={createNewGroup} />
                </Col>
            </Row>
        </ShowLoadingQuery>
    </Container>;
};
