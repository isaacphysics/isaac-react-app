import React, {useEffect} from "react";
import {Col, Container, Row} from "reactstrap";
import {AppState, fetchDoc, useAppDispatch, useAppSelector} from "../../state";
import {IsaacQuestionPageDTO} from "../../../IsaacApiTypes";
import {ShowLoading} from "../handlers/ShowLoading";
import {IsaacContent} from "../content/IsaacContent";
import {DOCUMENT_TYPE, isAda, useUrlHashValue} from "../../services";
import {withRouter} from "react-router-dom";
import {RelatedContent} from "../elements/RelatedContent";
import {DocumentSubject} from "../../../IsaacAppTypes";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {EditContentButton} from "../elements/EditContentButton";
import {ShareLink} from "../elements/ShareLink";
import {PrintButton} from "../elements/PrintButton";
import {WithFigureNumbering} from "../elements/WithFigureNumbering";
import {MetaDescription} from "../elements/MetaDescription";
import classNames from "classnames";
import { useUntilFound } from "./Glossary";

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

    const dispatch = useAppDispatch();
    useEffect(() => {dispatch(fetchDoc(DOCUMENT_TYPE.GENERIC, pageId))}, [dispatch, pageId]);
    const doc = useAppSelector((state: AppState) => state?.doc || null);

    const hash = useUntilFound(doc, useUrlHashValue());

    useEffect(() => {
        if (hash) {
            // location.hash is correct when we load the page, but if nothing is loaded yet it doesn't scroll anywhere.
            // this waits until doc is loaded (see 'hash' definition) and then unsets/resets the hash to trigger the scroll again.
            // we use history.replaceState to avoid adding a browser history entry.
            history.replaceState(undefined, '', '#');
            history.replaceState(undefined, '', `#${hash}`);
        }
    }, [hash]);

    return <ShowLoading until={doc} thenRender={supertypedDoc => {
        const doc = supertypedDoc as IsaacQuestionPageDTO & DocumentSubject;
        return <Container className={doc.subjectId || ""}>
            <TitleAndBreadcrumb currentPageTitle={doc.title as string} subTitle={doc.subtitle} />
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
    }}/>;
});
