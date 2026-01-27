import React from "react";
import { isFullyDefinedContext, VALID_APPS_CONTEXTS, HUMAN_STAGES, LearningStage } from "../../../services";
import { useAppSelector, selectors } from "../../../state";
import { StyledTabPicker } from "../inputs/StyledTabPicker";
import { ContentSidebarProps, ContentSidebar } from "../layout/SidebarLayout";
import { useNavigate } from "react-router";

export const AnvilAppsListingSidebar = (props: ContentSidebarProps) => {
    const navigate = useNavigate();
    const context = useAppSelector(selectors.pageContext.context);
    return <ContentSidebar buttonTitle="See all tools" {...props}>
        <div className="section-divider"/>
        <h5>Select stage</h5>
        <ul>
            {isFullyDefinedContext(context) && Object.keys(VALID_APPS_CONTEXTS[context.subject] ?? {}).map((stage, index) => <li key={index}>
                <StyledTabPicker
                    checkboxTitle={HUMAN_STAGES[stage as LearningStage]} checked={context?.stage?.includes(stage as LearningStage)}
                    onClick={() => navigate(`/${context?.subject}/${stage}/tools`)}
                />
            </li>)}
        </ul>
    </ContentSidebar>;
};
