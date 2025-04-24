import React, {useEffect} from "react";
import {Col, Container, Row} from "reactstrap";
import {SeguePageDTO} from "../../../IsaacApiTypes";
import {IsaacContent} from "../content/IsaacContent";
import {isAda, isPhy, useUrlHashValue} from "../../services";
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
import { MainContent, SidebarLayout, GenericPageSidebar, PolicyPageSidebar } from "../elements/layout/SidebarLayout";
import { TeacherNotes } from "../elements/TeacherNotes";
import { useGetGenericPageQuery } from "../../state/slices/api/genericApi";
import { ShowLoadingQuery } from "../handlers/ShowLoadingQuery";
import { NotFound } from "./NotFound";

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

// Overrides for physics pages which shouldn't use the default GenericPageSidebar
// TODO this should also consider page tags (for events/news etc)
const PHY_SIDEBAR = new Map<string, () => React.JSX.Element>([
    ["privacy_policy", PolicyPageSidebar],
    ["terms_of_use", PolicyPageSidebar],
    ["cookie_policy", PolicyPageSidebar],
    ["accessibility_statement", PolicyPageSidebar]
]);

export const Generic = withRouter(({pageIdOverride, match: {params}}: GenericPageComponentProps) => {
    const pageId = pageIdOverride || params.pageId;

    const pageQuery = useGetGenericPageQuery(pageId);

    const hash = useUntilFound(pageQuery.currentData, useUrlHashValue());

    useEffect(() => {
        if (hash) {
            // location.hash is correct when we load the page, but if nothing is loaded yet it doesn't scroll anywhere.
            // this waits until doc is loaded (see 'hash' definition) and then unsets/resets the hash to trigger the scroll again.
            // we use history.replaceState to avoid adding a browser history entry.
            history.replaceState(undefined, '', '#');
            history.replaceState(undefined, '', `#${hash}`);
        }
    }, [hash]);

    return <ShowLoadingQuery 
        query={pageQuery}
        defaultErrorTitle="Unable to load page"
        ifNotFound={<NotFound />}
        thenRender={supertypedDoc => {
            const doc = supertypedDoc as SeguePageDTO & DocumentSubject;
            
            return <Container data-bs-theme={doc.subjectId}>
                <TitleAndBreadcrumb currentPageTitle={doc.title as string} subTitle={doc.subtitle} /> {/* TODO add page icon, replace main title with "General"?? */}
                <MetaDescription description={doc.summary} />
                <SidebarLayout>
                    {PHY_SIDEBAR.has(pageId) ? PHY_SIDEBAR.get(pageId)!() : <GenericPageSidebar/>}
                    <MainContent>
                        <div className="no-print d-flex align-items-center">
                            <EditContentButton doc={doc} />
                            <div className={classNames("question-actions question-actions-leftmost mt-3", {"gap-2": isPhy})}>
                                <ShareLink linkUrl={`/pages/${doc.id}`}/>
                            </div>
                            <div className="question-actions mt-3 not-mobile">
                                <PrintButton/>
                            </div>
                        </div>
                        
                        <TeacherNotes notes={doc.teacherNotes} />

                        <Row className="generic-content-container">
                            <Col className={classNames("py-4 generic-panel", {"mw-760": isAda && !CS_FULL_WIDTH_OVERRIDE[pageId]})}>
                                <WithFigureNumbering doc={doc}>
                                    <IsaacContent doc={doc} />
                                </WithFigureNumbering>
                            </Col>
                        </Row>
                    </MainContent>
                </SidebarLayout>

                {doc.relatedContent && <RelatedContent content={doc.relatedContent} parentPage={doc} />}
            </Container>;
        }}
    />;
});
