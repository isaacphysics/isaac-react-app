import React, {useState} from 'react';
import {selectors, updateCurrentUser, useAppDispatch, useAppSelector} from "../../state";
import {Link} from "react-router-dom";
import ReactGA from "react-ga";
import ReactGA4 from "react-ga4";
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
import {PasswordFeedback} from "../../../IsaacAppTypes";
import {
    FIRST_LOGIN_STATE,
    isDefined, 
    isDobOverThirteen,
    KEY,
    loadZxcvbnIfNotPresent,
    passwordDebounce,
    persistence,
    SITE_SUBJECT_TITLE,
    validateEmail,
    validateName,
    validatePassword
} from "../../services";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {DateInput} from "../elements/inputs/DateInput";
import {Redirect, RouteComponentProps, withRouter} from "react-router";
import {MetaDescription} from "../elements/MetaDescription";

export const Registration = withRouter(({location}:  RouteComponentProps<{}, {}, {email?: string; password?: string}>) => {
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectors.user.orNull);
    const errorMessage = useAppSelector(selectors.error.general);
    const userEmail = location.state?.email || undefined;
    const userPassword = location.state?.password || undefined;

    // Inputs which trigger re-render
    const [registrationUser, setRegistrationUser] = useState(
        Object.assign({}, user,{
            email: userEmail,
            dateOfBirth: undefined,
            password: null,
            familyName: undefined,
            givenName: undefined
        })
    );

    loadZxcvbnIfNotPresent();

    const [unverifiedPassword, setUnverifiedPassword] = useState(userPassword);
    const [dobOver13CheckboxChecked, setDobOver13CheckboxChecked] = useState(false);
    const [attemptedSignUp, setAttemptedSignUp] = useState(false);
    const [passwordFeedback, setPasswordFeedback] = useState<PasswordFeedback | null>(null);


    // Values derived from inputs (props and state)
    const emailIsValid = registrationUser.email && validateEmail(registrationUser.email);
    const givenNameIsValid = validateName(registrationUser.givenName);
    const familyNameIsValid = validateName(registrationUser.familyName);
    const passwordIsValid = (registrationUser.password == unverifiedPassword) && validatePassword(registrationUser.password || "");
    const confirmedOverThirteen = dobOver13CheckboxChecked || isDobOverThirteen(registrationUser.dateOfBirth);
    const dobTooYoung = isDefined(registrationUser.dateOfBirth) && !isDobOverThirteen(registrationUser.dateOfBirth);

    // Form's submission method
    const register = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setAttemptedSignUp(true);

        if (familyNameIsValid && givenNameIsValid && passwordIsValid && emailIsValid && confirmedOverThirteen) {
            persistence.session.save(KEY.FIRST_LOGIN, FIRST_LOGIN_STATE.FIRST_LOGIN);
            Object.assign(registrationUser, {loggedIn: false});
            dispatch(updateCurrentUser(registrationUser, {}, undefined, null, (Object.assign(registrationUser, {loggedIn: true})), true));
            // FIXME - the below ought to be in an action, but we don't know that the update actually registration:
            ReactGA.event({
                category: 'user',
                action: 'registration',
                label: 'Create Account (SEGUE)',
            });
            ReactGA4.event({
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

    const metaDescriptionCS =  "Sign up for a free account and get powerful GCSE and A Level Computer Science resources and questions. For classwork, homework, and revision.";

    // Render
    return <Container id="registration-page" className="mb-5">

        <TitleAndBreadcrumb currentPageTitle="Registration" className="mb-4" />
        <MetaDescription description={metaDescriptionCS} />

        <Card>
            <CardBody>

                <CardTitle tag="h2">
                    <small className="text-muted">
                        Sign up to {" "}
                        <Link to="/">
                            Isaac <span className="d-none d-md-inline">{SITE_SUBJECT_TITLE}</span>
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
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        assignToRegistrationUser({givenName: e.target.value});
                                    }}
                                    invalid={(attemptedSignUp && !givenNameIsValid)}
                                    aria-describedby="firstNameValidationMessage" required
                                />
                                <FormFeedback id="firstNameValidationMessage">
                                    {(attemptedSignUp && !givenNameIsValid) ? "Enter a valid name" : null}
                                </FormFeedback>
                            </FormGroup>
                        </Col>
                        <Col md={6}>
                            <FormGroup>
                                <Label htmlFor="last-name-input" className="form-required">
                                    Last name
                                </Label>
                                <Input
                                    id="last-name-input" type="text" name="familyName"
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                        assignToRegistrationUser({familyName: e.target.value});
                                    }}
                                    invalid={(attemptedSignUp && !familyNameIsValid)}
                                    aria-describedby="lastNameValidationMessage" required
                                />
                                <FormFeedback id="lastNameValidationMessage">
                                    {(attemptedSignUp && !familyNameIsValid) ? "Enter a valid name" : null}
                                </FormFeedback>
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
                                            {passwordFeedback.feedbackText}
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
                                    <Col lg={6} xs={12}>
                                        <DateInput
                                            id="dob-input" name="date-of-birth"
                                            invalid={
                                                dobTooYoung || (attemptedSignUp && !confirmedOverThirteen)
                                            }
                                            disableDefaults
                                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                                assignToRegistrationUser({dateOfBirth: event.target.valueAsDate});
                                                // DOB takes priority over age confirmation
                                                setDobOver13CheckboxChecked(false);
                                            }}
                                            labelSuffix=" of birth"
                                        />
                                    </Col>
                                    <Col lg={6} xs={12} className="pt-2">
                                        <CustomInput
                                            id="age-over-13-confirmation-input" name="age-over-13-confirmation" type="checkbox"
                                            className="ml-1 ml-md-0"
                                            checked={confirmedOverThirteen}
                                            required
                                            label="I am at least 13 years old"
                                            disabled={registrationUser.dateOfBirth}
                                            onChange={(e) => setDobOver13CheckboxChecked(e?.target.checked)}
                                            invalid={dobTooYoung}
                                        />
                                    </Col>
                                </Row>
                            </FormGroup>
                        </Col>
                    </Row>

                    {/* Form Error */}
                    <Row>
                        <Col>
                            {attemptedSignUp &&
                                (!givenNameIsValid || !familyNameIsValid || !passwordIsValid || !emailIsValid) &&
                                <h4 role="alert" className="text-danger text-left">
                                    Not all required fields have been correctly filled.
                                </h4>
                            }
                            <h4 role="alert" className="text-danger text-left">
                                {attemptedSignUp && !confirmedOverThirteen ?
                                    `You must be over 13 years old to create an account.` :
                                    errorMessage}
                            </h4>
                        </Col>
                    </Row>
                    <Row>
                        <Col className="text-center">
                            By clicking Register now, you accept our <Link to="/terms" target="_blank">Terms of Use</Link>.
                            Find out about our <Link to="/privacy" target="_blank">Privacy Policy</Link>.
                        </Col>
                    </Row>

                    {/* Submit */}
                    <Row className="mt-4 mb-2">
                        <Col md={{size: 6, offset: 3}}>
                            <Input type="submit" value="Register now" className="btn btn-block btn-secondary border-0" />
                        </Col>
                    </Row>

                </Form>
            </CardBody>
        </Card>
    </Container>;
});
