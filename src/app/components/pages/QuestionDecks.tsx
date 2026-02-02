import React from "react";
import { Container } from "reactstrap";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import { isFullyDefinedContext, isSingleStageContext, useUrlPageTheme } from "../../services/pageContext";
import { PageFragment } from "../elements/PageFragment";
import { Loading } from "../handlers/IsaacSpinner";
import { PageContextState } from "../../../IsaacAppTypes";
import { MainContent, SidebarLayout } from "../elements/layout/SidebarLayout";
import { ArrayElement, LEARNING_STAGE, PHY_NAV_SUBJECTS } from "../../services";
import { PageMetadata } from "../elements/PageMetadata";
import { QuestionDecksSidebar } from "../elements/sidebar/QuestionDecksSidebar";

export const QuestionDecks = () => {
    const pageContext = useUrlPageTheme();

    const validQuestionDeckStageSubjectPairs: {[subject in keyof typeof PHY_NAV_SUBJECTS]: ArrayElement<typeof PHY_NAV_SUBJECTS[subject]>[]} = {
        "physics": [LEARNING_STAGE.GCSE, LEARNING_STAGE.A_LEVEL],
        "chemistry": [LEARNING_STAGE.A_LEVEL],
        "maths": [LEARNING_STAGE.GCSE, LEARNING_STAGE.A_LEVEL],
        "biology": [LEARNING_STAGE.A_LEVEL],
    };

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
