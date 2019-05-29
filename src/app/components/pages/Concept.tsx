import React, {useEffect} from "react";
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import {Button, Col, Container, Row} from "reactstrap";
import {fetchDoc} from "../../state/actions";
import {ShowLoading} from "../handlers/ShowLoading";
import {IsaacContent} from "../content/IsaacContent";
import {AppState} from "../../state/reducers";
import {ContentDTO} from "../../../IsaacApiTypes";
import {DOCUMENT_TYPE, EXAM_BOARD} from "../../services/constants";
import {BreadcrumbTrail} from "../elements/BreadcrumbTrail";
import {determineNextTopicContentLink, determineTopicHistory, idIsPresent} from "../../services/topics";
import {PageNavigation} from "../../../IsaacAppTypes";
import history, {History} from "history";

const stateToProps = (state: AppState, {history, match: {params: {conceptId}}}: any) => {
    // TODO All of navigation should be moved into a service once it gets more complicated
    const navigation: PageNavigation = {
        breadcrumbHistory: [],
    };
    if (state && state.currentTopic && idIsPresent(conceptId, state.currentTopic.relatedContent)) {
        navigation.breadcrumbHistory = determineTopicHistory(state.currentTopic);
        navigation.backToTopic = navigation.breadcrumbHistory && navigation.breadcrumbHistory.slice(-1)[0];
        navigation.nextTopicContent = determineNextTopicContentLink(state.currentTopic, conceptId, EXAM_BOARD.AQA);
        // TODO Switch nextTopicContent on default exam board
        // TODO Move navigation to also use query params
    }
    return {
        urlConceptId: conceptId,
        doc: state && state.doc || null,
        navigation: navigation,
        history: history,
    };
};
const dispatchToProps = {fetchDoc};

interface ConceptPageProps {
    doc: ContentDTO | null;
    urlConceptId: string;
    navigation: PageNavigation;
    history: History;
    fetchDoc: (documentType: DOCUMENT_TYPE, conceptId: string) => void;
}

const ConceptPageComponent = (props: ConceptPageProps) => {
    const {doc, urlConceptId, navigation, fetchDoc, history} = props;

    useEffect(
        () => {fetchDoc(DOCUMENT_TYPE.CONCEPT, urlConceptId);},
        [urlConceptId]
    );

    return <ShowLoading until={doc}>
        {doc && <div className="pattern-01">
            <Container>
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
                    <Col md={{size: 8, offset: 2}} className="py-4">
                        <IsaacContent doc={doc} />

                        {/* Superseded notice */}

                        <p>{doc.attribution}</p>
                        {navigation.backToTopic && <div className="text-center mb-4">
                            <Button color="secondary" onClick={() => {
                                navigation.backToTopic && history.push(navigation.backToTopic.to)
                            }}>
                                Back to topic
                            </Button>
                        </div>}
                        {navigation.nextTopicContent &&
                            <div className="float-right mb-4">
                                <Button color="secondary" onClick={() => {
                                    navigation.nextTopicContent && history.push(navigation.nextTopicContent.to)
                                }}>
                                    {navigation.nextTopicContent.title}
                                </Button>
                            </div>
                        }

                        {/*FooterPods related-content="questionPage.relatedContent"*/}
                    </Col>
                </Row>
            </Container>
        </div>}
    </ShowLoading>;
};

export const Concept = withRouter(connect(stateToProps, dispatchToProps)(ConceptPageComponent));
