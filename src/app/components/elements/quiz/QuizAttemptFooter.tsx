import {FullQuizInfo, QuizPagination, QuizProps} from "./QuizContentsComponent";
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
import {confirmThen, isDefined, siteSpecific} from "../../../services";
import { useTranslation } from "react-i18next";

function extractSectionIdFromQuizQuestionId(questionId: string) {
    const ids = questionId.split("|", 3);
    return ids[0] + "|" + ids[1];
}

export function QuizAttemptFooter(props: QuizProps & FullQuizInfo & {feedbackLink: string}) {
    const { t } = useTranslation();
    const {attempt, page, quizContents: {sections, questions, pageLink}} = props;
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const [markQuizAttemptAsComplete, {isLoading: submitting}] = useMarkQuizAttemptAsCompleteMutation();

    const submitQuiz = () => {
        void markQuizAttemptAsComplete(attempt.id as number)
            .then((result) => {
                if (mutationSucceeded(result)) {
                    dispatch(showSuccessToast(t("common:tests.attempt.submitToastTitle"), t("common:tests.attempt.submitToastBody")));
                    void navigate(props.feedbackLink);
                }
            });
    };

    const sectionCount = Object.keys(sections).length;

    let controls;
    if (!isDefined(page)) {
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
        const submitButton = submitting ? <IsaacSpinner /> : allCompleted ? "Submit" : t("common:tests.attempt.submitAnyway");

        if (allCompleted) {
            controls = <>
                <Button color="keyline" tag={Link} to={pageLink(1)}>{t("common:tests.attempt.reviewAnswers")}</Button>
                <Spacer/>
                {t("common:tests.attempt.allComplete")}
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
                    {t("common:tests.attempt.sectionsComplete", { completedCount: totalCompleted, totalCount: sectionCount })}<br/>
                    <Spacer/>
                    <Button color={siteSpecific("keyline", "solid")} tag={Link} to={pageLink(firstIncomplete + 1)}>{t("common:tests.attempt.continue")}</Button>
                </>;
            } else {
                controls = <>
                    <Spacer/>
                    <Button color={siteSpecific("keyline", "solid")} tag={Link} to={pageLink(1)}>{t("common:tests.attempt.continue")}</Button>
                </>;
            }
        }
    } else {
        controls = <QuizPagination {...props} page={page} finalLabel={t("common:tests.attempt.finish")}/>;
    }

    return <div className="d-flex w-100 align-items-center mt-2 gap-2 mt-4 pt-2 border-top">
        {controls}
    </div>;
}
