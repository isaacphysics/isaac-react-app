import {Difficulty, GameboardDTO, RegisteredUserDTO, Stage} from "../../IsaacApiTypes";
import React, {useCallback, useEffect, useMemo, useState} from "react";
import countBy from "lodash/countBy";
import sortBy from "lodash/sortBy";
import intersection from "lodash/intersection";
import {
    determineAudienceViews,
    difficultiesOrdered,
    isAda,
    isFound,
    isPhy,
    PATHS,
    SITE_TITLE_SHORT,
    stagesOrdered
} from "./";
import {AssignmentBoardOrder, Boards, NOT_FOUND_TYPE, NumberOfBoards} from "../../IsaacAppTypes";
import {
    selectors,
    useAppDispatch,
    useAppSelector,
    useLazyGetGameboardsQuery
} from "../state";
import { useHistoryState } from "../state/actions/history";

export enum BoardCompletions {
    "any" = "Any",
    "notStarted" = "Not Started",
    "inProgress" = "In Progress",
    "allAttempted" = "All Attempted",
    "allCorrect" = "All Correct"
}

export function formatBoardOwner(user: RegisteredUserDTO, board: GameboardDTO) {
    if (board.tags && board.tags.includes("ISAAC_BOARD")) {
        return SITE_TITLE_SHORT;
    }
    if (user && (user.id == board.ownerUserId)) {
        return "Me";
    }
    return "Someone else";
}

export function boardCompletionSelection(board: GameboardDTO, boardCompletion: BoardCompletions) {
    if (boardCompletion == BoardCompletions.notStarted && (board.percentageAttempted == 0 || !board.percentageAttempted)) {
        return true;
    } else if (boardCompletion == BoardCompletions.allAttempted && board.percentageAttempted && board.percentageAttempted == 100) {
        return true;
    } else if (boardCompletion == BoardCompletions.allCorrect && board.percentageCorrect && board.percentageCorrect == 100) {
        return true;
    } else if (boardCompletion == BoardCompletions.inProgress && board.percentageAttempted && board.percentageAttempted != 100 && board.percentageAttempted != 0) {
        return true;
    } else return boardCompletion == BoardCompletions.any;
}

const createGameabordLink = (gameboardId: string) => `${PATHS.GAMEBOARD}#${gameboardId}`;

const createGameboardHistory = (title: string, gameboardId: string) => {
    return [
        // TODO could also push a link to my gameboards here when it exists
        {title: title, to: createGameabordLink(gameboardId)}
    ];
};
export const determineGameboardHistory = (currentGameboard: GameboardDTO) => {
    return createGameboardHistory(currentGameboard.title as string, currentGameboard.id as string);
};

