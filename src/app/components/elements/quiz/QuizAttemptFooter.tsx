import {QuizAttemptProps, QuizPagination} from "./QuizAttemptComponent";
import {useAppDispatch} from "../../../state/store";
import {Link, useHistory} from "react-router-dom";
import React, {useState} from "react";
import {markQuizAttemptAsComplete} from "../../../state/actions/quizzes";
import {showToast} from "../../../state/actions";
import * as RS from "reactstrap";
import {Spacer} from "../Spacer";
import {IsaacSpinner} from "../../handlers/IsaacSpinner";

function extractSectionIdFromQuizQuestionId(questionId: string) {
    const ids = questionId.split("|", 3);
    return ids[0] + "|" + ids[1];
}

export function QuizAttemptFooter(props: QuizAttemptProps) {
    const {attempt, page, sections, questions, pageLink} = props;
    const dispatch = useAppDispatch();
    const history = useHistory();
    const [submitting, setSubmitting] = useState(false);

    async function submitQuiz() {
        try {
            setSubmitting(true);
            if (await dispatch(markQuizAttemptAsComplete(attempt.id as number))) {
                dispatch(showToast({color: "success", title: "Test submitted successfully", body: "Your answers have been submitted successfully.", timeout: 5000}));
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
        const submitButton = submitting ? <IsaacSpinner /> : allCompleted ? "Submit" : "Submit anyway";

        if (allCompleted) {
            controls = <>
                <RS.Button color="tertiary" tag={Link} replace to={pageLink(attempt, 1)}>Review answers</RS.Button>
                <Spacer/>
                All sections complete
                <Spacer/>
                <RS.Button color="primary" onClick={submitQuiz}>{submitButton}</RS.Button>
            </>;
        } else {
            prequel = <p>Click &lsquo;{primaryButton}&rsquo; when you are ready to {primaryDescription} the test.</p>;
            if (anyAnswered) {
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
        controls = <QuizPagination {...props} page={page} finalLabel="Finish"/>;
    }

    return <>
        {prequel}
        <div className="d-flex border-top pt-2 my-2 align-items-center">
            {controls}
        </div>
    </>;
}
