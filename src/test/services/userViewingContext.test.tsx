import {determineUserContext, EXAM_BOARD, GameboardAndPathInfo, isPhy, STAGE} from "../../app/services";
import {TransientUserContextState} from "../../app/state";
import {UserContext, Stage, ExamBoard} from "../../IsaacApiTypes";
import {DisplaySettings} from "../../IsaacAppTypes";


describe("User context derivation", () => {
    if (isPhy){
        it("ignores exam board settings on Isaac", () => {
            // Arrange
            const transient: TransientUserContextState = {examBoard: EXAM_BOARD.AQA, stage: STAGE.GCSE};
            const registered: UserContext = {examBoard: EXAM_BOARD.AQA, stage: STAGE.GCSE};

            // Act
            const result = determineUserContext(transient, registered, undefined, undefined);

            // Assert
            expect(result.stage).toEqual(STAGE.GCSE);
            expect(result.explanation.stage).toEqual("your context picker settings");

            expect(result.examBoard).toEqual(EXAM_BOARD.ALL);
            expect(result.explanation.examBoard).toEqual("the site's settings");
        });
    }
    if (isPhy){
        it("uses correct defaults on Isaac", () => {
            // Act
            const result = determineUserContext({}, undefined, undefined, undefined);

            // Assert
            expect(result.stage).toEqual(STAGE.ALL);
            expect(result.explanation.stage).toEqual("the default settings");

            expect(result.examBoard).toEqual(EXAM_BOARD.ALL);
            expect(result.explanation.examBoard).toEqual("the site's settings");

            // on Physics, hasDefaultPreferences is never true
            expect(result.hasDefaultPreferences).toEqual(false);
        });
    } else {
        it("uses correct defaults on Ada", () => {
            // Act
            const result = determineUserContext({}, undefined, undefined, undefined);

            // Assert
            expect(result.stage).toEqual(STAGE.ALL);
            expect(result.explanation.stage).toEqual("the default settings");

            expect(result.examBoard).toEqual(EXAM_BOARD.ADA);
            expect(result.explanation.examBoard).toEqual("the default settings");

            expect(result.hasDefaultPreferences).toEqual(true);
        });
    }

    if (isPhy){
        it("prefers registered context over defaults on Isaac", () => {
            // Arrange
            const registered: UserContext = {stage: STAGE.A_LEVEL};

            // Act
            const result = determineUserContext({}, registered, undefined, undefined);

            // Assert
            expect(result.stage).toEqual(STAGE.A_LEVEL);
            expect(result.explanation.stage).toEqual("your account settings");

            expect(result.examBoard).toEqual(EXAM_BOARD.ALL);
            expect(result.explanation.examBoard).toEqual("the site's settings");
        });
    } else {
        it("prefers registered context over defaults on Ada", () => {
            // Arrange
            const registered: UserContext = {examBoard: EXAM_BOARD.CIE, stage: STAGE.A_LEVEL};

            // Act
            const result = determineUserContext({}, registered, undefined, undefined);

            // Assert
            expect(result.stage).toEqual(STAGE.A_LEVEL);
            expect(result.explanation.stage).toEqual("your account settings");

            expect(result.examBoard).toEqual(EXAM_BOARD.CIE);
            expect(result.explanation.examBoard).toEqual("your account settings");
        });
    }

    if (isPhy){
        it("prefers transient context over registered context on Isaac", () => {
            // Arrange
            const registered: UserContext = {stage: STAGE.A_LEVEL};
            const transient: TransientUserContextState = {stage: STAGE.GCSE};

            // Act
            const result = determineUserContext(transient, registered, undefined, undefined);

            // Assert
            expect(result.stage).toEqual(STAGE.GCSE);
            expect(result.explanation.stage).toEqual("your context picker settings");

            expect(result.examBoard).toEqual(EXAM_BOARD.ALL);
            expect(result.explanation.examBoard).toEqual("the site's settings");

            expect(result.hasDefaultPreferences).toEqual(false);
        });
    } else {
        it("prefers transient context over registered context on Ada", () => {
            // Arrange
            const registered: UserContext = {examBoard: EXAM_BOARD.CIE, stage: STAGE.A_LEVEL};
            const transient: TransientUserContextState = {examBoard: EXAM_BOARD.AQA, stage: STAGE.GCSE};

            // Act
            const result = determineUserContext(transient, registered, undefined, undefined);

            // Assert
            expect(result.stage).toEqual(STAGE.GCSE);
            expect(result.explanation.stage).toEqual("your context picker settings");

            expect(result.examBoard).toEqual(EXAM_BOARD.AQA);
            expect(result.explanation.examBoard).toEqual("your context picker settings");

            expect(result.hasDefaultPreferences).toEqual(false);
        });
    }

    if (isPhy){
        it("prefers gameboard-derived context over transient context on Isaac", () => {
            // Arrange
            const registered: UserContext = {stage: STAGE.A_LEVEL};
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
            const result = determineUserContext(transient, registered, gameboardInfo, undefined);

            // Assert
            expect(result.stage).toEqual(STAGE.FURTHER_A);
            expect(result.explanation.stage).toEqual("the gameboard settings");

            expect(result.examBoard).toEqual(EXAM_BOARD.ALL);
            expect(result.explanation.examBoard).toEqual("the site's settings");
        });
    } else {
        it("prefers gameboard-derived context over transient context on Ada", () => {
            // Arrange
            const registered: UserContext = {examBoard: EXAM_BOARD.CIE, stage: STAGE.A_LEVEL};
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
            const result = determineUserContext(transient, registered, gameboardInfo, undefined);

            // Assert
            expect(result.stage).toEqual(STAGE.SCOTLAND_HIGHER);
            expect(result.explanation.stage).toEqual("the quiz settings");

            expect(result.examBoard).toEqual(EXAM_BOARD.SQA);
            expect(result.explanation.examBoard).toEqual("the quiz settings");

            expect(result.hasDefaultPreferences).toEqual(false);
        });
    }
    it("returns show other content as true when display settings includes HIDE_NON_AUDIENCE_CONTENT as false", () => {
        // Arrange
        const registered: UserContext = {stage: STAGE.A_LEVEL};
        const transient: TransientUserContextState = {stage: STAGE.GCSE};

        const displaySettings: DisplaySettings = {HIDE_NON_AUDIENCE_CONTENT: false};

        // Act
        const result = determineUserContext(transient, registered, undefined, displaySettings);

        // Assert
        expect(result.showOtherContent).toBe(true);
    });
    it("returns show other content as false when display settings includes HIDE_NON_AUDIENCE_CONTENT as true", () => {
        // Arrange
        const registered: UserContext = {stage: STAGE.A_LEVEL};
        const transient: TransientUserContextState = {stage: STAGE.GCSE};

        const displaySettings: DisplaySettings = {HIDE_NON_AUDIENCE_CONTENT: true};

        // Act
        const result = determineUserContext(transient, registered, undefined, displaySettings);

        // Assert
        expect(result.showOtherContent).toBe(false);
    });
    it("defaults show other content to true when display settings absent", () => {
        // Arrange
        const registered: UserContext = {stage: STAGE.A_LEVEL};
        const transient: TransientUserContextState = {stage: STAGE.GCSE};

        const displaySettings: DisplaySettings = {};

        // Act
        const result = determineUserContext(transient, registered, undefined, displaySettings);

        // Assert
        expect(result.showOtherContent).toBe(true);
    });
});