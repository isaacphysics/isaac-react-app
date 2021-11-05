import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {withRouter} from "react-router-dom";
import * as RS from "reactstrap";

import {ShowLoading} from "../../handlers/ShowLoading";
import {
    loadQuizAssignmentFeedback,
    returnQuizToStudent, updateQuizAssignmentDueDate,
    updateQuizAssignmentFeedbackMode
} from "../../../state/actions/quizzes";
import {selectors} from "../../../state/selectors";
import {TitleAndBreadcrumb} from "../../elements/TitleAndBreadcrumb";
import {
    IsaacQuizSectionDTO,
    Mark,
    QuizAssignmentDTO,
    QuizFeedbackMode,
    QuizUserFeedbackDTO
} from "../../../../IsaacApiTypes";
import {AssignmentProgressLegend, formatMark, ICON} from '../AssignmentProgress';
import {usePageSettings} from "../../../services/progress";
import {PageSettings, QuizFeedbackModes} from "../../../../IsaacAppTypes";
import {teacherQuizzesCrumbs} from "../../elements/quiz/QuizAttemptComponent";
import {extractTeacherName} from "../../../services/user";
import {isDefined} from "../../../services/miscUtils";
import {formatDate} from "../../elements/DateString";
import {Spacer} from "../../elements/Spacer";
import {isQuestion} from "../../../services/questions";
import {API_PATH} from "../../../services/constants";
import {closeActiveModal, getQuizAssignmentResultsSummaryCSV, openActiveModal, showToast} from "../../../state/actions";
import {IsaacSpinner} from "../../handlers/IsaacSpinner";
import {currentYear, DateInput} from "../../elements/inputs/DateInput";
import {range} from "lodash";

interface QuizTeacherFeedbackProps {
    match: {params: {quizAssignmentId: string}}
}

const pageHelp = <span>
    See the feedback for your students for this test assignment.
</span>;

interface ResultsTableProps {
    assignment: QuizAssignmentDTO;
    pageSettings: PageSettings;
}

function questionsInSection(section?: IsaacQuizSectionDTO) {
    return section?.children?.filter(child => isQuestion(child)) || [];
}

const passMark = 0.75;
function markQuestionClasses(row: QuizUserFeedbackDTO, mark: Mark | undefined, totalOrUndefined: number | undefined) {
    if (!row.user?.authorisedFullAccess) {
        return "revoked";
    }

    const correct = mark?.correct as number;
    const incorrect = mark?.incorrect as number;
    const total = totalOrUndefined as number;

    if (correct === total) {
        return "completed";
    } else if ((correct / total) >= passMark) {
        return "passed";
    } else if ((incorrect / total) > (1 - passMark)) {
        return "failed";
    } else if (correct > 0 || incorrect > 0) {
        return "in-progress";
    } else {
        return "not-attempted";
    }
}

interface ResultRowProps {
    pageSettings: PageSettings;
    row: QuizUserFeedbackDTO;
    assignment: QuizAssignmentDTO;
}

function openStudentFeedback(assignment: QuizAssignmentDTO, userId: number | undefined) {
    isDefined(assignment?.id) && isDefined(userId) && window.open(`/quiz/attempt/feedback/${assignment.id}/${userId}`, '_blank')
}

