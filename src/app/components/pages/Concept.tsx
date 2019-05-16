import React, {useEffect} from "react";
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import {Col, Container, Row} from "reactstrap";
import {fetchConcept} from "../../state/actions";
import {ShowLoading} from "../handlers/ShowLoading";
import {IsaacContent} from "../content/IsaacContent";
import {AppState} from "../../state/reducers";
import {ContentDTO} from "../../../IsaacApiTypes";

// TODO definitely scope for removing duplication between retrieving concept, question and general documents
const stateToProps = (state: AppState, {match: {params: {conceptId}}}: any) => {
    return {
        doc: state ? state.doc : null,
        urlConceptId: conceptId,
    };
};
const dispatchToProps = {fetchConcept};

interface ConceptPageProps {
    doc: ContentDTO | null;
    urlConceptId: string;
    fetchConcept: (conceptId: string) => void;
}

const ConceptPageComponent = (props: ConceptPageProps) => {
    const {doc, urlConceptId, fetchConcept} = props;

    useEffect(
        () => {fetchConcept(urlConceptId);},
        [urlConceptId]
    );

    return <ShowLoading until={doc}>
        {doc && <div className="pattern-01">
            <Container>
                <Row>
                    <Col>
                        {/* Breadcrumb */}
                        <h1 className="h-title">{doc.title}</h1>
                    </Col>
                </Row>
                <Row>
                    <Col md={{size: 8, offset: 2}} className="py-4">
                        <IsaacContent doc={doc} />

                        {/* Superseded notice */}

                        <p>{doc.attribution}</p>

                        {/*FooterPods related-content="questionPage.relatedContent"*/}
                    </Col>
                </Row>
            </Container>
        </div>}
    </ShowLoading>;
};

export const Concept = withRouter(connect(stateToProps, dispatchToProps)(ConceptPageComponent));
