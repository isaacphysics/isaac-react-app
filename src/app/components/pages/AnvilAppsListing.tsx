import React from "react";
import { Container } from "reactstrap";
import { generateSubjectLandingPageCrumbFromContext, TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import { getHumanContext, isFullyDefinedContext, isSingleStageContext, useUrlPageTheme, VALID_APPS_CONTEXTS } from "../../services";
import { PageMetadata } from "../elements/PageMetadata";
import { PageFragment } from "../elements/PageFragment";
import { AnvilAppsListingSidebar } from "../elements/sidebar/AnvilAppsListingSidebar";
import { PageContainer } from "../elements/layout/PageContainer";

export const AnvilAppsListing = () => {
    const pageContext = useUrlPageTheme();
    const crumb = isFullyDefinedContext(pageContext) && generateSubjectLandingPageCrumbFromContext(pageContext);

    if (!isFullyDefinedContext(pageContext) || !isSingleStageContext(pageContext)) {
        return null;
    }

    if (!(pageContext.stage[0] in (VALID_APPS_CONTEXTS[pageContext.subject] || {}))) {
        return <Container data-bs-theme={pageContext?.subject}>
            <TitleAndBreadcrumb 
                currentPageTitle="Tools"
                intermediateCrumbs={crumb ? [crumb] : []}
                icon={{ icon: "icon-revision", type: "icon" }}
            />
            <p className="mt-4">Tools are not available for {getHumanContext(pageContext)}.</p>
        </Container>;
    }

    return <PageContainer data-bs-theme={pageContext?.subject}
        pageTitle={
            <TitleAndBreadcrumb 
                currentPageTitle={pageContext.stage[0] === "university" ? "Skills practice" : "Core skills practice"}
                intermediateCrumbs={crumb ? [crumb] : []}
                icon={{icon: "icon-revision", type: "icon"}}
            />
        }
        sidebar={<AnvilAppsListingSidebar />}
    >
        <PageMetadata />
        <PageFragment fragmentId={VALID_APPS_CONTEXTS[pageContext.subject]?.[pageContext.stage[0]] ?? ""} />
    </PageContainer>;
};
