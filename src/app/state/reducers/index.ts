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
    docSlice,
    questions,
    activeModals,
    notifications,
    toasts,
    myAnsweredQuestionsByDate,
    myProgress,
    userAnsweredQuestionsByDate,
    userProgress,
    testQuestions,
    quizAttempt,
    groupMemberships,
    currentTopic,
    questionSearchResult,
    search,
    isaacApi,
    gameboardsSlice,
    adminUserSearchSlice,
    userSlice,
    interstitialCookieSlice,
    pageContextSlice,
    linkableSettingSlice,
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

    // Cookies
    cookieConsent: interstitialCookieSlice.reducer,

    // Static Content
    glossaryTerms,

    // Content
    page: docSlice.reducer,
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

    // Topics
    currentTopic,

    // Gameboards
    boards: gameboardsSlice.reducer,
    questionSearchResult,
    
    // Search
    search,

    // Quizzes
    quizAttempt,

    // Context
    pageContext: pageContextSlice.reducer,

    // Linkable settings
    linkableSetting: linkableSettingSlice.reducer,

    // API reducer
    [isaacApi.reducerPath]: isaacApi.reducer
});

export type AppState = ReturnType<typeof rootReducer> | undefined;
