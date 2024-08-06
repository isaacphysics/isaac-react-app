import React from "react";
import {Button, Card, CardBody, Col, Container, Row} from "reactstrap";
import {history, siteSpecific} from "../../services";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";

export const RegistrationAgeCheckAdditionalInfo = () => {

    const returnToHomepage = (event: React.MouseEvent) => {
        event.preventDefault();
        history.push("/");
    };

    const continueToDetails = (event: React.MouseEvent) => {
        event.preventDefault();
        history.push("/register/student/details");
    };

    return <Container>
        <TitleAndBreadcrumb currentPageTitle={`Additional ${siteSpecific("Information", "information")}`} className="mb-4" />
        <Card className="my-5">
            <CardBody>
                <h3>gdpr info</h3>
                <p>some gdpr-related text should go here.</p>
                <hr />
                <Row className="justify-content-end">
                    <Col sm={3} className="d-flex justify-content-end">
                        <Button className={"mt-2"} outline color="secondary" onClick={history.goBack}>Back</Button>
                    </Col>
                    <Col sm={{size: 4, offset: 1}} lg={{size: 3, offset: 3}}>
                        <Button className={"mt-2 w-100"} color="primary" onClick={returnToHomepage}>I do not accept</Button>
                    </Col>
                    <Col sm={4} lg={3}>
                        <Button className={"mt-2 w-100"} color="primary" onClick={continueToDetails}>I accept</Button>
                    </Col>
                </Row>
            </CardBody>
        </Card>
    </Container>;
};