import React from "react";
import {useParams} from "react-router-dom";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {Container} from "reactstrap";
import {loadProgress} from "../../state/actions";
import {useDispatch} from "react-redux";

export const SingleAssignmentProgress = () => {
    const dispatch = useDispatch();
    const params = useParams();
    const assignmentId = params.assignmentId;

    dispatch(loadProgress({_id: assignmentId}));

    return <Container id={`single-assignment-${assignmentId}`} className="mb-5">

        <TitleAndBreadcrumb currentPageTitle={`${assignmentId}`} className="mb-4" />

    </Container>
};
