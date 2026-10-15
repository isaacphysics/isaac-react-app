import {
    AppState,
    closeActiveModal,
    getRTKQueryErrorMessage,
    selectors,
    useAppDispatch,
    useAppSelector,
    useUpdateCurrentMutation
} from "../../../state";
import React, {useEffect, useState} from "react";
import {ActiveModalProps, BooleanNotation, DisplaySettings, ValidationUser} from "../../../../IsaacAppTypes";
import {
    allRequiredInformationIsPresent,
    isDefined,
    isLoggedIn,
    isMobile,
    isUnder13,
    SITE_TITLE,
    siteSpecific,
    validateCountryCode,
    validateEmail,
    validateName,
    validateRequiredFields,
} from "../../../services";
import {SchoolInput} from "../inputs/SchoolInput";
import {UserContextAccountInput} from "../inputs/UserContextAccountInput";
import {Immutable} from "immer";
import {AccountTypeMessage} from "../AccountTypeMessage";
import {useEmailPreferenceState, UserEmailPreferencesInput} from "../inputs/UserEmailPreferencesInput";
import {Button, CardBody, Col, Form, Row} from "reactstrap";
import {CountryInput} from "../inputs/CountryInput";
import {ExigentAlert} from "../ExigentAlert";
import { DobInput } from "../inputs/DobInput";
import { GenderInput } from "../inputs/GenderInput";
import { FamilyNameInput, GivenNameInput } from "../inputs/NameInput";
import { EmailInput } from "../inputs/EmailInput";
import { Trans, useTranslation } from "react-i18next";
import { TransAnchor } from "../TransAnchor";

