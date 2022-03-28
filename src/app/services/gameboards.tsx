import {GameboardDTO, RegisteredUserDTO} from "../../IsaacApiTypes";
import {NOT_FOUND} from "./constants";
import React from "react";
import countBy from "lodash/countBy"
import intersection from "lodash/intersection"
import {SITE, SITE_SUBJECT} from "./siteConstants";
import {CurrentGameboardState} from "../state/reducers/gameboardsState";
import {determineAudienceViews} from "./userContext";
import {ViewingContext} from "../../IsaacAppTypes";

enum boardCompletions {
    "any" = "Any",
    "notStarted" = "Not Started",
    "inProgress" = "In Progress",
    "completed" = "Completed"
}

export function formatBoardOwner(user: RegisteredUserDTO, board: GameboardDTO) {
    if (board.tags && board.tags.includes("ISAAC_BOARD")) {
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
    if (currentGameboard && currentGameboard !== NOT_FOUND && !('inflight' in currentGameboard) && currentGameboard.contents) {
        currentGameboard.contents.map(question => boardQuestions.push(question.id));
        if (boardQuestions.includes(currentDocId)) {
            const gameboardContentIds = currentGameboard.contents.map(q => q.id);
            if (gameboardContentIds.includes(currentDocId)) {
                const nextIndex = gameboardContentIds.indexOf(currentDocId) + 1;
                if (nextIndex < gameboardContentIds.length) {
                    const nextContent = currentGameboard.contents[nextIndex];
                    return {title: nextContent.title as string, to: `/questions/${nextContent.id}`};
                }
            }
        }
    }
};

export const determinePreviousGameboardItem = (currentGameboard: CurrentGameboardState | undefined, currentDocId: string) => {
    const boardQuestions: (string | undefined)[] = [];
    if (currentGameboard && currentGameboard !== NOT_FOUND && !('inflight' in currentGameboard) && currentGameboard.contents) {
        currentGameboard.contents.map(question => boardQuestions.push(question.id));
        if (boardQuestions.includes(currentDocId)) {
            const gameboardContentIds = currentGameboard.contents.map(q => q.id);
            if (gameboardContentIds.includes(currentDocId)) {
                const previousIndex = gameboardContentIds.indexOf(currentDocId) - 1;
                if (previousIndex > -1) {
                    const previousContent = currentGameboard.contents[previousIndex];
                    return {title: previousContent.title as string, to: `/questions/${previousContent.id}`};
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

export const showWildcard = (board: GameboardDTO) => {
    const re = new RegExp('(phys_book_gcse_ch.*|pre_uni_maths.*)');
    const isaacPhysicsBoard = board?.tags?.includes("ISAAC_BOARD") && SITE_SUBJECT === SITE.PHY;
    return board?.id && (re.test(board.id) || isaacPhysicsBoard)
};

export const determineGameboardSubjects = (board: GameboardDTO) => {
    if (SITE_SUBJECT === SITE.CS) {
        return ["compsci"];
    }
    const subjects = ["physics", "maths", "chemistry"];
    let allSubjects: string[] = [];
    board.contents?.map((item) => {
        let tags = intersection(subjects, item.tags || []);
        tags.forEach(tag => allSubjects.push(tag));
    }
    );
    // If none of the questions have a subject tag, default to physics
    if (allSubjects.length === 0) {
        allSubjects.push("physics");
    }
    let enumeratedSubjects = countBy(allSubjects);
    return Object.keys(enumeratedSubjects).sort(function (a, b) {return subjects.indexOf(a) - subjects.indexOf(b)})
        .sort(function (a, b) {return enumeratedSubjects[b] - enumeratedSubjects[a]});
};

export const determineCurrentCreationContext = (currentGameboard: CurrentGameboardState | undefined, currentDocId: string) => {
   if (currentGameboard && currentGameboard !== NOT_FOUND && !('inflight' in currentGameboard) && currentGameboard.contents) {
        return currentGameboard.contents.filter(gameboardItem => gameboardItem.id === currentDocId)[0]?.creationContext;
   }
};


export function comparatorFromOrderedValues<T>(orderedPropertyValues: T[]) {
    return function comparator(a?: T, b?: T) {
        // Ignoring undefined with ! - if it is undefined, so be it, it will return -1
        return orderedPropertyValues.indexOf(a!) - orderedPropertyValues.indexOf(b!);
    }
}

export function allPropertiesFromAGameboard<T extends keyof ViewingContext>(
    gameboard: GameboardDTO | undefined, property: T, orderedPropertyValues?: ViewingContext[T][]
): NonNullable<ViewingContext[T]>[] {
    if (!gameboard) {return [];}
    return Array.from((gameboard?.contents || [])
        .reduce((aggregator, gameboardItem) => {
            determineAudienceViews(gameboardItem.audience, gameboardItem.creationContext).forEach(v => {
                if (v[property]) {
                    aggregator.add(v[property]!); // need "!" to tell TS that it's not undefined even though we check that
                }
            });
            return aggregator;
        }, new Set<NonNullable<ViewingContext[T]>>()))
        .sort(orderedPropertyValues ? comparatorFromOrderedValues(orderedPropertyValues) : () => 0);
}
