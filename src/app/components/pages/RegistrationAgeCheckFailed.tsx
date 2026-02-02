import React from "react";
import {Button, Card, CardBody, Col, Container, Row} from "reactstrap";
import {isAda, SITE_TITLE, siteSpecific} from "../../services";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import { SidebarLayout, MainContent } from "../elements/layout/SidebarLayout";
import { SignupSidebar } from "../elements/sidebar/SignupSidebar";
import { useNavigate } from "react-router";

export const RegistrationAgeCheckFailed = () => {
    const navigate = useNavigate();

    const returnToHomepage = (event: React.MouseEvent) => {
        event.preventDefault();
        void navigate("/");
    };

    return <Container>
        <TitleAndBreadcrumb currentPageTitle={`Create an ${SITE_TITLE} account`} className="mb-4" icon={{type: "icon", icon: "icon-account"}}/>
        <SidebarLayout>
            <SignupSidebar activeTab={1}/>
            <MainContent>
                <Card className="my-7">
                    <CardBody>
                        <h3>Unable to create account</h3>
                        <p>Unfortunately, we aren&apos;t able to offer accounts to students under {siteSpecific("10", "13")} years old.</p>
                        <p>{siteSpecific(
                            <><b>But you can still access the whole site for free!</b> You just won&apos;t be able to track your progress.</>,
                            <><b>However, you can still access the whole site for free!</b> However you will not be able to track your progress.</>
                        )}</p>
                        {isAda && <hr/>}
                        <Row className="justify-content-end">
                            {isAda && <Col sm={4} lg={3} className="d-flex justify-content-end">
                                <Button className="mt-2 w-100" color="keyline" onClick={() => navigate(-1)}>Back</Button>
                            </Col>}
                            <Col sm={6} lg={4}>
                                <Button className="mt-2 w-100" color="solid" onClick={returnToHomepage}>{siteSpecific("Take me back", "Back to the site")}</Button>
                            </Col>
                        </Row>
                    </CardBody>
                </Card>
            </MainContent>
        </SidebarLayout>
    </Container>;
};
