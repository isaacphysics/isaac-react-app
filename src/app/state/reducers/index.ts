import {combineReducers} from "redux";
import {
    eventMapData,
    eventOverviews,
    events,
    totpChallengePending,
    userAuthSettings,
    userPreferences,
    errorSlice,
    mainContentIdSlice,
    printingSettingsSlice,
    transientUserContextSlice,
    glossaryTerms,
    concepts,
    doc,
    questions,
    activeModals,
    notifications,
    toasts,
    myAnsweredQuestionsByDate,
    myProgress,
    userAnsweredQuestionsByDate,
    userProgress,
    testQuestions,
    quizAssignedToMe,
    quizAssignment,
    quizAssignments,
    quizAttempt,
    quizAttemptedFreelyByMe,
    quizPreview,
    quizzes,
    studentQuizAttempt,
    activeAuthorisations,
    groupMemberships,
    otherUserAuthorisations,
    currentTopic,
    fasttrackConcepts,
    questionSearchResult,
    search,
    isaacApi,
    gameboardsSlice,
    adminUserSearchSlice,
    userSlice
} from "../index";

export const rootReducer = combineReducers({
    // User
    user: userSlice.reducer,
    userAuthSettings,
    userPreferences,
    totpChallengePending,

    // Internal App
    printingSettings: printingSettingsSlice.reducer,
    mainContentId: mainContentIdSlice.reducer,
    transientUserContext: transientUserContextSlice.reducer,
    error: errorSlice.reducer,

    // Notifiers
    toasts,
    activeModals,
    notifications,

    // Static Content
    glossaryTerms,

    // Content
    doc,
    concepts,

    // Question
    questions,

    // Progress
    myProgress,
    myAnsweredQuestionsByDate,
    userProgress,
    userAnsweredQuestionsByDate,

    // Admin
    adminUserSeach: adminUserSearchSlice.reducer,
    testQuestions,

    // Groups
    groupMemberships,
    activeAuthorisations,
    otherUserAuthorisations,

    // Topics
    currentTopic,

    // Gameboards
    boards: gameboardsSlice.reducer,
    questionSearchResult,
    fasttrackConcepts,

    // Search
    search,

    // Events
    events,
    eventOverviews,
    eventMapData,

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

export type AppState = ReturnType<typeof rootReducer> | undefined;
