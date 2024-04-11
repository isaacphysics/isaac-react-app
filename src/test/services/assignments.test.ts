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

// Useful dates
const nextWeek = new Date();
nextWeek.setDate(nextWeek.getDate() + 7);

const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);

const middayToday = new Date();
middayToday.setHours(12, 0, 0, 0);

const yesterday = new Date();
yesterday.setDate(yesterday.getDate() - 1);

const lastWeek = new Date();
lastWeek.setDate(lastWeek.getDate() - 7);

const lastMonth = new Date();
lastMonth.setMonth(lastMonth.getMonth() - 1);
lastMonth.setDate(lastMonth.getDate() - 1); // Make sure it is more than 4 weeks ago even in February

const twoMonthsAgo = new Date();
twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);



const completedQuestion = {...threePartQuestion, id: "completed_question", questionPartsCorrect: 3};
const fullyAttemptedQuestion = {...threePartQuestion, id: "fully_attempted_question", questionPartsCorrect: 1, questionPartsIncorrect: 2};
const partiallyAttemptedQuestion = {...threePartQuestion, id: "partially_attempted_question", questionPartsCorrect: 1, questionPartsIncorrect: 1, questionPartsNotAttempted: 1};
const notAttemptedQuestion = {...threePartQuestion, id: "not_attempted_question", questionPartsNotAttempted: 3};

