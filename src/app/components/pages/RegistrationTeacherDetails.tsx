import React from "react";
import {Card, CardBody, Col, Container, CustomInput, Form, FormGroup, Input, Label, Row} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {SITE_TITLE} from "../../services";

export const RegistrationTeacherDetails = () => {
    return <Container>
        <TitleAndBreadcrumb currentPageTitle={`Create an ${SITE_TITLE} account`} className="mb-4" />
        <Card className="my-5">
            <CardBody>
                <Row>
                    <Col xs={12} lg={6}>
                        <h3>Create your teacher account</h3>
                    </Col>
                    <Col xs={12} lg={6}>
                        <Form>
                            <FormGroup>
                                <Label>First name</Label>
                                <Input></Input>
                            </FormGroup>
                            <FormGroup>
                                <Label>Last name</Label>
                                <Input></Input>
                            </FormGroup>
                            <FormGroup>
                                <Label>Email address</Label>
                                <Input></Input>
                            </FormGroup>
                            <FormGroup>
                                <Label>Password</Label>
                                <Input></Input>
                            </FormGroup>
                            <FormGroup>
                                <Label>Country</Label>
                                <Input></Input>
                            </FormGroup>
                            <hr />
                            <FormGroup>
                                <Label>School name</Label>
                                <Input></Input>
                            </FormGroup>
                            <hr />
                            <CustomInput id="tos-confirmation" name="tos-confirmation" type="checkbox" label="I accept the terms of use"/>
                            <hr />
                            <Input type="submit" value="Continue" className="btn btn-primary" />
                        </Form>
                    </Col>
                </Row>
            </CardBody>
        </Card>
    </Container>
}