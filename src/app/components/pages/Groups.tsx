import React, {ReactNode, useEffect, useMemo, useRef, useState} from "react";
import {
    Button,
    ButtonDropdown,
    Card,
    CardBody,
    CardProps,
    Col,
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
import { Trans, useTranslation } from "react-i18next";
import i18next from "i18next";

enum SortOrder {
    Alphabetical = "Alphabetical",
    DateCreated = "Date Created"
}

let tooltip = 0;

interface TooltipProps extends React.ComponentProps<"span"> {
    children?: ReactNode;
    tipText: ReactNode;
}

const Tooltip = ({children, tipText, ...props}: TooltipProps) => {
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
    let message = i18next.t("common:groups.member.passwordReset.cannotSend");
    if (canSendPasswordResetRequest(member, passwordRequestSent)) {
        message = i18next.t("common:groups.member.passwordReset.sendTooltip");
    } else if (passwordRequestSent) {
        message = i18next.t("common:groups.member.passwordReset.sentTooltip");
    } else if (member.emailVerificationStatus == 'DELIVERY_FAILED') {
        message = i18next.t("common:groups.member.passwordReset.deliveryFailedTooltip");
    }
    return message;
};

const confirmDeleteGroup = (dispatch: AppDispatch, deleteGroup: (groupId: number) => void, user: RegisteredUserDTO, groupToDelete: AppGroup) => {
    if (user.id === groupToDelete.ownerId) {
        if (confirm(i18next.t("common:groups.delete.ownerConfirm", { groupName: groupToDelete.groupName }))) {
            deleteGroup(groupToDelete.id as number);
        }
    } else {
        if (confirm(i18next.t("common:groups.delete.nonOwnerConfirm", { groupName: groupToDelete.groupName }))) {
            void dispatch(showAdditionalManagerSelfRemovalModal({group: groupToDelete, user}));
        }
    }
};

interface MemberInfoProps {
    group: AppGroup;
    member: AppGroupMembership;
    user: RegisteredUserDTO;
}
const MemberInfo = ({group, member, user}: MemberInfoProps) => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const [passwordRequestSent, setPasswordRequestSent] = useState(false);
    const [deleteMember] = useDeleteGroupMemberMutation();
    const deviceSize = useDeviceSize();

    function resetPassword() {
        setPasswordRequestSent(true);
        void dispatch(resetMemberPassword(member));
    }

    function confirmDeleteMember() {
        if (confirm(t("common:groups.member.removeConfirm", { groupName: group.groupName }))) {
            void deleteMember({groupId: group.id as number, userId: member.id as number});
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
                    <span className="not-authorised"><Trans i18nKey="common:groups.member.nameNotSharing" components={{ struckOut: <span className="ps-1 struck-out" /> }} values={{ givenName: member.givenName, familyName: member.familyName }} /></span>
                }
            </div>
            <div>
                {member.emailVerificationStatus == "DELIVERY_FAILED" &&
                    <Tooltip tipText={<>
                        <Trans i18nKey="common:groups.member.emailDeliveryFailedTooltip" components={{ br: <br /> }} />
                    </>} className="icon-email-status failed" />
                }
                {member.emailVerificationStatus == "NOT_VERIFIED" &&
                    <Tooltip tipText={t("common:groups.member.emailUnverifiedTooltip")} className="icon-email-status unverified" />
                }
                {member.groupMembershipInformation && member.groupMembershipInformation.status == "INACTIVE" &&
                    <Tooltip className="ms-1" tipText={t("common:groups.member.inactiveTooltip")}>{t("common:groups.member.inactiveLabel")}</Tooltip>
                }
            </div>
        </div>
        <div className="d-flex">
            {["xs", "sm"].includes(deviceSize)? <>
                <UncontrolledButtonDropdown size="sm">
                    <DropdownToggle caret className="text-nowrap" color="link" size="sm">
                        {t("common:groups.member.manageButton")}
                    </DropdownToggle>
                    <DropdownMenu>
                        {isTeacherOrAbove(user) &&
                            <DropdownItem onClick={resetPassword} disabled={!canSendPasswordResetRequest(member, passwordRequestSent)}>
                                {!passwordRequestSent ? t("common:groups.member.passwordReset.button") : t("common:groups.member.passwordReset.sentLabel")}
                            </DropdownItem>
                        }
                        {userHasAdditionalGroupPrivileges &&
                            <DropdownItem onClick={confirmDeleteMember} aria-label={t("common:groups.member.removeAriaLabel")}>{t("common:button.remove")}</DropdownItem>
                        }
                    </DropdownMenu>
                </UncontrolledButtonDropdown>
            </> : <>
                {isTeacherOrAbove(user) && <>
                    <Tooltip tipText={passwordResetInformation(member, passwordRequestSent)} className="text-end d-none d-sm-block">
                        <Button color="link" size="sm" className="mx-2" onClick={resetPassword}
                            disabled={!canSendPasswordResetRequest(member, passwordRequestSent)}
                        >
                            {!passwordRequestSent ? t("common:groups.member.passwordReset.button") : t("common:groups.member.passwordReset.sentLabel")}
                        </Button>
                    </Tooltip>
                </>}
                {userHasAdditionalGroupPrivileges &&
                    <Tooltip tipText={t("common:groups.member.removeTooltip")} className="text-end d-none d-sm-block">
                        <Button color="link" size="sm" className="mx-2" onClick={confirmDeleteMember} aria-label={t("common:groups.member.removeAriaLabel")}>
                            {t("common:button.remove")}
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
    const { t } = useTranslation();
    const dispatch = useAppDispatch();

    const [updateGroup] = useUpdateGroupMutation();

    const [isExpanded, setExpanded] = useState(false);
    const [newGroupName, setNewGroupName] = useState(group.groupName ?? "");
    const [existingGroupWithConflictingName, setExistingGroupWithConflictingName] = useState<AppGroup | undefined>(undefined);
    const [isGroupNameInvalid, setIsGroupNameInvalid] = useState<boolean>(false);
    const [isGroupNameValid, setIsGroupNameValid] = useState<boolean>(false);
    const isUserGroupOwner = user.id === group.ownerId;

    useEffect(() => {
        setExpanded(false);
        setNewGroupName(group.groupName ?? "");
        setIsGroupNameInvalid(false);
        setIsGroupNameValid(false);
    }, [group?.groupName, group.id]);

    function editGroupName(event: React.ChangeEvent<HTMLInputElement>) {
        const newName = event.target.value;
        const conflictingGroup = allGroups?.find(g => g.groupName == newName && (isDefined(group) ? group.id != g.id : true));
        setNewGroupName(newName);
        setExistingGroupWithConflictingName(conflictingGroup);

        const invalid = isDefined(conflictingGroup) || newName.trim().length === 0;
        setIsGroupNameInvalid(invalid);
        setIsGroupNameValid(!invalid && newName !== group.groupName);
    };

    function saveUpdatedGroup(event: React.FormEvent) {
        event?.preventDefault();
        if (newGroupName.trim().length === 0) {
            dispatch(showErrorToast(t("common:groups.editor.renameErrorTitle"), t("common:groups.editor.renameErrorDetail")));
            return;
        }
        if (!isGroupNameValid) {
            return;
        }

        const updatedGroup = {...group, groupName: newGroupName};
        void updateGroup({updatedGroup});
    }

    function toggleSelfRemoval() {
        if (group) {
            const updatedGroup = {...group, selfRemoval: !group.selfRemoval};
            void updateGroup({
                updatedGroup,
                message: "Group member self-removal " + (updatedGroup.selfRemoval ? "enabled" : "disabled") + "."
            });
        }
    }

    function toggleArchived() {
        if (group) {
            const updatedGroup = {...group, archived: !group.archived};
            void updateGroup({
                updatedGroup,
                message: "Group " + group.groupName + (updatedGroup.archived ? " archived" : " unarchived")
            });
        }
    }

    function groupUserIds(group: AppGroup) {
        const groupUserIdList: number[] = [];
        group.members?.forEach((member: AppGroupMembership) => {
            if (isDefined(member.groupMembershipInformation?.userId) && member.authorisedFullAccess && member.groupMembershipInformation?.status === "ACTIVE") {
                groupUserIdList.push(member.groupMembershipInformation.userId);
            }
        });
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

    const [deleteGroup] = useDeleteGroupMutation();

    return <Card className={classNames({"mb-4": isPhy})} {...rest}>
        <CardBody>
            <h2 className="mb-2 h4">
                {t("site:groups.editor.title")}
            </h2>

            <div className={"d-flex flex-column gap-2"}>
                <div>
                    <Form className="form-inline" onSubmit={saveUpdatedGroup}>
                        <Label htmlFor="groupName" className={"form-required fw-bold"}>
                            {isUserGroupOwner || group.additionalManagerPrivileges ? t("common:groups.editor.renameLabel") : t("common:groups.editor.nameLabel") }
                        </Label>
                        <InputGroup className="flex-column flex-md-row align-items-center gap-2 stackable-input-group w-100">
                            <Input
                                id="groupName"
                                length={50}
                                placeholder={t("common:groups.editor.namePlaceholder")} value={newGroupName}
                                onChange={editGroupName} aria-label={t("common:groups.editor.nameAriaLabel")} disabled={!(isUserGroupOwner || group.additionalManagerPrivileges)}
                                invalid={isGroupNameInvalid}
                                valid={isGroupNameValid}
                                className={"w-100 w-md-auto flex-md-fill"}
                                aria-describedby="groupNameFeedback"
                                data-testid={"groupName"}
                            />
                            {(!isDefined(group) || isUserGroupOwner || group.additionalManagerPrivileges) && <Button
                                color={siteSpecific("keyline", "solid")}
                                className="w-100 w-md-auto" disabled={!isGroupNameValid}
                                onClick={saveUpdatedGroup}
                            >
                                {t("common:groups.editor.updateButton")}
                            </Button>}
                            <FormFeedback id={"groupNameFeedback"}>
                                {newGroupName.trim().length === 0 && t("common:groups.editor.nameEmpty")}
                                {isDefined(existingGroupWithConflictingName) && `A${existingGroupWithConflictingName?.archived ? "n archived" : ""} group with that name already exists.`}
                            </FormFeedback>
                        </InputGroup>
                    </Form>
                </div>

                {siteSpecific(<div className="section-divider-bold"/>, <hr className="text-center"/>)}

                <div>
                    <div className={"d-flex flex-column flex-md-row justify-content-between"}>
                        <div>
                            <p className={"fw-bold"}>{t("common:groups.editor.managersTitle")}</p>
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
                                                    {manager.givenName} {manager.familyName} {manager.id === group.ownerId && t("common:groups.editor.ownerLabel")} {user.id === manager.id && t("common:groups.editor.youLabel")}
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
                                        `${additionalManagers.length > 1 ? "Edit" : "Add"} group managers` : t("common:groups.editor.moreInfoButton")
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
                                <p className={"fw-bold"}>{t("common:groups.editor.membersTitle")}</p>
                                <div className={"d-flex flex-column flex-md-row gap-1"}>
                                    <Button
                                        disabled={group.archived}
                                        className={"d-inline-block text-nowrap w-100 w-sm-auto"}
                                        color="solid"
                                        onClick={() => dispatch(showGroupInvitationModal({group, user, firstTime: false}))}
                                    >
                                        {t("common:groups.editor.inviteButton")}
                                    </Button>
                                    {canEmailUsers && usersInGroup.length > 0 &&
                                        <Button
                                            className={"d-inline-block text-nowrap w-100 w-sm-auto"}
                                            color="keyline"
                                            onClick={() => dispatch(showGroupEmailModal(usersInGroup))}
                                        >
                                            {t("common:groups.editor.emailButton")}
                                        </Button>
                                    }
                                </div>
                            </div>
                            <div>
                                <StyledCheckbox
                                    id="self-removal"
                                    onChange={toggleSelfRemoval}
                                    checked={!!group.selfRemoval}
                                    label={<span>{t("common:groups.editor.selfRemovalLabel")}</span>}
                                />
                            </div>
                            <div>
                                {t("common:groups.editor.memberCount", { count: group.members.length })}
                                {bigGroup && !isExpanded &&
                                    <ButtonDropdown className="float-end" toggle={() => setExpanded(true)}>
                                        <DropdownToggle caret>{t("common:groups.editor.showButton")}</DropdownToggle>
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
                            {t("common:groups.editor.deleteButton")}
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
    const { t } = useTranslation();
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
            {showCreateGroup &&
                <>
                    <Button className={"d-block w-100"} onClick={() => {void dispatch(showCreateGroupModal({user}));}}>{t("common:groups.selector.createButton")}</Button>
                    {siteSpecific(<div className="section-divider"/>, <hr/>)}
                </>
            }

            <div className={classNames("text-start", {"mt-3": showCreateGroup})}>
                <strong className="me-2">{t("common:groups.selector.label")}</strong>
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
                                    onChange={() => setSelectedGroupId(id => g.id === id ? undefined : g.id)} data-testid={"select-group"}
                                    suffix={showArchived ? {icon: "icon icon-close", action: (e) => {e.stopPropagation(); confirmDeleteGroup(dispatch, deleteGroup, user, g);}, info: t("common:groups.selector.deleteInfo")} : undefined}
                                />
                            </li>
                            : <div key={g.id} className="group-item p-2" data-testid={"group-item"}>
                                <div className="d-flex justify-content-between align-items-center group-name-buttons">
                                    <Button title={isStaff(user) ? t("common:groups.selector.groupIdTitle", { groupId: g.id }) : undefined} color="link" data-testid={"select-group"} className="text-start px-1 py-1 flex-fill group-name" onClick={() => setSelectedGroupId(g.id)}>
                                        {g.groupName}
                                    </Button>
                                    {showArchived && (isPhy ?
                                        <button onClick={(e) => {e.stopPropagation(); confirmDeleteGroup(dispatch, deleteGroup, user, g);}}
                                            aria-label={t("common:groups.editor.deleteButton")} className="ms-1 icon-close" title={t("common:groups.editor.deleteButton")}/> :
                                        <IconButton icon={{name: "icon-bin", color: "white"}} className="action-button" affixClassName="icon-sm" aria-label={t("common:groups.editor.deleteButton")} title={t("common:groups.editor.deleteButton")} onClick={() => confirmDeleteGroup(dispatch, deleteGroup, user, g)}/>)
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
    const { t } = useTranslation();
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
            void getGroupMembers(selectedGroup.id);
        }
    }, [getGroupMembers, selectedGroup?.id]); // This can't just be group, because group changes when the members change, causing an infinite reload loop

    const groupNameInputRef = useRef<HTMLInputElement>(null);

    const pageHelp = <span>
        <Trans i18nKey="common:groups.page.helpText" components={{ br: <br />, inviteUsersText: <i /> }} />
    </span>;

    const GroupsPhy = <PageContainer
        pageTitle={
            <TitleAndBreadcrumb currentPageTitle={t("common:groups.page.title")} icon={{type: "icon", icon: "icon-group"}}/>
        }
        sidebar={siteSpecific(
            <GroupsSidebar user={user} groups={groups} allGroups={allGroups} selectedGroup={selectedGroup} setSelectedGroupId={setSelectedGroupId}
                showArchived={showArchived} setShowArchived={setShowArchived}
                hideButton
            />,
            undefined
        )}
    >
        <ShowLoadingQuery query={groupQuery} defaultErrorTitle={t("common:groups.page.errorTitle")}>
            <PageMetadata noTitle showSidebarButton sidebarButtonText={t("common:groups.page.sidebarButton")} helpModalId="help_modal_groups">
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
        pageTitle={<TitleAndBreadcrumb currentPageTitle={t("common:groups.page.title")} className="mb-4" help={pageHelp} />}
        sidebar={<MyAdaSidebar />}
    >
        <ShowLoadingQuery query={groupQuery} defaultErrorTitle={t("common:groups.page.errorTitle")}>
            {!isEmptyState ?
                <>
                    <p className={"mw-75"}>{t("common:groups.page.addTeachersInfo")}</p>
                    <Row className="mb-7">
                        <Col lg={4}>
                            <GroupSelector user={user} groups={groups} allGroups={allGroups} selectedGroup={selectedGroup} setSelectedGroupId={setSelectedGroupId}
                                showArchived={showArchived} setShowArchived={setShowArchived} showCreateGroup={true} />
                        </Col>
                        <Col lg={8} className="d-none d-lg-block" data-testid={"group-editor"}>
                            {selectedGroup && <GroupEditor group={selectedGroup} allGroups={allGroups} groupNameInputRef={groupNameInputRef} user={user} />}
                        </Col>
                    </Row>
                </>
                :
                <div className={"mb-7"}>
                    <p className={"mw-50"}>
                        <Trans i18nKey="common:groups.page.emptyState" components={{ br: <br /> }} values={{ siteTitle: SITE_TITLE_SHORT }} />
                    </p>
                    <Button onClick={() => void dispatch(showCreateGroupModal({user}))}>
                        {t("common:groups.page.createButton")}
                    </Button>
                </div>
            }
        </ShowLoadingQuery>
    </PageContainer>;

    return siteSpecific(GroupsPhy, GroupsAda);
};