export const determineNextGameboardItem = (currentGameboard: GameboardDTO | NOT_FOUND_TYPE | undefined, currentDocId: string) => {
    const boardQuestions: (string | undefined)[] = [];
    if (isFound(currentGameboard) && currentGameboard.contents) {
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

export const determinePreviousGameboardItem = (currentGameboard: GameboardDTO | NOT_FOUND_TYPE | undefined, currentDocId: string) => {
    const boardQuestions: (string | undefined)[] = [];
    if (isFound(currentGameboard) && currentGameboard.contents) {
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
    const isaacPhysicsBoard = isPhy && board?.tags?.includes("ISAAC_BOARD");
    return board?.id && (re.test(board.id) || isaacPhysicsBoard);
};

export const determineGameboardSubjects = (board?: GameboardDTO) => {
    if (isAda) {
        return ["compsci"];
    } else if (!board) {
        return ["physics"];
    }
    const subjects = ["physics", "maths", "chemistry", "biology"];
    const allSubjects: string[] = [];
    board.contents?.map((item) => {
        const tags = intersection(subjects, item.tags || []);
        tags.forEach(tag => allSubjects.push(tag));
    }
    );
    // If none of the questions have a subject tag, default to physics
    if (allSubjects.length === 0) {
        allSubjects.push("physics");
    }
    const enumeratedSubjects = countBy(allSubjects);
    return Object.keys(enumeratedSubjects).sort(function (a, b) {return subjects.indexOf(a) - subjects.indexOf(b);})
        .sort(function (a, b) {return enumeratedSubjects[b] - enumeratedSubjects[a];});
};

export const determineCurrentCreationContext = (currentGameboard: GameboardDTO | NOT_FOUND_TYPE | undefined, currentDocId: string) => {
    if (isFound(currentGameboard) && currentGameboard.contents) {
        return currentGameboard.contents.filter(gameboardItem => gameboardItem.id === currentDocId)[0]?.creationContext;
    }
};


export function comparatorFromOrderedValues<T>(orderedPropertyValues: T[]) {
    return function comparator(a?: T, b?: T) {
        // Ignoring undefined with ! - if it is undefined, so be it, it will return -1
        return orderedPropertyValues.indexOf(a!) - orderedPropertyValues.indexOf(b!);
    };
}

// A function that returns ordered (stage, difficulties) tuples for a gameboard
export function determineGameboardStagesAndDifficulties(gameboard: GameboardDTO | undefined): [Stage, Difficulty[]][] {
    // Collect stage difficulties
    const stageDifficultiesMap: {[stage in Stage]?: Difficulty[]} = {};
    if (gameboard) {
        gameboard.contents?.forEach(gameboardItem => {
            determineAudienceViews(gameboardItem.audience, gameboardItem.creationContext).forEach(v => {
                if (v.stage && v.difficulty) {
                    if (!stageDifficultiesMap[v.stage]) {
                        stageDifficultiesMap[v.stage] = [];
                    }
                    stageDifficultiesMap[v.stage]?.push(v.difficulty);
                }
            });
        });
    }

    // Create ordered list of stage difficulties
    const orderedStageDifficulties: [Stage, Difficulty[]][] = [];
    stagesOrdered.forEach(stage => {
        if (stageDifficultiesMap[stage]) {
            const orderedAndDeduplicatedDifficulties =
                Array.from(new Set(stageDifficultiesMap[stage])).sort(comparatorFromOrderedValues(difficultiesOrdered));
            orderedStageDifficulties.push([stage, orderedAndDeduplicatedDifficulties]);
        }
    });

    return orderedStageDifficulties;
}

export enum BoardViews {
    "table" = "Table View",
    "card" = "Card View"
}

// Reusable pattern for site-specific "enums"
export const BoardCreators = {
    "all": "All",
    "isaac": SITE_TITLE_SHORT,
    "me": "Me",
    "someoneElse": "Someone else"
} as const;
export type BoardCreators = typeof BoardCreators[keyof (typeof BoardCreators)];

export enum BoardSubjects {
    "all" = "All",
    "physics" = "Physics",
    "maths" = "Maths",
    "chemistry" = "Chemistry",
    "biology" = "Biology"
}

export enum BoardLimit {
    "six" = "6",
    "eighteen" = "18",
    "sixty" = "60",
    "All" = "ALL"
}

export const BOARD_ORDER_NAMES: {[key in AssignmentBoardOrder]: string} = {
    "created": "Date created (recent first)",
    "-created": "Date created (oldest first)",
    "visited": "Date visited (recent first)",
    "-visited": "Date visited (oldest first)",
    "title": "Title (A-Z)",
    "-title": "Title (Z-A)",
    "attempted": "Attempted (lowest first)",
    "-attempted": "Attempted (highest first)",
    "correct": "Correctness (lowest first)",
    "-correct": "Correctness (highest first)"
};

const BOARD_SORT_FUNCTIONS = {
    [AssignmentBoardOrder.visited]: (b: GameboardDTO) => b.lastVisited?.valueOf(),
    [AssignmentBoardOrder.created]: (b: GameboardDTO) => b.creationDate?.valueOf(),
    [AssignmentBoardOrder.title]: (b: GameboardDTO) => b.title,
    [AssignmentBoardOrder.attempted]: (b: GameboardDTO) => b.percentageAttempted,
    [AssignmentBoardOrder.correct]: (b: GameboardDTO) => b.percentageCorrect
};

const parseBoardLimitAsNumber: (limit: BoardLimit) => NumberOfBoards = (limit: BoardLimit) =>
    limit === BoardLimit.All
        ? BoardLimit.All
        : parseInt(limit, 10);

export const useGameboards = (initialView: BoardViews, initialLimit: BoardLimit) => {
    const dispatch = useAppDispatch();
    const [ loadGameboards ] = useLazyGetGameboardsQuery();
    const boards = useAppSelector(selectors.boards.boards);

    const [boardOrder, setBoardOrder] = useHistoryState<AssignmentBoardOrder>("boardOrder", AssignmentBoardOrder.visited);
    const [boardView, setBoardView] = useHistoryState<BoardViews>("boardView", (boards && boards.boards.length > 6) ? BoardViews.table : initialView);
    const [boardLimit, setBoardLimit] = useHistoryState<BoardLimit>("boardLimit", initialLimit);
    const [boardTitleFilter, setBoardTitleFilter] = useHistoryState<string>("boardTitle", "");

    const [loading, setLoading] = useState(false);

    const [numberOfBoards, setNumberOfBoards] = useState<NumberOfBoards>(parseBoardLimitAsNumber(boardLimit));

    const haveAllBoards = boards && boards.totalResults === boards.boards.length;

    // Fetch gameboards from server, no aggregation since we want a fresh list
    const loadInitial = useCallback((limit: NumberOfBoards) => {
        loadGameboards({startIndex: 0, limit, sort: boardOrder}, false);
        setLoading(true);
    }, [loadGameboards, setLoading, boardOrder]);

    // Refetches the boards when the limit changes - should fetch as many boards
    // as the new value of boardLimit
    useEffect(() => loadInitial(parseBoardLimitAsNumber(boardLimit)), [boardLimit]);

    // Refetches the boards when the order changes - should fetch the same
    // number as is currently on screen
    useEffect(() => {
        // Only refetch if we cannot reorder the boards in the frontend (we need all the boards to reorder them)
        if (!haveAllBoards) {
            loadInitial(numberOfBoards);
        }
    }, [boardOrder]);

    // Change board limit when view changes between table and cards
    useEffect(() => {
        if (boardView == BoardViews.table) {
            setBoardLimit(BoardLimit.All);
        } else if (boardView == BoardViews.card && !haveAllBoards) {
            setBoardLimit(BoardLimit.six);
        }
    }, [boardView]);

    // Fetch boardLimit *more* boards from the server, unless we have all boards already
    const viewMore = useCallback(() => {
        const increment = parseBoardLimitAsNumber(boardLimit);
        if (increment != "ALL" && numberOfBoards != "ALL") {
            loadGameboards({startIndex: numberOfBoards, limit: increment, sort: boardOrder});
            setLoading(true);
        }
    }, [dispatch, setLoading, numberOfBoards, boardLimit, boardOrder]);

    // When we get a new set of boards, record the new number
    // Ask for some more boards if we have zero
    useEffect(() => {
        if (boards) {
            const wasLoading = loading;
            setLoading(false);
            if (boards.boards) {
                setNumberOfBoards(boards.boards.length);
                if (!wasLoading && boards.boards.length == 0) {
                    // Through deletion or something we have ended up with no boards, so fetch more.
                    loadInitial(parseBoardLimitAsNumber(boardLimit));
                }
                return;
            }
        }
        setNumberOfBoards(0);
    }, [boards]);

    // If we have all the users boards already, order them client-side
    const orderedBoards = useMemo<Boards | null>(() => {
        if (boards == null || !haveAllBoards) {
            return boards;
        }
        const boardOrderNegative = boardOrder.at(0) == "-";
        const boardOrderKind = (boardOrderNegative ? boardOrder.slice(1) : boardOrder) as "created" | "visited" | "attempted" | "correct" | "title";
        const orderedBoards = sortBy(boards?.boards, BOARD_SORT_FUNCTIONS[boardOrderKind]);
        if (["visited", "created", "-attempted", "-correct", "-title"].includes(boardOrder)) orderedBoards.reverse();
        return {
            totalResults: boards?.totalResults ?? 0,
            boards: orderedBoards
        };
    }, [boards, boardLimit, boardOrder, boardView]);

    return {
        boards: orderedBoards, loading, viewMore,
        boardOrder, setBoardOrder,
        boardView, setBoardView,
        boardLimit, setBoardLimit,
        boardTitleFilter, setBoardTitleFilter
    };
};
