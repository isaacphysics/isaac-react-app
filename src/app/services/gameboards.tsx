import {GameboardDTO, RegisteredUserDTO} from "../../IsaacApiTypes";
import {CurrentGameboardState} from "../state/reducers";
import {NOT_FOUND} from "./constants";
import React from "react";
import countBy from "lodash/countBy"
import intersection from "lodash/intersection"

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

export function boardCompletionSelection(board: GameboardDTO, boardCompletion: boardCompletions) {
    if (boardCompletion == boardCompletions.notStarted && (board.percentageCompleted == 0 || !board.percentageCompleted)) {
        return true;
    } else if (boardCompletion == boardCompletions.completed && board.percentageCompleted && board.percentageCompleted == 100) {
        return true;
    } else if (boardCompletion == boardCompletions.inProgress && board.percentageCompleted && board.percentageCompleted != 100 && board.percentageCompleted != 0) {
        return true;
    } else return boardCompletion == boardCompletions.any;
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

export const determineNextGameboardItem = (currentGameboard: CurrentGameboardState | undefined, currentDocId: string) => {
    const boardQuestions: (string | undefined)[] = [];
    if (currentGameboard && currentGameboard !== NOT_FOUND && currentGameboard.questions) {
        currentGameboard.questions.map(question => boardQuestions.push(question.id));
        if (boardQuestions.includes(currentDocId)) {
            const gameboardContentIds = currentGameboard.questions.map(q => q.id);
            if (gameboardContentIds.includes(currentDocId)) {
                const nextIndex = gameboardContentIds.indexOf(currentDocId) + 1;
                if (nextIndex < gameboardContentIds.length) {
                    const nextContent = currentGameboard.questions[nextIndex];
                    return {title: nextContent.title as string, to: `/questions/${nextContent.id}`};
                }
            }
        }
    }
};

export const generateGameboardSubjectHexagons = (boardSubjects: string[]) => {
    return boardSubjects.map((subject, i) =>
        <div key={subject} className={`board-subject-hexagon subject-${subject} z${i}`} />
    );
};

export const determineGameboardSubjects = (board: GameboardDTO) => {
    let allSubjects: string[] = [];
    board.questions?.map((item) => {
        let tags = intersection(["physics","maths","chemistry"], item.tags || []);
        tags.forEach(tag => allSubjects.push(tag));
    }
    );
    // If none of the questions have a subject tag, default to physics
    if (allSubjects.length == 0) {
        allSubjects.push("physics");
    }
    let enumeratedSubjects = countBy(allSubjects);
    return Object.keys(enumeratedSubjects).sort(function (a,b) {return enumeratedSubjects[b]-enumeratedSubjects[a]});
};
