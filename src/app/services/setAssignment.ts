import { closeActiveModal, openActiveModal, useAppDispatch, useGetGroupsQuery, useGetMySetAssignmentsQuery, useUnassignGameboardMutation } from "../state";
import { useCallback, useMemo } from "react";
import { SetAssignmentsModal } from "../components/elements/modals/SetAssignmentsModal";
import { getAssigneesByBoard } from "../components/pages/SetAssignments";
import { isDefined } from "./miscUtils";
import { AssignmentDTO, GameboardDTO } from "../../IsaacApiTypes";
import { siteSpecific } from "./siteConstants";

// used to set a new assignment from a given board
export const useSetAssignment = (board?: GameboardDTO) => {
    const dispatch = useAppDispatch();

    const {data: groups} = useGetGroupsQuery(false);
    const {data: assignmentsSetByMe} = useGetMySetAssignmentsQuery(undefined);
    const groupsByGameboard = useMemo(() => getAssigneesByBoard(assignmentsSetByMe), [assignmentsSetByMe]);
    // TODO: at some stage, this modal ought not to allow un-assigning
    const [unassignBoard] = useUnassignGameboardMutation();

    const assignees = useMemo(() => {
        return isDefined(board?.id) && isDefined(groupsByGameboard[board.id]) ? groupsByGameboard[board.id] : [];
    }, [board, groupsByGameboard]);

    const openAssignModal = useCallback(() => {
        dispatch(openActiveModal(SetAssignmentsModal({
            board,
            groups: groups ?? [],
            assignees,
            toggle: () => dispatch(closeActiveModal()),
            unassignBoard
        })));
    }, [assignees, board, dispatch, groups, unassignBoard]);

    return { openAssignModal, assignees };
};

// used to manage an existing assignment, including un- and re-assigning
export const useManageAssignment = (assignment?: AssignmentDTO) => {
    const dispatch = useAppDispatch();

    const {data: groups} = useGetGroupsQuery(false);
    const {data: assignmentsSetByMe} = useGetMySetAssignmentsQuery(undefined);
    const groupsByGameboard = useMemo(() => getAssigneesByBoard(assignmentsSetByMe), [assignmentsSetByMe]);
    const [unassignBoard] = useUnassignGameboardMutation();
    const unassign = () => {
        if (!assignment || !assignment.gameboard || !assignment.gameboardId || !assignment.groupId) return;
        if (confirm(`Are you sure you want to unassign ${assignment.gameboard.title ?? `this ${siteSpecific("question deck", "quiz")}`} from ${assignment.groupName ? `group ${assignment.groupName}` : "this group"}?`)) {
            void unassignBoard({boardId: assignment.gameboardId, groupId: assignment.groupId});
        }
    };

    const assignees = useMemo(() => {
        return isDefined(assignment?.gameboardId) && isDefined(groupsByGameboard[assignment.gameboardId]) ? groupsByGameboard[assignment.gameboardId] : [];
    }, [assignment, groupsByGameboard]);

    const openAssignModal = useCallback(() => {
        dispatch(openActiveModal(SetAssignmentsModal({
            board: assignment?.gameboard,
            groups: groups ?? [],
            assignees,
            toggle: () => dispatch(closeActiveModal()),
            unassignBoard
        })));
    }, [assignees, assignment?.gameboard, dispatch, groups, unassignBoard]);

    return { openAssignModal, unassign, assignees };
};
