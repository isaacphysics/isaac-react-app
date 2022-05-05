import {combineReducers} from "redux";
import {Action} from "../../../IsaacAppTypes";
import {ACTION_TYPE} from "../../services/constants";
import {
    currentEvent,
    eventBookings,
    eventBookingsForAllGroups,
    eventBookingsForGroup,
    eventMapData,
    eventOverviews,
    events
} from "./eventsState";
import {
    userSchoolLookup
} from "./userState";
import {error, mainContentId, printingSettings, transientUserContext} from "./internalAppState";
import {news} from "./staticState";
import {concepts, doc, fragments} from "./contentState";
import {graphSketcherSpec, questions} from "./questionState";
import {activeModals, toasts} from "./notifiersState";
import {myAnsweredQuestionsByDate, userAnsweredQuestionsByDate} from "./progressState";
import {
    adminContentErrors,
    adminEmailTemplate,
    adminStats,
    adminUserGet,
    adminUserSearch,
    testQuestions
} from "./adminState";
import {activeAuthorisations, groupMemberships, groups, otherUserAuthorisations} from "./groupsState";
import {currentTopic} from "./topicState";
import {boards, currentGameboard, fasttrackConcepts, gameboardEditorQuestions, wildcards} from "./gameboardsState";
import {search} from "./searchState";
import {assignments, assignmentsByMe, groupProgress, progress} from "./assignmentsState";
import {
    quizAssignedToMe,
    quizAssignment,
    quizAssignments,
    quizAttempt,
    quizAttemptedFreelyByMe,
    quizPreview,
    quizzes, studentQuizAttempt,
} from "./quizState";
import {isaacApi} from "../slices/api";
import {authSlice, totpSharedSecretSlice, totpChallenge} from "../slices/user";
import {isAnyOf} from "@reduxjs/toolkit";
import {authApi} from "../slices/api/auth";

const appReducer = combineReducers({
    // User
    user: authSlice.reducer,
    userSchoolLookup,
    totpSharedSecret: totpSharedSecretSlice.reducer,
    totpChallengePending: totpChallenge.reducer,

    // Internal App
    printingSettings,
    mainContentId,
    transientUserContext,
    error,

    // Notifiers
    toasts,
    activeModals,

    // Static Content
    news,

    // Content
    doc,
    fragments,
    concepts,

    // Question
    questions,
    graphSketcherSpec,

    // Progress
    myAnsweredQuestionsByDate,
    userAnsweredQuestionsByDate,

    // Admin
    adminUserGet,
    adminUserSearch,
    adminContentErrors,
    adminStats,
    adminEmailTemplate,
    testQuestions,

    // Groups
    groups,
    groupMemberships,
    activeAuthorisations,
    otherUserAuthorisations,

    // Topics
    currentTopic,

    // Gameboards
    boards,
    currentGameboard,
    wildcards,
    gameboardEditorQuestions,
    fasttrackConcepts,

    // Assignments
    assignments,
    assignmentsByMe,
    progress,
    groupProgress,

    // Search
    search,

    // Events
    events,
    currentEvent,
    eventOverviews,
    eventMapData,
    eventBookings,
    eventBookingsForGroup,
    eventBookingsForAllGroups,

    // Quizzes
    quizzes,
    quizAssignments,
    quizAssignedToMe,
    quizAttempt,
    studentQuizAttempt,
    quizAssignment,
    quizPreview,
    quizAttemptedFreelyByMe,

    // API reducer
    [isaacApi.reducerPath]: isaacApi.reducer
});

export type AppState = ReturnType<typeof appReducer> | undefined;

export const rootReducer = (state: AppState, action: Action) => {
    if (isAnyOf(authApi.endpoints.logout.matchFulfilled, authApi.endpoints.logoutEverywhere.matchFulfilled)(action) || action.type === ACTION_TYPE.USER_CONSISTENCY_ERROR) {
        state = undefined;
    }
    return appReducer(state, action);
};
