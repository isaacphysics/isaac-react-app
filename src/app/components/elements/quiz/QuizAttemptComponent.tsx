import {IsaacQuizSectionDTO, QuestionDTO, QuizAttemptDTO} from "../../../../IsaacApiTypes";
import React from "react";
import {isDefined} from "../../../services/miscUtils";
import {extractTeacherName} from "../../../services/user";
import {Spacer} from "../Spacer";
import {formatDate} from "../DateString";
import {Link} from "react-router-dom";
import {QuizAttemptContext} from "../../content/QuizQuestion";
import {WithFigureNumbering} from "../WithFigureNumbering";
import {IsaacContent} from "../../content/IsaacContent";
import * as RS from "reactstrap";
import {TitleAndBreadcrumb} from "../TitleAndBreadcrumb";

type PageLinkCreator = (attempt: QuizAttemptDTO, page?: number) => string;

export interface QuizAttemptProps {
    attempt: QuizAttemptDTO;
    page: number | null;
    questions: QuestionDTO[];
    sections: { [id: string]: IsaacQuizSectionDTO };
    pageLink: PageLinkCreator;
    pageHelp: React.ReactElement;
}

function inSection(section: IsaacQuizSectionDTO, questions: QuestionDTO[]) {
    return questions.filter(q => q.id?.startsWith(section.id as string + "|"));
}

function QuizContents({attempt, sections, questions, pageLink}: QuizAttemptProps) {
    return isDefined(attempt.completedDate) ?
        attempt.feedbackMode === "NONE" ?
            <h4>No feedback available</h4>
        : attempt.feedbackMode === "OVERALL_MARK" ?
            <h4>Your mark is {attempt.quiz?.individualFeedback?.overallMark?.correct} / {attempt.quiz?.total}</h4>
        :
            <table className="quiz-marks-table">
                <tbody>
                <tr><th>Overall mark</th><td>{attempt.quiz?.individualFeedback?.overallMark?.correct} / {attempt.quiz?.total}</td></tr>
                <tr><th colSpan={2}>Section mark breakdown</th></tr>
                {Object.keys(sections).map((k, index) => {
                    const section = sections[k];
                    return <tr key={k}>
                        <td><Link replace to={pageLink(attempt, index + 1)}>{section.title}</Link></td>
                        <td>
                            {attempt.quiz?.individualFeedback?.sectionMarks?.[section.id as string]?.correct}
                            {" / "}
                            {attempt.quiz?.sectionTotals?.[section.id as string]}
                        </td>
                    </tr>;
                })}
                </tbody>
            </table>
    :
        <div>
            <h4>Quiz sections</h4>
            <ul>
                {Object.keys(sections).map((k, index) => {
                    const section = sections[k];
                    const questionsInSection = inSection(section, questions);
                    const answerCount = questionsInSection.filter(q => q.bestAttempt !== undefined).length;
                    const completed = questionsInSection.length === answerCount;
                    const started = answerCount > 0;
                    return <li key={k}>
                        <Link replace to={pageLink(attempt, index + 1)}>{section.title}</Link>
                        {" "}
                        <small className="text-muted">{completed ? "Completed" : started ? `${answerCount} / ${questionsInSection.length}` : ""}</small>
                    </li>;
                })}
            </ul>
        </div>;
}

function QuizHeader({attempt}: QuizAttemptProps) {
    const assignment = attempt.quizAssignment;
    if (isDefined(assignment)) {
        return <p className="d-flex">
            <span>
                Set by: {extractTeacherName(assignment.assignerSummary ?? null)}
                {isDefined(attempt.completedDate) && <><br />Completed:&nbsp;{formatDate(attempt.completedDate)}</>}
            </span>
            {isDefined(assignment.dueDate) && <><Spacer/>{isDefined(attempt.completedDate) ? "Was due:" : "Due:"}&nbsp;{formatDate(assignment.dueDate)}</>}
        </p>;
    } else {
        return <p>You are freely attempting this quiz.</p>
    }
}

function QuizSection({attempt, page}: { attempt: QuizAttemptDTO, page: number }) {
    const sections = attempt.quiz?.children;
    const section = sections && sections[page - 1];
    return section ?
        <WithFigureNumbering doc={section}>
            <IsaacContent doc={section}/>
        </WithFigureNumbering>
    :
        <RS.Alert color="danger">Quiz section {page} not found</RS.Alert>
    ;
}



export const myQuizzesCrumbs = [{title: "My quizzes", to: `/quizzes`}];
const QuizTitle = ({attempt, page, pageLink, pageHelp}: QuizAttemptProps) => {
    let quizTitle = attempt.quiz?.title || attempt.quiz?.id || "Quiz";
    if (isDefined(attempt.completedDate)) {
        quizTitle += " Feedback";
    }
    if (page === null) {
        return <TitleAndBreadcrumb currentPageTitle={quizTitle} help={pageHelp}
                                   intermediateCrumbs={myQuizzesCrumbs}/>;
    } else {
        const sections = attempt.quiz?.children;
        const section = sections && sections[page - 1] as IsaacQuizSectionDTO;
        const sectionTitle = section?.title ?? "Section " + page;
        return <TitleAndBreadcrumb currentPageTitle={sectionTitle} help={pageHelp}
                                   intermediateCrumbs={[...myQuizzesCrumbs, {title: quizTitle, to: pageLink(attempt)}]}/>;
    }
};

interface QuizPaginationProps {
    page: number;
    finalLabel: string;
}

export function QuizPagination({attempt, page, sections, pageLink, finalLabel}: QuizAttemptProps & QuizPaginationProps) {
    const sectionCount = Object.keys(sections).length;
    const backLink = pageLink(attempt, page > 1 ? page - 1 : undefined);
    const finalSection = page === sectionCount;
    const nextLink = pageLink(attempt, !finalSection ? page + 1 : undefined);
    return <>
        <RS.Button color="tertiary" tag={Link} replace to={backLink}>Back</RS.Button>
        <Spacer/>
        Section {page} / {sectionCount}
        <Spacer/>
        <RS.Button color="primary" tag={Link} replace to={nextLink}>{finalSection ? finalLabel : "Next"}</RS.Button>
    </>;
}

export function QuizAttemptComponent(props: QuizAttemptProps) {
    const {page} = props;
    return <QuizAttemptContext.Provider value={{quizAttemptId: props.attempt.id as number}}>
        <QuizTitle {...props} />
        {page === null ?
            <>
                <QuizHeader {...props} />
                <QuizContents {...props} />
            </>
            :
            <QuizSection {...props} page={page}/>
        }
    </QuizAttemptContext.Provider>;
}