function ResultRow({pageSettings, row, assignment}: ResultRowProps) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [working, setWorking] = useState(false);
    const dispatch = useDispatch();

    const toggle = () => setDropdownOpen(prevState => !prevState);

    const returnToStudent = async () => {
        dispatch(openActiveModal({
            closeAction: () => {
                dispatch(closeActiveModal())
            },
            title: "Allow another attempt?",
            body: "This will allow the student to attempt the test again.",
            buttons: [
                <RS.Button key={1} color="primary" outline target="_blank" onClick={() => {dispatch(closeActiveModal())}}>
                    Cancel
                </RS.Button>,
                <RS.Button key={0} color="primary" target="_blank" onClick={_returnToStudent}>
                    Confirm
                </RS.Button>,
        ]
        }));
    }

    const _returnToStudent = async () => {
        try {
            setWorking(true);
            await dispatch(returnQuizToStudent(assignment.id as number, row.user?.id as number));
        } finally {
            setWorking(false);
            dispatch(closeActiveModal());
        }
    };

    const quiz = assignment?.quiz;
    const sections: IsaacQuizSectionDTO[] = quiz?.children || [];

    let message;
    if (!row.user?.authorisedFullAccess) {
        message = "Not sharing";
    } else if (!row.feedback?.complete) {
        message = "Not completed";
    }
    const valid = !isDefined(message);
    return <tr className={`${row.user?.authorisedFullAccess ? "" : " not-authorised"}`} title={`${row.user?.givenName + " " + row.user?.familyName}`}>
        <th className="student-name">
            {valid ?
                <>
                    <RS.Button color="link" onClick={toggle} disabled={working}>
                        <div
                            tabIndex={0}
                            className="btn quiz-student-menu"
                            data-toggle="dropdown"
                            aria-expanded={dropdownOpen}
                        >
                            {row.user?.givenName}
                            <span className="d-none d-lg-inline"> {row.user?.familyName}</span>
                            <span className="quiz-student-menu-icon">
                            {working ? <IsaacSpinner size="sm" /> : <img src="/assets/menu.svg" alt="Menu" />}
                        </span>
                        </div>
                    </RS.Button>
                    {!working && dropdownOpen && <div className="py-2 px-3">
                        <RS.Button size="sm" onClick={returnToStudent}>Allow another attempt</RS.Button>
                    </div>}
                    {!working && dropdownOpen && <div className="py-2 px-3">
                        <RS.Button size="sm" onClick={() => openStudentFeedback(assignment, row.user?.id)}>View attempt</RS.Button>
                    </div>}
                </>
            :   <>
                    {row.user?.givenName}
                    <span className="d-none d-lg-inline"> {row.user?.familyName}</span>
                </>
            }
        </th>
        {!valid && <td colSpan={sections.map(questionsInSection).flat().length + 1}>{message}</td>}
        {valid && <>
            {sections.map(section => {
                const mark = row.feedback?.sectionMarks?.[section.id as string];
                const outOf = quiz?.sectionTotals?.[section.id as string];
                return questionsInSection(section).map(question => {
                    const questionMark = row.feedback?.questionMarks?.[question.id as string] || {} as Mark;
                    const icon =
                        questionMark.correct === 1 ? ICON.correct :
                        questionMark.incorrect === 1 ? ICON.incorrect :
                        /* default */ ICON.notAttempted;
                    return <td key={question.id} className={markQuestionClasses(row, mark, outOf)}>
                        {icon}
                    </td>
                }).flat()
            })}
            <td className="total-column">
                {formatMark(row.feedback?.overallMark?.correct as number, quiz?.total as number, pageSettings.formatAsPercentage)}
            </td>
        </>}
    </tr>;
}

function ResultsTable({assignment, pageSettings}: ResultsTableProps) {
    const sections: IsaacQuizSectionDTO[] = assignment.quiz?.children || [];

    return <table className="progress-table w-100 mb-5 border">
        <tbody>
            <tr className="bg-white">
                <th>&nbsp;</th>
                {sections.map(section => <th key={section.id} colSpan={questionsInSection(section).length} className="border font-weight-bold">
                    {section.title}
                </th>)}
                <th rowSpan={2} className="border-bottom">Overall</th>
            </tr>
            <tr className="bg-white">
                <th className="bg-white border-bottom">&nbsp;</th>
                {sections.map(section => questionsInSection(section).map((question, index) => <th key={question.id} className="border">
                    {`Q${index + 1}`}
                </th>)).flat()}
            </tr>
            {assignment.userFeedback?.map(row =>
                <ResultRow key={row.user?.id} pageSettings={pageSettings} row={row} assignment={assignment} />
            )}
        </tbody>
    </table>;
}

const feedbackNames: Record<QuizFeedbackMode, string> = {
    NONE: "No feedback for students",
    OVERALL_MARK: "Overall mark only",
    SECTION_MARKS: "Section-by-section mark breakdown",
    DETAILED_FEEDBACK: "Detailed feedback on each question",
};

const QuizTeacherFeedbackComponent = ({match: {params: {quizAssignmentId}}}: QuizTeacherFeedbackProps) => {
    const pageSettings = usePageSettings();
    const assignmentState = useSelector(selectors.quizzes.assignment);

    const dispatch = useDispatch();

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
                    if (dispatch(updateQuizAssignmentDueDate(numericQuizAssignmentId, newDate))) {
                        dispatch(showToast({color: "success", title: "Due date extended successfully", body: `This test is now due ${newDate.toLocaleDateString()}.`, timeout: 5000}));
                    }
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
                        <RS.Label for="feedbackMode" className="pr-1">Feedback mode:</RS.Label><br/>
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
                            href={`${API_PATH}/test/assignment/${assignment.id}/download`}
                            onClick={() => dispatch(getQuizAssignmentResultsSummaryCSV(assignment?.id || -1))}
                        >
                            Export as CSV
                        </RS.Button>
                    </RS.Col>
                </RS.Row>
                <div className={`assignment-progress-details bg-transparent ${pageSettings.colourBlind ? " colour-blind" : ""}`}>
                    <AssignmentProgressLegend pageSettings={pageSettings} showQuestionKey />
                    <ResultsTable assignment={assignment} pageSettings={pageSettings} />
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

export const QuizTeacherFeedback = withRouter(QuizTeacherFeedbackComponent);
