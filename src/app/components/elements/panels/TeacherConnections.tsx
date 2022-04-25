import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import * as RS from "reactstrap";
import {PotentialUser} from "../../../../IsaacAppTypes";
import {
    authenticateWithTokenAfterPrompt,
    changeMyMembershipStatus,
    getActiveAuthorisations,
    getGroupMemberships,
    getStudentAuthorisations,
    releaseAllAuthorisationsAfterPrompt,
    releaseAuthorisationAfterPrompt,
    revokeAuthorisationAfterPrompt
} from "../../../state/actions";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../../../state/reducers";
import classnames from "classnames";
import {MEMBERSHIP_STATUS} from "../../../services/constants";
import {extractTeacherName, isLoggedIn, isStudent} from "../../../services/user";
import {AdminUserGetState} from "../../../state/reducers/adminState";


interface TeacherConnectionsProps {
    user: PotentialUser;
    authToken: string | null;
    editingOtherUser: boolean;
    userToEdit: AdminUserGetState;
}
export const TeacherConnections = ({user, authToken, editingOtherUser, userToEdit}: TeacherConnectionsProps) => {
    const dispatch = useDispatch();
    const activeAuthorisations = useSelector((state: AppState) => state?.activeAuthorisations || null);
    const studentAuthorisations = useSelector((state: AppState) => state?.otherUserAuthorisations || null);
    const groupMemberships = useSelector((state: AppState) => state?.groupMemberships || null);

    useEffect(() => {
        if (user.loggedIn && user.id) {
            dispatch(getActiveAuthorisations((editingOtherUser && userToEdit?.id) || undefined));
            dispatch(getStudentAuthorisations((editingOtherUser && userToEdit?.id) || undefined));
            dispatch(getGroupMemberships((editingOtherUser && userToEdit?.id) || undefined));
        }
    }, [dispatch, editingOtherUser, userToEdit?.id]);

    useEffect(() => {
        if (authToken && user.loggedIn && user.id) {
            dispatch(authenticateWithTokenAfterPrompt(user.id, authToken));
        }
    }, [dispatch, authToken]);

    const [authenticationToken, setAuthenticationToken] = useState<string | null>(authToken);

    function processToken(event: React.FormEvent<HTMLFormElement | HTMLButtonElement>) {
        if (event) {event.preventDefault(); event.stopPropagation();}
        if (user.loggedIn && user.id) {
            dispatch(authenticateWithTokenAfterPrompt(user.id, authenticationToken));
        }
    }

    return <RS.CardBody>
        <RS.Container>
            <h3>
                <span>Teacher connections<span id="teacher-connections-title" className="icon-help" /></span>
                <RS.UncontrolledTooltip placement="bottom" target="teacher-connections-title">
                    The teachers that you are connected to can view your Isaac assignment progress.
                </RS.UncontrolledTooltip>
            </h3>

            <RS.Row>
                <RS.Col lg={7}>
                    <p>Enter the code given by your teacher to create a teacher connection and join a group.</p>
                    {/* TODO Need to handle nested form complaint */}
                    <RS.Form onSubmit={processToken}>
                        <RS.InputGroup>
                            <RS.Input
                                type="text" placeholder="Enter your code in here" value={authToken || undefined}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAuthenticationToken(e.target.value)}
                            />
                            <RS.InputGroupAddon addonType="append">
                                <RS.Button onClick={processToken} className="p-0 border-dark" color="secondary" disabled={editingOtherUser}>
                                    Connect
                                </RS.Button>
                            </RS.InputGroupAddon>
                        </RS.InputGroup>
                    </RS.Form>
                </RS.Col>

                <RS.Col lg={5} className="mt-4 mt-lg-0">
                    <div className="connect-list">
                        <h3><span className="icon-person-active" />Teacher connections</h3>
                        <div className="connect-list-inner">
                            <ul className="teachers-connected list-unstyled">
                                {activeAuthorisations && activeAuthorisations.map((teacherAuthorisation) =>
                                    <React.Fragment key={teacherAuthorisation.id}>
                                        <li>
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
                                                color="link" className="revoke-teacher"
                                                disabled={editingOtherUser}
                                                onClick={() => user.loggedIn && user.id && dispatch(revokeAuthorisationAfterPrompt(user.id, teacherAuthorisation))}
                                            >
                                                Revoke
                                            </RS.Button>
                                        </li>
                                    </React.Fragment>
                                )}
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
                                These are the students who have shared their Isaac data with you.
                                These students are also able to view your name and email address on their Teacher connections page.
                            </RS.UncontrolledTooltip>
                        </h3>
                        <p>
                            You can invite students to share their Isaac data with you through the {" "}
                            <Link to="/groups">group management page</Link>.
                        </p>
                    </RS.Col>
                    <RS.Col lg={5}>
                        <div className="connect-list">
                            <h3><span className="icon-person-active" /> Student connections </h3>

                            <div className="connect-list-inner">
                                <ul className="teachers-connected list-unstyled">
                                    {studentAuthorisations && studentAuthorisations.map(student => (
                                        <li key={student.id}>
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
                                                color="link" className="revoke-teacher" disabled={editingOtherUser}
                                                onClick={() => user.loggedIn && user.id && dispatch(releaseAuthorisationAfterPrompt(user.id, student))}
                                            >
                                                Remove
                                            </RS.Button>
                                        </li>
                                    ))}
                                </ul>

                                {studentAuthorisations && studentAuthorisations.length === 0 && <p className="teachers-connected">
                                    You have no active student connections.
                                </p>}
                            </div>
                            {studentAuthorisations && studentAuthorisations.length > 0 && <p className="remove-link">
                                <RS.Button color="link" onClick={() => user.loggedIn && user.id && dispatch(releaseAllAuthorisationsAfterPrompt(user.id))} disabled={editingOtherUser}>
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
                            Groups on Isaac let teachers set assignments to multiple students in one go.
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
                                {groupMemberships && groupMemberships.map((membership) => (<tr key={membership.group.id}>
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
                                        {membership.membershipStatus == MEMBERSHIP_STATUS.ACTIVE && <React.Fragment>
                                            <RS.Button color="link" disabled={editingOtherUser} onClick={() =>
                                                dispatch(changeMyMembershipStatus(membership.group.id as number, MEMBERSHIP_STATUS.INACTIVE))
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
                                                dispatch(changeMyMembershipStatus(membership.group.id as number, MEMBERSHIP_STATUS.ACTIVE))
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
                                </tr>))}
                            </tbody>
                        </RS.Table>
                    </div>
                    {groupMemberships && groupMemberships.length === 0 && <p className="teachers-connected text-center">
                        You are not a member of any groups.
                    </p>}
                </RS.Col>
            </RS.Row>
        </RS.Container>
    </RS.CardBody>
};
