import React, {useEffect} from "react";
import {Col, Container, Row} from "reactstrap";
import {AppState, fetchDoc, useAppDispatch, useAppSelector} from "../../state";
import {IsaacQuestionPageDTO} from "../../../IsaacApiTypes";
import {ShowLoading} from "../handlers/ShowLoading";
import {IsaacContent} from "../content/IsaacContent";
import {DOCUMENT_TYPE} from "../../services";
import {withRouter} from "react-router-dom";
import {RelatedContent} from "../elements/RelatedContent";
import {DocumentSubject} from "../../../IsaacAppTypes";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {EditContentButton} from "../elements/EditContentButton";
import {ShareLink} from "../elements/ShareLink";
import {PrintButton} from "../elements/PrintButton";
import {WithFigureNumbering} from "../elements/WithFigureNumbering";
import {MetaDescription} from "../elements/MetaDescription";

interface GenericPageComponentProps {
    pageIdOverride?: string;
    match: {params: {pageId: string}};
}

export const Generic = withRouter(({pageIdOverride, match: {params}}: GenericPageComponentProps) => {
    const pageId = pageIdOverride || params.pageId;

    const dispatch = useAppDispatch();
    useEffect(() => {dispatch(fetchDoc(DOCUMENT_TYPE.GENERIC, pageId))}, [dispatch, pageId]);
    const doc = useAppSelector((state: AppState) => state?.doc || null);

    return <ShowLoading until={doc} thenRender={supertypedDoc => {
        const doc = supertypedDoc as IsaacQuestionPageDTO & DocumentSubject;
        return <div className={doc.subjectId || ""}>
            <Container>
                <TitleAndBreadcrumb currentPageTitle={doc.title as string} />
                <MetaDescription description={doc.summary} />
                <div className="no-print d-flex align-items-center">
                    <EditContentButton doc={doc} />
                    <div className="question-actions question-actions-leftmost mt-3">
                        <ShareLink linkUrl={`/pages/${doc.id}`}/>
                    </div>
                    <div className="question-actions mt-3 not-mobile">
                        <PrintButton/>
                    </div>
                </div>

                <Row className="generic-content-container">
                    <Col md={{size: 8, offset: 2}} className="py-4">
                        <WithFigureNumbering doc={doc}>
                            <IsaacContent doc={doc} />
                        </WithFigureNumbering>
                    </Col>
                </Row>

                {doc.relatedContent && <RelatedContent content={doc.relatedContent} parentPage={doc} />}
            </Container>
        </div>
    }}/>;
});
