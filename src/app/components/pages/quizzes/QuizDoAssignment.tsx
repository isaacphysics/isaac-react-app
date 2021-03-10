import React, {useEffect, useState} from "react";
import {useDispatch} from "react-redux";
import {Link, useHistory, withRouter} from "react-router-dom";
import * as RS from "reactstrap";

import {ShowLoading} from "../../handlers/ShowLoading";
import {loadQuizAssignmentAttempt, markQuizAttemptAsComplete} from "../../../state/actions/quizzes";
import {isDefined} from "../../../services/miscUtils";
import {deregisterQuestion, registerQuestion, showToast} from "../../../state/actions";
import {useCurrentQuizAttempt} from "../../../services/quiz";
import {myQuizzesCrumbs, QuizAttemptComponent, QuizAttemptProps, QuizPagination} from "../../elements/quiz/QuizAttemptComponent";
import {QuizAttemptDTO} from "../../../../IsaacApiTypes";
import {Spacer} from "../../elements/Spacer";
import {TitleAndBreadcrumb} from "../../elements/TitleAndBreadcrumb";

interface QuizDoAsssignmentProps {
    match: {params: {quizAssignmentId: string, page: string}}
}

const pageLink = (attempt: QuizAttemptDTO, page?: number) => {
    if (page !== undefined) {
        return `/quiz/assignment/${attempt.quizAssignmentId}/page/${page}`;
    } else {
        return `/quiz/assignment/${attempt.quizAssignmentId}`;
    }
};


function extractSectionIdFromQuizQuestionId(questionId: string) {
    const ids = questionId.split("|", 3);
    return ids[0] + "|" + ids[1];
}

function QuizFooter(props: QuizAttemptProps) {
    const {attempt, page, sections, questions, pageLink} = props;
    const dispatch = useDispatch();
    const history = useHistory();
    const [submitting, setSubmitting] = useState(false);

    async function submitQuiz() {
        try {
            setSubmitting(true);
            if (await dispatch(markQuizAttemptAsComplete(attempt.id as number))) {
                dispatch(showToast({color: "success", title: "Quiz submitted successfully", body: "Your answers have been submitted successfully.", timeout: 5000}));
                history.goBack();
            }
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
        }, {} as { [key: string]: boolean });
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
        const submitButton = submitting ? <RS.Spinner/> : allCompleted ? "Submit" : "Submit anyway";

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
                    <Spacer/>
                    <RS.Button color="primary" tag={Link} replace to={pageLink(attempt, firstIncomplete + 1)}>{primaryButton}</RS.Button>
                </>;
            } else {
                controls = <>
                    <Spacer/>
                    <RS.Button color="primary" tag={Link} replace to={pageLink(attempt, 1)}>{primaryButton}</RS.Button>
                </>;
            }
        }
    } else {
        controls = <QuizPagination {...props} page={page} finalLabel="Finish" />;
    }

    return <>
        {prequel}
        <div className="d-flex border-top pt-2 my-2 align-items-center">
            {controls}
        </div>
    </>;
}

const pageHelp = <span>
    Answer the questions on each section of the quiz, then mark the quiz as complete when you are finished.
</span>;

const QuizDoAsssignmentComponent = ({match: {params: {quizAssignmentId, page}}}: QuizDoAsssignmentProps) => {
    const {attempt, questions, sections, error} = useCurrentQuizAttempt();

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

    const subProps: QuizAttemptProps = {attempt: attempt as QuizAttemptDTO, page: pageNumber, questions, sections, pageLink, pageHelp};

    return <RS.Container>
        <ShowLoading until={attempt || error}>
            {attempt && <>
                <QuizAttemptComponent {...subProps} />
                <QuizFooter {...subProps} />
            </>}
            {error && <>
                <TitleAndBreadcrumb currentPageTitle="Quiz" intermediateCrumbs={myQuizzesCrumbs} />
                <RS.Alert color="danger">
                    <h4 className="alert-heading">Error loading assignment!</h4>
                    <p>{error}</p>
                </RS.Alert>
            </>}
        </ShowLoading>
    </RS.Container>;
};

export const QuizDoAsssignment = withRouter(QuizDoAsssignmentComponent);
