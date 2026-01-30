import React from "react";
import { Container } from "reactstrap";
import { generateSubjectLandingPageCrumbFromContext, TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import { getHumanContext, isFullyDefinedContext, useUrlPageTheme } from "../../services/pageContext";
import { isPhy } from "../../services";

export const QuickQuizzes = () => {
    const pageContext = useUrlPageTheme();

    const crumb = isPhy && isFullyDefinedContext(pageContext) && generateSubjectLandingPageCrumbFromContext(pageContext);

    return <Container data-bs-theme={pageContext?.subject}>
        <TitleAndBreadcrumb 
            currentPageTitle="Quick quizzes"
            intermediateCrumbs={crumb ? [crumb] : undefined}
            icon={pageContext?.subject ? {
                type: "icon", 
                subject: pageContext.subject,
                icon: "icon-finder"
            } : undefined}
        />
        <div className="mt-7">This is a quick quizzes listing page for {getHumanContext(pageContext)}!</div>
    </Container>;
};
