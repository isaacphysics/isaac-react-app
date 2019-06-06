import React, {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import * as RS from "reactstrap";
import {LoggedInUser} from "../../../IsaacAppTypes";
import {
    getActiveAuthorisations,
    getGroupMembership,
    processAuthenticationToken,
    processRevocation
} from "../../state/actions";
import {connect} from "react-redux";
import {ActiveAuthorisationsState, AppState} from "../../state/reducers";
import {extractTeacherName} from "../../services/role";
import {UserSummaryWithEmailAddressDTO} from "../../../IsaacApiTypes";

const stateToProps = (state: AppState) => ({
    activeAuthorisations: state ? state.activeAuthorisations : null
});
const dispatchToProps = {getActiveAuthorisations, getGroupMembership, processAuthenticationToken, processRevocation};

interface TeacherConnectionsProps {
    user: LoggedInUser;
    getActiveAuthorisations: () => void;
    getGroupMembership: () => void;
    activeAuthorisations: ActiveAuthorisationsState;
    processAuthenticationToken: (token: string | null) => void;
    processRevocation: (user: UserSummaryWithEmailAddressDTO) => void;
}

const TeacherConnectionsComponent = (props: TeacherConnectionsProps) => {
    const {user, getActiveAuthorisations, getGroupMembership, activeAuthorisations, processAuthenticationToken, processRevocation} = props;

    useEffect(() => {getActiveAuthorisations()}, []);
    useEffect(() => {getGroupMembership()}, []);
    // useEffect(() => {getActiveStudentAuthorisations()}, []);

    const [authenticationToken, setAuthenticationToken] = useState<string | null>(null);

    function processToken(event: React.FormEvent<HTMLFormElement>) {
        if (event) {event.preventDefault();}
        processAuthenticationToken(authenticationToken);
    }

    return <RS.CardBody>
        <RS.Container ng-if="editingSelf">
            <h3>
                <span id="teacher-connections-title">Teacher Connections</span>
                {/* TODO Help Text Icon */}
                <RS.UncontrolledTooltip placement="bottom" target="teacher-connections-title">
                    The teachers that you are connected to can view your Isaac assignment progress.
                </RS.UncontrolledTooltip>
            </h3>

            <RS.Row>
                <RS.Col lg={8}>
                    <p>Enter the code given by your teacher to create a teacher connection and join a group.</p>
                    {/* TODO Need to handle nested form complaint */}
                    <RS.Form onSubmit={(e: React.FormEvent<HTMLFormElement>) => processToken(e)}>
                        <RS.InputGroup>
                            <RS.Input
                                type="text" placeholder="Enter your code in here"
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

                <RS.Col lg={4} className="connect-list">
                    <h3><span className="person-icon-active" /> Teacher connections</h3>
                    <div className="connect-list-inner">
                        <ul className="teachers-connected">
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
                                            onClick={() => processRevocation(teacherAuthorisation)}
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
                </RS.Col>
            </RS.Row>

            {user.loggedIn && user.role !== "STUDENT" && <React.Fragment>
                <hr />
                <RS.Row>
                    <RS.Col lg={8}>
                        <h3>
                            <span id="student-connections-title">Your Student Connections</span>
                            {/* TODO Help Text Icon */}
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
                    <RS.Col lg={4}>
                        <div className="connect-list">
                            <h3><span className="person-icon-active" /> Student connections </h3>

                            <div className="connect-list-inner">
                                <ul className="teachers-connected">
                                    {/*<li ng-repeat="studentUser in activeStudentAuthorisations"><span*/}
                                    {/*    className="person-icon-active"></span><span aria-haspopup="true" className="has-tip"*/}
                                    {/*                                                data-ot="You have access to this user's data and they can see your name and email address. To remove this access, click 'Revoke'.">{{*/}
                                    {/*    studentUser*/}
                                    {/*    .givenName*/}
                                    {/*}} {{studentUser.familyName}}</span><a className="revoke-teacher"*/}
                                    {/*                                       href="javascript:void(0)"*/}
                                    {/*                                       ng-click="releaseAuthorisation(studentUser)">Remove</a>*/}
                                    {/*</li>*/}
                                </ul>

                                {/*<p ng-if="activeStudentAuthorisations.length==0" className="teachers-connected">You have no active student connections.</p>*/}
                            </div>
                            {/*<div ng-if="activeStudentAuthorisations.length>0" className="remove-link">*/}
                            {/*    <p><a href="javascript:void(0)" ng-click="releaseAllAuthorisations()">Remove all</a></p>*/}
                        </div>
                    </RS.Col>
                </RS.Row>
            </React.Fragment>}

            <hr />

            <RS.Row>
                <RS.Col>
                    <h3>
                        <span id="group-memberships-title">Your Group Memberships</span>
                        {/* TODO Help Text Icon */}
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
                    {/*<div ng-show="myGroupMembership.length > 0" className="my-groups-table-section">*/}
                    {/*    <table className="">*/}
                    {/*        <tr>*/}
                    {/*            <th>Group Name</th>*/}
                    {/*            <th>Teachers</th>*/}
                    {/*            <th>Membership Status</th>*/}
                    {/*            <th>Actions</th>*/}
                    {/*        </tr>*/}
                    {/*    </table>*/}
                    {/*    <div className="my-groups-table-row-container">*/}
                    {/*        <table>*/}
                    {/*            <tr ng-repeat="entry in myGroupMembership | orderBy:'group.groupName'">*/}
                    {/*                <td>{{*/}
                    {/*                    entry*/}
                    {/*                    .group.groupName == null ? ("Group " + entry.group.id) : entry.group.groupName*/}
                    {/*                }}</td>*/}
                    {/*                <td>*/}
                    {/*                    <ul ng-show="entry.group.ownerSummary">*/}
                    {/*                        <li><span>{{convertToTeacherName(entry.group.ownerSummary)}}</span></li>*/}
                    {/*                        <li ng-repeat="manager in entry.group.additionalManagers">*/}
                    {/*                            {{convertToTeacherName(manager)}}</li>*/}
                    {/*                    </ul>*/}
                    {/*                </td>*/}
                    {/*                <td ng-class="{ru_red:entry.membershipStatus == 'INACTIVE'}"*/}
                    {/*                    className="centered-table-column">{{entry.membershipStatus}}</td>*/}

                    {/*                <td className="centered-table-column">*/}
                    {/*                    <a ng-click="changeMyMembershipStatus(entry.group.id, 'INACTIVE')"*/}
                    {/*                       ng-if="entry.membershipStatus == 'ACTIVE'" href="javascript:void(0)">Leave*/}
                    {/*                        Group</a>*/}
                    {/*                    <span ng-if="entry.membershipStatus == 'ACTIVE'" aria-haspopup="true"*/}
                    {/*                          className="icon-help has-tip"*/}
                    {/*                          data-ot="If you leave a group you will no longer receive notifications of new assignments."></span>*/}

                    {/*                    <a ng-click="changeMyMembershipStatus(entry.group.id, 'ACTIVE')"*/}
                    {/*                       ng-if="entry.membershipStatus == 'INACTIVE'" href="javascript:void(0)">Rejoin*/}
                    {/*                        Group</a>*/}
                    {/*                    <span ng-if="entry.membershipStatus == 'INACTIVE'" aria-haspopup="true"*/}
                    {/*                          className="icon-help has-tip"*/}
                    {/*                          data-ot="If you rejoin a group you will see all the assignments set since the group was created."></span>*/}
                    {/*                </td>*/}
                    {/*            </tr>*/}
                    {/*        </table>*/}
                    {/*    </div>*/}
                    {/*</div>*/}
                    {/*<p ng-hide="myGroupMembership.length > 0" className="teachers-connected text-center">You are not a*/}
                    {/*    member of any groups.</p>*/}
                </RS.Col>
            </RS.Row>
        </RS.Container>
    </RS.CardBody>
};

export const TeacherConnectionsPanel = connect(stateToProps, dispatchToProps)(TeacherConnectionsComponent);
