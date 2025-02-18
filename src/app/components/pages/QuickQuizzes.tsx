import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { Container } from "reactstrap";
import { generateSubjectLandingPageCrumbFromContext, TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import { getHumanContext, isDefinedContext, useUrlPageTheme } from "../../services/pageContext";
import { isPhy } from "../../services";

export const QuickQuizzes = withRouter((props: RouteComponentProps) => {
    const pageContext = useUrlPageTheme();

    const crumb = isPhy && isDefinedContext(pageContext) && generateSubjectLandingPageCrumbFromContext(pageContext);

    return <Container data-bs-theme={pageContext?.subject}>
        <TitleAndBreadcrumb 
            currentPageTitle="Quick quizzes"
            intermediateCrumbs={crumb ? [crumb] : undefined}
            icon={pageContext?.subject ? {
                type: "hex", 
                subject: pageContext.subject,
                icon: "page-icon-finder"
            } : undefined}
        />
        <div className="mt-5">This is a quick quizzes listing page for {getHumanContext(pageContext)}!</div>
    </Container>;
});
