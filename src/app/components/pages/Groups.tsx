import React, {MutableRefObject, useEffect, useRef, useState} from "react";
import {connect} from "react-redux";
import {
    Container,
    Nav,
    NavItem,
    NavLink,
    TabContent,
    TabPane,
    Row,
    Col,
    UncontrolledTooltip,
    UncontrolledButtonDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Button, Input, Table, ButtonDropdown, Form
} from "reactstrap"
import {Link} from "react-router-dom";
import {
    loadGroups,
    createGroup,
    deleteGroup,
    updateGroup,
    getGroupInfo,
    resetMemberPassword,
    deleteMember,
    showGroupInvitationModal,
    showGroupManagersModal,
    selectGroup
} from "../../state/actions";
import {ShowLoading} from "../handlers/ShowLoading";
import {AppState} from "../../state/reducers";
import {sortBy} from "lodash";
import {AppGroup, AppGroupMembership} from "../../../IsaacAppTypes";
import {groups} from "../../state/selectors";
import {UserGroupDTO} from "../../../IsaacApiTypes";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";

const stateFromProps = (state: AppState) => (state && {groups: groups.groups(state), group: groups.current(state)});
const dispatchFromProps = {loadGroups, selectGroup, createGroup, deleteGroup, updateGroup, getGroupInfo, resetMemberPassword, deleteMember, showGroupInvitationModal, showGroupManagersModal};

interface GroupsPageProps {
    groups: {active: AppGroup[] | null; archived: AppGroup[] | null};
    group: AppGroup | null;
    loadGroups: (getArchived: boolean) => void;
    selectGroup: (group: UserGroupDTO | null) => void;
    createGroup: (groupName: string) => Promise<AppGroup>;
    deleteGroup: (group: AppGroup) => void;
    updateGroup: (newGroup: AppGroup, message?: string) => void;
    getGroupInfo: (group: AppGroup) => void;
    resetMemberPassword: (member: AppGroupMembership) => void;
    deleteMember: (member: AppGroupMembership) => void;
    showGroupInvitationModal: (firstTime: boolean) => void;
    showGroupManagersModal: () => void;
}

enum SortOrder {
    "Alphabetical" = "Alphabetical",
    "Date Created" = "Date Created"
}

interface GroupCreatorProps {
    createNewGroup: (groupName: string) => void;
}

type GroupEditorProps = GroupsPageProps & GroupCreatorProps & {
    groupNameRef?: MutableRefObject<HTMLInputElement | null>;
};

let tooltip = 0;
const Tooltip = ({children, tipText, ...props}: any) => {
    const [tooltipId] = useState("forTooltip-" + tooltip++);
    return <React.Fragment>
        <span id={tooltipId} {...props}>{children}</span>
        <UncontrolledTooltip target={`#${tooltipId}`}>{tipText}</UncontrolledTooltip>
    </React.Fragment>;
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
    member: AppGroupMembership;
    resetMemberPassword: (member: AppGroupMembership) => void;
    deleteMember: (member: AppGroupMembership) => void;
}
const MemberInfo = ({member, resetMemberPassword, deleteMember}: MemberInfoProps) => {
    const [passwordRequestSent, setPasswordRequestSent] = useState(false);

    function resetPassword() {
        setPasswordRequestSent(true);
        resetMemberPassword(member);
    }

    function confirmDeleteMember() {
        if (confirm("Are you sure you want to remove this user from the group?")) {
            deleteMember(member);
        }
    }

    return <tr>
        <td className="w-75">
            <Link to={`/progress/${member.groupMembershipInformation.userId}`}><span className="icon-group-table-person" />{member.givenName} {member.familyName}</Link>
            {member.emailVerificationStatus == "DELIVERY_FAILED" &&
                <Tooltip tipText={<React.Fragment>This user&apos;s account email address is invalid or not accepting email.<br />They will not be able to reset their password or receive update emails. Ask them to login and update it, or contact us to help resolve the issue.</React.Fragment>} className="icon-email-status failed" />
            }
            {member.emailVerificationStatus == "NOT_VERIFIED" &&
            <Tooltip
                tipText="This user has not yet verified their email."
                className="icon-email-status unverified" />
            }
            {member.groupMembershipInformation && member.groupMembershipInformation.status == "INACTIVE" &&
                <Tooltip tipText="This user has set their status to inactive for this group. This means they will no longer see new assignments."> (inactive in group)</Tooltip>
            }
        </td>
        <td className="text-nowrap">
            <Tooltip tipText={passwordResetInformation(member, passwordRequestSent)} className="text-right">
                <Button color="link" size="sm" onClick={resetPassword} disabled={!canSendPasswordResetRequest(member, passwordRequestSent)}>
                    {!passwordRequestSent? 'Reset Password': 'Reset email sent'}
                </Button>
            </Tooltip>{"  "}
            <Button color="tertiary" size="sm" className="flex-grow-0" style={{minWidth: "unset"}} onClick={confirmDeleteMember} aria-label="Remove member">
                X
            </Button>
        </td>
    </tr>;
};

