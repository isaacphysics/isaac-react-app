import React, {useCallback, useEffect, useMemo, useState} from "react";
import {Button, Col, Form, Row} from "reactstrap";
import {
    below,
    EXAM_BOARD,
    isAda,
    isLoggedIn,
    isPhy,
    isStudent,
    isTeacherOrAbove,
    isTutorOrAbove,
    SITE_TITLE,
    siteSpecific,
    STAGE,
    useDeviceSize,
    validateCountryCode,
    validateUserContexts,
    validateUserSchool
} from "../../../services";
import {UserContextAccountInput} from "../inputs/UserContextAccountInput";
import {SchoolInput} from "../inputs/SchoolInput";
import {BooleanNotation, DisplaySettings, ValidationUser} from "../../../../IsaacAppTypes";
import {useDispatch, useSelector} from "react-redux";
import {closeActiveModal, logAction, selectors, updateCurrentUser} from "../../../state";
import {Immutable} from "immer";
import { CountryInput } from "../inputs/CountryInput";
import { UserContext } from "../../../../IsaacApiTypes";
import { RevisionModeInput } from "../panels/UserBetaFeatures";
import classNames from "classnames";

const adaModalText = (isTeacher: boolean) => {
    return {
        intro: <span>We use this information to show you relevant content. We recommend checking your details occasionally and updating them if anything has changed.</span>,
        connections: <span>At the start of the new school year, you might also want to review your {isTeacher ? "student" : "teacher"} connections.</span>,
        privacyPolicy: <span>Updating this information helps us continue to show you relevant content. Full details on how we use your personal information can be found in our <a target={"_blank"} rel={"noopener"} href={"/privacy"}>privacy policy</a>.</span>
    };
};

const buildModalText = (buildConnectionsLink: (text: string) => React.ReactNode, buildPrivacyPolicyLink: (text: string) => React.ReactNode) => ({
    teacher: {
        intro: <span>So that {SITE_TITLE} can continue to show you relevant content, we ask that you review the qualification and school details associated with your account at the beginning of each academic year.</span>,
        connections: <span>If you have changed school or have a different class group, you might also want to {buildConnectionsLink("review your student and group connections")}.</span>,
        privacyPolicy: <span>Updating this information helps us continue to show you content that is relevant to you. Full details on how we use your personal information can be found in our {buildPrivacyPolicyLink("privacy policy")}.</span>
    },
    tutor: {
        intro: <span>So that {SITE_TITLE} can continue to show you relevant content, we ask that you review the details associated with your account at the beginning of each academic year.</span>,
        connections: <span>If you have recently changed which students you tutor, might also want to {buildConnectionsLink("review your student and group connections")}.</span>,
        privacyPolicy: <span>Updating this information helps us continue to show you content that is relevant to you. Full details on how we use your personal information can be found in our {buildPrivacyPolicyLink("privacy policy")}.</span>
    },
    student: {
        intro: <span>So that {SITE_TITLE} can continue to show you relevant content, we ask that you review the qualification and school details associated with your account at the beginning of each academic year.</span>,
        connections: <span>If you have changed school or have a different teacher, you might also want to {buildConnectionsLink("review your teacher connections")}.</span>,
        privacyPolicy: <span>Updating this information helps us continue to show you relevant content throughout your educational journey. Full details on how we use your personal information can be found in our {buildPrivacyPolicyLink("privacy policy")}.</span>
    }
});

const UserContextReconfirmationModalBody = () => {
    const dispatch = useDispatch();
    const user = useSelector(selectors.user.orNull);
    const userPreferences = useSelector(selectors.user.preferences);
    const deviceSize = useDeviceSize();

    const [userToUpdate, setUserToUpdate] = useState<Immutable<ValidationUser>>({...user, password: null});
    const [booleanNotation, setBooleanNotation] = useState<BooleanNotation | undefined>();
    const [displaySettings, setDisplaySettings] = useState<DisplaySettings>({...userPreferences?.DISPLAY_SETTING});
    const [submissionAttempted, setSubmissionAttempted] = useState(false);

    const [userContexts, setUserContexts] = useState<UserContext[]>([{stage: STAGE.ALL, examBoard: EXAM_BOARD.ALL}]);

    useEffect(() => {
        // on first load `user` is undefined and so userToUpdate is incomplete, so wait for the `user` selector to return a value then update
        if (user?.loggedIn && !userToUpdate?.id) {
            setUserToUpdate({...user, password: null});
            setUserContexts((user.registeredContexts ?? [{stage: STAGE.ALL, examBoard: EXAM_BOARD.ALL}]) as UserContext[]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    const allFieldsAreValid = useMemo(() =>
        validateUserContexts(userContexts) && (isPhy || validateUserSchool(userToUpdate))
    , [userContexts, userToUpdate]);

    const logReviewTeacherConnections = () =>
        dispatch(logAction({
            type: "REVIEW_TEACHER_CONNECTIONS"
        }));

    const modalText = useMemo(() => siteSpecific(
        // phy
        buildModalText(
            function buildConnectionsLink(text: string) {
                return <a target={"_blank"} onClick={logReviewTeacherConnections} rel={"noopener noreferrer"}
                        href={"/account#teacherconnections"}>
                    {text}
                    <span className={"visually-hidden"}> (opens in new tab) </span>
                </a>;
            },

            function buildPrivacyPolicyLink(text: string) {
                return <a target={"_blank"} rel={"noopener noreferrer"} href={"/privacy"}>
                    {text}
                    <span className={"visually-hidden"}> (opens in new tab) </span>
                </a>;
        })[isTutorOrAbove(user) ? (isTeacherOrAbove(user) ? "teacher" : "tutor") : "student"],

        // ada
        adaModalText(isTeacherOrAbove(user))
    ), [user]);

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
        {isPhy && <div className="text-end text-muted required-before">
            Required
        </div>}
        <Col>
            {isAda &&
                <Row className={siteSpecific("pb-1", "pb-3")}>
                    <CountryInput
                        className={below["md"](deviceSize) ? "w-100" : "w-75"}
                        userToUpdate={userToUpdate}
                        setUserToUpdate={setUserToUpdate}
                        countryCodeValid={validateCountryCode(userToUpdate.countryCode)}
                        submissionAttempted={submissionAttempted}
                        required={true}
                    />
                </Row>
            }
            <Row className={siteSpecific("py-1", "pt-2")}>
                <SchoolInput
                    className={below["md"](deviceSize) ? "w-100" : "w-75"}
                    userToUpdate={userToUpdate} 
                    setUserToUpdate={setUserToUpdate}
                    submissionAttempted={submissionAttempted} 
                    idPrefix="modal"
                    required={isAda && !isStudent(user)}
                />
            </Row>
            <Row className={classNames({"pt-3": isAda})}>
                <UserContextAccountInput
                    className={below["md"](deviceSize) ? "w-100" : "w-75"}
                    user={userToUpdate} 
                    userContexts={userContexts} 
                    setUserContexts={setUserContexts}
                    displaySettings={displaySettings} 
                    setDisplaySettings={setDisplaySettings}
                    setBooleanNotation={setBooleanNotation} 
                    submissionAttempted={submissionAttempted}
                    required={false}
                />
            </Row>
            <Row className={classNames({"py-2" : isPhy})}>
                <RevisionModeInput displaySettings={displaySettings} setDisplaySettings={setDisplaySettings}/>
            </Row>
        </Col>
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
};

export const userContextReconfirmationModal = {
    title: "Review your details",
    body: <UserContextReconfirmationModalBody />,
};
