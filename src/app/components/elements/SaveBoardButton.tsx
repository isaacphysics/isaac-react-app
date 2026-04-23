import React, { useCallback, useMemo } from "react";
import { IconButton } from "./AffixButton";
import { GameboardDTO } from "../../../IsaacApiTypes";
import classNames from "classnames";
import { ButtonProps } from "reactstrap";
import { saveGameboard, selectors, showErrorToast, unlinkUserFromGameboard, useAppDispatch, useAppSelector } from "../../state";
import { isAdminOrEventManager, siteSpecific } from "../../services";

interface SaveBoardButtonProps extends ButtonProps {
    board: GameboardDTO;
    size?: "sm" | "md"; // "md" default (as used for PageMetadata buttons); "sm" aligns with regular .btn padding
    hasAssignedGroups?: boolean;
}

export const SaveBoardButton = (props: SaveBoardButtonProps) => {
    const { board, size, hasAssignedGroups: _, className, ...rest } = props;

    const dispatch = useAppDispatch();
    const user = useAppSelector(selectors.user.loggedInOrNull);

    const isLinked = useMemo(() => board.savedToCurrentUser, [board]);

    const linkBoard = useCallback(() => {
        if (!user || !board) return;
        void dispatch(saveGameboard({
            boardId: board.id ?? "",
            boardTitle: board.title,
            user,
        }));
    }, [user, board, dispatch]);

    const unlinkBoard = useCallback(() => {
        if (!user || !board) return;
        const confirmMessage = board.ownerUserId === user.id && !board.tags?.includes("ISAAC_BOARD")
            ? `Are you sure you want to unlink your board '${board.title}' from your account? You'll only be able to find it again if you've set it as an assignment.`
            : `Are you sure you want to unlink '${board.title}' from your account?`;
        if (confirm(confirmMessage)) {
            void dispatch(unlinkUserFromGameboard({
                boardId: board.id ?? "", 
                boardTitle: board.title
            }));
        }
    }, [user, board, dispatch]);


    return <IconButton
        color="tint"
        icon={{name: classNames("icon-star icon-color-black-hoverable", { "fill": isLinked })}}
        className={classNames(className, "w-max-content h-max-content action-button", {"icon-button-sm": size === "sm"})}
        title={isLinked ? "Unsave board" : "Save board"}
        data-bs-theme="neutral"
        onClick={(e) => { 
            e.preventDefault();
            if (isLinked) {
                unlinkBoard();
            } else {
                linkBoard();
            }
        }}
        {...rest}
    />;
};


//! ADA-ONLY; I'd really like to move to exclusively using the above, but while there is inconsistency in Ada saving attempted decks automatically vs Sci saving only manually,
//! this supports the Ada use case.
export const RemoveBoardButton = (props: SaveBoardButtonProps) => {
    const { board, size, hasAssignedGroups, className, ...rest } = props;

    const dispatch = useAppDispatch();
    const user = useAppSelector(selectors.user.loggedInOrNull);

    function confirmDeleteBoard() {
        if (hasAssignedGroups) {
            if (isAdminOrEventManager(user)) {
                alert(`Warning: You currently have groups assigned to this ${siteSpecific("question deck", "quiz")}. If you delete this your groups will still be assigned but you won't be able to unassign them or see the ${siteSpecific("question deck", "quiz")} on the ${siteSpecific("Set assignments", "Quizzes")} page.`);
            } else {
                dispatch(showErrorToast(`${siteSpecific("Question Deck", "Quiz")} Deletion Not Allowed`, `You have groups assigned to this gameboard. To delete this ${siteSpecific("question deck", "quiz")}, you must unassign all groups.`));
                return;
            }
        }

        if (confirm(`Are you sure you want to remove '${board.title}' from your account?`)) {
            void dispatch(unlinkUserFromGameboard({boardId: board.id, boardTitle: board.title}));
        }
    }

    return <IconButton 
        icon={{name: "icon-bin", size: "sm"}}
        color="keyline"
        className={classNames(className, "action-button", {"icon-button-sm": size === "sm"})}
        aria-label="Delete quiz"
        title="Delete quiz"
        onClick={confirmDeleteBoard}
        {...rest}
    />;
};
