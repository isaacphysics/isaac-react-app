import React, {useEffect, useState} from "react";
import {
    getRTKQueryErrorMessage,
    mutationSucceeded,
    showSuccessToast,
    useAppDispatch,
    useGetQuizAssignmentWithFeedbackQuery,
    useUpdateQuizAssignmentMutation
} from "../../../state";
import {useParams} from "react-router-dom";
import {TitleAndBreadcrumb} from "../../elements/TitleAndBreadcrumb";
import {QuizFeedbackMode, RegisteredUserDTO} from "../../../../IsaacApiTypes";
import {AssignmentProgressLegend} from '../AssignmentProgress';
import {
    confirmThen,
    extractTeacherName,
    getQuizAssignmentCSVDownloadLink,
    siteSpecific,
    isDefined, nthHourOf, TODAY,
    useAssignmentProgressAccessibilitySettings
} from "../../../services";
import {AssignmentProgressPageSettingsContext, QuizFeedbackModes} from "../../../../IsaacAppTypes";
import {teacherQuizzesCrumbs} from "../../elements/quiz/QuizAttemptComponent";
import {formatDate} from "../../elements/DateString";
import {Spacer} from "../../elements/Spacer";
import {currentYear, DateInput} from "../../elements/inputs/DateInput";
import range from "lodash/range";
import {ResultsTable} from "../../elements/quiz/QuizProgressCommon";
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
    }

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
                        <ResultsTable assignment={quizAssignment} userFeedback={quizAssignmentQuery.data?.userFeedback} />
                    </AssignmentProgressPageSettingsContext.Provider>
                </div>
            </>
        }/>
    </Container>;
};
