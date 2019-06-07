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
    ButtonGroup, Button, Input, Table
} from "reactstrap"
import {loadGroups, createGroup, deleteGroup, updateGroup} from "../../state/actions";
import {ShowLoading} from "../handlers/ShowLoading";
import {AppState, GroupsState} from "../../state/reducers";
import {sortBy} from "lodash";
import {UserGroupDTO} from "../../../IsaacApiTypes";

const stateFromProps = (state: AppState) => (state && {groups: state.groups});
const dispatchFromProps = {loadGroups, createGroup, deleteGroup, updateGroup};

interface GroupsPageProps {
    groups: GroupsState | null;
    loadGroups: (getArchived: boolean) => void;
    createGroup: (groupName: string) => void;
    deleteGroup: (group: UserGroupDTO) => void;
    updateGroup: (newGroup: UserGroupDTO, message?: string) => void;
}

enum SortOrder {
    "Alphabetical" = "Alphabetical",
    "Date Created" = "Date Created"
}

type GroupEditorProps = Pick<GroupsPageProps, "updateGroup"> & {
    group?: UserGroupDTO;
    createNewGroup: (groupName: string) => void;
    groupNameRef: MutableRefObject<HTMLInputElement | null>;
};

const GroupEditor = ({group, updateGroup, createNewGroup, groupNameRef}: GroupEditorProps) => {
    const initialGroupName = group ? group.groupName : "";

    const [newGroupName, setNewGroupName] = useState(initialGroupName);
    useEffect(() => {
        setNewGroupName(initialGroupName);
        if (group) {
        }
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
        }
    }

    return <>
        <Row>
            <Col sm={8}><h4>{group ? "Edit group" : "Create group"}</h4></Col>
            {group && <Col sm={4}>Invite Users</Col>}
        </Row>
        <Row>
            <Col xs={8}>
                <Input innerRef={groupNameRef} length={50} placeholder="Enter the name of your group here" value={newGroupName}
                    onChange={e => setNewGroupName(e.target.value)}/>
            </Col>
            <Col xs={4}>
                <Button color="primary" onClick={saveUpdatedGroup} disabled={newGroupName == "" || initialGroupName == newGroupName}>
                    {group ? "Update" : "Create"}
                </Button>
            </Col>
        </Row>
        <Row>
            <Col xs={8} className="text-right">
                Group name is shared with students
            </Col>
        </Row>
        {group && <>
            <Row>
                <Button block onClick={toggleArchived}>
                    {group.archived ? "Unarchive this group" : "Archive this group"}
                </Button>
            </Row>
        </>}
    </>;
};

const GroupsPageComponent = ({groups, loadGroups, createGroup, deleteGroup, updateGroup}: GroupsPageProps) => {
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

    const [newGroupName, setNewGroupName] = useState("");

    const createNewGroup = () => {
        createGroup(newGroupName);
        setNewGroupName("");
        setShowArchived(false);
    };

    const confirmDeleteGroup = (group: UserGroupDTO) => {
        if (confirm("Are you sure you want to permanently delete the group '" + group.groupName + "' and remove all associated assignments?\n\nTHIS ACTION CANNOT BE UNDONE!")) {
            deleteGroup(group);
        }
    };

    const [selectedGroupId, setSelectedGroupId] = useState<number | undefined>();

    useEffect(() => {
        loadGroups(showArchived);
        // Clear the selected group when switching between tabs
        setSelectedGroupId(undefined);
    }, [showArchived]);

    const selectedGroup = data && data.find(group => group.id == selectedGroupId) || undefined;
    if (selectedGroupId && !selectedGroup) {
        // If a group is selected, but is not in this list, remove the selection ID.
        // This happens when a group is archived/unarchived.
        setSelectedGroupId(undefined);
    }

    const groupNameRef = useRef<HTMLInputElement>(null);

    return <Container>
        <Row>
            <Col sm={8}>
                <h1>Manage Groups</h1>
                <p className="d-none d-sm-block">Keep track of your groups</p>
            </Col>
            <Col sm={4} className="d-none d-sm-block text-right align-self-center">
                <h4 id="helpTooltip" className="d-inline-block" style={{cursor: "help"}}>Help</h4>
                <UncontrolledTooltip placement="left" target="helpTooltip">
                    Use this page to manage groups. You can add users to a group by giving them the group token and asking them paste it into their account settings page.
                    <br />You can find the token for an existing group by selecting the group and clicking <i>Invite Users</i>.
                </UncontrolledTooltip>
            </Col>
        </Row>
        <hr />
        <Row>
            <Col md={5}>
                <ShowLoading until={activeTab}>
                    {activeTab && <>
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
                                    <Row className="align-items-center py-3">
                                        <Col>
                                        Groups:
                                        </Col>
                                        <Col className="text-right">
                                            <UncontrolledButtonDropdown>
                                                <DropdownToggle caret>
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
                                    {selectedGroup && <Row className="w-100">
                                        <Button block className="w-100" onClick={() => {
                                            setSelectedGroupId(undefined);
                                            if (groupNameRef.current) {
                                                groupNameRef.current.focus();
                                            }
                                        }}>Create new group</Button>
                                    </Row>}
                                    <Row className="w-100 py-3">
                                        {data && data.map((group) =>
                                            <div key={group.id} className="w-100">
                                                <ButtonGroup className="w-100">
                                                    <Button color="light" onClick={() => setSelectedGroupId(group.id)}>{group.groupName}</Button>
                                                    <Button className="flex-grow-0" style={{minWidth: "unset"}} onClick={() => confirmDeleteGroup(group)}>X</Button>
                                                </ButtonGroup>
                                            </div>
                                        )}
                                    </Row>
                                </ShowLoading>
                            </TabPane>
                        </TabContent>
                    </>}
                </ShowLoading>
            </Col>
            <Col md={7} className="d-none d-md-block">
                <GroupEditor group={selectedGroup} updateGroup={updateGroup} createNewGroup={createNewGroup} groupNameRef={groupNameRef} />
            </Col>
        </Row>
    </Container>;
};

export const Groups = connect(stateFromProps, dispatchFromProps)(GroupsPageComponent);
