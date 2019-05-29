import React, {useEffect} from "react";
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import {Button, Col, Container, Row} from "reactstrap";
import queryString from "query-string";
import {fetchDoc} from "../../state/actions";
import {ShowLoading} from "../handlers/ShowLoading";
import {IsaacContent} from "../content/IsaacContent";
import {AppState} from "../../state/reducers";
import {ContentDTO} from "../../../IsaacApiTypes";
import {BreadcrumbTrail} from "../elements/BreadcrumbTrail";
import {DOCUMENT_TYPE, EXAM_BOARD} from "../../services/constants";
import {determineNextTopicContentLink, determineTopicHistory, idIsPresent} from "../../services/topics";
import {PageNavigation} from "../../../IsaacAppTypes";
import {History} from "history";

const stateToProps = (state: AppState, {history, match: {params: {questionId}}, location: {search}}: any) => {
    const navigation: PageNavigation = {
        breadcrumbHistory: [],
    };
    if (state && state.currentTopic && idIsPresent(questionId, state.currentTopic.relatedContent)) {
        navigation.breadcrumbHistory = determineTopicHistory(state.currentTopic);
        navigation.backToTopic = navigation.breadcrumbHistory && navigation.breadcrumbHistory.slice(-1)[0];
        navigation.nextTopicContent = determineNextTopicContentLink(state.currentTopic, questionId, EXAM_BOARD.AQA);
        // TODO switch nextTopicContent on default exam board
        // TODO move navigation to also use query params
    }
    return {
        doc: state ? state.doc : null,
        urlQuestionId: questionId,
        queryParams: queryString.parse(search),
        navigation: navigation
    };
};
const dispatchToProps = {fetchDoc};

interface QuestionPageProps {
    doc: ContentDTO | null;
    urlQuestionId: string;
    queryParams: {board?: string};
    history: History;
    navigation: PageNavigation;
    fetchDoc: (documentType: DOCUMENT_TYPE, questionId: string) => void;
}

const QuestionPageComponent = (props: QuestionPageProps) => {
    const {doc, urlQuestionId, queryParams, history, navigation, fetchDoc} = props;

    useEffect(
        () => {fetchDoc(DOCUMENT_TYPE.QUESTION, urlQuestionId);},
        [urlQuestionId]
    );

    const goBackToBoard = () => {
        history.push(`/gameboards#${queryParams.board}`);
    };

    return <ShowLoading until={doc}>
        {doc && <div className="pattern-01">
            <Container>
                {/*FastTrack progress bar*/}
                {/*Print options*/}
                {/*High contrast option*/}
                <Row>
                    <Col>
                        <BreadcrumbTrail
                            intermediateCrumbs={navigation.breadcrumbHistory}
                            currentPageTitle={doc.title as string}
                        />
                        <h1 className="h-title">{doc.title}</h1>
                    </Col>
                </Row>
                <Row>
                    <Col md={{size: 8, offset: 2}} className="py-4 question-panel">
                        <IsaacContent doc={doc} />

                        {/* Superseded notice */}

                        <p>{doc.attribution}</p>

                        {/*{queryParams && queryParams.board &&*/}
                        {/*    <Button color="secondary" onClick={goBackToBoard}>Back to board</Button>*/}
                        {/*}*/}
                        {navigation.backToTopic && <div className="text-center mb-4">
                            <Button color="secondary" onClick={() => {
                                navigation.backToTopic && history.push(navigation.backToTopic.to)
                            }}>
                                Back to topic
                            </Button>
                        </div>}
                        {navigation.nextTopicContent && <div className="float-right mb-4">
                            <Button color="secondary" onClick={() => {
                                navigation.nextTopicContent && history.push(navigation.nextTopicContent.to)
                            }}>
                                {navigation.nextTopicContent.title}
                            </Button>
                        </div>}

                        {/*FooterPods related-content="questionPage.relatedContent"*/}
                    </Col>
                </Row>
            </Container>
        </div>}
    </ShowLoading>;
};

export const Question = withRouter(connect(stateToProps, dispatchToProps)(QuestionPageComponent));
