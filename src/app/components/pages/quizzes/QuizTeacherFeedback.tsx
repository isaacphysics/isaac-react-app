import React, {useContext, useState} from "react";
import {
    getRTKQueryErrorMessage,
    useGetQuizAssignmentWithFeedbackQuery,
    useUpdateQuizAssignmentMutation
} from "../../../state";
import {Link, useParams} from "react-router-dom";
import {TitleAndBreadcrumb} from "../../elements/TitleAndBreadcrumb";
import {
    AssignmentProgressDTO,
    ContentBaseDTO,
    IsaacQuizDTO,
    IsaacQuizSectionDTO,
    QuizAssignmentDTO,
    QuizFeedbackMode,
    RegisteredUserDTO,
    UserSummaryDTO
} from "../../../../IsaacApiTypes";
import {
    getQuizAssignmentCSVDownloadLink,
    isAuthorisedFullAccess,
    isPhy,
    isQuestion,
    nthHourOf,
    PATHS,
    siteSpecific,
    TODAY,
    useAssignmentProgressAccessibilitySettings
} from "../../../services";
import {
    AssignmentProgressPageSettingsContext,
    AuthorisedAssignmentProgress,
    QuizFeedbackModes
} from "../../../../IsaacAppTypes";
import {teacherQuizzesCrumbs} from "../../elements/quiz/QuizContentsComponent";
import {formatDate} from "../../elements/DateString";
import {ResultsTable} from "../../elements/quiz/QuizProgressCommon";
import {
    Alert,
    Button,
    Card,
    CardBody,
    Container,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Label,
    UncontrolledButtonDropdown
} from "reactstrap";
import {FetchBaseQueryError} from "@reduxjs/toolkit/query";
import {SerializedError} from "@reduxjs/toolkit";
import {ShowLoadingQuery} from "../../handlers/ShowLoadingQuery";
import {markClassesInternal, ResultsTableHeader} from "../AssignmentProgressIndividual";
import classNames from "classnames";
import {Spacer} from "../../elements/Spacer";

const pageHelp = <span>
    See the feedback for your students for this test assignment.
</span>;

const feedbackNames: Record<QuizFeedbackMode, string> = {
    NONE: "No feedback for students",
    OVERALL_MARK: "Overall mark only",
    SECTION_MARKS: "Section-by-section mark breakdown",
    DETAILED_FEEDBACK: "Detailed feedback on each question",
};

