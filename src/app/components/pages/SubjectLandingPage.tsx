import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { Container } from "reactstrap";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import { getHumanContext, useUrlPageTheme } from "../../services/pageContext";
import { ListViewCards } from "../elements/list-groups/ListView";
import { getLandingPageCardsForContext } from "./subjectLandingPageComponents";
import { below, useDeviceSize } from "../../services";

export const SubjectLandingPage = withRouter((props: RouteComponentProps) => {
    const pageContext = useUrlPageTheme();
    const deviceSize = useDeviceSize();

    return <Container data-bs-theme={pageContext?.subject}>
        <TitleAndBreadcrumb 
            currentPageTitle={getHumanContext(pageContext)}
            icon={pageContext?.subject ? {
                type: "img", 
                subject: pageContext.subject,
                icon: `/assets/phy/icons/redesign/subject-${pageContext.subject}.svg`
            } : undefined}
        />
        <div className="mt-5">This is a subject landing page for {getHumanContext(pageContext)}!</div>
        <ListViewCards cards={getLandingPageCardsForContext(pageContext, below['md'](deviceSize))} />
    </Container>;
});
