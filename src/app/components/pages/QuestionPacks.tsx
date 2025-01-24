import React from "react";
import { RouteComponentProps, withRouter } from "react-router";
import { Container } from "reactstrap";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import { getHumanContext, useUrlPageTheme } from "../../services/pageContext";

export const QuestionPacks = withRouter((props: RouteComponentProps) => {
    const pageContext = useUrlPageTheme();

    return <Container data-bs-theme={pageContext?.subject}>
        <TitleAndBreadcrumb 
            currentPageTitle="Question packs"
            icon={pageContext?.subject ? {
                type: "hex", 
                subject: pageContext.subject,
                icon: "page-icon-finder"
            } : undefined}
        />
        <div className="mt-5">This is a question packs listing page for {getHumanContext(pageContext)}!</div>
    </Container>;
});
