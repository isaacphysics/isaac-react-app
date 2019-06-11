import React, {useEffect, useMemo, useState} from "react";
import {Link} from "react-router-dom";
import * as RS from "reactstrap";
import {LoggedInUser} from "../../../IsaacAppTypes";
import {
    changeMyMembershipStatus,
    getActiveAuthorisations,
    getMyGroupMemberships,
    getStudentAuthorisations,
    authenticateWithTokenAfterPrompt,
    releaseAllAuthorisationsAfterPrompt,
    releaseAuthorisationAfterPrompt,
    revokeAuthorisationAfterPrompt
} from "../../state/actions";
import {connect} from "react-redux";
import {
    ActiveAuthorisationsState,
    AppState,
    GroupMembershipsState,
    OtherUserAuthorisationsState
} from "../../state/reducers";
import {extractTeacherName} from "../../services/role";
import {UserSummaryDTO, UserSummaryWithEmailAddressDTO} from "../../../IsaacApiTypes";
import classnames from "classnames";
import {MEMBERSHIP_STATUS} from "../../services/constants";

const stateToProps = (state: AppState) => ({
    activeAuthorisations: state ? state.activeAuthorisations : null,
    studentAuthorisations: state ? state.otherUserAuthorisations : null,
    groupMemberships: state ? state.groupMemberships : null,
});

const dispatchToProps = {
    getActiveAuthorisations, processAuthenticateWithToken: authenticateWithTokenAfterPrompt, processRevokeAuthorisation: revokeAuthorisationAfterPrompt,
    getStudentAuthorisations, processReleaseAuthorisation: releaseAuthorisationAfterPrompt, processReleaseAllAuthorisations: releaseAllAuthorisationsAfterPrompt,
    getGroupMemberships: getMyGroupMemberships, changeMyMembershipStatus
};

interface TeacherConnectionsProps {
    user: LoggedInUser;
    authToken: string | null;
    getActiveAuthorisations: () => void;
    getStudentAuthorisations: () => void;
    getGroupMemberships: () => void;
    activeAuthorisations: ActiveAuthorisationsState;
    studentAuthorisations: OtherUserAuthorisationsState;
    groupMemberships: GroupMembershipsState;
    processAuthenticateWithToken: (token: string | null) => void;
    processRevokeAuthorisation: (user: UserSummaryWithEmailAddressDTO) => void;
    processReleaseAuthorisation: (student: UserSummaryDTO) => void;
    processReleaseAllAuthorisations: () => void;
    changeMyMembershipStatus: (groupId: number, newStatus: MEMBERSHIP_STATUS) => void;
}

