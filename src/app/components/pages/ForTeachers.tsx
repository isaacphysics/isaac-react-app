import React from "react";
import {connect} from "react-redux";
import * as RS from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {PageFragment} from "../elements/PageFragment";
import {AppState} from "../../state/reducers";
import {LoggedInUser} from "../../../IsaacAppTypes";
import {isTeacher} from "../../services/user";
import {Link} from "react-router-dom";
import {ActionCard} from "../elements/ActionCard";
import {LinkCard} from "../elements/LinkCard";

const stateToProps = (state: AppState) => ({
    user: (state && state.user) || null
});

interface ForTeachersProps {
    user: LoggedInUser | null;
}

const ForTeachersComponent = ({user}: ForTeachersProps) => {

    const pageTitle = user && isTeacher(user) ? "My Isaac teaching" : "How we help teachers";

    const teacherUpgradeLink = <div className="text-muted mt-2">
        Are you a teacher? {" "}
        <a href="/pages/teacher_account_request" target="_blank" rel="noopener noreferrer">
            <span className='sr-only'> Are you a teacher? </span> Let us know
        </a> {" "}
        and we&apos;ll convert your account to a teacher account.
    </div>;

    const registrationButton = <div className="text-center">
        <RS.Button size="lg" tag={Link} to={"/register"} color="primary" outline>Sign up</RS.Button>
    </div>;

    // TODO hopefully we have a nice way of finding these values without websockets
    const numberOfGroupsCreated = 999;
    const numberOfAssignmentsSet = 999;

    return <RS.Container className="teachers-page">
        <RS.Row className="pb-4">
            <RS.Col>
                <TitleAndBreadcrumb currentPageTitle={pageTitle} breadcrumbTitleOverride="Teachers" />
            </RS.Col>
        </RS.Row>

        {!(user && isTeacher(user)) && <RS.Row>
            <RS.Col md={{size: 8, offset: 2}} className="pt-4 pb-5">
                <PageFragment fragmentId="for_teachers_logged_out" />
                {(user && user.loggedIn) ?
                    !isTeacher(user) && teacherUpgradeLink :
                    registrationButton
                }
            </RS.Col>
        </RS.Row>}

        <RS.Row>
            <RS.Col>
                {user && user.loggedIn && <h2 className="h-secondary h-m">Pick up where you left off</h2>}

                <div>
                    <RS.Row>
                        <RS.ListGroup className="my-3 d-block d-md-flex flex-row flex-wrap align-items-stretch link-list bg-transparent">
                            <RS.ListGroupItem className="px-3 pt-0 pb-4 bg-transparent">
                                <ActionCard
                                    title="Create a group" linkDestination="/groups" linkText="Manage Groups"
                                    amountText={<>You have created <span>{numberOfGroupsCreated}</span> groups.</>}
                                >
                                    Create and alter groups on the manage groups page.
                                </ActionCard>
                            </RS.ListGroupItem>

                            <RS.ListGroupItem className="px-3 pt-0 pb-4 bg-transparent">
                                <ActionCard
                                    title="Set an assignment" linkDestination="/assignments" linkText="Set Assignments"
                                    amountText={<>You have set <span>{numberOfAssignmentsSet}</span> assignments.</>}
                                >
                                    Set more assignments from the set assignments page.
                                </ActionCard>
                            </RS.ListGroupItem>

                            <RS.ListGroupItem className="px-3 pt-0 pb-4 bg-transparent">
                                <ActionCard
                                    title="Create a board" comingSoon linkDestination="/assignments" linkText="Create Boards"
                                    amountText={<>You have created <span>-999</span> gameboards.</>}
                                >
                                    Create custom boards to set as assignments to your groups.
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
                                    linkDestination="/assignments" linkText="View assignment progress"
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

                            {/*<RS.ListGroupItem className="bg-transparent">*/}
                            {/*    <ActionCard*/}
                            {/*        title="Favourites" imageSource="/assets/card05.svg"*/}
                            {/*        linkDestination="link/link" linkText="View favourites"*/}
                            {/*    >*/}
                            {/*        Jump to questions and content you have favourited*/}
                            {/*    </ActionCard>*/}
                            {/*</RS.ListGroupItem>*/}

                        </RS.ListGroup>
                    </RS.Row>
                </div>
            </RS.Col>
        </RS.Row>
    </RS.Container>;
};

export const ForTeachers = connect(stateToProps)(ForTeachersComponent);
