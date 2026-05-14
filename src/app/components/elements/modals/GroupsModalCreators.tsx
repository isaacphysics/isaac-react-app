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
import { useTranslation, Trans } from 'react-i18next'
import i18next from 'i18next'

// Avoid loading the (large) QRCode library unless necessary:
const GroupQRPanel = lazy(() => import("../panels/GroupQRPanel").catch(() => ({default: () => <i>{i18next.t('failedToLoadQrCodePanel', 'Failed to load QR code panel.')}</i>})));

const AdditionalManagerSelfRemovalModalBody = ({group}: {group: AppGroup}) => <p>
    You are about to remove yourself as a manager from &apos;{group.groupName}&apos;. This group will no longer appear on your
    &apos;Assignment progress&apos; page or on the &apos;Manage groups&apos; page.  You will still have student connections with the
    students who agreed to share data with you.  The group owner will <strong>not</strong> be notified.
</p>;
export const additionalManagerSelfRemovalModal = (group: AppGroup, user: RegisteredUserDTO) => ({
    closeAction: () => store.dispatch(closeActiveModal()),
    title: i18next.t('removeYourselfAsAGroupManager', 'Remove yourself as a group manager'),
    body: <AdditionalManagerSelfRemovalModalBody group={group} />,
    buttons: [
        <Row key={0}>
            <Col>
                <Button block color="keyline" onClick={() => {
                    store.dispatch(closeActiveModal());
                }}>
                    {i18next.t('button.cancel', 'Cancel')}
                </Button>
            </Col>
            <Col>
                <Button block color="solid" onClick={() => {
                    if (group.id && user.id) {
                        store.dispatch(groupsApi.endpoints.deleteGroupManager.initiate({groupId: group.id, managerUserId: user.id}));
                    }
                    store.dispatch(closeActiveModal());
                }}>
                    {i18next.t('button.confirm', 'Confirm')}
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
    const { t } = useTranslation()
    const tokenQuery = useGetGroupTokenQuery(group.id as number);
    const [showQR, setShowQR] = useState(false);
    return <div>
        <ShowLoadingQuery
            query={tokenQuery}
            defaultErrorTitle={t('errorFetchingGroupJoiningToken', 'Error fetching group joining token')}
            thenRender={token => <div className="d-flex flex-column gap-3">
                <div>
                    {firstTime && <h3>{t('inviteMembersToJoin', 'Invite members to join')}</h3>}
                    <p>{t('shareTheLinkOrCodeToInvitePeopleToYourGroup', 'Share the link or code to invite people to your group.')}</p>
                    <p className={"mb-0"}>{t('studentsWillSeeTheNameAndEmailAddressOnYourAccountWhenTheyJoin', 'Students will see the name and email address on your account when they join.')}</p>
                </div>
                <div>
                    <h3>{t('shareThisLink', 'Share this link')}</h3>
                    <p>{t('shareThisLinkWithStudentsSoTheyCanJoinYourGroup', 'Share this link with students so they can join your group:')}</p>
                    <ReadonlyClipboardInput data-testid={"share-link"} value={`${location.origin}/account?authToken=${token?.token}`} />
                </div>
                <div>
                    <h3>{t('generateAQrCode', 'Generate a QR Code')}</h3>
                    <p>{t('studentsCanScanAQrCodeOnTheirDeviceToJoinYourGroup', 'Students can scan a QR code on their device to join your group:')}</p>
                    {showQR
                        ? <GroupQRPanel link={`${location.origin}/account?authToken=${token?.token}`} groupName={group.groupName} />
                        : <Button color={siteSpecific("primary", "keyline")} onClick={() => {
                            startTransition(() => {
                                setShowQR(true);
                            });
                        }}>
                            {t('generateQrCode', 'Generate QR Code')}
                        </Button>
                    }
                </div>
                <div>
                    <h3>{t('orUseThisCode', 'Or use this code')}</h3>
                    <p><Trans i18nKey="studentsCanEnterThisCodeInTheirSite_title_shortAccountTheyllNeedToGoToBmyAccountbThenBteacherConnectionsb">Students can enter this code in their {{ SITE_TITLE_SHORT }} account. They’ll need to go to <b>My account</b>, then <b>Teacher Connections</b>.</Trans></p>
                    <ReadonlyClipboardInput data-testid={"share-code"} value={token?.token} />
                </div>
                <div>
                    <h3>{t('whatToDoNext', 'What to do next')}</h3>
                </div>
            </div>}
        />
    </div>;
};

const GroupInvitationModalButtons = ({firstTime, group, user}: {firstTime: boolean, group: AppGroup, user: RegisteredUserDTO}) => {
    const { t } = useTranslation()
    const navigate = useNavigate();

    return <Row key={0} className="w-100">
        <Col className="pb-0 pb-md-2 pb-lg-0" xs={siteSpecific(undefined, 12)} lg={siteSpecific(undefined, "auto")}>
            <Button block color="primary" className={siteSpecific("btn-keyline", "text-nowrap mb-3")} onClick={() => {
                store.dispatch(closeActiveModal());
                void navigate(PATHS.SET_ASSIGNMENTS);
            }}>
                {t('setAnAssignment', 'Set an assignment')}
            </Button>
        </Col>
        {/* Only teachers are allowed to add additional managers to a group. */}
        {firstTime && isTeacherOrAbove(user) && <Col className="pb-0 pb-md-2 pb-lg-0" xs={siteSpecific(undefined, 12)} lg={siteSpecific(undefined, "auto")}>
            <Button outline block color="secondary" className={siteSpecific("btn-keyline", "text-nowrap mb-3")} onClick={() => {
                void store.dispatch(closeActiveModal());
                void store.dispatch(showGroupManagersModal({group, user}));
            }}>
                {t('addGroupManagers', 'Add group managers')}
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
    const { t } = useTranslation()
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
            confirm_text = t('areYouSureYouWantToPromoteThisManagerToGroupOwnernTheyWillInheritTheAbilityToAddAdditionalManagersToArchiveAndDeleteThisGroupnYouWillBeDemotedToAnAdditionalGroupManagernYouWillNoLongerBeAbleToAddOrRemoveOtherManagersButYouWillStillBeAbleToModifyOrDeleteAssignmentsArchiveOrRenameTheGroupOrRemoveGroupMembers', 'Are you sure you want to promote this manager to group owner?\\n\n• They will inherit the ability to add additional managers to, archive and delete this group.\\n\n• You will be demoted to an additional group manager.\\n\n• You will no longer be able to add or remove other managers, but you will still be able to modify or delete assignments, archive or rename the group or remove group members.');
        } else {
            confirm_text = t('areYouSureYouWantToPromoteThisManagerToGroupOwnernTheyWillInheritTheAbilityToAddAdditionalManagersToArchiveAndDeleteThisGroupnYouWillBeDemotedToAnAdditionalGroupManagerAndWillNotBeAbleToModifyOrDeleteAssignmentsArchiveOrRenameTheGroupOrRemoveGroupMembersnIfYouWishToRetainThesePrivilegesButTransferOwnershipClickCancelHereAndThenTickTheBoxToGiveAdditionalManagersExtraPrivilegesBeforeTransferringOwnership', 'Are you sure you want to promote this manager to group owner?\\n\n• They will inherit the ability to add additional managers to, archive and delete this group.\\n\n• You will be demoted to an additional group manager, and will not be able to modify or delete assignments, archive or rename the group or remove group members.\\n\n• If you wish to retain these privileges, but transfer ownership, click \'cancel\' here and then tick the box to give additional managers extra privileges before transferring ownership.');
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
            if (confirm(t('areYouSureYouWantToRemoveThisTeacherFromTheGroupTheyMayStillHaveAccessToStudentDataUntilStudentsRevokeTheConnectionFromTheir', 'Are you sure you want to remove this teacher from the group?\n\nThey may still have access to student data until students revoke the connection from their ') + siteSpecific("\"My Account\"", "\"My account\"") + " page.")) {
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
        <small><Trans i18nKey="strongrememberstrongStudentsMayNeedToReuseTheGroupLink"><strong>Remember:</strong> Students may need to reuse the group link</Trans>{token && <>{t('nbsp2', '&nbsp;(')}<code>{t('originaccountauthtoken', '{{origin}}/account?authToken=', { origin: location.origin })}{token?.token}</code>)</>} {t('toApproveAccessToTheirDataForAnyNewTeachers', 'to approve access to their data for any new teachers.')}</small>
    </p>;

    return !group ? <Loading/> : <div className={"mb-4"}>
        <h3>{t('selectedGroupGroupname', 'Selected group: {{groupName}}', { groupName: group.groupName })}</h3>
        <h4>{t('sharingPermissions', 'Sharing permissions')}</h4>
        <p>
            {t('whenYouShareThisGroupOtherTeachersCan', 'When you share this group, other teachers can:')}
            <ul>
                <li>{t('addAndRemoveStudents', 'Add and remove students')}</li>
                <li>{t('setNewAssignmentsOrTests', 'Set new assignments or tests')}</li>
                <li>{t('viewStudentProgress', 'View student progress')}</li>
            </ul>
            {t('additional', 'Additional')} {siteSpecific("managers", "teachers")} {t('willNotAutomaticallySeeDetailedMarkDataUnlessStudentsGiveThemAccess', 'will not automatically see detailed mark data unless students give them access.')}
        </p>

        {!userIsOwner && group.ownerSummary && <div>
            <h4>{t('groupOwner', 'Group owner:')}</h4>
            <Table className="group-table">
                <tbody>
                    <tr key={group.ownerSummary.email} data-testid={"group-owner"}>
                        <td><Trans i18nKey="spanClassnamegrouptablepersonGivennameGroupownersummarygivennameFamilynameGroupownersummaryfamilynameEmailGroupownersummaryemail"><span className="group-table-person" />{{ givenName: group.ownerSummary.givenName }} {{ familyName: group.ownerSummary.familyName }} ({{ email: group.ownerSummary.email }})</Trans></td>
                    </tr>
                </tbody>
            </Table>
        </div>}

        <h4>{t('currentGroupManagers', 'Current group managers')}</h4>

        {additionalManagers.length == 0 &&
            <p>{t('thereAreNoAdditionalGroupManagersForThisGroup', 'There are no additional group managers for this group.')}</p>}
        {additionalManagers.length == 1 && user && additionalManagers[0].id == user.id &&
            <p>{t('youAreTheOnlyAdditionalManagerForThisGroup', 'You are the only additional manager for this group.')}</p>}
        {!(additionalManagers.length == 0 || (additionalManagers.length == 1 && user && additionalManagers[0].id == user.id)) &&
            <p>{t('theUsersBelowHavePermissionToManageThisGroup', 'The users below have permission to manage this group.')}</p>}

        <ul className="group-table p-0 mb-3">
            {additionalManagers && additionalManagers.map(manager =>
                <li key={manager.email} className="d-flex align-items-center py-2" data-testid={"group-manager"}>
                    {siteSpecific(
                        <i className="icon icon-my-isaac me-2" />,
                        <span className="icon-group-table-person" />
                    )}
                    <span>{manager.givenName} {manager.familyName} {user.id === manager.id && <span className={"text-muted"}>{t('you2', '(you)')}</span>}{t('email3', '({{email}})', { email: manager.email })}</span>
                    <Spacer />
                    {userIsOwner && <Button className="d-none d-lg-inline" size="sm" color={siteSpecific("tertiary", "keyline")} onClick={() => promoteManager(manager)}>
                        {t('makeOwner', 'Make owner')}
                    </Button>}
                    {(userIsOwner || user?.id === manager.id || group.additionalManagerPrivileges) && !(userIsOwner && below["md"](deviceSize)) &&
                        <Button className="d-inline ms-2" size="sm" color={siteSpecific("tertiary", "secondary")}
                            onClick={() => user?.id === manager.id ? removeSelf(manager) : removeManager(manager)}
                        >
                            {t('remove', 'Remove')}
                        </Button>}

                    {userIsOwner && <UncontrolledDropdown className="d-inline d-lg-none ms-2">
                        <DropdownToggle caret className="d-flex align-items-center">
                            {t('actions', 'Actions')}
                        </DropdownToggle>
                        <DropdownMenu>
                            <DropdownItem onClick={() => promoteManager(manager)}>{t('makeOwner', 'Make owner')}</DropdownItem>
                            <DropdownItem onClick={() => (user?.id === manager.id) ? removeSelf(manager) : removeManager(manager)}>{t('remove', 'Remove')}</DropdownItem>
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
                label={<span>{t('giveAdditionalManagersExtraPrivileges', 'Give additional managers extra privileges')}</span>}
            />
            {group.additionalManagerPrivileges
                ? <><Trans i18nKey="spanClassnamefwboldcautionspanAllOtherGroupManagersAreAllowedTo"><span className={"fw-bold"}>Caution</span>: All other group managers are allowed to:</Trans><ul>
                        <li><Trans i18nKey="modifyOrDeleteBallAssignmentsbIncludingThoseSetByTheOwner">Modify or delete <b>all assignments</b>, including those set by the owner</Trans></li>
                        <li>{t('removeGroupMembers', 'Remove group members')}</li>
                        <li>{t('archiveAndRenameTheGroup', 'Archive and rename the group')}</li>
                        <li>{t('addOrRemoveOtherManagers', 'Add or remove other managers')}</li>
                    </ul>
                    {t('untickTheAboveBoxIfYouWouldLikeToRemoveTheseAdditionalPrivileges', 'Un-tick the above box if you would like to remove these additional privileges.')}
                </>
                : <>
                    {t('enablingThisOptionAllowsAdditionalManagersTo', 'Enabling this option allows additional managers to:')}
                    <ul>
                        <li><Trans i18nKey="modifyOrDeleteBallAssignmentsbIncludingThoseSetByTheOwner">Modify or delete <b>all assignments</b>, including those set by the owner</Trans></li>
                        <li>{t('removeGroupMembers', 'Remove group members')}</li>
                        <li>{t('archiveAndRenameTheGroup', 'Archive and rename the group')}</li>
                        <li>{t('addOrRemoveOtherManagers', 'Add or remove other managers')}</li>
                    </ul>
                </>
            }
        </Alert>}

        {(userIsOwner || group.additionalManagerPrivileges) && <>
            <h4 className="mt-3">{t('addAdditionalManagers', 'Add additional managers')}</h4>
            <p>{t('enterTheEmailOfAnotherSite_title_shortTeacherAccountBelowToAddThemAsAGroupManagerNoteThatThisWillShareTheirEmailAddressWithTheStudents', 'Enter the email of another {{SITE_TITLE_SHORT}} teacher account below to add them as a group manager. Note that this will share their email address with the students.', { SITE_TITLE_SHORT })}</p>
            <Form onSubmit={addManager}>
                <Input type="text" value={newManagerEmail} placeholder={t('enterEmailAddressHere', 'Enter email address here')} onChange={event => setNewManagerEmail(event.target.value)}/>
                <ShowLoadingQuery
                    query={tokenQuery}
                    placeholder={generateGroupLinkReminder()}
                    ifError={() => generateGroupLinkReminder()}
                    thenRender={generateGroupLinkReminder}
                />
                <Button block className={siteSpecific("groups-modal-btn", "")} onClick={addManager} disabled={!isDefined(newManagerEmail) || newManagerEmail === ""}>{t('addGroupManager', 'Add group manager')}</Button>
            </Form>
        </>}
    </div>;
};
export const groupManagersModal = (group: AppGroup, user: RegisteredUserDTO) => {
    const userIsOwner = user?.id === group.ownerId;
    return {
        closeAction: () => store.dispatch(closeActiveModal()),
        title: userIsOwner ? i18next.t('shareYourGroup', 'Share your group') : "Shared group",
        body: <CurrentGroupManagersModal groupId={group.id as number} archived={!!group.archived} userIsOwner={userIsOwner} user={user} />,
    };
};

interface GroupEmailModalProps {
    users?: number[];
}
const CurrentGroupEmailModal = ({users}: GroupEmailModalProps) => {
    const { t } = useTranslation()
    return <Col>
        <Row>
            {t('anAdminUserCanUseTheUserIdsBelowToEmailTheseUsers', 'An admin user can use the user IDs below to email these users:')}
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
    title: i18next.t('emailUsers2', 'Email Users'),
    body: <CurrentGroupEmailModal users={users} />
});

interface GroupCreateModalProps {
    user: RegisteredUserDTO
}

const GroupCreateModal = ({user}: GroupCreateModalProps) => {
    const { t } = useTranslation()
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
                   {t('enterYourGroupName', 'Enter your group name')}
                </Label>
                {isAda && <p className="d-block input-description mb-2">{t('studentsWillSeeThisGroupNameWhenTheyAreInvitedToJoin', 'Students will see this group name when they are invited to join.')}</p>}
                <Input invalid={submissionAttempted && !validateGroupName()} id={"group-name-input"} onChange={event => setNewGroupName(event.target.value)} data-testid={"group-name-input"} />
                <FormFeedback id="givenNameValidationMessage">
                    {t('pleaseEnterAValidName', 'Please enter a valid name.')}
                </FormFeedback>
            </FormGroup>
            <Button block type={"submit"} className={"mt-4"}>
                {t('createGroup', 'Create group')}
            </Button>
        </Form>
    </>;
};

export const groupCreateModal = (user: RegisteredUserDTO): ActiveModalProps => ({
    closeAction: () => store.dispatch(closeActiveModal()),
    title: i18next.t('createAGroup', 'Create a group'),
    body: <GroupCreateModal user={user}/>,
    size: "md",
    centered: true
});

const GroupArchiveModal = ({group, toggleArchived}: {group: AppGroup; toggleArchived: () => void;}) => {
    const { t } = useTranslation()
    const dispatch = useAppDispatch();

    return <div className="d-flex flex-column gap-3">
        <p>{t('areYouSureYouWantToArchiveQuotgroupnamequotYouWillNoLongerBeAbleToSetAssignmentsOrTestsToThisGroupAndTheGroupWillNotBeVisible', 'Are you sure you want to archive &quot;{{groupName}}&quot;? You will no longer be able to set assignments or tests to this group, and the group will not be visible', { groupName: group.groupName })}{siteSpecific(<><Trans i18nKey="onTheStrongassignmentProgressstrongOrStrongassignmentSchedulestrongPages">on the <strong>Assignment progress</strong> or <strong>Assignment schedule</strong> pages.</Trans></>, <>{t('inTheMarkbook', 'in the Markbook.')}</>)}</p>
        <p>{t('aGroupCanBeUnarchivedAtAnyTimeByNavigatingToTheGroupInTheQuotarchivedquotSectionOfThisPageAndClickingQuotunarchiveGroupquot', 'A group can be unarchived at any time by navigating to the group in the &quot;Archived&quot; section of this page and clicking &quot;Unarchive group&quot;.')}</p>
        <div className="text-end">
            <Button color="keyline" className="me-2" onClick={() => dispatch(closeActiveModal())}>
                {t('cancel', 'Cancel')}
            </Button>
            <Button color="solid" onClick={() => {
                toggleArchived();
                dispatch(closeActiveModal());
            }}>
                {t('archive', 'Archive')}
            </Button>
        </div>
    </div>;
};

export const groupArchiveModal = (group: AppGroup, toggleArchived: () => void): ActiveModalProps => ({
    closeAction: () => store.dispatch(closeActiveModal()),
    title: i18next.t('archiveGroup', 'Archive group'),
    body: <GroupArchiveModal group={group} toggleArchived={toggleArchived} />,
    size: "md",
    centered: true
});
