import React, {useContext} from "react";
import {useParams} from "react-router-dom";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {Button, Container} from "reactstrap";
import {
    openActiveModal,
    useAppDispatch,
    useGetAssignmentProgressQuery,
    useGetSingleSetAssignmentQuery
} from "../../state";
import {
    AssignmentProgressPageSettingsContext,
    EnhancedAssignmentWithProgress
} from "../../../IsaacAppTypes";
import {
    ASSIGNMENT_PROGRESS_CRUMB,
    getAssignmentCSVDownloadLink,
    useAssignmentProgressAccessibilitySettings
} from "../../services";
import {AssignmentProgressLegend, ProgressDetails} from "./AssignmentProgress";
import {downloadLinkModal} from "../elements/modals/AssignmentProgressModalCreators";
import {skipToken} from "@reduxjs/toolkit/query";
import {combineQueries, ShowLoadingQuery} from "../handlers/ShowLoadingQuery";
import {AssignmentDTO, AssignmentProgressDTO, RegisteredUserDTO} from "../../../IsaacApiTypes";

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

export const SingleAssignmentProgress = ({user}: {user: RegisteredUserDTO}) => {
    const params = useParams<{ assignmentId?: string }>();
    const assignmentId = parseInt(params.assignmentId || ""); // DANGER: This will produce a NaN if params.assignmentId is undefined
    const assignmentQuery = useGetSingleSetAssignmentQuery(assignmentId || skipToken);
    const { data: assignment } = assignmentQuery;
    const assignmentProgressQuery = useGetAssignmentProgressQuery(assignmentId || skipToken);

    const augmentAssignmentWithProgress = (assignment: AssignmentDTO, assignmentProgress: AssignmentProgressDTO[]): EnhancedAssignmentWithProgress => ({...assignment, progress: assignmentProgress} as EnhancedAssignmentWithProgress);

    const pageSettings = useAssignmentProgressAccessibilitySettings({user});

    return <>
        <Container>
            <TitleAndBreadcrumb
                intermediateCrumbs={[ASSIGNMENT_PROGRESS_CRUMB]}
                currentPageTitle={`Assignment Progress${(assignment?.gameboard?.title && (": " + assignment?.gameboard?.title)) ?? ""}`}
                className="mb-4"
            />
        </Container>
        <ShowLoadingQuery
            query={combineQueries(assignmentQuery, assignmentProgressQuery, augmentAssignmentWithProgress)}
            defaultErrorTitle={"Error fetching assignment progress"}
            thenRender={(assignmentWithProgress) =>
                <div className="assignment-progress-container mb-5">
                    <AssignmentProgressPageSettingsContext.Provider value={pageSettings}>
                        <SingleProgressDetails assignment={assignmentWithProgress} />
                    </AssignmentProgressPageSettingsContext.Provider>
                </div>
            }
        />
    </>
};
