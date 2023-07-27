import React from "react";
import {Col, Container, Row} from "reactstrap";
import {useGetGenericPageQuery} from "../../state";
import {IsaacContent} from "../content/IsaacContent";
import {DOCUMENT_TYPE, isAda} from "../../services";
import {withRouter} from "react-router-dom";
import {RelatedContent} from "../elements/RelatedContent";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {EditContentButton} from "../elements/EditContentButton";
import {ShareLink} from "../elements/ShareLink";
import {PrintButton} from "../elements/PrintButton";
import {WithFigureNumbering} from "../elements/WithFigureNumbering";
import {MetaDescription} from "../elements/MetaDescription";
import classNames from "classnames";
import {ShowLoadingQuery} from "../handlers/ShowLoadingQuery";
import {NotFound} from "./NotFound";
import {PageContext} from "../../../IsaacAppTypes";

interface GenericPageComponentProps {
    pageIdOverride?: string;
    match: {params: {pageId: string}};
}

// Used to decide whether a page should have huge gutters or not. Generic pages do by default, as most are textual,
// but pages such as "Computer Science Stories" are entirely composed of cards and shouldn't have their container
// width restricted as much
// FIXME this should be decided at a content level (if possible)
const CS_FULL_WIDTH_OVERRIDE: {[pageId: string]: boolean | undefined} = {
    "computer_science_stories": true
};

export const Generic = withRouter(({pageIdOverride, match: {params}}: GenericPageComponentProps) => {
    const pageId = pageIdOverride || params.pageId;
    const docQuery = useGetGenericPageQuery(pageId);
    return <ShowLoadingQuery
        query={docQuery}
        ifNotFound={<NotFound/>}
        ifError={NotFound}
        thenRender={doc => {
            return <PageContext.Provider value={{id: doc.id, type: doc.type as DOCUMENT_TYPE, level: doc.level}}>
                <Container className={doc.subjectId || ""}>
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
                        <Col className={classNames("py-4", {"mw-760": isAda && !CS_FULL_WIDTH_OVERRIDE[pageId]})}>
                            <WithFigureNumbering doc={doc}>
                                <IsaacContent doc={doc} />
                            </WithFigureNumbering>
                        </Col>
                    </Row>

                    {doc.relatedContent && <RelatedContent content={doc.relatedContent} parentPage={doc} />}
                </Container>
            </PageContext.Provider>;
        }}
    />;
});
