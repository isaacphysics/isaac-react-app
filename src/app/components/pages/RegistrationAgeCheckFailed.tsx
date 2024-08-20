import React from "react";
import {Button, Card, CardBody, Col, Container, Row} from "reactstrap";
import {history, isAda, SITE_TITLE, siteSpecific} from "../../services";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";

export const RegistrationAgeCheckFailed = () => {

    const returnToHomepage = (event: React.MouseEvent) => {
        event.preventDefault();
        history.push("/");
    };

    return <Container>
        <TitleAndBreadcrumb currentPageTitle={`Create an ${SITE_TITLE} account`} className="mb-4" />
        <Card className="my-5">
            <CardBody>
                <h3>Unable to create account</h3>
                <p>Unfortunately, we aren't able to offer accounts to students under {siteSpecific("10", "13")} years old.</p>
                <p>{siteSpecific(
                    <><b>But you can still access the whole site for free!</b> You just won&apos;t be able to track your progress.</>,
                    <><b>However, you can still access the whole site for free!</b> However you will not be able to track your progress.</>
                )}</p>
                <hr />
                <Row className="justify-content-end">
                    {isAda && <Col sm={6} lg={siteSpecific(4, 3)} className="d-flex justify-content-end">
                        <Button className={"mt-2"} outline color="secondary" onClick={history.goBack}>Back</Button>
                    </Col>}
                    <Col sm={6} lg={siteSpecific(4, 3)}>
                        <Button className={"mt-2 w-100"} color="primary" onClick={returnToHomepage}>{siteSpecific("Take me back", "Back to the site")}</Button>
                    </Col>
                </Row>
            </CardBody>
        </Card>
    </Container>;
};
