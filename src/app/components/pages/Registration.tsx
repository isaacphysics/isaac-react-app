import React from 'react';
import {connect} from "react-redux";
import {Link} from "react-router-dom";
import {
    Button,
    Card,
    CardBody,
    CardTitle,
    Col,
    CustomInput,
    Form,
    FormGroup,
    Input,
    Row,
    Label,
    Container
} from "reactstrap";
import {BreadcrumbTrail} from "../elements/BreadcrumbTrail";

const stateToProps = null;
const dispatchToProps = null;

interface LogInPageProps {
}
const RegistrationPageComponent = (props: LogInPageProps) => {
    const register = () => console.log("Registration attempt"); // TODO MT registration action

    return <div id="registration-page">
        <h1>Register</h1>
        <Card>
            <CardBody>
                <CardTitle tag="h2">
                    <small className="text-muted">Sign up to {" "} <Link to="/">Isaac</Link></small>
                </CardTitle>
                <Form name="register" onSubmit={register}>
                    <Row>
                        <Col md={6}>
                            <FormGroup>
                                <Label htmlFor="first-name-input">First Name</Label>
                                <Input id="first-name-input" type="text" name="first-name" required />
                            </FormGroup>
                        </Col>
                        <Col md={6}>
                            <FormGroup>
                                <Label htmlFor="last-name-input">Last Name</Label>
                                <Input id="last-name-input" type="text" name="last-name" required />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <FormGroup>
                                <Label htmlFor="password-input">Password</Label>
                                <Input id="password-input" type="password" name="password" required />
                            </FormGroup>
                        </Col>
                        <Col md={6}>
                            <FormGroup>
                                <Label htmlFor="password-input">Confirm Password</Label>
                                <Input id="password-input" type="password" name="password" required />
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <FormGroup>
                                <Label htmlFor="email-input">Email</Label>
                                <Input id="email-input" type="email" name="email" required />
                            </FormGroup>
                        </Col>
                        <Col md={6}>
                            <FormGroup>
                                <Label htmlFor="dob-input">Date of Birth</Label>
                                <Row>
                                    <Col lg={5}>
                                        <Input
                                            id="dob-input"
                                            type="date"
                                            name="date-of-birth"
                                            placeholder="date placeholder"
                                        />
                                    </Col>
                                    <Col lg={7}>
                                        <CustomInput
                                            id="age-confirmation-input"
                                            type="checkbox"
                                            name="age-confirmation"
                                            label="I am at least 13 years old"
                                            required
                                        />
                                    </Col>
                                </Row>
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={{size: 6, offset: 3}}>
                            <Button color="secondary" block>Register Now</Button>
                        </Col>
                    </Row>
                </Form>
            </CardBody>
        </Card>
    </div>;
};

export const Registration = connect(stateToProps, dispatchToProps)(RegistrationPageComponent);
