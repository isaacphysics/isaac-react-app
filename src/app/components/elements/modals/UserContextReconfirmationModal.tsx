import React, {useCallback, useMemo, useState} from "react";
import {Button, Col, Form, Row} from "reactstrap";
import {
    isDefined,
    isLoggedIn,
    isTeacherOrAbove,
    isTutor,
    isTutorOrAbove,
    validateUserContexts,
    validateUserSchool
} from "../../../services";
import {UserContextAccountInput} from "../inputs/UserContextAccountInput";
import {SchoolInput} from "../inputs/SchoolInput";
import {BooleanNotation, DisplaySettings, ValidationUser} from "../../../../IsaacAppTypes";
import {useDispatch, useSelector} from "react-redux";
import {closeActiveModal, logAction, selectors, updateCurrentUser} from "../../../state";
import {Immutable} from "immer";

const buildModalText = (buildConnectionsLink: (text: string) => React.ReactNode) => ({
    teacher: {
        intro: <span>To ensure you see the correct content, please make sure the details below are correct. This also helps us understand the usage of Isaac Computer Science.</span>,
        connections: <span>If you have changed school or have a different class group, you might also want to {buildConnectionsLink("review your student and group connections.")}</span>
    },
    tutor: {
        intro: <span>To ensure you see the correct content, please make sure the details below are correct. This also helps us understand the usage of Isaac Computer Science.</span>,
        connections: <span>If you have recently changed which students you tutor, might also want to {buildConnectionsLink("review your student and group connections.")}</span>,
    },
    student: {
        intro: <span>To ensure you see the correct content, please make sure the details below are correct. This also helps us understand the usage of Isaac Computer Science.</span>,
        connections: <span>If you have changed school or have a different teacher, you might also want to {buildConnectionsLink("review your teacher connections.")}</span>,
    }
});

const UserContextReconfirmationModalBody = () => {
    const dispatch = useDispatch();
    const user = useSelector(selectors.user.orNull);
    const userPreferences = useSelector(selectors.user.preferences);

    const [userToUpdate, setUserToUpdate] = useState<Immutable<ValidationUser>>({...user, password: null});
    const [booleanNotation, setBooleanNotation] = useState<BooleanNotation | undefined>();
    const [displaySettings, setDisplaySettings] = useState<DisplaySettings>({...userPreferences?.DISPLAY_SETTING});
    const [submissionAttempted, setSubmissionAttempted] = useState(false);

    const initialUserContexts = useMemo(() =>
        user?.loggedIn && isDefined(user.registeredContexts) ? [...user.registeredContexts] : []
    , [user]);
    const [userContexts, setUserContexts] = useState(initialUserContexts.length ? initialUserContexts : [{}]);

    const allFieldsAreValid = useMemo(() =>
        validateUserContexts(userContexts) && validateUserSchool(userToUpdate)
    , [userContexts, userToUpdate]);

    const logReviewTeacherConnections = () =>
        dispatch(logAction({
            type: "REVIEW_TEACHER_CONNECTIONS"
        }));

    const modalText = useMemo(() => buildModalText(
        function buildConnectionsLink(text: string) {
            return <a className="d-inline" target={"_blank"} onClick={logReviewTeacherConnections} rel={"noopener noreferrer"}
                      href={"/account#teacherconnections"}>
                {text}
                <span className={"sr-only"}> (opens in new tab) </span>
            </a>;
        })[isTutorOrAbove(user) ? (isTeacherOrAbove(user) ? "teacher" : "tutor") : "student"]
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
        <Row className="my-2">
            <Col xs={12} md={12} lg={9}>
            <SchoolInput
                    userToUpdate={userToUpdate} setUserToUpdate={setUserToUpdate}
                    submissionAttempted={submissionAttempted} idPrefix="modal"
                    required={!isTutor(user)}
                />
            </Col>
            <Col xs={12} md={6}>
            </Col>
        </Row>
        <Row>
        <Col> 
            <UserContextAccountInput
                    userContexts={userContexts} setUserContexts={setUserContexts}
                    displaySettings={displaySettings} setDisplaySettings={setDisplaySettings}
                    setBooleanNotation={setBooleanNotation} submissionAttempted={submissionAttempted}
                 />
                 </Col>
                 </Row>
    

        {submissionAttempted && !allFieldsAreValid && <div>
            <h4 role="alert" className="text-danger text-center mb-4">
                Not all required fields have been correctly filled.
            </h4>
        </div>}

        <div className="text-center pb-3 pt-1">
            <Button type={"submit"} color={"secondary"} className={"border-0 my-1 w-lg-50 w-100"}>
                These details look good
            </Button>
        </div>
    </Form>;
}

export const userContextReconfirmationModal = {
    title: "Are your details up to date?",
    body: <UserContextReconfirmationModalBody />,
}
