import React, {useEffect} from "react";
import {Col, Container, Row} from "reactstrap";
import {AppState} from "../../state/reducers";
import {fetchDoc} from "../../state/actions";
import {ContentDTO} from "../../../IsaacApiTypes";
import {ShowLoading} from "../handlers/ShowLoading";
import {IsaacContent} from "../content/IsaacContent";
import {connect} from "react-redux";
import {DOCUMENT_TYPE} from "../../services/constants";
import {BreadcrumbTrail} from "../content/BreadcrumbTrail";
import {withRouter} from "react-router-dom";

const stateToProps = (state: AppState, {match: {params: {pageId}}}: any) => {
    return {
        doc: state ? state.doc : null,
        urlPageId: pageId,
    };
};
const dispatchToProps = {fetchDoc};

interface GenericPageComponentProps {
    doc: ContentDTO | null;
    pageIdOverride?: string;
    urlPageId: string;
    fetchDoc: (documentType: DOCUMENT_TYPE, pageId: string) => void;
}

export const GenericPageComponent = ({pageIdOverride, urlPageId, doc, fetchDoc}: GenericPageComponentProps) => {
    useEffect(
        () => {fetchDoc(DOCUMENT_TYPE.GENERIC, pageIdOverride || urlPageId);},
        []
    );

    return <ShowLoading until={doc}>
        {doc && <div className="pattern-01">
            <Container>
                <Row>
                    <Col>
                        <BreadcrumbTrail currentPageTitle={doc.title} />
                        <h1 className="h-title">{doc.title}</h1>
                    </Col>
                </Row>
                {/* TODO add printing and sharing links */}
                <Row>
                    <Col md={{size: 8, offset: 2}} className="py-4">
                        <IsaacContent doc={doc} />
                    </Col>
                </Row>
            </Container>
        </div>}
    </ShowLoading>;
};

export const Generic = withRouter(connect(stateToProps, dispatchToProps)(GenericPageComponent));
