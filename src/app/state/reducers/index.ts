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
    totpChallengePending,
    totpSharedSecret,
    user,
    userAuthSettings,
    userPreferences,
    userSchoolLookup
} from "./userState";
import {error, mainContentId, printingSettings, transientUserContext} from "./internalAppState";
import {constants, glossaryTerms, news} from "./staticState";
import {concepts, doc, fragments} from "./contentState";
import {graphSketcherSpec, questions} from "./questionState";
import {activeModals, notifications, toasts} from "./notifiersState";
import {myAnsweredQuestionsByDate, myProgress, userAnsweredQuestionsByDate, userProgress} from "./progressState";
import {
    adminContentErrors,
    adminEmailTemplate,
    adminStats,
    adminUserGet,
    adminUserSearch,
    contentVersion,
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
    quizzes,
} from "./quizState";

const appReducer = combineReducers({
    // User
    user,
    userAuthSettings,
    userPreferences,
    userSchoolLookup,
    totpSharedSecret,
    totpChallengePending,

    // Internal App
    printingSettings,
    mainContentId,
    transientUserContext,
    error,

    // Notifiers
    toasts,
    activeModals,
    notifications,

    // Static Content
    constants,
    news,
    glossaryTerms,

    // Content
    doc,
    fragments,
    concepts,

    // Question
    questions,
    graphSketcherSpec,

    // Progress
    myProgress,
    myAnsweredQuestionsByDate,
    userProgress,
    userAnsweredQuestionsByDate,

    // Admin
    adminUserGet,
    adminUserSearch,
    adminContentErrors,
    adminStats,
    adminEmailTemplate,
    contentVersion,
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
    quizAssignment,
    quizPreview,
    quizAttemptedFreelyByMe,
});

export type AppState = ReturnType<typeof appReducer> | undefined;

export const rootReducer = (state: AppState, action: Action) => {
    if (action.type === ACTION_TYPE.USER_LOG_OUT_RESPONSE_SUCCESS || action.type === ACTION_TYPE.USER_LOG_OUT_EVERYWHERE_RESPONSE_SUCCESS || action.type === ACTION_TYPE.USER_CONSISTENCY_ERROR) {
        state = undefined;
    }
    return appReducer(state, action);
};
