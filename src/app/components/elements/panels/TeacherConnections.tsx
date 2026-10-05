import React, {useEffect, useRef, useState} from "react";
import {Link} from "react-router-dom";
import {GroupMembershipDetailDTO, LoggedInUser, PotentialUser} from "../../../../IsaacAppTypes";
import {
    AppDispatch,
    openActiveModal,
    showErrorToast,
    useAppDispatch,
    useChangeMyMembershipStatusMutation,
    useGetActiveAuthorisationsQuery,
    useGetGroupMembershipsQuery,
    useGetOtherUserAuthorisationsQuery,
    useLazyGetTokenOwnerQuery
} from "../../../state";
import {
    extractTeacherName,
    isAda,
    isLoggedIn,
    isPhy,
    isStudent,
    isTutorOrAbove,
    matchesNameSubstring,
    MEMBERSHIP_STATUS,
    SITE_TITLE_SHORT,
    siteSpecific,
    useDeviceSize
} from "../../../services";
import classNames from "classnames";
import {PageFragment} from "../PageFragment";
import {RenderNothing} from "../RenderNothing";
import {skipToken} from "@reduxjs/toolkit/query";
import preventOverflow from '@popperjs/core/lib/modifiers/preventOverflow.js';
import {RegisteredUserDTO} from "../../../../IsaacApiTypes";
import {
    confirmSelfRemovalModal,
    releaseAllConfirmationModal,
    releaseConfirmationModal,
    revocationConfirmationModal,
    tokenVerificationModal
} from "../modals/TeacherConnectionModalCreators";
import {FixedSizeList} from "react-window";
import {Spacer} from "../Spacer";
import {MyAccountTab} from "./MyAccountTab";
import {Button, Col, Form, Input, InputGroup, UncontrolledTooltip} from "reactstrap";
import { Trans, useTranslation } from "react-i18next";
import i18next from "i18next";

const CONNECTIONS_ROW_HEIGHT = 40;
const CONNECTIONS_MAX_VISIBLE_ROWS = 10;
const MEMBERSHIPS_ROW_HEIGHT = 60;
const MEMBERSHIPS_MAX_VISIBLE_ROWS = 5;

interface TeacherConnectionsProps {
    user: PotentialUser;
    authToken: string | null;
    editingOtherUser: boolean;
    userToEdit: RegisteredUserDTO;
}

interface ConnectionsHeaderProps {
    enableSearch: boolean;
    setEnableSearch: React.Dispatch<React.SetStateAction<boolean>>;
    setSearchText: React.Dispatch<React.SetStateAction<string>>;
    title: string;
    placeholder: string;
}

const ConnectionsHeader = ({enableSearch, setEnableSearch, setSearchText, title, placeholder}: ConnectionsHeaderProps) => {
    const deviceSize = useDeviceSize();
    const searchInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (enableSearch && searchInputRef.current) {
            searchInputRef.current.focus();
        }
    }, [enableSearch]);

    return <div className="connect-list-header">
        {["xl", "lg", "xs"].includes(deviceSize) ?
            <>{enableSearch ?
                <>
                    <Input type="text" innerRef={searchInputRef} placeholder={placeholder} className="connections-search" onChange={e => setSearchText(e.target.value)}/>
                    <Spacer />
                </> :
                <h4 className={classNames("d-flex", {"ps-0" : isAda})}>
                    {isAda && <span className="icon-group-white mx-2" />}
                    {title}
                </h4>
            }</>
            :
            <>
                <h4 className={classNames("d-flex", {"ps-0" : isAda})}>
                    {isAda && <span className="icon-group-white mx-2" />}
                    {title}
                </h4>
                <Spacer />
                {enableSearch && <Input type="text" innerRef={searchInputRef} style={{width: "200px"}} placeholder={placeholder} className="connections-search" onChange={e => setSearchText(e.target.value)}/>}
            </>
        }
        {!enableSearch && <Spacer />}
        <button type="button" className="d-flex bg-transparent px-4" onClick={_ => setEnableSearch(c => !c)}>
            <i className={classNames("icon icon-search icon-color-white", {"icon-md me-n2": isAda})}/>
        </button>
    </div>;
};

