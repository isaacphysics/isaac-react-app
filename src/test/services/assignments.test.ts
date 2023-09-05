import {
    filterAssignmentsByProperties,
    filterAssignmentsByStatus,
    getDistinctAssignmentGroups,
    getDistinctAssignmentSetters
} from "../../app/services";
import {AssignmentDTO, GameboardDTO, UserSummaryDTO} from "../../IsaacApiTypes";

const threePartQuestion = {
    id: "three_part_question",
    contentType: "isaacQuestionPage",
    questionPartsCorrect: 0,
    questionPartsIncorrect: 0,
    questionPartsNotAttempted: 0,
    questionPartsTotal: 3,
}

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

const completedQuestion = {...threePartQuestion, id: "completed_question", questionPartsCorrect: 3};
const fullyAttemptedQuestion = {...threePartQuestion, id: "fully_attempted_question", questionPartsCorrect: 1, questionPartsIncorrect: 2};
const partiallyAttemptedQuestion = {...threePartQuestion, id: "partially_attempted_question", questionPartsCorrect: 1, questionPartsIncorrect: 1, questionPartsNotAttempted: 1};
const notAttemptedQuestion = {...threePartQuestion, id: "not_attempted_question", questionPartsNotAttempted: 3};

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

describe("Assignment categorisation depending on status", () => {
    it("Records an assignment as 'in progress' if it has no due date and its creation date is within the last month, otherwise it is considered 'old'", () => {
        // Arrange
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const recentAssignmentWithoutDueDate: AssignmentDTO = {...assignmentA, creationDate: yesterday};

        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);
        lastMonth.setDate(lastMonth.getDate() - 1); // Make sure it is more than 4 weeks ago even in February
        const oldAssignmentWithoutDueDate: AssignmentDTO = {...assignmentA, creationDate: lastMonth};

        // Act
        const result = filterAssignmentsByStatus([recentAssignmentWithoutDueDate, oldAssignmentWithoutDueDate]);

        // Assert
        expect(result.inProgressRecent).toContain(recentAssignmentWithoutDueDate);
        expect(result.inProgressOld).toContain(oldAssignmentWithoutDueDate);
    });

    it("Records an assignment as 'in progress' if it has a due date is today or in the future, othersie it is condidered 'old'", () => {
        // Arrange
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const assignmentWithAFutreDueDate: AssignmentDTO = {...assignmentA, dueDate: tomorrow};

        const middayToday = new Date();
        middayToday.setHours(12, 0, 0, 0);
        const assignmentWithADueDateToday: AssignmentDTO = {...assignmentA, dueDate: middayToday};

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const assignmentWithADueDateYesterday: AssignmentDTO = {...assignmentA, dueDate: yesterday};

        // Act
        const result = filterAssignmentsByStatus([assignmentWithAFutreDueDate, assignmentWithADueDateToday, assignmentWithADueDateYesterday]);

        // Assert
        expect(result.inProgressRecent).toContain(assignmentWithAFutreDueDate);
        expect(result.inProgressRecent).toContain(assignmentWithADueDateToday);
        expect(result.inProgressOld).toContain(assignmentWithADueDateYesterday);
    });

    it("Records an assignment as 'all attempted' if all questions have at least one attempt", () => {
        // Arrange
        const assignmentWithAllQuestionsAttempted: AssignmentDTO = {...assignmentA,
            gameboard: {...assignmentA.gameboard, percentageCompleted: 100 * 7 / 9, contents: [completedQuestion, completedQuestion, fullyAttemptedQuestion]}
        };
        const assignmentWithAllQuestionsCorrect: AssignmentDTO = {...assignmentA,
            gameboard: {...assignmentA.gameboard, percentageCompleted: 100, contents: [completedQuestion, completedQuestion, completedQuestion]}
        };
        const partiallyAttemptedAssignment: AssignmentDTO = {...assignmentA,
            gameboard: {...assignmentA.gameboard, percentageCompleted: 100 * 4 / 9, contents: [completedQuestion, partiallyAttemptedQuestion, notAttemptedQuestion]}
        };

        // Act
        const result = filterAssignmentsByStatus([
            assignmentWithAllQuestionsCorrect,
            assignmentWithAllQuestionsAttempted,
            partiallyAttemptedAssignment
        ]);

        // Assert
        expect(result.allAttempted).toContain(assignmentWithAllQuestionsAttempted);
        expect(result.allAttempted.length).toBe(1);
        expect(result.completed).toContain(assignmentWithAllQuestionsCorrect);
        expect(result.completed.length).toBe(1);
        expect(result.inProgressOld).toContain(partiallyAttemptedAssignment);
        expect(result.inProgressOld.length).toBe(1);
    });

    it("Records an assignment as completed if all questions are correct even if due date is in the future", () => {
        // Arrange
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const completedAssignment: AssignmentDTO = {...assignmentA, gameboard: {...assignmentA.gameboard, percentageCompleted: 100}, dueDate: tomorrow};

        // Act
        const result = filterAssignmentsByStatus([completedAssignment]);

        // Assert
        expect(result.completed).toContain(completedAssignment);
    });
});

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