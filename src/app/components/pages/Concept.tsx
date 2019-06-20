import React, {useEffect} from "react";
import {Link, withRouter} from "react-router-dom";
import {connect} from "react-redux";
import {Button, Col, Container, Row} from "reactstrap";
import {fetchDoc} from "../../state/actions";
import {ShowLoading} from "../handlers/ShowLoading";
import {IsaacContent} from "../content/IsaacContent";
import {AppState} from "../../state/reducers";
import {ContentDTO} from "../../../IsaacApiTypes";
import {DOCUMENT_TYPE, EXAM_BOARD} from "../../services/constants";
import {determineNextTopicContentLink, determineTopicHistory, idIsPresent} from "../../services/topics";
import {NOT_FOUND_TYPE, PageNavigation} from "../../../IsaacAppTypes";
import history, {History} from "history";
import {RelatedContent} from "../elements/RelatedContent";
import {determineExamBoardFrom} from "../../services/examBoard";
import {WithFigureNumbering} from "../elements/WithFigureNumbering";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";

const stateToProps = (state: AppState, {history, match: {params: {conceptId}}}: any) => {
    // TODO All of navigation should be moved into a service once it gets more complicated
    const navigation: PageNavigation = {
        breadcrumbHistory: [],
    };
    if (state && state.currentTopic && idIsPresent(conceptId, state.currentTopic.relatedContent)) {
        navigation.breadcrumbHistory = determineTopicHistory(state.currentTopic);
        navigation.backToTopic = navigation.breadcrumbHistory && navigation.breadcrumbHistory.slice(-1)[0];
        navigation.nextTopicContent =
            determineNextTopicContentLink(state.currentTopic, conceptId, determineExamBoardFrom(state.userPreferences));
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
    doc: ContentDTO | NOT_FOUND_TYPE | null;
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

    return <ShowLoading until={doc} render={(doc: ContentDTO) =>
        <div>
            <Container>
                <Row>
                    <Col>
                        <TitleAndBreadcrumb
                            intermediateCrumbs={navigation.breadcrumbHistory}
                            currentPageTitle={doc.title as string}
                        />
                    </Col>
                </Row>
                <Row>
                    <Col md={{size: 8, offset: 2}} className="py-4">
                        <WithFigureNumbering doc={doc}>
                            <IsaacContent doc={doc} />
                        </WithFigureNumbering>

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
        </div>
    }/>;
};

export const Concept = withRouter(connect(stateToProps, dispatchToProps)(ConceptPageComponent));
