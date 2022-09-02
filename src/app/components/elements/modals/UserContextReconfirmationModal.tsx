import React, {useCallback, useMemo, useState} from "react";
import {Button, Col, Form, Row} from "reactstrap";
import {validateUserContexts, validateUserSchool} from "../../../services/validation";
import {UserContextAccountInput} from "../inputs/UserContextAccountInput";
import {SchoolInput} from "../inputs/SchoolInput";
import {isDefined} from "../../../services/miscUtils";
import {BooleanNotation, DisplaySettings} from "../../../../IsaacAppTypes";
import {useDispatch, useSelector} from "react-redux";
import {selectors} from "../../../state/selectors";
import {isLoggedIn, isTeacher} from "../../../services/user";
import {closeActiveModal, logAction, updateCurrentUser} from "../../../state/actions";
import {isCS, isPhy, SITE_SUBJECT_TITLE, siteSpecific} from "../../../services/siteConstants";

const buildModalText = (buildConnectionsLink: (text: string) => React.ReactNode, buildPrivacyPolicyLink: (text: string) => React.ReactNode) => ({
    teacher: {
        intro: <span>So that Isaac {SITE_SUBJECT_TITLE} can continue to show you relevant content, we ask that you review the qualification and school details associated with your account at the beginning of each academic year.</span>,
        connections: <span>If you have changed school or have a different class group, you might also want to {buildConnectionsLink("review your student and group connections")}.</span>,
        privacyPolicy: <span>Updating this information helps us continue to show you content that is relevant to you. Full details on how we use your personal information can be found in our {buildPrivacyPolicyLink("privacy policy")}.</span>
    },
    student: {
        intro: <span>So that Isaac {SITE_SUBJECT_TITLE} can continue to show you relevant content, we ask that you review the qualification and school details associated with your account at the beginning of each academic year.</span>,
        connections: <span>If you have changed school or have a different teacher, you might also want to {buildConnectionsLink("review your teacher connections")}.</span>,
        privacyPolicy: <span>Updating this information helps us continue to show you relevant content throughout your educational journey. Full details on how we use your personal information can be found in our {buildPrivacyPolicyLink("privacy policy")}.</span>
    }
});

const UserContextReconfimationModalBody = () => {
    const dispatch = useDispatch();
    const user = useSelector(selectors.user.orNull);
    const userPreferences = useSelector(selectors.user.preferences);

    const [userToUpdate, setUserToUpdate] = useState({...user, password: null});
    const [booleanNotation, setBooleanNotation] = useState<BooleanNotation | undefined>();
    const [displaySettings, setDisplaySettings] = useState<DisplaySettings>({...userPreferences?.DISPLAY_SETTING});
    const [submissionAttempted, setSubmissionAttempted] = useState(false);

    const initialUserContexts = useMemo(() =>
        user?.loggedIn && isDefined(user.registeredContexts) ? [...user.registeredContexts] : []
    , [user]);
    const [userContexts, setUserContexts] = useState(initialUserContexts.length ? initialUserContexts : [{}]);

    const allFieldsAreValid = useMemo(() =>
        validateUserContexts(userContexts) && (isPhy || validateUserSchool(userToUpdate))
    , [userContexts, userToUpdate]);

    const logReviewTeacherConnections = () =>
        dispatch(logAction({
            type: "REVIEW_TEACHER_CONNECTIONS"
        }));

    const modalText = useMemo(() => buildModalText(
        function buildConnectionsLink(text: string) {
            return <a target={"_blank"} onClick={logReviewTeacherConnections} rel={"noopener"}
                      href={"/account#teacherconnections"}>
                {text}
                <span className={"sr-only"}> (opens in new tab) </span>
            </a>;
        },
        function buildPrivacyPolicyLink(text: string) {
            return <a target={"_blank"} rel={"noopener"} href={"/privacy"}>
                {text}
                <span className={"sr-only"}> (opens in new tab) </span>
            </a>;
        })[isTeacher(user) ? "teacher" : "student"]
    , [user]);

    // Form submission
    const formSubmission = useCallback((event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setSubmissionAttempted(true);
        if (user && isLoggedIn(user) && allFieldsAreValid) {
            const userPreferencesToUpdate = {
                BOOLEAN_NOTATION: booleanNotation,
                DISPLAY_SETTING: displaySettings
            };
            dispatch(updateCurrentUser(userToUpdate, userPreferencesToUpdate, userContexts, null, user, false));
            dispatch(closeActiveModal());
        }
    }, [dispatch, setSubmissionAttempted, userToUpdate, allFieldsAreValid, userContexts, booleanNotation, displaySettings, user]);

    return <Form onSubmit={formSubmission} className={"mb-2"}>
        <p>{modalText.intro}</p>
        <p>{modalText.connections}</p>
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
                    required={isCS}
                />
            </Col>
        </Row>
        <div className="text-muted small pb-2">{modalText.privacyPolicy}</div>

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
