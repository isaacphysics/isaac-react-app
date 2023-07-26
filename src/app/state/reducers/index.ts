import {combineReducers} from "redux";
import {
    errorSlice,
    mainContentIdSlice,
    printingSettingsSlice,
    transientUserContextSlice,
    questions,
    activeModals,
    notifications,
    toasts,
    testQuestions,
    quizAttempt,
    groupMemberships,
    isaacApi,
    gameboardsSlice,
    adminUserSearchSlice,
    userSlice
} from "../index";

export const rootReducer = combineReducers({
    // User
    user: userSlice.reducer,

    // Internal App
    printingSettings: printingSettingsSlice.reducer,
    mainContentId: mainContentIdSlice.reducer,
    transientUserContext: transientUserContextSlice.reducer,
    error: errorSlice.reducer,

    // Notifiers
    toasts,
    activeModals,
    notifications,

    // Question
    questions,

    // Admin
    adminUserSeach: adminUserSearchSlice.reducer,
    testQuestions,

    // Groups
    groupMemberships,

    // Gameboards
    boards: gameboardsSlice.reducer,

    // Quizzes
    quizAttempt,

    // API reducer
    [isaacApi.reducerPath]: isaacApi.reducer
});

export type AppState = ReturnType<typeof rootReducer> | undefined;