const RequiredAccountInfoBody = () => {
    const { t } = useTranslation();
    // Redux state
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectors.user.orNull);
    const userPreferences = useAppSelector((state: AppState) => state?.userPreferences);

    // Local state
    const [submissionAttempted, setSubmissionAttempted] = useState(false);

    const initialUserValue = {...user, password: null};
    const [userToUpdate, setUserToUpdate] = useState<Immutable<ValidationUser>>(initialUserValue);

    const initialEmailPreferencesValue = {...userPreferences?.EMAIL_PREFERENCE};
    const [emailPreferences, setEmailPreferences] = useEmailPreferenceState(initialEmailPreferencesValue);

    const initialUserContexts = user?.loggedIn && isDefined(user.registeredContexts) ? [...user.registeredContexts] : [];
    const [userContexts, setUserContexts] = useState(initialUserContexts.length ? initialUserContexts : [{}]);

    const [booleanNotation, setBooleanNotation] = useState<BooleanNotation | undefined>();
    const [displaySettings, setDisplaySettings] = useState<DisplaySettings>({...userPreferences?.DISPLAY_SETTING});

    const [updateCurrentUser, {error: updateCurrentUserError}] = useUpdateCurrentMutation();

    const validity = validateRequiredFields(initialUserValue, userPreferences, initialUserContexts);

    // If the base user or user preferences objects change outside of this modal, reinitialise the local state. This
    // shouldn't really happen, but it solves a race condition between this modal rendering and the user object being
    // stored in Redux (see notificationManager.ts).
    useEffect(() => {
        setUserToUpdate({...user, password: null});
        const newUserContexts = user?.loggedIn && isDefined(user.registeredContexts) ? [...user.registeredContexts] : [];
        setUserContexts(newUserContexts.length ? newUserContexts : [{}]);
    }, [user]);
    useEffect(() => {
        setEmailPreferences({...userPreferences?.EMAIL_PREFERENCE});
        setDisplaySettings({...userPreferences?.DISPLAY_SETTING});
    }, [userPreferences]);

    const userPreferencesToUpdate = {
        EMAIL_PREFERENCE: emailPreferences, BOOLEAN_NOTATION: booleanNotation, DISPLAY_SETTING: displaySettings
    };

    // Form submission
    async function formSubmission(event: React.FormEvent<HTMLFormElement>) {
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
            }).unwrap()
                // If successful, close the modal.
                .then(() => {dispatch(closeActiveModal());})
                // Otherwise do nothing, as the component will re-render with the relevant error anyway.
                .catch(() => {});
        }
    }

    return <Form onSubmit={formSubmission}>
        <CardBody className="py-0">
            {submissionAttempted && !allRequiredInformationIsPresent(userToUpdate, userPreferencesToUpdate, userContexts) &&
                <ExigentAlert color="warning">
                    <p className="alert-heading fw-bold">{t("common:account.update.errorTitle")}</p>
                    <p>{t("common:account.update.fillAllFields")}</p>
                </ExigentAlert>
            }
            {updateCurrentUserError &&
                <ExigentAlert color="warning">
                    <p className="alert-heading fw-bold">{t("common:account.update.errorTitle")}</p>
                    <p>{getRTKQueryErrorMessage(updateCurrentUserError).message}</p>
                </ExigentAlert>
            }
            <AccountTypeMessage role={userToUpdate?.role} hideUpgradeMessage/>
            <Row className="d-flex flex-wrap my-2">
                {(!validity.givenName || !validity.familyName) && <Col xs={12} id="rai-missing-name">
                    <div className="row row-cols-sm-2">
                        <GivenNameInput
                            userToUpdate={userToUpdate} setUserToUpdate={setUserToUpdate} nameValid={!!validateName(userToUpdate.givenName)}
                            submissionAttempted={submissionAttempted} required={true}
                        />
                        <FamilyNameInput
                            userToUpdate={userToUpdate} setUserToUpdate={setUserToUpdate} nameValid={!!validateName(userToUpdate.familyName)}
                            submissionAttempted={submissionAttempted} required={true}
                        />
                    </div>
                </Col>}
                {!validity.email && !isUnder13(userToUpdate) && <Col xs={12} id="rai-missing-email">
                    <EmailInput
                        userToUpdate={userToUpdate}
                        setUserToUpdate={setUserToUpdate}
                        emailIsValid={!!validateEmail(userToUpdate.email)}
                        submissionAttempted={submissionAttempted}
                        required={true}
                    />
                </Col>}
                {!validity.countryCode && <Col xs={12} id="rai-missing-country-code">
                    <CountryInput
                        userToUpdate={userToUpdate} setUserToUpdate={setUserToUpdate}
                        submissionAttempted={submissionAttempted} idPrefix="modal"
                        required countryCodeValid={validateCountryCode(userToUpdate.countryCode)}
                        textOverride={siteSpecific(t("sci:account.requiredInfo.countryCodeNote"), undefined)}
                    />
                </Col>}
                {!validity.school && <Col xs={12} id="rai-missing-school">
                    <SchoolInput
                        userToUpdate={userToUpdate} setUserToUpdate={setUserToUpdate}
                        submissionAttempted={submissionAttempted} idPrefix="modal"
                        required
                    />
                </Col>}
                {!validity.dateOfBirth && <Col xs={12} id="rai-missing-date-of-birth">
                    <DobInput
                        userToUpdate={userToUpdate} setUserToUpdate={setUserToUpdate}
                        submissionAttempted={submissionAttempted} editingOtherUser={false}
                    />
                </Col>}
                {!validity.gender && <Col xs={12} id="rai-missing-gender">
                    <GenderInput
                        userToUpdate={userToUpdate}
                        setUserToUpdate={setUserToUpdate}
                        submissionAttempted={submissionAttempted}
                        required
                    />
                </Col>}
                {!validity.userContexts && <Col xs={12} id="rai-missing-user-contexts">
                    <UserContextAccountInput
                        user={userToUpdate} userContexts={userContexts} setUserContexts={setUserContexts}
                        displaySettings={displaySettings} setDisplaySettings={setDisplaySettings}
                        setBooleanNotation={setBooleanNotation} submissionAttempted={submissionAttempted}
                    />
                </Col>}
            </Row>
            <div className="text-muted small pb-2">
                <Trans
                    i18nKey="common:account.requiredInfo.privacyNote"
                    components={{
                        privacyPolicyLink: <TransAnchor target="_blank" href="/privacy" />,
                    }}
                    values={{ siteTitle: SITE_TITLE }}
                />
            </div>
        </CardBody>

        {!validity.emailPreferences &&
            <>
                <CardBody>
                    <hr className="text-center" />
                </CardBody>
                <div>
                    <p>{t("common:account.requiredInfo.emailPreferencesIntro", { siteTitle: SITE_TITLE })}</p>
                    <UserEmailPreferencesInput
                        emailPreferences={emailPreferences} setEmailPreferences={setEmailPreferences}
                        submissionAttempted={submissionAttempted} idPrefix="modal-"
                    />
                    <div>
                        <small>
                            <Trans i18nKey="site:account.requiredInfo.emailFrequencyNote" components={{ strong: <b /> }} />
                        </small>
                    </div>
                </div>
            </>
        }

        <CardBody className="py-0">
            <Row className="text-center pb-3">
                <Col md={{size: 6, offset: 3}}>
                    <Button type="submit" color="secondary" className="w-100 my-1">{isMobile() ? t("common:account.requiredInfo.updateButtonMobile") : t("common:account.requiredInfo.updateButtonDesktop")}</Button>
                </Col>
            </Row>
        </CardBody>
    </Form>;
};

export const requiredAccountInformationModal: ActiveModalProps = {
    title: "Required account information",
    body: <RequiredAccountInfoBody />,
    size: "lg"
};
