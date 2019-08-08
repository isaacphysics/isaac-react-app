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
import {SchoolInput} from "./SchoolInput";

const RequiredAccountInfoBody = () => {
    // Redux state
    const dispatch = useDispatch();
    const user = useSelector((state: AppState) => state && state.user);
    const userPreferences = useSelector((state: AppState) => state && state.userPreferences);

    // Local state
    const [submissionAttempted, setSubmissionAttempted] = useState(false);

    const [userToUpdate, setUserToUpdate] = useState(Object.assign({}, user, {password: null}));

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

        if (user && isLoggedIn(user) && allRequiredInformationIsPresent(userToUpdate, updatedUserPreferences)) {
            dispatch(updateCurrentUser(userToUpdate, updatedUserPreferences, null, user));
            dispatch(closeActiveModal());
        }
    }

    return <RS.Form onSubmit={formSubmission}>
        <RS.CardBody className="py-0">
            Please answer a few quick questions to help us with our reporting to the Department for Education.

            <RS.Row>
                <RS.Col>
                    <SchoolInput
                        userToUpdate={userToUpdate} setUserToUpdate={setUserToUpdate}
                        attemptedAccountUpdate={submissionAttempted} className="mt-4"
                    />
                </RS.Col>

                {!validateSubjectInterest(initialSubjectPreferenceValue) && <RS.Col>
                    <div className="d-flex mt-4">
                        <RS.Label htmlFor="subjectInterestModal-t" className="form-required">
                            Are you studying or preparing for Computer Science A level?
                        </RS.Label>
                        <TrueFalseRadioInput
                            id="subjectInterestModal" submissionAttempted={submissionAttempted}
                            stateObject={subjectInterest} propertyName="CS_ALEVEL" setStateFunction={setSubjectInterest}
                        />
                    </div>
                </RS.Col>}
            </RS.Row>
        </RS.CardBody>

        {!validateEmailPreferences(initialEmailPreferencesValue) &&
            <UserEmailPreference
                emailPreferences={emailPreferences} setEmailPreferences={setEmailPreferences}
                idPrefix="modal-" submissionAttempted={submissionAttempted}
            />
        }

        {submissionAttempted && !allRequiredInformationIsPresent(userToUpdate, updatedUserPreferences) &&
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
    title: "Account information",
    body: <RequiredAccountInfoBody />,
};
