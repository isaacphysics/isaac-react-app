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
import { isPhy } from "../../services";
import { ContentControlledSidebar } from "../elements/sidebar/ContentControlledSidebar";
import { useParams } from "react-router";
import { PageContainer } from "../elements/layout/PageContainer";
import { siteSpecific } from "../../services";

export const RevisionPage = () => {
    const { pageId } = useParams();
    const revisionPageQuery = useGetRevisionPageQuery({id: pageId ?? ""});

    return <PageContainer data-bs-theme={getThemeFromTags(revisionPageQuery.data?.tags)}
        pageTitle={
            <TitleAndBreadcrumb 
                currentPageTitle="Revision"
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
            defaultErrorTitle="Unable to load revision page."
            maintainOnRefetch // allows keeping sidebar content intact while refetching
            thenRender={(page, isStale) => {
                return isStale ? <LoadingPlaceholder /> : <RevisionPageInternal page={page} />;
            }}
        />
    </PageContainer>;
};

const RevisionPageInternal = ({page}: {page: IsaacRevisionDetailPageDTO}) => {
    const tests = (page.relatedContent?.filter(c => c.type === "isaacTest") || []) as QuizSummaryDTO[];

    return <div>
        <PageMetadata doc={page} />

        <MetadataContainer className="d-flex flex-column gap-2">
            {!!page.gameboards?.length && <MetadataContainerLink id="introduction" title="Introduction" />}
            <MetadataContainerLink id="revision" title="Revision" />
            {!!tests.length && <MetadataContainerLink id="tests" title="Practice tests" />}
        </MetadataContainer>

        {!!page.gameboards?.length && <>
            <h4 className="mb-3" id="introduction">Introduction</h4>
            <span>First, have a go at these baseline questions to assess your understanding and identify which aspects of this topic you should focus your revision on:</span>
            <div className="mt-3 mb-7 list-results-container p-2">
                <ListView
                    type="gameboard"
                    items={convertToALVIGameboards(page.gameboards)}
                />
            </div>
        </>}

        <h4 className="mb-3" id="revision">Revision</h4>
        <IsaacContentValueOrChildren value={page.value} encoding={page.encoding}>
            {page.children}
        </IsaacContentValueOrChildren>

        {!!tests.length && <>
            <h4 className="mt-4 mb-3" id="tests">Practice tests</h4>
            <span>To demonstrate your progress once you&apos;ve revised this section, have a go at a practice test:</span>
            <div className="mt-3 mb-7 list-results-container p-2">
                <ListView
                    type="quiz"
                    items={tests}
                />
            </div>
        </>}
    </div>;
};