export const QuizTeacherFeedback = ({user}: {user: RegisteredUserDTO}) => {
    const {quizAssignmentId} = useParams<{quizAssignmentId: string}>();
    const pageSettings = useAssignmentProgressAccessibilitySettings({user});

    const numericQuizAssignmentId = parseInt(quizAssignmentId, 10);
    const quizAssignmentQuery = useGetQuizAssignmentWithFeedbackQuery(numericQuizAssignmentId);
    const {data: quizAssignment} = quizAssignmentQuery;
    const [updateQuiz, {isLoading: isUpdatingQuiz}] = useUpdateQuizAssignmentMutation();

    const setFeedbackMode = (mode: QuizFeedbackMode) => {
        if (mode !== quizAssignment?.quizFeedbackMode) {
            updateQuiz({quizAssignmentId: numericQuizAssignmentId, update: {quizFeedbackMode: mode}});
        }
    };

    const assignmentStartDate = quizAssignment?.scheduledStartDate ?? quizAssignment?.creationDate;
    const assignmentNotYetStarted = assignmentStartDate && nthHourOf(0, assignmentStartDate) > TODAY();
    const quizTitle = (quizAssignment?.quiz?.title || quizAssignment?.quiz?.id || "Test");
    const pageTitle = `${quizTitle} ${(assignmentNotYetStarted ? `(starts ${formatDate(assignmentStartDate)})` : "results")}`;

    const buildErrorComponent = (error: FetchBaseQueryError | SerializedError | undefined) => <>
        <Alert color="danger">
            <h4 className="alert-heading">Error loading test feedback</h4>
            <p>{getRTKQueryErrorMessage(error)?.message}</p>
        </Alert>
    </>;

    const [settingsVisible, setSettingsVisible] = useState(true);

    const numStudentsSubmitted = quizAssignment?.userFeedback?.filter(p => p.feedback?.complete).length;
    const numStudentsCompletedAll = quizAssignment?.userFeedback?.filter(p => p.feedback?.overallMark?.correct && p.feedback?.overallMark?.correct === quizAssignment.quiz?.total).length;

    return <Container>
        <TitleAndBreadcrumb currentPageTitle={pageTitle} help={pageHelp} intermediateCrumbs={teacherQuizzesCrumbs} icon={{type: "icon", icon: quizAssignmentQuery?.isError ? "icon-error" : "icon-tests"}}/>
        <ShowLoadingQuery
            query={quizAssignmentQuery}
            ifError={buildErrorComponent}
            thenRender={quizAssignment => <>
                {assignmentNotYetStarted && <div className="mb-4 alert alert-info px-3 py-2 mt-4">
                    <span className="alert-heading fw-bold">This test has not yet started. </span>
                    <span>It will be released to your group on {formatDate(assignmentStartDate)}.</span>
                </div>}

                <div className={classNames("d-flex align-items-center flex-wrap mb-4 gap-2", siteSpecific("mt-md-4", "mt-xl-4"))}>
                    {isPhy && <Link to={`${PATHS.ASSIGNMENT_PROGRESS}/group/${quizAssignment.groupId}#tests`} className="d-flex align-items-center">
                        <i className="icon icon-arrow-left me-2"/>
                        Back to group assignments and tests
                    </Link>}
                    {isPhy && <Spacer/>}
                    <div className="d-flex flex-column px-3 py-3 py-md-0 text-md-center justify-content-center">
                        <Label for="feedbackMode" className="pe-1 mb-0 small">
                            Student feedback mode:
                        </Label>
                        <UncontrolledButtonDropdown size="sm">
                            <DropdownToggle color={siteSpecific("tertiary", "solid")} className={siteSpecific("border", "")} caret size={"sm"} disabled={isUpdatingQuiz}>
                                {feedbackNames[quizAssignment.quizFeedbackMode as QuizFeedbackMode]}
                            </DropdownToggle>
                            <DropdownMenu container={"root"} className="z-1050">
                                {QuizFeedbackModes.map(mode =>
                                    <DropdownItem key={mode}
                                        onClick={() => setFeedbackMode(mode)}
                                        active={mode === quizAssignment?.quizFeedbackMode}
                                    >
                                        {feedbackNames[mode]}
                                    </DropdownItem>
                                )}
                            </DropdownMenu>
                        </UncontrolledButtonDropdown>
                    </div>
                    <Button
                        color={siteSpecific("solid", "keyline")} className="btn-md mt-1 text-nowrap"
                        href={getQuizAssignmentCSVDownloadLink(quizAssignment.id as number)}
                        target="_blank"
                    >
                        Download CSV
                        <i className="icon icon-download ms-2" color="white"/>
                    </Button>
                </div>

                {/* <div className="content-metadata-container d-flex flex-column flex-md-row">
                    <div className="d-flex flex-column pb-3 pb-md-0 px-3 flex-grow-1 justify-content-center">
                        <span>
                            Set by: {extractTeacherName(quizAssignment.assignerSummary)} on {formatDate(quizAssignment.creationDate)}
                        </span>
                        {quizAssignment.dueDate && <span>
                            Due date: {formatDate(quizAssignment.dueDate)}
                        </span>}
                    </div>

                    <div className="px-3 py-3 py-md-0 text-md-center justify-content-center">
                        <Label for="feedbackMode" className="pe-1">Student feedback mode:</Label><br/>
                        <UncontrolledButtonDropdown size="sm">
                            <DropdownToggle color={siteSpecific("tertiary", "solid")} className={siteSpecific("border", "")} caret size={siteSpecific("lg", "sm")} disabled={isUpdatingQuiz}>
                                {feedbackNames[quizAssignment.quizFeedbackMode as QuizFeedbackMode]}
                            </DropdownToggle>
                            <DropdownMenu container={"root"} className="z-1050">
                                {QuizFeedbackModes.map(mode =>
                                    <DropdownItem key={mode}
                                        onClick={() => setFeedbackMode(mode)}
                                        active={mode === quizAssignment?.quizFeedbackMode}
                                    >
                                        {feedbackNames[mode]}
                                    </DropdownItem>
                                )}
                            </DropdownMenu>
                        </UncontrolledButtonDropdown>
                    </div>

                    <div className="px-3 pt-3 pt-md-0 align-content-center">
                        <Button
                            color={siteSpecific("solid", "keyline")} className="btn-md mt-1 text-nowrap"
                            href={getQuizAssignmentCSVDownloadLink(quizAssignment.id as number)}
                            target="_blank"
                        >
                            Download CSV
                        </Button>
                    </div>
                </div> */}

                <Card className="my-4">
                    <CardBody className="d-flex flex-column flex-lg-row assignment-progress-group-overview row-gap-2">
                        <div className="d-flex align-items-center flex-grow-1 fw-bold">
                            <i className={classNames("icon me-2", quizAssignment.dueDate && quizAssignment.dueDate < new Date() ? "icon-event-complete" : "icon-event-upcoming", siteSpecific("icon-md", "icon-sm"))} color="secondary"/>
                            Due: {formatDate(quizAssignment.dueDate)}
                        </div>
                        <div className="d-flex align-items-center flex-grow-1 fw-bold">
                            <i className={classNames("icon icon-group me-2", siteSpecific("icon-md", "icon-sm"))} color="secondary"/>
                            {numStudentsSubmitted} of {quizAssignment.userFeedback?.length} submitted their test
                        </div>
                        <div className="d-flex align-items-center flex-grow-1 fw-bold">
                            <i className={classNames("icon icon-task-complete me-2", siteSpecific("icon-md", "icon-sm"))} color="secondary"/>
                            {numStudentsCompletedAll} of {quizAssignment.userFeedback?.length} got full marks
                        </div>
                    </CardBody>
                </Card>

                <div className={`assignment-progress-details bg-transparent ${pageSettings.colourBlind ? " colour-blind" : ""}`}>
                    <AssignmentProgressPageSettingsContext.Provider value={pageSettings}>
                        <Card className="p-4 my-3">
                            <div className={classNames("d-flex", {"mb-3": isPhy})}>
                                {siteSpecific(
                                    <h4>Overview: {quizTitle}</h4>,
                                    <h3>Group results</h3>
                                )}
                                <Spacer />
                                {isPhy && <button onClick={() => setSettingsVisible(o => !o)} className="d-flex align-items-center bg-transparent gap-2 invert-underline">
                                    {settingsVisible ? "Hide settings" : "Show settings"}
                                    <i className={classNames("icon icon-cog anim-rotate-45", { "active": settingsVisible })}/>
                                </button>}
                            </div>

                            <ResultsTableHeader settingsVisible={settingsVisible} isAssignment={false} />

                            <QuizProgressDetails assignment={quizAssignment} />
                        </Card>
                    </AssignmentProgressPageSettingsContext.Provider>
                </div>
            </>}
        />
    </Container>;
};

