import {combineReducers} from "redux";
import {
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
    myAnsweredQuestionsIds,
    testQuestions,
    quizAttempt,
    groupMemberships,
    currentTopic,
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
    myAnsweredQuestionsIds,

    // Admin
    adminUserSeach: adminUserSearchSlice.reducer,
    testQuestions,

    // Groups
    groupMemberships,

    // Topics
    currentTopic,

    // Gameboards
    boards: gameboardsSlice.reducer,
    questionSearchResult,

    // Search
    search,

    // Quizzes
    quizAttempt,

    // API reducer
    [isaacApi.reducerPath]: isaacApi.reducer
});

export type AppState = ReturnType<typeof rootReducer> | undefined;
