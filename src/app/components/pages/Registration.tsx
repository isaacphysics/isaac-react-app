import React, {useState, useMemo} from 'react';
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
    FormFeedback,
    Container
} from "reactstrap";
import {LoggedInUser, UserPreferencesDTO, LoggedInValidationUser} from "../../../IsaacAppTypes";
import {AppState} from "../../state/reducers";
import {updateCurrentUser} from "../../state/actions";
import {history} from "../../services/history"
import {validateDob, validateEmail, validatePassword} from "../../services/validation";
import {BreadcrumbTrail} from "../elements/BreadcrumbTrail";
import {EXAM_BOARD} from "../../services/constants";

const stateToProps = (state: AppState) => ({
    errorMessage: state && state.error && state.error.type == "generalError" && state.error.generalError || null,
    userEmail: history.location && history.location.state && history.location.state.email,
    userPassword: history.location && history.location.state && history.location.state.password
});
const dispatchToProps = {
    updateCurrentUser
};

interface RegistrationPageProps {
    user: LoggedInUser
    updateCurrentUser: (
        params: {registeredUser: LoggedInValidationUser; userPreferences: UserPreferencesDTO; passwordCurrent: string | null},
        currentUser: LoggedInUser
    ) => void
    errorMessage: string | null
    userEmail?: string
    userPassword?: string
}

const RegistrationPageComponent = ({user, updateCurrentUser, errorMessage, userEmail, userPassword}:  RegistrationPageProps) => {    const [myUser, setMyUser] = useState(Object.assign({}, user, {password: ""}));
    const [unverifiedPassword, setUnverifiedPassword] = useState(userPassword ? userPassword : "");
    const [isValidEmail, setValidEmail] = useState(true);
    const [isDobValid, setIsDobValid] = useState(true);
    const [isValidPassword, setValidPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [signUpAttempted, setSignUpAttempted] = useState(false);

    useMemo(() => {
        userEmail ? setMyUser(Object.assign(myUser, {email: userEmail})) : null;
    }, [errorMessage]);

    const attemptSignUp = () => {
        setSignUpAttempted(true);
    };

    const register = (event: React.FormEvent<HTMLFontElement>) => {
        event.preventDefault();
        attemptSignUp();
        if (isValidPassword && isValidEmail && isDobValid) {
            isValidPassword && Object.assign(myUser, {password: currentPassword});
            setMyUser(Object.assign(myUser, {firstLogin: true}));
            updateCurrentUser({
                registeredUser: Object.assign(myUser, {loggedIn: false}),
                userPreferences: {EMAIL_PREFERENCE: emailPreferences, EXAM_BOARD: examPreferences},
                passwordCurrent: null
            }, (Object.assign(myUser, {loggedIn: true})))
        }
    };

    const examPreferences = {
        [EXAM_BOARD.OCR]: false,
        [EXAM_BOARD.AQA]: false
    };

    const emailPreferences = {
        NEWS_AND_UPDATES: true,
        ASSIGNMENTS: true,
        EVENTS: true
    };

    const validateAndSetPassword = (password: string) => {
        setCurrentPassword(password);
        setValidPassword(
            (password == unverifiedPassword) &&
            validatePassword(password)
        )
    };

    return <Container id="registration-page">
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
                                <Label htmlFor="first-name-input" className="form-required">First Name</Label>
                                <Input id="first-name-input" type="text" name="givenName"
                                       onChange={(e: any) => {setMyUser(Object.assign(myUser, {givenName: e.target.value}))}}
                                       required/>
                            </FormGroup>
                        </Col>
                        <Col md={6}>
                            <FormGroup>
                                <Label htmlFor="last-name-input" className="form-required">Last Name</Label>
                                <Input id="last-name-input" type="text" name="familyName"
                                       onChange={(e: any) => {setMyUser(Object.assign(myUser, {familyName: e.target.value}))}}
                                       required/>
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <FormGroup>
                                <Label htmlFor="password-input" className="form-required">Password</Label>
                                <Input id="password" type="password" name="password" defaultValue={userPassword ? userPassword : null} onChange={(e: any) => {
                                    setUnverifiedPassword(e.target.value)}}required/>
                            </FormGroup>
                        </Col>
                        <Col md={6}>
                            <FormGroup>
                                <Label htmlFor="password-confirm" className="form-required">Re-enter Password</Label>
                                <Input invalid={!isValidPassword && signUpAttempted} id="password-confirm" type="password" name="password" onChange={(e: any) => {
                                    validateAndSetPassword(e.target.value)}
                                } aria-describedby="invalidPassword" required/>
                                <FormFeedback id="invalidPassword">{(!isValidPassword && signUpAttempted) ? "Passwords must match and be at least 6 characters long" : null}</FormFeedback>
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <FormGroup>
                                <Label htmlFor="email-input" className="form-required">Email</Label>
                                <Input invalid={!isValidEmail && signUpAttempted} id="email-input" type="email"
                                       name="email" defaultValue={userEmail ? userEmail : null}
                                       onChange={(e: any) => {
                                           setValidEmail(validateEmail(e.target.value));
                                           (isValidEmail) ? setMyUser(Object.assign(myUser, {email: e.target.value})) : null
                                       }}
                                       aria-describedby="emailValidationMessage" required/>
                                <FormFeedback id="emailValidationMessage">
                                    {(!isValidEmail && signUpAttempted) ? "Enter a valid email address" : null}
                                </FormFeedback>
                            </FormGroup>
                        </Col>
                        <Col md={6}>
                            <FormGroup>
                                <Label htmlFor="dob-input">Date of Birth</Label>
                                <Row>
                                    <Col lg={6}>
                                        <Input
                                            invalid={!isDobValid}
                                            id="dob-input"
                                            type="date"
                                            name="date-of-birth"
                                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                                const dateOfBirth = event.target.value;
                                                setIsDobValid(validateDob(dateOfBirth));
                                                setMyUser(Object.assign(myUser, {dateOfBirth: new Date(dateOfBirth)}))
                                            }}
                                            aria-describedby="ageValidationMessage"
                                        />
                                        {!isDobValid && <FormFeedback id="ageValidationMessage">
                                            You must be over 13 years old
                                        </FormFeedback>}
                                    </Col>
                                    <Col lg={1}>
                                        <CustomInput
                                            id="age-confirmation-input"
                                            type="checkbox"
                                            name="age-confirmation"
                                            required
                                        />
                                    </Col>
                                    <Col lg={5}>
                                        <Label htmlFor="age-confirmation-input" label="I am at least 13 years old" className="form-required">I am at least 13 years old</Label>
                                    </Col>
                                </Row>
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col>
                            <span className="d-block pb-3 pb-md-0 text-right text-md-left form-required">
                                Required field
                            </span>
                        </Col>
                    </Row>
                    <Row>
                        <h4 role="alert" className="text-danger text-center mb-0">
                            {errorMessage}
                        </h4>
                    </Row>
                    <Row>
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
