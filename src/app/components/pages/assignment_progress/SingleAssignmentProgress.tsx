import React, {useContext, useMemo, useState} from "react";
import {Link, useParams} from "react-router-dom";
import {TitleAndBreadcrumb} from "../../elements/TitleAndBreadcrumb";
import {
    openActiveModal,
    useAppDispatch,
    useGetAssignmentProgressQuery,
    useGetSingleSetAssignmentQuery
} from "../../../state";
import {
    AppGroup,
    AssignmentProgressPageSettingsContext,
    AuthorisedAssignmentProgress,
    EnhancedAssignmentWithProgress
} from "../../../../IsaacAppTypes";
import {
    ASSIGNMENT_PROGRESS_CRUMB,
    getAssignmentProgressCSVDownloadLink,
    isAuthorisedFullAccess,
    isPhy,
    PATHS,
    siteSpecific,
    useAssignmentProgressAccessibilitySettings} from "../../../services";
import {skipToken} from "@reduxjs/toolkit/query";
import {combineQueries, ShowLoadingQuery} from "../../handlers/ShowLoadingQuery";
import {AssignmentDTO, AssignmentProgressDTO, CompletionState, RegisteredUserDTO} from "../../../../IsaacApiTypes";
import { PageContainer } from "../../elements/layout/PageContainer";
import { MyAdaSidebar } from "../../elements/sidebar/MyAdaSidebar";
import classNames from "classnames";
import { Spacer } from "../../elements/Spacer";
import { Button, Card, CardBody } from "reactstrap";
import { downloadLinkModal } from "../../elements/modals/AssignmentProgressModalCreators";
import { DetailedMarksTab, GroupAssignmentTab, isQuestionFullyAttempted } from "./AssignmentProgressIndividual";
import { formatDate } from "../../elements/DateString";
import { Tabs } from "../../elements/Tabs";

interface AssignmentSummaryCardProps {
    studentsAttempted?: number;
    studentsCompleted?: number;
    totalStudents?: number;
    dueDate?: number | Date;
    isQuiz?: boolean;
}

export const AssignmentSummaryCard = ({studentsAttempted, studentsCompleted, totalStudents, dueDate, isQuiz}: AssignmentSummaryCardProps) => {
    return <Card className="my-4">
        <CardBody className="d-flex flex-column flex-lg-row assignment-progress-group-overview row-gap-2">
            <div className="d-flex align-items-center flex-grow-1 fw-bold">
                <i className={classNames("icon me-2", dueDate && dueDate < new Date() ? "icon-event-complete" : "icon-event-upcoming", siteSpecific("icon-md", "icon-sm"))} color="secondary"/>
                Due: {formatDate(dueDate)}
            </div>
            <div className="d-flex align-items-center flex-grow-1 fw-bold">
                <i className={classNames("icon icon-group me-2", siteSpecific("icon-md", "icon-sm"))} color="secondary"/>
                {studentsAttempted} of {totalStudents} {isQuiz ? "submitted their test" : "attempted all questions"}
            </div>
            <div className="d-flex align-items-center flex-grow-1 fw-bold">
                <i className={classNames("icon icon-task-complete me-2", siteSpecific("icon-md", "icon-sm"))} color="secondary"/>
                {studentsCompleted} of {totalStudents} got full marks
            </div>
        </CardBody>
    </Card>;
};

const ProgressDetails = ({assignment}: { assignment: EnhancedAssignmentWithProgress }) => {
    const dispatch = useAppDispatch();
    const questions = assignment.gameboard.contents;

    const progressData = useMemo<[AssignmentProgressDTO, boolean][]>(() => assignment.progress.map(p => {
        if (!isAuthorisedFullAccess(p)) return [p, false];

        const initialState = {
            ...p,
            correctQuestionPagesCount: 0,
            correctQuestionPartsCount: 0,
            incorrectQuestionPartsCount: 0,
            notAttemptedPartResults: []
        };

        const ret = (p.questionResults || []).reduce<AuthorisedAssignmentProgress>((oldP, results, i) => {
            const correctQuestionsCount  = [CompletionState.ALL_CORRECT].includes(results) ? oldP.correctQuestionPagesCount + 1 : oldP.correctQuestionPagesCount;
            const questions = assignment.gameboard.contents;
            return {
                ...oldP,
                correctQuestionPagesCount: correctQuestionsCount,
                correctQuestionPartsCount: oldP.correctQuestionPartsCount + (p.correctPartResults || [])[i],
                incorrectQuestionPartsCount: oldP.incorrectQuestionPartsCount + (p.incorrectPartResults || [])[i],
                notAttemptedPartResults: [
                    ...oldP.notAttemptedPartResults,
                    (questions[i].questionPartsTotal - (p.correctPartResults || [])[i] - (p.incorrectPartResults || [])[i])
                ]
            };
        }, initialState);
        return [ret, questions.length === ret.correctQuestionPagesCount];
    }), [assignment.gameboard.contents, assignment.progress, questions.length]);

    const progress = progressData.map(pd => pd[0]);

    const numStudentsAttemptedAll = progress.filter(p => p.questionResults?.every(isQuestionFullyAttempted)).length;
    const numStudentsCompletedAll = progress.filter(p => p.questionResults?.every(r => r === CompletionState.ALL_CORRECT)).length;
    const [settingsVisible, setSettingsVisible] = useState(true);

    return <>
        <div className={classNames("d-flex flex-wrap mb-4 gap-2", siteSpecific("mt-md-4", "mt-xl-4"))}>
            {isPhy && <Link to={`${PATHS.ASSIGNMENT_PROGRESS}/group/${assignment.groupId}`} className="d-flex align-items-center">
                <i className="icon icon-arrow-left me-2"/>
                Back to group assignments and tests
            </Link>}
            {isPhy && <Spacer/>}
            <Button className="d-flex align-items-center" color="solid" onClick={() => dispatch(openActiveModal(downloadLinkModal(getAssignmentProgressCSVDownloadLink(assignment.id))))}>
                Download CSV
                <i className="icon icon-download ms-2" color="white"/>
            </Button>
        </div>

        <AssignmentSummaryCard studentsAttempted={numStudentsAttemptedAll} studentsCompleted={numStudentsCompletedAll}
            totalStudents={progress.length} dueDate={assignment.dueDate} />

        <Tabs style="cards">
            {{
                "Group overview": <GroupAssignmentTab
                    assignment={assignment} progress={progress}
                    settingsVisible={settingsVisible} setSettingsVisible={setSettingsVisible}
                />,
                "Detailed marks": <DetailedMarksTab
                    assignment={assignment} progress={progress}
                    settingsVisible={settingsVisible} setSettingsVisible={setSettingsVisible}
                />
            }}
        </Tabs>
    </>;

};

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
