import {GameboardDTO, RegisteredUserDTO} from "../../IsaacApiTypes";
import {CurrentGameboardState} from "../state/reducers";
import {DATE_FORMATTER, NOT_FOUND} from "./constants";

export function formatDate(date: number | Date | undefined) {
    if (!date) return "Unknown";
    const dateObject = new Date(date);
    return DATE_FORMATTER.format(dateObject);
}

export function formatBoardOwner(user: RegisteredUserDTO, board: GameboardDTO) {
    if (board.tags && board.tags.includes("isaac")) {
        return "Isaac CS";
    }
    if (user.id == board.ownerUserId) {
        return "Me";
    }
    return "Someone else";
}

const createGameabordLink = (gameboardId: string) => `/gameboards#${gameboardId}`;

const createGameboardHistory = (title: string, gameboardId: string) => {
    return [
        // TODO could also push a link to my gameboards here when it exists
        {title: title, to: createGameabordLink(gameboardId)}
    ]
};
export const determineGameboardHistory = (currentGameboard: GameboardDTO) => {
    return createGameboardHistory(currentGameboard.title as string, currentGameboard.id as string);
};
export const makeAttemptAtGameboardHistory = (gamebaordId: string) => {
    return createGameboardHistory("Gameboard", gamebaordId);
};

export const determineNextGameboardItem = (currentGameboard: CurrentGameboardState | undefined, currentDocId: string) => {
    if (currentGameboard && currentGameboard !== NOT_FOUND && currentGameboard.questions) {
        const gameboardContentIds = currentGameboard.questions.map(q => q.id);
        if (gameboardContentIds.includes(currentDocId)) {
            const nextIndex = gameboardContentIds.indexOf(currentDocId) + 1;
            if (nextIndex < gameboardContentIds.length) {
                const nextContent = currentGameboard.questions[nextIndex];
                return {title: nextContent.title as string, to: `/questions/${nextContent.id}`};
            }
        }
    }
};
