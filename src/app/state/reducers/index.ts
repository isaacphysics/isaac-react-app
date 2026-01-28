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
    isaacApi,
    gameboardsSlice,
    adminUserSearchSlice,
    userSlice,
    cookieConsentSlice,
    pageContextSlice,
    topicSlice,
    linkableSettingSlice,
    sidebarSlice,
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
    cookieConsent: cookieConsentSlice.reducer,

    // Static Content
    glossaryTerms,

    // Content
    page: docSlice.reducer,
    sidebar: sidebarSlice.reducer,

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
    currentTopic: topicSlice.reducer,

    // Gameboards
    boards: gameboardsSlice.reducer,

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
