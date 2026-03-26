import React, {useContext} from "react";
import {useParams} from "react-router-dom";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {
    useGetAssignmentProgressQuery,
    useGetSingleSetAssignmentQuery
} from "../../state";
import {
    AppGroup,
    AssignmentProgressPageSettingsContext,
    EnhancedAssignmentWithProgress
} from "../../../IsaacAppTypes";
import {
    ASSIGNMENT_PROGRESS_CRUMB,
    PATHS,
    siteSpecific,
    useAssignmentProgressAccessibilitySettings} from "../../services";
import {ProgressDetails} from "./AssignmentProgressIndividual";
import {skipToken} from "@reduxjs/toolkit/query";
import {combineQueries, ShowLoadingQuery} from "../handlers/ShowLoadingQuery";
import {AssignmentDTO, AssignmentProgressDTO, RegisteredUserDTO} from "../../../IsaacApiTypes";
import { PageContainer } from "../elements/layout/PageContainer";
import { MyAdaSidebar } from "../elements/sidebar/MyAdaSidebar";

const SingleProgressDetails = ({assignment}: {assignment: EnhancedAssignmentWithProgress}) => {
    const pageSettings = useContext(AssignmentProgressPageSettingsContext);

    return <div className={"assignment-progress-details single-assignment" + (pageSettings?.colourBlind ? " colour-blind" : "")}>
        <ProgressDetails assignment={assignment}/>
    </div>;
};

export const SingleAssignmentProgress = ({user, group}: {user: RegisteredUserDTO, group?: AppGroup}) => {
    const params = useParams<{ assignmentId?: string }>();
    const assignmentId = parseInt(params.assignmentId || ""); // DANGER: This will produce a NaN if params.assignmentId is undefined
    const assignmentQuery = useGetSingleSetAssignmentQuery(assignmentId || skipToken);
    const { data: assignment } = assignmentQuery;
    const assignmentProgressQuery = useGetAssignmentProgressQuery(assignmentId || skipToken);

    const groupCrumb = group && group.groupName ? {to: `${PATHS.ASSIGNMENT_PROGRESS}/group/${group.id}`, title: group.groupName} : undefined;

    const augmentAssignmentWithProgress = (assignment: AssignmentDTO, assignmentProgress: AssignmentProgressDTO[]): EnhancedAssignmentWithProgress => ({...assignment, progress: assignmentProgress} as EnhancedAssignmentWithProgress);

    const pageSettings = useAssignmentProgressAccessibilitySettings({user});

    return <PageContainer
        pageTitle={
            <TitleAndBreadcrumb
                intermediateCrumbs={groupCrumb ? [ASSIGNMENT_PROGRESS_CRUMB, groupCrumb] : [ASSIGNMENT_PROGRESS_CRUMB]}
                currentPageTitle={assignment?.gameboard?.title ?? siteSpecific("Assignment progress", "Markbook")}
                className="mb-4"
                icon={{type: "icon", icon: "icon-revision"}}
            />
        }
        sidebar={siteSpecific(null, <MyAdaSidebar />)}
    >
        <ShowLoadingQuery
            query={combineQueries(assignmentQuery, assignmentProgressQuery, augmentAssignmentWithProgress)}
            defaultErrorTitle={"Error fetching assignment progress"}
            thenRender={(assignmentWithProgress) =>
                <div className="assignment-progress-container mb-7">
                    <AssignmentProgressPageSettingsContext.Provider value={pageSettings}>
                        <SingleProgressDetails assignment={assignmentWithProgress} />
                    </AssignmentProgressPageSettingsContext.Provider>
                </div>
            }
        />
    </PageContainer>;
};
