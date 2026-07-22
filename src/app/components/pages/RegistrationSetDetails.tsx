import React, {useState} from "react";
import {Button, Card, CardBody, Col, Form, FormFeedback, FormGroup, Row,} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {
    confirmThen,
    EMAIL_PREFERENCE_DEFAULTS,
    FIRST_LOGIN_STATE,
    isAda,
    isPhy,
    isTeacherOrAbove,
    KEY,
    persistence,
    SITE_TITLE,
    siteSpecific,
    trackEvent,
    validateCountryCode,
    validateDob,
    validateEmail,
    validateName,
    validateUserSchool
} from "../../services";
import {getRTKQueryErrorMessage, mutationSucceeded, requestCurrentUser, selectors, useAppDispatch, useAppSelector, useCreateNewMutation, useUpdateCurrentMutation, useUpgradeToTeacherAccountMutation} from "../../state";
import {Immutable} from "immer";
import {ValidationUser} from "../../../IsaacAppTypes";
import {SchoolInput} from "../elements/inputs/SchoolInput";
import {CountryInput} from "../elements/inputs/CountryInput";
import {SetPasswordInput} from "../elements/inputs/SetPasswordInput";
import {UserRole} from "../../../IsaacApiTypes";
import {FamilyNameInput, GivenNameInput} from "../elements/inputs/NameInput";
import {EmailInput} from "../elements/inputs/EmailInput";
import {GenderInput} from "../elements/inputs/GenderInput";
import {ExigentAlert} from "../elements/ExigentAlert";
import classNames from "classnames";
import {StyledCheckbox} from "../elements/inputs/StyledCheckbox";
import {DobInput} from "../elements/inputs/DobInput";
import {SignupTab} from "../elements/panels/SignupTab";
import {scheduleTeacherOnboardingModalForNextOverviewVisit} from "../elements/modals/AdaTeacherOnboardingModal";
import { SignupSidebar } from "../elements/sidebar/SignupSidebar";
import { useNavigate } from "react-router";
import { PageContainer } from "../elements/layout/PageContainer";

interface RegistrationSetDetailsProps {
    userRole: UserRole
}

