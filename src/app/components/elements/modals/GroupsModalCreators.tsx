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
import { Trans, useTranslation } from "react-i18next";
import i18next from "i18next";

// Avoid loading the (large) QRCode library unless necessary:
const GroupQRPanel = lazy(() => import("../panels/GroupQRPanel").catch(() => ({default: () => <i>{i18next.t("common:groups.qr.loadError")}</i>})));

const AdditionalManagerSelfRemovalModalBody = ({group}: {group: AppGroup}) => <p>
    You are about to remove yourself as a manager from &apos;{group.groupName}&apos;. This group will no longer appear on your
    &apos;Assignment progress&apos; page or on the &apos;Manage groups&apos; page.  You will still have student connections with the
    students who agreed to share data with you.  The group owner will <strong>not</strong> be notified.
</p>;
export const additionalManagerSelfRemovalModal = (group: AppGroup, user: RegisteredUserDTO) => ({
    closeAction: () => store.dispatch(closeActiveModal()),
    title: i18next.t("common:groups.managers.removeSelf.title"),
    body: <AdditionalManagerSelfRemovalModalBody group={group} />,
    buttons: [
        <Row key={0}>
            <Col>
                <Button block color="keyline" onClick={() => {
                    store.dispatch(closeActiveModal());
                }}>
                    {i18next.t("common:groups.managers.removeSelf.cancel")}
                </Button>
            </Col>
            <Col>
                <Button block color="solid" onClick={() => {
                    if (group.id && user.id) {
                        store.dispatch(groupsApi.endpoints.deleteGroupManager.initiate({groupId: group.id, managerUserId: user.id}));
                    }
                    store.dispatch(closeActiveModal());
                }}>
                    {i18next.t("common:groups.managers.removeSelf.confirm")}
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
    const { t } = useTranslation();
    const tokenQuery = useGetGroupTokenQuery(group.id as number);
    const [showQR, setShowQR] = useState(false);
    return <div>
        <ShowLoadingQuery
            query={tokenQuery}
            defaultErrorTitle={t("common:groups.invite.errorTitle")}
            thenRender={token => <div className="d-flex flex-column gap-3">
                <div>
                    {firstTime && <h2 className="h3">{t("common:groups.invite.membersHeading")}</h2>}
                    <p>{t("common:groups.invite.shareIntro")}</p>
                    <p className={"mb-0"}>{t("common:groups.invite.studentInfo")}</p>
                </div>
                <div>
                    <h2 className="h3">{t("common:groups.invite.linkHeading")}</h2>
                    <p>{t("common:groups.invite.linkDescription")}</p>
                    <ReadonlyClipboardInput data-testid={"share-link"} value={`${location.origin}/account?authToken=${token?.token}`} />
                </div>
                <div>
                    <h2 className="h3">{t("common:groups.invite.qrHeading")}</h2>
                    <p>{t("common:groups.invite.qrDescription")}</p>
                    {showQR
                        ? <GroupQRPanel link={`${location.origin}/account?authToken=${token?.token}`} groupName={group.groupName} />
                        : <Button color={"keyline"} onClick={() => {
                            startTransition(() => {
                                setShowQR(true);
                            });
                        }}>
                            {t("common:groups.invite.qrButton")}
                        </Button>
                    }
                </div>
                <div>
                    <h2 className="h3">{t("common:groups.invite.codeHeading")}</h2>
                    <p><Trans i18nKey="common:groups.invite.codeDescription" components={{ accountPage: <b />, teacherConnections: <b /> }} values={{ siteTitle: SITE_TITLE_SHORT }} /></p>
                    <ReadonlyClipboardInput data-testid={"share-code"} value={token?.token} />
                </div>
                <div>
                    <h2 className="h3">{t("common:groups.invite.nextSteps")}</h2>
                </div>
            </div>}
        />
    </div>;
};

const GroupInvitationModalButtons = ({firstTime, group, user}: {firstTime: boolean, group: AppGroup, user: RegisteredUserDTO}) => {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return <Row key={0} className="w-100">
        <Col className="pb-0 pb-md-2 pb-lg-0" xs={siteSpecific(undefined, 12)} lg={siteSpecific(undefined, "auto")}>
            <Button block color="solid" className={siteSpecific("", "mb-3")} onClick={() => {
                store.dispatch(closeActiveModal());
                void navigate(PATHS.SET_ASSIGNMENTS);
            }}>
                Set an assignment
            </Button>
        </Col>
        {/* Only teachers are allowed to add additional managers to a group. */}
        {firstTime && isTeacherOrAbove(user) && <Col className="pb-0 pb-md-2 pb-lg-0" xs={siteSpecific(undefined, 12)} lg={siteSpecific(undefined, "auto")}>
            <Button block color="keyline" className={siteSpecific("", "mb-3")} onClick={() => {
                void store.dispatch(closeActiveModal());
                void store.dispatch(showGroupManagersModal({group, user}));
            }}>
                {t("common:groups.invite.addManagers")}
            </Button>
        </Col>}
    </Row>;
};

export const groupInvitationModal = (group: AppGroup, user: RegisteredUserDTO, firstTime: boolean, backToCreateGroup?: () => void) => ({
    closeAction: () => store.dispatch(closeActiveModal()),
    title: firstTime ? i18next.t("common:groups.invite.createdTitle") : i18next.t("common:groups.invite.inviteTitle"),
    body: <CurrentGroupInviteModal group={group} firstTime={firstTime} />,
    buttons: [
        <GroupInvitationModalButtons key={0} firstTime={firstTime} group={group} user={user} />
    ],
    bodyContainerClassName: "mb-0 pb-0"
});

const CurrentGroupManagersModal = ({groupId, archived, userIsOwner, user}: {groupId: number, archived: boolean, userIsOwner: boolean, user: RegisteredUserDTO}) => {
    const { t } = useTranslation();
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
        let confirm_text;
        if (group?.additionalManagerPrivileges) {
            confirm_text = t("common:groups.managers.promote.confirmWithPrivileges");
        } else {
            confirm_text = t("common:groups.managers.promote.confirmWithoutPrivileges");
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
            if (confirm(t("site:groups.managers.remove.confirm"))) {
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
        <h2 className="h3">{t("common:groups.managers.selectedGroup", { groupName: group.groupName })}</h2>
        <h3 className="h4">{t("common:groups.managers.permissions.heading")}</h3>
        <p>
            {t("common:groups.managers.permissions.intro")}
            <ul>
                <li>{t("common:groups.managers.permissions.students")}</li>
                <li>Set new assignments or tests</li>
                <li>{t("common:groups.managers.permissions.progress")}</li>
            </ul>
            {t("site:groups.managers.permissions.note")}
        </p>

        {!userIsOwner && group.ownerSummary && <div>
            <h3 className="h4">{t("common:groups.managers.ownerHeading")}</h3>
            <Table className="group-table">
                <tbody>
                    <tr key={group.ownerSummary.email} data-testid={"group-owner"}>
                        <td><span className="group-table-person" />{group.ownerSummary.givenName} {group.ownerSummary.familyName} ({group.ownerSummary.email})
                        </td>
                    </tr>
                </tbody>
            </Table>
        </div>}

        <h3 className="h4">{t("common:groups.managers.currentHeading")}</h3>

        {additionalManagers.length == 0 &&
            <p>{t("common:groups.managers.emptyState")}</p>}
        {additionalManagers.length == 1 && user && additionalManagers[0].id == user.id &&
            <p>{t("common:groups.managers.onlySelf")}</p>}
        {!(additionalManagers.length == 0 || (additionalManagers.length == 1 && user && additionalManagers[0].id == user.id)) &&
            <p>{t("common:groups.managers.listIntro")}</p>}

        <ul className="group-table p-0 mb-3">
            {additionalManagers && additionalManagers.map(manager =>
                <li key={manager.email} className="d-flex align-items-center py-2" data-testid={"group-manager"}>
                    {siteSpecific(
                        <i className="icon icon-my-isaac me-2" />,
                        <span className="icon-group-table-person" />
                    )}
                    <span>{manager.givenName} {manager.familyName} {user.id === manager.id && <span className={"text-muted"}>{t("common:groups.managers.youLabel")}</span>} ({manager.email})</span>
                    <Spacer />
                    {userIsOwner && <Button className="d-none d-lg-inline" size="sm" color={"keyline"} onClick={() => promoteManager(manager)}>
                        {t("common:groups.managers.makeOwner")}
                    </Button>}
                    {(userIsOwner || user?.id === manager.id || group.additionalManagerPrivileges) && !(userIsOwner && below["md"](deviceSize)) &&
                        <Button className="d-inline ms-2" size="sm" color={"solid"}
                            onClick={() => user?.id === manager.id ? removeSelf(manager) : removeManager(manager)}
                        >
                            {t("common:groups.managers.remove")}
                        </Button>}

                    {userIsOwner && <UncontrolledDropdown className="d-inline d-lg-none ms-2">
                        <DropdownToggle caret className="d-flex align-items-center">
                            {t("common:groups.managers.actionsDropdown")}
                        </DropdownToggle>
                        <DropdownMenu>
                            <DropdownItem onClick={() => promoteManager(manager)}>{t("common:groups.managers.makeOwner")}</DropdownItem>
                            <DropdownItem onClick={() => (user?.id === manager.id) ? removeSelf(manager) : removeManager(manager)}>{t("common:groups.managers.remove")}</DropdownItem>
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
                label={<span>{t("common:groups.managers.extraPrivilegesLabel")}</span>}
            />
            {group.additionalManagerPrivileges
                ? <>
                    <Trans i18nKey="common:groups.managers.cautionHeader" components={{ strong: <span className={"fw-bold"} /> }} />
                    <ul>
                        <li><Trans i18nKey="common:groups.managers.privilegeModifyAssignments" components={{ b: <b /> }} /></li>
                        <li>{t("common:groups.managers.privilegeRemoveMembers")}</li>
                        <li>{t("common:groups.managers.privilegeArchiveRename")}</li>
                        <li>{t("common:groups.managers.privilegeManageManagers")}</li>
                    </ul>
                    {t("common:groups.managers.uncheckInstruction")}
                </>
                : <>
                    {t("common:groups.managers.enableIntro")}
                    <ul>
                        <li><Trans i18nKey="common:groups.managers.privilegeModifyAssignments" components={{ b: <b /> }} /></li>
                        <li>{t("common:groups.managers.privilegeRemoveMembers")}</li>
                        <li>{t("common:groups.managers.privilegeArchiveRename")}</li>
                        <li>{t("common:groups.managers.privilegeManageManagers")}</li>
                    </ul>
                </>
            }
        </Alert>}

        {(userIsOwner || group.additionalManagerPrivileges) && <>
            <h3 className="mt-3 h4">{t("common:groups.managers.addSectionTitle")}</h3>
            <p>{t("common:groups.managers.addInstructions", { siteTitle: SITE_TITLE_SHORT })}</p>
            <Form onSubmit={addManager}>
                <Input type="text" value={newManagerEmail} placeholder={t("common:groups.managers.emailPlaceholder")} onChange={event => setNewManagerEmail(event.target.value)}/>
                <ShowLoadingQuery
                    query={tokenQuery}
                    placeholder={generateGroupLinkReminder()}
                    ifError={() => generateGroupLinkReminder()}
                    thenRender={generateGroupLinkReminder}
                />
                <Button block className={siteSpecific("groups-modal-btn", "")} onClick={addManager} disabled={!isDefined(newManagerEmail) || newManagerEmail === ""}>{t("common:groups.managers.addButton")}</Button>
            </Form>
        </>}
    </div>;
};
export const groupManagersModal = (group: AppGroup, user: RegisteredUserDTO) => {
    const userIsOwner = user?.id === group.ownerId;
    return {
        closeAction: () => store.dispatch(closeActiveModal()),
        title: userIsOwner ? i18next.t("common:groups.share.title") : i18next.t("common:groups.shared.title"),
        body: <CurrentGroupManagersModal groupId={group.id as number} archived={!!group.archived} userIsOwner={userIsOwner} user={user} />,
    };
};

interface GroupEmailModalProps {
    users?: number[];
}
const CurrentGroupEmailModal = ({users}: GroupEmailModalProps) => {
    const { t } = useTranslation();
    return <Col>
        <Row>
            {t("common:groups.email.infoText")}
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
    title: i18next.t("common:groups.email.title"),
    body: <CurrentGroupEmailModal users={users} />
});

interface GroupCreateModalProps {
    user: RegisteredUserDTO
}

const GroupCreateModal = ({user}: GroupCreateModalProps) => {
    const { t } = useTranslation();
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
                   {t("common:groups.create.nameLabel")}
                </Label>
                {isAda && <p className="d-block input-description mb-2">{t("ada:groups.create.nameDescription")}</p>}
                <Input invalid={submissionAttempted && !validateGroupName()} id={"group-name-input"} onChange={event => setNewGroupName(event.target.value)} data-testid={"group-name-input"} />
                <FormFeedback id="givenNameValidationMessage">
                    {t("common:groups.create.nameError")}
                </FormFeedback>
            </FormGroup>
            <Button block type={"submit"} className={"mt-4"}>
                {t("common:groups.create.submitButton")}
            </Button>
        </Form>
    </>;
};

export const groupCreateModal = (user: RegisteredUserDTO): ActiveModalProps => ({
    closeAction: () => store.dispatch(closeActiveModal()),
    title: i18next.t("common:groups.create.title"),
    body: <GroupCreateModal user={user}/>,
    size: "md",
    centered: true
});

const GroupArchiveModal = ({group, toggleArchived}: {group: AppGroup; toggleArchived: () => void;}) => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();

    return <div className="d-flex flex-column gap-3">
        <p>Are you sure you want to archive &quot;{group.groupName}&quot;? You will no longer be able to set assignments or tests to this group, and the group will not be visible {siteSpecific(<>on the <strong>Assignment progress</strong> or <strong>Assignment schedule</strong> pages.</>, <>in the Markbook.</>)}</p>
        <p>{t("common:groups.archive.unarchiveHint")}</p>
        <div className="text-end">
            <Button color="keyline" className="me-2" onClick={() => dispatch(closeActiveModal())}>
                {t("common:groups.archive.cancelButton")}
            </Button>
            <Button color="solid" onClick={() => {
                toggleArchived();
                dispatch(closeActiveModal());
            }}>
                {t("common:groups.archive.confirmButton")}
            </Button>
        </div>
    </div>;
};

export const groupArchiveModal = (group: AppGroup, toggleArchived: () => void): ActiveModalProps => ({
    closeAction: () => store.dispatch(closeActiveModal()),
    title: i18next.t("common:groups.archive.title"),
    body: <GroupArchiveModal group={group} toggleArchived={toggleArchived} />,
    size: "md",
    centered: true
});
