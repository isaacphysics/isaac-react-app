import {combineReducers} from "redux";
import {
    currentEvent,
    eventBookings,
    eventBookingsForAllGroups,
    eventBookingsForGroup,
    eventMapData,
    eventOverviews,
    events,
    totpChallengePending,
    user,
    userAuthSettings,
    userPreferences,
    userSchoolLookup,
    errorSlice,
    mainContentIdSlice,
    printingSettingsSlice,
    transientUserContextSlice,
    glossaryTerms,
    concepts,
    doc,
    graphSketcherSpec,
    questions,
    activeModals,
    notifications,
    toasts,
    myAnsweredQuestionsByDate,
    myProgress,
    userAnsweredQuestionsByDate,
    userProgress,
    adminEmailTemplate,
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
    adminUserSearchSlice
} from "../index";

export const rootReducer = combineReducers({
    // User
    user,
    userAuthSettings,
    userPreferences,
    userSchoolLookup,
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
    graphSketcherSpec,

    // Progress
    myProgress,
    myAnsweredQuestionsByDate,
    userProgress,
    userAnsweredQuestionsByDate,

    // Admin
    adminUserSeach: adminUserSearchSlice.reducer,
    adminEmailTemplate,
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

export type AppState = ReturnType<typeof rootReducer> | undefined;
