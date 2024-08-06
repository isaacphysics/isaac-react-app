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
import {history, isPhy, SITE_TITLE, siteSpecific} from "../../services";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";

type AgePermission = "denied" | "additional_info" | "allowed";

export const RegistrationAgeCheck = () => {

    const [over13, setOver13] = useState<AgePermission | undefined>(undefined);
    const [submissionAttempted, setSubmissionAttempted] = useState<boolean>(false);

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmissionAttempted(true);

        switch (over13) {
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
        <Card className="my-5">
            <CardBody>
                <h3>How old are you?</h3>
                <p>We can only create accounts for people over {siteSpecific("10", "13")} years old.</p>
                <Form onSubmit={submit}>
                    <FormGroup check className="my-2">
                        <Input
                            id="registration-age-check-over"
                            className="d-inline"
                            type="radio"
                            checked={over13 === "allowed"}
                            onChange={() => {setOver13("allowed");}}
                            color="secondary"
                            invalid={submissionAttempted && over13 === undefined}
                        />
                        <Label for="registration-age-check-over" className="ms-2">13 and over</Label>
                    </FormGroup>
                    {isPhy && <FormGroup check className="my-2">
                        <Input
                            id="registration-age-check-additional-info"
                            className="d-inline"
                            type="radio"
                            checked={over13 === "additional_info"}
                            onChange={() => {setOver13("additional_info");}}
                            color="secondary"
                            invalid={submissionAttempted && over13 === undefined}
                        >
                        </Input>
                        <Label for="registration-age-check-additional-info" className="ms-2">Between 10 and 12</Label>
                    </FormGroup>}
                    <FormGroup check className="my-2">
                        <Input
                            id="registration-age-check-under"
                            className="d-inline"
                            type="radio"
                            checked={over13 === "denied"}
                            onChange={() => {setOver13("denied");}}
                            color="secondary"
                            invalid={submissionAttempted && over13 === undefined}
                        >
                        </Input>
                        <Label for="registration-age-check-under" className="ms-2">Under {siteSpecific("10", "13")}</Label>
                        <FormFeedback>
                            Please make a selection.
                        </FormFeedback>
                    </FormGroup>
                    <hr />
                    <Row className="justify-content-end">
                        <Col sm={6} lg={3} className="d-flex justify-content-end">
                            <Button className={"mt-2"} outline color="secondary" onClick={history.goBack}>Back</Button>
                        </Col>
                        <Col sm={6} lg={3}>
                            <Input type="submit" value="Continue" className="btn btn-primary mt-2" />
                        </Col>
                    </Row>
                </Form>
            </CardBody>
        </Card>
    </Container>;
};
