import React, {useState} from "react";
import {
    Button,
    Card,
    CardBody,
    Col,
    Container,
    CustomInput,
    Form,
    FormFeedback,
    FormGroup,
    Input,
    Row
} from "reactstrap";
import {history, SITE_TITLE} from "../../services";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";

export const RegistrationAgeCheck = () => {

    const [over13, setOver13] = useState<boolean | undefined>(undefined);
    const [submissionAttempted, setSubmissionAttempted] = useState<boolean>(false);

    const submit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmissionAttempted(true);

        if (over13 !== undefined) {
            over13 ?
                history.push("/register/student/details")
                :
                history.push("/register/student/age_denied");
        }
    };

    return <Container>
        <TitleAndBreadcrumb currentPageTitle={`Create an ${SITE_TITLE} account`} className="mb-4" />
        <Card className="my-5">
            <CardBody>
                <h3>How old are you?</h3>
                <p>We can only create accounts for people over 13 years old.</p>
                <Form onSubmit={submit}>
                    <FormGroup check className="my-2">
                        <CustomInput
                            id="registration-age-check-over"
                            className="d-inline"
                            type="radio"
                            checked={over13 === true}
                            onChange={() => {setOver13(true);}}
                            color="secondary"
                            invalid={submissionAttempted && over13 === undefined}
                            label={"13 and over"}
                        />
                    </FormGroup>
                    <FormGroup check className="my-2">
                        <CustomInput
                            id="registration-age-check-under"
                            className="d-inline"
                            type="radio"
                            checked={over13 === false}
                            onChange={() => {setOver13(false);}}
                            color="secondary"
                            invalid={submissionAttempted && over13 === undefined}
                            label={"Under 13"}
                        >
                            <FormFeedback>
                                Please make a selection.
                            </FormFeedback>
                        </CustomInput>
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
