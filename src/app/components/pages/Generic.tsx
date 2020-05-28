import React, {useEffect} from "react";
import {Col, Container, Row} from "reactstrap";
import {AppState} from "../../state/reducers";
import {fetchDoc} from "../../state/actions";
import {ContentDTO, IsaacQuestionPageDTO} from "../../../IsaacApiTypes";
import {ShowLoading} from "../handlers/ShowLoading";
import {IsaacContent} from "../content/IsaacContent";
import {connect} from "react-redux";
import {DOCUMENT_TYPE} from "../../services/constants";
import {withRouter} from "react-router-dom";
import {RelatedContent} from "../elements/RelatedContent";
import {DocumentSubject, NOT_FOUND_TYPE} from "../../../IsaacAppTypes";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {EditContentButton} from "../elements/EditContentButton";
import {ShareLink} from "../elements/ShareLink";
import {PrintButton} from "../elements/PrintButton";
import {WithFigureNumbering} from "../elements/WithFigureNumbering";

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

    return <ShowLoading until={doc} thenRender={supertypedDoc => {
        const doc = supertypedDoc as IsaacQuestionPageDTO & DocumentSubject;
        return <div className={doc.subjectId || ""}>
            <Container>
                <TitleAndBreadcrumb currentPageTitle={doc.title as string} />
                <div className="no-print d-flex align-items-center">
                    <EditContentButton doc={doc} />
                    <div className="question-actions question-actions-leftmost mt-3">
                        <ShareLink linkUrl={`/pages/${doc.id}`}/>
                    </div>
                    <div className="question-actions mt-3 not_mobile">
                        <PrintButton/>
                    </div>
                </div>

                <Row>
                    <Col md={{size: 8, offset: 2}} className="py-4">
                        <WithFigureNumbering doc={doc}>
                            <IsaacContent doc={doc} />
                        </WithFigureNumbering>
                    </Col>
                </Row>

                {doc.relatedContent &&
                <RelatedContent content={doc.relatedContent} parentPage={doc} />
                }
            </Container>
        </div>
    }}/>;
};

export const Generic = withRouter(connect(stateToProps, dispatchToProps)(GenericPageComponent));
