import React from "react";
import { Link } from "react-router-dom";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import { Container, Row, Col } from "reactstrap";

export const AuthError = ({ location: { state } }: { location: { state?: { errorMessage?: string } } }) => {
  return (
    <Container>
      <TitleAndBreadcrumb currentPageTitle="Authentication error" breadcrumbTitleOverride="Authentication error" />
      <Row className="pt-4">
        <Col md={{ size: 8, offset: 2 }}>
          <h3>{state?.errorMessage || ""}</h3>
          <p>
            An error occurred while attempting to log in.
            <br />
            You may want to return to the <Link to="/"> home page</Link> and try again, check{" "}
            <Link to="/support/student/general#login_issues">this FAQ</Link>, or <Link to="/contact">contact us</Link>{" "}
            if this keeps happening.
          </p>
        </Col>
      </Row>
    </Container>
  );
};
