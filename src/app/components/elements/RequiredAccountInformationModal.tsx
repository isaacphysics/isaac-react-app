import {closeActiveModal, updateCurrentUser} from "../../state/actions";
import React, {useState} from "react";
import * as RS from "reactstrap";
import {UserEmailPreference} from "./UserEmailPreferences";
import {SubjectInterest, UserEmailPreferences} from "../../../IsaacAppTypes";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../../state/reducers";
import {
    allRequiredInformationIsPresent,
    validateEmailPreferences,
    validateSubjectInterest, validateUserSchool
} from "../../services/validation";
import {isMobile} from "../../services/device";
import {isLoggedIn} from "../../services/user";
import {TrueFalseRadioInput} from "./TrueFalseRadioInput";
import {SchoolInput} from "./SchoolInput";
import {DobInput} from "./DobInput";
import {Row} from "reactstrap";
import {Col} from "reactstrap";
import {CardBody} from "reactstrap";
import {StudyingCsInput} from "./StudyingCsInput";

const RequiredAccountInfoBody = () => {
    // Redux state
    const dispatch = useDispatch();
    const user = useSelector((state: AppState) => state && state.user);
    const userPreferences = useSelector((state: AppState) => state && state.userPreferences);

    // Local state
    const [submissionAttempted, setSubmissionAttempted] = useState(false);

    const initialUserValue = Object.assign({}, user, {password: null});
    const [userToUpdate, setUserToUpdate] = useState(initialUserValue);

    const initialEmailPreferencesValue = (userPreferences && userPreferences.EMAIL_PREFERENCE) ? userPreferences.EMAIL_PREFERENCE : {};
    const [emailPreferences, setEmailPreferences] = useState<UserEmailPreferences>(initialEmailPreferencesValue);

    const initialSubjectPreferenceValue = (userPreferences && userPreferences.SUBJECT_INTEREST) ? userPreferences.SUBJECT_INTEREST : {};
    const [subjectInterest, setSubjectInterest] = useState<SubjectInterest>(initialSubjectPreferenceValue);

    const userPreferencesToUpdate = {
        EMAIL_PREFERENCE: emailPreferences,
        SUBJECT_INTEREST: subjectInterest
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

    return <RS.Form onSubmit={formSubmission}>
        <RS.CardBody className="py-0">
            Providing a few extra pieces of information will help us, and the Department for Education,
            judge the efficacy of this platform.

            <div className="pb-0 text-right text-muted required-before">
                Required
            </div>

            <RS.Row className="d-flex flex-wrap mt-2 mb-2">
                {!validateUserSchool(initialUserValue) && <RS.Col>
                    <SchoolInput
                        userToUpdate={userToUpdate} setUserToUpdate={setUserToUpdate}
                        submissionAttempted={submissionAttempted} idPrefix="modal"
                    />
                </RS.Col>}
                {!validateSubjectInterest(initialSubjectPreferenceValue) && <RS.Col className="mt-4">
                    <StudyingCsInput
                        subjectInterest={subjectInterest} setSubjectInterest={setSubjectInterest}
                        submissionAttempted={submissionAttempted} idPrefix="modal-"
                    />
                </RS.Col>}
            </RS.Row>
        </RS.CardBody>

        {!validateEmailPreferences(initialEmailPreferencesValue) &&
            <UserEmailPreference
                emailPreferences={emailPreferences} setEmailPreferences={setEmailPreferences}
                submissionAttempted={submissionAttempted} idPrefix="modal-"
            />
        }

        {submissionAttempted && !allRequiredInformationIsPresent(userToUpdate, userPreferencesToUpdate) &&
            <h4 role="alert" className="text-danger text-center mb-4">
                Some required information is not set
            </h4>
        }

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
