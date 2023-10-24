import React, {useContext, useMemo, useState} from "react";
import {closeActiveModal, openActiveModal, useAppDispatch, useReturnQuizToStudentMutation} from "../../../state";
import {Button} from "reactstrap";
import {
    ContentBaseDTO,
    IsaacQuizDTO,
    IsaacQuizSectionDTO,
    Mark,
    QuizAssignmentDTO,
    QuizUserFeedbackDTO
} from "../../../../IsaacApiTypes";
import {AssignmentProgressPageSettingsContext} from "../../../../IsaacAppTypes";
import {isDefined, isQuestion, PATHS, QUIZ_VIEW_STUDENT_ANSWERS_RELEASE_TIMESTAMP, siteSpecific} from "../../../services";
import {IsaacSpinner} from "../../handlers/IsaacSpinner";
import {Link} from "react-router-dom";

export const ICON = siteSpecific(
    {
        correct: <svg style={{width: 30, height: 30}}><use href={`/assets/tick-rp-hex.svg#icon`} xlinkHref={`/assets/tick-rp-hex.svg#icon`}/></svg>,
        incorrect: <svg style={{width: 30, height: 30}}><use href={`/assets/cross-rp-hex.svg#icon`} xlinkHref={`/assets/cross-rp-hex.svg#icon`}/></svg>,
        notAttempted: <svg  style={{width: 30, height: 30}}><use href={`/assets/dash-hex.svg#icon`} xlinkHref={`/assets/dash-hex.svg#icon`}/></svg>,
    },
    {
        correct: <img src="/assets/tick-rp.svg" alt="Correct" style={{width: 30}} />,
        incorrect: <img src="/assets/cross-rp.svg" alt="Incorrect" style={{width: 30}} />,
        notAttempted: <img src="/assets/dash.svg" alt="Not attempted" style={{width: 30}} />,
    }
);

interface ResultsTableProps {
    assignment: QuizAssignmentDTO;
    userFeedback: QuizUserFeedbackDTO[] | undefined;
}

interface ResultRowProps {
    row: QuizUserFeedbackDTO;
    assignment: QuizAssignmentDTO;
}

export function questionsInSection(section?: IsaacQuizSectionDTO) {
    return section?.children?.filter(isQuestion) || [];
}

export function questionsInQuiz(quiz?: IsaacQuizDTO) {
    const questions: ContentBaseDTO[] = []
    quiz?.children?.forEach(
        section => {
            questions.push(...questionsInSection(section))
        }
    )
    return questions;
}

export const passMark = 0.75;

