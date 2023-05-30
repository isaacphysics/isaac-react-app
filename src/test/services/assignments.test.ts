import {
    filterAssignmentsByProperties,
    getDistinctAssignmentGroups,
    getDistinctAssignmentSetters
} from "../../app/services";
import {AssignmentDTO} from "../../IsaacApiTypes";


const assignmentA = {
    gameboardId: "0",
    gameboard: {
        title: "A gameboard"
    },
    groupName: "Class A",
    assignerSummary: {
        givenName: "Alan",
        familyName: "Anderson"
    }
}

const assignmentB = {
    gameboardId: "1",
    gameboard: {
        title: "Another gameboard"
    },
    groupName: "Class B",
    assignerSummary: {
        givenName: "Bob",
        familyName: "Bruce"
    }
}

const assignmentC = {
    gameboardId: "2",
    gameboard: {
        title: "Yet another gameboard"
    },
    groupName: "Class C",
    assignerSummary: {
        givenName: "Charles",
        familyName: "Conway"
    }
}

const assignmentD = {
    gameboardId: "2",
    gameboard: {
        title: "An additional gameboard, for your consideration"
    },
    groupName: "Class D",
    assignerSummary: {
        givenName: "Charles",
        familyName: "Conway"
    }
}
const assignments: AssignmentDTO[] = [assignmentA, assignmentB, assignmentC, assignmentD]


describe("Correct assignments are filtered out based on properties", () => {
    it("Returns only the relevant assignment when 'Yet another gameboard' name filter is applied",
        () => {
            // Arrange
            const titleFilter = "Yet another gameboard"
            const groupFilter = "All"
            const setByFilter = "All"

            // Act
            const expectedFilteredAssignments: AssignmentDTO[] = [assignmentC]
            const actualFilteredAssignments = filterAssignmentsByProperties(assignments, titleFilter, groupFilter, setByFilter)

            // Assert
            expect(actualFilteredAssignments).toEqual(expectedFilteredAssignments);
        }
    )

    it("Returns no assignments when 'A non-existent gameboard' name filter is applied",
        () => {
            // Arrange
            const titleFilter = "A non-existent gameboard"
            const groupFilter = "All"
            const setByFilter = "All"

            // Act
            const expectedFilteredAssignments: AssignmentDTO[] = []
            const actualFilteredAssignments = filterAssignmentsByProperties(assignments, titleFilter, groupFilter, setByFilter)

            // Assert
            expect(actualFilteredAssignments).toEqual(expectedFilteredAssignments);
        }
    )

    it("Returns only the relevant assignment when 'Class A' filter is applied",
        () => {
            // Arrange
            const titleFilter = ""
            const groupFilter = "Class A"
            const setByFilter = "All"

            // Act
            const expectedFilteredAssignments = [assignmentA]
            const actualFilteredAssignments = filterAssignmentsByProperties(assignments, titleFilter, groupFilter, setByFilter)

            // Assert
            expect(actualFilteredAssignments).toEqual(expectedFilteredAssignments);
        }
    )

    it("Returns no assignments when 'A non-existent group' group filter is applied",
        () => {
            // Arrange
            const titleFilter = ""
            const groupFilter = "A non-existent group"
            const setByFilter = "All"

            // Act
            const expectedFilteredAssignments: AssignmentDTO[] = []
            const actualFilteredAssignments = filterAssignmentsByProperties(assignments, titleFilter, groupFilter, setByFilter)

            // Assert
            expect(actualFilteredAssignments).toEqual(expectedFilteredAssignments);
        }
    )

    it("Returns only the relevant assignment when 'A. Anderson' set-by filter is applied",
        () => {
            // Arrange
            const titleFilter = ""
            const groupFilter = "All"
            const setByFilter = "A. Anderson"

            // Act
            const expectedFilteredAssignments: AssignmentDTO[] = [assignmentA]
            const actualFilteredAssignments = filterAssignmentsByProperties(assignments, titleFilter, groupFilter, setByFilter)

            // Assert
            expect(actualFilteredAssignments).toEqual(expectedFilteredAssignments);
        }
    )

    it("Returns no assignments when when 'N. Existent' set-by filter is applied",
        () => {
            // Arrange
            const titleFilter = ""
            const groupFilter = "All"
            const setByFilter = "N. Existent"

            // Act
            const expectedFilteredAssignments: AssignmentDTO[] = []
            const actualFilteredAssignments = filterAssignmentsByProperties(assignments, titleFilter, groupFilter, setByFilter)

            // Assert
            expect(actualFilteredAssignments).toEqual(expectedFilteredAssignments);
        }
    )

    it("Returns only the relevant assignment when a combination of filters is applied",
        () => {
            // Arrange
            const titleFilter = ""
            const groupFilter = "Class D"
            const setByFilter = "C. Conway"

            // Act
            const expectedFilteredAssignments: AssignmentDTO[] = [assignmentD]
            const actualFilteredAssignments = filterAssignmentsByProperties(assignments, titleFilter, groupFilter, setByFilter)

            // Assert
            expect(actualFilteredAssignments).toEqual(expectedFilteredAssignments);
        }
    )

    it("Returns all gameboards when default filters are applied",
        () => {
            // Arrange
            const titleFilter = ""
            const groupFilter = "All"
            const setByFilter = "All"

            // Act
            const expectedFilteredAssignments: AssignmentDTO[] = assignments
            const actualFilteredAssignments = filterAssignmentsByProperties(assignments, titleFilter, groupFilter, setByFilter)

            // Assert
            expect(actualFilteredAssignments).toEqual(expectedFilteredAssignments);
        }
    )
})

describe("Distinct groups and assignment setters in the assignment list are found", () => {
    it("Finds the set of distinct groups in the assignment list", () => {
        // Act
        const expectedDistinctGroups = new Set<string>(["Class A", "Class B", "Class C", "Class D"])
        const distinctGroups = getDistinctAssignmentGroups(assignments)

        // Assert
        expect(expectedDistinctGroups).toEqual(distinctGroups);
    })

    it("Finds the formatted set of distinct assignment setters in the assignment list", () => {
        // Act
        const expectedDistinctGroups = new Set<string>(["A. Anderson", "B. Bruce", "C. Conway"])
        const distinctGroups = getDistinctAssignmentSetters(assignments)

        // Assert
        expect(expectedDistinctGroups).toEqual(distinctGroups);
    })
})