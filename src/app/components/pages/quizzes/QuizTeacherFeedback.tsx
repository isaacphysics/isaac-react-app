import React, {useEffect, useState} from "react";
import {useAppDispatch, useAppSelector} from "../../../state/store";
import * as RS from "reactstrap";

import {useParams} from "react-router-dom";
import {ShowLoading} from "../../handlers/ShowLoading";
import {
    loadQuizAssignmentFeedback,
    updateQuizAssignmentDueDate,
    updateQuizAssignmentFeedbackMode
} from "../../../state/actions/quizzes";
import {selectors} from "../../../state/selectors";
import {TitleAndBreadcrumb} from "../../elements/TitleAndBreadcrumb";
import {QuizFeedbackMode} from "../../../../IsaacApiTypes";
import {AssignmentProgressLegend} from '../AssignmentProgress';
import {useAssignmentProgressAccessibilitySettings} from "../../../services/progress";
import {AssignmentProgressPageSettingsContext, QuizFeedbackModes} from "../../../../IsaacAppTypes";
import {teacherQuizzesCrumbs} from "../../elements/quiz/QuizAttemptComponent";
import {extractTeacherName} from "../../../services/user";
import {isDefined} from "../../../services/miscUtils";
import {formatDate} from "../../elements/DateString";
import {Spacer} from "../../elements/Spacer";
import {showToast} from "../../../state/actions";
import {IsaacSpinner} from "../../handlers/IsaacSpinner";
import {currentYear, DateInput} from "../../elements/inputs/DateInput";
import {range} from "lodash";
import { ResultsTable } from "../../elements/quiz/QuizProgressCommon";
import {getQuizAssignmentCSVDownloadLink} from "../../../services/quiz";

const pageHelp = <span>
    See the feedback for your students for this test assignment.
</span>;

const feedbackNames: Record<QuizFeedbackMode, string> = {
    NONE: "No feedback for students",
    OVERALL_MARK: "Overall mark only",
    SECTION_MARKS: "Section-by-section mark breakdown",
    DETAILED_FEEDBACK: "Detailed feedback on each question",
};

