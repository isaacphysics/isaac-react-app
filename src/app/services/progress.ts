import {useState} from "react";
import {isTeacherOrAbove} from "./user";
import {
    AssignmentOrderSpec,
    AssignmentOrderType,
    AssignmentProgressPageSettings,
    AuthorisedAssignmentProgress
} from "../../IsaacAppTypes";
import {API_PATH, SortOrder} from "./constants";
import {AssignmentProgressDTO, RegisteredUserDTO} from "../../IsaacApiTypes";

// TODO: move to app types without creating circular deps
export enum GroupSortOrder {
    Alphabetical = "Alphabetical",
    DateCreated = "Date Created"
}

export const AssignmentOrder = {
    titleAscending: {type: AssignmentOrderType.Title, order: SortOrder.ASC},
    titleDescending: {type: AssignmentOrderType.Title, order: SortOrder.DESC},
    startDateAscending: {type: AssignmentOrderType.StartDate, order: SortOrder.ASC},
    startDateDescending: {type: AssignmentOrderType.StartDate, order: SortOrder.DESC},
    dueDateAscending: {type: AssignmentOrderType.DueDate, order: SortOrder.ASC},
    dueDateDescending: {type: AssignmentOrderType.DueDate, order: SortOrder.DESC},
};

export function useAssignmentProgressAccessibilitySettings({user}: {user: RegisteredUserDTO}): AssignmentProgressPageSettings {
    const [colourBlind, setColourBlind] = useState(false);
    const [formatAsPercentage, setFormatAsPercentage] = useState(false);
    const [attemptedOrCorrect, setAttemptedOrCorrect] = useState<"ATTEMPTED" | "CORRECT">("CORRECT");
    const [assignmentOrder, setAssignmentOrder] = useState<AssignmentOrderSpec>(AssignmentOrder.startDateDescending);
    const [groupSortOrder, setGroupSortOrder] = useState<GroupSortOrder>(GroupSortOrder.Alphabetical);

    return {
        colourBlind, setColourBlind,
        formatAsPercentage, setFormatAsPercentage,
        attemptedOrCorrect, setAttemptedOrCorrect,
        assignmentOrder, setAssignmentOrder,
        groupSortOrder, setGroupSortOrder,
        isTeacher: isTeacherOrAbove(user),
    } as AssignmentProgressPageSettings;
}

export function isAuthorisedFullAccess(progress: AssignmentProgressDTO): progress is AuthorisedAssignmentProgress {
    return !!progress.user?.authorisedFullAccess;
}

export function getAssignmentProgressCSVDownloadLink(assignmentId: number) {
    return `${API_PATH}/assignments/assign/${assignmentId}/progress/download`;
}

export function getQuizAssignmentCSVDownloadLink(assignmentId: number) {
    return `${API_PATH}/quiz/assignment/${assignmentId}/download`;
}

export function getGroupAssignmentProgressCSVDownloadLink(groupId: number) {
    return API_PATH + "/assignments/assign/group/" + groupId + "/progress/download";
}

export function getGroupQuizProgressCSVDownloadLink(groupId: number) {
    return API_PATH + "/quiz/group/" + groupId + "/download";
}