const GroupEditor = ({group, selectGroup, updateGroup, createNewGroup, groupNameRef, resetMemberPassword, deleteMember, showGroupInvitationModal, showGroupManagersModal}: GroupEditorProps) => {
    const [isExpanded, setExpanded] = useState(false);

    const initialGroupName = group ? group.groupName : "";
    const [newGroupName, setNewGroupName] = useState(initialGroupName);

    useEffect(() => {
        setExpanded(false);
        setNewGroupName(initialGroupName);
    }, [group]);

    function saveUpdatedGroup() {
        if (group) {
            const newGroup = {...group, groupName: newGroupName};
            updateGroup(newGroup);
        } else {
            if (newGroupName) {
                createNewGroup(newGroupName);
            }
        }
    }

    function toggleArchived() {
        if (group) {
            const newGroup = {...group, archived: !group.archived};
            updateGroup(newGroup, "Group " + group.groupName + (newGroup.archived ? " archived" : " unarchived"));
            selectGroup(null);
        }
    }

    const bigGroup = group && group.members && group.members.length > 100;

    return <React.Fragment>
        <Row>
            <Col sm={3} md={5} lg={3}><h4>{group ? "Edit group" : "Create group"}</h4></Col>
            {group && <Col sm={9} md={7} lg={9} className="text-right">
                <Button size="sm" color="tertiary" onClick={() => showGroupManagersModal()}>Edit Group Managers</Button>
                <span className="d-none d-lg-inline-block">&nbsp;or&nbsp;</span>
                <span className="d-inline-block d-md-none">&nbsp;</span>
                <Button size="sm" onClick={() => showGroupInvitationModal(false)}>Invite Users</Button>
            </Col>}
        </Row>
        <Form inline className="pt-2">
            <Input className="flex-grow-1 mr-1" innerRef={groupNameRef} length={50} placeholder="Enter the name of your group here" value={newGroupName}
                onChange={e => setNewGroupName(e.target.value)} aria-label="Group Name"/>
            <Button color="primary" style={{fontSize: "1rem", padding: "0.5rem 2rem"}} onClick={saveUpdatedGroup} disabled={newGroupName == "" || initialGroupName == newGroupName}>
                {group ? "Update" : "Create"}
            </Button>
        </Form>
        <Row>
            <Col xs={8} className="text-right">
                Group name is shared with students
            </Col>
        </Row>
        {group && <React.Fragment>
            <Row>
                <Button block color="tertiary" onClick={toggleArchived}>
                    {group.archived ? "Unarchive this group" : "Archive this group"}
                </Button>
            </Row>
            <Row className="mt-2">
                <ShowLoading until={group.members}>
                    {group.members && <Table>
                        <thead>
                            <tr>
                                <th colSpan={2}>{group.members.length} users in this group {bigGroup && !isExpanded && <ButtonDropdown className="float-right" toggle={() => setExpanded(true)}><DropdownToggle caret>Show</DropdownToggle></ButtonDropdown>}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(!bigGroup || isExpanded) && group.members.map((member: AppGroupMembership) => <MemberInfo key={member.groupMembershipInformation.userId}
                                {...{member, resetMemberPassword, deleteMember}} />)}
                        </tbody>
                    </Table>}
                </ShowLoading>
            </Row>
        </React.Fragment>}
    </React.Fragment>;
};

const MobileGroupCreatorComponent = ({createNewGroup, ...props}: GroupCreatorProps & {className: string}) => {
    const [newGroupName, setNewGroupName] = useState("");

    function saveUpdatedGroup() {
        createNewGroup(newGroupName);
        setNewGroupName("");
    }
    return <Row {...props}>
        <Col xs={12} className="mt-2">
            <h6>Create New Group</h6>
        </Col>
        <Col xs={12} className="mb-2">
            <Input length={50} placeholder="Enter the name of your group here" value={newGroupName}
                onChange={e => setNewGroupName(e.target.value)} aria-label="Group Name"/>
        </Col>
        <Col xs={12}>
            <Button block color="primary" onClick={saveUpdatedGroup} disabled={newGroupName == ""}>
                Create group
            </Button>
        </Col>
    </Row>;
};

