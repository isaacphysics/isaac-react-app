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
import {RegisteredUserDTO} from "../../../IsaacApiTypes";
import {AppState} from "../../state/reducers";
import {updateCurrentUser} from "../../state/actions";

const stateToProps = (state: AppState) => ({
    user: state ? state.user : null,
    errorMessage: state ? state.error : null
});
const dispatchToProps = {
    updateCurrentUser
};

interface validationUser extends RegisteredUserDTO {
    password: string | null
}

interface RegistrationPageProps {
    user: RegisteredUserDTO | null
    updateCurrentUser: (
        params: {registeredUser: validationUser; passwordCurrent: string},
        currentUser: RegisteredUserDTO
    ) => void
    errorMessage: string | null
}

const RegistrationPageComponent = ({user, updateCurrentUser, errorMessage}:  RegistrationPageProps) => {
    const register = (event: React.FormEvent<HTMLFontElement>) => {
        setMyUser(Object.assign(myUser, {firstlogin: true}))
        event.preventDefault();
        console.log("Registration attempt");
        console.log(myUser);
        updateCurrentUser({registeredUser: myUser, passwordCurrent: ""}, myUser)
    }; // TODO MT registration action

    const queryString = require('query-string');
    const urlParams = queryString.parse(location.search);

    const [myUser, setMyUser] = useState(Object.assign({}, user, {password: ""}));
    const [isValidEmail, setValidEmail] = useState(true);
    const [isValidDob, setValidDob] = useState(true);
    const [isValidPassword, setValidPassword] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [signUpAttempted, setSignUpAttempted] = useState(false);

    let today = new Date();
    let thirteen_years_ago = Date.UTC(today.getFullYear() - 13, today.getMonth(), today.getDate())/1000;


    const validateAndSetEmail = (event: any) => {
        setValidEmail((event.target.value.length > 0 && event.target.value.includes("@")));
    };

    const validateAndSetDob = (event: any) => {
        setValidDob((myUser.dateOfBirth != undefined) &&
            ((new Date(String(event.target.value)).getTime()/1000) <= thirteen_years_ago))
    };

    const validateAndSetPassword = (event: any) => {
        setValidPassword(
            (event.target.value == (document.getElementById("password") as HTMLInputElement).value) &&
            ((document.getElementById("password") as HTMLInputElement).value != undefined) &&
            ((document.getElementById("password") as HTMLInputElement).value.length > 5)
        )
    };

    const attemptSignUp = () => {
        setSignUpAttempted(true);
    };


    return <div id="registration-page">
        <h1>Register</h1>
        <Card>
            <CardBody>
                <CardTitle tag="h2">
                    <small className="text-muted">Sign up to {" "} <Link to="/">Isaac</Link></small>
                </CardTitle>
                <Form name="register" onSubmit={register}>
                    <Row>
                        <Col size={12} md={6}>
                            <FormGroup>
                                <Label htmlFor="first-name-input">First Name</Label>
                                <Input id="first-name-input" type="text" name="givenName"
                                       onBlur={(e: any) => {setMyUser(Object.assign(myUser, {givenName: e.target.value}))}}
                                       required/>
                            </FormGroup>
                        </Col>
                        <Col size={12} md={6}>
                            <FormGroup>
                                <Label htmlFor="last-name-input">Last Name</Label>
                                <Input id="last-name-input" type="text" name="familyName"
                                       onBlur={(e: any) => {setMyUser(Object.assign(myUser, {familyName: e.target.value}))}}
                                       required/>
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col size={12} md={6}>
                            <FormGroup>
                                <Label htmlFor="password-input">New Password</Label>
                                <Input id="password" type="password" name="password" required/>
                            </FormGroup>
                        </Col>
                        <Col size={12} md={6}>
                            <FormGroup>
                                <Label htmlFor="password-confirm">Re-enter New Password</Label>
                                <Input invalid={!isValidPassword && signUpAttempted} id="password-confirm" type="password" name="password" onBlur={(e: any) => {
                                    validateAndSetPassword(e);
                                    (e.target.value == (document.getElementById("password") as HTMLInputElement).value) ? Object.assign(myUser, {password: e.target.value}) : null}
                                } aria-describedby="invalidPassword" required/>
                                <FormFeedback id="invalidPassword">{(!isValidPassword && signUpAttempted) ? "Passwords must match and be at least 6 characters long" : null}</FormFeedback>
                            </FormGroup>
                        </Col>
                    </Row>
                    <Row>
                        <Col size={12} md={6}>
                            <FormGroup>
                                <Label htmlFor="email-input">Email</Label>
                                <Input invalid={!isValidEmail} id="email-input" type="email"
                                       name="email" defaultValue={urlParams.email ? urlParams.email : null}
                                       onBlur={(e: any) => {
                                           validateAndSetEmail(e);
                                           (isValidEmail) ? setMyUser(Object.assign(myUser, {email: e.target.value})) : null
                                       }}
                                       aria-describedby="emailValidationMessage" required/>
                                <FormFeedback id="emailValidationMessage">
                                    {(!isValidEmail && signUpAttempted) ? "Enter a valid email address" : null}
                                </FormFeedback>
                            </FormGroup>
                        </Col>
                        <Col size={12} md={6}>
                            <FormGroup>
                                <Label htmlFor="dob-input">Date of Birth</Label>
                                <Row>
                                    <Col size={12} lg={6}>
                                        <Input
                                            invalid={!isValidDob}
                                            id="dob-input"
                                            type="date"
                                            name="date-of-birth"
                                            defaultValue={myUser.dateOfBirth}
                                            onBlur={(e: any) => {
                                                validateAndSetDob;
                                                (isValidDob) ? setMyUser(Object.assign(myUser, {dateOfBirth: e.target.value})) : null
                                            }}
                                            aria-describedby ="ageValidationMessage"
                                        />
                                        <FormFeedback id="ageValidationMessage">
                                            {(!isValidDob) ? "You must be over 13 years old" : null}
                                        </FormFeedback>
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
                        <Col size={12} md={{size: 6, offset: 3}}>
                            <Button color="secondary" type="submit" onClick={(isValidPassword && isValidEmail && isValidDob) ? attemptSignUp : null} block>Register Now</Button>
                        </Col>
                    </Row>
                </Form>
            </CardBody>
        </Card>
    </div>;
};

export const Registration = connect(stateToProps, dispatchToProps)(RegistrationPageComponent);
