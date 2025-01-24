import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { Container } from "reactstrap";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import { getHumanContext, useUrlPageTheme } from "../../services/pageContext";

export const LessonsAndRevision = withRouter((props: RouteComponentProps) => {
    const pageContext = useUrlPageTheme();

    return <Container data-bs-theme={pageContext?.subject}>
        <TitleAndBreadcrumb 
            currentPageTitle="Lessons and revision"
            icon={pageContext?.subject ? {
                type: "hex", 
                subject: pageContext.subject,
                icon: "page-icon-lessons"
            } : undefined}
        />
        <div className="mt-5">This is a lessons and revision page for {getHumanContext(pageContext)}!</div>
    </Container>;
});