export const authenticateWithTokenAfterPrompt = async (userId: number, token: string | null, dispatch: AppDispatch, getTokenOwner: any) => {
    // Some users paste the URL in the token box, so remove the token from the end if they do.
    // Tokens so far are also always uppercase; this is hardcoded in the API, so safe to assume here:
    const sanitisedToken = token?.trim().split("?authToken=").at(-1)?.toUpperCase();
    if (!sanitisedToken) {
        dispatch(showErrorToast(i18next.t("common:connections.connect.noCodeTitle"), i18next.t("common:connections.connect.noCodeMessage")));
        return;
    }
    else if (!(sanitisedToken && sanitisedToken.length >= 6 && sanitisedToken.length <= 8 && /^[ABCDEFGHJKLMNPQRTUVWXYZ2346789]+$/.test(sanitisedToken))) {
        dispatch(showErrorToast(i18next.t("common:connections.connect.invalidCodeTitle"), i18next.t("common:connections.connect.invalidCodeMessage")));
        return;
    }
    else {
        const {data: usersToGrantAccess} = await getTokenOwner(sanitisedToken);
        if (usersToGrantAccess && usersToGrantAccess.length) {
            // TODO use whether the token owner is a tutor or not to display to the student a warning about sharing
            //      their data
            // TODO highlight teachers who have already been granted access? (see verification modal code)
            dispatch(openActiveModal(tokenVerificationModal(userId, sanitisedToken, usersToGrantAccess)) as any);
        }
    }
};

