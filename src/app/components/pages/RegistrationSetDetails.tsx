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
    Row,
} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {
    FIRST_LOGIN_STATE,
    history,
    KEY,
    persistence,
    SITE_TITLE,
    trackEvent,
    validateEmail,
    validateName,
    validatePassword,
    validateUserSchool
} from "../../services";
import {errorSlice, registerNewUser, selectors, useAppDispatch, useAppSelector} from "../../state";
import {Immutable} from "immer";
import {ValidationUser} from "../../../IsaacAppTypes";
import {SchoolInput} from "../elements/inputs/SchoolInput";
import {CountryInput} from "../elements/inputs/CountryInput";
import {SetPasswordInput} from "../elements/inputs/SetPasswordInput";
import {UserRole} from "../../../IsaacApiTypes";
import {FirstNameInput, LastNameInput} from "../elements/inputs/NameInput";
import {EmailInput} from "../elements/inputs/EmailInput";
import {GenderInput} from "../elements/inputs/GenderInput";
import {extractErrorMessage} from "../../services/errors";
import {FocusedAlert} from "../elements/FocusedAlert";


interface RegistrationSetDetailsProps {
    role: UserRole
}


export const RegistrationSetDetails = ({role}: RegistrationSetDetailsProps) => {
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
            role: role,
            teacherAccountPending: undefined
        })
    );

    const [tosAccepted, setTosAccepted] = useState(false);

    const emailIsValid = registrationUser.email && validateEmail(registrationUser.email);
    const givenNameIsValid = validateName(registrationUser.givenName);
    const familyNameIsValid = validateName(registrationUser.familyName);
    const passwordIsValid = validatePassword(registrationUser.password || "");
    const schoolIsValid = validateUserSchool(registrationUser);
    const error = useAppSelector((state) => state?.error);
    const errorMessage = extractErrorMessage(error);

    const register = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setAttemptedSignUp(true);

        if (familyNameIsValid && givenNameIsValid && passwordIsValid && emailIsValid && schoolIsValid && tosAccepted ) {
            persistence.session.save(KEY.FIRST_LOGIN, FIRST_LOGIN_STATE.FIRST_LOGIN);

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

    return <Container>
        <TitleAndBreadcrumb currentPageTitle={`Create an ${SITE_TITLE} account`} className="mb-4" />
        <Card className="my-5">
            <CardBody>
                {errorMessage &&
                    <FocusedAlert color={"warning"}>
                        <p className="alert-heading font-weight-bold">Unable create your account</p>
                        <p>{errorMessage}</p>
                    </FocusedAlert>
                }
                <Row>
                    <Col xs={12} lg={6}>
                        <h3>Create your {role.toLowerCase()} account</h3>
                    </Col>
                    <Col xs={12} lg={5}>
                        <Form onSubmit={register}>
                            <FirstNameInput
                                className="mb-4"
                                userToUpdate={registrationUser}
                                setUserToUpdate={setRegistrationUser}
                                nameValid={!!givenNameIsValid}
                                submissionAttempted={attemptedSignUp}
                                required={true}
                            />
                            <LastNameInput
                                className="my-4"
                                userToUpdate={registrationUser}
                                setUserToUpdate={setRegistrationUser}
                                nameValid={!!familyNameIsValid}
                                submissionAttempted={attemptedSignUp}
                                required={true}
                            />
                            <EmailInput
                                className="my-4"
                                userToUpdate={registrationUser}
                                setUserToUpdate={setRegistrationUser}
                                submissionAttempted={attemptedSignUp}
                                emailIsValid={!!emailIsValid}
                                required={true}
                            />
                            <SetPasswordInput
                                className="mt-4 mb-5"
                                userToUpdate={registrationUser}
                                setUserToUpdate={setRegistrationUser}
                                passwordValid={passwordIsValid}
                                submissionAttempted={attemptedSignUp}
                                required={true}
                            />
                            <hr className="my-4" />
                            <CountryInput
                                className="my-4"
                                userToUpdate={registrationUser}
                                setUserToUpdate={setRegistrationUser}
                                submissionAttempted={attemptedSignUp}
                                required={true}
                            />
                            <SchoolInput
                                className="my-4"
                                userToUpdate={registrationUser}
                                setUserToUpdate={setRegistrationUser}
                                submissionAttempted={attemptedSignUp}
                                required={true}
                            />
                            <GenderInput
                                className="mt-4 mb-5"
                                userToUpdate={registrationUser}
                                setUserToUpdate={setRegistrationUser}
                                submissionAttempted={attemptedSignUp}
                                required={false}
                            />
                            <hr />
                            <FormGroup className="my-4">
                                <CustomInput
                                    id="tos-confirmation"
                                    name="tos-confirmation"
                                    type="checkbox"
                                    label={<div>I accept the <a href="/terms" target="_blank">terms of use</a></div>}
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
                                <Col className="d-flex justify-content-end" xs={12} sm={6} lg={6}>
                                    <Button className={"mt-2"} outline color="secondary" onClick={history.goBack}>Back</Button>
                                </Col>
                                <Col xs={12} sm={6} lg={6}>
                                    <Input type="submit" value="Continue" className="btn btn-primary mt-2" />
                                </Col>
                            </Row>
                        </Form>
                    </Col>
                </Row>
            </CardBody>
        </Card>
    </Container>
}