export function markQuestionClasses(row: QuizUserFeedbackDTO, mark: Mark | undefined, totalOrUndefined: number | undefined) {
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

export function formatMark(numerator: number, denominator: number, formatAsPercentage: boolean) {
    let result;
    if (formatAsPercentage) {
        result = denominator !== 0 ? Math.round(100 * numerator / denominator) + "%" : "100%";
    } else {
        result = numerator + "/" + denominator;
    }
    return result;
}

export function ResultRow({row, assignment}: ResultRowProps) {
    const dispatch = useAppDispatch();
    const pageSettings = useContext(AssignmentProgressPageSettingsContext);

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const toggle = () => setDropdownOpen(prevState => !prevState);

    const [returnQuizToStudent, {isLoading: returningQuizToStudent}] = useReturnQuizToStudentMutation();
    const returnToStudent = () => {
        const confirm = () => {
            returnQuizToStudent({quizAssignmentId: assignment.id as number, userId: row.user?.id as number})
                .then(() => dispatch(closeActiveModal()));
        };
        dispatch(openActiveModal({
            closeAction: () => dispatch(closeActiveModal()),
            title: "Allow another attempt?",
            body: "This will allow the student to attempt the test again.",
            buttons: [
                <Button key={1} color="primary" outline target="_blank" onClick={() => dispatch(closeActiveModal())}>
                    Cancel
                </Button>,
                <Button key={0} color="primary" target="_blank" onClick={confirm}>
                    Confirm
                </Button>,
        ]
        }));
    };

    const quiz = assignment?.quiz;
    const sections: IsaacQuizSectionDTO[] = quiz?.children || [];

    let message;
    if (!row.user?.authorisedFullAccess) {
        message = "Not sharing";
    } else if (!row.feedback?.complete) {
        message = "Not completed";
    }
    const authorisedAccessAndComplete = message === undefined;

    const viewAnswersLink = `/test/attempt/feedback/${assignment?.id}/${row.user?.id}`;
    const canViewQuizAnswers = isDefined(assignment?.creationDate) && (assignment?.creationDate?.valueOf() > QUIZ_VIEW_STUDENT_ANSWERS_RELEASE_TIMESTAMP);

    return <tr className={`${row.user?.authorisedFullAccess ? "" : " not-authorised"}`} title={`${row.user?.givenName} ${row.user?.familyName}`}>
        <td className="student-name">
            {authorisedAccessAndComplete ?
                <>
                    <Button className="quiz-student-menu" color="link" onClick={toggle} disabled={returningQuizToStudent}>
                        <div
                            className="quiz-student-name"
                        >
                            {row.user?.givenName}
                            <span className="d-none d-lg-inline"> {row.user?.familyName}</span>
                        </div>
                        <div className="quiz-student-menu-icon">
                            {returningQuizToStudent ? <IsaacSpinner size="sm" /> : <img src="/assets/menu.svg" alt="Menu" />}
                        </div>
                    </Button>
                    {!returningQuizToStudent && dropdownOpen && <>
                        <div className="py-2 px-3">
                            <Button size="sm" onClick={returnToStudent}>Allow another attempt</Button>
                        </div>
                        {canViewQuizAnswers && <div className="py-2 px-3">
                            <Button size="sm" tag={Link} to={viewAnswersLink}>View answers</Button>
                        </div>}
                    </>}
                </>
            :   <>
                    {row.user?.givenName}
                    <span className="d-none d-lg-inline"> {row.user?.familyName}</span>
                </>
            }
        </td>
        {!authorisedAccessAndComplete && <td colSpan={sections.map(questionsInSection).flat().length + 1}>{message}</td>}
        {authorisedAccessAndComplete && <>
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
            <th className="total-column">
                {formatMark(row.feedback?.overallMark?.correct as number, quiz?.total as number, pageSettings.formatAsPercentage)}
            </th>
        </>}
    </tr>;
}

export function ResultsTable({assignment, userFeedback}: ResultsTableProps) {
    const sections: IsaacQuizSectionDTO[] = assignment.quiz?.children || [];
    const quiz: IsaacQuizDTO | undefined = assignment.quiz;

    const fractionCorrect = (questionId: string) => {
        if (!assignment.userFeedback) return [0, 0];
        const marks = assignment.userFeedback.map(row => row.feedback?.questionMarks?.[questionId]);
        const definedMarks = marks?.filter(isDefined);
        if (!definedMarks || definedMarks.length === 0) return [0, 0];
        const correct = definedMarks.reduce((p, c) => p + (c.correct ?? 0), 0);
        const total = assignment.userFeedback.length * ((definedMarks[0].correct ?? 0) + (definedMarks[0].incorrect ?? 0) + (definedMarks[0].notAttempted ?? 0));
        return [correct, total];
    };

    const quizAverages = sections.map(section => {
        return section.children?.reduce((acc, question) => {
            const [correct, total] = fractionCorrect(question.id ?? "");
            return acc + (total > 0 ? correct / total : 0);
        }, 0) ?? 0;
    });

    const tableHeaderFooter = (isFooter = false) => {
        return <tr>
            {isFooter ? <th className="bg-white border-bottom student-name"/> : <></>}
            {questionsInQuiz(quiz).map((question, index) => {
                const [correct, total] = fractionCorrect(question.id ?? "");
                return <th key={index + "" + question.id} className="border">
                    {formatMark(correct, total, true)}
                </th>;
            }).flat()}
            <th className="border-bottom total-column">
                {(quizAverages && quiz?.total) ? formatMark(quizAverages.reduce((p, c) => p + c, 0), quiz?.total, true) : "N/A"}
            </th>
        </tr>;
    };

    return <>
        <div className="progress-header">
            {userFeedback
            ? <>
                <strong>{userFeedback.reduce((p, c) => p + (c.feedback?.complete ? 1 : 0), 0)}</strong> of <strong>{userFeedback.length}</strong>
                {` students have completed the test `}
            </>
            : 'Preview '}
            <Link to={`${PATHS.PREVIEW_TEST}/${assignment.quizId}/page/1`}>{assignment.quiz?.title}</Link>.
        </div>
        <div className={"progress-table-container mb-5"}>
            <table className="progress-table border w-100">
                <tbody>
                    <tr className="bg-white">
                        <th rowSpan={3} className="bg-white border-bottom student-name">&nbsp;</th>
                            {sections.map(section => <th key={section.id} colSpan={questionsInSection(section).length} className="border font-weight-bold">
                                {section.title}
                            </th>)}
                        <th rowSpan={2} className="border-bottom total-column">Overall</th>
                    </tr>
                    <tr className="bg-white">
                        {questionsInQuiz(quiz).map((question, index) => <th key={question.id} className="border">
                            {`Q${index + 1}`}
                        </th>).flat()}
                    </tr>
                    {tableHeaderFooter()}
                    {assignment.userFeedback?.map(row =>
                        <ResultRow key={row.user?.id} row={row} assignment={assignment} />
                    )}
                    {tableHeaderFooter(true)}
                </tbody>
            </table>
        </div>
    </>;
}