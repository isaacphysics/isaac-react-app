import {GameboardDTO, RegisteredUserDTO} from "../../IsaacApiTypes";
import {CurrentGameboardState} from "../state/reducers";
import {NOT_FOUND} from "./constants";

enum boardCompletions {
    "any" = "Any",
    "notStarted" = "Not Started",
    "inProgress" = "In Progress",
    "completed" = "Completed"
}

export function formatBoardOwner(user: RegisteredUserDTO, board: GameboardDTO) {
    if (board.tags && board.tags.includes("isaac")) {
        return "Isaac";
    }
    if (user.id == board.ownerUserId) {
        return "Me";
    }
    return "Someone else";
}

// export function boardCompletionSelection(board: GameboardDTO, boardCompletion: boardCompletions) {
//
// }

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
