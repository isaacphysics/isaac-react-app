import React, {useCallback, useEffect} from "react";
import {clearQuizAttempt, loadFreeQuizAttempt, useAppDispatch} from "../../../state";
import {useParams} from "react-router-dom";
import {ShowLoading} from "../../handlers/ShowLoading";
import {getThemeFromTags, isDefined, useCurrentQuizAttempt} from "../../../services";
import {FullQuizInfo, myQuizzesCrumbs, QuizContentsComponent, QuizProps} from "../../elements/quiz/QuizContentsComponent";
import {IsaacQuizDTO, QuizAttemptDTO, RegisteredUserDTO} from "../../../../IsaacApiTypes";
import {TitleAndBreadcrumb} from "../../elements/TitleAndBreadcrumb";
import {QuizAttemptFooter} from "../../elements/quiz/QuizAttemptFooter";
import {useSectionViewLogging} from "../../elements/quiz/useSectionViewLogging";
import {Alert, Container} from "reactstrap";
import { Trans, useTranslation } from "react-i18next";
import { TransAnchor } from "../../elements/TransAnchor";

const pageHelp = <span>
    Answer the questions on each section of the test, then mark the test as complete to see your feedback.
</span>;

export const QuizDoFreeAttempt = ({user}: {user: RegisteredUserDTO}) => {
    const { t } = useTranslation();
    const {page, quizId} = useParams();
    const {attempt, questions, sections, error} = useCurrentQuizAttempt();

    const dispatch = useAppDispatch();

    useEffect(() => {
        if (isDefined(quizId)) {
            void dispatch(loadFreeQuizAttempt(quizId));
        }
        return () => {
            dispatch(clearQuizAttempt());
        };
    }, [dispatch, quizId]);

    const pageNumber = isDefined(page) ? parseInt(page, 10) : undefined;
    useSectionViewLogging(attempt, pageNumber);

    const assignedQuizError = error?.toString().includes("This test has been assigned to you by a teacher");

    const pageLink = useCallback((page?: number) =>
        `/test/attempt/${quizId}` + (isDefined(page) ? `/page/${page}` : "")
    , [quizId]);

    const feedbackLink = `/test/attempt/${attempt?.id}/feedback`;

    // Importantly, these are only used if attempt is defined
    const subProps: QuizProps & FullQuizInfo & {feedbackLink: string} = {
        user,
        pageHelp,
        page: pageNumber,
        quiz: attempt?.quiz as IsaacQuizDTO,
        attempt: attempt as QuizAttemptDTO,
        quizContents: {
            questions,
            sections,
            pageLink,
        },
        feedbackLink
    };

    return <Container data-testid="quiz-attempt" className="mb-7" data-bs-theme={getThemeFromTags(attempt?.quiz?.tags)}>
        <ShowLoading until={attempt || error}>
            {attempt && <>
                <QuizContentsComponent {...subProps}>
                    <QuizAttemptFooter {...subProps} />
                </QuizContentsComponent>
            </>}
            {error && <>
                <TitleAndBreadcrumb currentPageTitle={t("common:attempt.title")} intermediateCrumbs={myQuizzesCrumbs} icon={{type: "icon", icon: "icon-error"}} />
                <Alert color={assignedQuizError ? "warning" : "danger"} className="mt-4">
                    <h2 className="alert-heading h4">{assignedQuizError ? t("common:tests.attempt.assignedErrorTitle") : t("common:tests.attempt.loadErrorTitle")}</h2>
                    {!assignedQuizError && <p data-testid="error-message">{error}</p>}
                    {assignedQuizError && <>
                        <p><Trans
                            i18nKey="common:tests.attempt.assignedErrorBody"
                            components={{
                                br: <br />,
                                assignedTestsLink: <TransAnchor href={"/tests"} target="_self" rel="noopener noreferrer" />,
                            }}
                        />
                        </p>
                    </>}
                </Alert>
            </>}
        </ShowLoading>
    </Container>;
};
