import React, {useEffect} from "react";
import {Col, Row} from "reactstrap";
import {ContentSummaryDTO, GameboardDTO, SeguePageDTO} from "../../../IsaacApiTypes";
import {IsaacContent} from "../content/IsaacContent";
import {isAda, isPhy, siteSpecific, useUrlHashValue} from "../../services";
import {useParams} from "react-router-dom";
import {RelatedContent} from "../elements/RelatedContent";
import {DocumentSubject} from "../../../IsaacAppTypes";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {WithFigureNumbering} from "../elements/WithFigureNumbering";
import {MetaDescription} from "../elements/MetaDescription";
import classNames from "classnames";
import queryString from "query-string";
import { useUntilFound } from "./Glossary";
import { useGetGenericPageQuery } from "../../state/slices/api/genericApi";
import { ShowLoadingQuery } from "../handlers/ShowLoadingQuery";
import { NotFound } from "./NotFound";
import { PageMetadata } from "../elements/PageMetadata";
import { useGetGameboardByIdQuery } from "../../state";
import { skipToken } from "@reduxjs/toolkit/query";
import { NewsSidebar } from "../elements/sidebar/NewsSidebar";
import { ContentControlledSidebar } from "../elements/sidebar/ContentControlledSidebar";
import { GameboardContentSidebar } from "../elements/sidebar/GameboardContentSidebar";
import { GenericPageSidebar } from "../elements/sidebar/GenericPageSidebar";
import { PolicyPageSidebar } from "../elements/sidebar/PolicyPageSidebar";
import { GenericSidebarWithRelatedContent } from "../elements/sidebar/RelatedContentSidebar";
import { PageContainer } from "../elements/layout/PageContainer";

interface GenericPageComponentProps {
    pageIdOverride?: string;
}

// Used to decide whether a page should have huge gutters or not. Generic pages do by default, as most are textual,
// but pages such as "Computer Science Stories" are entirely composed of cards and shouldn't have their container
// width restricted as much
// FIXME this should be decided at a content level (if possible)
const CS_FULL_WIDTH_OVERRIDE: {[pageId: string]: boolean | undefined} = {
    "computer_science_stories": true
};

// Overrides for physics pages which shouldn't use the default GenericPageSidebar
const SciSidebar = ({pageId, tags, gameboard, relatedContent, ...sidebarProps}: {pageId: string, tags?: string[], gameboard?: GameboardDTO, relatedContent?: ContentSummaryDTO[]} & React.HTMLAttributes<HTMLDivElement>) => {
    if (["privacy_policy", "terms_of_use", "cookie_policy", "accessibility_statement"].includes(pageId)) {
        return <PolicyPageSidebar {...sidebarProps} />;
    }
    if (tags?.includes("news")) {
        return <NewsSidebar {...sidebarProps} />;
    }
    if (gameboard?.id && gameboard.wildCard?.url === window.location.pathname) {
        return <GameboardContentSidebar id={gameboard.id} title={gameboard.title || ""} questions={gameboard.contents || []} wildCard={gameboard.wildCard} currentContentId={pageId} {...sidebarProps} />;
    }
    if (relatedContent) {
        return <GenericSidebarWithRelatedContent relatedContent={relatedContent} {...sidebarProps} />;
    }
    return <GenericPageSidebar {...sidebarProps} />;
};

export const Generic = ({pageIdOverride}: GenericPageComponentProps) => {
    const params = useParams();
    const pageId = pageIdOverride || params.pageId || "";

    const pageQuery = useGetGenericPageQuery(pageId);

    const hash = useUntilFound(pageQuery.currentData, useUrlHashValue());

    const query = queryString.parse(location.search);
    const gameboardId = query.board instanceof Array ? query.board[0] : query.board;
    const {data: gameboard} = useGetGameboardByIdQuery(gameboardId || skipToken);

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

            const isNews = doc.tags?.includes("news") || false;

            const sidebar = doc.sidebar
                ? <ContentControlledSidebar sidebar={doc.sidebar} />
                : siteSpecific(
                    <SciSidebar pageId={pageId} tags={doc.tags} gameboard={gameboard} relatedContent={doc.relatedContent} />,
                    undefined
                );

            return <PageContainer data-bs-theme={doc.subjectId}
                pageTitle={
                    <TitleAndBreadcrumb 
                        currentPageTitle={doc.title as string} 
                        subTitle={doc.subtitle}
                        displayTitleOverride={isPhy && isNews ? "News" : undefined}
                        icon={{type: "icon", icon: isNews ? "icon-news" : "icon-generic"}}
                    /> 
                }
                sidebar={sidebar}
            >
                <MetaDescription description={doc.summary} />
                {/* on non-news generic pages, the actual doc.title is used as the super-title, unlike e.g. questions which use "Question". 
                    as such, we promote a generic page's subtitle to be the regular title. */}
                {isNews 
                    ? <PageMetadata doc={doc} />
                    : <PageMetadata doc={{...doc, subtitle: undefined}} title={doc.subtitle} noTitle={!doc.subtitle} />
                }

                <Row className="generic-content-container">
                    <Col className={classNames("pb-4 generic-panel", {"mw-760": isAda && !CS_FULL_WIDTH_OVERRIDE[pageId], "pt-4": isAda})}>
                        <WithFigureNumbering doc={doc}>
                            <IsaacContent doc={doc} />
                        </WithFigureNumbering>
                    </Col>
                </Row>

                {isAda && doc.relatedContent && <RelatedContent content={doc.relatedContent} parentPage={doc} />}
            </PageContainer>;
        }}
    />;
};
