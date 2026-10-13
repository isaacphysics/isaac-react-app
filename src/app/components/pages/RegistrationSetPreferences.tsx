import React, {useState} from "react";
import {Button, Card, CardBody, Col, Form, Label, Row,} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {Immutable} from "immer";
import {BooleanNotation, DisplaySettings, ProgrammingLanguage, ValidationUser} from "../../../IsaacAppTypes";
import {
    AppState,
    getRTKQueryErrorMessage,
    selectors,
    useAppSelector,
    useUpdateCurrentMutation
} from "../../state";
import {UserContextAccountInput} from "../elements/inputs/UserContextAccountInput";
import {
    allRequiredInformationIsPresent,
    isAda,
    isDefined,
    isLoggedIn,
    isPhy,
    isUnder13,
    SITE_TITLE,
    siteSpecific,
} from "../../services";
import {BooleanNotationInput} from "../elements/inputs/BooleanNotationInput";
import {ProgrammingLanguageInput} from "../elements/inputs/ProgrammingLanguageInput";
import {useEmailPreferenceState, UserEmailPreferencesInput} from "../elements/inputs/UserEmailPreferencesInput";
import {ExigentAlert} from "../elements/ExigentAlert";
import classNames from "classnames";
import {SignupTab} from "../elements/panels/SignupTab";
import { SignupSidebar } from "../elements/sidebar/SignupSidebar";
import { PageContainer } from "../elements/layout/PageContainer";
import { useNavigate } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";

export const RegistrationSetPreferences = () => {
    const { t } = useTranslation();

    const user = useAppSelector(selectors.user.orNull);
    const userPreferences = useAppSelector((state: AppState) => state?.userPreferences);

    const navigate = useNavigate();

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

    const [updateCurrentUser, {error: updateCurrentUserError}] = useUpdateCurrentMutation();

    const userPreferencesToUpdate = {
        EMAIL_PREFERENCE: emailPreferences, BOOLEAN_NOTATION: booleanNotation, DISPLAY_SETTING: displaySettings
    };

    async function submit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSubmissionAttempted(true);

        if (user && isLoggedIn(user) && allRequiredInformationIsPresent(userToUpdate, userPreferencesToUpdate, userContexts)) {
            await updateCurrentUser({
                currentUser: user,
                updatedUser: userToUpdate,
                userPreferences: userPreferencesToUpdate,
                registeredUserContexts: userContexts,
                passwordCurrent: null,
                redirect: false
            });

            void navigate("/register/success");
        }
    }

    const canSavePreferences = !isPhy || allRequiredInformationIsPresent(userToUpdate, userPreferencesToUpdate, userContexts);

    return <PageContainer
        pageTitle={
            <TitleAndBreadcrumb currentPageTitle={t("common:account.preferences.title")} className="mb-4" icon={{type: "icon", icon: "icon-account"}} />
        }
        sidebar={siteSpecific(
            <SignupSidebar activeTab={3}/>,
            undefined
        )}
    >
        <Card className="my-7">
            <CardBody>
                {updateCurrentUserError &&
                    <ExigentAlert color="warning">
                        <p className="alert-heading fw-bold">{t("common:account.updateError.alertTitle")}</p>
                        <p>{getRTKQueryErrorMessage(updateCurrentUserError).message}</p>
                    </ExigentAlert>
                }
                <SignupTab
                    leftColumn = {<>
                        <h2 className={siteSpecific("h4", "h3")}>{t("common:account.preferences.sectionTitle")}</h2>
                        <p>
                            {t("common:account.preferences.description")}
                        </p></>}
                    rightColumn = {<Form onSubmit={submit}>
                        <UserContextAccountInput user={userToUpdate} userContexts={userContexts}
                            setUserContexts={setUserContexts} setBooleanNotation={setBooleanNotation}
                            displaySettings={displaySettings} setDisplaySettings={setDisplaySettings}
                            submissionAttempted={submissionAttempted} required={isPhy} />
                        {siteSpecific(<div className="section-divider"/>, <hr/>)}

                        {isAda && <>
                            <ProgrammingLanguageInput programmingLanguage={programmingLanguage} setProgrammingLanguage={setProgrammingLanguage} />
                            <BooleanNotationInput booleanNotation={booleanNotation} setBooleanNotation={setBooleanNotation} />
                            <hr />
                        </>}

                        {!isUnder13(user) && <>
                            <Label className={"fw-bold"}>{t("common:account.preferences.emailLabel")}</Label>
                            <p>{t("common:account.preferences.emailDescription", { siteTitle: SITE_TITLE })}</p>
                            <Trans i18nKey="site:account.preferences.emailFrequency" components={{ b: <b /> }} />
                            <div className="py-2"/>
                            <UserEmailPreferencesInput 
                                emailPreferences={emailPreferences} 
                                setEmailPreferences={setEmailPreferences}
                                submissionAttempted={submissionAttempted}
                            />
                        </>}

                        {siteSpecific(<div className="section-divider"/>, <hr/>)}
                        <Row className="justify-content-end">
                            <Col xs={12} sm={siteSpecific(4,5)} lg={6} className={classNames("d-flex justify-content-end", {"justify-content-lg-end": isAda})}>
                                <Button className={`my-2 px-2 w-100 ${siteSpecific("px-lg-0", "px-lg-3")}`}  color="keyline" onClick={() => navigate("/register/success")}>{t("common:account.preferences.skipButton")}</Button>
                            </Col>
                            <Col xs={12} sm={5} lg={6} className="d-flex">
                                <Button type="submit" className={`btn my-2 px-2 w-100 ${siteSpecific("px-lg-0", "px-lg-3")}`} color="solid" disabled={!canSavePreferences}>{t("common:account.preferences.saveButton")}</Button>
                            </Col>
                        </Row>
                    </Form>}
                />
            </CardBody>
        </Card>
    </PageContainer>;
};