function createAssignmentWithStartDate(assignment: AssignmentDTO): AssignmentDTO & {startDate: Date} {
    const assignmentStartDate = assignment.scheduledStartDate ?? assignment.creationDate as Date;
    return {...assignment, startDate: assignmentStartDate};
}

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
        const recentAssignmentWithoutDueDate: AssignmentDTO = {...assignmentA, creationDate: yesterday};
        const oldAssignmentWithoutDueDate: AssignmentDTO = {...assignmentA, creationDate: lastMonth};

        // Act
        const result = filterAssignmentsByStatus([recentAssignmentWithoutDueDate, oldAssignmentWithoutDueDate]);

        // Assert
        expect(result.inProgressRecent).toContainEqual(createAssignmentWithStartDate(recentAssignmentWithoutDueDate));
        expect(result.inProgressOld).toContainEqual(createAssignmentWithStartDate(oldAssignmentWithoutDueDate));
    });

    it("Records an assignment as 'in progress' if it has a due date is today or in the future, othersie it is condidered 'old'", () => {
        // Arrange
        const assignmentWithAFutreDueDate: AssignmentDTO = {...assignmentA, dueDate: tomorrow};
        const assignmentWithADueDateToday: AssignmentDTO = {...assignmentA, dueDate: middayToday};
        const assignmentWithADueDateYesterday: AssignmentDTO = {...assignmentA, dueDate: yesterday};

        // Act
        const result = filterAssignmentsByStatus([assignmentWithAFutreDueDate, assignmentWithADueDateToday, assignmentWithADueDateYesterday]);

        // Assert
        expect(result.inProgressRecent).toContainEqual(createAssignmentWithStartDate(assignmentWithAFutreDueDate));
        expect(result.inProgressRecent).toContainEqual(createAssignmentWithStartDate(assignmentWithADueDateToday));
        expect(result.inProgressOld).toContainEqual(createAssignmentWithStartDate(assignmentWithADueDateYesterday));
    });

    it("Records an assignment as 'all attempted' if all questions have at least one attempt", () => {
        // Arrange
        const assignmentWithAllQuestionsAttempted: AssignmentDTO = {...assignmentA,
            gameboard: {...assignmentA.gameboard, percentageCorrect: 100 * 7 / 9, percentageAttempted: 100, contents: [completedQuestion, completedQuestion, fullyAttemptedQuestion]}
        };
        const assignmentWithAllQuestionsCorrect: AssignmentDTO = {...assignmentA,
            gameboard: {...assignmentA.gameboard, percentageCorrect: 100, percentageAttempted: 100, contents: [completedQuestion, completedQuestion, completedQuestion]}
        };
        const partiallyAttemptedAssignment: AssignmentDTO = {...assignmentA,
            gameboard: {...assignmentA.gameboard, percentageCorrect: 100 * 4 / 9, percentageAttempted: 100 * 5 / 9, contents: [completedQuestion, partiallyAttemptedQuestion, notAttemptedQuestion]}
        };

        // Act
        const result = filterAssignmentsByStatus([
            assignmentWithAllQuestionsCorrect,
            assignmentWithAllQuestionsAttempted,
            partiallyAttemptedAssignment
        ]);

        // Assert
        expect(result.allAttempted).toContainEqual(createAssignmentWithStartDate(assignmentWithAllQuestionsAttempted));
        expect(result.allAttempted.length).toBe(1);
        expect(result.completed).toContainEqual(createAssignmentWithStartDate(assignmentWithAllQuestionsCorrect));
        expect(result.completed.length).toBe(1);
        expect(result.inProgressOld).toContainEqual(createAssignmentWithStartDate(partiallyAttemptedAssignment));
        expect(result.inProgressOld.length).toBe(1);
    });

    it("Records an assignment as completed if all questions are correct even if due date is in the future", () => {
        // Arrange
        const completedAssignment: AssignmentDTO = {...assignmentA, gameboard: {...assignmentA.gameboard, percentageAttempted: 100}, dueDate: tomorrow};

        // Act
        const result = filterAssignmentsByStatus([completedAssignment]);

        // Assert
        expect(result.completed).toContainEqual(createAssignmentWithStartDate(completedAssignment));
    });

    it("Sorts assignments 'to do' by due soonest then by assigned most recently", () => {
        // Arrange
        const assignmentWithNearDueDate: AssignmentDTO = {...assignmentA, dueDate: tomorrow, creationDate: yesterday};
        const assignmentWithFarDueDate: AssignmentDTO = {...assignmentA, dueDate: nextWeek, creationDate: lastWeek};
        const assignmentWithoutADueDateAndRecentCreationDate: AssignmentDTO = {...assignmentA, creationDate: yesterday};
        const assignmentWithoutADueDateAndAnOlderCreationDate: AssignmentDTO = {...assignmentA, creationDate: lastWeek};

        // Act
        const result = filterAssignmentsByStatus([
            assignmentWithNearDueDate,
            assignmentWithoutADueDateAndRecentCreationDate,
            assignmentWithFarDueDate,
            assignmentWithoutADueDateAndAnOlderCreationDate,
        ]);

        // Assert
        expect(result.inProgressRecent).toEqual([
            assignmentWithNearDueDate,
            assignmentWithFarDueDate,
            assignmentWithoutADueDateAndRecentCreationDate,
            assignmentWithoutADueDateAndAnOlderCreationDate
        ].map(createAssignmentWithStartDate));
    });

    it("Sorts older assignments by date assigned, most recent to oldest", () => {
        // Arrange
        const expiredAssignmentScheduledYesterday: AssignmentDTO = {...assignmentA, dueDate: yesterday, creationDate: lastMonth, scheduledStartDate: yesterday};
        const expiredAssignmentCreatedLastWeek: AssignmentDTO = {...assignmentA, dueDate: yesterday, creationDate: lastWeek};
        const assignmentWithAVeryOldCreationDate: AssignmentDTO = {...assignmentA, creationDate: twoMonthsAgo};

        const result = filterAssignmentsByStatus([
            assignmentWithAVeryOldCreationDate,
            expiredAssignmentCreatedLastWeek,
            expiredAssignmentScheduledYesterday
        ]);

        expect(result.inProgressOld).toEqual([
            expiredAssignmentScheduledYesterday,
            expiredAssignmentCreatedLastWeek,
            assignmentWithAVeryOldCreationDate
        ].map(createAssignmentWithStartDate));

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