import React, {useEffect, useRef, useState} from "react";
import {Link} from "react-router-dom";
import * as RS from "reactstrap";
import {PotentialUser} from "../../../../IsaacAppTypes";
import {
    openActiveModal,
    showErrorToast,
    useAppDispatch,
    useChangeMyMembershipStatusMutation,
    useGetActiveAuthorisationsQuery,
    useGetGroupMembershipsQuery, useGetOtherUserAuthorisationsQuery,
    useLazyGetTokenOwnerQuery
} from "../../../state";
import classnames from "classnames";
import {
    extractTeacherName,
    isAda,
    isLoggedIn,
    isPhy,
    isStudent,
    isTutorOrAbove,
    matchesNameSubstring,
    MEMBERSHIP_STATUS,
    siteSpecific,
    useDeviceSize
} from "../../../services";
import classNames from "classnames";
import {PageFragment} from "../PageFragment";
import {RenderNothing} from "../RenderNothing";
import {skipToken} from "@reduxjs/toolkit/query";
import {RegisteredUserDTO} from "../../../../IsaacApiTypes";
import {
    releaseAllConfirmationModal,
    releaseConfirmationModal,
    revocationConfirmationModal,
    tokenVerificationModal
} from "../modals/TeacherConnectionModalCreators";
import { FixedSizeList } from "react-window";
import { Spacer } from "../Spacer";

const CONNECTIONS_ROW_HEIGHT = 40;
const CONNECTIONS_MAX_VISIBLE_ROWS = 10;

