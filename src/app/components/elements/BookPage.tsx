import React, { useEffect } from "react";
import { IsaacContentValueOrChildren } from "../content/IsaacContentValueOrChildren";
import { convertToALVIGameboards, ListView } from "./list-groups/ListView";
import { GameboardDTO, IsaacBookDetailPageDTO } from "../../../IsaacApiTypes";
import { MetadataContainer, MetadataContainerLink } from "./panels/MetadataContainer";
import { Markup } from "./markup";
import { PageMetadata } from "./PageMetadata";
import { useLocation } from "react-router";
import { scrollVerticallyIntoView } from "../../services";
import { useTranslation } from "react-i18next";

export const BookPage = ({ page }: { page: IsaacBookDetailPageDTO }) => {
    const { t } = useTranslation();
    
    const hasQuestions = page.gameboards && page.gameboards.length > 0;
    const hasResources = (page.relatedContent && page.relatedContent.length > 0) || !!page.value || (page.children && page.children.length > 0);
    const hasExtension = page.extensionGameboards && page.extensionGameboards.length > 0;

    const bookPageUrlParam = (() => {
        const [,, bookId, sectionId] = window.location.pathname.split("/");
        return `?book=${encodeURIComponent(bookId)}&section=${encodeURIComponent(sectionId)}`;
    })();

    const { hash } = useLocation();

    useEffect(() => {
        // scroll to anchor once page has loaded
        if (hash.includes("#")) {
            const hashAnchor = hash.slice(1);
            const element = document.getElementById(hashAnchor);
            if (element) {
                scrollVerticallyIntoView(element);
            }
        }
    }, [hash, page]);

    return <div className="book-page">
        <PageMetadata
            doc={page}
            title={<>
                {page.subtitle && <span className="me-3 text-theme">{page.subtitle} </span>}
                <Markup encoding="latex" className="text-black">{page.title}</Markup>
            </>}
            subtitle=""
        />

        <MetadataContainer className="d-flex flex-column gap-2">
            {hasQuestions && <MetadataContainerLink id="questions" title={t("common:books.page.questionsTitle")} />}
            {hasResources && <MetadataContainerLink id="resources" title={t("common:books.page.resourcesTitle")} />}
            {hasExtension && <MetadataContainerLink id="extension" title={t("common:books.page.extensionTitle")} />}
            {!hasQuestions && !hasResources && !hasExtension && <span className="ms-2">{t("common:books.page.emptyState")}</span>}
        </MetadataContainer>

        {hasQuestions && <>
            <h4 className="mb-3" id="questions">{t("common:books.page.questionsTitle")}</h4>
            <div className="mt-3 mb-7 list-results-container p-2">
                <ListView
                    type="gameboard"
                    items={convertToALVIGameboards(page.gameboards as GameboardDTO[])}
                    linkedBookSection={bookPageUrlParam}
                />
            </div>
        </>}

        {hasResources && <>
            <h4 className="mb-3" id="resources">{t("common:books.page.resourcesTitle")}</h4>
            {!!page.relatedContent?.length && <>
                <div className="my-3 list-results-container p-2">
                    <ListView
                        type="item"
                        items={page.relatedContent}
                        linkedBookSection={bookPageUrlParam}
                    />
                </div>
            </>}
            <IsaacContentValueOrChildren value={page.value} encoding={page.encoding}>
                {page.children}
            </IsaacContentValueOrChildren>
        </>}

        {hasExtension && <>
            <h4 className="mt-4 mb-3" id="extension">{t("common:books.page.extensionTitle")}</h4>
            <span>{t("common:books.page.extensionIntroText")}</span>
            <div className="mt-3 mb-7 list-results-container p-2">
                <ListView
                    type="gameboard"
                    items={convertToALVIGameboards(page.extensionGameboards as GameboardDTO[])}
                />
            </div>
        </>}
    </div>;
};
