import React, {useCallback, useMemo, useState} from "react";
import {Button, Col, Form, Row} from "reactstrap";
import {validateUserContexts, validateUserSchool} from "../../../services/validation";
import {UserContextAccountInput} from "../inputs/UserContextAccountInput";
import {SchoolInput} from "../inputs/SchoolInput";
import {isDefined} from "../../../services/miscUtils";
import {BooleanNotation, DisplaySettings} from "../../../../IsaacAppTypes";
import {useDispatch, useSelector} from "react-redux";
import {selectors} from "../../../state/selectors";
import {AppState} from "../../../state/reducers";
import {isLoggedIn} from "../../../services/user";
import {closeActiveModal, logAction, updateCurrentUser} from "../../../state/actions";
import {isCS, SITE_SUBJECT_TITLE, siteSpecific} from "../../../services/siteConstants";

const UserContextReconfimationModalBody = () => {
    const dispatch = useDispatch();
    const user = useSelector(selectors.user.orNull);
    const userPreferences = useSelector((state: AppState) => state?.userPreferences);

    const [submissionAttempted, setSubmissionAttempted] = useState(false);

    const initialUserValue = useMemo(() => ({...user, password: null}), [user]);
    const [userToUpdate, setUserToUpdate] = useState(initialUserValue);

    const initialUserContexts = useMemo(() =>
        user?.loggedIn && isDefined(user.registeredContexts) ? [...user.registeredContexts] : []
    , [user]);
    const [userContexts, setUserContexts] = useState(initialUserContexts.length ? initialUserContexts : [{}]);

    const [booleanNotation, setBooleanNotation] = useState<BooleanNotation | undefined>();
    const [displaySettings, setDisplaySettings] = useState<DisplaySettings>({...userPreferences?.DISPLAY_SETTING});

    const allFieldsAreValid = useMemo(() =>
        validateUserContexts(userContexts) && validateUserSchool(userToUpdate)
    , [userContexts, userToUpdate]);

    const userPreferencesToUpdate = useMemo(() => ({
        BOOLEAN_NOTATION: booleanNotation, DISPLAY_SETTING: displaySettings
    }), [booleanNotation, displaySettings]);

    const logReviewTeacherConnections = useCallback(() => {
        dispatch(logAction({
            type: "REVIEW_TEACHER_CONNECTIONS"
        }));
    }, []);

    // Form submission
    const formSubmission = useCallback((event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmissionAttempted(true);
        if (user && isLoggedIn(user) && allFieldsAreValid) {
            dispatch(updateCurrentUser(userToUpdate, userPreferencesToUpdate, userContexts, null, user, false));
            dispatch(closeActiveModal());
        }
    }, [userToUpdate, userContexts, userPreferencesToUpdate, user]);

    return <Form onSubmit={formSubmission} className={"mb-2"}>
        <p>
            So that Isaac {SITE_SUBJECT_TITLE} can continue to show you relevant content, we ask that you review your
            stage{isCS && ", exam board"} and school account details at the beginning of each academic year.
        </p>
        <p>
            You might also want to <a target={"_blank"} onClick={logReviewTeacherConnections} rel="noopener" href={"/account#teacherconnections"}>review who has access to your data <span className={"sr-only"}>(opens in new tab)</span></a> if you've changed school or teachers.
        </p>
        <div className="text-right text-muted required-before">
            Required
        </div>
        <Row className="my-2">
            <Col xs={12} md={siteSpecific(6, 12)} lg={6}>
                 <UserContextAccountInput
                    user={userToUpdate} userContexts={userContexts} setUserContexts={setUserContexts}
                    displaySettings={displaySettings} setDisplaySettings={setDisplaySettings}
                    setBooleanNotation={setBooleanNotation} submissionAttempted={submissionAttempted}
                 />
            </Col>
            <Col xs={12} md={6}>
                <SchoolInput
                    userToUpdate={userToUpdate} setUserToUpdate={setUserToUpdate}
                    submissionAttempted={submissionAttempted} idPrefix="modal"
                    required
                />
            </Col>
        </Row>
        <div className="text-muted small pb-2">
            Updating this information helps us continue to show you relevant content throughout your educational journey.
            Full details on how we use your personal information can be found in our <a target="_blank" href="/privacy">Privacy Policy</a>.
        </div>

        {submissionAttempted && !allFieldsAreValid && <div>
            <h4 role="alert" className="text-danger text-center mb-4">
                Not all required fields have been correctly filled.
            </h4>
        </div>}

        <div className="text-center pb-3 pt-1">
            <Button type={"submit"} color={"secondary"} className={"border-0 my-1 w-lg-50 w-100"}>
                Update details
            </Button>
        </div>
    </Form>;
}

export const userContextReconfimationModal = {
    title: "Please review your details",
    body: <UserContextReconfimationModalBody />,
}
