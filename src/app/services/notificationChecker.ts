import { skipToken } from "@reduxjs/toolkit/query";
import {RegisteredUserDTO} from "../../IsaacApiTypes";
import { selectors, useAppSelector, useGetMyAssignmentsQuery, useGetQuizAssignmentsAssignedToMeQuery } from "../state";
import {getAllSortedWorkToDo, isAssignment, isQuiz, isTeacherPending, KEY, PATHS, persistence} from "./";
import {Immutable} from "immer";
import { useTranslation } from "react-i18next";

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
    workCounts: {
        assignments: number;
        tests: number;
        total: number;
    }
}

export const useUserNotifications = () : UserNotificationsResult => {
    const { t } = useTranslation();
    const user = useAppSelector(selectors.user.orNull);
    const queryArg = user?.loggedIn && !isTeacherPending(user) ? undefined : skipToken;
    
    const {data: myAssignments} = useGetMyAssignmentsQuery(queryArg, {refetchOnMountOrArgChange: true, refetchOnReconnect: true});
    const {data: myQuizAssignments} = useGetQuizAssignmentsAssignedToMeQuery(queryArg, {refetchOnMountOrArgChange: true, refetchOnReconnect: true});
    
    // TODO: discuss additional notifications with Ada – assignment deadlines, group changes etc
    // const [getAssignmentsSetByMe, {data: assignmentsSetByMe}] = useLazyGetMySetAssignmentsQuery();
    // const [getQuizzesSetByMe, {data: quizzesSetByMe}] = useLazyGetQuizAssignmentsSetByMeQuery();
    // const [getGroups, {data: groups}] = useLazyGetGroupsQuery();

    const {all: toDo, assignmentsCount, quizzesCount} = getAllSortedWorkToDo(myAssignments, myQuizAssignments, 8);

    const workToDoNotifications = toDo.map((assignmentLike, i) => isAssignment(assignmentLike)
        ? {
            id: assignmentLike.id ?? `assignment-${i}`,
            title: t("common:notifications.assignmentTitle", { gameboardTitle: assignmentLike.gameboard?.title }),
            message: t("common:notifications.dueDateMessage", { dueDate: new Date(assignmentLike.dueDate ?? 0).toLocaleDateString() }),
            button: {
                text: t("common:notifications.goToAssignmentButton"),
                link: `${PATHS.GAMEBOARD}#${assignmentLike.gameboardId}`
            }
        } 
        : isQuiz(assignmentLike)
            ? {
                id: assignmentLike.id ?? `quiz-${i}`,
                title: t("common:notifications.testTitle", { quizTitle: assignmentLike.quizSummary?.title }),
                message: t("common:notifications.dueDateMessage", { dueDate: new Date(assignmentLike.dueDate ?? 0).toLocaleDateString() }),
                button: {
                    text: t("common:notifications.goToTestButton"),
                    link: `${PATHS.TEST}/${assignmentLike.id}`
                }
            } 
            : undefined
    ).filter((n): n is UserNotification => !!n);

    return {
        notifications: [
            ...workToDoNotifications,
        ],
        workCounts: {
            assignments: assignmentsCount,
            tests: quizzesCount,
            total: assignmentsCount + quizzesCount,
        }
    };
};
