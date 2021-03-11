import React, {useEffect, useMemo, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Link, withRouter, useHistory} from "react-router-dom";
import * as RS from "reactstrap";

import {ShowLoading} from "../../handlers/ShowLoading";
import {selectors} from "../../../state/selectors";
import {TitleAndBreadcrumb} from "../../elements/TitleAndBreadcrumb";
import {loadQuizAssignmentAttempt, markQuizAttemptAsComplete} from "../../../state/actions/quizzes";
import {IsaacQuizSectionDTO, QuestionDTO, QuizAttemptDTO} from "../../../../IsaacApiTypes";
import {WithFigureNumbering} from "../../elements/WithFigureNumbering";
import {IsaacContent} from "../../content/IsaacContent";
import {isDefined} from "../../../services/miscUtils";
import {extractTeacherName} from "../../../services/user";
import {formatDate} from "../../elements/DateString";
import {Spacer} from "../../elements/Spacer";
import {QuizAttemptContext} from "../../content/QuizQuestion";
import {deregisterQuestion, registerQuestion, showToast} from "../../../state/actions";
import {extractQuestions} from "../../../services/quiz";

interface QuizDoAsssignmentProps {
    match: {params: {quizAssignmentId: string, page: string}}
}

function pageLink(attempt: QuizAttemptDTO, page?: number) {
    if (page !== undefined) {
        return `/quiz/assignment/${attempt.quizAssignmentId}/page/${page}`;
    } else {
        return `/quiz/assignment/${attempt.quizAssignmentId}`;
    }
}

interface QuizViewerProps {
    attempt: QuizAttemptDTO;
    page: number | null;
    questions: QuestionDTO[];
    sections: {[id: string]: IsaacQuizSectionDTO};
}

function inSection(section: IsaacQuizSectionDTO, questions: QuestionDTO[]) {
    return questions.filter(q => q.id?.startsWith(section.id as string + "|"));
}

