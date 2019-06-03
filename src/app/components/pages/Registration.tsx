import React, {useState} from 'react';
import {connect} from "react-redux";
import {Link} from "react-router-dom";
import {Card, CardBody, CardTitle, Col, CustomInput, Form, FormGroup, Input, Row, Label, FormFeedback, Container} from "reactstrap";
import {LoggedInUser, UserPreferencesDTO, LoggedInValidationUser} from "../../../IsaacAppTypes";
import {AppState} from "../../state/reducers";
import {updateCurrentUser} from "../../state/actions";
import {history} from "../../services/history"
import {isDobOverThirteen, validateEmail, validatePassword} from "../../services/validation";
import {BreadcrumbTrail} from "../elements/BreadcrumbTrail";
import {EXAM_BOARD} from "../../services/constants";

const stateToProps = (state: AppState) => ({
    errorMessage: (state && state.error && state.error.type == "generalError" && state.error.generalError) || null,
    userEmail: (history.location && history.location.state && history.location.state.email) || null,
    userPassword: (history.location && history.location.state && history.location.state.password) || null
});
const dispatchToProps = {
    updateCurrentUser
};


const defaultExamPreferences = {
    [EXAM_BOARD.OCR]: false,
    [EXAM_BOARD.AQA]: false
};
const defaultEmailPreferences = {
    NEWS_AND_UPDATES: true,
    ASSIGNMENTS: true,
    EVENTS: true
};


