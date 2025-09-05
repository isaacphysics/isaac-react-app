import {
    CONTEXT_SOURCE,
    calculateNewUserContext,
    EXAM_BOARD,
    GameboardAndPathInfo,
    getFilteredStageOptions,
    isPhy,
    STAGE
} from "../../app/services";
import {TransientUserContextState} from "../../app/state";
import {UserContext, Stage, ExamBoard} from "../../IsaacApiTypes";


describe("User context derivation", () => {
    if (isPhy){
        it("ignores exam board settings on Isaac", () => {
            // Arrange
            const transient: TransientUserContextState = {examBoard: EXAM_BOARD.AQA, stage: STAGE.GCSE};
            const registered: UserContext[] = [{examBoard: EXAM_BOARD.AQA, stage: STAGE.GCSE}];

            // Act
            const result = calculateNewUserContext(transient, registered, undefined, undefined);

            // Assert
            expect(result.contexts.map(c => c.stage)).toEqual([STAGE.GCSE]);
            expect(result.explanation.stage).toEqual(CONTEXT_SOURCE.TRANSIENT);

            expect(result.contexts.map(c => c.examBoard)).toEqual([EXAM_BOARD.ALL]);
            expect(result.explanation.examBoard).toEqual(CONTEXT_SOURCE.NOT_IMPLEMENTED);
        });
    }
    if (isPhy){
        it("uses correct defaults on Isaac", () => {
            // Act
            const result = calculateNewUserContext({}, undefined, undefined, undefined);

            // Assert
            expect(result.contexts.map(c => c.stage)).toEqual([STAGE.ALL]);
            expect(result.explanation.stage).toEqual(CONTEXT_SOURCE.DEFAULT);

            expect(result.contexts.map(c => c.examBoard)).toEqual([EXAM_BOARD.ALL]);
            expect(result.explanation.examBoard).toEqual(CONTEXT_SOURCE.NOT_IMPLEMENTED);

            // on Physics, hasDefaultPreferences is never true
            expect(result.hasDefaultPreferences).toEqual(false);
        });
    } else {
        it("uses correct defaults on Ada", () => {
            // Act
            const result = calculateNewUserContext({}, undefined, undefined, undefined);

            // Assert
            expect(result.contexts.map(c => c.stage)).toEqual([STAGE.ALL]);
            expect(result.explanation.stage).toEqual(CONTEXT_SOURCE.DEFAULT);

            expect(result.contexts.map(c => c.examBoard)).toEqual([EXAM_BOARD.ADA]);
            expect(result.explanation.examBoard).toEqual(CONTEXT_SOURCE.DEFAULT);

            expect(result.hasDefaultPreferences).toEqual(true);
        });
    }

    if (isPhy){
        it("prefers registered context over defaults on Isaac", () => {
            // Arrange
            const registered: UserContext[] = [{stage: STAGE.A_LEVEL}];

            // Act
            const result = calculateNewUserContext({}, registered, undefined, undefined);

            // Assert
            expect(result.contexts.map(c => c.stage)).toEqual([STAGE.A_LEVEL]);
            expect(result.explanation.stage).toEqual(CONTEXT_SOURCE.REGISTERED);

            expect(result.contexts.map(c => c.examBoard)).toEqual([EXAM_BOARD.ALL]);
            expect(result.explanation.examBoard).toEqual(CONTEXT_SOURCE.NOT_IMPLEMENTED);
        });
    } else {
        it("prefers registered context over defaults on Ada", () => {
            // Arrange
            const registered: UserContext[] = [{examBoard: EXAM_BOARD.CIE, stage: STAGE.A_LEVEL}];

            // Act
            const result = calculateNewUserContext({}, registered, undefined, undefined);

            // Assert
            expect(result.contexts.map(c => c.stage)).toEqual([STAGE.A_LEVEL]);
            expect(result.explanation.stage).toEqual(CONTEXT_SOURCE.REGISTERED);

            expect(result.contexts.map(c => c.examBoard)).toEqual([EXAM_BOARD.CIE]);
            expect(result.explanation.examBoard).toEqual(CONTEXT_SOURCE.REGISTERED);
        });
    }

    if (isPhy){
        it("prefers transient context over registered context on Isaac", () => {
            // Arrange
            const registered: UserContext[] = [{stage: STAGE.A_LEVEL}];
            const transient: TransientUserContextState = {stage: STAGE.GCSE};

            // Act
            const result = calculateNewUserContext(transient, registered, undefined, undefined);

            // Assert
            expect(result.contexts.map(c => c.stage)).toEqual([STAGE.GCSE]);
            expect(result.explanation.stage).toEqual(CONTEXT_SOURCE.TRANSIENT);

            expect(result.contexts.map(c => c.examBoard)).toEqual([EXAM_BOARD.ALL]);
            expect(result.explanation.examBoard).toEqual(CONTEXT_SOURCE.NOT_IMPLEMENTED);

            expect(result.hasDefaultPreferences).toEqual(false);
        });
    } else {
        it("prefers transient context over registered context on Ada", () => {
            // Arrange
            const registered: UserContext[] = [{examBoard: EXAM_BOARD.CIE, stage: STAGE.A_LEVEL}];
            const transient: TransientUserContextState = {examBoard: EXAM_BOARD.AQA, stage: STAGE.GCSE};

            // Act
            const result = calculateNewUserContext(transient, registered, undefined, undefined);

            // Assert
            expect(result.contexts.map(c => c.stage)).toEqual([STAGE.GCSE]);
            expect(result.explanation.stage).toEqual(CONTEXT_SOURCE.TRANSIENT);

            expect(result.contexts.map(c => c.examBoard)).toEqual([EXAM_BOARD.AQA]);
            expect(result.explanation.examBoard).toEqual(CONTEXT_SOURCE.TRANSIENT);

            expect(result.hasDefaultPreferences).toEqual(false);
        });
    }

    if (isPhy){
        it("prefers gameboard-derived context over transient context on Isaac", () => {
            // Arrange
            const registered: UserContext[] = [{stage: STAGE.A_LEVEL}];
            const transient: TransientUserContextState = {stage: STAGE.GCSE};
            const gameboardInfo: GameboardAndPathInfo = {
                boardIdFromDTO: "some-board-id",
                contentsFromDTO: [
                    {
                        id: "some-question-id",
                        audience: [
                            {
                                stage: [STAGE.FURTHER_A as Stage],
                                examBoard: [EXAM_BOARD.AQA as ExamBoard]
                            }
                        ],
                        creationContext: {
                            stage: [STAGE.FURTHER_A as Stage],
                            examBoard: [EXAM_BOARD.AQA as ExamBoard]
                        }
                    }
                ],
                boardIdFromQueryParams: "some-board-id",
                questionIdFromPath: "some-question-id"
            };

            // Act
            const result = calculateNewUserContext(transient, registered, gameboardInfo, undefined);

            // Assert
            expect(result.contexts.map(c => c.stage)).toEqual([STAGE.FURTHER_A]);
            expect(result.explanation.stage).toEqual(CONTEXT_SOURCE.GAMEBOARD);

            expect(result.contexts.map(c => c.examBoard)).toEqual([EXAM_BOARD.ALL]);
            expect(result.explanation.examBoard).toEqual(CONTEXT_SOURCE.NOT_IMPLEMENTED);
        });
    } else {
        it("prefers gameboard-derived context over transient context on Ada", () => {
            // Arrange
            const registered: UserContext[] = [{examBoard: EXAM_BOARD.CIE, stage: STAGE.A_LEVEL}];
            const transient: TransientUserContextState = {examBoard: EXAM_BOARD.AQA, stage: STAGE.GCSE};
            const gameboardInfo: GameboardAndPathInfo = {
                boardIdFromDTO: "some-board-id",
                contentsFromDTO: [
                    {
                        id: "some-question-id",
                        audience: [
                            {
                                stage: [STAGE.SCOTLAND_HIGHER as Stage],
                                examBoard: [EXAM_BOARD.SQA as ExamBoard]
                            }
                        ],
                        creationContext: {
                            stage: [STAGE.SCOTLAND_HIGHER as Stage],
                            examBoard: [EXAM_BOARD.SQA as ExamBoard]
                        }
                    }
                ],
                boardIdFromQueryParams: "some-board-id",
                questionIdFromPath: "some-question-id"
            };

            // Act
            const result = calculateNewUserContext(transient, registered, gameboardInfo, undefined);

            // Assert
            expect(result.contexts.map(c => c.stage)).toEqual([STAGE.SCOTLAND_HIGHER]);
            expect(result.explanation.stage).toEqual(CONTEXT_SOURCE.GAMEBOARD);

            expect(result.contexts.map(c => c.examBoard)).toEqual([EXAM_BOARD.SQA]);
            expect(result.explanation.examBoard).toEqual(CONTEXT_SOURCE.GAMEBOARD);

            expect(result.hasDefaultPreferences).toEqual(false);
        });
    }
});

describe("Get filtered stage", () => {
    it("does not include ALL as an option by default", () => {
        // Act
        const result = getFilteredStageOptions();

        // Assert
        expect(result.some((e) =>  {return e.value == STAGE.ALL;})).toBe(false);
    });

    it("includes ALL as an option when includeNullOptions option is true", () => {
        // Arrange
        const options = {includeNullOptions: true};

        // Act
        const result = getFilteredStageOptions(options);

        // Assert
        expect(result.some((e) =>  {return e.value == STAGE.ALL;})).toBe(true);
    });
});