const GroupsPageComponent = (props: GroupsPageProps) => {
    const {group, groups, loadGroups, getGroupInfo, selectGroup, createGroup, deleteGroup, showGroupInvitationModal} = props;

    const [showArchived, setShowArchived] = useState(false);

    const tabs = [
        {
            name: "Active Groups",
            data: groups && groups.active,
            active: () => !showArchived,
            activate: () => setShowArchived(false)
        },
        {
            name: "Archived Groups",
            data: groups && groups.archived,
            active: () => showArchived,
            activate: () => setShowArchived(true)
        }
    ];
    const activeTab = tabs.find(tab => tab.active());

    const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.Alphabetical);

    let data = activeTab && activeTab.data;
    if (data) {
        switch(sortOrder) {
            case SortOrder.Alphabetical:
                data = sortBy(data, g => g.groupName);
                break;
            case SortOrder["Date Created"]:
                data = sortBy(data, g => g.created).reverse();
                break;
        }
    }

    const createNewGroup = async (newGroupName: string) => {
        setShowArchived(false);
        const group = await createGroup(newGroupName);
        selectGroup(group);
        showGroupInvitationModal(true);
    };

    const confirmDeleteGroup = (groupToDelete: AppGroup) => {
        if (confirm("Are you sure you want to permanently delete the group '" + groupToDelete.groupName + "' and remove all associated assignments?\n\nTHIS ACTION CANNOT BE UNDONE!")) {
            deleteGroup(groupToDelete);
            if (group && group.id == groupToDelete.id) {
                selectGroup(null);
            }
        }
    };

    useEffect(() => {
        loadGroups(showArchived);
        // Clear the selected group when switching between tabs
        selectGroup(null);
    }, [showArchived]);

    const groupId = group && group.id;

    useEffect(() => {
        if (group) {
            getGroupInfo(group);
        }
    }, [groupId]); // This can't just be group, because group changes when the members change, causing an infinite reload loop


    const groupNameRef = useRef<HTMLInputElement>(null);

    const pageHelp = <span>
        Use this page to manage groups. You can add users to a group by giving them the group token and asking them paste it into their account settings page.
        <br />
        You can find the token for an existing group by selecting the group and clicking <i>Invite Users</i>.
    </span>;

    return <Container>
        <TitleAndBreadcrumb currentPageTitle="Manage Groups" intermediateCrumbs={[{title: "Teachers", to: "#"}]} className="mb-4" help={pageHelp} />
        <Row>
            <Col md={5}>
                <ShowLoading until={activeTab}>
                    {activeTab && <React.Fragment>
                        <Nav tabs>
                            {tabs.map((tab) => {
                                const classes = tab.active() ? "active" : "";
                                return <NavItem key={tab.name} className="px-3">
                                    <NavLink className={classes} onClick={tab.activate}>
                                        {tab.name}
                                    </NavLink>
                                </NavItem>;
                            })}
                        </Nav>
                        <TabContent activeTab="thisOne">
                            <TabPane tabId="thisOne">
                                <ShowLoading until={data}>
                                    <Row className="align-items-center py-3 d-none d-md-flex">
                                        <Col>
                                        Groups:
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
                                    {group && <Row className="w-100 d-none d-md-block">
                                        <Button block color="primary" className="w-100" onClick={() => {
                                            selectGroup(null);
                                            if (groupNameRef.current) {
                                                groupNameRef.current.focus();
                                            }
                                        }}>Create new group</Button>
                                    </Row>}
                                    <Table className="py-3">
                                        <tbody>{data && data.map((g: AppGroup) =>
                                            <React.Fragment key={g.id}>
                                                <tr onClick={() => selectGroup(g)}>
                                                    <td className="w-100"><Button color="light" block>{g.groupName}</Button></td>
                                                    <td><Button color="tertiary" className="py-2 px-4" style={{minWidth: "unset"}} onClick={(e) => {e.stopPropagation(); confirmDeleteGroup(g);}} aria-label="Delete group">X</Button></td>
                                                </tr>
                                                {group && group.id == g.id && <tr className="d-table-row d-md-none bg-white"><td colSpan={2} className="w-100">
                                                    <GroupEditor {...props} createNewGroup={createNewGroup} />
                                                </td></tr>}
                                            </React.Fragment>
                                        )}</tbody>
                                    </Table>
                                </ShowLoading>
                            </TabPane>
                        </TabContent>
                    </React.Fragment>}
                </ShowLoading>
            </Col>
            <Col md={7} className="d-none d-md-block pl-lg-5">
                <GroupEditor {...props} createNewGroup={createNewGroup} groupNameRef={groupNameRef} />
            </Col>
        </Row>
    </Container>;
};

export const Groups = connect(stateFromProps, dispatchFromProps)(GroupsPageComponent);
