import {
    AppState,
    closeActiveModal,
    errorSlice,
    selectors,
    updateCurrentUser,
    useAppDispatch,
    useAppSelector
} from "../../../state";
import React, {useEffect, useState} from "react";
import {BooleanNotation, DisplaySettings, ValidationUser} from "../../../../IsaacAppTypes";
import {
    allRequiredInformationIsPresent,
    isAda,
    isDefined,
    isLoggedIn,
    isMobile,
    isTutor,
    SITE_TITLE,
    siteSpecific,
    validateEmailPreferences,
    validateUserContexts,
    validateUserGender,
    validateUserSchool
} from "../../../services";
import {SchoolInput} from "../inputs/SchoolInput";
import {GenderInput} from "../inputs/GenderInput";
import {UserContextAccountInput} from "../inputs/UserContextAccountInput";
import {Immutable} from "immer";
import { AccountTypeMessage } from "../AccountTypeMessage";
import {useEmailPreferenceState, UserEmailPreferencesInput} from "../inputs/UserEmailPreferencesInput";
import { Form, CardBody, Row, Col, Input } from "reactstrap";

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
    function formSubmission(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSubmissionAttempted(true);

        if (user && isLoggedIn(user) && allRequiredInformationIsPresent(userToUpdate, userPreferencesToUpdate, userContexts)) {
            dispatch(errorSlice.actions.clearError());
            dispatch(updateCurrentUser(userToUpdate, userPreferencesToUpdate, userContexts, null, user, false));
            dispatch(closeActiveModal());
        }
    }

    const allUserFieldsAreValid = siteSpecific(
        validateUserContexts(initialUserContexts),
        validateUserSchool(initialUserValue) && validateUserGender(initialUserValue) && validateUserContexts(initialUserContexts),
    );

    return <Form onSubmit={formSubmission}>
        {!allUserFieldsAreValid && <CardBody className="py-0">
            <div className="text-end text-muted required-before">
                Required
            </div>
            <AccountTypeMessage role={userToUpdate?.role} hideUpgradeMessage/>
            <Row className="d-flex flex-wrap my-2">
                {((isAda && !validateUserGender(initialUserValue)) || !validateUserContexts(initialUserContexts)) && <Col lg={6}>
                    {isAda && !validateUserGender(initialUserValue) && <div className="mb-3">
                        <GenderInput
                            userToUpdate={userToUpdate} setUserToUpdate={setUserToUpdate}
                            submissionAttempted={submissionAttempted} idPrefix="modal"
                            required
                        />
                    </div>}
                    {!validateUserContexts(initialUserContexts) && <div>
                        <UserContextAccountInput
                            user={userToUpdate} userContexts={userContexts} setUserContexts={setUserContexts}
                            displaySettings={displaySettings} setDisplaySettings={setDisplaySettings}
                            setBooleanNotation={setBooleanNotation} submissionAttempted={submissionAttempted}
                        />
                    </div>}
                </Col>}
                {isAda && !validateUserSchool(initialUserValue) && <Col>
                    <SchoolInput
                        userToUpdate={userToUpdate} setUserToUpdate={setUserToUpdate}
                        submissionAttempted={submissionAttempted} idPrefix="modal"
                        required={!("role" in userToUpdate && isTutor(userToUpdate))}
                    />
                </Col>}
            </Row>
            <div className="text-muted small pb-2">
                Providing a few extra pieces of information helps us understand the usage of {SITE_TITLE} across the UK and beyond.
                Full details on how we use your personal information can be found in our <a target="_blank" href="/privacy">Privacy Policy</a>.
            </div>
        </CardBody>}

        {!allUserFieldsAreValid && !validateEmailPreferences(initialEmailPreferencesValue) && <CardBody>
            <hr className="text-center" />
        </CardBody>}

        {!validateEmailPreferences(initialEmailPreferencesValue) && <div>
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
        </div>}

        {submissionAttempted && !allRequiredInformationIsPresent(userToUpdate, userPreferencesToUpdate, userContexts) && <div>
            <h4 role="alert" className="text-danger text-center mb-4">
                Not all required fields have been correctly filled.
            </h4>
        </div>}

        <CardBody className="py-0">
            <Row className="text-center pb-3">
                <Col md={{size: 6, offset: 3}}>
                    <Input type="submit" value={isMobile() ? "Update" : "Update account"} className="btn btn-secondary border-0 px-0 px-md-2 my-1" />
                </Col>
            </Row>
        </CardBody>
    </Form>;
};

export const requiredAccountInformationModal = {
    title: "Required account information",
    body: <RequiredAccountInfoBody />,
};
