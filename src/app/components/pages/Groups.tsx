import React, {useEffect, useMemo, useRef, useState} from "react";
import {
    Button,
    ButtonDropdown,
    Card,
    CardBody,
    CardProps,
    Col,
    Container,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Form,
    FormFeedback,
    Input,
    InputGroup, Label,
    Nav,
    NavItem,
    NavLink,
    Row,
    Table,
    UncontrolledButtonDropdown,
    UncontrolledTooltip
} from "reactstrap";
import {Link, useLocation} from "react-router-dom";
import {
    AppDispatch,
    resetMemberPassword,
    showAdditionalManagerSelfRemovalModal,
    showCreateGroupModal,
    showErrorToast,
    showGroupArchiveModal,
    showGroupEmailModal,
    showGroupInvitationModal,
    showGroupManagersModal,
    useAppDispatch,
    useDeleteGroupMemberMutation,
    useDeleteGroupMutation,
    useGetGroupsQuery,
    useLazyGetGroupMembersQuery,
    useUpdateGroupMutation
} from "../../state";
import {ShowLoading} from "../handlers/ShowLoading";
import sortBy from "lodash/sortBy";
import {AppGroup, AppGroupMembership} from "../../../IsaacAppTypes";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {
    below,
    ifKeyIsEnter,
    isAda,
    isDefined,
    isPhy,
    isStaff,
    isTeacherOrAbove,
    SITE_TITLE_SHORT,
    siteSpecific,
    useDeviceSize
} from "../../services";
import {RegisteredUserDTO} from "../../../IsaacApiTypes";
import {ShowLoadingQuery} from "../handlers/ShowLoadingQuery";
import classNames from "classnames";
import {PageFragment} from "../elements/PageFragment";
import {RenderNothing} from "../elements/RenderNothing";
import {StyledCheckbox} from "../elements/inputs/StyledCheckbox";
import { StyledTabPicker } from "../elements/inputs/StyledTabPicker";
import { PageMetadata } from "../elements/PageMetadata";
import { GroupsSidebar } from "../elements/sidebar/GroupsSidebar";
import { MyAdaSidebar } from "../elements/sidebar/MyAdaSidebar";
import { PageContainer } from "../elements/layout/PageContainer";
import { IconButton } from "../elements/AffixButton";

