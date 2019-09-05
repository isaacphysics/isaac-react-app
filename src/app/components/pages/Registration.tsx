import React, {useState} from 'react';
import {connect} from "react-redux";
import {Link} from "react-router-dom";
import ReactGA from "react-ga";
import {
    Card,
    CardBody,
    CardTitle,
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
import {LoggedInUser, LoggedInValidationUser, UserPreferencesDTO, ZxcvbnResult} from "../../../IsaacAppTypes";
import {AppState} from "../../state/reducers";
import {updateCurrentUser} from "../../state/actions";
import {history} from "../../services/history"
import {isDobOverThirteen, validateEmail, validatePassword} from "../../services/validation";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import * as persistence from "../../services/localStorage"
import {KEY} from "../../services/localStorage"
import {DateInput} from "../elements/inputs/DateInput";
import {loadZxcvbnIfNotPresent, passwordDebounce, passwordStrengthText} from "../../services/passwordStrength"
import {FIRST_LOGIN_STATE} from "../../services/firstLogin";
import {Redirect} from "react-router";

const stateToProps = (state: AppState) => ({
    errorMessage: (state && state.error && state.error.type == "generalError" && state.error.generalError) || undefined,
    userEmail: (history.location && history.location.state && history.location.state.email) || undefined,
    userPassword: (history.location && history.location.state && history.location.state.password) || undefined,
    user: state && state.user || null,
});
const dispatchToProps = {
    updateCurrentUser
};

interface RegistrationPageProps {
    user: LoggedInUser | null;
    updateCurrentUser: (
        registeredUser: LoggedInValidationUser,
        userPreferences: UserPreferencesDTO,
        passwordCurrent: string | null,
        currentUser: LoggedInUser
    ) => void;
    errorMessage: string | undefined;
    userEmail: string | undefined;
    userPassword: string | undefined;
}

const RegistrationPageComponent = ({user, updateCurrentUser, errorMessage, userEmail, userPassword}:  RegistrationPageProps) => {
    // Inputs which trigger re-render
    const [registrationUser, setRegistrationUser] = useState(
        Object.assign({}, user,{
            email: userEmail,
            dateOfBirth: undefined,
            password: null,
        })
    );

    loadZxcvbnIfNotPresent();

    const [unverifiedPassword, setUnverifiedPassword] = useState(userPassword);
    const [dobCheckboxChecked, setDobCheckboxChecked] = useState(false);
    const [attemptedSignUp, setAttemptedSignUp] = useState(false);
    const [passwordFeedback, setPasswordFeedback] = useState<ZxcvbnResult | null>(null);


    // Values derived from inputs (props and state)
    const emailIsValid = registrationUser.email && validateEmail(registrationUser.email);
    const passwordIsValid =
        (registrationUser.password == unverifiedPassword) && validatePassword(registrationUser.password || "");
    const confirmedOverThirteen = dobCheckboxChecked || isDobOverThirteen(registrationUser.dateOfBirth);


    // Form's submission method
    const register = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setAttemptedSignUp(true);

        if (passwordIsValid && emailIsValid && confirmedOverThirteen) {
            persistence.session.save(KEY.FIRST_LOGIN, FIRST_LOGIN_STATE.BANNER_NOT_SHOWN);
            Object.assign(registrationUser, {loggedIn: false});
            updateCurrentUser(registrationUser, {}, null, (Object.assign(registrationUser, {loggedIn: true})));
            // FIXME - the below ought to be in an action, but we don't know that the update actually registration:
            ReactGA.event({
                category: 'user',
                action: 'registration',
                label: 'Create Account (SEGUE)',
            });
        }
    };


    // Convenience method
    const assignToRegistrationUser = (updates: {}) => {
        // Create new object to trigger re-render
        setRegistrationUser(Object.assign({}, registrationUser, updates));
    };

    if (user && user.loggedIn) {
        return <Redirect to="/" />;
    }

    // Render
    return <Container id="registration-page" className="mb-5">

        <TitleAndBreadcrumb currentPageTitle="Registration" className="mb-4" />

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
                                    First name
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
                                    Last name
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
                                <Label htmlFor="password-input" className="form-required">
                                    Password
                                </Label>
                                <Input
                                    id="password-input" type="password" name="password" required
                                    defaultValue={userPassword}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        setUnverifiedPassword(e.target.value);
                                        passwordDebounce(e.target.value, setPasswordFeedback);
                                    }}
                                    onBlur={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        passwordDebounce(e.target.value, setPasswordFeedback);
                                    }}
                                />
                                {passwordFeedback &&
                                    <span className='float-right small mt-1'>
                                        <strong>Password strength: </strong>
                                        <span id="password-strength-feedback">
                                            {passwordStrengthText[(passwordFeedback as ZxcvbnResult).score]}
                                        </span>
                                    </span>
                                }
                            </FormGroup>
                        </Col>
                        <Col md={6}>
                            <FormGroup>
                                <Label htmlFor="password-confirm" className="form-required">
                                    Re-enter password
                                </Label>
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
                                <Label htmlFor="email-input" className="form-required">
                                    Email address
                                </Label>
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
                                <Label htmlFor="dob-input">
                                    Date of birth
                                </Label>
                                <Row>
                                    <Col lg={6}>
                                        <DateInput
                                            id="dob-input" name="date-of-birth"
                                            invalid={!confirmedOverThirteen && attemptedSignUp}
                                            disabled={dobCheckboxChecked}
                                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                                assignToRegistrationUser({dateOfBirth: event.target.valueAsDate});
                                            }}
                                            labelSuffix=" of birth"
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
                            <Input type="submit" value="Register now" className="btn btn-block btn-secondary border-0"/>
                        </Col>
                    </Row>

                </Form>
            </CardBody>
        </Card>
    </Container>;
};

export const Registration = connect(stateToProps, dispatchToProps)(RegistrationPageComponent);
