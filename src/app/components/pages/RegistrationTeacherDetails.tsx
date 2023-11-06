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
    loadZxcvbnIfNotPresent,
    SITE_TITLE,
    trackEvent, validateEmail, validateName, validatePassword
} from "../../services";
import {errorSlice, registerNewUser, selectors, updateCurrentUser, useAppDispatch, useAppSelector} from "../../state";
import {Immutable} from "immer";
import {ValidationUser} from "../../../IsaacAppTypes";
import {SchoolInput} from "../elements/inputs/SchoolInput";
import {CountryInput} from "../elements/inputs/CountryInput";
import {TogglablePasswordInput} from "../elements/inputs/TogglablePasswordInput";
import {USER_ROLES} from "../../../IsaacApiTypes";

export const RegistrationTeacherDetails = () => {
    const dispatch = useAppDispatch();

    // todo: before, this was probably used to keep the details from the initial login screen (if any). Possibly still useful for SSO. Remove?
    const user = useAppSelector(selectors.user.orNull);
    const [attemptedSignUp, setAttemptedSignUp] = useState(false);
    const [registrationUser, setRegistrationUser] = useState<Immutable<ValidationUser>>(
        Object.assign({}, user,{
            email: undefined,
            dateOfBirth: undefined,
            password: null,
            familyName: undefined,
            givenName: undefined,
            role: USER_ROLES[2]
        })
    );
    const [tosAccepted, setTosAccepted] = useState(false);

    const emailIsValid = registrationUser.email && validateEmail(registrationUser.email);
    const givenNameIsValid = validateName(registrationUser.givenName);
    const familyNameIsValid = validateName(registrationUser.familyName);
    const passwordIsValid = validatePassword(registrationUser.password || "");

    const assignToRegistrationUser = (updates: {}) => {
        // Create new object to trigger re-render
        setRegistrationUser(Object.assign({}, registrationUser, updates));
    };

    const register = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setAttemptedSignUp(true);

        if (familyNameIsValid && givenNameIsValid && passwordIsValid && emailIsValid && tosAccepted) {
            // todo: this used to set the FIRST_LOGIN value in persistence. Was that important, or just to disentangle
            //  registration from login in the Redux action?

            setAttemptedSignUp(true)
            Object.assign(registrationUser, {loggedIn: false});
            dispatch(errorSlice.actions.clearError());
            dispatch(registerNewUser(registrationUser, {}, undefined, null));
            trackEvent("registration_started", {
                    props:
                        {
                            provider: "SEGUE"
                        }
                }
            )
        }
    }

    loadZxcvbnIfNotPresent();

    return <Container>
        <TitleAndBreadcrumb currentPageTitle={`Create an ${SITE_TITLE} account`} className="mb-4" />
        <Card className="my-5">
            <CardBody>
                <Row>
                    <Col xs={12} lg={6}>
                        <h3>Create your teacher account</h3>
                    </Col>
                    <Col xs={12} lg={5}>
                        <Form onSubmit={register}>
                            <FormGroup>
                                <Label className={"font-weight-bold"}>First name</Label>
                                <Input
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        assignToRegistrationUser({givenName: e.target.value});}}
                                    invalid={attemptedSignUp && !givenNameIsValid}
                                />
                                <FormFeedback>
                                    Please enter a valid name.
                                </FormFeedback>
                            </FormGroup>
                            <FormGroup>
                                <Label className={"font-weight-bold"}>Last name</Label>
                                <Input
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    assignToRegistrationUser({familyName: e.target.value});}}
                                    invalid={attemptedSignUp && !familyNameIsValid}
                                />
                                <FormFeedback>
                                    Please enter a valid name.
                                </FormFeedback>
                            </FormGroup>
                            <FormGroup>
                                <Label className={"font-weight-bold"}>Email address</Label>
                                <p className="d-block">This will be visible to your students. We recommend using your school email address.</p>
                                <Input
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                    assignToRegistrationUser({email: e.target.value});}}
                                    invalid={attemptedSignUp && !emailIsValid}
                                />
                                <FormFeedback>
                                    Please enter a valid email address.
                                </FormFeedback>
                            </FormGroup>
                            <TogglablePasswordInput
                                userToUpdate={registrationUser}
                                setUserToUpdate={setRegistrationUser}
                                passwordValid={passwordIsValid}
                                submissionAttempted={attemptedSignUp}
                                required={true}
                            />
                            <CountryInput
                                userToUpdate={registrationUser}
                                setUserToUpdate={setRegistrationUser}
                                submissionAttempted={attemptedSignUp}
                                required={true}
                            />
                            <hr />
                            <SchoolInput
                                userToUpdate={registrationUser}
                                setUserToUpdate={setRegistrationUser}
                                submissionAttempted={attemptedSignUp}
                                required={false}
                            />
                            <hr />
                            <FormGroup>
                                <CustomInput
                                    id="tos-confirmation"
                                    name="tos-confirmation"
                                    type="checkbox"
                                    label={<div>I accept the <a href="/terms">terms of use</a></div>}
                                    onChange={(e) => setTosAccepted(e?.target.checked)}
                                    invalid={attemptedSignUp && !tosAccepted}
                                >
                                    <FormFeedback>
                                        You must accept the terms to continue.
                                    </FormFeedback>
                                </CustomInput>
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