enum SortOrder {
    Alphabetical = "Alphabetical",
    DateCreated = "Date Created"
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const confirmDeleteGroup = (dispatch: AppDispatch, deleteGroup: any, user: RegisteredUserDTO, groupToDelete: AppGroup) => {
    if (user.id === groupToDelete.ownerId) {
        if (confirm("Are you sure you want to permanently delete the group '" + groupToDelete.groupName + "' and remove all associated assignments?\n\nThis action cannot be undone!")) {
            deleteGroup(groupToDelete.id as number);
        }
    } else {
        if (confirm("You cannot delete this group, because you are not the group owner.  Do you want to remove yourself as a manager of '" + groupToDelete.groupName + "'?")) {
            dispatch(showAdditionalManagerSelfRemovalModal({group: groupToDelete, user}));
        }
    }
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
    const deviceSize = useDeviceSize();

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
            {siteSpecific(
                <i className="d-none d-md-inline-block icon icon-my-isaac me-2"/>,
                <span className="d-none d-md-inline-block icon-group-table-person"/>
            )}
            <div>
                {member.authorisedFullAccess ?
                    <Link to={`/progress/${member.groupMembershipInformation.userId}`}
                        className={"align-text-top d-flex align-items-stretch"}
                    >
                        <span className="ps-1">{member.givenName} {member.familyName}</span>
                    </Link> :
                    <span className="not-authorised"><span className="ps-1 struck-out">{member.givenName} {member.familyName}</span> (Not Sharing)</span>
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
                    <Tooltip className="ms-1" tipText="This user has set their status to inactive for this group. This means they will no longer see new assignments.">(inactive in group)</Tooltip>
                }
            </div>
        </div>
        <div className="d-flex">
            {["xs", "sm"].includes(deviceSize)? <>
                <UncontrolledButtonDropdown size="sm">
                    <DropdownToggle caret className="text-nowrap" color="link" size="sm">
                        Manage
                    </DropdownToggle>
                    <DropdownMenu>
                        {isTeacherOrAbove(user) &&
                            <DropdownItem onClick={resetPassword} disabled={!canSendPasswordResetRequest(member, passwordRequestSent)}>
                                {!passwordRequestSent ? 'Reset password' : 'Reset email sent'}
                            </DropdownItem>
                        }
                        {userHasAdditionalGroupPrivileges &&
                            <DropdownItem onClick={confirmDeleteMember} aria-label="Remove member">Remove</DropdownItem>
                        }
                    </DropdownMenu>
                </UncontrolledButtonDropdown>
            </> : <>
                {isTeacherOrAbove(user) && <>
                    <Tooltip tipText={passwordResetInformation(member, passwordRequestSent)} className="text-end d-none d-sm-block">
                        <Button color="link" size="sm" className="mx-2" onClick={resetPassword}
                            disabled={!canSendPasswordResetRequest(member, passwordRequestSent)}
                        >
                            {!passwordRequestSent ? 'Reset password' : 'Reset email sent'}
                        </Button>
                    </Tooltip>
                </>}
                {userHasAdditionalGroupPrivileges &&
                    <Tooltip tipText="Remove this user from the group." className="text-end d-none d-sm-block">
                        <Button color="link" size="sm" className="mx-2" onClick={confirmDeleteMember} aria-label="Remove member">
                            Remove
                        </Button>
                    </Tooltip>
                }
            </>}
        </div>
    </div>;
};

interface GroupEditorProps extends CardProps {
    user: RegisteredUserDTO;
    group: AppGroup;
    allGroups?: AppGroup[];
}
const GroupEditor = ({group, allGroups, user, ...rest}: GroupEditorProps) => {
    const dispatch = useAppDispatch();

    const [updateGroup] = useUpdateGroupMutation();

    const [isExpanded, setExpanded] = useState(false);
    const [newGroupName, setNewGroupName] = useState(group.groupName);
    const isUserGroupOwner = user.id === group.ownerId;

    useEffect(() => {
        setExpanded(false);
        setNewGroupName(group?.groupName ?? "");
    }, [group.id]);

    function saveUpdatedGroup(event: React.FormEvent) {
        event?.preventDefault();
        if (!newGroupName || newGroupName.length === 0 || newGroupName.trim().length === 0) {
            dispatch(showErrorToast("Cannot rename group", "The group name must be specified."));
            return;
        }

        const updatedGroup = {...group, groupName: newGroupName};
        updateGroup({updatedGroup});
    }

    function toggleSelfRemoval() {
        if (group) {
            const updatedGroup = {...group, selfRemoval: !group.selfRemoval};
            updateGroup({
                updatedGroup,
                message: "Group member self-removal " + (updatedGroup.selfRemoval ? "enabled" : "disabled") + "."
            });
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

    function groupUserIds(group: AppGroup) {
        const groupUserIdList: number[] = [];
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        group.members && group.members.map((member: AppGroupMembership) =>
            member.groupMembershipInformation.userId && member.authorisedFullAccess &&
            member.groupMembershipInformation.status == "ACTIVE" &&
            groupUserIdList.push(member.groupMembershipInformation.userId)
        );
        return groupUserIdList;
    }

    const bigGroup = group.members && group.members.length > 100;

    const usersInGroup = groupUserIds(group);
    const additionalManagers = useMemo(() => {
        const additionalManagers = sortBy(group.additionalManagers, manager => manager.familyName && manager.familyName.toLowerCase()) || [];
        return group.ownerSummary ? [group.ownerSummary, ...additionalManagers] : additionalManagers;
    }, [group]);

    const canArchive = (isUserGroupOwner || group.additionalManagerPrivileges);
    const canEmailUsers = isStaff(user) && usersInGroup.length > 0;

    const existingGroupWithConflictingName = allGroups?.find(g => g.groupName == newGroupName && (isDefined(group) ? group.id != g.id : true));
    const isGroupNameInvalid = isDefined(newGroupName) && isDefined(existingGroupWithConflictingName);
    const isGroupNameValid = isDefined(newGroupName) && newGroupName.length > 0 && !allGroups?.some(g => g.groupName == newGroupName) && (isDefined(group) ? newGroupName !== group.groupName : true);

    const [deleteGroup] = useDeleteGroupMutation();

    return <Card className={classNames({"mb-4": isPhy})} {...rest}>
        <CardBody>
            <h4 className={"mb-2"}>
                {siteSpecific("Manage group", "Group details")}
            </h4>

            <div className={"d-flex flex-column gap-2"}>
                <div>
                    <Form className="form-inline" onSubmit={saveUpdatedGroup}>
                        <Label htmlFor="groupName" className={"form-required fw-bold"}>
                            {isUserGroupOwner || group.additionalManagerPrivileges ? "Rename group" : "Group name" }
                        </Label>
                        <InputGroup className="flex-column flex-md-row align-items-center gap-2 stackable-input-group w-100">
                            <Input
                                id="groupName"
                                length={50}
                                placeholder="Group name" value={newGroupName}
                                onChange={e => setNewGroupName(e.target.value)} aria-label="Group Name" disabled={!(isUserGroupOwner || group.additionalManagerPrivileges)}
                                invalid={isGroupNameInvalid}
                                valid={isGroupNameValid}
                                className={"w-100 w-md-auto flex-md-fill"}
                                aria-describedby="groupNameFeedback"
                                data-testid={"groupName"}
                            />
                            {(!isDefined(group) || isUserGroupOwner || group.additionalManagerPrivileges) && <Button
                                color={siteSpecific("keyline", "solid")}
                                className="w-100 w-md-auto" disabled={newGroupName === "" || (newGroupName === group.groupName)}
                                onClick={saveUpdatedGroup}
                            >
                                Update
                            </Button>}
                            <FormFeedback id={"groupNameFeedback"}>A{existingGroupWithConflictingName?.archived ? <>n archived</> : <></>} group with that name already exists.</FormFeedback>
                        </InputGroup>
                    </Form>
                </div>

                {siteSpecific(<div className="section-divider-bold"/>, <hr className="text-center"/>)}

                <div>
                    <div className={"d-flex flex-column flex-md-row justify-content-between"}>
                        <div>
                            <p className={"fw-bold"}>Group managers</p>
                            {additionalManagers && <Table className={classNames("group-table", {"mt-1": isAda})}>
                                <tbody>
                                    {additionalManagers.map((manager, i) =>
                                        <tr key={manager.email} data-testid={"group-manager"} className={classNames({"border-0 bg-transparent": isAda})}>
                                            <td className={classNames("align-middle p-0", {"border-top-0": i === 0, "border-0 bg-transparent": isAda})}>
                                                <div className="d-flex flex-fill my-2">
                                                    {siteSpecific(
                                                        <i className="icon icon-my-isaac me-2"/>,
                                                        <span className="icon-group-table-person"/>
                                                    )}
                                                    {manager.givenName} {manager.familyName} {manager.id === group.ownerId && "(group owner)"} {user.id === manager.id && "(you)"}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </Table>}
                        </div>
                        {isTeacherOrAbove(user) &&
                            <div>
                                <Button className="w-100 d-inline-block text-nowrap" color="keyline" onClick={() => dispatch(showGroupManagersModal({group, user}))}>
                                    {(isUserGroupOwner || group.additionalManagerPrivileges) ?
                                        `${additionalManagers.length > 1 ? "Edit" : "Add"} group managers` : `More information`
                                    }
                                </Button>
                            </div>}
                    </div>
                </div>

                {siteSpecific(<div className="section-divider-bold"/>, <hr className="text-center"/>)}

                <div>
                    <ShowLoading until={group.members}>
                        {group.members && <div data-testid="group-members" className={"d-flex flex-column gap-3"}>
                            <div className={"d-flex flex-column flex-md-row justify-content-between"}>
                                <p className={"fw-bold"}>Group members</p>
                                <div className={"d-flex flex-column flex-md-row gap-1"}>
                                    <Button
                                        disabled={group.archived}
                                        className={"d-inline-block text-nowrap w-100 w-sm-auto"}
                                        color="primary"
                                        onClick={() => dispatch(showGroupInvitationModal({group, user, firstTime: false}))}
                                    >
                                            Invite users
                                    </Button>
                                    {canEmailUsers && usersInGroup.length > 0 &&
                                                <Button
                                                    className={"d-inline-block text-nowrap w-100 w-sm-auto"}
                                                    color="secondary"
                                                    outline
                                                    onClick={() => dispatch(showGroupEmailModal(usersInGroup))}
                                                >
                                                    Email users
                                                </Button>
                                    }
                                </div>
                            </div>
                            <div>
                                <StyledCheckbox
                                    id="self-removal"
                                    color={siteSpecific("primary", "")}
                                    onChange={toggleSelfRemoval}
                                    checked={!!group.selfRemoval}
                                    label={<span>Allow students to remove themselves from this group</span>}
                                />
                            </div>
                            <div>
                                        This group has {group.members.length} member{group.members.length != 1 ? 's' : ''}.
                                {bigGroup && !isExpanded &&
                                            <ButtonDropdown className="float-end" toggle={() => setExpanded(true)}>
                                                <DropdownToggle caret>Show</DropdownToggle>
                                            </ButtonDropdown>
                                }
                            </div>
                            <div className={"d-flex flex-column gap-1"}>
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
                </div>
                {canArchive && <>
                    {siteSpecific(<div className="section-divider-bold"/>, <hr className="text-center"/>)}
                    <div>
                        <Button className={classNames("w-100 w-md-auto mb-2", {"mt-n3": isPhy})} color="keyline"
                            onClick={async () => {
                                if (group.archived) toggleArchived();
                                else await dispatch(showGroupArchiveModal({group, toggleArchived}));
                            }}>
                            {`${group.archived ? "Unarchive" : "Archive"} group`}
                        </Button>
                        {group.archived && <Button className={classNames("w-100 w-md-auto ms-md-2 mb-2", {"mt-md-n3": isPhy})} color="solid"
                            onClick={(e) => {e.stopPropagation(); confirmDeleteGroup(dispatch, deleteGroup, user, group);}}>
                            {"Delete group"}
                        </Button>}
                    </div>
                </>}
            </div>
        </CardBody>
    </Card>;
};

interface GroupSelectorProps {
    user: RegisteredUserDTO;
    groups?: AppGroup[];
    allGroups: AppGroup[];
    selectedGroup?: AppGroup;
    setSelectedGroupId: React.Dispatch<React.SetStateAction<number | undefined>>;
    showArchived: boolean;
    setShowArchived: React.Dispatch<React.SetStateAction<boolean>>;
    showCreateGroup?: boolean; // Avoids having 2 'create group' panels when selector is full screen
    sidebarStyle?: boolean;
}

export const GroupSelector = ({user, groups, allGroups, selectedGroup, setSelectedGroupId, showArchived, setShowArchived, showCreateGroup, sidebarStyle}: GroupSelectorProps) => {
    const dispatch = useAppDispatch();

    // Clear the selected group when switching between tabs
    const switchTab = (archived: boolean) => {
        setShowArchived(archived);
        setSelectedGroupId(undefined);
    };

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

    const [deleteGroup] = useDeleteGroupMutation();

    return <Card className="group-selector">
        <CardBody>
            { showCreateGroup &&
                <>
                    <Button className={"d-block w-100"} onClick={() => {dispatch(showCreateGroupModal({user}));}}>Create a new group</Button>
                    {siteSpecific(<div className="section-divider"/>, <hr/>)}
                </>
            }

            <div className={classNames("text-start", {"mt-3": showCreateGroup})}>
                <strong className="me-2">Groups:</strong>
                <UncontrolledButtonDropdown size="sm">
                    <DropdownToggle color="secondary" caret size={"sm"}>
                        {sortOrder}
                    </DropdownToggle>
                    <DropdownMenu>
                        {Object.values(SortOrder).map(item =>
                            <DropdownItem key={item} onClick={() => setSortOrder(item)}>{item}</DropdownItem>
                        )}
                    </DropdownMenu>
                </UncontrolledButtonDropdown>
            </div>
            <Nav tabs className={classNames("d-flex guaranteed-single-line mt-3", siteSpecific("mb-3 flex-nowrap", "flex-wrap"))}>
                {tabs.map((tab, index) => {
                    return <NavItem key={index} className={classNames({"px-2": isPhy, "active": tab.active()})}>
                        <NavLink
                            className={classNames("text-center", {"group-nav-tab": isPhy}, {"px-2": isAda})} tabIndex={0}
                            onClick={tab.activate} onKeyDown={ifKeyIsEnter(tab.activate)}
                        >
                            {tab.name}
                        </NavLink>
                    </NavItem>;
                })}
            </Nav>
            <ul className="mt-3 mt-lg-0 p-0 mb-0">
                {sortedGroups && sortedGroups.length > 0
                    ? sortedGroups.map((g: AppGroup) =>
                        sidebarStyle
                            ? <li key={g.id} className="d-flex align-items-center group-item" data-testid={"group-item"}>
                                <StyledTabPicker
                                    id={g.groupName} checkboxTitle={g.groupName} checked={selectedGroup && selectedGroup.id === g.id}
                                    onInputChange={() => setSelectedGroupId(id => g.id === id ? undefined : g.id)} data-testid={"select-group"}
                                    suffix={showArchived ? {icon: "icon icon-close", action: (e) => {e.stopPropagation(); confirmDeleteGroup(dispatch, deleteGroup, user, g);}, info: "Delete group"} : undefined}
                                />
                            </li>
                            : <div key={g.id} className="group-item p-md-2" data-testid={"group-item"}>
                                <div className="d-flex justify-content-between align-items-center group-name-buttons">
                                    <Button title={isStaff(user) ? `Group id: ${g.id}` : undefined} color="link" data-testid={"select-group"} className="text-start px-1 py-1 flex-fill group-name" onClick={() => setSelectedGroupId(g.id)}>
                                        {g.groupName}
                                    </Button>
                                    {showArchived && (isPhy ?
                                        <button onClick={(e) => {e.stopPropagation(); confirmDeleteGroup(dispatch, deleteGroup, user, g);}}
                                            aria-label="Delete group" className="ms-1 icon-close" title={"Delete group"}/> :
                                        <IconButton icon={{name: "icon-bin", color: "white"}} className="action-button" affixClassName="icon-sm" aria-label="Delete group" title="Delete group" onClick={() => confirmDeleteGroup(dispatch, deleteGroup, user, g)}/>)
                                    }
                                </div>
                                {isAda && selectedGroup && selectedGroup.id === g.id && <div className="d-lg-none py-2">
                                    <GroupEditor user={user} group={selectedGroup} allGroups={allGroups} />
                                </div>}
                            </div>
                    )
                    : <div className="text-center p-2">
                        You have no {showArchived ? "archived" : "active"} groups.
                    </div>
                }
            </ul>
        </CardBody>
    </Card>;
};

export const Groups = ({user}: {user: RegisteredUserDTO}) => {
    const dispatch = useAppDispatch();
    const deviceSize = useDeviceSize();
    const location = useLocation();
    const hashAnchor = location.hash ? location.hash.slice(1) : null;

    const [showArchived, setShowArchived] = useState(false);
    const groupQuery = useGetGroupsQuery(showArchived);
    const { currentData: groups, isLoading, isFetching } = groupQuery;
    const otherGroups = useGetGroupsQuery(!showArchived);

    const allGroups = [...(groups ?? []) , ...(otherGroups.currentData ?? [])];

    const [selectedGroupId, setSelectedGroupId] = useState<number | undefined>(window.location.hash ? parseInt(window.location.hash.slice(1)) : undefined);

    useEffect(() => {
        const tab = hashAnchor ? parseInt(hashAnchor) : undefined;
        setSelectedGroupId(tab);
    }, [hashAnchor]);
    
    const selectedGroup = (isLoading || isFetching) ? undefined : groups?.find(g => g.id === selectedGroupId);

    const isEmptyState = allGroups.length === 0;

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

    const GroupsPhy = <PageContainer
        pageTitle={
            <TitleAndBreadcrumb currentPageTitle="Manage groups" icon={{type: "icon", icon: "icon-group"}}/>
        }
        sidebar={siteSpecific(
            <GroupsSidebar user={user} groups={groups} allGroups={allGroups} selectedGroup={selectedGroup} setSelectedGroupId={setSelectedGroupId}
                showArchived={showArchived} setShowArchived={setShowArchived}
                hideButton
            />,
            undefined
        )}
    >
        <ShowLoadingQuery query={groupQuery} defaultErrorTitle={"Error fetching groups"}>
            <PageMetadata noTitle showSidebarButton sidebarButtonText="Select or create a group" helpModalId="help_modal_groups">
                <PageFragment fragmentId={siteSpecific("help_toptext_groups", "groups_help")} ifNotFound={RenderNothing} />
            </PageMetadata>
            {selectedGroup &&
                <GroupEditor group={selectedGroup} allGroups={allGroups} user={user} data-testid="group-editor"/>
            }
            {/* On small screens, the groups list should initially be accessible without needing to open the sidebar drawer */}
            {below["md"](deviceSize) && !isDefined(selectedGroup) && <GroupSelector user={user} groups={groups} allGroups={allGroups} selectedGroup={selectedGroup} setSelectedGroupId={setSelectedGroupId}
                showArchived={showArchived} setShowArchived={setShowArchived} sidebarStyle={false}/>}
        </ShowLoadingQuery>
    </PageContainer>;

    const GroupsAda = <PageContainer
        pageTitle={<TitleAndBreadcrumb currentPageTitle="Manage groups" className="mb-4" help={pageHelp} />}
        sidebar={<MyAdaSidebar />}
    >
        <ShowLoadingQuery query={groupQuery} defaultErrorTitle={"Error fetching groups"}>
            {!isEmptyState ?
                <>
                    <p className={"mw-75"}>You can add other teachers to help you manage a group. You cannot directly add students, but you can invite them to join.</p>
                    <Row className="mb-7">
                        <Col lg={4}>
                            <GroupSelector user={user} groups={groups} allGroups={allGroups} selectedGroup={selectedGroup} setSelectedGroupId={setSelectedGroupId}
                                showArchived={showArchived} setShowArchived={setShowArchived} showCreateGroup={true} />
                        </Col>

                        <Col lg={8} className="d-none d-lg-block" data-testid={"group-editor"}>
                            {
                                selectedGroup &&
                                    <GroupEditor group={selectedGroup} allGroups={allGroups} groupNameInputRef={groupNameInputRef} user={user} />
                            }
                        </Col>
                    </Row>
                </>
                :
                <div className={"mb-7"}>
                    <p className={"mw-50"}>
                        Organise your students into groups and set work appropriate for each group.
                        <br />
                        You need a student group before you can assign quizzes and tests in {SITE_TITLE_SHORT}.
                    </p>
                    <Button onClick={() => void dispatch(showCreateGroupModal({user}))}>
                        Create a group
                    </Button>
                </div>
            }
        </ShowLoadingQuery>
    </PageContainer>;

    return siteSpecific(GroupsPhy, GroupsAda);
};
