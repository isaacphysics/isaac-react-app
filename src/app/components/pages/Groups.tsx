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
    Input,
    InputGroup,
    InputGroupAddon,
    Nav,
    NavItem,
    NavLink,
    Row,
    UncontrolledButtonDropdown,
    UncontrolledTooltip
} from "reactstrap"
import {Link} from "react-router-dom";
import {
    resetMemberPassword,
    isaacApi,
    showGroupManagersModal,
    showGroupInvitationModal,
    showGroupEmailModal,
    showAdditionalManagerSelfRemovalModal,
    showErrorToast,
    useAppDispatch,
    mutationSucceeded
} from "../../state";
import {ShowLoading} from "../handlers/ShowLoading";
import {sortBy} from "lodash";
import {AppGroup, AppGroupMembership} from "../../../IsaacAppTypes";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {ifKeyIsEnter, isCS, isDefined, isStaff, siteSpecific} from "../../services";
import {RegisteredUserDTO} from "../../../IsaacApiTypes";
import {ShowLoadingQuery} from "../handlers/ShowLoadingQuery";

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
}
const MemberInfo = ({group, member}: MemberInfoProps) => {
    const [passwordRequestSent, setPasswordRequestSent] = useState(false);
    const [deleteMember] = isaacApi.endpoints.deleteGroupMember.useMutation();

    function resetPassword() {
        setPasswordRequestSent(true);
        resetMemberPassword(member);
    }

    function confirmDeleteMember() {
        if (confirm(`Are you sure you want to remove this user from the group '${group.groupName}'?`)) {
            deleteMember({groupId: group.id as number, userId: member.id as number});
        }
    }

    return <div className="p-2 member-info-item d-flex justify-content-between">
        <div className="pt-1 d-flex flex-fill">
            <div>
                <span className="icon-group-table-person mt-2" />
            </div>
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
        <div className="d-flex justify-content-between">
            <Tooltip tipText={passwordResetInformation(member, passwordRequestSent)} className="text-right d-none d-sm-block">
                <Button color="link" size="sm" onClick={resetPassword} disabled={!canSendPasswordResetRequest(member, passwordRequestSent)}>
                    {!passwordRequestSent? 'Reset Password': 'Reset email sent'}
                </Button>
            </Tooltip>
            {"  "}
            <button className="ml-2 close" onClick={confirmDeleteMember} aria-label="Remove member">
                ×
            </button>
        </div>
    </div>;
};

