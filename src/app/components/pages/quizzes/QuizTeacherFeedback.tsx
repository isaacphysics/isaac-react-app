import React, {useEffect, useState} from "react";
import {
    getRTKQueryErrorMessage,
    mutationSucceeded,
    showSuccessToast,
    useAppDispatch,
    useGetQuizAssignmentWithFeedbackQuery,
    useUpdateQuizAssignmentMutation
} from "../../../state";
import {Link, useParams} from "react-router-dom";
import {TitleAndBreadcrumb} from "../../elements/TitleAndBreadcrumb";
import {ContentBaseDTO, IsaacQuizDTO, IsaacQuizSectionDTO, QuizAssignmentDTO, QuizFeedbackMode, QuizUserFeedbackDTO, RegisteredUserDTO, UserSummaryDTO} from "../../../../IsaacApiTypes";
import {AssignmentProgressLegend} from '../AssignmentProgress';
import {
    confirmThen,
    extractTeacherName,
    getQuizAssignmentCSVDownloadLink,
    siteSpecific,
    isDefined, nthHourOf, TODAY,
    useAssignmentProgressAccessibilitySettings,
    isQuestion,
    PATHS
} from "../../../services";
import {AppAssignmentProgress, AssignmentProgressPageSettingsContext, QuizFeedbackModes} from "../../../../IsaacAppTypes";
import {teacherQuizzesCrumbs} from "../../elements/quiz/QuizAttemptComponent";
import {formatDate} from "../../elements/DateString";
import {Spacer} from "../../elements/Spacer";
import {currentYear, DateInput} from "../../elements/inputs/DateInput";
import range from "lodash/range";
import {ResultsTable, passMark} from "../../elements/quiz/QuizProgressCommon";
import {
    Alert,
    Button,
    Col,
    Container,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    Label,
    Row,
    UncontrolledButtonDropdown
} from "reactstrap";
import {FetchBaseQueryError} from "@reduxjs/toolkit/dist/query/fetchBaseQuery";
import {SerializedError} from "@reduxjs/toolkit";
import {ShowLoadingQuery} from "../../handlers/ShowLoadingQuery";

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
    const dispatch = useAppDispatch();
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

    // Date input variables
    const yearRange = range(currentYear, currentYear + 5);
    const [dueDate, setDueDate] = useState<Date>();

    useEffect(() => {
        setDueDate(quizAssignment?.dueDate);
    }, [quizAssignment?.dueDate]);

    const setValidDueDate = (newDate : Date) => {
        if (isUpdatingQuiz || !newDate || quizAssignment?.dueDate == newDate) {
            return;
        }
        if (quizAssignment?.dueDate && newDate > quizAssignment.dueDate) {
            confirmThen(
                "Are you sure you want to change the due date? This will extend the due date for all users this test is assigned to.",
                () => updateQuiz({quizAssignmentId: numericQuizAssignmentId, update: {dueDate: newDate}})
                    .then((result) => {
                        if (mutationSucceeded(result)) {
                            dispatch(showSuccessToast("Due date extended successfully", `This test is now due ${newDate.toLocaleDateString()}.`));
                        }
                    }),
                () => setDueDate(quizAssignment.dueDate)
            );
        }
    };

    const buildErrorComponent = (error: FetchBaseQueryError | SerializedError | undefined) => <>
        <TitleAndBreadcrumb currentPageTitle={quizTitle} help={pageHelp} intermediateCrumbs={teacherQuizzesCrumbs}/>
        <Alert color="danger">
            <h4 className="alert-heading">Error loading test feedback</h4>
            <p>{getRTKQueryErrorMessage(error)?.message}</p>
        </Alert>
    </>;

    return <Container>
        <ShowLoadingQuery
            query={quizAssignmentQuery}
            ifError={buildErrorComponent}
            thenRender={quizAssignment => <>
                <TitleAndBreadcrumb currentPageTitle={quizTitle} help={pageHelp} intermediateCrumbs={teacherQuizzesCrumbs}/>
                <div className="d-flex mb-4">
                    <span>
                        Set by: {extractTeacherName(quizAssignment.assignerSummary)} on {formatDate(quizAssignment.creationDate)}
                    </span>
                    {isDefined(quizAssignment.dueDate) && <><Spacer/>Due: {formatDate(quizAssignment.dueDate)}</>}
                </div>
                {assignmentNotYetStarted && <div className="mb-4">
                    <h4 className="alert-heading">This test has not yet started</h4>
                    <p>It will be released to your group on {formatDate(assignmentStartDate)}.</p>
                </div>}
                <Row>
                    {quizAssignment.dueDate && <Col xs={12} sm={6} md={4}>
                        <Label for="dueDate" className="pr-1">Extend the due date:
                            <DateInput id="dueDate" value={dueDate} invalid={dueDate && (dueDate < quizAssignment.dueDate)}
                                       yearRange={yearRange} noClear onChange={(e) => setDueDate(e.target.valueAsDate ?? undefined)}
                                       disabled={isUpdatingQuiz}
                            />
                        </Label>
                        {dueDate && (dueDate < quizAssignment.dueDate) && <small className={"text-danger"}>
                            You cannot set the due date to be earlier than the current due date.
                        </small>}
                        <div className={"mt-2 w-100 text-center mb-2"}>
                            {dueDate && (dueDate > quizAssignment.dueDate) && <Button disabled={isUpdatingQuiz} color="primary" outline className={"btn-md"} onClick={() => setValidDueDate(dueDate)}>
                                Extend due date
                            </Button>}
                        </div>
                    </Col>}
                    <Col>
                        <Label for="feedbackMode" className="pr-1">Student feedback mode:</Label><br/>
                        <UncontrolledButtonDropdown size="sm">
                            <DropdownToggle color={siteSpecific("tertiary", "secondary")} className={siteSpecific("border", "")} caret size={siteSpecific("lg", "sm")} disabled={isUpdatingQuiz}>
                                {feedbackNames[quizAssignment.quizFeedbackMode as QuizFeedbackMode]}
                            </DropdownToggle>
                            <DropdownMenu>
                                {QuizFeedbackModes.map(mode =>
                                    <DropdownItem key={mode}
                                                  onClick={() => setFeedbackMode(mode)}
                                                  active={mode === quizAssignment?.quizFeedbackMode}>
                                        {feedbackNames[mode]}
                                    </DropdownItem>
                                )}
                            </DropdownMenu>
                        </UncontrolledButtonDropdown>
                    </Col>
                    <Col sm={12} md={"auto"} className={"text-right mt-2 mt-md-0"}>
                        <Button
                            color="primary" outline className="btn-md mt-1 text-nowrap"
                            href={getQuizAssignmentCSVDownloadLink(quizAssignment.id as number)}
                            target="_blank"
                        >
                            Export as CSV
                        </Button>
                    </Col>
                </Row>
                <div className={`assignment-progress-details bg-transparent ${pageSettings.colourBlind ? " colour-blind" : ""}`}>
                    <AssignmentProgressPageSettingsContext.Provider value={pageSettings}>
                        <AssignmentProgressLegend showQuestionKey />
                        <QuizProgressDetails assignment={quizAssignment} userFeedback={quizAssignmentQuery.data?.userFeedback}/>
                    </AssignmentProgressPageSettingsContext.Provider>
                </div>
            </>
        }/>
    </Container>;
};

