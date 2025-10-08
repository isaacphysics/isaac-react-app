import {AssignmentDTO, IAssignmentLike} from "../../IsaacApiTypes";
import orderBy from "lodash/orderBy";
import {EnhancedAssignment} from "../../IsaacAppTypes";
import {extractTeacherName, matchesAllWordsInAnyOrder} from "./";
import { AssignmentState } from "../components/pages/MyAssignments";

export function hasGameboard(assignment: AssignmentDTO): assignment is EnhancedAssignment {
    return assignment.gameboard != undefined;
}

function createAssignmentWithStartDate(assignment: AssignmentDTO): AssignmentDTO & {startDate: Date | number} {
    const assignmentStartDate = assignment.scheduledStartDate ?? assignment.creationDate as Date;
    return {...assignment, startDate: assignmentStartDate};
}

const now = new Date();
const midnightLastNight = new Date(now);
midnightLastNight.setHours(0, 0, 0, 0);

export const ASSIGNMENT_STATE_MAP: {[key in AssignmentState]: string} = {
    [AssignmentState.ALL]: "all", // Just for typing, not used
    [AssignmentState.TODO]: "inProgress",
    [AssignmentState.OVERDUE]: "overDue",
    [AssignmentState.ALL_ATTEMPTED]: "allAttempted",
    [AssignmentState.ALL_CORRECT]: "allCorrect",
};

type AssignmentStatus = "overDue" | "inProgress" | "allAttempted" | "allCorrect";
export const filterAssignmentsByStatus = (assignments: AssignmentDTO[] | undefined | null) => {
    const myAssignments: Record<AssignmentStatus, (AssignmentDTO & {startDate: Date | number})[]> = {
        overDue: [],
        inProgress: [],
        allAttempted: [],
        allCorrect: []
    };

    if (assignments) {
        assignments
            .map(createAssignmentWithStartDate)
            .forEach(assignment => {
                if (assignment.gameboard?.percentageCorrect !== 100) {
                    if (assignment.dueDate && (assignment.dueDate >= midnightLastNight)) {
                        myAssignments.inProgress.push(assignment);
                    } else if (assignment.gameboard?.percentageAttempted === 100) {
                        myAssignments.allAttempted.push(assignment);
                    } else {
                        myAssignments.overDue.push(assignment);
                    }
                } else {
                    myAssignments.allCorrect.push(assignment);
                }
            });
        myAssignments.inProgress = orderBy(myAssignments.inProgress, ["dueDate", "startDate"], ["asc", "desc"]);
        myAssignments.overDue = orderBy(myAssignments.overDue, ["startDate"], ["desc"]);
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