interface RegistrationPageProps {
    user: LoggedInUser;
    updateCurrentUser: (
        params: {registeredUser: LoggedInValidationUser; userPreferences: UserPreferencesDTO; passwordCurrent: string | null},
        currentUser: LoggedInUser
    ) => void;
    errorMessage: string | null;
    userEmail: string | null;
    userPassword: string | null;
}
const RegistrationPageComponent = ({user, updateCurrentUser, errorMessage, userEmail, userPassword}:  RegistrationPageProps) => {
    // Inputs which trigger re-render
    const [registrationUser, setRegistrationUser] = useState(
        Object.assign({}, user,{
            email: userEmail,
            dateOfBirth: null,
            password: null,
        })
    );
    const [unverifiedPassword, setUnverifiedPassword] = useState(userPassword);
    const [dobCheckboxChecked, setDobCheckboxChecked] = useState(false);
    const [attemptedSignUp, setAttemptedSignUp] = useState(false);


    // Values derived from inputs (props and state)
    const emailIsValid = registrationUser.email && validateEmail(registrationUser.email);
    const passwordIsValid =
        (registrationUser.password == unverifiedPassword) && validatePassword(registrationUser.password || "");
    const dobIsOverThirteen = isDobOverThirteen(registrationUser.dateOfBirth);
    const confirmedOverThirteen = dobCheckboxChecked || dobIsOverThirteen;


    // Form's submission method
    const register = (event: React.FormEvent<HTMLFontElement>) => {
        event.preventDefault();
        setAttemptedSignUp(true);

        if (passwordIsValid && emailIsValid && confirmedOverThirteen) {
            Object.assign(registrationUser, {firstLogin: true, loggedIn: false});
            updateCurrentUser({
                registeredUser: registrationUser,
                userPreferences: {EMAIL_PREFERENCE: defaultEmailPreferences, EXAM_BOARD: defaultExamPreferences},
                passwordCurrent: null
            }, (Object.assign(registrationUser, {loggedIn: true})))
        }
    };


    // Convenience method
    const assignToRegistrationUser = (updates: {}) => {
        // Create new object to trigger re-render
        setRegistrationUser(Object.assign({}, registrationUser, updates));
    };


    // Render
    return <Container id="registration-page" className="mb-5">

        <BreadcrumbTrail currentPageTitle="Registration" />
        <h1 className="h-title mb-4">Registration</h1>

        <Card>
            <CardBody>

                <CardTitle tag="h2">
                    <small className="text-muted">
                        Sign up to {" "}
                        <Link to="/">
                            Isaac <span className="d-none d-md-inline">Computer Science</span>
                        </Link>
                    </small>
                </CardTitle>

                <Form name="register" onSubmit={register} className="mt-3">

                    {/* Name */}
                    <Row>
                        <Col md={6}>
                            <FormGroup>
                                <Label htmlFor="first-name-input" className="form-required">
                                    First Name
                                </Label>
                                <Input
                                    id="first-name-input" type="text" name="givenName"
                                    maxLength={255} required
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        assignToRegistrationUser({givenName: e.target.value});
                                    }}
                                />
                            </FormGroup>
                        </Col>
                        <Col md={6}>
                            <FormGroup>
                                <Label htmlFor="last-name-input" className="form-required">
                                    Last Name
                                </Label>
                                <Input
                                    id="last-name-input" type="text" name="familyName"
                                    maxLength={255} required
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        assignToRegistrationUser({familyName: e.target.value});
                                    }}
                                />
                            </FormGroup>
                        </Col>
                    </Row>

                    {/* Password */}
                    <Row>
                        <Col md={6}>
                            <FormGroup>
                                <Label htmlFor="password-input" className="form-required">Password</Label>
                                <Input
                                    id="password" type="password" name="password" required
                                    defaultValue={userPassword}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        setUnverifiedPassword(e.target.value);
                                    }}
                                />
                            </FormGroup>
                        </Col>
                        <Col md={6}>
                            <FormGroup>
                                <Label htmlFor="password-confirm" className="form-required">Re-enter Password</Label>
                                <Input
                                    id="password-confirm" name="password" type="password"
                                    required aria-describedby="invalidPassword"
                                    disabled={!unverifiedPassword}
                                    invalid={attemptedSignUp && !passwordIsValid}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        assignToRegistrationUser({password: e.target.value});
                                    }}
                                />
                                <FormFeedback id="password-validation-feedback">
                                    {attemptedSignUp && !passwordIsValid &&
                                            "Passwords must match and be at least 6 characters long"}
                                </FormFeedback>
                            </FormGroup>
                        </Col>
                    </Row>

                    {/* Email and DOB */}
                    <Row>
                        <Col md={6}>
                            <FormGroup>
                                <Label htmlFor="email-input" className="form-required">Email</Label>
                                <Input
                                    id="email-input" name="email" type="email"
                                    aria-describedby="email-validation-feedback" required
                                    defaultValue={userEmail}
                                    invalid={attemptedSignUp && !emailIsValid}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        assignToRegistrationUser({email: e.target.value});
                                    }}
                                />
                                <FormFeedback id="email-validation-feedback">
                                    {(attemptedSignUp && !emailIsValid) && "Enter a valid email address"}
                                </FormFeedback>
                            </FormGroup>
                        </Col>
                        <Col md={6}>
                            <FormGroup>
                                <Label htmlFor="dob-input">Date of Birth</Label>
                                <Row>
                                    <Col lg={6}>
                                        <Input
                                            id="dob-input" name="date-of-birth" type="date"
                                            invalid={!confirmedOverThirteen && attemptedSignUp}
                                            disabled={dobCheckboxChecked}
                                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                                assignToRegistrationUser({dateOfBirth: event.target.valueAsDate});
                                            }}
                                        />
                                    </Col>
                                    <Col lg={6} className="pt-2">
                                        <CustomInput
                                            id="age-confirmation-input" name="age-confirmation" type="checkbox"
                                            className="ml-1 ml-md-0"
                                            checked={confirmedOverThirteen}
                                            required
                                            label="I am at least 13 years old"
                                            disabled={registrationUser.dateOfBirth !== null}
                                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                                setDobCheckboxChecked(!dobCheckboxChecked);
                                            }}
                                        />
                                    </Col>
                                </Row>
                            </FormGroup>
                        </Col>
                    </Row>

                    {/* Form Error */}
                    <Row>
                        <Col>
                            <h4 role="alert" className="text-danger text-left">
                                {!confirmedOverThirteen && attemptedSignUp ?
                                    "You must be over 13 years old to create an account." :
                                    errorMessage}
                            </h4>
                        </Col>
                    </Row>

                    {/* Submit */}
                    <Row className="mt-1 mb-2">
                        <Col md={{size: 6, offset: 3}}>
                            <Input type="submit" value="Register Now" className="btn btn-block btn-secondary border-0"/>
                        </Col>
                    </Row>

                </Form>
            </CardBody>
        </Card>
    </Container>;
};

export const Registration = connect(stateToProps, dispatchToProps)(RegistrationPageComponent);
