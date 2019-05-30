import React, {useEffect} from "react";
import {withRouter} from "react-router-dom";
import {connect} from "react-redux";
import {Col, Container, Row} from "reactstrap";
import {fetchDoc} from "../../state/actions";
import {ShowLoading} from "../handlers/ShowLoading";
import {IsaacContent} from "../content/IsaacContent";
import {AppState} from "../../state/reducers";
import {ContentDTO} from "../../../IsaacApiTypes";
import {DOCUMENT_TYPE} from "../../services/constants";
import {BreadcrumbTrail} from "../elements/BreadcrumbTrail";
import {RelatedContent} from "../elements/RelatedContent";

const stateToProps = (state: AppState, {match: {params: {conceptId}}}: any) => {
    return {
        doc: state ? state.doc : null,
        urlConceptId: conceptId,
    };
};
const dispatchToProps = {fetchDoc};

interface ConceptPageProps {
    doc: ContentDTO | null;
    urlConceptId: string;
    fetchDoc: (documentType: DOCUMENT_TYPE, conceptId: string) => void;
}

const ConceptPageComponent = (props: ConceptPageProps) => {
    const {doc, urlConceptId, fetchDoc} = props;

    useEffect(
        () => {fetchDoc(DOCUMENT_TYPE.CONCEPT, urlConceptId);},
        [urlConceptId]
    );

    return <ShowLoading until={doc}>
        {doc && <div>
            <Container>
                <Row>
                    <Col>
                        <BreadcrumbTrail currentPageTitle={doc.title} />
                        <h1 className="h-title">{doc.title}</h1>
                    </Col>
                </Row>
                <Row>
                    <Col md={{size: 8, offset: 2}} className="py-4">
                        <IsaacContent doc={doc} />

                        {/* Superseded notice */}

                        <p>{doc.attribution}</p>

                        {doc.relatedContent &&
                            <RelatedContent content={doc.relatedContent} />
                        }
                    </Col>
                </Row>
            </Container>
        </div>}
    </ShowLoading>;
};

export const Concept = withRouter(connect(stateToProps, dispatchToProps)(ConceptPageComponent));
