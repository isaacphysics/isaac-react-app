import React, {useEffect} from "react";
import {Col, Container, Row} from "reactstrap";
import {AppState} from "../../state/reducers";
import {fetchDoc, requestConstantsSegueEnvironment} from "../../state/actions";
import {ContentDTO} from "../../../IsaacApiTypes";
import {ShowLoading} from "../handlers/ShowLoading";
import {IsaacContent} from "../content/IsaacContent";
import {connect} from "react-redux";
import {DOCUMENT_TYPE, EDITOR_URL} from "../../services/constants";
import {withRouter} from "react-router-dom";
import {RelatedContent} from "../elements/RelatedContent";
import {NOT_FOUND_TYPE} from "../../../IsaacAppTypes";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {EditContentButton} from "../elements/EditContentButton";

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
    requestConstantsSegueEnvironment: () => void;
}

export const GenericPageComponent = ({pageIdOverride, urlPageId, doc, fetchDoc, segueEnvironment, requestConstantsSegueEnvironment}: GenericPageComponentProps) => {
    const pageId = pageIdOverride || urlPageId;
    useEffect(
        () => {fetchDoc(DOCUMENT_TYPE.GENERIC, pageId);},
        [pageId]
    );

    useEffect(() => {
        requestConstantsSegueEnvironment();
    }, []);

    return <ShowLoading until={doc} render={(doc: ContentDTO) =>
        <div>
            <Container>
                <Row>
                    <Col>
                        <TitleAndBreadcrumb currentPageTitle={doc.title as string} />
                        {segueEnvironment != "PROD" && <EditContentButton canonicalSourceFile={EDITOR_URL + (doc as any)['canonicalSourceFile']} />}
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
