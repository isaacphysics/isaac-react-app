import React, {useState} from "react";
import {
    Button,
    Card,
    CardBody,
    Col,
    Container,
    Form,
    FormFeedback,
    FormGroup,
    Input,
    Label,
    Row
} from "reactstrap";
import {history, isAda, isPhy, SITE_TITLE, siteSpecific} from "../../services";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import { MainContent, SidebarLayout, SignupSidebar } from "../elements/layout/SidebarLayout";

type AgePermission = "denied" | "additional_info" | "allowed";

export const RegistrationAgeCheck = () => {

    const [agePermission, setAgePermission] = useState<AgePermission | undefined>(undefined);
    const [submissionAttempted, setSubmissionAttempted] = useState<boolean>(false);

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmissionAttempted(true);

        switch (agePermission) {
            case "allowed":
                history.push("/register/student/details");
                break;
            case "additional_info":
                history.push("/register/student/additional_info");
                break;
            case "denied":
                history.push("/register/student/age_denied");
                break;
        }
    };

    return <Container>
        <TitleAndBreadcrumb currentPageTitle={`Create an ${SITE_TITLE} account`} className="mb-4" />
        <SidebarLayout>
            <SignupSidebar activeTab={1}/>
            <MainContent>
                <Card className="my-5">
                    <CardBody>
                        <div className={siteSpecific("h4", "h3")}>How old are you?</div>
                        <p>{siteSpecific(
                            "We can only create accounts for users 10 years old or over.",
                            "We can only create accounts for people over 13 years old."
                        )}</p>
                        <Form onSubmit={submit}>
                            <FormGroup check className="my-2">
                                <Input
                                    id="registration-age-check-over"
                                    className="d-inline mt-1 input-primary"
                                    type="radio"
                                    checked={agePermission === "allowed"}
                                    onChange={() => {setAgePermission("allowed");}}
                                    color="secondary"
                                    invalid={submissionAttempted && agePermission === undefined}
                                />
                                <Label for="registration-age-check-over" className="ms-2">13 and over</Label>
                            </FormGroup>
                            {isPhy && <FormGroup check className="my-2">
                                <Input
                                    id="registration-age-check-additional-info"
                                    className="d-inline mt-1 input-primary"
                                    type="radio"
                                    checked={agePermission === "additional_info"}
                                    onChange={() => {setAgePermission("additional_info");}}
                                    color="secondary"
                                    invalid={submissionAttempted && agePermission === undefined}
                                >
                                </Input>
                                <Label for="registration-age-check-additional-info" className="ms-2">10 - 12 years old</Label>
                            </FormGroup>}
                            <FormGroup check className="my-2">
                                <Input
                                    id="registration-age-check-under"
                                    className="d-inline mt-1"
                                    type="radio"
                                    checked={agePermission === "denied"}
                                    onChange={() => {setAgePermission("denied");}}
                                    color="secondary"
                                    invalid={submissionAttempted && agePermission === undefined}
                                >
                                </Input>
                                <Label for="registration-age-check-under" className="ms-2">Under {siteSpecific("10 years old", "13")}</Label>
                                <FormFeedback>
                                    Please make a selection.
                                </FormFeedback>
                            </FormGroup>
                            {isAda && <hr/>}
                            <Row className="justify-content-end">
                                <Col sm={siteSpecific(3,4)} lg={3} className="d-flex justify-content-end mb-1 mb-sm-0">
                                    <Button className="w-100 h-100" color={siteSpecific("solid", "secondary")} outline={siteSpecific(false, true)} onClick={history.goBack}>Back</Button>
                                </Col>
                                <Col sm={siteSpecific(4,5)} lg={3}>
                                    <Button type="submit" className="w-100 h-100">Continue</Button>
                                </Col>
                            </Row>
                        </Form>
                    </CardBody>
                </Card>
            </MainContent>
        </SidebarLayout>
    </Container>;
};
