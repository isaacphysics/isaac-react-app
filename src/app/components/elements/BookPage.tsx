import React from "react";
import { IsaacContentValueOrChildren } from "../content/IsaacContentValueOrChildren";
import { convertToALVIGameboards, ListView } from "./list-groups/ListView";
import { GameboardDTO, IsaacBookDetailPageDTO } from "../../../IsaacApiTypes";
import { MetadataContainer, MetadataContainerLink } from "./panels/MetadataContainer";
import { Markup } from "./markup";
import { PageMetadata } from "./PageMetadata";

export const BookPage = ({ page }: { page: IsaacBookDetailPageDTO }) => {

    const hasQuestions = page.gameboards && page.gameboards.length > 0;
    const hasResources = (page.relatedContent && page.relatedContent.length > 0) || !!page.value || (page.children && page.children.length > 0);
    const hasExtension = page.extensionGameboards && page.extensionGameboards.length > 0;

    return <div className="book-page">
        <PageMetadata
            doc={page}
            title={<>
                {page.subtitle && <span className="me-3 text-theme">{page.subtitle} </span>}
                <Markup encoding="latex" className="text-black">{page.title}</Markup>
            </>}
            subtitle=""
            showSidebarButton
            sidebarButtonText={page.sidebar?.subtitle}
        />

        <MetadataContainer className="d-flex flex-column gap-2">
            {hasQuestions && <MetadataContainerLink id="questions" title="Questions" />}
            {hasResources && <MetadataContainerLink id="resources" title="Resources" />}
            {hasExtension && <MetadataContainerLink id="extension" title="Extension work" />}
            {!hasQuestions && !hasResources && !hasExtension && <span className="ms-2">There are no materials for this page.</span>}
        </MetadataContainer>

        {hasQuestions && <>
            <h4 className="mb-3" id="questions">Questions</h4>
            <div className="mt-3 mb-7 list-results-container p-2">
                <ListView
                    type="gameboard"
                    items={convertToALVIGameboards(page.gameboards as GameboardDTO[])}
                />
            </div>
        </>}

        {hasResources && <>
            <h4 className="mb-3" id="resources">Resources</h4>
            {!!page.relatedContent?.length && <>
                <div className="my-3 list-results-container p-2">
                    <ListView
                        type="item"
                        items={page.relatedContent}
                    />
                </div>
            </>}
            <IsaacContentValueOrChildren value={page.value} encoding={page.encoding}>
                {page.children}
            </IsaacContentValueOrChildren>
        </>}

        {hasExtension && <>
            <h4 className="mt-4 mb-3" id="extension">Extension work</h4>
            <span>Expand your boundaries by having a go at these additional extension questions.</span>
            <div className="mt-3 mb-7 list-results-container p-2">
                <ListView
                    type="gameboard"
                    items={convertToALVIGameboards(page.extensionGameboards as GameboardDTO[])}
                />
            </div>
        </>}
    </div>;
};
