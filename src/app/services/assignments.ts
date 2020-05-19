import {AssignmentDTO} from "../../IsaacApiTypes";
import {orderBy} from "lodash";
import {SingleEnhancedAssignment} from "../../IsaacAppTypes";
import {API_PATH} from "./constants";

function notMissing<T>(item: T | undefined): T {
    if (item === undefined) throw new Error("Missing item");
    return item;
}
export function hasGameboard(assignment: AssignmentDTO): assignment is SingleEnhancedAssignment {
    return assignment.gameboard != undefined;
}
export function getCSVDownloadLink(assignmentId: number) {
    return `${API_PATH}/assignments/assign/${assignmentId}/progress/download`;
}
export const filterAssignmentsByStatus = (assignments: AssignmentDTO[] | null) => {
    const now = new Date();
    const fourWeeksAgo = new Date(now.valueOf() - (4 * 7 * 24 * 60 * 60 * 1000));
    // Midnight five days ago:
    const fiveDaysAgo = new Date(now);
    fiveDaysAgo.setDate(now.getDate() - 5);
    fiveDaysAgo.setHours(0, 0, 0, 0);

    const myAssignments: {inProgressRecent: AssignmentDTO[]; inProgressOld: AssignmentDTO[]; completed: AssignmentDTO[]} = {
        inProgressRecent: [],
        inProgressOld: [],
        completed: []
    };

    if (assignments) {
        assignments.forEach(assignment => {
            assignment.gameboard = notMissing(assignment.gameboard);
            assignment.creationDate = notMissing(assignment.creationDate);
            if (assignment.gameboard.percentageCompleted === undefined || assignment.gameboard.percentageCompleted < 100) {
                let noDueDateButRecent = !assignment.dueDate && (assignment.creationDate > fourWeeksAgo);
                let dueDateAndCurrent = assignment.dueDate && (assignment.dueDate >= fiveDaysAgo);
                if (noDueDateButRecent || dueDateAndCurrent) {
                    // Assignment either not/only just overdue, or else set within last month but no due date.
                    myAssignments.inProgressRecent.push(assignment);
                } else {
                    myAssignments.inProgressOld.push(assignment);
                }
            } else {
                myAssignments.completed.push(assignment);
            }
        });
        myAssignments.inProgressRecent = orderBy(myAssignments.inProgressRecent, ["dueDate", "creationDate"], ["asc", "desc"]);
        myAssignments.inProgressOld = orderBy(myAssignments.inProgressOld, ["dueDate", "creationDate"], ["asc", "desc"]);
        myAssignments.completed = orderBy(myAssignments.completed, ["creationDate"], ["desc"]);
    }

    return myAssignments;
};
