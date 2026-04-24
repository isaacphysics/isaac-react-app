import React, { useCallback, useMemo } from "react";
import { IconButton } from "./AffixButton";
import { GameboardDTO } from "../../../IsaacApiTypes";
import classNames from "classnames";
import { ButtonProps } from "reactstrap";
import { saveGameboard, selectors, unlinkUserFromGameboard, useAppDispatch, useAppSelector } from "../../state";

interface SaveBoardButtonProps extends ButtonProps {
    board: GameboardDTO;
    size?: "sm" | "md"; // "md" default (as used for PageMetadata buttons); "sm" aligns with regular .btn padding
}

export const SaveBoardButton = (props: SaveBoardButtonProps) => {
    const { board, size, className, ...rest } = props;

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
