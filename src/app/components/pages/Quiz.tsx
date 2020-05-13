import React, {useEffect} from "react";
import {withRouter} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import * as RS from "reactstrap";
import {
    closeActiveModal,
    fetchDoc,
    openActiveModal,
    redirectForCompletedQuiz,
    submitQuizPage
} from "../../state/actions";
import {ShowLoading} from "../handlers/ShowLoading";
import {IsaacContent} from "../content/IsaacContent";
import {IsaacQuestionPageDTO} from "../../../IsaacApiTypes";
import {ACCEPTED_QUIZ_IDS, DOCUMENT_TYPE} from "../../services/constants";
import {RelatedContent} from "../elements/RelatedContent";
import {WithFigureNumbering} from "../elements/WithFigureNumbering";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {EditContentButton} from "../elements/EditContentButton";
import {doc as selectDoc, questions} from "../../state/selectors";
import {DocumentSubject} from "../../../IsaacAppTypes";
import {TrustedMarkdown} from "../elements/TrustedMarkdown";

export const Quiz = withRouter(({match}: {match: {path: string; params: {quizId: string}}}) => {
    const dispatch = useDispatch();
    const doc = useSelector(selectDoc.ifQuizId(match.params.quizId));
    const allQuestionsAttempted = useSelector(questions.allQuestionsAttempted());
    const anyQuestionPreviouslyAttempted = useSelector(questions.anyQuestionPreviouslyAttempted());

    function submitQuiz(event: React.FormEvent) {
        if (event) {event.preventDefault();}
        dispatch(openActiveModal({
            title: "Quiz submission confirmation",
            body: <div className="text-center">
                You can only submit answers to this quiz once. <br />
                Please confirm whether or not you would like to submit your current answers to this quiz.
            </div>,
            buttons: [
                <RS.Button key={2} color="primary" outline onClick={() => dispatch(closeActiveModal())}>
                    Cancel
                </RS.Button>,
                <RS.Button key={0} color="secondary" onClick={() => {
                    dispatch(submitQuizPage(match.params.quizId));
                    dispatch(closeActiveModal());
                }}>
                    Submit answers
                </RS.Button>
            ]
        }));
    }

    useEffect(() => {
        if (ACCEPTED_QUIZ_IDS.includes(match.params.quizId)) {
            dispatch(fetchDoc(DOCUMENT_TYPE.QUESTION, match.params.quizId));
        }
    }, [match.params.quizId]);

    useEffect(() => {
        if (doc && anyQuestionPreviouslyAttempted) {
            dispatch(redirectForCompletedQuiz(match.params.quizId));
        }
    }, [anyQuestionPreviouslyAttempted, match.params.quizId]);

    return <ShowLoading until={doc} thenRender={supertypedDoc => {
        const doc = supertypedDoc as IsaacQuestionPageDTO & DocumentSubject;
        return <div className={`pattern-01 ${doc.subjectId || ""}`}>
            <RS.Container>
                <TitleAndBreadcrumb currentPageTitle={doc.title as string} />
                <EditContentButton doc={doc} />

                <RS.Row>
                    <RS.Col md={{size: 8, offset: 2}} className="py-4 question-panel">
                        <RS.Form onSubmit={submitQuiz}>
                            <WithFigureNumbering doc={doc}>
                                <IsaacContent doc={doc} />
                            </WithFigureNumbering>

                            <div className="simple-card text-center mt-4 py-4">
                                {!allQuestionsAttempted && <div id="disabled-button-explanation" className="mb-3">
                                    You must attempt every question before submitting.
                                </div>}
                                <input
                                    type="submit" value="Submit answers" className="btn btn-xl btn-secondary border-0"
                                    disabled={!allQuestionsAttempted} aria-describedby="disabled-button-explanation"
                                />
                            </div>

                            {doc.attribution && <p className="text-muted"><TrustedMarkdown markdown={doc.attribution}/></p>}
                        </RS.Form>

                        {doc.relatedContent && <RelatedContent content={doc.relatedContent} parentPage={doc} />}
                    </RS.Col>
                </RS.Row>
            </RS.Container>
        </div>
    }}/>;
});
