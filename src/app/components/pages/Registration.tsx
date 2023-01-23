import React, {useState} from 'react';
import {selectors, updateCurrentUser, useAppDispatch, useAppSelector} from "../../state";
import {Link} from "react-router-dom";
import ReactGA from "react-ga";
import {
    Alert,
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
    isCS,
    isDobOverTen,
    isDobOverThirteen,
    isPhy,
    KEY,
    loadZxcvbnIfNotPresent,
    passwordDebounce,
    persistence,
    SITE_SUBJECT_TITLE,
    siteSpecific,
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
    const [dob10To12CheckboxChecked, setDob10To12CheckboxChecked] = useState(false);
    const [parentalConsentCheckboxChecked, setParentalConsentCheckboxChecked] = useState(false);
    const [attemptedSignUp, setAttemptedSignUp] = useState(false);
    const [passwordFeedback, setPasswordFeedback] = useState<PasswordFeedback | null>(null);


    // Values derived from inputs (props and state)
    const emailIsValid = registrationUser.email && validateEmail(registrationUser.email);
    const givenNameIsValid = validateName(registrationUser.givenName);
    const familyNameIsValid = validateName(registrationUser.familyName);
    const passwordIsValid =
        (registrationUser.password == unverifiedPassword) && validatePassword(registrationUser.password || "");
    const confirmedOverThirteen = dobOver13CheckboxChecked || isDobOverThirteen(registrationUser.dateOfBirth);
    const confirmedOverTen = dob10To12CheckboxChecked || isDobOverTen(registrationUser.dateOfBirth) || confirmedOverThirteen;
    const confirmedTenToTwelve = confirmedOverTen && !confirmedOverThirteen;
    const confirmedOldEnoughForSite = siteSpecific(confirmedOverTen, confirmedOverThirteen)
    const consentGivenOrNotRequired = isCS || (confirmedTenToTwelve === parentalConsentCheckboxChecked);

    // Form's submission method
    const register = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setAttemptedSignUp(true);

        if (familyNameIsValid && givenNameIsValid && passwordIsValid && emailIsValid && confirmedOldEnoughForSite && consentGivenOrNotRequired) {
            persistence.session.save(KEY.FIRST_LOGIN, FIRST_LOGIN_STATE.FIRST_LOGIN);
            Object.assign(registrationUser, {loggedIn: false});
            dispatch(updateCurrentUser(registrationUser, {}, undefined, null, (Object.assign(registrationUser, {loggedIn: true})), true));
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

    const metaDescriptionCS =  "Sign up for a free account and get powerful GCSE and A Level Computer Science resources and questions. For classwork, homework, and revision.";

    // Render
    return <Container id="registration-page" className="mb-5">

        <TitleAndBreadcrumb currentPageTitle="Registration" className="mb-4" />
        {isCS && <MetaDescription description={metaDescriptionCS} />}

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
                                    <Col lg={siteSpecific(12, 6)} xs={12}>
                                        <DateInput
                                            id="dob-input" name="date-of-birth"
                                            invalid={!siteSpecific(confirmedOverTen, confirmedOverThirteen) && attemptedSignUp}
                                            disabled={(isPhy && dob10To12CheckboxChecked) || dobOver13CheckboxChecked}
                                            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                                                assignToRegistrationUser({dateOfBirth: event.target.valueAsDate});
                                            }}
                                            labelSuffix=" of birth"
                                        />
                                    </Col>
                                    <Col lg={siteSpecific(12, 6)} xs={12} className="pt-2">
                                        <CustomInput
                                            id="age-over-13-confirmation-input" name="age-over-13-confirmation" type="checkbox"
                                            className="ml-1 ml-md-0"
                                            checked={confirmedOverThirteen}
                                            required
                                            label="I am at least 13 years old"
                                            disabled={(isPhy && dob10To12CheckboxChecked) || registrationUser.dateOfBirth}
                                            onChange={(e) => setDobOver13CheckboxChecked(e?.target.checked)}
                                        />
                                        {isPhy && <CustomInput
                                            id="age-10-to-12-confirmation-input" name="age-10-to-12-confirmation" type="checkbox"
                                            className="ml-1 ml-md-0"
                                            checked={confirmedTenToTwelve}
                                            required
                                            label="I am aged 10 to 12 years old"
                                            disabled={dobOver13CheckboxChecked || registrationUser.dateOfBirth}
                                            onChange={(e) => setDob10To12CheckboxChecked(e?.target.checked)}
                                        />}
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
                                {attemptedSignUp && !confirmedOldEnoughForSite ?
                                    `You must be over ${siteSpecific("10", "13")} years old to create an account.` :
                                    errorMessage}
                            </h4>
                        </Col>
                    </Row>

                    {/* 10-12 parental consent box */}
                    {isPhy && confirmedTenToTwelve && <Alert color={"warning"}>
                        <p>
                            Before signing up to any online programme or website you should ask for permission from a
                            parent or carer so they may check that it is appropriate for you to use. Often websites
                            store some information about you to give you the best possible experience on the site but
                            you should always check what data is being kept to do this - you can read how we use your
                            data to provide our service <Link to="/privacy" target="_blank">here</Link>.
                        </p>
                        <CustomInput
                            id="consent-checkbox" name="consent-checkbox" type="checkbox"
                            checked={parentalConsentCheckboxChecked}
                            label="Please check the box to confirm that you have read and understood this message."
                            onChange={(e) => setParentalConsentCheckboxChecked(e?.target.checked)}
                        />
                    </Alert>}

                    <Row>
                        <Col className="text-center">
                            By clicking Register now, you accept our <Link to="/terms" target="_blank">Terms of Use</Link>.
                            Find out about our <Link to="/privacy" target="_blank">Privacy Policy</Link>.
                        </Col>
                    </Row>

                    {/* Submit */}
                    <Row className="mt-4 mb-2">
                        <Col md={{size: 6, offset: 3}}>
                            <Input disabled={!consentGivenOrNotRequired} type="submit" value="Register now" className="btn btn-block btn-secondary border-0" />
                        </Col>
                    </Row>

                </Form>
            </CardBody>
        </Card>
    </Container>;
});
