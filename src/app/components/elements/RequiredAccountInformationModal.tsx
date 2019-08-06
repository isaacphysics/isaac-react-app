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
    validateSubjectInterest
} from "../../services/validation";
import {isMobile} from "../../services/device";
import {isLoggedIn} from "../../services/user";
import {TrueFalseRadioInput} from "./TrueFalseRadioInput";

const RequiredAccountInfoBody = () => {
    // Redux state
    const dispatch = useDispatch();
    const user = useSelector((state: AppState) => state && state.user);
    const userPreferences = useSelector((state: AppState) => state && state.userPreferences);

    // Local state
    const [submissionAttempted, setSubmissionAttempted] = useState(false);

    const initialEmailPreferencesValue = (userPreferences && userPreferences.EMAIL_PREFERENCE) ? userPreferences.EMAIL_PREFERENCE : {};
    const [emailPreferences, setEmailPreferences] = useState<UserEmailPreferences>(initialEmailPreferencesValue);

    const initialSubjectPreferenceValue = (userPreferences && userPreferences.SUBJECT_INTEREST) ? userPreferences.SUBJECT_INTEREST : {};
    const [subjectInterest, setSubjectInterest] = useState<SubjectInterest>(initialSubjectPreferenceValue);

    const updatedUserPreferences = {
        EMAIL_PREFERENCE: emailPreferences,
        SUBJECT_INTEREST: subjectInterest
    };

    // Form submission
    function formSubmission(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setSubmissionAttempted(true);

        if (user && isLoggedIn(user) && allRequiredInformationIsPresent(user, updatedUserPreferences)) {
            const password = null;
            dispatch(updateCurrentUser(Object.assign(user, {password}), updatedUserPreferences, password, user));
            dispatch(closeActiveModal());
        }
    }

    return <RS.Form onSubmit={formSubmission}>
        <RS.CardBody className="py-0">
            Please answer a few quick questions to help us with our reporting to the Department for Education.

            {!validateSubjectInterest(initialSubjectPreferenceValue) && <div className="d-flex justify-content-between mt-4">
                <RS.Label htmlFor="subjectInterestModal-t">
                    Are you studying or preparing for Computer Science A level?
                </RS.Label>
                <TrueFalseRadioInput
                    id="subjectInterestModal" submissionAttempted={submissionAttempted}
                    stateObject={subjectInterest} propertyName="CS_ALEVEL" setStateFunction={setSubjectInterest}
                />
            </div>}
        </RS.CardBody>

        {!validateEmailPreferences(initialEmailPreferencesValue) &&
            <UserEmailPreference
                emailPreferences={emailPreferences} setEmailPreferences={setEmailPreferences}
                idPrefix="modal-" submissionAttempted={submissionAttempted}
            />
        }

        {submissionAttempted && !allRequiredInformationIsPresent(user, updatedUserPreferences) &&
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
