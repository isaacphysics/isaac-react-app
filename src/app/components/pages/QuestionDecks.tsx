import React from "react";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import { isFullyDefinedContext, isSingleStageContext, useUrlPageTheme } from "../../services/pageContext";
import { PageFragment } from "../elements/PageFragment";
import { Loading } from "../handlers/IsaacSpinner";
import { PageContextState } from "../../../IsaacAppTypes";
import { PageMetadata } from "../elements/PageMetadata";
import { QuestionDecksSidebar } from "../elements/sidebar/QuestionDecksSidebar";
import { validQuestionDeckStageSubjectPairs } from "../../services/constants";
import { PageContainer } from "../elements/layout/PageContainer";
import { siteSpecific } from "../../services";

export const QuestionDecks = () => {
    const pageContext = useUrlPageTheme();

    const getFragmentFromContext = (context: NonNullable<Required<PageContextState>>) => {
        return `pre_made_decks_${context.subject}_${context.stage[0]}`;
    };

    if (!isFullyDefinedContext(pageContext) || !isSingleStageContext(pageContext)) {
        return <Loading/>;
    }

    return <PageContainer data-bs-theme={pageContext?.subject}
        pageTitle={
            <TitleAndBreadcrumb
                currentPageTitle="Question decks by topic"
                icon={pageContext?.subject ? {
                    type: "icon",
                    subject: pageContext.subject,
                    icon: "icon-finder"
                } : undefined}
            />
        }
        sidebar={siteSpecific(
            <QuestionDecksSidebar validStageSubjectPairs={validQuestionDeckStageSubjectPairs} context={pageContext} hideButton />,
            undefined
        )}
    >
        <PageMetadata showSidebarButton />
        <PageFragment fragmentId={getFragmentFromContext(pageContext)} />
    </PageContainer>;
};