export const QuizTeacherFeedback = () => {
    const {quizAssignmentId} = useParams<{quizAssignmentId: string}>();
    const pageSettings = useAssignmentProgressAccessibilitySettings();
    const assignmentState = useAppSelector(selectors.quizzes.assignment);

    const dispatch = useAppDispatch();

    const numericQuizAssignmentId = parseInt(quizAssignmentId, 10);
    useEffect(() => {
        dispatch(loadQuizAssignmentFeedback(numericQuizAssignmentId));
    }, [dispatch, numericQuizAssignmentId]);

    const [settingFeedbackMode, setSettingFeedbackMode] = useState(false);
    const setFeedbackMode = async (mode: QuizFeedbackMode) => {
        if (mode === assignment?.quizFeedbackMode) {
            return;
        }
        try {
            setSettingFeedbackMode(true);
            await dispatch(updateQuizAssignmentFeedbackMode(numericQuizAssignmentId, mode));
        } finally {
            setSettingFeedbackMode(false);
        }
    };

    const assignment = assignmentState && 'assignment' in assignmentState ? assignmentState.assignment : null;
    const error = assignmentState && 'error' in assignmentState ? assignmentState.error : null;
    const quizTitle = (assignment?.quiz?.title || assignment?.quiz?.id || "Test") + " results";

    // Date input variables
    const yearRange = range(currentYear, currentYear + 5);
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentDay = now.getDate();

    const [settingDueDate, setSettingDueDate] = useState<boolean>(false);
    const [dueDate, setDueDate] = useState<Date | null>( null);

    useEffect(() => {
        setDueDate(assignment?.dueDate ?? null);
    }, [assignment?.dueDate]);

    const setValidDueDate = async (newDate : Date | null) => {
        if (settingDueDate || !newDate || assignment?.dueDate == newDate) {
            return;
        }
        if (assignment?.dueDate && newDate > assignment.dueDate) {
            try {
                setSettingDueDate(true);
                if (confirm("Are you sure you want to change the due date? This will extend the due date for all users this test is assigned to.")) {
                    dispatch(updateQuizAssignmentDueDate(numericQuizAssignmentId, newDate)).then((succeeded) => {
                        if (succeeded) {
                            dispatch(showToast({color: "success", title: "Due date extended successfully", body: `This test is now due ${newDate.toLocaleDateString()}.`, timeout: 5000}));
                        }
                    });
                } else {
                    setDueDate(assignment.dueDate);
                }
            } finally {
                setSettingDueDate(false);
            }
        }
    }

    return <RS.Container>
        <ShowLoading until={assignmentState}>
            {assignment && <>
                <TitleAndBreadcrumb currentPageTitle={quizTitle} help={pageHelp} intermediateCrumbs={teacherQuizzesCrumbs}/>
                <p className="d-flex">
                    <span>
                        Set by: {extractTeacherName(assignment.assignerSummary ?? null)} on {formatDate(assignment.creationDate)}
                    </span>
                    {isDefined(assignment.dueDate) && <><Spacer/>Due: {formatDate(assignment.dueDate)}</>}
                </p>
                <RS.Row>
                    {assignment.dueDate && <RS.Col xs={12} sm={6} md={4}>
                        <RS.Label for="dueDate" className="pr-1">Extend the due date:</RS.Label>
                        <DateInput id="dueDate" value={dueDate ?? undefined} invalid={(dueDate && (dueDate < assignment.dueDate)) ?? undefined} yearRange={yearRange} defaultYear={currentYear} noClear
                                   defaultMonth={(day) => (day && day <= currentDay) ? currentMonth + 1 : currentMonth} onChange={(e) => setDueDate(e.target.valueAsDate)}/>
                        <div className={"mt-2 w-100 text-center mb-2"}>
                            {dueDate && (dueDate > assignment.dueDate) && <RS.Button color="primary" outline className={"btn-md"} onClick={() => setValidDueDate(dueDate)}>
                                {settingDueDate ? <>Saving <IsaacSpinner size="sm" className="quizFeedbackModeSpinner" /></> : "Extend due date"}
                            </RS.Button>}
                            {dueDate && (dueDate < assignment.dueDate) && <RS.Card className={"text-left border bg-transparent border-danger"}>
                                <RS.CardBody className={"p-2 pl-3"}>
                                    Extended due date must be after the current due date!
                                </RS.CardBody>
                            </RS.Card>}
                        </div>
                    </RS.Col>}
                    <RS.Col>
                        <RS.Label for="feedbackMode" className="pr-1">Student feedback mode:</RS.Label><br/>
                        <RS.UncontrolledDropdown className="d-inline-block">
                            <RS.DropdownToggle color="dark" outline className={"px-3 text-nowrap"} caret={!settingFeedbackMode} id="feedbackMode" disabled={settingFeedbackMode}>
                                {settingFeedbackMode ?
                                    <>Saving <IsaacSpinner size="sm" className="quizFeedbackModeSpinner" /></>
                                :   feedbackNames[assignment.quizFeedbackMode as QuizFeedbackMode]}
                            </RS.DropdownToggle>
                            <RS.DropdownMenu>
                                {QuizFeedbackModes.map(mode =>
                                    <RS.DropdownItem key={mode}
                                                    onClick={() => setFeedbackMode(mode)}
                                                    active={mode === assignment?.quizFeedbackMode}>
                                        {feedbackNames[mode]}
                                    </RS.DropdownItem>
                                )}
                            </RS.DropdownMenu>
                        </RS.UncontrolledDropdown>
                    </RS.Col>
                    <RS.Col sm={12} md={"auto"} className={"text-right mt-2 mt-md-0"}>
                        <RS.Button
                            color="primary" outline className="btn-md mt-1 text-nowrap"
                            href={getQuizAssignmentCSVDownloadLink(assignment.id as number)}
                            target="_blank"
                        >
                            Export as CSV
                        </RS.Button>
                    </RS.Col>
                </RS.Row>
                <div className={`assignment-progress-details bg-transparent ${pageSettings.colourBlind ? " colour-blind" : ""}`}>
                    <AssignmentProgressPageSettingsContext.Provider value={pageSettings}>
                        <AssignmentProgressLegend showQuestionKey />
                        <ResultsTable assignment={assignment} />
                    </AssignmentProgressPageSettingsContext.Provider>
                </div>
            </>}
            {error && <>
                <TitleAndBreadcrumb currentPageTitle={quizTitle} help={pageHelp} intermediateCrumbs={teacherQuizzesCrumbs}/>
                <RS.Alert color="danger">
                    <h4 className="alert-heading">Error loading test feedback</h4>
                    <p>{error}</p>
                </RS.Alert>
            </>}
        </ShowLoading>
    </RS.Container>;
};
