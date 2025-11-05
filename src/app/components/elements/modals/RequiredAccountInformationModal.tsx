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
import {ActiveModalWithoutState, BooleanNotation, DisplaySettings, ValidationUser} from "../../../../IsaacAppTypes";
import {
    allRequiredInformationIsPresent,
    isDefined,
    isLoggedIn,
    isMobile,
    SITE_TITLE,
    siteSpecific,
    validateCountryCode,
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

const RequiredAccountInfoBody = () => {
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
                    <p className="alert-heading fw-bold">Unable to update your account</p>
                    <p>Please fill in all required fields.</p>
                </ExigentAlert>
            }
            {updateCurrentUserError &&
                <ExigentAlert color="warning">
                    <p className="alert-heading fw-bold">Unable to update your account</p>
                    <p>{getRTKQueryErrorMessage(updateCurrentUserError).message}</p>
                </ExigentAlert>
            }
            <AccountTypeMessage role={userToUpdate?.role} hideUpgradeMessage/>
            <Row className="d-flex flex-wrap my-2">
                <Col lg={6}>
                    {!validity.countryCode && <CountryInput
                        userToUpdate={userToUpdate} setUserToUpdate={setUserToUpdate}
                        submissionAttempted={submissionAttempted} idPrefix="modal"
                        required countryCodeValid={validateCountryCode(userToUpdate.countryCode)}
                    />}
                    {!validity.userContexts &&
                        <UserContextAccountInput
                            user={userToUpdate} userContexts={userContexts} setUserContexts={setUserContexts}
                            displaySettings={displaySettings} setDisplaySettings={setDisplaySettings}
                            setBooleanNotation={setBooleanNotation} submissionAttempted={submissionAttempted}
                        />
                    }
                </Col>
                <Col>
                    {!validity.school && <SchoolInput
                        userToUpdate={userToUpdate} setUserToUpdate={setUserToUpdate}
                        submissionAttempted={submissionAttempted} idPrefix="modal"
                        required
                    />}
                </Col>
            </Row>
            <div className="text-muted small pb-2">
                Providing a few extra pieces of information helps us understand the usage of {SITE_TITLE} across the UK and beyond.
                Full details on how we use your personal information can be found in our <a target="_blank" href="/privacy">Privacy Policy</a>.
            </div>
        </CardBody>

        {!validity.emailPreferences &&
            <>
                <CardBody>
                    <hr className="text-center" />
                </CardBody>
                <div>
                    <p>Get important information about the {SITE_TITLE} programme delivered to your inbox. These settings can be changed at any time.</p>
                    <UserEmailPreferencesInput
                        emailPreferences={emailPreferences} setEmailPreferences={setEmailPreferences}
                        submissionAttempted={submissionAttempted} idPrefix="modal-"
                    />
                    <div>
                        <small>
                            <b>Frequency</b>: expect one email per term for News{siteSpecific(" and a monthly bulletin for Events", "")}. Assignment notifications will be sent as needed by your teacher.
                        </small>
                    </div>
                </div>
            </>
        }

        <CardBody className="py-0">
            <Row className="text-center pb-3">
                <Col md={{size: 6, offset: 3}}>
                    <Button type="submit" color="secondary" className="w-100 my-1">{isMobile() ? "Update" : "Update account"}</Button>
                </Col>
            </Row>
        </CardBody>
    </Form>;
};

export const requiredAccountInformationModal: ActiveModalWithoutState = {
    title: "Required account information",
    body: <RequiredAccountInfoBody />,
    size: "lg"
};
