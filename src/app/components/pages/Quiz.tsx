import React, {useEffect} from "react";
import {withRouter} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import * as RS from "reactstrap";
import {fetchDoc, submitQuizPage} from "../../state/actions";
import {ShowLoading} from "../handlers/ShowLoading";
import {IsaacContent} from "../content/IsaacContent";
import {AppState} from "../../state/reducers";
import {ContentBase} from "../../../IsaacApiTypes";
import {ACCEPTED_QUIZ_IDS, DOCUMENT_TYPE, EDITOR_URL, NOT_FOUND} from "../../services/constants";
import {RelatedContent} from "../elements/RelatedContent";
import {WithFigureNumbering} from "../elements/WithFigureNumbering";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {useNavigation} from "../../services/navigation";
import {NavigationLinks} from "../elements/NavigationLinks";
import {AnonUserExamBoardPicker} from "../elements/inputs/AnonUserExamBoardPicker";
import {EditContentButton} from "../elements/EditContentButton";
import {questions} from "../../state/selectors";

export const Quiz = withRouter(({match}: {match: {path: string; params: {quizId: string}}}) => {
    const dispatch = useDispatch();
    const doc = useSelector((state: AppState) => {
        if (ACCEPTED_QUIZ_IDS.includes(match.params.quizId)) {
            return (state && state.doc) || null;
        } else {
            return NOT_FOUND;
        }
    });
    const allQuestionsAttempted = useSelector(questions.allQuestionsAttempted);
    // const anyQuestionPreviouslyAttempted = useSelector(questions.anyQuestionPreviouslyAttempted);
    const segueEnvironment = useSelector((state: AppState) => state && state.constants && state.constants.segueEnvironment || "unknown");

    useEffect(() => {
        if (ACCEPTED_QUIZ_IDS.includes(match.params.quizId)) {
            dispatch(fetchDoc(DOCUMENT_TYPE.QUESTION, match.params.quizId));
        }
    }, [match.params.quizId, fetchDoc]);

    const navigation = useNavigation(match.params.quizId);

    return <ShowLoading until={doc} thenRender={doc =>
        <div className="pattern-01">
            <RS.Container>
                <TitleAndBreadcrumb
                    currentPageTitle={doc.title as string}
                    intermediateCrumbs={navigation.breadcrumbHistory}
                    collectionType={navigation.collectionType}
                />

                {segueEnvironment === "DEV" && (doc as ContentBase).canonicalSourceFile &&
                    <EditContentButton canonicalSourceFile={EDITOR_URL + (doc as ContentBase)['canonicalSourceFile']} />
                }

                <RS.Row>
                    <RS.Col md={{size: 8, offset: 2}} className="py-4 question-panel">
                        <AnonUserExamBoardPicker className="text-right" />

                        <RS.Form onSubmit={event => {
                            if (event) {event.preventDefault();}
                            dispatch(submitQuizPage(match.params.quizId))
                        }}>
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

                        <NavigationLinks navigation={navigation} />

                        {doc.relatedContent && <RelatedContent content={doc.relatedContent} parentPage={doc} />}
                    </RS.Col>
                </RS.Row>
            </RS.Container>
        </div>
    }/>;
});

