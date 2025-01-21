import React, { useEffect } from "react";
import { pageContextSlice, selectors, useAppSelector } from "../../state";
import { useDispatch } from "react-redux";
import { RouteComponentProps, withRouter } from "react-router";
import { Subject } from "../../../IsaacAppTypes";
import { Stage } from "../../../IsaacApiTypes";
import { Container } from "reactstrap";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import { getHumanContext } from "../../services/context";

export const SubjectLandingPage = withRouter((props: RouteComponentProps) => {
    const {location} = props;
    const pageContext = useAppSelector(selectors.pageContext.context);
    const dispatch = useDispatch();

    useEffect(() => {
        const [subject, stage] = location.pathname.split("/").filter(Boolean);
        dispatch(pageContextSlice.actions.updatePageContext({subject: subject as Subject, stage: stage as Stage}));
    }, [dispatch, location.pathname]);

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
    </Container>;
});
