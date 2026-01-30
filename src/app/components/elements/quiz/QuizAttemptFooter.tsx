import {QuizAttemptProps, QuizPagination} from "./QuizContentsComponent";
import {
    mutationSucceeded,
    showSuccessToast,
    useAppDispatch,
    useMarkQuizAttemptAsCompleteMutation
} from "../../../state";
import {Link, useNavigate} from "react-router-dom";
import React from "react";
import {Spacer} from "../Spacer";
import {IsaacSpinner} from "../../handlers/IsaacSpinner";
import {Button} from "reactstrap";
import {confirmThen, siteSpecific} from "../../../services";
import {QuizSidebarLayout} from "./QuizSidebarLayout";

function extractSectionIdFromQuizQuestionId(questionId: string) {
    const ids = questionId.split("|", 3);
    return ids[0] + "|" + ids[1];
}

export function QuizAttemptFooter(props: QuizAttemptProps & {feedbackLink: string}) {
    const {attempt, page, sections, questions, pageLink} = props;
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const [markQuizAttemptAsComplete, {isLoading: submitting}] = useMarkQuizAttemptAsCompleteMutation();

    const submitQuiz = () => {
        void markQuizAttemptAsComplete(attempt.id as number)
            .then((result) => {
                if (mutationSucceeded(result)) {
                    dispatch(showSuccessToast("Test submitted successfully", "Your answers have been submitted successfully."));
                    void navigate(props.feedbackLink);
                }
            });
    };

    const sectionCount = Object.keys(sections).length;

    let controls;
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
        const submitButton = submitting ? <IsaacSpinner /> : allCompleted ? "Submit" : "Submit anyway";

        if (allCompleted) {
            controls = <>
                <Button color="keyline" tag={Link} to={pageLink(1)}>Review answers</Button>
                <Spacer/>
                All sections complete
                <Spacer/>
                <Button color={siteSpecific("keyline", "solid")} onClick={submitQuiz}>{submitButton}</Button>
            </>;
        } else {
            if (anyAnswered) {
                controls = <>
                    <div className="text-center">
                        <Button onClick={() => confirmThen("Are you sure? You haven't answered all of the questions", submitQuiz)}>{submitButton}</Button>
                    </div>
                    <Spacer/>
                    {totalCompleted} / {sectionCount} sections complete<br/>
                    <Spacer/>
                    <Button color={siteSpecific("keyline", "solid")} tag={Link} to={pageLink(firstIncomplete + 1)}>Continue</Button>
                </>;
            } else {
                controls = <>
                    <Spacer/>
                    <Button color={siteSpecific("keyline", "solid")} tag={Link} to={pageLink(1)}>Continue</Button>
                </>;
            }
        }
    } else {
        controls = <QuizPagination {...props} page={page} finalLabel="Finish"/>;
    }

    // Empty sidebar to match layout of quiz attempt component
    return <QuizSidebarLayout>
        {controls}
    </QuizSidebarLayout>;
}