interface GroupEditorProps {
    user: RegisteredUserDTO;
    group?: AppGroup;
    groupNameInputRef?: MutableRefObject<HTMLInputElement | null>;
}
const GroupEditor = ({group, user, createNewGroup, groupNameInputRef}: GroupCreatorProps & GroupEditorProps) => {
    const dispatch = useAppDispatch();

    const [updateGroup] = isaacApi.endpoints.updateGroup.useMutation();

    const [isExpanded, setExpanded] = useState(false);
    const [newGroupName, setNewGroupName] = useState(group ? group.groupName : "");
    const isUserGroupOwner = user.id === group?.ownerId;

    useEffect(() => {
        setExpanded(false);
        setNewGroupName(group?.groupName ?? "");
    }, [group?.id]);

    function saveUpdatedGroup(event: React.FormEvent) {
        event?.preventDefault();
        if (!newGroupName || newGroupName.length === 0) {
            dispatch(showErrorToast(`Cannot ${group ? "rename" : "create"} group`, "The group name must be specified."));
            return;
        }
        if (group) {
            const updatedGroup = {...group, groupName: newGroupName};
            updateGroup({updatedGroup});
        } else {
            createNewGroup(newGroupName).then(success => {
                if (success) {
                    setNewGroupName("");
                }
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

    return <Card>
        <CardBody>
            <Row className="mt-2">
                <Col xs={5} sm={6} md={group ? 3 : 12} lg={group ? 3 : 12}><h4>{group ? "Edit group" : "Create group"}</h4></Col>
                {group && <Col xs={7} sm={6} md={9} lg={9} className="text-right">
                    <Button className="d-none d-sm-inline" size="sm" color="tertiary" onClick={() => dispatch(showGroupManagersModal({group, user}))}>
                        Add / remove<span className="d-none d-xl-inline">{" "}group</span>{" "}managers
                    </Button>
                    <span className="d-none d-lg-inline-block">&nbsp;or&nbsp;</span>
                    <span className="d-inline-block d-md-none">&nbsp;</span>
                    <Button
                        size="sm" className={isCS ? "text-white" : "" + " d-none d-sm-inline"}
                        color={siteSpecific("primary", "secondary")}
                        onClick={() => dispatch(showGroupInvitationModal({group, user, firstTime: false}))}
                    >
                        Invite users
                    </Button>
                    {isStaff(user) && usersInGroup.length > 0 &&
                        <span className="d-none d-lg-inline-block">&nbsp;or&nbsp;
                            <Button
                                size="sm" className={isCS ? "text-white" : ""}
                                color={siteSpecific("primary", "secondary")}
                                onClick={() => dispatch(showGroupEmailModal(usersInGroup))}
                            >
                                Email users
                            </Button>
                        </span>}
                </Col>}
            </Row>
            <Form inline onSubmit={saveUpdatedGroup} className="pt-3">
                <InputGroup className="w-100">
                    <Input
                        innerRef={groupNameInputRef} length={50} placeholder="Group name" value={newGroupName}
                        onChange={e => setNewGroupName(e.target.value)} aria-label="Group Name" disabled={isDefined(group) && !isUserGroupOwner}
                    />
                    {(isUserGroupOwner || !isDefined(group)) && <InputGroupAddon addonType="append">
                        <Button
                            color={siteSpecific("secondary", "primary")}
                            className="p-0 border-dark" disabled={newGroupName === ""}
                            onClick={saveUpdatedGroup}
                        >
                            {group ? "Update" : "Create"}
                        </Button>
                    </InputGroupAddon>}
                </InputGroup>
            </Form>
            <Row className="pt-1 mb-3">
                <Col className="text-right text-muted">
                    *Group name is shared with students
                </Col>
            </Row>
            {group && <React.Fragment>
                <Row>
                    <Col>
                        {isUserGroupOwner && <Button block color="tertiary" onClick={toggleArchived}>
                            {group.archived ? "Unarchive this group" : "Archive this group"}
                        </Button>}
                    </Col>
                </Row>
                <Row className="mt-4">
                    <Col>
                        <ShowLoading until={group.members}>
                            {group.members && <div>
                                <Row>
                                    <Col>
                                        {group.members.length} users in this group {" "}
                                        {bigGroup && !isExpanded &&
                                            <ButtonDropdown className="float-right" toggle={() => setExpanded(true)}>
                                                <DropdownToggle caret>Show</DropdownToggle>
                                            </ButtonDropdown>
                                        }
                                    </Col>
                                </Row>
                                <div>
                                    {(!bigGroup || isExpanded) && group.members.map((member: AppGroupMembership) => (
                                        <MemberInfo
                                            key={member.groupMembershipInformation.userId}
                                            member={member}
                                            group={group}
                                        />
                                    ))}
                                </div>
                            </div>}
                        </ShowLoading>
                    </Col>
                </Row>
            </React.Fragment>}
        </CardBody>
    </Card>;
};

const MobileGroupCreatorComponent = ({className, createNewGroup}: GroupCreatorProps & {className: string}) => {
    const [newGroupName, setNewGroupName] = useState("");

    function saveUpdatedGroup() {
        createNewGroup(newGroupName).then(success => {
            if (success) {
                setNewGroupName("");
            }
        });
    }
    return <Row className={className}>
        <Col size={12} className="mt-2">
            <h6>Create New Group</h6>
        </Col>
        <Col size={12} className="mb-2">
            <Input length={50} placeholder="Enter the name of your group here" value={newGroupName}
                onChange={e => setNewGroupName(e.target.value)} aria-label="Group Name"/>
        </Col>
        <Col size={12}>
            <Button block color="primary" onClick={saveUpdatedGroup} disabled={newGroupName == ""}>
                Create group
            </Button>
        </Col>
    </Row>;
};

export const Groups = ({user}: {user: RegisteredUserDTO}) => {
    const dispatch = useAppDispatch();
    const [showArchived, setShowArchived] = useState(false);
    const groupQuery = isaacApi.endpoints.getGroups.useQuery(showArchived);
    const { data: groups } = groupQuery;

    const [createGroup] = isaacApi.endpoints.createGroup.useMutation();
    const [deleteGroup] = isaacApi.endpoints.deleteGroup.useMutation();

    const [selectedGroupId, setSelectedGroupId] = useState<number>();
    const selectedGroup = groups?.find(g => g.id === selectedGroupId);

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
                dispatch(showGroupInvitationModal({group, user, firstTime: true}));
                setSelectedGroupId(group.id);
                return true;
            }
            return false;
        });
    };

    const confirmDeleteGroup = (groupToDelete: AppGroup) => {
        if (user.id === groupToDelete.ownerId) {
            if (confirm("Are you sure you want to permanently delete the group '" + groupToDelete.groupName + "' and remove all associated assignments?\n\nTHIS ACTION CANNOT BE UNDONE!")) {
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
    const [getGroupMembers] = isaacApi.endpoints.getGroupMembers.useLazyQuery();
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
        <TitleAndBreadcrumb currentPageTitle="Manage groups" className="mb-4" help={pageHelp} modalId="groups_help" />
        <ShowLoadingQuery query={groupQuery} defaultErrorTitle={"Error fetching groups"}>
            <Row className="mb-5">
                <Col md={4}>
                    <Card>
                        <CardBody className="mt-2">
                            <Nav tabs className="d-flex flex-wrap">
                                {tabs.map((tab, index) => {
                                    const classes = tab.active() ? "active" : "";
                                    return <NavItem key={index} className="mx-2">
                                        <NavLink
                                            className={`text-center ${classes}`} tabIndex={0}
                                            onClick={tab.activate} onKeyDown={ifKeyIsEnter(tab.activate)}
                                        >
                                            {tab.name}
                                        </NavLink>
                                    </NavItem>;
                                })}
                            </Nav>
                            <Row className="align-items-center pt-4 pb-3 d-none d-md-flex">
                                <Col>
                                    <strong>Groups:</strong>
                                </Col>
                                <Col className="text-right">
                                    <UncontrolledButtonDropdown size="sm">
                                        <DropdownToggle color="tertiary" caret>
                                            {sortOrder}
                                        </DropdownToggle>
                                        <DropdownMenu>
                                            {Object.values(SortOrder).map(item =>
                                                <DropdownItem key={item} onClick={() => setSortOrder(item)}>{item}</DropdownItem>
                                            )}
                                        </DropdownMenu>
                                    </UncontrolledButtonDropdown>
                                </Col>
                            </Row>
                            <MobileGroupCreatorComponent className="d-block d-md-none" createNewGroup={createNewGroup}/>
                            <Row className="d-none d-md-block mb-3">
                                <Col>
                                    <Button block color="primary" outline onClick={() => {
                                        setSelectedGroupId(undefined);
                                        if (groupNameInputRef.current) {
                                            groupNameInputRef.current.focus();
                                        }
                                    }}>Create new group</Button>
                                </Col>
                            </Row>
                            <Row className="mt-3 mt-md-0">
                                <Col>
                                    {sortedGroups && sortedGroups.map((g: AppGroup) =>
                                        <div key={g.id} className="group-item p-2">
                                            <div className="d-flex justify-content-between align-items-center">
                                                <Button color="link text-left" className="flex-fill" onClick={() => setSelectedGroupId(g.id)}>
                                                    {g.groupName}
                                                </Button>
                                                <button
                                                    onClick={(e) => {e.stopPropagation(); confirmDeleteGroup(g);}}
                                                    aria-label="Delete group" className="close ml-1"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                            {selectedGroup && selectedGroup.id === g.id && <div className="d-md-none py-2">
                                                <GroupEditor user={user} group={selectedGroup} createNewGroup={createNewGroup}/>
                                            </div>}
                                        </div>
                                    )}
                                </Col>
                            </Row>
                        </CardBody>
                    </Card>
                </Col>
                <Col md={8} className="d-none d-md-block">
                    <GroupEditor group={selectedGroup} groupNameInputRef={groupNameInputRef} user={user} createNewGroup={createNewGroup} />
                </Col>
            </Row>
        </ShowLoadingQuery>
    </Container>;
};
