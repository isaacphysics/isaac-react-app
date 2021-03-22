import React, {useEffect} from "react";
import {useDispatch, useSelector} from "react-redux";
import {withRouter} from "react-router-dom";
import * as RS from "reactstrap";

import {ShowLoading} from "../../handlers/ShowLoading";
import {loadQuizAssignmentFeedback} from "../../../state/actions/quizzes";
import {selectors} from "../../../state/selectors";
import {TitleAndBreadcrumb} from "../../elements/TitleAndBreadcrumb";
import {GameboardItemState, IsaacQuizSectionDTO, Mark, QuizAssignmentDTO, QuizUserFeedbackDTO} from "../../../../IsaacApiTypes";
import {AssignmentProgressLegend, formatMark} from '../AssignmentProgress';
import {usePageSettings} from "../../../services/progress";
import {AppAssignmentProgress, PageSettings} from "../../../../IsaacAppTypes";

interface QuizTeacherFeedbackProps {
    match: {params: {quizAssignmentId: string}}
}

const pageHelp = <span>
    See the feedback for your students for this quiz assignment.
</span>;
export const teacherQuizzesCrumbs = [{title: "Set quizzes", to: `/set_quizzes`}];

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

function ResultsTable({assignment, pageSettings}: ResultsTableProps) {
    const quiz = assignment?.quiz;
    const sections: IsaacQuizSectionDTO[] = quiz?.children || [];

    function format(correct: number | undefined, outOf: number | undefined) {
        return formatMark(correct as number, outOf as number, pageSettings.formatAsPercentage);
    }

    return <table className="progress-table w-100 mb-5">
        <tbody>
        <tr>
            <th>&nbsp;</th>
            {sections.map(section => <th key={section.id}>{section.title}</th>)}
            <th>Overall</th>
        </tr>
        {assignment.userFeedback?.map(row => {
            let message;
            if (!row.user?.authorisedFullAccess) {
                message = "Not sharing";
            } else if (!row.feedback?.complete) {
                message = "Not completed";
            }
            const valid = message === undefined;
            return <tr key={row?.user?.id} className={`${row.user?.authorisedFullAccess ? "" : " not-authorised"}`} title={`${row.user?.givenName + " " + row.user?.familyName}`}>
                <th className="student-name">{row.user?.givenName} <span
                    className="d-none d-lg-inline"> {row.user?.familyName}</span></th>
                {!valid && <td colSpan={sections.length + 1}>{message}</td>}
                {valid && <>
                    {sections.map(section => {
                        const mark = row.feedback?.sectionMarks?.[section.id as string];
                        const outOf = quiz?.sectionTotals?.[section.id as string];
                        return <td key={section.id} className={markQuestionClasses(row, mark, outOf)}>{format(mark?.correct, outOf)}</td>;
                    })}
                    <td className="total-column">{format(row.feedback?.overallMark?.correct, quiz?.total)}</td>
                </>}
            </tr>;
        })}
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

        </ShowLoading>
    </RS.Container>;
};

export const QuizTeacherFeedback = withRouter(QuizTeacherFeedbackComponent);
