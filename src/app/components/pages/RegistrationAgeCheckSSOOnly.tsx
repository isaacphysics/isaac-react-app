import React from "react";
import {Button, Card, CardBody, Col, Row} from "reactstrap";
import {AUTHENTICATOR_FRIENDLY_NAMES_MAP, AUTHENTICATOR_PROVIDERS, isAda, isPhy, SITE_TITLE, siteSpecific} from "../../services";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import { SignupSidebar } from "../elements/sidebar/SignupSidebar";
import { useNavigate } from "react-router";
import { PageContainer } from "../elements/layout/PageContainer";
import { RaspberryPiSignInButton } from "../elements/RaspberryPiSignInButton";
import { GoogleSignInButton } from "../elements/GoogleSignInButton";
import { MicrosoftSignInButton } from "../elements/MicrosoftSignInButton";
import { SsoHelpLink } from "./LogIn";

export const RegistrationAgeCheckSSOOnly = () => {
    const navigate = useNavigate();

    const returnToHomepage = (event: React.MouseEvent) => {
        event.preventDefault();
        void navigate("/");
    };
    
    const authProviderListString = AUTHENTICATOR_PROVIDERS
        .map(auth => AUTHENTICATOR_FRIENDLY_NAMES_MAP[auth])
        .reduce((acc, curr, index, arr) => {
            if (index === 0) return curr;
            return index === arr.length - 1
                ? acc + " or " + curr
                : acc + ", " + curr;
        }, "");

    return <PageContainer
        pageTitle={
            <TitleAndBreadcrumb currentPageTitle={`Create an ${SITE_TITLE} account`} className="mb-4" icon={{type: "icon", icon: "icon-account"}} />
        }
        sidebar={siteSpecific(
            <SignupSidebar activeTab={1}/>,
            undefined
        )}
    >
        <Card className="my-7">
            <CardBody>
                <h3>Unable to use email</h3>
                <p>As you are between {siteSpecific(10, 11)}-12 years old, we need you to <strong>sign up using a third-party provider</strong>.</p>
                <p>Please try again, using either {authProviderListString}.</p>
                {isAda && <hr/>}
                <div className="d-flex flex-column gap-2">
                    {isAda && <RaspberryPiSignInButton />}
                    <GoogleSignInButton />
                    {isPhy && <MicrosoftSignInButton />}
                    {isPhy && <SsoHelpLink />}
                </div>
                <Row className="justify-content-end">
                    <Col sm={4} lg={3} className="d-flex justify-content-end">
                        <Button className="mt-2 w-100" color="keyline" onClick={() => navigate(-1)}>Back</Button>
                    </Col>
                    <Col sm={6} lg={4}>
                        <Button className="mt-2 w-100" color="solid" onClick={returnToHomepage}>{siteSpecific("Take me back", "Go home")}</Button>
                    </Col>
                </Row>
            </CardBody>
        </Card>
    </PageContainer>;
};
