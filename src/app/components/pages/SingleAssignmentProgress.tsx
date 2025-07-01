import React, {useContext} from "react";
import {useParams} from "react-router-dom";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {Container, Label, UncontrolledTooltip} from "reactstrap";
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
    above,
    ASSIGNMENT_PROGRESS_CRUMB,
    useAssignmentProgressAccessibilitySettings,
    useDeviceSize
} from "../../services";
import {ProgressDetails} from "./AssignmentProgressIndividual";
import {downloadLinkModal} from "../elements/modals/AssignmentProgressModalCreators";
import {skipToken} from "@reduxjs/toolkit/query";
import {combineQueries, ShowLoadingQuery} from "../handlers/ShowLoadingQuery";
import {AssignmentDTO, AssignmentProgressDTO, RegisteredUserDTO} from "../../../IsaacApiTypes";
import StyledToggle from "../elements/inputs/StyledToggle";
import { ICON, passMark } from "../elements/quiz/QuizProgressCommon";

const SingleProgressDetails = ({assignment}: {assignment: EnhancedAssignmentWithProgress}) => {
    const dispatch = useAppDispatch();
    const pageSettings = useContext(AssignmentProgressPageSettingsContext);

    function openAssignmentDownloadLink(event: React.MouseEvent<HTMLAnchorElement & HTMLButtonElement>) {
        event.stopPropagation();
        event.preventDefault();
        dispatch(openActiveModal(downloadLinkModal(event.currentTarget.href)));
    }

    return <div className={"assignment-progress-details single-assignment" + (pageSettings?.colourBlind ? " colour-blind" : "")}>
        {/* <AssignmentProgressLegend /> */}
        {/* <div className="single-download mb-2 mx-4">
            <Button className="d-none d-md-inline" color="link" tag="a" href={getAssignmentCSVDownloadLink(assignment.id)} onClick={openAssignmentDownloadLink}>Download CSV</Button>
        </div> */}
        {/* <div className="mx-md-4 mx-sm-2"> */}
        <ProgressDetails assignment={assignment}/>
        {/* </div> */}
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
                icon={{type: "hex", icon: "icon-revision"}}
            />
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
        </Container>
    </>;
};

const QuestionKey = ({icon, description}: {icon: React.JSX.Element, description?: string}) => {
    return <li className="d-flex flex-column flex-md-row flex-wrap px-1 align-items-center justify-content-center">
        <div className="key-cell me-0 me-md-2">{icon}</div>
        {description && <div className="key-description">{description}</div>}
    </li>;
};

const LegendKey = ({cellClass, description}: {cellClass: string, description?: string}) => {
    return <li className="d-flex flex-row flex-md-column flex-lg-row flex-wrap px-1 py-1 py-md-2 justify-content-start justify-content-md-center align-items-center">
        <div className="key-cell d-flex me-2 me-md-0 me-lg-2"><span className={cellClass}/></div>
        {description && <div className="key-description">{description}</div>}
    </li>;
};

export const AssignmentProgressLegend = ({id}: {id?: string}) => {
    const context = useContext(AssignmentProgressPageSettingsContext);
    return <div className="mb-2">
        <Label htmlFor={`key-${id}`} className="mt-2">Section key:</Label>
        <div className="d-flex flex-row flex-sm-column justify-content-between">
            {context?.attemptedOrCorrect === "CORRECT" 
                ? <ul id={`key-${id}`} className="block-grid-xs-1 block-grid-sm-2 block-grid-md-5 flex-grow-1 pe-2 ps-0 ps-sm-2 m-0">
                    <LegendKey cellClass="completed" description={`100% correct`}/>
                    <LegendKey cellClass="passed" description={`≥${passMark * 100}% correct`}/>
                    <LegendKey cellClass="in-progress" description={`<${passMark * 100}% correct`}/>
                    <LegendKey cellClass="failed" description={`>${100 - (passMark * 100)}% incorrect`}/>
                    <LegendKey cellClass="" description={`Not attempted`}/>
                </ul>
                : <ul id={`key-${id}`} className="block-grid-xs-1 block-grid-sm-2 block-grid-md-4 flex-grow-1 pe-2 ps-0 ps-sm-2 m-0">
                    <LegendKey cellClass="fully-attempted" description={`100% attempted`}/>
                    <LegendKey cellClass="passed" description={`≥${passMark * 100}% attempted`}/>
                    <LegendKey cellClass="in-progress" description={`≥${100 - passMark * 100}% attempted`}/>
                    <LegendKey cellClass="" description={`<25% attempted`}/>
                </ul>
            }
        </div>
    </div>;
};
