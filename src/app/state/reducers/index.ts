import { AnyAction, combineReducers } from "redux";
import { ACTION_TYPE } from "../../services";
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
  constants,
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
  adminContentErrors,
  adminEmailTemplate,
  adminStats,
  adminUserGet,
  adminUserSearch,
  contentVersion,
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
  randomQuestions,
} from "../index";

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
  glossaryTerms,

  // Content
  doc,
  concepts,

  // Question
  questions,
  randomQuestions,

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
  [isaacApi.reducerPath]: isaacApi.reducer,
});

export type AppState = ReturnType<typeof appReducer> | undefined;

export const rootReducer = (state: AppState, action: AnyAction) => {
  if (action.type === ACTION_TYPE.USER_LOG_OUT_RESPONSE_SUCCESS || action.type === ACTION_TYPE.USER_CONSISTENCY_ERROR) {
    isaacApi.util.resetApiState();
    return appReducer(undefined, action);
  }
  return appReducer(state, action);
};
