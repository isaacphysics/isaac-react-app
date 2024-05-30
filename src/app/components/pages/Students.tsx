import React from "react";
import { selectors, useAppSelector } from "../../state";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import { PageFragment } from "../elements/PageFragment";
import { Link } from "react-router-dom";
import { LinkCard } from "../elements/cards/LinkCard";
import { Button, Container, Row, Col, ListGroup, ListGroupItem } from "reactstrap";

export const Students = () => {
  const user = useAppSelector(selectors.user.orNull);
  const pageTitle = user && user.loggedIn ? "My Isaac" : "How we help students";
  const registrationButton = (
    <div className="text-center">
      <Button size="lg" tag={Link} to={"/register"} color="primary" outline>
        Sign up
      </Button>
    </div>
  );

  return (
    <Container className="students-page">
      <Row className="pb-4">
        <Col>
          <TitleAndBreadcrumb currentPageTitle={pageTitle} breadcrumbTitleOverride="Students" />
        </Col>
      </Row>

      {!(user && user.loggedIn) && (
        <Row>
          <Col md={{ size: 8, offset: 2 }} className="pb-4 mb-5">
            <React.Fragment>
              <PageFragment fragmentId="for_students_logged_out" />
              {registrationButton}
            </React.Fragment>
          </Col>
        </Row>
      )}

      {user && user.loggedIn && (
        <Row>
          <Col>
            <h2 className="h-secondary h-m">Pick up where you left off</h2>
            <div className="pattern-07 pb-5">
              <Row>
                <ListGroup className="mt-md-4 mb-3 d-block d-md-flex flex-wrap flex-row link-list align-items-stretch">
                  <ListGroupItem className="bg-transparent">
                    <LinkCard
                      title="Assignments"
                      imageSource="/assets/card04.png"
                      linkDestination="/assignments"
                      linkText="View your assignments"
                    >
                      View the current status of your assignments.
                    </LinkCard>
                  </ListGroupItem>

                  <ListGroupItem className="bg-transparent">
                    <LinkCard
                      title="Topics"
                      imageSource="/assets/card01.png"
                      linkDestination="/topics"
                      linkText="View all topics"
                    >
                      Work through one of your course&apos;s topics.
                    </LinkCard>
                  </ListGroupItem>

                  <ListGroupItem className="bg-transparent">
                    <LinkCard
                      title="Events"
                      imageSource="/assets/card02.png"
                      linkDestination="/events"
                      linkText="View our events"
                    >
                      Attend one of our free student workshop events.
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
