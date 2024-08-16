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
    Row,
} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {
    EMAIL_PREFERENCE_DEFAULTS,
    EXAM_BOARD,
    FIRST_LOGIN_STATE,
    history,
    isAda,
    isPhy,
    KEY,
    persistence,
    SITE_TITLE,
    STAGE,
    trackEvent,
    validateCountryCode,
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
import {GivenNameInput, FamilyNameInput} from "../elements/inputs/NameInput";
import {EmailInput} from "../elements/inputs/EmailInput";
import {GenderInput} from "../elements/inputs/GenderInput";
import {extractErrorMessage} from "../../services/errors";
import {ExigentAlert} from "../elements/ExigentAlert";
import classNames from "classnames";
import { StyledCheckbox } from "../elements/inputs/StyledCheckbox";
import { DobInput } from "../elements/inputs/DobInput";


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

    const [confirmedPassword, setConfirmedPassword] = useState("");
    const [tosAccepted, setTosAccepted] = useState(false);

    const emailIsValid = registrationUser.email && validateEmail(registrationUser.email);
    const givenNameIsValid = validateName(registrationUser.givenName);
    const familyNameIsValid = validateName(registrationUser.familyName);
    const passwordIsValid = validatePassword(registrationUser.password || "");
    const passwordsMatch = (!isPhy || confirmedPassword === registrationUser.password);
    const schoolIsValid = validateUserSchool(registrationUser);
    const countryCodeIsValid = validateCountryCode(registrationUser.countryCode);
    const error = useAppSelector((state) => state?.error);
    const errorMessage = extractErrorMessage(error);

    const register = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setAttemptedSignUp(true);

        if (familyNameIsValid && givenNameIsValid && passwordIsValid && emailIsValid && (!isAda || countryCodeIsValid) &&
            ((role == 'STUDENT') || schoolIsValid) && tosAccepted ) {
            persistence.session.save(KEY.FIRST_LOGIN, FIRST_LOGIN_STATE.FIRST_LOGIN);

            // stop the Required account information modal appearing before the signup flow has completed
            persistence.save(KEY.REQUIRED_MODAL_SHOWN_TIME, new Date().toString());

            setAttemptedSignUp(true);
            Object.assign(registrationUser, {loggedIn: false});
            dispatch(errorSlice.actions.clearError());
            dispatch(registerNewUser(registrationUser, {EMAIL_PREFERENCE: EMAIL_PREFERENCE_DEFAULTS},
                [{stage: STAGE.ALL, examBoard: EXAM_BOARD.ADA}], null));
            trackEvent("registration", {
                props:
                        {
                            provider: "SEGUE"
                        }
            }
            );
        }
    };

    return <Container>
        <TitleAndBreadcrumb currentPageTitle={`Create an ${SITE_TITLE} account`} className="mb-4" />
        <Card className="my-5">
            <CardBody>
                {errorMessage &&
                    <ExigentAlert color={"warning"}>
                        <p className="alert-heading fw-bold">Unable to create your account</p>
                        <p>{errorMessage}</p>
                    </ExigentAlert>
                }
                <Row>
                    <Col xs={12} lg={6}>
                        <h3>Create your {role.toLowerCase()} account</h3>
                    </Col>
                    <Col xs={12} lg={5}>
                        <Form onSubmit={register}>
                            <GivenNameInput
                                className="mb-4"
                                userToUpdate={registrationUser}
                                setUserToUpdate={setRegistrationUser}
                                nameValid={!!givenNameIsValid}
                                submissionAttempted={attemptedSignUp}
                                required={true}
                            />
                            <FamilyNameInput
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
                                className="my-4"
                                userToUpdate={registrationUser}
                                setUserToUpdate={setRegistrationUser}
                                passwordValid={passwordIsValid}
                                passwordsMatch={passwordsMatch}
                                setConfirmedPassword={setConfirmedPassword}
                                submissionAttempted={attemptedSignUp}
                                required={true}
                            />
                            {isAda && <CountryInput
                                className="my-4"
                                userToUpdate={registrationUser}
                                setUserToUpdate={setRegistrationUser}
                                countryCodeValid={countryCodeIsValid}
                                submissionAttempted={attemptedSignUp}
                                required={true}
                            />}
                            <hr className={classNames({"d-none": role == 'TEACHER'}, "my-4")} />
                            <SchoolInput
                                className="my-4"
                                userToUpdate={registrationUser}
                                setUserToUpdate={setRegistrationUser}
                                submissionAttempted={attemptedSignUp}
                                required={role == 'TEACHER'}
                            />
                            {isPhy &&
                                <DobInput
                                    userToUpdate={registrationUser}
                                    setUserToUpdate={setRegistrationUser}
                                    submissionAttempted={attemptedSignUp}
                                />
                            }
                            <hr className={classNames({"d-none": role != 'TEACHER'}, "my-4")} />
                            <GenderInput
                                className="mt-4 mb-5"
                                userToUpdate={registrationUser}
                                setUserToUpdate={setRegistrationUser}
                                submissionAttempted={attemptedSignUp}
                                required={false}
                            />
                            <hr />
                            <FormGroup className="form-group my-4">
                                <StyledCheckbox
                                    id="tos-confirmation"
                                    name="tos-confirmation"
                                    type="checkbox"
                                    onChange={(e) => setTosAccepted(e?.target.checked)}
                                    invalid={attemptedSignUp && !tosAccepted}
                                    label={<span>I accept the <a href="/terms" target="_blank">terms of use</a>.</span>}
                                />
                                <FormFeedback className="mt-0">
                                    You must accept the terms to continue.
                                </FormFeedback>
                            </FormGroup>
                            <hr />
                            <Row>
                                <Col className="d-flex justify-content-end" xs={12} sm={6} lg={6}>
                                    <Button className="mt-2" outline color="secondary" onClick={history.goBack}>Back</Button>
                                </Col>
                                <Col xs={12} sm={6} lg={6}>
                                    <Button type="submit" value="Continue" className="mt-2">Continue</Button>
                                </Col>
                            </Row>
                        </Form>
                    </Col>
                </Row>
            </CardBody>
        </Card>
    </Container>;
};
