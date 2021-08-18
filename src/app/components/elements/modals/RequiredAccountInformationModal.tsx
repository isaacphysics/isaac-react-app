import {closeActiveModal, updateCurrentUser} from "../../../state/actions";
import React, {useState} from "react";
import * as RS from "reactstrap";
import {UserEmailPreference} from "../panels/UserEmailPreferences";
import {UserEmailPreferences} from "../../../../IsaacAppTypes";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../../../state/reducers";
import {
    allRequiredInformationIsPresent,
    validateEmailPreferences,
    validateUserContexts,
    validateUserGender,
    validateUserSchool
} from "../../../services/validation";
import {isMobile} from "../../../services/device";
import {isLoggedIn} from "../../../services/user";
import {SchoolInput} from "../inputs/SchoolInput";
import {GenderInput} from "../inputs/GenderInput";
import {SITE, SITE_SUBJECT} from "../../../services/siteConstants";
import {selectors} from "../../../state/selectors";
import {UserContextAccountInput} from "../inputs/UserContextAccountInput";

const RequiredAccountInfoBody = () => {
    // Redux state
    const dispatch = useDispatch();
    const user = useSelector(selectors.user.orNull);
    const userPreferences = useSelector((state: AppState) => state?.userPreferences);

    // Local state
    const [submissionAttempted, setSubmissionAttempted] = useState(false);

    const initialUserValue = {...user, password: null};
    const [userToUpdate, setUserToUpdate] = useState(initialUserValue);

    const initialEmailPreferencesValue = {...userPreferences?.EMAIL_PREFERENCE};
    const [emailPreferences, setEmailPreferences] = useState<UserEmailPreferences>(initialEmailPreferencesValue);

    const initialUserContexts = user?.loggedIn ? [...user.registeredContexts] : [];
    const [userContexts, setUserContexts] = useState(initialUserContexts.length ? initialUserContexts : [{}]);

    const userPreferencesToUpdate = {EMAIL_PREFERENCE: emailPreferences,};

    // Form submission
    function formSubmission(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSubmissionAttempted(true);

        if (user && isLoggedIn(user) && allRequiredInformationIsPresent(userToUpdate, userPreferencesToUpdate, userContexts)) {
            dispatch(updateCurrentUser(userToUpdate, userPreferencesToUpdate, userContexts, null, user));
            dispatch(closeActiveModal());
        }
    }

    const allUserFieldsAreValid = SITE_SUBJECT !== SITE.CS ||
        validateUserSchool(initialUserValue) && validateUserGender(initialUserValue) && validateUserContexts(initialUserContexts);

    return <RS.Form onSubmit={formSubmission}>
        {!allUserFieldsAreValid && <RS.CardBody className="py-0">
            <div className="text-muted small pb-2">
                Providing a few extra pieces of information helps us understand the usage of Isaac Computer Science across the UK and beyond.
                Full details on how we use your personal information can be found in our <a target="_blank" href="/privacy">Privacy Policy</a>.
            </div>
            <div className="text-right text-muted required-before">
                Required
            </div>

            <RS.Row className="d-flex flex-wrap my-2">
                {(!validateUserGender(initialUserValue) || !validateUserContexts(initialUserContexts)) && <RS.Col>
                    {!validateUserGender(initialUserValue) && <div className="mb-3">
                        <GenderInput
                            userToUpdate={userToUpdate} setUserToUpdate={setUserToUpdate}
                            submissionAttempted={submissionAttempted} idPrefix="modal"
                            required
                        />
                    </div>}
                    {!validateUserContexts(initialUserContexts) && <div>
                        <UserContextAccountInput
                            user={userToUpdate} userContexts={userContexts} setUserContexts={setUserContexts} submissionAttempted={submissionAttempted}
                        />
                    </div>}
                </RS.Col>}
                {!validateUserSchool(initialUserValue) && <RS.Col>
                    <SchoolInput
                        userToUpdate={userToUpdate} setUserToUpdate={setUserToUpdate}
                        submissionAttempted={submissionAttempted} idPrefix="modal"
                        required
                    />
                </RS.Col>}
            </RS.Row>
        </RS.CardBody>}

        {!allUserFieldsAreValid && !validateEmailPreferences(initialEmailPreferencesValue) && <RS.CardBody>
            <hr className="text-center" />
        </RS.CardBody>}

        {!validateEmailPreferences(initialEmailPreferencesValue) && <div>
            <UserEmailPreference
                emailPreferences={emailPreferences} setEmailPreferences={setEmailPreferences}
                submissionAttempted={submissionAttempted} idPrefix="modal-"
            />
        </div>}

        {submissionAttempted && !allRequiredInformationIsPresent(userToUpdate, userPreferencesToUpdate, userContexts) && <div>
            <h4 role="alert" className="text-danger text-center mb-4">
                Required information in this form is not set
            </h4>
        </div>}

        <RS.CardBody className="py-0">
            <RS.Row className="text-center pb-3">
                <RS.Col md={{size: 6, offset: 3}}>
                    <RS.Input type="submit" value={isMobile() ? "Update" : "Update account"} className="btn btn-secondary border-0 px-0 px-md-2 my-1" />
                </RS.Col>
            </RS.Row>
        </RS.CardBody>
    </RS.Form>;
};

export const requiredAccountInformationModal = {
    title: "Required account information",
    body: <RequiredAccountInfoBody />,
};