function QuizContents({attempt, sections, questions}: QuizViewerProps) {
    return <div>
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

function QuizHeader({attempt}: QuizViewerProps) {
    const assignment = attempt.quizAssignment;
    if (isDefined(assignment)) {
        return <p className="d-flex">
            Set by: {extractTeacherName(assignment.assignerSummary ?? null)}
            {isDefined(assignment.dueDate) && <><Spacer />Due: {formatDate(assignment.dueDate)}</>}
        </p>;
    } else {
        return <p>You are freely attempting this quiz.</p>
    }
}

function extractSectionIdFromQuizQuestionId(questionId: string) {
    const ids = questionId.split("|", 3);
    return ids[0] + "|" + ids[1];
}

function QuizFooter({attempt, page, sections, questions}: QuizViewerProps) {
    const dispatch = useDispatch();
    const history = useHistory();
    const [submitting, setSubmitting] = useState(false);
    async function submitQuiz() {
        try {
            setSubmitting(true);
            await dispatch(markQuizAttemptAsComplete(attempt.id as number));
            history.goBack();
            dispatch(showToast({color: "success", title: "Quiz submitted successfully", body: "Your answers have been submitted successfully.", timeout: 5000}));
        } finally {
            setSubmitting(false);
        }
    }

    const sectionCount = Object.keys(sections).length;

    let controls;
    let prequel = null;
    if (page === null) {
        let anyAnswered = false;
        const completedSections = Object.keys(sections).reduce((map, sectionId) => {
            map[sectionId] = true;
            return map;
        }, {} as {[key: string]: boolean});
        questions.forEach(question => {
            const sectionId = extractSectionIdFromQuizQuestionId(question.id as string);
            if (question.bestAttempt === undefined) {
                completedSections[sectionId] = false;
            } else {
                anyAnswered = true;
            }
        });
        const totalCompleted = Object.values(completedSections).reduce((sum, complete) => sum + (complete ? 1 : 0), 0);
        const firstIncomplete = Object.values(completedSections).indexOf(false);
        const allCompleted = totalCompleted === sectionCount;

        const primaryButton = anyAnswered ? "Continue" : "Start";
        const primaryDescription = anyAnswered ? "resume" : "begin";
        const submitButton = submitting ? <RS.Spinner /> : allCompleted ? "Submit" : "Submit anyway";

        if (allCompleted) {
            controls = <>
                <RS.Button color="tertiary" tag={Link} replace to={pageLink(attempt, 1)}>Review answers</RS.Button>
                <Spacer/>
                All sections complete
                <Spacer/>
                <RS.Button color="primary" onClick={submitQuiz}>{submitButton}</RS.Button>
            </>;
        } else {
            prequel = <p>Click &lsquo;{primaryButton}&rsquo; when you are ready to {primaryDescription} the quiz.</p>;
            if (totalCompleted > 0) {
                controls = <>
                    <div className="text-center">
                        {totalCompleted} / {sectionCount} sections complete<br/>
                        <RS.Button onClick={() => window.confirm("Are you sure? You haven't answered all of the questions") && submitQuiz()}>{submitButton}</RS.Button>
                    </div>
                    <Spacer />
                    <RS.Button color="primary" tag={Link} replace to={pageLink(attempt, firstIncomplete + 1)}>{primaryButton}</RS.Button>
                </>;
            } else {
                controls = <>
                    <Spacer />
                    <RS.Button color="primary" tag={Link} replace to={pageLink(attempt, 1)}>{primaryButton}</RS.Button>
                </>;
            }
        }
    } else {
        const backLink = pageLink(attempt, page > 1 ? page - 1 : undefined);
        const finalSection = page === sectionCount;
        const nextLink = pageLink(attempt, !finalSection ? page + 1 : undefined);
        controls = <>
            <RS.Button color="tertiary" tag={Link} replace to={backLink}>Back</RS.Button>
            <Spacer />
            Section {page} / {sectionCount}
            <Spacer />
            <RS.Button color="primary" tag={Link} replace to={nextLink}>{finalSection ? "Finish" : "Next"}</RS.Button>
        </>;
    }

    return <>
        {prequel}
        <div className="d-flex border-top pt-2 my-2 align-items-center">
            {controls}
        </div>
    </>;
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

function QuizViewer(props: QuizViewerProps) {
    const {page} = props;
    return <div>
        {page === null ?
            <>
                <QuizHeader {...props} />
                <QuizContents {...props} />
            </>
        :
            <QuizSection {...props} page={page} />
        }
        <QuizFooter {...props} />
    </div>
}

const pageHelp = <span>
    Answer the questions on each section of the quiz, then mark the quiz as complete when you are finished.
</span>;
const intermediateCrumbs = [{title: "My quizzes", to: `/quizzes`}];
function QuizTitle({attempt, page}: QuizViewerProps) {
    const quizTitle = attempt.quiz?.title || attempt.quiz?.id || "Quiz";
    if (page === null) {
        return <TitleAndBreadcrumb currentPageTitle={quizTitle} help={pageHelp}
                                   intermediateCrumbs={intermediateCrumbs} />;
    } else {
        const sections = attempt.quiz?.children;
        const section = sections && sections[page - 1] as IsaacQuizSectionDTO;
        const sectionTitle = section?.title ?? "Section " + page;
        return <TitleAndBreadcrumb currentPageTitle={sectionTitle} help={pageHelp}
                                   intermediateCrumbs={[...intermediateCrumbs, {title: quizTitle, to: pageLink(attempt)}]} />;
    }
}

function QuizAttemptEditor(props: QuizViewerProps) {
    return <QuizAttemptContext.Provider value={{quizAttemptId: props.attempt.id as number}}>
        <QuizTitle {...props} />
        <QuizViewer {...props} />
    </QuizAttemptContext.Provider>;
}

const QuizDoAsssignmentComponent = ({match: {params: {quizAssignmentId, page}}}: QuizDoAsssignmentProps) => {
    const attemptState = useSelector(selectors.quizzes.currentQuizAttempt);
    const attempt = isDefined(attemptState) && 'attempt' in attemptState ? attemptState.attempt : null;
    const questions = useMemo(() => {
        return extractQuestions(attempt?.quiz);
    }, [attempt?.quiz]);
    const sections = useMemo(() => {
        const sections: {[id: string]: IsaacQuizSectionDTO} = {};
        attempt?.quiz?.children?.forEach(section => {
            sections[section.id as string] = section as IsaacQuizSectionDTO;
        });
        return sections;
    }, [attempt?.quiz]);

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(loadQuizAssignmentAttempt(parseInt(quizAssignmentId, 10)));
    }, [dispatch, quizAssignmentId]);

    useEffect( () => {
        questions.forEach(question => dispatch(registerQuestion(question)));
        const ids = questions.map(q => q.id as string);
        return () => {
            ids.forEach(id => dispatch(deregisterQuestion(id)));
        };
    }, [dispatch, questions]);

    const pageNumber = isDefined(page) ? parseInt(page, 10) : null;

    return <RS.Container>
        <ShowLoading until={attemptState} >
            {attempt && <QuizAttemptEditor attempt={attempt} page={pageNumber} questions={questions} sections={sections}/>}
            {attemptState && 'error' in attemptState && <>
                <TitleAndBreadcrumb currentPageTitle="Quiz"
                                    intermediateCrumbs={intermediateCrumbs} />
                <RS.Alert color="danger">
                    <h4 className="alert-heading">Error loading assignment!</h4>
                    <p>{attemptState.error}</p>
                </RS.Alert>
            </>}
        </ShowLoading>
    </RS.Container>;
};

export const QuizDoAsssignment = withRouter(QuizDoAsssignmentComponent);
