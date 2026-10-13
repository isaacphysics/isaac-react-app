import React from "react";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import { getThemeFromTags } from "../../services/pageContext";
import { useGetRevisionPageQuery } from "../../state/slices/api/revisionApi";
import { LoadingPlaceholder, ShowLoadingQuery } from "../handlers/ShowLoadingQuery";
import { IsaacRevisionDetailPageDTO, QuizSummaryDTO } from "../../../IsaacApiTypes";
import { convertToALVIGameboards, ListView } from "../elements/list-groups/ListView";
import { IsaacContentValueOrChildren } from "../content/IsaacContentValueOrChildren";
import { MetadataContainer, MetadataContainerLink } from "../elements/panels/MetadataContainer";
import { PageMetadata } from "../elements/PageMetadata";
import { ContentControlledSidebar } from "../elements/sidebar/ContentControlledSidebar";
import { useParams } from "react-router";
import { PageContainer } from "../elements/layout/PageContainer";
import { siteSpecific } from "../../services";
import { selectors, useAppSelector } from "../../state";
import { useTranslation } from "react-i18next";

export const RevisionPage = () => {
    const { t } = useTranslation();
    const { pageId } = useParams();
    const revisionPageQuery = useGetRevisionPageQuery({id: pageId ?? ""});

    return <PageContainer data-bs-theme={getThemeFromTags(revisionPageQuery.data?.tags)}
        pageTitle={
            <TitleAndBreadcrumb 
                currentPageTitle={t("common:revision.page.title")}
                icon={{
                    type: "icon", 
                    icon: "icon-revision"
                }}
            />
        }
        sidebar={siteSpecific(
            <ContentControlledSidebar sidebar={revisionPageQuery.data?.sidebar} />,
            undefined
        )}
    >
        <ShowLoadingQuery
            query={revisionPageQuery}
            defaultErrorTitle={t("common:revision.page.loadError")}
            maintainOnRefetch
            thenRender={(page, isStale) => {
                // show the loading placeholder only if the page itself is changing (to give instant click feedback).
                // if the content on a single page is changing (e.g. gameboard save status updates), we don't want a jarring full-page loading placeholder; okay to show stale content.
                return isStale && (page.id !== pageId) 
                    ? <LoadingPlaceholder />
                    : <RevisionPageInternal page={page} />;
            }}
        />
    </PageContainer>;
};

const RevisionPageInternal = ({page}: {page: IsaacRevisionDetailPageDTO}) => {
    const { t } = useTranslation();
    const user = useAppSelector(selectors.user.loggedInOrNull);
    const tests = (page.relatedContent?.filter(c => c.type === "isaacQuiz") || []) as QuizSummaryDTO[];
    const relevantTests = user?.role ? tests.filter(t => !t.hiddenFromRoles?.includes(user.role!)) : [];

    return <div>
        <PageMetadata doc={page} />

        <MetadataContainer className="d-flex flex-column gap-2">
            {!!page.gameboards?.length && <MetadataContainerLink id="introduction" title={t("common:revision.sections.introTitle")} />}
            <MetadataContainerLink id="revision" title={t("common:revision.sections.contentTitle")} />
            {!!relevantTests.length && <MetadataContainerLink id="tests" title={t("common:revision.sections.testsTitle")} />}
        </MetadataContainer>

        {!!page.gameboards?.length && <>
            <h3 className="mb-3 h4" id="introduction">{t("common:revision.sections.introTitle")}</h3>
            <span>{t("common:revision.sections.introDescription")}</span>
            <div className="mt-3 mb-7 list-results-container p-2">
                <ListView
                    type="gameboard"
                    items={convertToALVIGameboards(page.gameboards)}
                />
            </div>
        </>}

        <h3 className="mb-3 h4" id="revision">{t("common:revision.sections.contentTitle")}</h3>
        <IsaacContentValueOrChildren value={page.value} encoding={page.encoding}>
            {page.children}
        </IsaacContentValueOrChildren>

        {!!relevantTests.length && <>
            <h3 className="mt-4 mb-3 h4" id="tests">{t("common:revision.sections.testsTitle")}</h3>
            <span>{t("common:revision.sections.testsDescription")}</span>
            <div className="mt-3 mb-7 list-results-container p-2">
                <ListView
                    type="quiz"
                    items={relevantTests}
                />
            </div>
        </>}
    </div>;
};
