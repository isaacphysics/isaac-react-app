import React, {useContext, useMemo} from "react";
import {useParams} from "react-router-dom";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {Button, Container} from "reactstrap";
import {openActiveModal} from "../../state/actions";
import {useAppDispatch} from "../../state/store";
import {
    AssignmentProgressPageSettingsContext,
    EnhancedAssignmentWithProgress
} from "../../../IsaacAppTypes";
import {ASSIGNMENT_PROGRESS_CRUMB} from "../../services/constants";
import {ShowLoading} from "../handlers/ShowLoading";
import {AssignmentProgressFetchError, AssignmentProgressLegend, ProgressDetails} from "./AssignmentProgress";
import {downloadLinkModal} from "../elements/modals/AssignmentProgressModalCreators";
import {getAssignmentCSVDownloadLink} from "../../services/assignments";
import {isaacApi} from "../../state/slices/api";
import {useAssignmentProgressAccessibilitySettings} from "../../services/progress";
import {IsaacSpinner} from "../handlers/IsaacSpinner";
import {skipToken} from "@reduxjs/toolkit/query";

const SingleProgressDetails = (props: SingleProgressDetailsProps) => {
    const {assignmentId, assignment, progress, pageSettings} = props;
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
    const boards = useAppSelector(selectors.boards.boards);



    const [assignment, setAssignment] = useState(myOwnedAssignments?.find(x => x._id == assignmentId));

    useEffect(() => {
        if (boards && (boards.boards[0].id = assignment?.gameboardId)) {
            setAssignment({...assignment, gameboard: boards.boards[0]})
        }
    }, [boards]);

    useEffect(() => {
        setAssignment(myOwnedAssignments?.find(x => x._id == assignmentId));
    }, [myOwnedAssignments, assignmentId]);
    const pageSettings = useAssignmentProgressAccessibilitySettings();

    return <ShowLoading until={assignment && assignmentProgress}>
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
            <AssignmentProgressPageSettingsContext.Provider value={pageSettings}>
            </AssignmentProgressPageSettingsContext.Provider>
        </div>
    </ShowLoading>
};
