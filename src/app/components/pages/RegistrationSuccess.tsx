import React from "react";
import { Card, CardBody, Container } from "reactstrap";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import { REGISTER_CRUMB } from "../../services";
import { selectors, useAppSelector } from "../../state";
import { Redirect } from "react-router";

export const RegistrationSuccess = () => {
  const user = useAppSelector(selectors.user.orNull);

  if (user?.loggedIn) {
    return <Redirect to="/" />;
  }

  return (
    <Container id="registration-success" className="mb-5">
      <TitleAndBreadcrumb
        currentPageTitle="Thanks for signing up"
        intermediateCrumbs={[REGISTER_CRUMB]}
        className="mb-4"
      />
      <Card>
        <CardBody className="text-center">
          <img src="/assets/checkemail.svg" alt="check email" className="w-20 mb-4" style={{ maxHeight: "150px" }} />
          <h3>Thank you for providing the required account information.</h3>
          <p> An email has been sent to your provided email address to complete the registration process.</p>
        </CardBody>
      </Card>
    </Container>
  );
};
