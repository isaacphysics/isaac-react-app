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
    Label,
    Row
} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {
    SITE_TITLE,
} from "../../services";
import {Immutable} from "immer";
import {ValidationUser} from "../../../IsaacAppTypes";
import {USER_ROLES} from "../../../IsaacApiTypes";
import {selectors, useAppSelector} from "../../state";

export const RegistrationSetPreferences = () => {

    const user = useAppSelector(selectors.user.orNull);

    function setPreferences() {

    }

    const [registrationUser, setRegistrationUser] = useState<Immutable<ValidationUser>>(
        Object.assign({}, user,{
            email: undefined,
            dateOfBirth: undefined,
            password: null,
            familyName: undefined,
            givenName: undefined,
            role: USER_ROLES[2]  // todo: not this
        })
    );

    const assignToRegistrationUser = (updates: {}) => {
        // Create new object to trigger re-render
        setRegistrationUser(Object.assign({}, registrationUser, updates));
    };

    return <Container>
        <TitleAndBreadcrumb currentPageTitle={`Customise your account`} className="mb-4" />
        <Card className="my-5">
            <CardBody>
                <Row>
                    <Col xs={12} lg={6}>
                        <h3>Set your preferences</h3>
                        <p>
                            Answering these questions will help us personalise the platform for you. You can skip this
                            or change your answers at any time under My Account.
                        </p>
                    </Col>
                    <Col xs={12} lg={5}>
                        <Form onSubmit={setPreferences}>
                            <FormGroup>
                                <Label className={"font-weight-bold"}>Customise what you see</Label>
                                <Input
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        assignToRegistrationUser({givenName: e.target.value});}}
                                />
                                <FormFeedback>
                                    Please enter a valid name.
                                </FormFeedback>
                            </FormGroup>

                            <hr />
                            <Row>
                                <Col>
                                    <Button outline color="secondary" href="/register/role">Back</Button>
                                </Col>
                                <Col>
                                    <Input type="submit" value="Continue" className="btn btn-primary" />
                                </Col>
                            </Row>
                        </Form>
                    </Col>
                </Row>
            </CardBody>
        </Card>
    </Container>
}