interface QuizQuestion extends ContentBaseDTO {
    questionPartsTotal?: number | undefined;
}

export const QuizProgressDetails = ({assignment}: {assignment: QuizAssignmentDTO}) => {

    const questions : QuizQuestion[] = questionsInQuiz(assignment.quiz).map(q => ({...q, questionPartsTotal: 1} as QuizQuestion));
    const assignmentProgressContext = useContext(AssignmentProgressPageSettingsContext);

    function questionsInSection(section?: IsaacQuizSectionDTO) {
        return section?.children?.filter(isQuestion) || [];
    }

    function questionsInQuiz(quiz?: IsaacQuizDTO) {
        const questions: QuizQuestion[] = [];
        quiz?.children?.forEach(
            section => {
                questions.push(...questionsInSection(section));
            }
        );
        return questions;
    }

    function markClasses(studentProgress: AssignmentProgressDTO) {
        if (!isAuthorisedFullAccess(studentProgress)) {
            return "revoked";
        }

        const correctParts = studentProgress.correctQuestionPartsCount;
        const incorrectParts = studentProgress.incorrectQuestionPartsCount;
        const total = questions.reduce((acc, q) => acc + (q.questionPartsTotal ?? 0), 0);

        return markClassesInternal(assignmentProgressContext?.attemptedOrCorrect ?? "CORRECT", studentProgress, null, correctParts, incorrectParts, total);
    }

    function markQuestionClasses(studentProgress: AssignmentProgressDTO, index: number) {
        if (!isAuthorisedFullAccess(studentProgress)) {
            return "revoked";
        }

        const correctParts = (studentProgress.correctPartResults || [])[index];
        const incorrectParts = (studentProgress.incorrectPartResults || [])[index];
        const totalParts = questions[index].questionPartsTotal ?? 0;

        return markClassesInternal(assignmentProgressContext?.attemptedOrCorrect ?? "CORRECT", studentProgress, null, correctParts, incorrectParts, totalParts);
    }

    const totalParts = questions.length;

    const progress : AuthorisedAssignmentProgress[] = !assignment.userFeedback ? [] : assignment.userFeedback.map(user => {
        const partsCorrect = questions.reduce((acc, q) => acc + (user.feedback?.questionMarks?.[q?.id ?? -1]?.correct ?? 0), 0);
        return {
            user: user.user as UserSummaryDTO,
            completed: user.feedback?.complete ?? false,
            // a list of the correct parts of an answer, one list for each question
            correctPartResults:      questions.map(q => user.feedback?.questionMarks?.[q?.id ?? -1]?.correct ?? 0),
            incorrectPartResults:    questions.map(q => user.feedback?.questionMarks?.[q?.id ?? -1]?.incorrect ?? 0),
            notAttemptedPartResults: user.feedback?.complete || user.feedback?.questionMarks !== undefined
                ? questions.map(q => user.feedback?.questionMarks?.[q?.id ?? -1]?.notAttempted ?? 0)
                // if the quiz has not been completed (i.e. submitted), then all parts are not attempted
                : questions.map(q => q.questionPartsTotal ?? 0),
            questionResults: [],
            correctQuestionPagesCount: partsCorrect,  // quizzes don't have pages, but QuizProgressCommon expects this key to be the "Correct" column value for sorting
            correctQuestionPartsCount: partsCorrect,
            incorrectQuestionPartsCount: questions.reduce((acc, q) => acc + (user.feedback?.questionMarks?.[q?.id ?? -1]?.incorrect ?? 0), 0),
        };
    });

    return <ResultsTable<QuizQuestion> assignmentId={assignment.id} duedate={assignment.dueDate} progress={progress}
        questions={questions} assignmentTotalQuestionParts={totalParts} markClasses={markClasses} markQuestionClasses={markQuestionClasses}
        isAssignment={false}/>;
};
