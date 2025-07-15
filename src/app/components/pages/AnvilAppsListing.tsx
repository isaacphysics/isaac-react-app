import React from "react";
import { Container } from "reactstrap";
import { generateSubjectLandingPageCrumbFromContext, TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import { getHumanContext, isFullyDefinedContext, isSingleStageContext, useUrlPageTheme, VALID_APPS_CONTEXTS } from "../../services";
import { AnvilAppsListingSidebar, MainContent, SidebarLayout } from "../elements/layout/SidebarLayout";
import { PageMetadata } from "../elements/PageMetadata";
import { PageFragment } from "../elements/PageFragment";

export const AnvilAppsListing = () => {
    const pageContext = useUrlPageTheme();
    const crumb = isFullyDefinedContext(pageContext) && generateSubjectLandingPageCrumbFromContext(pageContext);

    if (!isFullyDefinedContext(pageContext) || !isSingleStageContext(pageContext)) {
        return null;
    }

    if (!(pageContext.stage[0] in (VALID_APPS_CONTEXTS[pageContext.subject] || {}))) {
        return <Container data-bs-theme={pageContext?.subject}>
            <TitleAndBreadcrumb 
                currentPageTitle="Apps"
                intermediateCrumbs={crumb ? [crumb] : []}
                icon={{ icon: "icon-revision", type: "hex" }}
            />
            <p className="mt-4">Apps are not available for {getHumanContext(pageContext)}.</p>
        </Container>;
    }

    return <Container data-bs-theme={pageContext?.subject}>
        <TitleAndBreadcrumb 
            currentPageTitle={pageContext.stage[0] === "university" ? "Skills practice" : "Core skills practice"}
            intermediateCrumbs={crumb ? [crumb] : []}
            icon={{icon: "icon-revision", type: "hex"}}
        />
        <SidebarLayout>
            <AnvilAppsListingSidebar />
            <MainContent>
                <PageMetadata />
                <PageFragment fragmentId={VALID_APPS_CONTEXTS[pageContext.subject]?.[pageContext.stage[0]] ?? ""} />
            </MainContent>
        </SidebarLayout>
    </Container>;
};
