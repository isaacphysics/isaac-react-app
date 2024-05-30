import React, { useEffect } from "react";
import { getMyProgress, selectors, useAppDispatch, useAppSelector } from "../../state";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import { PageFragment } from "../elements/PageFragment";
import { isTeacherOrAbove } from "../../services";
import { Link } from "react-router-dom";
import { ActionCard } from "../elements/cards/ActionCard";
import { LinkCard } from "../elements/cards/LinkCard";
import { Button, Container, Row, Col, ListGroup, ListGroupItem } from "reactstrap";

// TODO do we need a version of this for CS tutors?
export const TeacherTools = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectors.user.orNull);
  const achievementsSelector = useAppSelector(selectors.user.achievementsRecord);

  useEffect(() => {
    if (!achievementsSelector) {
      dispatch(getMyProgress());
    }
  }, [dispatch, user]);

  const pageTitle = user && isTeacherOrAbove(user) ? "Teacher tools" : "How we help teachers";

  const teacherUpgradeLink = (
    <div className="text-center">
      <Button size="lg" tag={Link} to="/pages/teacher_accounts" color="primary" outline>
        Register as a Teacher
      </Button>
    </div>
  );
  const registrationButton = (
    <div className="text-center">
      <Button size="lg" tag={Link} to={"/register"} color="primary" outline>
        Sign up
      </Button>
    </div>
  );
  const achievementText = (verb: string, count: number, item: string) => {
    return (
      <>
        You have {verb} <span>{count}</span> {item}
        {count !== 1 && "s"}.
      </>
    );
  };

  return (
    <Container className="teachers-page">
      <Row className="pb-4">
        <Col>
          <TitleAndBreadcrumb currentPageTitle={pageTitle} />
        </Col>
      </Row>

      {!(user && isTeacherOrAbove(user)) && (
        <Row>
          <Col md={{ size: 8, offset: 2 }} className="pt-4 pb-5 mb-5">
            <PageFragment fragmentId="for_teachers_logged_out" />
            {user && user.loggedIn ? !isTeacherOrAbove(user) && teacherUpgradeLink : registrationButton}
          </Col>
        </Row>
      )}

      {isTeacherOrAbove(user) && (
        <Row>
          <Col>
            <h2 className="h-secondary h-m">Pick up where you left off</h2>
            <div>
              <Row>
                <ListGroup className="my-3 d-block d-md-flex flex-row flex-wrap align-items-stretch link-list bg-transparent">
                  <ListGroupItem className="px-3 pt-0 pb-4 bg-transparent">
                    <ActionCard
                      title="Create a group"
                      linkDestination="/groups"
                      linkText="Manage groups"
                      amountText={achievementText(
                        "created",
                        (achievementsSelector && achievementsSelector.TEACHER_GROUPS_CREATED) || 0,
                        "group",
                      )}
                    >
                      Create and alter groups on the manage groups page.
                    </ActionCard>
                  </ListGroupItem>

                  <ListGroupItem className="px-3 pt-0 pb-4 bg-transparent">
                    <ActionCard
                      title="Set an assignment"
                      linkDestination="/set_assignments"
                      linkText="Set assignments"
                      amountText={achievementText(
                        "set",
                        (achievementsSelector && achievementsSelector.TEACHER_ASSIGNMENTS_SET) || 0,
                        "assignment",
                      )}
                    >
                      Set more assignments from the set assignments page.
                    </ActionCard>
                  </ListGroupItem>

                  <ListGroupItem className="px-3 pt-0 pb-4 bg-transparent">
                    <ActionCard
                      title="Create a gameboard"
                      linkDestination="/gameboard_builder"
                      linkText="Create gameboards"
                      amountText={achievementText(
                        "created",
                        (achievementsSelector && achievementsSelector.TEACHER_GAMEBOARDS_CREATED) || 0,
                        "gameboard",
                      )}
                    >
                      Create custom gameboards to set as assignments to your groups.
                    </ActionCard>
                  </ListGroupItem>
                </ListGroup>
              </Row>
            </div>

            <div className="pattern-06 pt-4 pb-5">
              <Row>
                <ListGroup className="mb-4 d-block d-md-flex flex-row align-items-stretch link-list bg-transparent">
                  <ListGroupItem className="bg-transparent">
                    <LinkCard
                      title="Group progress"
                      imageSource="/assets/card03.png"
                      linkDestination="/my_markbook"
                      linkText="View my markbook"
                    >
                      Review your groups&apos; progress on the work which you have assigned to them.
                    </LinkCard>
                  </ListGroupItem>

                  <ListGroupItem className="bg-transparent">
                    <LinkCard
                      title="CPD events"
                      imageSource="/assets/card02.png"
                      linkDestination="/events"
                      linkText="View our events"
                    >
                      Receive guidance on how to use isaaccomputerscience.org by attending our professional development
                      events.
                    </LinkCard>
                  </ListGroupItem>

                  <ListGroupItem className="bg-transparent">
                    <LinkCard
                      title="Topics"
                      imageSource="/assets/card01.png"
                      linkDestination="/topics"
                      linkText="View all topics"
                    >
                      Review the site&apos;s material arranged by topic.
                    </LinkCard>
                  </ListGroupItem>
                </ListGroup>
              </Row>
            </div>
          </Col>
        </Row>
      )}
    </Container>
  );
};
