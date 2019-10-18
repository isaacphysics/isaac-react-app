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
import {AppState} from "../../state/reducers";
import {ContentBase} from "../../../IsaacApiTypes";
import {ACCEPTED_QUIZ_IDS, DOCUMENT_TYPE, EDITOR_URL, NOT_FOUND} from "../../services/constants";
import {RelatedContent} from "../elements/RelatedContent";
import {WithFigureNumbering} from "../elements/WithFigureNumbering";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {EditContentButton} from "../elements/EditContentButton";
import {questions} from "../../state/selectors";

export const Quiz = withRouter(({match}: {match: {path: string; params: {quizId: string}}}) => {
    const dispatch = useDispatch();
    // Report 404 NOT_FOUND if quiz ID is not an accepted quiz ID
    const doc = useSelector((state: AppState) => ACCEPTED_QUIZ_IDS.includes(match.params.quizId) ? (state && state.doc) || null : NOT_FOUND);
    const allQuestionsAttempted = useSelector(questions.allQuestionsAttempted);
    const anyQuestionPreviouslyAttempted = useSelector(questions.anyQuestionPreviouslyAttempted);
    const segueEnvironment = useSelector((state: AppState) => state && state.constants && state.constants.segueEnvironment || "unknown");

    function submitQuiz(event: React.FormEvent) {
        if (event) {event.preventDefault();}
        dispatch(openActiveModal({
            title: "Quiz submission confirmation",
            body: <div className="text-center">
                You are only allowed to submit answers to this quiz once. <br />
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
                    Submit
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

    return <ShowLoading until={doc} thenRender={doc =>
        <div className="pattern-01">
            <RS.Container>
                <TitleAndBreadcrumb currentPageTitle={doc.title as string} />

                {segueEnvironment === "DEV" && (doc as ContentBase).canonicalSourceFile &&
                    <EditContentButton canonicalSourceFile={EDITOR_URL + (doc as ContentBase)['canonicalSourceFile']} />
                }

                <RS.Row>
                    <RS.Col md={{size: 8, offset: 2}} className="py-4 question-panel">
                        <RS.Form onSubmit={submitQuiz}>
                            <WithFigureNumbering doc={doc}>
                                <IsaacContent doc={doc} />
                            </WithFigureNumbering>

                            <div className="simple-card text-center mt-4 py-4">
                                {!allQuestionsAttempted && <div id="disabled-button-explanation" className="mb-3">
                                    Please attempt every question before submitting.
                                </div>}
                                <input
                                    type="submit" value="Submit quiz" className="btn btn-xl btn-secondary border-0"
                                    disabled={!allQuestionsAttempted} aria-describedby="disabled-button-explanation"
                                />
                            </div>

                            <p className="text-muted">{doc.attribution}</p>
                        </RS.Form>

                        {doc.relatedContent && <RelatedContent content={doc.relatedContent} parentPage={doc} />}
                    </RS.Col>
                </RS.Row>
            </RS.Container>
        </div>
    }/>;
});
