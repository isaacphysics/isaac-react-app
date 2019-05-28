import React, {useState, useEffect} from 'react';
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
    FormFeedback
} from "reactstrap";
import {LoggedInUser, UserPreferencesDTO, LoggedInValidationUser} from "../../../IsaacAppTypes";
import {AppState} from "../../state/reducers";
import {updateCurrentUser} from "../../state/actions";
import {history} from "../../services/history"
import {validateDob, validateEmail, validatePassword} from "../../services/validation";

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
        params: {registeredUser: LoggedInValidationUser; userPreferences: UserPreferencesDTO; passwordCurrent: string},
        currentUser: LoggedInUser
    ) => void
    errorMessage: string | null
    userEmail?: string
    userPassword?: string
}

const RegistrationPageComponent = ({user, updateCurrentUser, errorMessage, userEmail, userPassword}:  RegistrationPageProps) => {
    const register = (event: React.FormEvent<HTMLFontElement>) => {
        event.preventDefault();
        if (isValidPassword && isValidEmail && isDobValid) {
            isValidPassword && Object.assign(myUser, {password: (document.getElementById("password-confirm") as HTMLInputElement).value});
            setMyUser(Object.assign(myUser, {firstLogin: true}));
            updateCurrentUser({
                registeredUser: myUser,
                userPreferences: {EMAIL_PREFERENCE: emailPreferences},
                passwordCurrent: ""
            }, (Object.assign(myUser, {loggedIn: true})))
        }
    };

    const emailPreferences = {
            NEWS_AND_UPDATES: true,
            ASSIGNMENTS: true,
            EVENTS: true
    };

    const [myUser, setMyUser] = useState(Object.assign({}, user, {password: ""}));
    const [isValidEmail, setValidEmail] = useState(true);
    const [isDobValid, setIsDobValid] = useState(true);
    const [isValidPassword, setValidPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [signUpAttempted, setSignUpAttempted] = useState(false);

    let today = new Date();
    let thirteen_years_ago = Date.UTC(today.getFullYear() - 13, today.getMonth(), today.getDate())/1000;

    const validateAndSetPassword = (password: string) => {
        setValidPassword(
            (password == (document.getElementById("password") as HTMLInputElement).value) &&
            validatePassword(password)
        )
    };

    const attemptSignUp = () => {
        setSignUpAttempted(true);
    };

    useEffect(() => {
        userEmail ? setMyUser(Object.assign(myUser, {email: userEmail})) : null;
    }, [errorMessage]);


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
                                <Input id="first-name-input" type="text" name="givenName"
                                       onChange={(e: any) => {setMyUser(Object.assign(myUser, {givenName: e.target.value}))}}
                                       required/>
                            </FormGroup>
                        </Col>
                        <Col md={6}>
                            <FormGroup>
                                <Label htmlFor="last-name-input">Last Name</Label>
                                <Input id="last-name-input" type="text" name="familyName"
                                       onChange={(e: any) => {setMyUser(Object.assign(myUser, {familyName: e.target.value}))}}
                                       required/>
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col md={6}>
                            <FormGroup>
                                <Label htmlFor="password-input">New Password</Label>
                                <Input id="password" type="password" name="password" defaultValue={userPassword ? userPassword : null} required/>
                            </FormGroup>
                        </Col>
                        <Col md={6}>
                            <FormGroup>
                                <Label htmlFor="password-confirm">Re-enter New Password</Label>
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
                                <Label htmlFor="email-input">Email</Label>
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
                                    <Col size={12} lg={6}>
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
                                    <Col size={12} lg={5}>
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
                        <h4 role="alert" className="text-danger text-center mb-0">
                            {errorMessage}
                        </h4>
                    </Row>
                    <Row>
                        <Col size={12} md={{size: 6, offset: 3}}>
                            <Button color="secondary" type="submit" onClick={attemptSignUp} block>Register Now</Button>
                        </Col>
                    </Row>
                </Form>
            </CardBody>
        </Card>
    </div>;
};

export const Registration = connect(stateToProps, dispatchToProps)(RegistrationPageComponent);
