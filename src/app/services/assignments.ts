import {AssignmentDTO} from "../../IsaacApiTypes";
import orderBy from "lodash/orderBy";
import {EnhancedAssignment} from "../../IsaacAppTypes";
import {API_PATH, extractTeacherName} from "./";

export function hasGameboard(assignment: AssignmentDTO): assignment is EnhancedAssignment {
    return assignment.gameboard != undefined;
}
export function getAssignmentCSVDownloadLink(assignmentId: number) {
    return `${API_PATH}/assignments/assign/${assignmentId}/progress/download`;
}

function allQuestionsAttempted(assignment: AssignmentDTO) {
    // questionPartsTotal will be 0 for the case when we someday include concepts in gameboards.
    return assignment?.gameboard?.contents?.every(c => c.questionPartsTotal === 0 || c.questionPartsNotAttempted === 0);
}

function createAssignmentWithStartDate(assignment: AssignmentDTO): AssignmentDTO & {startDate: Date} {
    const assignmentStartDate = assignment.scheduledStartDate ?? assignment.creationDate as Date;
    return {...assignment, startDate: assignmentStartDate};
}

type AssignmentStatus = "inProgressRecent" | "inProgressOld" | "allAttempted" | "completed";
export const filterAssignmentsByStatus = (assignments: AssignmentDTO[] | undefined | null) => {
    const now = new Date();
    const fourWeeksAgo = new Date(now.valueOf() - (4 * 7 * 24 * 60 * 60 * 1000));
    // Midnight last night:
    const midnightLastNight = new Date(now);
    midnightLastNight.setHours(0, 0, 0, 0);

    const myAssignments: Record<AssignmentStatus, (AssignmentDTO & {startDate: Date})[]> = {
        inProgressRecent: [],
        inProgressOld: [],
        allAttempted: [],
        completed: []
    };

    if (assignments) {
        assignments
        .map(createAssignmentWithStartDate)
        .forEach(assignment => {
            if (assignment?.gameboard?.percentageCompleted === undefined || assignment.gameboard.percentageCompleted < 100) {
                const noDueDateButRecent = !assignment.dueDate && (assignment.startDate > fourWeeksAgo);
                const beforeDueDate = assignment.dueDate && (assignment.dueDate >= midnightLastNight);
                if (beforeDueDate || noDueDateButRecent) {
                    myAssignments.inProgressRecent.push(assignment);
                } else if (allQuestionsAttempted(assignment)) {
                    myAssignments.allAttempted.push(assignment);
                } else {
                    myAssignments.inProgressOld.push(assignment);
                }
            } else {
                myAssignments.completed.push(assignment);
            }
        });
        myAssignments.inProgressRecent = orderBy(myAssignments.inProgressRecent, ["dueDate", "startDate"], ["asc", "desc"]);
        myAssignments.inProgressOld = orderBy(myAssignments.inProgressOld, ["startDate"], ["desc"]);
        myAssignments.allAttempted = orderBy(myAssignments.allAttempted, ["startDate"], ["desc"]);
        myAssignments.completed = orderBy(myAssignments.completed, ["startDate"], ["desc"]);
    }

    return myAssignments;
};

export const filterAssignmentsByProperties = (assignments: AssignmentDTO[], assignmentTitleFilter: string,
                                              assignmentGroupFilter: string,
                                              assignmentSetByFilter:string): AssignmentDTO[] => {
    const filteredAssignments: AssignmentDTO[] = []

    if (assignments) {
        assignments.forEach(assignment => {

            const assignmentMatchesFilter =
                assignment?.gameboard?.title?.toLowerCase().includes(assignmentTitleFilter.toLowerCase())
                && (assignmentGroupFilter === "All" || assignment.groupName === assignmentGroupFilter)
                && (assignmentSetByFilter === "All" || extractTeacherName(assignment.assignerSummary)
                    === assignmentSetByFilter)

            if (assignmentMatchesFilter){
                filteredAssignments.push(assignment)
            }
        });
    }
    return filteredAssignments
}

export const getDistinctAssignmentGroups = (assignments: AssignmentDTO[] | undefined | null): Set<string> => {
    const distinctAssignmentGroups = new Set<string>()

    if (assignments) {
        assignments.forEach(assignment => {
            assignment?.groupName && distinctAssignmentGroups.add(assignment.groupName)
        })
    }
    return distinctAssignmentGroups
}

export const getDistinctAssignmentSetters = (assignments: AssignmentDTO[] | undefined | null): Set<string> => {
    const distinctFormattedAssignmentSetters = new Set<string>()

    if (assignments) {
        assignments.forEach(assignment => {
            assignment?.assignerSummary && distinctFormattedAssignmentSetters.add(extractTeacherName(assignment.assignerSummary) as string)
        })
    }
    return distinctFormattedAssignmentSetters
}

export const getAssignmentStartDate = (a: AssignmentDTO): number => (a.scheduledStartDate ?? a.creationDate ?? 0).valueOf();

export const hasAssignmentStarted = (a: AssignmentDTO): boolean => getAssignmentStartDate(a) <= Date.now();