interface QuizQuestion extends ContentBaseDTO {
    questionPartsTotal?: number | undefined;
}

export const QuizProgressDetails = ({assignment, userFeedback}: {assignment: QuizAssignmentDTO, userFeedback?: QuizUserFeedbackDTO[]}) => {

    const questions : QuizQuestion[] = questionsInQuiz(assignment.quiz).map(q => ({...q, questionPartsTotal: 1} as QuizQuestion));

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

    function markClassesInternal(studentProgress: AppAssignmentProgress, correctParts: number, incorrectParts: number, totalParts: number) {
        if (!studentProgress.user.authorisedFullAccess) {
            return "revoked";
        } else if (correctParts === totalParts) {
            return "completed";
        } else if ((correctParts / totalParts) >= passMark) {
            return "passed";
        } else if ((incorrectParts / totalParts) > (1 - passMark)) {
            return "failed";
        } else if (correctParts > 0 || incorrectParts > 0) {
            return "in-progress";
        } else {
            return "not-attempted";
        }
    }

    function markClasses(studentProgress: AppAssignmentProgress) {
        const correctParts = studentProgress.correctQuestionPartsCount;
        const incorrectParts = studentProgress.incorrectQuestionPartsCount;
        const total = questions.reduce((acc, q) => acc + (q.questionPartsTotal ?? 0), 0);

        return markClassesInternal(studentProgress, correctParts, incorrectParts, total);
    }

    function markQuestionClasses(studentProgress: AppAssignmentProgress, index: number) {
        const correctParts = studentProgress.correctPartResults[index];
        const incorrectParts = studentProgress.incorrectPartResults[index];
        const totalParts = questions[index].questionPartsTotal ?? 0;

        return markClassesInternal(studentProgress, correctParts, incorrectParts, totalParts);
    }

    const fractionCorrect = (questionId: string) => {
        if (!assignment.userFeedback) return [0, 0];
        const marks = assignment.userFeedback.map(row => row.feedback?.questionMarks?.[questionId]);
        const definedMarks = marks?.filter(isDefined);
        if (!definedMarks || definedMarks.length === 0) return [0, 0];
        const correct = definedMarks.reduce((p, c) => p + (c.correct ?? 0), 0);
        const total = assignment.userFeedback.length * ((definedMarks[0].correct ?? 0) + (definedMarks[0].incorrect ?? 0) + (definedMarks[0].notAttempted ?? 0));
        return [correct, total];
    };

    const quizAverages = questions.map(q => {
        if (!q.id) return 0;
        const [correct, total] = fractionCorrect(q.id);
        return total ? Math.round(100 * correct / total) : 0;
    });

    const totalParts = questions.length;

    const progress : AppAssignmentProgress[] = !userFeedback ? [] : userFeedback.map(user => {
        return {
            user: user.user as UserSummaryDTO,
            // a list of the correct parts of an answer, one list for each question
            correctPartResults: questions.map(q => user.feedback?.questionMarks?.[q?.id ?? 0]?.correct ?? 0),
            incorrectPartResults: questions.map(q => user.feedback?.questionMarks?.[q?.id ?? 0]?.incorrect ?? 0),
            notAttemptedPartResults: questions.map(q => user.feedback?.questionMarks?.[q?.id ?? 0]?.notAttempted ?? 0),
            results: [],
            tickCount: user.feedback?.questionMarks?.[0]?.correct ?? 0,
            correctQuestionPartsCount: questions.reduce((acc, q) => acc + (user.feedback?.questionMarks?.[q?.id ?? 0]?.correct ?? 0), 0),
            incorrectQuestionPartsCount: questions.reduce((acc, q) => acc + (user.feedback?.questionMarks?.[q?.id ?? 0]?.incorrect ?? 0), 0),
        };
    });

    const header = <div className="progress-header">
        {userFeedback
        ? <>
            <strong>{userFeedback.reduce((p, c) => p + (c.feedback?.complete ? 1 : 0), 0)}</strong> of <strong>{userFeedback.length}</strong>
            {` students have completed the test `}
        </>
        : 'Preview '}
        <Link to={`${PATHS.PREVIEW_TEST}/${assignment.quizId}/page/1`}>{assignment.quiz?.title}</Link>.
    </div>;

    const getQuestionTitle = (question: QuizQuestion) => <div key={question.id} className="border">
        {`Q${questions.indexOf(question) + 1}`}
    </div>;
    
    return <ResultsTable<QuizQuestion> progress={progress} questions={questions} header={header} getQuestionTitle={getQuestionTitle}
    assignmentAverages={quizAverages} assignmentTotalQuestionParts={totalParts} markClasses={markClasses} markQuestionClasses={markQuestionClasses}/>;
};