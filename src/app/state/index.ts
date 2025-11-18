// This file defines the load order for all modules within the state subdirectory. EVERYTHING from this
// subdirectory should be imported and exported from here. If we stick to this, fixing circular dependency
// issues just becomes a matter of reordering the exports below until things are defined in the correct order.
// For example "./reducers/eventsState" is imported AFTER "./actions/routing", because it needs the
// `routerPageChange` action creator.
//
// See https://medium.com/visual-development/how-to-fix-nasty-circular-dependency-issues-once-and-for-all-in-javascript-typescript-a04c987cf0de
// for a more detailed explanation of the process.
export * from "./actions/routing";
export * from "./slices/api/utils";
export * from "./middleware/utils";
export * from "./slices/internalAppState";
export * from "./slices/cookies";
export * from "./slices/context";
export * from "./slices/doc";
export * from "./slices/linkableSetting";
export * from "./actions/logging";
export * from "./reducers/staticState";
export * from "./middleware/userConsistencyCheckerCurrentUser";
export * from "./middleware/hidePreviousQuestionAttempt";
export * from "./reducers/quizState";
export * from "./reducers/questionState";
export * from "./reducers/notifiersState";
export * from "./reducers/groupsState";
export * from "./reducers/progressState";
export * from "./reducers/adminState";

// Where the base isaacApi is defined
export * from "./slices/api/baseApi";

// Below here, isaacApi can be enhanced with new endpoints and tags
export * from "./slices/api/segueInfoApi";
export * from "./slices/api/adminApi";
export * from "./slices/api/userApi";
export * from "./slices/api/authorisationsApi";
export * from "./slices/api/accountApi";
export * from "./slices/api/gameboardApi";
export * from "./slices/api/assignmentsApi";
export * from "./slices/api/contentApi";
export * from "./slices/api/groupsApi";
export * from "./slices/api/emailApi";
export * from "./slices/api/eventsApi";
export * from "./slices/api/questionsApi";
export * from "./slices/api/quizApi";
export * from "./slices/api/miscApi";
export * from "./slices/api/topicsApi";
export * from "./slices/api/searchApi";
export * from "./slices/gameboards";
export * from "./reducers/userState";
export * from "./actions/popups";
export * from "./actions/groups";
export * from "./actions/quizzes";
export * from "./middleware/notificationManager";
export * from "./middleware/userConsistencyChecker";
export * from "./slices/api/gameboards";
export * from "./slices/api/assignments";
export * from "./slices/admin";
export * from "./slices/user";
export * from "./slices/topic";
export * from "./actions";
export * from "./selectors";
export * from "./reducers";
export * from "./store";
