import React, {useEffect} from "react";
import {Col, Container, Row} from "reactstrap";
import {AppState} from "../../state/reducers";
import {fetchDoc} from "../../state/actions";
import {ContentBase, ContentDTO} from "../../../IsaacApiTypes";
import {ShowLoading} from "../handlers/ShowLoading";
import {IsaacContent} from "../content/IsaacContent";
import {connect} from "react-redux";
import {DOCUMENT_TYPE, EDITOR_URL} from "../../services/constants";
import {withRouter} from "react-router-dom";
import {RelatedContent} from "../elements/RelatedContent";
import {NOT_FOUND_TYPE} from "../../../IsaacAppTypes";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {EditContentButton} from "../elements/EditContentButton";
import {ShareLink} from "../elements/ShareLink";
import {PrintButton} from "../elements/PrintButton";

const stateToProps = (state: AppState, {match: {params: {pageId}}}: any) => {
    return {
        doc: state ? state.doc : null,
        urlPageId: pageId,
        segueEnvironment: state && state.constants && state.constants.segueEnvironment || "unknown",
    };
};
const dispatchToProps = {fetchDoc};

interface GenericPageComponentProps {
    doc: ContentDTO | NOT_FOUND_TYPE | null;
    pageIdOverride?: string;
    urlPageId: string;
    fetchDoc: (documentType: DOCUMENT_TYPE, pageId: string) => void;
    segueEnvironment: string;
}

export const GenericPageComponent = ({pageIdOverride, urlPageId, doc, fetchDoc, segueEnvironment}: GenericPageComponentProps) => {
    const pageId = pageIdOverride || urlPageId;
    useEffect(
        () => {fetchDoc(DOCUMENT_TYPE.GENERIC, pageId);},
        [pageId]
    );

    return <ShowLoading until={doc} thenRender={doc =>
        <div>
            <Container>
                <TitleAndBreadcrumb currentPageTitle={doc.title as string} />
                <Row className="no-print">
                    {segueEnvironment === "DEV" && (doc as ContentBase).canonicalSourceFile &&
                    <EditContentButton canonicalSourceFile={EDITOR_URL + (doc as ContentBase)['canonicalSourceFile']} />
                    }
                    <div className="question-actions question-actions-leftmost mt-3">
                        <ShareLink linkUrl={`/pages/${doc.id}`}/>
                    </div>
                    <div className="question-actions mt-3 not_mobile">
                        <PrintButton/>
                    </div>
                </Row>

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
