import {AssignmentDTO, IAssignmentLike} from "../../IsaacApiTypes";
import orderBy from "lodash/orderBy";
import {EnhancedAssignment} from "../../IsaacAppTypes";
import {API_PATH, extractTeacherName, matchesAllWordsInAnyOrder} from "./";

export function hasGameboard(assignment: AssignmentDTO): assignment is EnhancedAssignment {
    return assignment.gameboard != undefined;
}
export function getAssignmentCSVDownloadLink(assignmentId: number) {
    return `${API_PATH}/assignments/assign/${assignmentId}/progress/download`;
}

function createAssignmentWithStartDate(assignment: AssignmentDTO): AssignmentDTO & {startDate: Date | number} {
    const assignmentStartDate = assignment.scheduledStartDate ?? assignment.creationDate as Date;
    return {...assignment, startDate: assignmentStartDate};
}

const now = new Date();
const midnightLastNight = new Date(now);
midnightLastNight.setHours(0, 0, 0, 0);

type AssignmentStatus = "inProgressRecent" | "inProgressOld" | "allAttempted" | "allCorrect";
export const filterAssignmentsByStatus = (assignments: AssignmentDTO[] | undefined | null) => {
    const fourWeeksAgo = new Date(now.valueOf() - (4 * 7 * 24 * 60 * 60 * 1000));

    const myAssignments: Record<AssignmentStatus, (AssignmentDTO & {startDate: Date | number})[]> = {
        inProgressRecent: [],
        inProgressOld: [],
        allAttempted: [],
        allCorrect: []
    };

    if (assignments) {
        assignments
            .map(createAssignmentWithStartDate)
            .forEach(assignment => {
                if (assignment.gameboard?.percentageCorrect !== 100) {
                    const noDueDateButRecent = !assignment.dueDate && (assignment.startDate > fourWeeksAgo);
                    const beforeDueDate = assignment.dueDate && (assignment.dueDate >= midnightLastNight);
                    if (beforeDueDate || noDueDateButRecent) {
                        myAssignments.inProgressRecent.push(assignment);
                    } else if (assignment.gameboard?.percentageAttempted === 100) {
                        myAssignments.allAttempted.push(assignment);
                    } else {
                        myAssignments.inProgressOld.push(assignment);
                    }
                } else {
                    myAssignments.allCorrect.push(assignment);
                }
            });
        myAssignments.inProgressRecent = orderBy(myAssignments.inProgressRecent, ["dueDate", "startDate"], ["asc", "desc"]);
        myAssignments.inProgressOld = orderBy(myAssignments.inProgressOld, ["startDate"], ["desc"]);
        myAssignments.allAttempted = orderBy(myAssignments.allAttempted, ["startDate"], ["desc"]);
        myAssignments.allCorrect = orderBy(myAssignments.allCorrect, ["startDate"], ["desc"]);
    }

    return myAssignments;
};

export const filterAssignmentsByProperties = (assignments: AssignmentDTO[], assignmentTitleFilter: string,
    assignmentGroupFilter: string,
    assignmentSetByFilter: string
): AssignmentDTO[] => {
    const filteredAssignments: AssignmentDTO[] = [];

    if (assignments) {
        assignments.forEach(assignment => {

            const assignmentMatchesFilter =
                matchesAllWordsInAnyOrder(assignment.gameboard?.title, assignmentTitleFilter)
                && (assignmentGroupFilter === "All" || assignment.groupName === assignmentGroupFilter)
                && (assignmentSetByFilter === "All" || extractTeacherName(assignment.assignerSummary) === assignmentSetByFilter);

            if (assignmentMatchesFilter){
                filteredAssignments.push(assignment);
            }
        });
    }
    return filteredAssignments;
};

export const getDistinctAssignmentGroups = (assignments: AssignmentDTO[] | undefined | null): Set<string> => {
    const distinctAssignmentGroups = new Set<string>();

    if (assignments) {
        assignments.forEach(assignment => {
            assignment?.groupName && distinctAssignmentGroups.add(assignment.groupName);
        });
    }
    return distinctAssignmentGroups;
};

export const getDistinctAssignmentSetters = (assignments: AssignmentDTO[] | undefined | null): Set<string> => {
    const distinctFormattedAssignmentSetters = new Set<string>();

    if (assignments) {
        assignments.forEach(assignment => {
            assignment?.assignerSummary && distinctFormattedAssignmentSetters.add(extractTeacherName(assignment.assignerSummary) as string);
        });
    }
    return distinctFormattedAssignmentSetters;
};

export const sortUpcomingAssignments = (assignments: IAssignmentLike[]): IAssignmentLike[] => {
    // Prioritise non-overdue assignments, then sort by due date (soonest first), then start date
    return orderBy(assignments, [
        (a) => isOverdue(a),
        (a) => a.dueDate,
        (a) => a.scheduledStartDate ?? a.creationDate
    ], ["asc", "asc", "asc"]);
};

export function isAssignment(assignment: IAssignmentLike): assignment is AssignmentDTO {
    return (assignment as AssignmentDTO).gameboardId !== undefined;
}

export const getAssignmentStartDate = (a: AssignmentDTO): number => (a.scheduledStartDate ?? a.creationDate ?? 0).valueOf();

export const hasAssignmentStarted = (a: AssignmentDTO): boolean => getAssignmentStartDate(a) <= Date.now();

export const isOverdue = (a: IAssignmentLike) =>  a.dueDate && a.dueDate < midnightLastNight;