import React, {useEffect} from "react";
import {connect} from "react-redux";
import * as RS from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {PageFragment} from "../elements/PageFragment";
import {AppState} from "../../state/reducers";
import {LoggedInUser} from "../../../IsaacAppTypes";
import {isTeacher} from "../../services/user";
import {Link} from "react-router-dom";
import {ActionCard} from "../elements/cards/ActionCard";
import {LinkCard} from "../elements/cards/LinkCard";
import {loadAssignmentsOwnedByMe, loadGroups} from "../../state/actions";

const stateToProps = (state: AppState) => {
    let numberOfGroupsCreated = 0;
    let numberOfAssignmentsSet = 0;
    if (state) {
        if (state.groups) {
            if (state.groups.active) {numberOfGroupsCreated += state.groups.active.length;}
            if (state.groups.archived) {numberOfGroupsCreated += state.groups.archived.length;}
        }
        if (state.assignmentsByMe) {
            numberOfAssignmentsSet = state.assignmentsByMe.length;
        }
    }
    return {user: (state && state.user) || null, numberOfAssignmentsSet, numberOfGroupsCreated}
};

const dispatchToProps = {loadAssignmentsOwnedByMe, loadGroups};

interface ForTeachersProps {
    user: LoggedInUser | null;
    loadAssignmentsOwnedByMe: () => void;
    numberOfAssignmentsSet: number;
    loadGroups: (b: boolean) => void;
    numberOfGroupsCreated: number;
}

const ForTeachersComponent = (props: ForTeachersProps) => {
    const {user, loadAssignmentsOwnedByMe, numberOfAssignmentsSet, loadGroups, numberOfGroupsCreated} = props;
    useEffect(() => {
        if (user && isTeacher(user)) {
            loadAssignmentsOwnedByMe();
            loadGroups(false);
        }
    }, [user, loadAssignmentsOwnedByMe, loadGroups]);

    const pageTitle = user && isTeacher(user) ? "My Isaac teaching" : "How we help teachers";

    const teacherUpgradeLink = <div className="text-center">
        <RS.Button size="lg" tag={Link} to="/pages/teacher_accounts" color="primary" outline>
            Register as a Teacher
        </RS.Button>
    </div>;
    const registrationButton = <div className="text-center">
        <RS.Button size="lg" tag={Link} to={"/register"} color="primary" outline>
            Sign up
        </RS.Button>
    </div>;

    return <RS.Container className="teachers-page">
        <RS.Row className="pb-4">
            <RS.Col>
                <TitleAndBreadcrumb currentPageTitle={pageTitle} breadcrumbTitleOverride="For teachers" />
            </RS.Col>
        </RS.Row>

        {!(user && isTeacher(user)) && <RS.Row>
            <RS.Col md={{size: 8, offset: 2}} className="pt-4 pb-5 mb-5">
                <PageFragment fragmentId="for_teachers_logged_out" />
                {(user && user.loggedIn) ?
                    !isTeacher(user) && teacherUpgradeLink :
                    registrationButton
                }
            </RS.Col>
        </RS.Row>}

        {isTeacher(user) && <RS.Row>
            <RS.Col>
                <h2 className="h-secondary h-m">Pick up where you left off</h2>
                <div>
                    <RS.Row>
                        <RS.ListGroup className="my-3 d-block d-md-flex flex-row flex-wrap align-items-stretch link-list bg-transparent">
                            <RS.ListGroupItem className="px-3 pt-0 pb-4 bg-transparent">
                                <ActionCard
                                    title="Create a group" linkDestination="/groups" linkText="Manage groups"
                                    amountText={<>
                                        You have created <span>{numberOfGroupsCreated}</span> group{numberOfGroupsCreated !== 1 && "s"}.
                                    </>}
                                >
                                    Create and alter groups on the manage groups page.
                                </ActionCard>
                            </RS.ListGroupItem>

                            <RS.ListGroupItem className="px-3 pt-0 pb-4 bg-transparent">
                                <ActionCard
                                    title="Set an assignment" linkDestination="/set_assignments" linkText="Set assignments"
                                    amountText={<>
                                        You have set <span>{numberOfAssignmentsSet}</span> assignment{numberOfAssignmentsSet !== 1 && "s"}.
                                    </>}
                                >
                                    Set more assignments from the set assignments page.
                                </ActionCard>
                            </RS.ListGroupItem>

                            <RS.ListGroupItem className="px-3 pt-0 pb-4 bg-transparent">
                                <ActionCard
                                    title="Create a gameboard" comingSoon linkDestination="/assignments" linkText="Create gameboards"
                                    amountText={<>You have created <span>-999</span> gameboards.</>}
                                >
                                    Create custom gameboards to set as assignments to your groups.
                                </ActionCard>
                            </RS.ListGroupItem>
                        </RS.ListGroup>
                    </RS.Row>
                </div>

                <div className="pattern-06 pt-4 pb-5">
                    <RS.Row>
                        <RS.ListGroup className="mb-4 d-block d-md-flex flex-row align-items-stretch link-list bg-transparent">
                            <RS.ListGroupItem className="bg-transparent">
                                <LinkCard
                                    title="Group progress" imageSource="/assets/card03.svg"
                                    linkDestination="/assignment_progress" linkText="View assignment progress"
                                >
                                    Review your groups&apos; progress on the work which you have assigned to them.
                                </LinkCard>
                            </RS.ListGroupItem>

                            <RS.ListGroupItem className="bg-transparent">
                                <LinkCard
                                    title="CPD events" imageSource="/assets/card02.svg"
                                    linkDestination="/events" linkText="View our events"
                                >
                                    Receive guidance on how to use isaaccomputerscience.org by attending our professional development events.
                                </LinkCard>
                            </RS.ListGroupItem>

                            <RS.ListGroupItem className="bg-transparent">
                                <LinkCard
                                    title="Topics" imageSource="/assets/card01.svg"
                                    linkDestination="/topics" linkText="View all topics"
                                >
                                    Review the site&apos;s material arranged by topic.
                                </LinkCard>
                            </RS.ListGroupItem>
                        </RS.ListGroup>
                    </RS.Row>
                </div>
            </RS.Col>
        </RS.Row>}
    </RS.Container>;
};

export const ForTeachers = connect(stateToProps, dispatchToProps)(ForTeachersComponent);
