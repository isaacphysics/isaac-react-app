import React, {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {Button, Container} from "reactstrap";
import {loadAssignmentsOwnedByMe, loadBoard, loadProgress, openActiveModal} from "../../state/actions";
import {useAppDispatch, useAppSelector} from "../../state/store";
import {AppState} from "../../state/reducers";
import {SingleProgressDetailsProps} from "../../../IsaacAppTypes";
import {ASSIGNMENT_PROGRESS_CRUMB} from "../../services/constants";
import {ShowLoading} from "../handlers/ShowLoading";
import {AssignmentProgressLegend, ProgressDetails} from "./AssignmentProgress";
import {downloadLinkModal} from "../elements/modals/AssignmentProgressModalCreators";
import {getAssignmentCSVDownloadLink, hasGameboard} from "../../services/assignments";
import {selectors} from "../../state/selectors";

const SingleProgressDetails = (props: SingleProgressDetailsProps) => {
    const {assignmentId, assignment, progress, pageSettings} = props;
    const dispatch = useAppDispatch();

    function openAssignmentDownloadLink(event: React.MouseEvent<HTMLAnchorElement & HTMLButtonElement>) {
        event.stopPropagation();
        event.preventDefault();
        dispatch(openActiveModal(downloadLinkModal(event.currentTarget.href)));
    }

    return <div className={"assignment-progress-details single-assignment" + (pageSettings.colourBlind ? " colour-blind" : "")}>
        <AssignmentProgressLegend pageSettings={pageSettings}/>
        <div className="single-download mb-2 mx-4">
            <Button className="d-none d-md-inline" color="link" tag="a" href={getAssignmentCSVDownloadLink(assignmentId)} onClick={openAssignmentDownloadLink}>Download CSV</Button>
        </div>
        <div className="mx-md-4 mx-sm-2">
            <ProgressDetails assignmentId={assignmentId} pageSettings={pageSettings} assignment={assignment} progress={progress}/>
        </div>
    </div>;
};

export const SingleAssignmentProgress = () => {
    const dispatch = useAppDispatch();
    const params = useParams<{ assignmentId?: string }>();
    const assignmentId = parseInt(params.assignmentId || ""); // DANGER: This will produce a NaN if params.assignmentId is undefined

    useEffect(() => {
        dispatch(loadProgress({_id: assignmentId}));
        dispatch(loadAssignmentsOwnedByMe());
    }, [dispatch, assignmentId]);

    const [colourBlind, setColourBlind] = useState(false);
    const [formatAsPercentage, setFormatAsPercentage] = useState(false);

    const myOwnedAssignments = useAppSelector((state: AppState) => {
        return state?.assignmentsByMe
    });

    useEffect(() => {
        const thisAssignment = myOwnedAssignments?.filter(obj => {
            return obj._id == assignmentId
        })[0];
        const boardId = thisAssignment?.gameboardId;
        boardId && dispatch(loadBoard(boardId));
    }, [dispatch, myOwnedAssignments]);

    const assignmentProgress = useAppSelector(selectors.assignments.progress);

    const boards = useAppSelector((state: AppState) => {
        return state?.boards?.boards?.boards;
    });

    const pageSettings = {colourBlind, setColourBlind, formatAsPercentage, setFormatAsPercentage};


    const [assignment, setAssignment] = useState(myOwnedAssignments?.find(x => x._id == assignmentId));

    useEffect(() => {
        if (boards && (boards[0].id = assignment?.gameboardId)) {
            setAssignment({...assignment, gameboard: boards[0]})
        }
    }, [boards]);

    useEffect(() => {
        setAssignment(myOwnedAssignments?.find(x => x._id == assignmentId));
    }, [myOwnedAssignments, assignmentId]);

    return <React.Fragment>
        <ShowLoading until={assignment && assignmentProgress}>
            <Container>
                <TitleAndBreadcrumb intermediateCrumbs={[ASSIGNMENT_PROGRESS_CRUMB]}
                    currentPageTitle={`Assignment Progress: ${assignment?.gameboard?.title || "Assignment Progress" }`}
                    className="mb-4" />
            </Container>

            <div className="assignment-progress-container mb-5">
                {assignment && assignmentProgress && hasGameboard(assignment) &&
                <SingleProgressDetails assignmentId={assignmentId} assignment={assignment}
                    progress={assignmentProgress[assignmentId]} pageSettings={pageSettings}/>
                }
            </div>

        </ShowLoading>
    </React.Fragment>
};