interface TeacherConnectionsProps {
    user: PotentialUser;
    authToken: string | null;
    editingOtherUser: boolean;
    userToEdit: RegisteredUserDTO;
}
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
    const [enableTeacherSearch, setEnableTeacherSearch] = useState<boolean>(false);
    const [enableStudentSearch, setEnableStudentSearch] = useState<boolean>(false);

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

    const deviceSize = useDeviceSize();

    const [getTokenOwner] = useLazyGetTokenOwnerQuery();
    const authenticateWithTokenAfterPrompt = async (userId: number, token: string | null) => {
        // Some users paste the URL in the token box, so remove the token from the end if they do.
        // Tokens so far are also always uppercase; this is hardcoded in the API, so safe to assume here:
        const sanitisedToken = token?.split("?authToken=").at(-1)?.toUpperCase().replace(/ /g,'');
        if (!sanitisedToken) {
            dispatch(showErrorToast("No group code provided", "You have to enter a group code!"));
            return;
        }
        const {data: usersToGrantAccess} = await getTokenOwner(sanitisedToken);
        if (usersToGrantAccess && usersToGrantAccess.length) {
            // TODO use whether the token owner is a tutor or not to display to the student a warning about sharing
            //      their data
            // TODO highlight teachers who have already been granted access? (see verification modal code)
            dispatch(openActiveModal(tokenVerificationModal(userId, sanitisedToken, usersToGrantAccess)) as any);
        }
    }

    useEffect(() => {
        if (authToken && user.loggedIn && user.id) {
            authenticateWithTokenAfterPrompt(user.id, authToken);
        }
    }, [authToken]);

    const [authenticationToken, setAuthenticationToken] = useState<string | null>(authToken);

    function processToken(event: React.FormEvent<HTMLFormElement | HTMLButtonElement>) {
        if (event) {event.preventDefault(); event.stopPropagation();}
        if (user.loggedIn && user.id) {
            authenticateWithTokenAfterPrompt(user.id, authenticationToken);
        }
    }

    return <RS.CardBody>
        <RS.Container>
            <PageFragment fragmentId={`teacher_connections_help_${isTutorOrAbove(user) ? "teacher" : "student"}`} ifNotFound={RenderNothing} />
            <h3>
                <span>Teacher connections<span id="teacher-connections-title" className="icon-help" /></span>
                <RS.UncontrolledTooltip placement="bottom" target="teacher-connections-title">
                    The teachers that you are connected to can view your {siteSpecific("Isaac", "Ada")} assignment progress.
                </RS.UncontrolledTooltip>
            </h3>

            <RS.Row>
                <RS.Col lg={7}>
                    <p>Enter the code given by your teacher to create a teacher connection and join a group.</p>
                    {/* TODO Need to handle nested form complaint */}
                    <RS.Form onSubmit={processToken}>
                        <RS.InputGroup className={"separate-input-group"}>
                            <RS.Input
                                type="text" placeholder="Enter your code in here" value={authToken || undefined}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAuthenticationToken(e.target.value)}
                            />
                            <RS.InputGroupAddon addonType="append">
                                <RS.Button onClick={processToken} className={classNames("py-0", {"px-0 border-dark": isPhy})} color="secondary" disabled={editingOtherUser}>
                                    Connect
                                </RS.Button>
                            </RS.InputGroupAddon>
                        </RS.InputGroup>
                    </RS.Form>
                </RS.Col>

                <RS.Col lg={5} className="mt-4 mt-lg-0">
                    <div className="connect-list">
                        <div className="connect-list-header">
                            {["xl", "lg", "xs"].indexOf(deviceSize) !== -1 ? 
                                <>{enableTeacherSearch ? 
                                    <>
                                        <RS.Input type="text" autoFocus placeholder="Search teachers" className="connections-search" onChange={e => setTeacherSearchText(e.target.value)}/>
                                        <Spacer />
                                    </> : 
                                    <h4 className={classNames("d-flex", {"pl-0" : isAda})}>
                                        <span className={siteSpecific("icon-person-active", "icon-group-white")} />
                                        Teacher connections
                                    </h4>
                                }</>
                                :
                                <>
                                    <h4 className={classNames("d-flex", {"pl-0" : isAda})}>
                                        <span className={siteSpecific("icon-person-active", "icon-group-white")} />
                                        Teacher connections
                                    </h4>
                                    <Spacer />
                                    {enableTeacherSearch && <RS.Input type="text" autoFocus style={{width: "200px"}} placeholder="Search teachers" className="connections-search" onChange={e => setTeacherSearchText(e.target.value)}/>}
                                </>
                            }
                            {!enableTeacherSearch && <Spacer />}
                            <button className="search-toggler-icon" onClick={_ => setEnableTeacherSearch(c => !c)}/>
                        </div>
                        <div className="connect-list-inner">
                            <ul className={classNames("teachers-connected list-unstyled my-0", {"ml-3 mr-2": isPhy}, {"ml-1 mr-2": isAda})}>
                                <FixedSizeList height={CONNECTIONS_ROW_HEIGHT * (Math.min(CONNECTIONS_MAX_VISIBLE_ROWS, filteredActiveAuthorisations?.length ?? 0))} itemCount={filteredActiveAuthorisations?.length ?? 0} itemSize={CONNECTIONS_ROW_HEIGHT} width="100%" style={{scrollbarGutter: "stable"}}>
                                    {({index, style}) => {
                                        const teacherAuthorisation = filteredActiveAuthorisations?.[index];
                                        if (!teacherAuthorisation) {
                                            return null;
                                        }
                                        return <React.Fragment key={teacherAuthorisation.id}>
                                        <li style={style} className="py-2">
                                            <span className="icon-person-active" />
                                            <span id={`teacher-authorisation-${teacherAuthorisation.id}`}>
                                                {extractTeacherName(teacherAuthorisation)}
                                            </span>
                                            <RS.UncontrolledTooltip
                                                placement="bottom" target={`teacher-authorisation-${teacherAuthorisation.id}`}
                                                >
                                                This user ({teacherAuthorisation.email}) has access to your data.
                                                To remove this access, click &apos;Revoke&apos;.
                                            </RS.UncontrolledTooltip>
                                            <RS.Button
                                                color="link" className="revoke-teacher pr-1"
                                                disabled={editingOtherUser}
                                                onClick={() => user.loggedIn && user.id && dispatch(openActiveModal(revocationConfirmationModal(user.id, teacherAuthorisation)))}
                                                >
                                                Revoke
                                            </RS.Button>
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
                </RS.Col>
            </RS.Row>

            {isLoggedIn(user) && !isStudent(user) && <React.Fragment>
                <hr className="my-5" />
                <RS.Row>
                    <RS.Col lg={7}>
                        <h3>
                            <span>Your student connections<span id="student-connections-title" className="icon-help" /></span>
                            <RS.UncontrolledTooltip placement="bottom" target="student-connections-title">
                                These are the students who have shared their {siteSpecific("Isaac", "Ada")} data with you.
                                These students are also able to view your name and email address on their Teacher connections page.
                            </RS.UncontrolledTooltip>
                        </h3>
                        <p>
                            You can invite students to share their {siteSpecific("Isaac", "Ada")} data with you through the {" "}
                            <Link to="/groups">{siteSpecific("group management page", "Manage groups")}</Link>{siteSpecific(".", " page.")}
                        </p>
                    </RS.Col>
                    <RS.Col lg={5}>
                        <div className="connect-list">
                        <div className="connect-list-header">
                            {["xl", "lg", "xs"].indexOf(deviceSize) !== -1 ? 
                                <>{enableStudentSearch ? 
                                    <>
                                        <RS.Input autoFocus type="text" placeholder="Search students" className="connections-search" onChange={e => setStudentSearchText(e.target.value)}/>
                                        <Spacer />
                                    </> :                                     
                                    <h4 className={classNames("d-flex", {"pl-0" : isAda})}>
                                        <span className={siteSpecific("icon-person-active", "icon-group-white")} />
                                        Student connections
                                    </h4>
                                }</>
                                :
                                <>
                                    <h4 className={classNames("d-flex", {"pl-0" : isAda})}>
                                        <span className={siteSpecific("icon-person-active", "icon-group-white")} />
                                        Student connections
                                    </h4>
                                    <Spacer />
                                    {enableStudentSearch && <RS.Input autoFocus type="text" style={{width: "200px"}} placeholder="Search students" className="connections-search" onChange={e => setStudentSearchText(e.target.value)}/>}
                                </>
                            }
                            {!enableStudentSearch && <Spacer />}
                            <button className="search-toggler-icon" onClick={_ => setEnableStudentSearch(c => !c)}/>
                        </div>

                            <div className="connect-list-inner">
                                <ul className={classNames("teachers-connected list-unstyled my-0", {"ml-3 mr-2": isPhy}, {"ml-1 mr-2": isAda})}>
                                    <FixedSizeList height={CONNECTIONS_ROW_HEIGHT * (Math.min(CONNECTIONS_MAX_VISIBLE_ROWS, filteredStudentAuthorisations?.length ?? 0))} itemCount={filteredStudentAuthorisations?.length ?? 0} itemSize={CONNECTIONS_ROW_HEIGHT} width="100%" style={{scrollbarGutter: "stable"}}>
                                        {({index, style}) => {
                                            const student = filteredStudentAuthorisations?.[index];
                                            if (!student) {
                                                return null;
                                            }
                                            return <li key={student.id} style={style} className="py-2">
                                                <span className="icon-person-active" />
                                                <span id={`student-authorisation-${student.id}`}>
                                                    {student.givenName} {student.familyName}
                                                </span>
                                                <RS.UncontrolledTooltip
                                                    placement="bottom" target={`student-authorisation-${student.id}`}
                                                >
                                                    You have access to this user&apos;s data and they can see your name and email address.
                                                    To remove this access, click &apos;Remove&apos;.
                                                </RS.UncontrolledTooltip>
                                                <RS.Button
                                                    color="link" className="revoke-teacher pr-1" disabled={editingOtherUser}
                                                    onClick={() => user.loggedIn && user.id && dispatch(openActiveModal(releaseConfirmationModal(user.id, student)))}
                                                >
                                                    Remove
                                                </RS.Button>
                                            </li>;
                                        }}
                                    </FixedSizeList>
                                </ul>

                                {studentAuthorisations && studentAuthorisations.length === 0 && <p className="teachers-connected">
                                    You have no active student connections.
                                </p>}
                            </div>
                            {studentAuthorisations && studentAuthorisations.length > 0 && <p className="remove-link">
                                <RS.Button color="link" onClick={() => dispatch(openActiveModal(releaseAllConfirmationModal()))} disabled={editingOtherUser}>
                                    Remove all
                                </RS.Button>
                            </p>}
                        </div>
                    </RS.Col>
                </RS.Row>
            </React.Fragment>}
            <hr className="my-5" />

            <RS.Row>
                <RS.Col>
                    <h3>
                        <span>
                            Your group memberships
                            <span id="group-memberships-title" className="icon-help" />
                        </span>
                        <RS.UncontrolledTooltip placement="bottom" target="group-memberships-title">
                            These are the groups you are currently a member of.
                            Groups on {siteSpecific("Isaac", "Ada")} let teachers set assignments to multiple students in one go.
                        </RS.UncontrolledTooltip>
                    </h3>
                    <p>
                        You can manage who is able to set you assignments by temporarily leaving a group. While you are
                        inactive in a group you won&apos;t receive any assignments from that group. If you want to
                        permanently leave a group, ask your teacher to remove you.
                    </p>
                    <div className="my-groups-table-section overflow-auto">
                        <RS.Table borderless>
                            <thead>
                                <tr>
                                    <th className="align-middle">Group name</th>
                                    <th className="align-middle">Teachers</th>
                                    <th className="align-middle">Membership status</th>
                                    <th className="align-middle">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {groupMemberships && groupMemberships.map((membership) => <tr key={membership.group.id}>
                                    <td>
                                        {membership.group.groupName || "Group " + membership.group.id}
                                    </td>
                                    <td>
                                        {membership.group.ownerSummary && <ul className="list-unstyled">
                                            <li>{extractTeacherName(membership.group.ownerSummary)}</li>
                                            {membership.group.additionalManagers && membership.group.additionalManagers.map(manager => (
                                                <li key={manager.id}>{extractTeacherName(manager)}</li>
                                            ))}
                                        </ul>}
                                    </td>
                                    <td className={classnames({danger: membership.membershipStatus === MEMBERSHIP_STATUS.INACTIVE})}>
                                        {membership.membershipStatus}
                                    </td>
                                    <td>
                                        {membership.membershipStatus === MEMBERSHIP_STATUS.ACTIVE && <React.Fragment>
                                            <RS.Button color="link" disabled={editingOtherUser} onClick={() =>
                                                changeMyMembershipStatus({groupId: membership.group.id as number, newStatus: MEMBERSHIP_STATUS.INACTIVE})
                                            }>
                                                Leave group
                                            </RS.Button>
                                            <span id={`leave-group-action-${membership.group.id}`} className="icon-help" />
                                            <RS.UncontrolledTooltip placement="bottom" target={`leave-group-action-${membership.group.id}`}
                                                                    modifiers={{preventOverflow: {boundariesElement: "viewport"}}}>
                                                If you leave a group you will no longer receive notifications of new assignments.
                                            </RS.UncontrolledTooltip>
                                        </React.Fragment>}

                                        {membership.membershipStatus === MEMBERSHIP_STATUS.INACTIVE && <React.Fragment>
                                            <RS.Button color="link" disabled={editingOtherUser} onClick={() =>
                                                changeMyMembershipStatus({groupId: membership.group.id as number, newStatus: MEMBERSHIP_STATUS.ACTIVE})
                                            }>
                                                Rejoin group
                                            </RS.Button>
                                            <span id={`rejoin-group-action-${membership.group.id}`} className="icon-help" />
                                            <RS.UncontrolledTooltip placement="bottom" target={`rejoin-group-action-${membership.group.id}`}
                                                                    modifiers={{preventOverflow: {boundariesElement: "viewport"}}}>
                                                If you rejoin a group you will see all the assignments set since the group was created.
                                            </RS.UncontrolledTooltip>
                                        </React.Fragment>}
                                    </td>
                                </tr>)}
                            </tbody>
                        </RS.Table>
                    </div>
                    {groupMemberships && groupMemberships.length === 0 && <p className="teachers-connected text-center">
                        You are not a member of any groups.
                    </p>}
                </RS.Col>
            </RS.Row>
        </RS.Container>
    </RS.CardBody>;
};
