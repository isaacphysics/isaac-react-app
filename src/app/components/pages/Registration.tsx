import React, { useState } from "react";
import { selectors, useAppSelector } from "../../state";
import {
  Button,
  Card,
  CardBody,
  CardTitle,
  Col,
  Container,
  CustomInput,
  Label,
  Row,
  UncontrolledTooltip,
} from "reactstrap";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import { Redirect } from "react-router";
import { MetaDescription } from "../elements/MetaDescription";
import { Role } from "../../../IsaacApiTypes";

export const Registration = () => {
  const user = useAppSelector(selectors.user.orNull);

  const [role, setRole] = useState<Role>();
  const [error, setError] = useState<boolean>(false);
  const [redirectTo, setRedirectTo] = useState<string | null>();

  // Continue button handler
  const handleContinue = () => {
    if (role === undefined) {
      setError(true);
    }
    if (role === "STUDENT") {
      setRedirectTo("/register/student");
    }
    if (role === "TEACHER") {
      setRedirectTo("/register/teacher");
    }
  };

  if (user && user.loggedIn) {
    return <Redirect to="/" />;
  }

  if (redirectTo) {
    return <Redirect to={redirectTo} />;
  }

  const metaDescriptionCS =
    "Sign up for a free account and get powerful GCSE and A Level Computer Science resources and questions. For classwork, homework, and revision.";

  return (
    <Container id="registration-page" className="mb-5">
      <TitleAndBreadcrumb
        currentPageTitle="Register for a free account"
        breadcrumbTitleOverride="Registration"
        className="mb-4"
      />
      <MetaDescription description={metaDescriptionCS} />

      <Card>
        <CardBody>
          <CardTitle tag="h2">
            <small>I am registering as a</small>
          </CardTitle>
          <Row className="mt-4 mx-0">
            <Col className="mx-0 p-0">
              <Row className="m-0">
                <CustomInput
                  id="student-input"
                  type="radio"
                  name="option"
                  checked={role === "STUDENT"}
                  className="larger-radio"
                  onChange={() => {
                    setRole("STUDENT");
                  }}
                />
                <Label htmlFor="student-input">Student</Label>
              </Row>
              <Row className="m-0">
                <CustomInput
                  id="teacher-input"
                  type="radio"
                  name="option"
                  checked={role === "TEACHER"}
                  className="larger-radio"
                  onChange={() => {
                    setRole("TEACHER");
                  }}
                />
                <Label htmlFor="teacher-input">
                  Teacher
                  <span id={`registration-tooltip`} className="icon-help ml-2" />
                  <UncontrolledTooltip target={`registration-tooltip`} placement="right">
                    {"You will be required to provide evidence of being a teacher."}
                  </UncontrolledTooltip>
                </Label>
              </Row>
              {error && !role && (
                <h6 role="alert" className="text-danger text-left">
                  Please select an option.
                </h6>
              )}
              <Row className="m-0">
                <Col md={5} className="p-0 mt-4">
                  <Button onClick={handleContinue} className="btn btn-block btn-secondary border-0">
                    Continue
                  </Button>
                </Col>
              </Row>
            </Col>
          </Row>
        </CardBody>
      </Card>
    </Container>
  );
};