const TeacherConnectionsComponent = (props: TeacherConnectionsProps) => {
    const {
        // state
        user, authToken, activeAuthorisations, studentAuthorisations, groupMemberships,
        // authorisation actions
        getActiveAuthorisations, processAuthenticateWithToken, processRevokeAuthorisation,
        // student authorisation actions
        getStudentAuthorisations, processReleaseAuthorisation, processReleaseAllAuthorisations,
        // group membership actions
        getGroupMemberships, changeMyMembershipStatus,
    } = props;

    useEffect(() => {
        getActiveAuthorisations();
        getGroupMemberships();
        getStudentAuthorisations();
    }, []);

    useEffect(() => {
        if (authToken) {
            processAuthenticateWithToken(authToken);
        }
    }, [authToken]);

    const [authenticationToken, setAuthenticationToken] = useState<string | null>(authToken);

    function processToken(event: React.FormEvent<HTMLFormElement>) {
        if (event) {event.preventDefault();}
        processAuthenticateWithToken(authenticationToken);
    }

    return <RS.CardBody>
        <RS.Container ng-if="editingSelf">
            <h3>
                <span>Teacher Connections<span id="teacher-connections-title" className="icon-help" /></span>
                <RS.UncontrolledTooltip placement="bottom" target="teacher-connections-title">
                    The teachers that you are connected to can view your Isaac assignment progress.
                </RS.UncontrolledTooltip>
            </h3>

            <RS.Row>
                <RS.Col lg={7}>
                    <p>Enter the code given by your teacher to create a teacher connection and join a group.</p>
                    {/* TODO Need to handle nested form complaint */}
                    <RS.Form onSubmit={(e: React.FormEvent<HTMLFormElement>) => processToken(e)}>
                        <RS.InputGroup>
                            <RS.Input
                                type="text" placeholder="Enter your code in here" value={authToken || undefined}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAuthenticationToken(e.target.value)}
                            />
                            <RS.InputGroupAddon addonType="append">
                                <RS.Button onClick={processToken} className="p-0 border-dark" color="secondary">
                                    Connect
                                </RS.Button>
                            </RS.InputGroupAddon>
                        </RS.InputGroup>
                    </RS.Form>
                </RS.Col>

                <RS.Col lg={5} className="mt-4 mt-lg-0">
                    <div className="connect-list">
                        <h3><span className="person-icon-active" />Teacher connections</h3>
                        <div className="connect-list-inner">
                            <ul className="teachers-connected list-unstyled">
                                {activeAuthorisations && activeAuthorisations.map((teacherAuthorisation) =>
                                    <React.Fragment key={teacherAuthorisation.id}>
                                        <li>
                                            <span className="person-icon-active" />
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
                                                onClick={() => processRevokeAuthorisation(teacherAuthorisation)}
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

            {user.loggedIn && user.role !== "STUDENT" && <React.Fragment>
                <hr className="my-5" />
                <RS.Row>
                    <RS.Col lg={7}>
                        <h3>
                            <span>Your Student Connections<span id="student-connections-title" className="icon-help" /></span>
                            <RS.UncontrolledTooltip placement="bottom" target="student-connections-title">
                                These are the students who have shared their Isaac data with you.
                                These students are also able to view your name and email address on their Teacher Connections page.
                            </RS.UncontrolledTooltip>
                        </h3>
                        <p>
                            You can invite students to share their Isaac data with you through the {" "}
                            <Link to="/groups">group management page</Link>.
                        </p>
                    </RS.Col>
                    <RS.Col lg={5}>
                        <div className="connect-list">
                            <h3><span className="person-icon-active" /> Student connections </h3>

                            <div className="connect-list-inner">
                                <ul className="teachers-connected list-unstyled">
                                    {studentAuthorisations && studentAuthorisations.map(student => (
                                        <li key={student.id}>
                                            <span className="person-icon-active" />
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
                                                color="link" className="revoke-teacher"
                                                onClick={() => processReleaseAuthorisation(student)}
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
                                <RS.Button color="link" onClick={() => processReleaseAllAuthorisations()}>
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
                            Your Group Memberships
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
                                    <th className="align-middle">Group Name</th>
                                    <th className="align-middle">Teachers</th>
                                    <th className="align-middle">Membership Status</th>
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
                                            <RS.Button color="link" onClick={() =>
                                                changeMyMembershipStatus(membership.group.id as number, MEMBERSHIP_STATUS.INACTIVE)
                                            }>
                                                Leave Group
                                            </RS.Button>
                                            <span id="leave-group-action" className="icon-help" />
                                            <RS.UncontrolledTooltip placement="bottom" target="leave-group-action">
                                                If you leave a group you will no longer receive notifications of new assignments.
                                            </RS.UncontrolledTooltip>
                                        </React.Fragment>}

                                        {membership.membershipStatus === MEMBERSHIP_STATUS.INACTIVE && <React.Fragment>
                                            <RS.Button color="link" onClick={() =>
                                                changeMyMembershipStatus(membership.group.id as number, MEMBERSHIP_STATUS.ACTIVE)
                                            }>
                                                Rejoin Group
                                            </RS.Button>
                                            <span id="rejoin-group-action" className="icon-help" />
                                            <RS.UncontrolledTooltip placement="bottom" target="rejoin-group-action">
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

export const TeacherConnectionsPanel = connect(stateToProps, dispatchToProps)(TeacherConnectionsComponent);
