import React, { useCallback, useMemo, useState } from "react";
import { IconButton } from "./AffixButton";
import { GameboardDTO } from "../../../IsaacApiTypes";
import classNames from "classnames";
import { ButtonProps } from "reactstrap";
import { saveGameboard, selectors, unlinkUserFromGameboard, useAppDispatch, useAppSelector } from "../../state";
import { isLoggedIn, siteSpecific } from "../../services";
import { useTranslation } from "react-i18next";
import i18next from "i18next";

interface SaveBoardButtonProps extends ButtonProps {
    board: GameboardDTO;
    size?: "sm" | "md"; // "md" default (as used for PageMetadata buttons); "sm" aligns with regular .btn padding
}

export const SaveBoardButton = (props: SaveBoardButtonProps) => {
    const { t } = useTranslation();
    const { board, size, className, ...rest } = props;

    const dispatch = useAppDispatch();
    const user = useAppSelector(selectors.user.loggedInOrNull);

    const isLinked = useMemo(() => board.savedToCurrentUser, [board]);
    const [justLinked, setJustLinked] = useState(false);

    const linkBoard = useCallback(() => {
        if (!user || !board) return;
        setJustLinked(true);
        void dispatch(saveGameboard({
            boardId: board.id ?? "",
            user,
        }));
    }, [user, board, dispatch]);

    const unlinkBoard = useCallback(() => {
        if (!user || !board) return;
        const confirmMessage = board.ownerUserId === user.id && !board.tags?.includes("ISAAC_BOARD")
            ? i18next.t("site:gameboard.save.unsaveOwnerConfirm", { boardTitle: board.title })
            : i18next.t("common:gameboard.save.unsaveConfirm", { boardTitle: board.title });
        if (confirm(confirmMessage)) {
            setJustLinked(false);
            void dispatch(unlinkUserFromGameboard({
                boardId: board.id ?? "", 
                boardTitle: board.title
            }));
        }
    }, [user, board, dispatch]);

    if (!isLoggedIn(user)) return null; // anon users should not be able to save boards

    return <IconButton
        icon={{
            name: classNames("icon-star-sparkle", siteSpecific("icon-color-black-hoverable", undefined), { "fill": isLinked, "anim-star-select": justLinked }),
            color: siteSpecific(undefined, props.color === "solid" ? "white" : "primary")
        }}
        className={classNames(className, "w-max-content h-max-content action-button", {"icon-button-sm": size === "sm"})}
        title={isLinked ? t("site:gameboard.save.unsaveLabel") : t("site:gameboard.save.saveLabel")}
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
