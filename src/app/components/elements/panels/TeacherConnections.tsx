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
        <button type="button" className={siteSpecific("d-flex bg-transparent px-4", "search-toggler-icon")} onClick={_ => setEnableSearch(c => !c)}>
            {isPhy && <i className="icon icon-search icon-color-white"/>}
        </button>
    </div>;
};

export const authenticateWithTokenAfterPrompt = async (userId: number, token: string | null, dispatch: AppDispatch, getTokenOwner: any) => {
    // Some users paste the URL in the token box, so remove the token from the end if they do.
    // Tokens so far are also always uppercase; this is hardcoded in the API, so safe to assume here:
    const sanitisedToken = token?.trim().split("?authToken=").at(-1)?.toUpperCase();
    if (!sanitisedToken) {
        dispatch(showErrorToast("No group code provided", "You have to enter a group code!"));
        return;
    }
    else if (!(sanitisedToken && sanitisedToken.length >= 6 && sanitisedToken.length <= 8 && /^[ABCDEFGHJKLMNPQRTUVWXYZ2346789]+$/.test(sanitisedToken))) {
        dispatch(showErrorToast("Invalid group code", "The group code you entered is not valid. Group codes are 6-8 characters in length and contain only letters and numbers."));
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
            <h3>Connect to your teacher</h3>
            <PageFragment fragmentId={isTutorOrAbove(user) ? "help_toptext_teacher_connections_teacher" : "help_toptext_teacher_connections_student"} ifNotFound={RenderNothing} />
        </>}
        rightColumn={<>
            <SectionHeading>
                <span>
                    Teacher connection code
                    <i id="teacher-connections-title" className={classNames("icon icon-info icon-inline-sm ms-2", siteSpecific("icon-color-grey", "icon-color-black"))} />
                </span>
                <UncontrolledTooltip placement="bottom" target="teacher-connections-title">
                    The teachers that you are connected to can view your {SITE_TITLE_SHORT} assignment progress.
                </UncontrolledTooltip>
            </SectionHeading>
            <p>Enter the code given by your teacher to create a teacher connection and join a group.</p>
            <div data-testid="teacher-connect-form">
                <InputGroup className={"separate-input-group mb-4 d-flex flex-row justify-content-center"}>
                    <Input
                        type="text" placeholder="Enter your code in here" value={authToken || undefined} className="py-4"
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAuthenticationToken(e.target.value)}
                        onKeyDown={(e) => {if (e.key === 'Enter') {
                            processToken(e);
                            e.preventDefault();
                        }}}
                    />
                    <Button onClick={processToken} className={classNames("py-2", {"px-3": isPhy})} color={siteSpecific("solid", "keyline")} disabled={editingOtherUser}>
                        Connect
                    </Button>
                </InputGroup>
            </div>

            <div className="connect-list" data-testid="teacher-connections">
                <ConnectionsHeader
                    title="Teacher connections" enableSearch={enableTeacherSearch} setEnableSearch={setEnableTeacherSearch}
                    setSearchText={setTeacherSearchText} placeholder="Search teachers"/>
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
                                        This user ({teacherAuthorisation.email}) has access to your data.
                                        To remove this access, click &apos;Revoke&apos;.
                                        </UncontrolledTooltip>
                                        <Button
                                            color="link" className="revoke-teacher pe-1"
                                            disabled={editingOtherUser}
                                            onClick={() => user.loggedIn && user.id && dispatch(openActiveModal(revocationConfirmationModal(user.id, teacherAuthorisation)))}
                                        >
                                        Revoke
                                        </Button>
                                    </li>
                                </React.Fragment>;
                            }}
                        </FixedSizeList>
                    </ul>
                    {activeAuthorisations && activeAuthorisations.length === 0 && <p className="teachers-connected">
                        You have no active teacher connections.
                    </p>}
                </div>
            </div>
            {isLoggedIn(user) && !isStudent(user) && <React.Fragment>
                {siteSpecific(<div className="section-divider-bold"/>, <hr className="my-4"/>)}
                <SectionHeading>
                    <span>Your student connections
                        <i id="student-connections-title" className={classNames("ms-2 icon icon-info icon-inline-sm", siteSpecific("icon-color-grey", "icon-color-black"))} />
                    </span>
                    <UncontrolledTooltip placement="bottom" target="student-connections-title">
                        These are the students who have shared their {SITE_TITLE_SHORT} data with you.
                        These students are also able to view your name and email address on their Teacher connections page.
                    </UncontrolledTooltip>
                </SectionHeading>
                <p>
                    You can invite students to share their {SITE_TITLE_SHORT} data with you through the {" "}
                    <Link to="/groups">{siteSpecific("group management page", "Manage groups")}</Link>{siteSpecific(".", " page.")}
                </p>
                <div className="connect-list">
                    <ConnectionsHeader
                        title="Student connections" enableSearch={enableStudentSearch} setEnableSearch={setEnableStudentSearch}
                        setSearchText={setStudentSearchText} placeholder="Search students"/>
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
                                            You have access to this user&apos;s data and they can see your name and email address.
                                            To remove this access, click &apos;Remove&apos;.
                                        </UncontrolledTooltip>
                                        <Button
                                            color="link" className="revoke-teacher pe-1" disabled={editingOtherUser}
                                            onClick={() => user.loggedIn && user.id && dispatch(openActiveModal(releaseConfirmationModal(user.id, student)))}
                                        >
                                            Remove
                                        </Button>
                                    </li>;
                                }}
                            </FixedSizeList>
                        </ul>

                        {studentAuthorisations && studentAuthorisations.length === 0 && <p className="teachers-connected">
                            You have no active student connections.
                        </p>}
                    </div>
                    {studentAuthorisations && studentAuthorisations.length > 0 && <p className="remove-link">
                        <Button color="link" onClick={() => dispatch(openActiveModal(releaseAllConfirmationModal()))} disabled={editingOtherUser}>
                            Remove all
                        </Button>
                    </p>}
                </div>
            </React.Fragment>}

            {siteSpecific(<div className="section-divider-bold"/>, <hr className="my-4"/>)}
            <h3>
                <span className={classNames({"h4": isPhy})}>
                    Your group memberships
                    <i id="group-memberships-title" className={classNames("ms-2 icon icon-info icon-inline-sm", siteSpecific("icon-color-grey", "icon-color-black"))} />
                </span>
                <UncontrolledTooltip placement="bottom" target="group-memberships-title">
                    These are the groups you are currently a member of.
                    Groups on {SITE_TITLE_SHORT} let teachers set assignments to multiple students in one go.
                </UncontrolledTooltip>
            </h3>
            <ul>
                <li>{`Active group memberships mean you ${siteSpecific("will receive assignments set to that group by teachers in it." ,"can receive assignments from the teachers in that group.")}`}</li>
                <li>{`Setting your membership inactive means you won’t receive any assignments ${siteSpecific("set to", "from the teachers in")} that group. You can set yourself as active again at any time.`}</li>
                <li>If you want to permanently leave a group, ask your teacher to remove you.</li>
            </ul>
            <div className="my-groups-table-section overflow-auto">
                <div className="connect-list mb-3">
                    <ConnectionsHeader
                        title="Group memberships" enableSearch={enableGroupSearch} setEnableSearch={setEnableGroupSearch}
                        setSearchText={setGroupSearchText} placeholder="Search groups"/>
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
                                                        <b>{(membership.group.groupName ?? "Group " + membership.group.id)}</b>
                                                    </span>
                                                    {inactiveInGroup && <span>&nbsp;{"("}<i>inactive</i>{")"}</span>}
                                                    {membership.group.selfRemoval && <img className={classNames("self-removal-group", {"ms-1": !inactiveInGroup})} src={siteSpecific("/assets/phy/icons/teacher_features_sprite.svg#groups", "/assets/cs/icons/group.svg")} alt=""/>}
                                                    <UncontrolledTooltip
                                                        placement="top" target={`group-membership-${index}`}
                                                    >
                                                        {membership.group.groupName ? membership.group.groupName : `Group ${membership.group.id}`}
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
                                                        Leave
                                                    </Button>
                                                    {isPhy && <>
                                                        <i id={`leave-group-action-${membership.group.id}`} className="ms-2 icon icon-info icon-inline-sm icon-color-grey" />
                                                        <UncontrolledTooltip placement="bottom" target={`leave-group-action-${membership.group.id}`}
                                                            modifiers={[preventOverflow]}
                                                        >
                                                            If you leave a group you will no longer receive notifications of new assignments.
                                                        </UncontrolledTooltip>
                                                    </>}
                                                </React.Fragment>}

                                                {membership.membershipStatus === MEMBERSHIP_STATUS.INACTIVE && <React.Fragment>
                                                    <Button className={classNames({"revoke-teacher pe-1 pt-2": isAda})} color="link" disabled={editingOtherUser} onClick={() =>
                                                        changeMyMembershipStatus({groupId: membership.group.id as number, newStatus: MEMBERSHIP_STATUS.ACTIVE})
                                                    }>
                                                        Rejoin
                                                    </Button>
                                                    {isPhy && <>
                                                        <i id={`rejoin-group-action-${membership.group.id}`} className="ms-2 icon icon-info icon-inline-sm icon-color-grey" />
                                                        <UncontrolledTooltip placement="bottom" target={`rejoin-group-action-${membership.group.id}`}
                                                            modifiers={[preventOverflow]}
                                                        >
                                                            If you rejoin a group you will see all the assignments set since the group was created.
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
                        You are not a member of any groups.
                    </p>}
                </div>
            </div>
        </>}
    />;
};
