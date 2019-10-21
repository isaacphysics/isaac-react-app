import React, {useEffect} from "react";
import * as RS from "reactstrap";
import {withRouter} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {Col, Container, Row} from "reactstrap";
import {fetchDoc, goToSupersededByQuestion} from "../../state/actions";
import {ShowLoading} from "../handlers/ShowLoading";
import {AppState} from "../../state/reducers";
import {IsaacQuestionPageDTO} from "../../../IsaacApiTypes";
import {DOCUMENT_TYPE, EDITOR_URL} from "../../services/constants";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {useNavigation} from "../../services/navigation";
import {EditContentButton} from "../elements/EditContentButton";
import {AnonUserExamBoardPicker} from "../elements/inputs/AnonUserExamBoardPicker";
import {WithFigureNumbering} from "../elements/WithFigureNumbering";
import {IsaacContent} from "../content/IsaacContent";
import {NavigationLinks} from "../elements/NavigationLinks";
import {RelatedContent} from "../elements/RelatedContent";
import {isStudent, isTeacher} from "../../services/user";

interface QuestionPageProps {
    questionIdOverride?: string;
    match: {params: {questionId: string}};
}

export const Question = withRouter(({questionIdOverride, match}: QuestionPageProps) => {
    const questionId = questionIdOverride || match.params.questionId;
    const doc = useSelector((state: AppState) => state ? state.doc : null);
    const user = useSelector((state: AppState) => state && state.user);
    const segueEnvironment = useSelector((state: AppState) =>
        (state && state.constants && state.constants.segueEnvironment) || "unknown"
    );
    const navigation = useNavigation(questionId);

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(fetchDoc(DOCUMENT_TYPE.QUESTION, questionId));
    }, [questionId, dispatch]);

    return <ShowLoading until={doc} thenRender={supertypedDoc => {
        const doc = supertypedDoc as IsaacQuestionPageDTO;
        return <div className="pattern-01">
            <Container>
                {/*FastTrack progress bar*/}
                {/*Print options*/}
                {/*High contrast option*/}
                <TitleAndBreadcrumb
                    currentPageTitle={doc.title as string}
                    intermediateCrumbs={navigation.breadcrumbHistory}
                    collectionType={navigation.collectionType}
                />
                {segueEnvironment === "DEV" && doc.canonicalSourceFile &&
                    <EditContentButton canonicalSourceFile={EDITOR_URL + doc.canonicalSourceFile} />
                }
                <Row>
                    <Col md={{size: 8, offset: 2}} className="py-4 question-panel">
                        <AnonUserExamBoardPicker className="text-right"/>

                        {doc.supersededBy && !isStudent(user) && <div className="alert alert-primary">
                            {isTeacher(user) && <strong>Teacher Note: </strong>}
                            This question has been replaced by {" "}
                            <RS.Button role="link" color="link" className="align-baseline" onClick={() => dispatch(goToSupersededByQuestion(doc))}>
                                this question
                            </RS.Button>.
                            {isTeacher(user) && <React.Fragment>
                                <span id="superseded-help" className="icon-help float-right" />
                                <RS.UncontrolledTooltip className="text-left" placement="bottom" target="superseded-help">
                                    We periodically update questions into new formats.<br />
                                    If this question appears on one of your gameboards, you may want to update the gameboard.<br />
                                    You can find help for this at Teacher Support -&gt; Assigning Work.<br /><br />
                                    Students will not see this message, but will see a smaller note at the bottom of the page.
                                </RS.UncontrolledTooltip>
                            </React.Fragment>}
                        </div>}

                        <WithFigureNumbering doc={doc}>
                            <IsaacContent doc={doc}/>
                        </WithFigureNumbering>

                        {doc.supersededBy && isStudent(user) && <div className="alert alert-primary">
                            This question {" "}
                            <RS.Button color="link" className="align-baseline" onClick={() => dispatch(goToSupersededByQuestion(doc))}>
                                has been replaced
                            </RS.Button>.<br />
                            However, if you were assigned this version, you should complete it.
                        </div>}

                        <p className="text-muted">{doc.attribution}</p>

                        <NavigationLinks navigation={navigation}/>

                        {doc.relatedContent && <RelatedContent content={doc.relatedContent} parentPage={doc} />}
                    </Col>
                </Row>
            </Container>
        </div>}
    }/>;
});
