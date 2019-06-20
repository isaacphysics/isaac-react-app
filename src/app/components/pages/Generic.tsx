import React, {useEffect} from "react";
import {Col, Container, Row} from "reactstrap";
import {AppState} from "../../state/reducers";
import {fetchDoc} from "../../state/actions";
import {ContentDTO} from "../../../IsaacApiTypes";
import {ShowLoading} from "../handlers/ShowLoading";
import {IsaacContent} from "../content/IsaacContent";
import {connect} from "react-redux";
import {DOCUMENT_TYPE} from "../../services/constants";
import {withRouter} from "react-router-dom";
import {RelatedContent} from "../elements/RelatedContent";
import {NOT_FOUND_TYPE} from "../../../IsaacAppTypes";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";

const stateToProps = (state: AppState, {match: {params: {pageId}}}: any) => {
    return {
        doc: state ? state.doc : null,
        urlPageId: pageId,
    };
};
const dispatchToProps = {fetchDoc};

interface GenericPageComponentProps {
    doc: ContentDTO | NOT_FOUND_TYPE | null;
    pageIdOverride?: string;
    urlPageId: string;
    fetchDoc: (documentType: DOCUMENT_TYPE, pageId: string) => void;
}

export const GenericPageComponent = ({pageIdOverride, urlPageId, doc, fetchDoc}: GenericPageComponentProps) => {
    const pageId = pageIdOverride || urlPageId;
    useEffect(
        () => {fetchDoc(DOCUMENT_TYPE.GENERIC, pageId);},
        [pageId]
    );

    return <ShowLoading until={doc} render={(doc: ContentDTO) =>
        <div>
            <Container>
                <Row>
                    <Col>
                        <TitleAndBreadcrumb currentPageTitle={doc.title as string} />
                    </Col>
                </Row>
                {/* TODO add printing and sharing links */}
                <Row>
                    <Col md={{size: 8, offset: 2}} className="py-4">
                        <IsaacContent doc={doc} />
                    </Col>
                </Row>

                {doc.relatedContent &&
                <RelatedContent content={doc.relatedContent} parentPage={doc} />
                }
            </Container>
        </div>
    }/>;
};

export const Generic = withRouter(connect(stateToProps, dispatchToProps)(GenericPageComponent));
