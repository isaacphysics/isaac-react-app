import React, {useState} from "react";
import {Button, Card, CardBody, Col, Container, Form, Label, Row,} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";

import {Immutable} from "immer";
import {BooleanNotation, DisplaySettings, ProgrammingLanguage, ValidationUser} from "../../../IsaacAppTypes";
import {AppState, errorSlice, selectors, updateCurrentUser, useAppDispatch, useAppSelector} from "../../state";
import {UserContextAccountInput} from "../elements/inputs/UserContextAccountInput";
import {
    allRequiredInformationIsPresent,
    history,
    isAda,
    isDefined,
    isLoggedIn,
    isPhy,
    KEY,
    persistence,
    SITE_TITLE,
    siteSpecific,
} from "../../services";
import {BooleanNotationInput} from "../elements/inputs/BooleanNotationInput";
import {ProgrammingLanguageInput} from "../elements/inputs/ProgrammingLanguageInput";
import {useEmailPreferenceState, UserEmailPreferencesInput} from "../elements/inputs/UserEmailPreferencesInput";
import {extractErrorMessage} from "../../services/errors";
import {ExigentAlert} from "../elements/ExigentAlert";
import classNames from "classnames";

export const RegistrationSetPreferences = () => {

    const dispatch = useAppDispatch();
    const user = useAppSelector(selectors.user.orNull);
    const userPreferences = useAppSelector((state: AppState) => state?.userPreferences);

    const error = useAppSelector((state) => state?.error);
    const errorMessage = extractErrorMessage(error);

    const [submissionAttempted, setSubmissionAttempted] = useState(false);

    const initialUserValue = {...user, password: null};
    const [userToUpdate, setUserToUpdate] = useState<Immutable<ValidationUser>>(initialUserValue);

    const initialEmailPreferencesValue =  {...userPreferences?.EMAIL_PREFERENCE};
    const [emailPreferences, setEmailPreferences] = useEmailPreferenceState(initialEmailPreferencesValue);

    const initialUserContexts = user?.loggedIn && isDefined(user.registeredContexts) ? [...user.registeredContexts] : [];
    const [userContexts, setUserContexts] = useState(initialUserContexts.length ? initialUserContexts : [{}]);

    const [booleanNotation, setBooleanNotation] = useState<BooleanNotation | undefined>();
    const [displaySettings, setDisplaySettings] = useState<DisplaySettings>({...userPreferences?.DISPLAY_SETTING});
    const [programmingLanguage, setProgrammingLanguage] = useState<ProgrammingLanguage>({...userPreferences?.PROGRAMMING_LANGUAGE});

    function continueToAfterAuthPath() {
        history.push(persistence.pop(KEY.AFTER_AUTH_PATH) || "/");
    }

    const userPreferencesToUpdate = {
        EMAIL_PREFERENCE: emailPreferences, BOOLEAN_NOTATION: booleanNotation, DISPLAY_SETTING: displaySettings
    };

    function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSubmissionAttempted(true);

        if (user && isLoggedIn(user) && allRequiredInformationIsPresent(userToUpdate, userPreferencesToUpdate, userContexts)) {
            dispatch(errorSlice.actions.clearError());
            dispatch(updateCurrentUser(userToUpdate, userPreferencesToUpdate, userContexts, null, user, true));
            if (isPhy) continueToAfterAuthPath();
        }
    }

    const canSavePreferences = !isPhy || allRequiredInformationIsPresent(userToUpdate, userPreferencesToUpdate, userContexts);

    return <Container>
        <TitleAndBreadcrumb currentPageTitle={`Customise your account`} className="mb-4" />
        <Card className="my-5">
            <CardBody>
                {errorMessage &&
                    <ExigentAlert color="warning">
                        <p className="alert-heading fw-bold">Unable to update your account</p>
                        <p>{errorMessage}</p>
                    </ExigentAlert>
                }
                <Row>
                    <Col xs={12} lg={6}>
                        <h3>Set your preferences</h3>
                        <p>
                            Answering these questions will help us personalise the platform for you. You can skip this
                            or change your answers at any time under My Account.
                        </p>
                    </Col>
                    <Col xs={12} lg={6}>
                        <Form onSubmit={submit}>
                            <UserContextAccountInput user={userToUpdate} userContexts={userContexts}
                                setUserContexts={setUserContexts} setBooleanNotation={setBooleanNotation}
                                displaySettings={displaySettings} setDisplaySettings={setDisplaySettings}
                                submissionAttempted={submissionAttempted} required={isPhy} />
                            <hr />

                            {isAda && <>
                                <ProgrammingLanguageInput programmingLanguage={programmingLanguage} setProgrammingLanguage={setProgrammingLanguage} />
                                <BooleanNotationInput booleanNotation={booleanNotation} setBooleanNotation={setBooleanNotation} />
                                <hr />
                            </>}

                            <Label className={"fw-bold"}>Set your email notification preferences</Label>
                            <p>Get important information about the {SITE_TITLE} programme delivered to your inbox. These settings can be changed at any time.</p>
                            <b>Frequency</b>: expect one email per term for News{siteSpecific(" and a monthly bulletin for Events", "")}. Assignment notifications will be sent as needed by your teacher.
                            <div className="py-2"/>
                            <UserEmailPreferencesInput 
                                emailPreferences={emailPreferences} 
                                setEmailPreferences={setEmailPreferences}
                                submissionAttempted={false}
                            />
                            <hr />
                            <Row className="justify-content-end">
                                <Col xs={12} sm={siteSpecific(4,5)} lg={6} className={classNames("d-flex justify-content-end", {"justify-content-lg-end": isAda})}>
                                    <Button className={`my-2 px-2 w-100 ${siteSpecific("px-lg-0", "px-lg-3")}`} outline color="secondary" onClick={continueToAfterAuthPath}>I&apos;ll do this later</Button>
                                </Col>
                                <Col xs={12} sm={5} lg={6} className="d-flex">
                                    <Button type="submit" className={`btn btn-primary my-2 px-2 w-100 ${siteSpecific("px-lg-0", "px-lg-3")}`} disabled={!canSavePreferences}>Save preferences</Button>
                                </Col>
                            </Row>
                        </Form>
                    </Col>
                </Row>
            </CardBody>
        </Card>
    </Container>;
};
