import { closeActiveModal, openActiveModal, useAppDispatch, useGetGroupsQuery, useGetMySetAssignmentsQuery, useUnassignGameboardMutation } from "../state";
import { useCallback, useMemo } from "react";
import { SetAssignmentsModal } from "../components/elements/modals/SetAssignmentsModal";
import { getAssigneesByBoard } from "../components/pages/SetAssignments";
import { isDefined } from "./miscUtils";
import { GameboardDTO } from "../../IsaacApiTypes";

export const useSetAssignment = (board: GameboardDTO) => {
    const dispatch = useAppDispatch();

    const {data: groups} = useGetGroupsQuery(false);
    const {data: assignmentsSetByMe} = useGetMySetAssignmentsQuery(undefined);
    const groupsByGameboard = useMemo(() => getAssigneesByBoard(assignmentsSetByMe), [assignmentsSetByMe]);
    const [unassignBoard] = useUnassignGameboardMutation();

    const assignees = useMemo(() => {
        return isDefined(board.id) && isDefined(groupsByGameboard[board.id]) ? groupsByGameboard[board.id] : [];
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
