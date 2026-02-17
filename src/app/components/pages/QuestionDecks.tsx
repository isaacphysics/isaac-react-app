import React from "react";
import { Container } from "reactstrap";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import { isFullyDefinedContext, isSingleStageContext, useUrlPageTheme } from "../../services/pageContext";
import { PageFragment } from "../elements/PageFragment";
import { Loading } from "../handlers/IsaacSpinner";
import { PageContextState } from "../../../IsaacAppTypes";
import { MainContent, SidebarLayout } from "../elements/layout/SidebarLayout";
import { PageMetadata } from "../elements/PageMetadata";
import { QuestionDecksSidebar } from "../elements/sidebar/QuestionDecksSidebar";
import { validQuestionDeckStageSubjectPairs } from "../../services/constants";

export const QuestionDecks = () => {
    const pageContext = useUrlPageTheme();

    const getFragmentFromContext = (context: NonNullable<Required<PageContextState>>) => {
        return `pre_made_decks_${context.subject}_${context.stage[0]}`;
    };

    if (!isFullyDefinedContext(pageContext) || !isSingleStageContext(pageContext)) {
        return <Loading/>;
    }

    return <Container data-bs-theme={pageContext?.subject}>
        <TitleAndBreadcrumb
            currentPageTitle="Question decks by topic"
            icon={pageContext?.subject ? {
                type: "icon",
                subject: pageContext.subject,
                icon: "icon-finder"
            } : undefined}
        />
        <SidebarLayout>
            <QuestionDecksSidebar validStageSubjectPairs={validQuestionDeckStageSubjectPairs} context={pageContext} hideButton />
            <MainContent>
                <PageMetadata showSidebarButton />
                <PageFragment fragmentId={getFragmentFromContext(pageContext)} />
            </MainContent>
        </SidebarLayout>
    </Container>;
};
