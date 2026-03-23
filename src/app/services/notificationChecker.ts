import {RegisteredUserDTO} from "../../IsaacApiTypes";
import { useGetMyAssignmentsQuery, useGetQuizAssignmentsAssignedToMeQuery } from "../state";
import {getAllSortedWorkToDo, isAssignment, isQuiz, KEY, PATHS, persistence} from "./";
import {Immutable} from "immer";

export function canShowPopupNotification(user: Immutable<RegisteredUserDTO> | null): boolean {
    const dateNow = new Date();
    const notificationTime = persistence.load(KEY.LAST_NOTIFICATION_TIME);
    if (user && user.registrationDate && (dateNow.getTime() - new Date(user.registrationDate).getTime()) > 14*24*60*60*1000) {
        if (dateNow.getTime() - (new Date(notificationTime || "0").getTime()) > 24*60*60*1000) {
            return true;
        }
    }
    return false;
}

export interface UserNotification {
    id: string | number;
    title: string;
    message: string;
    button: {
        text: string;
        link: string;
    }
}

interface UserNotificationsResult {
    notifications: UserNotification[];
    counts: {
        assignments: number;
        tests: number;
        total: number;
    }
}

export const useUserNotifications = () : UserNotificationsResult => {

    // TODO: discuss additional notifications with Ada – assignment deadlines, group changes etc

    // const [getAssignmentsSetByMe, {data: assignmentsSetByMe}] = useLazyGetMySetAssignmentsQuery();
    // const [getQuizzesSetByMe, {data: quizzesSetByMe}] = useLazyGetQuizAssignmentsSetByMeQuery();
    // const [getGroups, {data: groups}] = useLazyGetGroupsQuery();

    const {data: myAssignments} = useGetMyAssignmentsQuery();
    const {data: myQuizAssignments} = useGetQuizAssignmentsAssignedToMeQuery();

    const {all: toDo, assignmentsCount, quizzesCount} = getAllSortedWorkToDo(myAssignments, myQuizAssignments, 8);

    const workToDoNotifications = toDo.map((assignmentLike, i) => isAssignment(assignmentLike)
        ? {
            id: assignmentLike.id ?? `assignment-${i}`,
            title: `Assignment to do: ${assignmentLike.gameboard?.title}`,
            message: `Due on ${new Date(assignmentLike.dueDate ?? 0).toLocaleDateString()}`,
            button: {
                text: "Go to assignment",
                link: `${PATHS.GAMEBOARD}#${assignmentLike.gameboardId}`
            }
        } 
        : isQuiz(assignmentLike)
            ? {
                id: assignmentLike.id ?? `quiz-${i}`,
                title: `Test to do: ${assignmentLike.quizSummary?.title}`,
                message: `Due on ${new Date(assignmentLike.dueDate ?? 0).toLocaleDateString()}`,
                button: {
                    text: "Go to test",
                    link: `${PATHS.TEST}/${assignmentLike.id}`
                }
            } 
            : undefined
    ).filter((n): n is UserNotification => !!n);

    return {
        notifications: [
            ...workToDoNotifications,
        ],
        counts: {
            assignments: assignmentsCount,
            tests: quizzesCount,
            total: assignmentsCount + quizzesCount,
        }
    };
};
