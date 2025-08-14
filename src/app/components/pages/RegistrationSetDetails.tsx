import React, {useState} from "react";
import {Button, Card, CardBody, Col, Container, Form, FormFeedback, FormGroup, Row,} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {
    confirmThen,
    EMAIL_PREFERENCE_DEFAULTS,
    FIRST_LOGIN_STATE,
    history,
    isAda,
    isDobOldEnoughForSite,
    isPhy,
    isTeacherOrAbove,
    KEY,
    persistence,
    SITE_TITLE,
    siteSpecific,
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
import {FamilyNameInput, GivenNameInput} from "../elements/inputs/NameInput";
import {EmailInput} from "../elements/inputs/EmailInput";
import {GenderInput} from "../elements/inputs/GenderInput";
import {extractErrorMessage} from "../../services/errors";
import {ExigentAlert} from "../elements/ExigentAlert";
import classNames from "classnames";
import {StyledCheckbox} from "../elements/inputs/StyledCheckbox";
import {DobInput} from "../elements/inputs/DobInput";
import { SidebarLayout, SignupSidebar, MainContent } from "../elements/layout/SidebarLayout";
import { SignupTab } from "../elements/panels/SignupTab";
import { scheduleTeacherOnboardingModalForNextOverviewVisit } from "../elements/modals/AdaTeacherOnboardingModal";

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
    const dobValidOrUnset = !isPhy || !registrationUser.dateOfBirth || isDobOldEnoughForSite(registrationUser.dateOfBirth);
    const error = useAppSelector((state) => state?.error);
    const errorMessage = extractErrorMessage(error);

    const register = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setAttemptedSignUp(true);

        if (familyNameIsValid && givenNameIsValid && passwordIsValid && emailIsValid &&
            (!isAda || countryCodeIsValid) && (!isPhy || dobValidOrUnset) &&
            ((role == 'STUDENT') || schoolIsValid) && tosAccepted ) {
            persistence.session.save(KEY.FIRST_LOGIN, FIRST_LOGIN_STATE.FIRST_LOGIN);
            
            if (isAda && isTeacherOrAbove({ role })) {
                scheduleTeacherOnboardingModalForNextOverviewVisit();
            }

            // stop the Required account information modal appearing before the signup flow has completed
            persistence.save(KEY.REQUIRED_MODAL_SHOWN_TIME, new Date().toString());

            setAttemptedSignUp(true);
            Object.assign(registrationUser, {loggedIn: false});
            dispatch(errorSlice.actions.clearError());
            dispatch(registerNewUser(registrationUser, {EMAIL_PREFERENCE: EMAIL_PREFERENCE_DEFAULTS}, undefined, null));
            trackEvent("registration", {
                props:
                        {
                            provider: "SEGUE"
                        }
            }
            );
        }
    };

    const goBack = () => {
        if (isPhy || role === "STUDENT") {
            confirmThen(
                "Are you sure you want go back? Any information you have entered will be lost.",
                () => history.push("age"));
        }
        else { // teachers skip age check on Ada
            confirmThen(
                "Are you sure you want go back? Any information you have entered will be lost.",
                () => history.push("/register"));
        }
    };

    return <Container>
        <TitleAndBreadcrumb currentPageTitle={`Create an ${SITE_TITLE} account`} className="mb-4" icon={{type: "hex", icon: "icon-account"}}/>
        <SidebarLayout>
            <SignupSidebar activeTab={2}/>
            <MainContent>
                <Card className="my-7">
                    <CardBody>
                        {errorMessage &&
                            <ExigentAlert color={"warning"}>
                                <p className="alert-heading fw-bold">Unable to create your account</p>
                                <p>{errorMessage}</p>
                            </ExigentAlert>
                        }
                        <SignupTab
                            leftColumn = {<div className={siteSpecific("h4", "h3")}>Create your{siteSpecific("", ` ${role.toLowerCase()}`)} account</div>}
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
                                <hr className={classNames({"d-none": role == 'TEACHER'}, siteSpecific("section-divider", "my-4 text-center"))} />
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
                                <hr className={classNames({"d-none": role != 'TEACHER'}, siteSpecific("section-divider", "my-4"))} />
                                <GenderInput
                                    className="mt-4 mb-7"
                                    userToUpdate={registrationUser}
                                    setUserToUpdate={setRegistrationUser}
                                    submissionAttempted={attemptedSignUp}
                                    required={false}
                                />
                                <hr className={siteSpecific("section-divider", "text-center")}/>
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
                                        <Button className="mt-2 w-100" color={siteSpecific("solid", "keyline")} onClick={goBack}>Back</Button>
                                    </Col>
                                    <Col xs={12} sm={siteSpecific(4,5)} lg={6}>
                                        <Button type="submit" value="Continue" className="mt-2 w-100">Continue</Button>
                                    </Col>
                                </Row>
                            </Form>}
                        />
                    </CardBody>
                </Card>
            </MainContent>
        </SidebarLayout>
    </Container>;
};
