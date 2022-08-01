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
    user,
    userAuthSettings,
    userPreferences,
    userSchoolLookup
} from "./userState";
import {
    errorSlice,
    mainContentIdSlice,
    printingSettingsSlice,
    transientUserContextSlice
} from "../slices/internalAppState";
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
import {fasttrackConcepts, questionSearchResult} from "./gameboardsState";
import {search} from "./searchState";
import {
    quizAssignedToMe,
    quizAssignment,
    quizAssignments,
    quizAttempt,
    quizAttemptedFreelyByMe,
    quizPreview,
    quizzes,
    studentQuizAttempt,
} from "./quizState";
import {isaacApi} from "../slices/api";
import {currentGameboardSlice, gameboardsSlice} from "../slices/gameboards";

const appReducer = combineReducers({
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
    boards: gameboardsSlice.reducer,
    currentGameboard: currentGameboardSlice.reducer,
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

export type AppState = ReturnType<typeof appReducer> | undefined;

export const rootReducer = (state: AppState, action: Action) => {
    if (action.type === ACTION_TYPE.USER_LOG_OUT_RESPONSE_SUCCESS || action.type === ACTION_TYPE.USER_LOG_OUT_EVERYWHERE_RESPONSE_SUCCESS || action.type === ACTION_TYPE.USER_CONSISTENCY_ERROR) {
        return appReducer(undefined, action);
    }
    return appReducer(state, action);
};
