import { GameboardDTO } from "../../IsaacApiTypes";
import {determineGameboardPercentageAttempted, formatBoardOwner, SITE_TITLE_SHORT} from "../../app/services";

describe("Correct board owner is shown", () => {
    it(`Shows '${SITE_TITLE_SHORT}' as board owner when the tag is present and the current user created the board`,
        () => {
        // Arrange
        const user = {id: 0};
        const board = {ownerUserId: 0, tags: ['ISAAC_BOARD']};

        // Act
        const expectedOwnerName = SITE_TITLE_SHORT;
        const actualOwnerName = formatBoardOwner(user, board);

        // Assert
        expect(actualOwnerName).toEqual(expectedOwnerName);
    })
    it(`Shows '${SITE_TITLE_SHORT}' as board owner when the tag is present, and another user created the board`,
        () => {
            // Arrange
            const user = {id: 0};
            const board = {ownerUserId: 1, tags: ['ISAAC_BOARD']};

            // Act
            const expectedOwnerName = SITE_TITLE_SHORT;
            const actualOwnerName = formatBoardOwner(user, board);

            // Assert
            expect(actualOwnerName).toEqual(expectedOwnerName);
    })
    it("Shows 'Me' as board owner when the tag is not present, and the current user created the board",
        () => {
        // Arrange
        const user = {id: 0}
        const board = {ownerUserId: 0, tags: []}

        // Act
        const expectedOwnerName = "Me"
        const actualOwnerName = formatBoardOwner(user, board)

        // Assert
        expect(actualOwnerName).toEqual(expectedOwnerName);
    })
    it("Shows 'Someone else' as board owner when the tag is not present, and another user created the board",
        () => {
        // Arrange
        const user = {id: 0}
        const board = {ownerUserId: 1, tags: []}

        // Act
        const expectedOwnerName = "Someone else"
        const actualOwnerName = formatBoardOwner(user, board)

        // Assert
        expect(actualOwnerName).toEqual(expectedOwnerName);
    })
});

describe("determineGameboardPercentageAttempted", () => {
    it("should return 100 when gameboard has no contents", () => {
        const gameboard: GameboardDTO = {id: "1", title: "Test Gameboard", contents: []};
        const percentageAttempted = determineGameboardPercentageAttempted(gameboard);
        expect(percentageAttempted).toEqual(100);
    });

    it("should return 100 when gameboard has contents but no question parts - a gameboard full of concept pages", () => {
        const gameboard: GameboardDTO = {
            id: "1",
            title: "Test Gameboard",
            contents: [
                {id: "1", title: "Concept 1", questionPartsTotal: 0, questionPartsNotAttempted: 0},
                {id: "2", title: "Concept 2", questionPartsTotal: 0, questionPartsNotAttempted: 0},
                {id: "3", title: "Concept 3", questionPartsTotal: 0, questionPartsNotAttempted: 0}
            ]
        };
        const percentageAttempted = determineGameboardPercentageAttempted(gameboard);
        expect(percentageAttempted).toEqual(100);
    });

    it("should return 100 when gameboard has contents and all question parts are attempted", () => {
        const gameboard: GameboardDTO = {
            id: "1",
            title: "Test Gameboard",
            contents: [
                {id: "1", title: "Question 1", questionPartsTotal: 2, questionPartsNotAttempted: 0},
                {id: "2", title: "Question 2", questionPartsTotal: 3, questionPartsNotAttempted: 0},
                {id: "3", title: "Question 3", questionPartsTotal: 1, questionPartsNotAttempted: 0}
            ]
        };
        const percentageAttempted = determineGameboardPercentageAttempted(gameboard);
        expect(percentageAttempted).toEqual(100);
    });

    it("should return 100 when gameboard has contents and all question parts are attempted even if there includes a Concept with no parts", () => {
        const gameboard: GameboardDTO = {
            id: "1",
            title: "Test Gameboard",
            contents: [
                {id: "1", title: "Question 1", questionPartsTotal: 2, questionPartsNotAttempted: 0},
                {id: "2", title: "Question 2", questionPartsTotal: 3, questionPartsNotAttempted: 0},
                {id: "3", title: "Concept 1", questionPartsTotal: 0, questionPartsNotAttempted: 0}
            ]
        };
        const percentageAttempted = determineGameboardPercentageAttempted(gameboard);
        expect(percentageAttempted).toEqual(100);
    });

    it("should return the correct percentage when gameboard has contents and some question parts are attempted", () => {
        const gameboard: GameboardDTO = {
            id: "1",
            title: "Test Gameboard",
            contents: [
                {id: "1", title: "Question 1", questionPartsTotal: 2, questionPartsNotAttempted: 1},
                {id: "2", title: "Question 2", questionPartsTotal: 3, questionPartsNotAttempted: 2},
                {id: "3", title: "Question 3", questionPartsTotal: 1, questionPartsNotAttempted: 0}
            ]
        };
        const percentageAttempted = determineGameboardPercentageAttempted(gameboard);
        expect(percentageAttempted).toEqual(50);
    });
});