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
    validateExamBoard,
    validateSubjectInterests,
    validateUserGender,
    validateUserSchool
} from "../../../services/validation";
import {isMobile} from "../../../services/device";
import {isLoggedIn} from "../../../services/user";
import {SchoolInput} from "../inputs/SchoolInput";
import {StudyingCsInput} from "../inputs/StudyingCsInput";
import {GenderInput} from "../inputs/GenderInput";
import {EXAM_BOARD} from "../../../services/constants";
import {SITE, SITE_SUBJECT} from "../../../services/siteConstants";
import {userOrNull} from "../../../state/selectors";

const RequiredAccountInfoBody = () => {
    // Redux state
    const dispatch = useDispatch();
    const user = useSelector(userOrNull);
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

    const allUserFieldsAreValid = SITE_SUBJECT !== SITE.CS ||
        validateUserSchool(initialUserValue) && validateUserGender(initialUserValue) &&
        validateExamBoard(initialUserValue) && validateSubjectInterests(initialSubjectInterestsValue);

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
                {!(validateUserGender(initialUserValue) && validateExamBoard(initialUserValue)) && <RS.Col>
                    {!validateUserGender(initialUserValue) && <div>
                        <GenderInput
                            userToUpdate={userToUpdate} setUserToUpdate={setUserToUpdate}
                            submissionAttempted={submissionAttempted} idPrefix="modal"
                            required
                        />
                    </div>}
                    {!validateExamBoard(initialUserValue) && <div>
                        <RS.FormGroup>
                            <RS.Label className="d-inline-block pr-2 form-required" htmlFor="exam-board-select">
                                Exam board
                            </RS.Label>
                            <RS.Input
                                type="select" name="select" id="exam-board-select"
                                value={userToUpdate.examBoard} invalid={submissionAttempted && !validateExamBoard(userToUpdate)}
                                onChange={event => setUserToUpdate(Object.assign({}, userToUpdate, {examBoard: event.target.value}))}
                            >
                                <option value={undefined} />
                                <option value={EXAM_BOARD.AQA}>{EXAM_BOARD.AQA}</option>
                                <option value={EXAM_BOARD.OCR}>{EXAM_BOARD.OCR}</option>
                                <option value={EXAM_BOARD.OTHER}>Other</option>
                            </RS.Input>
                        </RS.FormGroup>
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
            {!validateSubjectInterests(initialSubjectInterestsValue) && <RS.Row className="d-flex flex-wrap my-1">
                <RS.Col>
                    <div>
                        <StudyingCsInput
                            subjectInterests={subjectInterests} setSubjectInterests={setSubjectInterests}
                            submissionAttempted={submissionAttempted} idPrefix="modal-"
                        />
                    </div>
                </RS.Col>
            </RS.Row>}
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

        {submissionAttempted && !allRequiredInformationIsPresent(userToUpdate, userPreferencesToUpdate) && <div>
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
