import { formatBoardOwner } from "../../app/services/gameboards";

// scrollManager is indirectly imported, and importing it fails in this context, therefore we're mocking it.
jest.mock("../../app/services/scrollManager")

describe("Correct board owner is shown", () => {
    it("Shows 'Isaac' as board owner when the tag is present and the current user created the board",
        () => {
        // Arrange
        const user = {id: 0}
        const board = {ownerUserId: 0, tags: ['ISAAC_BOARD']}

        // Act
        const expectedOwnerName = "Isaac"
        const actualOwnerName = formatBoardOwner(user, board)

        // Assert
        expect(actualOwnerName).toEqual(expectedOwnerName);
    })
    it("Shows 'Isaac' as board owner when the tag is present, and another user created the board",
        () => {
            // Arrange
            const user = {id: 0}
            const board = {ownerUserId: 1, tags: ['ISAAC_BOARD']}

            // Act
            const expectedOwnerName = "Isaac"
            const actualOwnerName = formatBoardOwner(user, board)

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
})