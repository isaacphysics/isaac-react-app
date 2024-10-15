import React from "react";
import {Button, Card, CardBody, Col, Container, Input, Label, Row} from "reactstrap";
import {history, siteSpecific} from "../../services";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import { Link } from "react-router-dom";

export const RegistrationAgeCheckParentalConsent = () => {

    const [parentalConsentCheckboxChecked, setParentalConsentCheckboxChecked] = React.useState<boolean>(false);

    const continueToDetails = (event: React.MouseEvent) => {
        event.preventDefault();
        history.push("/register/student/details");
    };

    return <Container>
        <TitleAndBreadcrumb currentPageTitle={`Additional ${siteSpecific("Information", "information")}`} className="mb-4" />
        <Card className="my-5">
            <CardBody>
                <p>Before signing up to any online programme or website you should ask for permission from a parent or carer so they may check that it is appropriate for you to use.</p>
                <p>Often websites store some information about you to give you the best possible experience on the site but you should always check what data is being kept to do this – you can read how we use your data to provide our service <Link to={"/privacy"}>here</Link>.</p>
                <div className="d-flex align-items-start">
                    <Input
                        id="consent-checkbox" name="consent-checkbox" type="checkbox"
                        checked={parentalConsentCheckboxChecked}
                        className="mt-1"
                        onChange={(e) => setParentalConsentCheckboxChecked(e?.target.checked)}
                    />
                    <Label for="consent-checkbox" className="ms-2 mb-0">Please check the box to confirm that you have read and understood this message.</Label>
                </div>
                <hr />
                <Row className="justify-content-end">
                    <Col sm={3} className="d-flex justify-content-end">
                        <Button className="mt-2 w-100" outline color="secondary" onClick={history.goBack}>Back</Button>
                    </Col>
                    <Col sm={4} lg={3}>
                        <Button className="mt-2 w-100" color="primary" onClick={continueToDetails} disabled={!parentalConsentCheckboxChecked}>Continue</Button>
                    </Col>
                </Row>
            </CardBody>
        </Card>
    </Container>;
};
