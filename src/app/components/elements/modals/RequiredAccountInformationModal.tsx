import {closeActiveModal, updateCurrentUser} from "../../../state/actions";
import React, {useState} from "react";
import * as RS from "reactstrap";
import {UserEmailPreference} from "../UserEmailPreferences";
import {SubjectInterests, UserEmailPreferences} from "../../../../IsaacAppTypes";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../../../state/reducers";
import {
    allRequiredInformationIsPresent,
    validateEmailPreferences,
    validateSubjectInterests, validateUserGender, validateUserSchool
} from "../../../services/validation";
import {isMobile} from "../../../services/device";
import {isLoggedIn} from "../../../services/user";
import {TrueFalseRadioInput} from "../inputs/TrueFalseRadioInput";
import {SchoolInput} from "../inputs/SchoolInput";
import {DobInput} from "../inputs/DobInput";
import {Row} from "reactstrap";
import {Col} from "reactstrap";
import {CardBody} from "reactstrap";
import {StudyingCsInput} from "../inputs/StudyingCsInput";
import {GenderInput} from "../inputs/GenderInput";
import {Link} from "react-router-dom";

const RequiredAccountInfoBody = () => {
    // Redux state
    const dispatch = useDispatch();
    const user = useSelector((state: AppState) => state && state.user);
    const userPreferences = useSelector((state: AppState) => state && state.userPreferences);

    // Local state
    const [submissionAttempted, setSubmissionAttempted] = useState(false);

    const initialUserValue = Object.assign({}, user, {password: null});
    const [userToUpdate, setUserToUpdate] = useState(initialUserValue);

    // We clone the initial value otherwise userPreferences.SUBJECT_INTEREST becomes the local state subjectInterests which gets updated by setSubjectInterests(...)
    const initialSubjectInterestsValue = (userPreferences && userPreferences.SUBJECT_INTEREST) ? Object.assign({}, userPreferences.SUBJECT_INTEREST) : {};
    const [subjectInterests, setSubjectInterests] = useState(initialSubjectInterestsValue);

    const initialEmailPreferencesValue = (userPreferences && userPreferences.EMAIL_PREFERENCE) ? Object.assign({}, userPreferences.EMAIL_PREFERENCE): {};
    const [emailPreferences, setEmailPreferences] = useState<UserEmailPreferences>(initialEmailPreferencesValue);

    const userPreferencesToUpdate = {
        EMAIL_PREFERENCE: emailPreferences,
        SUBJECT_INTEREST: subjectInterests
    };

    // Form submission
    function formSubmission(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSubmissionAttempted(true);

        if (user && isLoggedIn(user) && allRequiredInformationIsPresent(userToUpdate, userPreferencesToUpdate)) {
            dispatch(updateCurrentUser(userToUpdate, userPreferencesToUpdate, null, user));
            dispatch(closeActiveModal());
        }
    }

    const allUserFieldsAreValid = validateUserSchool(initialUserValue) && validateUserGender(initialUserValue) && validateUserSchool(initialUserValue);

    return <RS.Form onSubmit={formSubmission}>
        {!allUserFieldsAreValid && <RS.CardBody className="py-0">
            <div className="text-muted small pb-2">
                Providing a few extra pieces of information helps us understand the usage of Isaac Computer Science across the UK and beyond.
                Full details on how we use your personal information can be found in our <a target="_" href="/privacy">Privacy Policy</a>.
            </div>
            <div className="text-right text-muted required-before">
                Required
            </div>

            <RS.Row className="d-flex flex-wrap my-2">
                {!(validateUserSchool(initialUserValue) && validateUserGender(initialUserValue)) && <RS.Col>
                    {!validateUserGender(initialUserValue) && <div>
                        <GenderInput
                            userToUpdate={userToUpdate} setUserToUpdate={setUserToUpdate}
                            submissionAttempted={submissionAttempted} idPrefix="modal"
                        />
                    </div>}
                    {!validateSubjectInterests(initialSubjectInterestsValue) && <div>
                        <StudyingCsInput
                            subjectInterests={subjectInterests} setSubjectInterests={setSubjectInterests}
                            submissionAttempted={submissionAttempted} idPrefix="modal-"
                        />
                    </div>}
                </RS.Col>}
                {!validateUserSchool(initialUserValue) && <RS.Col>
                    <SchoolInput
                        userToUpdate={userToUpdate} setUserToUpdate={setUserToUpdate}
                        submissionAttempted={submissionAttempted} idPrefix="modal"
                    />
                </RS.Col>}
            </RS.Row>
        </RS.CardBody>}

        {!allUserFieldsAreValid && !validateEmailPreferences(initialEmailPreferencesValue) && <hr className="text-center" />}

        {!validateEmailPreferences(initialEmailPreferencesValue) && <div>
            <UserEmailPreference
                emailPreferences={emailPreferences} setEmailPreferences={setEmailPreferences}
                submissionAttempted={submissionAttempted} idPrefix="modal-"
            />
        </div>}

        {submissionAttempted && !allRequiredInformationIsPresent(userToUpdate, userPreferencesToUpdate) && <div>
            <h4 role="alert" className="text-danger text-center mb-4">
                Required information in this form is not set
            </h4>
        </div>}

        <RS.Row className="text-center border-top p-3 p-sm-4">
            <RS.Col md={{size: 6, offset: 3}}>
                <RS.Input value={isMobile() ? "Update" : "Update account"} type="submit" className="btn btn-secondary border-0 px-0 px-md-2 my-1" />
            </RS.Col>
        </RS.Row>
    </RS.Form>
};

export const requiredAccountInformationModal = {
    title: "Required account information",
    body: <RequiredAccountInfoBody />,
};
