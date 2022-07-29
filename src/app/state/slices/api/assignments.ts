import {isaacApi} from "./index";
import {useAppDispatch, useAppSelector} from "../../store";
import {selectors} from "../../selectors";
import React, {useCallback, useMemo} from "react";
import {isFound} from "../../../services/miscUtils";
import {openActiveModal} from "../../actions";
import {downloadLinkModal} from "../../../components/elements/modals/AssignmentProgressModalCreators";

export const useGroupAssignments = (groupId?: number) => {
    const dispatch = useAppDispatch();
    const { data: groupBoardAssignments } = isaacApi.endpoints.getMySetAssignments.useQuery(groupId);
    const quizAssignments = useAppSelector(selectors.quizzes.assignments);
    const groupQuizAssignments = useMemo(() =>
            isFound(quizAssignments)
                ? quizAssignments?.filter(a => a.groupId === groupId)
                : undefined
        , [quizAssignments]);

    const assignmentCount = (groupBoardAssignments?.length ?? 0) + (groupQuizAssignments?.length ?? 0);

    const openGroupDownloadLink = useCallback((event: React.MouseEvent<HTMLAnchorElement>) => {
        event.stopPropagation();
        event.preventDefault();
        dispatch(openActiveModal(downloadLinkModal(event.currentTarget.href)));
    }, [dispatch]);

    const openGroupQuizDownloadLink = useCallback((event: React.MouseEvent<HTMLAnchorElement>) => {
        event.stopPropagation();
        event.preventDefault();
        dispatch(openActiveModal(downloadLinkModal(event.currentTarget.href)));
    }, [dispatch]);

    return {
        groupBoardAssignments,
        groupQuizAssignments,
        assignmentCount,
        openGroupDownloadLink,
        openGroupQuizDownloadLink
    }
}