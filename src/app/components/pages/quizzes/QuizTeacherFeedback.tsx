import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {withRouter} from "react-router-dom";
import * as RS from "reactstrap";

import {ShowLoading} from "../../handlers/ShowLoading";
import {loadQuizAssignmentFeedback, returnQuizToStudent} from "../../../state/actions/quizzes";
import {selectors} from "../../../state/selectors";
import {TitleAndBreadcrumb} from "../../elements/TitleAndBreadcrumb";
import {IsaacQuizDTO, IsaacQuizSectionDTO, Mark, QuizAssignmentDTO, QuizUserFeedbackDTO} from "../../../../IsaacApiTypes";
import {AssignmentProgressLegend, formatMark} from '../AssignmentProgress';
import {usePageSettings} from "../../../services/progress";
import {PageSettings} from "../../../../IsaacAppTypes";
import {teacherQuizzesCrumbs} from "../../elements/quiz/QuizAttemptComponent";

interface QuizTeacherFeedbackProps {
    match: {params: {quizAssignmentId: string}}
}

const pageHelp = <span>
    See the feedback for your students for this quiz assignment.
</span>;

interface ResultsTableProps {
    assignment: QuizAssignmentDTO;
    pageSettings: PageSettings;
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

function ResultRow({pageSettings, row, assignment}: ResultRowProps) {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [working, setWorking] = useState(false);
    const dispatch = useDispatch();

    const toggle = () => setDropdownOpen(prevState => !prevState);

    const returnToStudent = async () => {
        try {
            setWorking(true);
            await dispatch(returnQuizToStudent(assignment.id as number, row.user?.id as number));
        } finally {
            setWorking(false);
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
    const valid = message === undefined;
    return <tr className={`${row.user?.authorisedFullAccess ? "" : " not-authorised"}`} title={`${row.user?.givenName + " " + row.user?.familyName}`}>
        <th className="student-name">
            {valid ?
                <RS.Dropdown isOpen={!working && dropdownOpen} toggle={toggle} disabled={working}>
                    <RS.DropdownToggle
                        tag="div"
                        tabIndex={0}
                        className="btn quiz-student-menu"
                        data-toggle="dropdown"
                        aria-expanded={dropdownOpen}
                        >
                        {row.user?.givenName}
                        <span className="d-none d-lg-inline"> {row.user?.familyName}</span>
                        <span className="quiz-student-menu-icon">
                            {working ? <RS.Spinner size="sm" /> : <img src="/assets/menu.svg" alt="Menu" />}
                        </span>
                    </RS.DropdownToggle>
                    <RS.DropdownMenu right>
                        <RS.DropdownItem onClick={returnToStudent}>Return to student</RS.DropdownItem>
                    </RS.DropdownMenu>
                </RS.Dropdown>
            :   <>
                    {row.user?.givenName}
                    <span className="d-none d-lg-inline"> {row.user?.familyName}</span>
                </>
            }
        </th>
        {!valid && <td colSpan={sections.length + 1}>{message}</td>}
        {valid && <>
            {sections.map(section => {
                const mark = row.feedback?.sectionMarks?.[section.id as string];
                const outOf = quiz?.sectionTotals?.[section.id as string];
                return <td key={section.id} className={markQuestionClasses(row, mark, outOf)}>
                    {formatMark(mark?.correct as number, outOf as number, pageSettings.formatAsPercentage)}
                </td>;
            })}
            <td className="total-column">
                {formatMark(row.feedback?.overallMark?.correct as number, quiz?.total as number, pageSettings.formatAsPercentage)}
            </td>
        </>}
    </tr>;
}

function ResultsTable({assignment, pageSettings}: ResultsTableProps) {
    const sections: IsaacQuizSectionDTO[] = assignment.quiz?.children || [];

    return <table className="progress-table w-100 mb-5">
        <tbody>
        <tr>
            <th>&nbsp;</th>
            {sections.map(section => <th key={section.id}>{section.title}</th>)}
            <th>Overall</th>
        </tr>
        {assignment.userFeedback?.map(row =>
            <ResultRow key={row.user?.id} pageSettings={pageSettings} row={row} assignment={assignment} />
        )}
        </tbody>
    </table>;
}

const QuizTeacherFeedbackComponent = ({match: {params: {quizAssignmentId}}}: QuizTeacherFeedbackProps) => {
    const pageSettings = usePageSettings();
    const assignmentState = useSelector(selectors.quizzes.assignment);

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(loadQuizAssignmentFeedback(parseInt(quizAssignmentId, 10)));
    }, [dispatch, quizAssignmentId]);

    const assignment = assignmentState && 'assignment' in assignmentState ? assignmentState.assignment : null;
    const error = assignmentState && 'error' in assignmentState ? assignmentState.error : null;
    const quizTitle = (assignment?.quiz?.title || assignment?.quiz?.id || "Quiz") + " results";

    return <RS.Container>
        <ShowLoading until={assignmentState}>
            {assignment && <>
                <TitleAndBreadcrumb currentPageTitle={quizTitle} help={pageHelp} intermediateCrumbs={teacherQuizzesCrumbs}/>
                <div className={"assignment-progress-details" + (pageSettings.colourBlind ? " colour-blind" : "")}>
                    <AssignmentProgressLegend pageSettings={pageSettings} />
                    <ResultsTable assignment={assignment} pageSettings={pageSettings} />
                </div>
            </>}
            {error && <>
                <TitleAndBreadcrumb currentPageTitle={quizTitle} help={pageHelp} intermediateCrumbs={teacherQuizzesCrumbs}/>
                <RS.Alert color="danger">
                    <h4 className="alert-heading">Error loading quiz feedback</h4>
                    <p>{error}</p>
                </RS.Alert>
            </>}
        </ShowLoading>
    </RS.Container>;
};

export const QuizTeacherFeedback = withRouter(QuizTeacherFeedbackComponent);
