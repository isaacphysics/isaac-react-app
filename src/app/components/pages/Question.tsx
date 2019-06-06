import React, {useEffect} from "react";
import {withRouter, Link} from "react-router-dom";
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
import {RelatedContent} from "../elements/RelatedContent";
import {determineExamBoardFrom} from "../../services/examBoard";

const stateToProps = (state: AppState, {history, match: {params: {questionId}}, location: {search}}: any) => {
    const navigation: PageNavigation = {
        breadcrumbHistory: [],
    };
    if (state && state.currentTopic && idIsPresent(questionId, state.currentTopic.relatedContent)) {
        navigation.breadcrumbHistory = determineTopicHistory(state.currentTopic);
        navigation.backToTopic = navigation.breadcrumbHistory && navigation.breadcrumbHistory.slice(-1)[0];
        navigation.nextTopicContent =
            determineNextTopicContentLink(state.currentTopic, questionId, determineExamBoardFrom(state.userPreferences));
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

                        {navigation.backToTopic && <div className="float-left">
                            <Link to={navigation.backToTopic.to} className="text-decoration-none">
                                Topic:
                            </Link>
                            <Link to={navigation.backToTopic.to} className="a-alt d-block lrg-text text-dark font-weight-bold mb-5">
                                {navigation.backToTopic.title}
                            </Link>
                        </div>}
                        {navigation.nextTopicContent && <React.Fragment>
                            <Link to={navigation.nextTopicContent.to} className="a-alt lrg-text float-right font-weight-bold">
                                {navigation.nextTopicContent.title}
                            </Link>
                            <Link to={navigation.nextTopicContent.to} className="mb-5 next-link float-right">
                                Next
                            </Link>
                        </React.Fragment>}

                        {doc.relatedContent &&
                            <RelatedContent content={doc.relatedContent} />
                        }
                    </Col>
                </Row>
            </Container>
        </div>}
    </ShowLoading>;
};

export const Question = withRouter(connect(stateToProps, dispatchToProps)(QuestionPageComponent));
