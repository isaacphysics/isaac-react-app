import React from "react";
import {Button, Card, CardBody, Col, Container, Row} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {RaspberryPiSignInButton} from "../elements/RaspberryPiSignInButton";
import {GoogleSignInButton} from "../elements/GoogleSignInButton";
import {isAda, SITE_TITLE} from "../../services";

export const Registration = () => {
    return <Container>
        <TitleAndBreadcrumb currentPageTitle={`Create an ${SITE_TITLE} account`} className="mb-4" />
        <Card className="my-5">
            <CardBody>
                <Row className="align-items-center">
                    <Col xs={12} lg={6}>
                        <div className="mb-5">
                            <h2>How would you like to sign up?</h2>
                            <p>You will have access to the same content no matter how you sign up.</p>
                        </div>
                        <div className="my-5">
                            <h3>Create a new account with your email:</h3>
                            <Button block href="/register/role">Continue with email</Button>
                        </div>
                        <div className="my-5">
                            <h3>Or log in with:</h3>
                            {isAda && <RaspberryPiSignInButton />}
                            <GoogleSignInButton />
                        </div>
                        <hr />
                        <div className="mt-5">
                            <h3>Already have an account?</h3>
                            <Button color="secondary" outline block href="/login">Log in</Button>
                        </div>
                    </Col>
                    <Col xs={12} lg={6}>
                        <img className="d-none d-lg-block img-fluid mx-auto" src={"/assets/cs/decor/register-3x4.png"} alt="" />
                        <img className="d-block d-lg-none img-fluid mt-4 mx-auto " src={"/assets/cs/decor/register-4x3.png"} alt="" />
                    </Col>
                </Row>
            </CardBody>
        </Card>
    </Container>
}