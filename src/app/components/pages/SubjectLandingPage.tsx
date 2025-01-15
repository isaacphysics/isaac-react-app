import React, { useEffect } from "react";
import { pageContextSlice, selectors, useAppSelector } from "../../state";
import { useDispatch } from "react-redux";
import { useLocation } from "react-router";
import { Subject } from "../../../IsaacAppTypes";
import { Stage } from "../../../IsaacApiTypes";
import { Container, ContainerProps } from "reactstrap";
import { HUMAN_STAGES, HUMAN_SUBJECTS } from "../../services";

export const SubjectLandingPage = (props: ContainerProps) => {
    const pageContext = useAppSelector(selectors.pageContext.context);
    const dispatch = useDispatch();
    const location = useLocation();

    useEffect(() => {
        const [subject, stage] = location.pathname.split("/").filter(Boolean);
        dispatch(pageContextSlice.actions.updatePageContext({subject: subject as Subject, stage: stage as Stage}));
    }, [dispatch, location.pathname]);

    return <Container fluid {...props}>
        <div className="mt-5">This is a subject landing page for {pageContext?.stage ? HUMAN_STAGES[pageContext.stage] : "unknown"} {pageContext?.subject ? HUMAN_SUBJECTS[pageContext.subject] : "unknown"}!</div>
    </Container>;
};
