import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { Container } from "reactstrap";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import { getHumanContext, getThemeFromTags, useUrlPageTheme } from "../../services/pageContext";
import { useGetRevisionPageQuery } from "../../state/slices/api/revisionApi";
import { ContentControlledSidebar, MainContent, SidebarLayout } from "../elements/layout/SidebarLayout";
import { ShowLoadingQuery } from "../handlers/ShowLoadingQuery";
import { IsaacRevisionDetailPageDTO, QuizSummaryDTO } from "../../../IsaacApiTypes";
import { EditContentButton } from "../elements/EditContentButton";
import { TeacherNotes } from "../elements/TeacherNotes";
import { MetadataContainerLink } from "../elements/BookPage";
import { convertToALVIGameboards, ListView } from "../elements/list-groups/ListView";
import { IsaacContentValueOrChildren } from "../content/IsaacContentValueOrChildren";

interface RevisionProps {
    match: { params: { pageId: string } };
}

export const RevisionPage = ({match: {params: {pageId}}}: RevisionProps) => {

    const revisionPageQuery = useGetRevisionPageQuery({id: pageId});

    return <Container data-bs-theme={getThemeFromTags(revisionPageQuery.data?.tags)}>
        <TitleAndBreadcrumb 
            currentPageTitle="Revision"
            icon={{
                type: "hex", 
                icon: "icon-revision"
            }}
        />
        <ShowLoadingQuery
            query={revisionPageQuery}
            defaultErrorTitle="Unable to load revision page."
            thenRender={(page) => {
                return <SidebarLayout>
                    <ContentControlledSidebar sidebar={revisionPageQuery.data?.sidebar} />
                    <MainContent>
                        <RevisionPageInternal page={page} />
                    </MainContent>
                </SidebarLayout>;
            }}
        />
    </Container>;
};

const RevisionPageInternal = ({page}: {page: IsaacRevisionDetailPageDTO}) => {
    const tests = (page.relatedContent?.filter(c => c.type === "isaacTest") || []) as QuizSummaryDTO[];

    return <div>
        <h3 className="mb-3">
            {page.subtitle && <span className="me-3 text-theme">{page.subtitle} </span>}
            {page.title}
        </h3>

        <EditContentButton doc={page}/>

        <TeacherNotes notes={page.teacherNotes} />

        <div className="content-metadata-container d-flex flex-column gap-2">
            {!!page.gameboards?.length && <MetadataContainerLink id="introduction" title="Introduction" />}
            <MetadataContainerLink id="revision" title="Revision" />
            {!!tests.length && <MetadataContainerLink id="tests" title="Practice tests" />}
        </div>

        {!!page.gameboards?.length && <>
            <h4 className="mb-3" id="introduction">Introduction</h4>
            <span>First, have a go at these baseline questions to assess your understanding and identify which aspects of this topic you should focus your revision on:</span>
            <div className="mt-3 mb-5 list-results-container p-2">
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
            <div className="mt-3 mb-5 list-results-container p-2">
                <ListView
                    type="quiz"
                    items={tests}
                />
            </div>
        </>}
    </div>;
};
