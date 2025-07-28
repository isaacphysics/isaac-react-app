import React, {useContext, useState} from "react";
import {
    getRTKQueryErrorMessage,
    useGetQuizAssignmentWithFeedbackQuery,
    useUpdateQuizAssignmentMutation
} from "../../../state";
import {useParams} from "react-router-dom";
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
    extractTeacherName,
    getQuizAssignmentCSVDownloadLink,
    isAuthorisedFullAccess,
    isPhy,
    isQuestion,
    nthHourOf,
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
import {AssignmentProgressSettings, markClassesInternal} from "../AssignmentProgressIndividual";
import classNames from "classnames";
import {Spacer} from "../../elements/Spacer";
import {CollapsibleContainer} from "../../elements/CollapsibleContainer";

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
    const quizTitle = (quizAssignment?.quiz?.title || quizAssignment?.quiz?.id || "Test") + (assignmentNotYetStarted ? ` (starts ${formatDate(assignmentStartDate)})` : " results");

    const buildErrorComponent = (error: FetchBaseQueryError | SerializedError | undefined) => <>
        <Alert color="danger">
            <h4 className="alert-heading">Error loading test feedback</h4>
            <p>{getRTKQueryErrorMessage(error)?.message}</p>
        </Alert>
    </>;

    const [settingsVisible, setSettingsVisible] = useState(true);

    return <Container>
        <TitleAndBreadcrumb currentPageTitle={quizTitle} help={pageHelp} intermediateCrumbs={teacherQuizzesCrumbs} icon={{type: "hex", icon: quizAssignmentQuery?.isError ? "icon-error" : "icon-tests"}}/>
        <ShowLoadingQuery
            query={quizAssignmentQuery}
            ifError={buildErrorComponent}
            thenRender={quizAssignment => <>
                {assignmentNotYetStarted && <div className="mb-4 alert alert-info px-3 py-2 mt-4">
                    <span className="alert-heading fw-bold">This test has not yet started. </span>
                    <span>It will be released to your group on {formatDate(assignmentStartDate)}.</span>
                </div>}

                <div className="content-metadata-container d-flex flex-column flex-md-row">
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
                            <DropdownMenu>
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
                            Export as CSV
                        </Button>
                    </div>
                </div>

                <div className={`assignment-progress-details bg-transparent ${pageSettings.colourBlind ? " colour-blind" : ""}`}>
                    <AssignmentProgressPageSettingsContext.Provider value={pageSettings}>
                        {/* <AssignmentProgressLegend showQuestionKey /> */}
                        <Card className="p-4 my-3">
                            <div className="d-flex mb-3">
                                {siteSpecific(
                                    <h4>Group results</h4>,
                                    <h3>Group results</h3>
                                )}
                                <Spacer />
                                {isPhy && <button onClick={() => setSettingsVisible(o => !o)} className="d-flex align-items-center bg-transparent gap-2 invert-underline">
                                    {settingsVisible ? "Hide settings" : "Show settings"}
                                    <i className={classNames("icon icon-cog anim-rotate-45", { "active": settingsVisible })}/>
                                </button>}
                            </div>
                            {isPhy && <CollapsibleContainer expanded={settingsVisible} className="w-100">
                                <div className="py-3">
                                    <AssignmentProgressSettings />
                                </div>
                            </CollapsibleContainer>}
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
        return {
            user: user.user as UserSummaryDTO,
            completed: user.feedback?.complete ?? false,
            // a list of the correct parts of an answer, one list for each question
            correctPartResults: questions.map(q => user.feedback?.questionMarks?.[q?.id ?? 0]?.correct ?? 0),
            incorrectPartResults: questions.map(q => user.feedback?.questionMarks?.[q?.id ?? 0]?.incorrect ?? 0),
            notAttemptedPartResults: questions.map(q => user.feedback?.questionMarks?.[q?.id ?? 0]?.notAttempted ?? 0),
            questionResults: [],
            tickCount: user.feedback?.questionMarks?.[0]?.correct ?? 0,
            correctQuestionPartsCount: questions.reduce((acc, q) => acc + (user.feedback?.questionMarks?.[q?.id ?? 0]?.correct ?? 0), 0),
            incorrectQuestionPartsCount: questions.reduce((acc, q) => acc + (user.feedback?.questionMarks?.[q?.id ?? 0]?.incorrect ?? 0), 0),
        };
    });

    return <ResultsTable<QuizQuestion> assignmentId={assignment.id} duedate={assignment.dueDate} progress={progress}
        questions={questions} assignmentTotalQuestionParts={totalParts} markClasses={markClasses} markQuestionClasses={markQuestionClasses}
        isAssignment={false}/>;
};
