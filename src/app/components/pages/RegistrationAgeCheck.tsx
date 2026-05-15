import React, {useState} from "react";
import {
    Button,
    Card,
    CardBody,
    Col,
    Form,
    FormFeedback,
    FormGroup,
    Input,
    Label,
    Row
} from "reactstrap";
import {confirmThen, isAda, isPhy, SITE_TITLE, siteSpecific} from "../../services";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import classNames from "classnames";
import { SignupSidebar } from "../elements/sidebar/SignupSidebar";
import { useNavigate } from "react-router";
import { PageContainer } from "../elements/layout/PageContainer";

type AgePermission = "denied" | "additional_info" | "allowed";

export const RegistrationAgeCheck = () => {

    const navigate = useNavigate();

    const [agePermission, setAgePermission] = useState<AgePermission | undefined>(undefined);
    const [submissionAttempted, setSubmissionAttempted] = useState<boolean>(false);

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmissionAttempted(true);

        switch (agePermission) {
            case "allowed":
                void navigate("/register/student/details");
                break;
            case "additional_info":
                void navigate("/register/student/additional_info");
                break;
            case "denied":
                void navigate("/register/student/age_denied");
                break;
        }
    };

    const goBack = () => {
        confirmThen(
            "Are you sure you want go back? Any information you have entered will be lost.",
            () => navigate("/register"));
    };

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
                <div className={siteSpecific("h4", "h3")}>How old are you?</div>
                <p>{siteSpecific(
                    "We can only create accounts for users 10 years old or over.",
                    "We can only create accounts for people over 13 years old."
                )}</p>
                <Form onSubmit={submit}>
                    <FormGroup check className="d-flex align-items-center my-2">
                        <Input
                            id="registration-age-check-over"
                            className={classNames("d-inline", {"mb-1" : isAda})}
                            type="radio"
                            checked={agePermission === "allowed"}
                            onChange={() => {setAgePermission("allowed");}}
                            color="primary"
                            invalid={submissionAttempted && agePermission === undefined}
                        />
                        <Label for="registration-age-check-over" className="ms-2 mb-0">13 and over</Label>
                    </FormGroup>
                    {isPhy && <FormGroup check className="d-flex align-items-center my-2">
                        <Input
                            id="registration-age-check-additional-info"
                            className={classNames("d-inline", {"mb-1" : isAda})}
                            type="radio"
                            checked={agePermission === "additional_info"}
                            onChange={() => {setAgePermission("additional_info");}}
                            color="primary"
                            invalid={submissionAttempted && agePermission === undefined}
                        />
                        <Label for="registration-age-check-additional-info" className="ms-2 mb-0">10 - 12 years old</Label>
                    </FormGroup>}
                    <FormGroup check className="d-flex align-items-center my-2">
                        <Input
                            id="registration-age-check-under"
                            className={classNames("d-inline", {"mb-1" : isAda})}
                            type="radio"
                            checked={agePermission === "denied"}
                            onChange={() => {setAgePermission("denied");}}
                            color="primary"
                            invalid={submissionAttempted && agePermission === undefined}
                        />
                        <Label for="registration-age-check-under" className="ms-2 mb-0">Under {siteSpecific("10 years old", "13")}</Label>
                        <FormFeedback>
                            Please make a selection.
                        </FormFeedback>
                    </FormGroup>
                    {isAda && <hr/>}
                    <Row className="justify-content-end">
                        <Col sm={siteSpecific(3,4)} lg={3} className="d-flex justify-content-end mb-1 mb-sm-0">
                            <Button className="w-100 h-100" color="keyline" onClick={goBack}>Back</Button>
                        </Col>
                        <Col sm={siteSpecific(4,5)} lg={3}>
                            <Button type="submit" color="solid" className="w-100 h-100">Continue</Button>
                        </Col>
                    </Row>
                </Form>
            </CardBody>
        </Card>
    </PageContainer>;
};