export const RegistrationSetDetails = ({userRole}: RegistrationSetDetailsProps) => {

    const user = useAppSelector(selectors.user.orNull);
    const isSSO = user?.loggedIn && user.role === "STUDENT";

    const navigate = useNavigate();
    const [attemptedSignUp, setAttemptedSignUp] = useState(false);
    const [registrationUser, setRegistrationUser] = useState<Immutable<ValidationUser>>(
        Object.assign({
            email: undefined,
            dateOfBirth: undefined,
            password: null,
            familyName: undefined,
            givenName: undefined,
            role: userRole,
            teacherAccountPending: undefined
        }, user)
    );

    const dispatch = useAppDispatch();
    const [createNewUser, {error: createNewUserError}] = useCreateNewMutation();
    const [updateCurrentUser, {error: updateCurrentUserError}] = useUpdateCurrentMutation();
    const [upgradeToTeacherAccount] = useUpgradeToTeacherAccountMutation();
    
    const [passwordValid, setPasswordValid] = useState(false);
    const [tosAccepted, setTosAccepted] = useState(false);

    const emailIsValid = registrationUser.email && validateEmail(registrationUser.email);
    const givenNameIsValid = validateName(registrationUser.givenName);
    const familyNameIsValid = validateName(registrationUser.familyName);
    const schoolIsValid = validateUserSchool(registrationUser);
    const countryCodeIsValid = validateCountryCode(registrationUser.countryCode);
    const dobValid = validateDob(registrationUser.dateOfBirth);

    const register = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setAttemptedSignUp(true);

        if (
            familyNameIsValid && givenNameIsValid && 
            (isSSO || (passwordValid && emailIsValid)) &&
            countryCodeIsValid && dobValid &&
            ((userRole === 'STUDENT') || schoolIsValid) && tosAccepted 
        ) {
            persistence.session.save(KEY.FIRST_LOGIN, FIRST_LOGIN_STATE.FIRST_LOGIN);

            const isTeacherSSO = isSSO && userRole === "TEACHER";
            
            if (isAda && isTeacherOrAbove({ role: userRole })) {
                scheduleTeacherOnboardingModalForNextOverviewVisit();
            }

            // stop the Required account information modal appearing before the signup flow has completed
            persistence.save(KEY.REQUIRED_MODAL_SHOWN_TIME, new Date().toString());

            setAttemptedSignUp(true);

            if (isSSO) {
                await updateCurrentUser({
                    currentUser: user,
                    updatedUser: registrationUser,
                    userPreferences: {EMAIL_PREFERENCE: EMAIL_PREFERENCE_DEFAULTS},
                    registeredUserContexts: undefined,
                    passwordCurrent: null,
                    redirect: false
                });

                if (isAda && isTeacherSSO) {
                    // if the user came via SSO (and thus has a student account already), but they want to upgrade to a teacher, do that here
                    const response = await upgradeToTeacherAccount();
                    if (mutationSucceeded(response)) {
                        await dispatch(requestCurrentUser()); // Refresh user details locally
                    }

                    if (user.emailVerificationStatus !== "VERIFIED") {
                        void navigate('/verifyemail');
                    } else {
                        void navigate('/register/preferences');
                    }
                }

                void navigate('/register/connect');
            } else {
                Object.assign(registrationUser, {loggedIn: false});

                trackEvent("registration", { props: { provider: "SEGUE" } });
    
                await createNewUser({
                    newUser: registrationUser,
                    newUserPreferences: {EMAIL_PREFERENCE: EMAIL_PREFERENCE_DEFAULTS},
                    newUserContexts: undefined,
                    passwordCurrent: null
                });
            }
        }
    };

    const goBack = () => {
        if (isPhy || userRole === "STUDENT") {
            confirmThen(
                "Are you sure you want go back? Any information you have entered will be lost.",
                () => navigate("age"));
        }
        else { // teachers skip age check on Ada
            confirmThen(
                "Are you sure you want go back? Any information you have entered will be lost.",
                () => navigate("/register"));
        }
    };

    return <PageContainer
        pageTitle={
            <TitleAndBreadcrumb currentPageTitle={`Create an ${SITE_TITLE} account`} className="mb-4" icon={{type: "icon", icon: "icon-account"}} />
        }
        sidebar={siteSpecific(
            <SignupSidebar activeTab={2} sso={isSSO} />,
            undefined
        )}
    >
        <Card className="my-7">
            <CardBody>
                {(createNewUserError || updateCurrentUserError) &&
                    <ExigentAlert color="warning">
                        <p className="alert-heading fw-bold">Unable to create your account</p>
                        {createNewUserError && <p>{getRTKQueryErrorMessage(createNewUserError).message}</p>}
                        {updateCurrentUserError && <p>{getRTKQueryErrorMessage(updateCurrentUserError).message}</p>}
                    </ExigentAlert>
                }
                <SignupTab
                    leftColumn = {<div className={siteSpecific("h4", "h3")}>Create your{siteSpecific("", ` ${userRole.toLowerCase()}`)} account</div>}
                    rightColumn = {<Form onSubmit={register}>
                        <div className={siteSpecific("row row-cols-2", "")}>
                            <GivenNameInput
                                className={siteSpecific("my-4", "mb-4")}
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
                        </div>
                        {!isSSO && <EmailInput
                            className="my-4"
                            userToUpdate={registrationUser}
                            setUserToUpdate={setRegistrationUser}
                            submissionAttempted={attemptedSignUp}
                            emailIsValid={!!emailIsValid}
                            required={true}
                        />}
                        {!isSSO && <SetPasswordInput
                            className="my-4"
                            password={registrationUser.password}
                            onChange={(password) => setRegistrationUser(Object.assign({}, registrationUser, {password: password}))}
                            onValidityChange={setPasswordValid}
                            submissionAttempted={attemptedSignUp}
                            required={true}
                        />}
                        <hr className={siteSpecific("section-divider-bold", "my-4 text-center")} />
                        <CountryInput
                            className="my-4"
                            userToUpdate={registrationUser}
                            setUserToUpdate={setRegistrationUser}
                            countryCodeValid={countryCodeIsValid}
                            submissionAttempted={attemptedSignUp}
                            required={true}
                        />
                        <SchoolInput
                            className="my-4"
                            userToUpdate={registrationUser}
                            setUserToUpdate={setRegistrationUser}
                            submissionAttempted={attemptedSignUp}
                            required={isAda && isTeacherOrAbove({ role: userRole })}
                        />
                        <hr className={siteSpecific("section-divider-bold", "my-4 text-center")} />
                        <DobInput
                            userToUpdate={registrationUser}
                            setUserToUpdate={setRegistrationUser}
                            submissionAttempted={attemptedSignUp}
                        />
                        <GenderInput
                            className="mt-4 mb-7"
                            userToUpdate={registrationUser}
                            setUserToUpdate={setRegistrationUser}
                            submissionAttempted={attemptedSignUp}
                            required={false}
                        />
                        <hr className={siteSpecific("section-divider-bold", "my-4 text-center")} />
                        <FormGroup className="form-group my-4">
                            <StyledCheckbox
                                id="tos-confirmation"
                                name="tos-confirmation"
                                type="checkbox"
                                color={siteSpecific("primary", "")}
                                onChange={(e) => setTosAccepted(e?.target.checked)}
                                invalid={attemptedSignUp && !tosAccepted}
                                label={<span className={classNames({"form-required": isPhy})}>I accept the <a href="/terms" target="_blank">terms of use</a>.</span>}
                            />
                            <FormFeedback className="mt-0">
                                You must accept the terms to continue.
                            </FormFeedback>
                        </FormGroup>
                        {isAda && <hr className="text-center"/>}
                        <Row className="justify-content-end">
                            <Col className="d-flex justify-content-end" xs={12} sm={siteSpecific(3,4)} lg={6}>
                                <Button className="mt-2 w-100" color="keyline" onClick={goBack}>Back</Button>
                            </Col>
                            <Col xs={12} sm={siteSpecific(4,5)} lg={6}>
                                <Button type="submit" value="Continue" className="mt-2 w-100" color="solid">Continue</Button>
                            </Col>
                        </Row>
                    </Form>}
                />
            </CardBody>
        </Card>
    </PageContainer>;
};
