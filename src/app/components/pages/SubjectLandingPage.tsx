import React, { useEffect } from "react";
import { pageContextSlice, selectors, useAppSelector } from "../../state";
import { useDispatch } from "react-redux";
import { RouteComponentProps, withRouter } from "react-router";
import { Subject } from "../../../IsaacAppTypes";
import { Stage } from "../../../IsaacApiTypes";
import { Container } from "reactstrap";
import { HUMAN_STAGES, HUMAN_SUBJECTS } from "../../services";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";

export const SubjectLandingPage = withRouter((props: RouteComponentProps) => {
    const {location} = props;
    const pageContext = useAppSelector(selectors.pageContext.context);
    const dispatch = useDispatch();

    useEffect(() => {
        const [subject, stage] = location.pathname.split("/").filter(Boolean);
        dispatch(pageContextSlice.actions.updatePageContext({subject: subject as Subject, stage: stage as Stage}));
    }, [dispatch, location.pathname]);

    return <Container fluid data-bs-theme={pageContext?.subject}>
        <TitleAndBreadcrumb 
            currentPageTitle={pageContext?.stage && pageContext.subject ? `${HUMAN_STAGES[pageContext.stage]} ${HUMAN_SUBJECTS[pageContext.subject]}` : ""}
            icon={pageContext?.subject ? {
                type: "img", 
                subject: pageContext.subject,
                icon: `/assets/phy/icons/redesign/subject-${pageContext.subject}.svg`
            } : undefined}
        />
        <div className="mt-5">This is a subject landing page for {pageContext?.stage ? HUMAN_STAGES[pageContext.stage] : "unknown"} {pageContext?.subject ? HUMAN_SUBJECTS[pageContext.subject] : "unknown"}!</div>
    </Container>;
});
