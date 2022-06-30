import React, {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import * as RS from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {PageFragment} from "../elements/PageFragment";
import {isTeacher} from "../../services/user";
import {Link} from "react-router-dom";
import {ActionCard} from "../elements/cards/ActionCard";
import {LinkCard} from "../elements/cards/LinkCard";
import {getMyProgress} from "../../state/actions";
import {selectors} from "../../state/selectors";

export const TeacherTools = () => {
    const dispatch = useDispatch();
    const user = useSelector(selectors.user.orNull);
    const achievementsSelector = useSelector(selectors.user.achievementsRecord);

    useEffect(() => {
        if (!achievementsSelector) {
            dispatch(getMyProgress());
        }
    }, [dispatch, user]);

    const pageTitle = user && isTeacher(user) ? "Teacher tools" : "How we help teachers";

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
    const achievementText = (verb: string, count: number, item: string) => {
        return <>
            You have {verb} <span>{count}</span> {item}{count !== 1 && "s"}.
        </>
    };

    return <RS.Container className="teachers-page">
        <RS.Row className="pb-4">
            <RS.Col>
                <TitleAndBreadcrumb currentPageTitle={pageTitle} />
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
                                    amountText={achievementText("created", (achievementsSelector && achievementsSelector.TEACHER_GROUPS_CREATED) || 0, "group")}
                                >
                                    Create and alter groups on the manage groups page.
                                </ActionCard>
                            </RS.ListGroupItem>

                            <RS.ListGroupItem className="px-3 pt-0 pb-4 bg-transparent">
                                <ActionCard
                                    title="Set an assignment" linkDestination="/set_assignments" linkText="Set assignments"
                                    amountText={achievementText("set", (achievementsSelector && achievementsSelector.TEACHER_ASSIGNMENTS_SET) || 0, "assignment")}
                                >
                                    Set more assignments from the set assignments page.
                                </ActionCard>
                            </RS.ListGroupItem>

                            <RS.ListGroupItem className="px-3 pt-0 pb-4 bg-transparent">
                                <ActionCard
                                    title="Create a gameboard" linkDestination="/gameboard_builder" linkText="Create gameboards"
                                    amountText={achievementText("created", (achievementsSelector && achievementsSelector.TEACHER_GAMEBOARDS_CREATED) || 0, "gameboard")}
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
                                    title="Group progress" imageSource="/assets/card03.png"
                                    linkDestination="/my_markbook" linkText="View my markbook"
                                >
                                    Review your groups&apos; progress on the work which you have assigned to them.
                                </LinkCard>
                            </RS.ListGroupItem>

                            <RS.ListGroupItem className="bg-transparent">
                                <LinkCard
                                    title="CPD events" imageSource="/assets/card02.png"
                                    linkDestination="/events" linkText="View our events"
                                >
                                    Receive guidance on how to use isaaccomputerscience.org by attending our professional development events.
                                </LinkCard>
                            </RS.ListGroupItem>

                            <RS.ListGroupItem className="bg-transparent">
                                <LinkCard
                                    title="Topics" imageSource="/assets/card01.png"
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