export const TeacherConnections = ({user, authToken, editingOtherUser, userToEdit}: TeacherConnectionsProps) => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const groupQuery = (user.loggedIn && user.id) ? ((editingOtherUser && userToEdit?.id) || undefined) : skipToken;
    const {data: groupMemberships} = useGetGroupMembershipsQuery(groupQuery);
    const [changeMyMembershipStatus] = useChangeMyMembershipStatusMutation();
    const {data: activeAuthorisations} = useGetActiveAuthorisationsQuery((editingOtherUser && userToEdit?.id) || undefined);
    const {data: studentAuthorisations} = useGetOtherUserAuthorisationsQuery((editingOtherUser && userToEdit?.id) || undefined);
    let filteredActiveAuthorisations = activeAuthorisations;
    let filteredStudentAuthorisations = studentAuthorisations;

    const [teacherSearchText, setTeacherSearchText] = useState<string>("");
    const [studentSearchText, setStudentSearchText] = useState<string>("");
    const [groupSearchText, setGroupSearchText] = useState<string>("");
    const [enableTeacherSearch, setEnableTeacherSearch] = useState<boolean>(false);
    const [enableStudentSearch, setEnableStudentSearch] = useState<boolean>(false);
    const [enableGroupSearch, setEnableGroupSearch] = useState<boolean>(false);

    if (enableTeacherSearch && teacherSearchText) {
        filteredActiveAuthorisations = activeAuthorisations?.filter(teacher => {
            return matchesNameSubstring(teacher?.givenName, teacher?.familyName, teacherSearchText);
        });
    }

    if (enableStudentSearch && studentSearchText) {
        filteredStudentAuthorisations = studentAuthorisations?.filter(student => {
            return matchesNameSubstring(student?.givenName, student?.familyName, studentSearchText);
        });
    }

    const sortedGroupMemberships : GroupMembershipDetailDTO[] | undefined = groupMemberships?.slice().sort((a, b) => {
        return (a.membershipStatus === MEMBERSHIP_STATUS.INACTIVE ? 1 : 0) - (b.membershipStatus === MEMBERSHIP_STATUS.INACTIVE ? 1 : 0);
    }).filter(membership => {
        return (enableGroupSearch && groupSearchText) ? matchesNameSubstring(membership.group.groupName, undefined, groupSearchText) : true;
    });

    const [getTokenOwner] = useLazyGetTokenOwnerQuery();

    useEffect(() => {
        if (authToken && user.loggedIn && user.id) {
            authenticateWithTokenAfterPrompt(user.id, authToken, dispatch, getTokenOwner);
        }
    }, [authToken]);

    const [authenticationToken, setAuthenticationToken] = useState<string | null>(authToken);

    function processToken(event: React.FormEvent<HTMLFormElement | HTMLButtonElement | HTMLInputElement>) {
        if (event) {event.preventDefault(); event.stopPropagation();}
        if (user.loggedIn && user.id) {
            authenticateWithTokenAfterPrompt(user.id, authenticationToken, dispatch, getTokenOwner);
        }
    }

    const SectionHeading = siteSpecific("h4", "h3");

    return <MyAccountTab
        leftColumn={<>
            <h3>{t("common:connections.connect.title")}</h3>
            <PageFragment fragmentId={isTutorOrAbove(user) ? "help_toptext_teacher_connections_teacher" : "help_toptext_teacher_connections_student"} ifNotFound={RenderNothing} />
        </>}
        rightColumn={<>
            <SectionHeading>
                <span>
                    {t("common:connections.connect.codeHeading")}
                    <i id="teacher-connections-title" className={classNames("icon icon-info icon-inline-sm ms-2", siteSpecific("icon-color-grey", "icon-color-black"))} />
                </span>
                <UncontrolledTooltip placement="bottom" target="teacher-connections-title">
                    {t("common:connections.connect.codeTooltip", { siteTitle: SITE_TITLE_SHORT })}
                </UncontrolledTooltip>
            </SectionHeading>
            <p>{t("common:connections.connect.codeInstruction")}</p>
            <div data-testid="teacher-connect-form">
                <InputGroup className={"separate-input-group mb-4 d-flex flex-row justify-content-center"}>
                    <Input
                        type="text" placeholder={t("common:connections.connect.codePlaceholder")} value={authToken || undefined} className="py-4"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAuthenticationToken(e.target.value)}
                        onKeyDown={(e) => {if (e.key === 'Enter') {
                            processToken(e);
                            e.preventDefault();
                        }}}
                    />
                    <Button onClick={processToken} className={classNames("py-2", {"px-3": isPhy})} color={siteSpecific("solid", "keyline")} disabled={editingOtherUser}>
                        {t("common:button.connect")}
                    </Button>
                </InputGroup>
            </div>

            <div className="connect-list" data-testid="teacher-connections">
                <ConnectionsHeader
                    title={t("common:connections.teachers.heading")} enableSearch={enableTeacherSearch} setEnableSearch={setEnableTeacherSearch}
                    setSearchText={setTeacherSearchText} placeholder={t("common:connections.teachers.searchPlaceholder")}/>
                <div>
                    <ul className={classNames("teachers-connected list-unstyled my-0", {"ms-3 me-2": isPhy}, {"ms-1 me-2": isAda})}>
                        <FixedSizeList height={CONNECTIONS_ROW_HEIGHT * (Math.min(CONNECTIONS_MAX_VISIBLE_ROWS, filteredActiveAuthorisations?.length ?? 0))} itemCount={filteredActiveAuthorisations?.length ?? 0} itemSize={CONNECTIONS_ROW_HEIGHT} width="100%" style={{scrollbarGutter: "stable"}}>
                            {({index, style}) => {
                                const teacherAuthorisation = filteredActiveAuthorisations?.[index];
                                if (!teacherAuthorisation) {
                                    return null;
                                }
                                return <React.Fragment key={teacherAuthorisation.id}>
                                    <li style={style} className="py-2">
                                        <div className="d-inline-flex connections-fixed-length-container">
                                            {isAda && <span className="icon-person-active mx-2"/>}
                                            <span id={`teacher-authorisation-${teacherAuthorisation.id}`} className="connections-fixed-length-text">
                                                {extractTeacherName(teacherAuthorisation)}
                                            </span>
                                        </div>
                                        <UncontrolledTooltip
                                            placement="bottom" target={`teacher-authorisation-${teacherAuthorisation.id}`}
                                        >
                                        {t("common:connections.teachers.tooltip", { teacherEmail: teacherAuthorisation.email })}
                                        </UncontrolledTooltip>
                                        <Button
                                            color="link" className="revoke-teacher pe-1"
                                            disabled={editingOtherUser}
                                            onClick={() => user.loggedIn && user.id && dispatch(openActiveModal(revocationConfirmationModal(user.id, teacherAuthorisation)))}
                                        >
                                        {t("common:connections.teachers.revokeButton")}
                                        </Button>
                                    </li>
                                </React.Fragment>;
                            }}
                        </FixedSizeList>
                    </ul>
                    {activeAuthorisations && activeAuthorisations.length === 0 && <p className="teachers-connected">
                        {t("common:connections.teachers.emptyState")}
                    </p>}
                </div>
            </div>
            {isLoggedIn(user) && !isStudent(user) && <React.Fragment>
                {siteSpecific(<div className="section-divider-bold"/>, <hr className="my-4"/>)}
                <SectionHeading>
                    <span>{t("common:connections.students.heading")}
                        <i id="student-connections-title" className={classNames("ms-2 icon icon-info icon-inline-sm", siteSpecific("icon-color-grey", "icon-color-black"))} />
                    </span>
                    <UncontrolledTooltip placement="bottom" target="student-connections-title">
                        {t("common:connections.students.headingTooltip", { siteTitle: SITE_TITLE_SHORT })}
                    </UncontrolledTooltip>
                </SectionHeading>
                <p>
                    <Trans i18nKey="site:connections.students.inviteText" components={{ groupsLink: <Link to="/groups" /> }} values={{ siteTitle: SITE_TITLE_SHORT }} />
                </p>
                <div className="connect-list">
                    <ConnectionsHeader
                        title={t("common:connections.students.listTitle")} enableSearch={enableStudentSearch} setEnableSearch={setEnableStudentSearch}
                        setSearchText={setStudentSearchText} placeholder={t("common:connections.students.searchPlaceholder")}/>
                    <div>
                        <ul className={classNames("teachers-connected list-unstyled my-0", {"ms-3 me-2": isPhy}, {"ms-1 me-2": isAda})}>
                            <FixedSizeList height={CONNECTIONS_ROW_HEIGHT * (Math.min(CONNECTIONS_MAX_VISIBLE_ROWS, filteredStudentAuthorisations?.length ?? 0))} itemCount={filteredStudentAuthorisations?.length ?? 0} itemSize={CONNECTIONS_ROW_HEIGHT} width="100%" style={{scrollbarGutter: "stable"}}>
                                {({index, style}) => {
                                    const student = filteredStudentAuthorisations?.[index];
                                    if (!student) {
                                        return null;
                                    }
                                    return <li key={student.id} style={style} className="py-2">
                                        <div className="d-inline-flex connections-fixed-length-container">
                                            {isAda && <span className="icon-person-active mx-2"/>}
                                            <span id={`student-authorisation-${student.id}`} className="connections-fixed-length-text">
                                                {student.givenName} {student.familyName}
                                            </span>
                                        </div>
                                        <UncontrolledTooltip
                                            placement="bottom" target={`student-authorisation-${student.id}`}
                                        >
                                            {t("common:connections.students.studentTooltip")}
                                        </UncontrolledTooltip>
                                        <Button
                                            color="link" className="revoke-teacher pe-1" disabled={editingOtherUser}
                                            onClick={() => user.loggedIn && user.id && dispatch(openActiveModal(releaseConfirmationModal(user.id, student)))}
                                        >
                                            {t("common:button.remove")}
                                        </Button>
                                    </li>;
                                }}
                            </FixedSizeList>
                        </ul>

                        {studentAuthorisations && studentAuthorisations.length === 0 && <p className="teachers-connected">
                            {t("common:connections.students.emptyState")}
                        </p>}
                    </div>
                    {studentAuthorisations && studentAuthorisations.length > 0 && <p className="remove-link">
                        <Button color="link" onClick={() => dispatch(openActiveModal(releaseAllConfirmationModal()))} disabled={editingOtherUser}>
                            {t("common:connections.students.removeAllButton")}
                        </Button>
                    </p>}
                </div>
            </React.Fragment>}

            {siteSpecific(<div className="section-divider-bold"/>, <hr className="my-4"/>)}
            <h3>
                <span className={classNames({"h4": isPhy})}>
                    {t("common:connections.groups.heading")}
                    <i id="group-memberships-title" className={classNames("ms-2 icon icon-info icon-inline-sm", siteSpecific("icon-color-grey", "icon-color-black"))} />
                </span>
                <UncontrolledTooltip placement="bottom" target="group-memberships-title">
                    {t("common:connections.groups.headingTooltip", { siteTitle: SITE_TITLE_SHORT })}
                </UncontrolledTooltip>
            </h3>
            <ul>
                <li>{t("site:connections.groups.activeInfo")}</li>
                <li>{t("site:connections.groups.inactiveInfo")}</li>
                <li>{t("common:connections.groups.leaveInfo")}</li>
            </ul>
            <div className="my-groups-table-section overflow-auto">
                <div className="connect-list mb-3">
                    <ConnectionsHeader
                        title={t("common:connections.groups.listTitle")} enableSearch={enableGroupSearch} setEnableSearch={setEnableGroupSearch}
                        setSearchText={setGroupSearchText} placeholder={t("common:connections.groups.searchPlaceholder")}/>
                    <div>
                        <ul className="teachers-connected list-unstyled m-0">
                            {sortedGroupMemberships && <FixedSizeList height={MEMBERSHIPS_ROW_HEIGHT * (Math.min(MEMBERSHIPS_MAX_VISIBLE_ROWS, sortedGroupMemberships.length ?? 0))} itemCount={sortedGroupMemberships.length ?? 0} itemSize={MEMBERSHIPS_ROW_HEIGHT} width="100%" style={{scrollbarGutter: "stable"}}>
                                {({index, style}) => {
                                    const membership = sortedGroupMemberships[index];
                                    const inactiveInGroup = membership.membershipStatus === MEMBERSHIP_STATUS.INACTIVE;
                                    return <li key={index} style={style} className={classNames("p-2 ps-3", {"inactive-group" : isAda && inactiveInGroup})}>
                                        <div className="d-flex">
                                            <Col className="connections-fixed-length-container me-1">
                                                <div className="d-flex">
                                                    <span id={`group-membership-${index}`} className={classNames("connections-fixed-length-text", {"text-muted connection-inactive": inactiveInGroup})}>
                                                        <b>{(membership.group.groupName ?? t("common:connections.groups.fallbackName", { groupId: membership.group.id }))}</b>
                                                    </span>
                                                    {inactiveInGroup && <span>&nbsp;{"("}<i>{t("common:connections.groups.inactiveLabel")}</i>{")"}</span>}
                                                    {membership.group.selfRemoval && <img className={classNames("self-removal-group", {"ms-1": !inactiveInGroup})} src={siteSpecific("/assets/phy/icons/teacher_features_sprite.svg#groups", "/assets/cs/icons/group.svg")} alt=""/>}
                                                    <UncontrolledTooltip
                                                        placement="top" target={`group-membership-${index}`}
                                                    >
                                                        {membership.group.groupName ? membership.group.groupName : t("common:connections.groups.fallbackName", { groupId: membership.group.id })}
                                                    </UncontrolledTooltip>
                                                </div>
                                                <div className="d-flex">
                                                    {membership.group.ownerSummary && <span className="connections-fixed-length-text text-muted">
                                                        Teacher{membership.group.additionalManagers && membership.group.additionalManagers.length > 0 ? "s" : ""}: {
                                                            [membership.group.ownerSummary, ...membership.group.additionalManagers ?? []].map(extractTeacherName).join(", ")
                                                        }
                                                    </span>}
                                                </div>
                                            </Col>
                                            <Col className={classNames({"d-flex flex-col justify-content-end align-items-center flex-grow-0 pe-1": isPhy})}>
                                                {membership.membershipStatus === MEMBERSHIP_STATUS.ACTIVE && <React.Fragment>
                                                    <Button className={classNames({"revoke-teacher pe-1 pt-2": isAda})} color="link" disabled={editingOtherUser} onClick={() =>
                                                        membership.group.selfRemoval
                                                            ? dispatch(openActiveModal(confirmSelfRemovalModal((user as LoggedInUser).id as number, membership.group.id as number)))
                                                            : changeMyMembershipStatus({groupId: membership.group.id as number, newStatus: MEMBERSHIP_STATUS.INACTIVE})
                                                    }>
                                                        {t("common:connections.groups.leaveButton")}
                                                    </Button>
                                                    {isPhy && <>
                                                        <i id={`leave-group-action-${membership.group.id}`} className="ms-2 icon icon-info icon-inline-sm icon-color-grey" />
                                                        <UncontrolledTooltip placement="bottom" target={`leave-group-action-${membership.group.id}`}
                                                            modifiers={[preventOverflow]}
                                                        >
                                                            {t("sci:connections.groups.leaveTooltip")}
                                                        </UncontrolledTooltip>
                                                    </>}
                                                </React.Fragment>}

                                                {membership.membershipStatus === MEMBERSHIP_STATUS.INACTIVE && <React.Fragment>
                                                    <Button className={classNames({"revoke-teacher pe-1 pt-2": isAda})} color="link" disabled={editingOtherUser} onClick={() =>
                                                        changeMyMembershipStatus({groupId: membership.group.id as number, newStatus: MEMBERSHIP_STATUS.ACTIVE})
                                                    }>
                                                        {t("common:connections.groups.rejoinButton")}
                                                    </Button>
                                                    {isPhy && <>
                                                        <i id={`rejoin-group-action-${membership.group.id}`} className="ms-2 icon icon-info icon-inline-sm icon-color-grey" />
                                                        <UncontrolledTooltip placement="bottom" target={`rejoin-group-action-${membership.group.id}`}
                                                            modifiers={[preventOverflow]}
                                                        >
                                                            {t("sci:connections.groups.rejoinTooltip")}
                                                        </UncontrolledTooltip>
                                                    </>}
                                                </React.Fragment>}
                                            </Col>
                                        </div>
                                    </li>;
                                }}
                            </FixedSizeList>}
                        </ul>
                    </div>
                    {groupMemberships && groupMemberships.length === 0 && <p className="teachers-connected">
                        {t("common:connections.groups.emptyState")}
                    </p>}
                </div>
            </div>
        </>}
    />;
};
