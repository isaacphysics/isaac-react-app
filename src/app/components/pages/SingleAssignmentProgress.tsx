import React, {useContext, useMemo} from "react";
import {useParams} from "react-router-dom";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {Button, Container} from "reactstrap";
import {isaacApi, openActiveModal, useAppDispatch} from "../../state";
import {AssignmentProgressPageSettingsContext, EnhancedAssignmentWithProgress} from "../../../IsaacAppTypes";
import {
    ASSIGNMENT_PROGRESS_CRUMB,
    getAssignmentCSVDownloadLink,
    useAssignmentProgressAccessibilitySettings
} from "../../services";
import {ShowLoading} from "../handlers/ShowLoading";
import {AssignmentProgressFetchError, AssignmentProgressLegend, ProgressDetails} from "./AssignmentProgress";
import {downloadLinkModal} from "../elements/modals/AssignmentProgressModalCreators";
import {IsaacSpinner} from "../handlers/IsaacSpinner";
import {skipToken} from "@reduxjs/toolkit/query";

const SingleProgressDetails = ({assignment}: {assignment: EnhancedAssignmentWithProgress}) => {
    const dispatch = useAppDispatch();
    const pageSettings = useContext(AssignmentProgressPageSettingsContext);

    function openAssignmentDownloadLink(event: React.MouseEvent<HTMLAnchorElement & HTMLButtonElement>) {
        event.stopPropagation();
        event.preventDefault();
        dispatch(openActiveModal(downloadLinkModal(event.currentTarget.href)));
    }

    return <div className={"assignment-progress-details single-assignment" + (pageSettings.colourBlind ? " colour-blind" : "")}>
        <AssignmentProgressLegend />
        <div className="single-download mb-2 mx-4">
            <Button className="d-none d-md-inline" color="link" tag="a" href={getAssignmentCSVDownloadLink(assignment.id)} onClick={openAssignmentDownloadLink}>Download CSV</Button>
        </div>
        <div className="mx-md-4 mx-sm-2">
            <ProgressDetails assignment={assignment}/>
        </div>
    </div>;
};

export const SingleAssignmentProgress = () => {
    const params = useParams<{ assignmentId?: string }>();
    const assignmentId = parseInt(params.assignmentId || ""); // DANGER: This will produce a NaN if params.assignmentId is undefined
    const { data: assignment } = isaacApi.endpoints.getSingleSetAssignment.useQuery(assignmentId || skipToken);
    const { data: assignmentProgress, isError: assignmentProgressError, error } = isaacApi.endpoints.getAssignmentProgress.useQuery(assignmentId || skipToken);

    const assignmentWithProgress = assignment && assignmentProgress
        ? {...assignment, progress: assignmentProgress}
        : undefined;

    const pageSettings = useAssignmentProgressAccessibilitySettings();

    return <ShowLoading until={assignmentProgress}>
        <Container>
            <TitleAndBreadcrumb intermediateCrumbs={[ASSIGNMENT_PROGRESS_CRUMB]}
                currentPageTitle={`Assignment Progress: ${assignment?.gameboard?.title || "Assignment Progress" }`}
                className="mb-4" />
        </Container>
        <div className="assignment-progress-container mb-5">
            <AssignmentProgressPageSettingsContext.Provider value={pageSettings}>
                {assignmentWithProgress
                    ? <SingleProgressDetails assignment={assignmentWithProgress} />
                    : (assignmentProgressError
                        ? <AssignmentProgressFetchError error={error} />
                        : <div className="p-4 text-center"><IsaacSpinner size="md" /></div>)
                }
            </AssignmentProgressPageSettingsContext.Provider>
        </div>
    </ShowLoading>
};
