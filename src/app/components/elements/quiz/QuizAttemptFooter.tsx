import {QuizAttemptProps, QuizPagination} from "./QuizAttemptComponent";
import {markQuizAttemptAsComplete, showToast, useAppDispatch} from "../../../state";
import {Link, useHistory} from "react-router-dom";
import React, {useState} from "react";
import {Spacer} from "../Spacer";
import {IsaacSpinner} from "../../handlers/IsaacSpinner";
import {Button} from "reactstrap";
import {isAda, siteSpecific} from "../../../services";

function extractSectionIdFromQuizQuestionId(questionId: string) {
    const ids = questionId.split("|", 3);
    return ids[0] + "|" + ids[1];
}

export function QuizAttemptFooter(props: QuizAttemptProps & {feedbackLink: string}) {
    const {attempt, page, sections, questions, pageLink} = props;
    const dispatch = useAppDispatch();
    const history = useHistory();
    const [submitting, setSubmitting] = useState(false);

    async function submitQuiz() {
        try {
            setSubmitting(true);
            if (await dispatch(markQuizAttemptAsComplete(attempt.id as number))) {
                dispatch(showToast({color: "success", title: "Test submitted successfully", body: "Your answers have been submitted successfully.", timeout: 5000}));
                history.push(props.feedbackLink);
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
                {
                    siteSpecific(
                        <Button color="tertiary" tag={Link} replace to={pageLink(1)}>Review answers</Button>,
                        <Button outline color="secondary" tag={Link} replace to={pageLink(1)}>Review answers</Button>
                    )
                }
                <Spacer/>
                All sections complete
                <Spacer/>
                <Button color={siteSpecific("secondary", "primary")} onClick={submitQuiz}>{submitButton}</Button>
            </>;
        } else {
            prequel = <p>Click &lsquo;{primaryButton}&rsquo; when you are ready to {primaryDescription} the test.</p>;
            if (anyAnswered) {
                controls = <>
                    <div className="text-center">
                        {totalCompleted} / {sectionCount} sections complete<br/>
                        <Button onClick={() => window.confirm("Are you sure? You haven't answered all of the questions") && submitQuiz()}>{submitButton}</Button>
                    </div>
                    <Spacer/>
                    <Button color={siteSpecific("secondary", "primary")} tag={Link} replace to={pageLink(firstIncomplete + 1)}>{primaryButton}</Button>
                </>;
            } else {
                controls = <>
                    <Spacer/>
                    <Button color={siteSpecific("secondary", "primary")} tag={Link} replace to={pageLink(1)}>{primaryButton}</Button>
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
