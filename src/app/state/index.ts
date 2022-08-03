// This file defines the load order for all modules within the state subdirectory. EVERYTHING from this
// subdirectory should be imported and exported from here. If we stick to this, fixing circular dependency
// issues just becomes a matter of reordering the exports below until things are defined in the correct order.
// For example "./reducers/eventsState" is imported AFTER "./actions/routing", because it needs the
// `routerPageChange` action creator.
//
// See https://medium.com/visual-development/how-to-fix-nasty-circular-dependency-issues-once-and-for-all-in-javascript-typescript-a04c987cf0de
// for a more detailed explanation of the process.
export * from "./actions/routing";
export * from "./reducers/eventsState";
export * from "./reducers/topicState";
export * from "./reducers/contentState";
export * from "./slices/internalAppState";
export * from "./actions/logging";
export * from "./reducers/staticState";
export * from "./reducers/searchState";
export * from "./middleware/userConsistencyCheckerCurrentUser";
export * from "./reducers/quizState";
export * from "./reducers/questionState";
export * from "./reducers/notifiersState";
export * from "./reducers/groupsState";
export * from "./reducers/gameboardsState";
export * from "./reducers/progressState";
export * from "./reducers/adminState";
export * from "./slices/api";
export * from "./slices/gameboards";
export * from "./reducers/userState";
export * from "./actions/popups";
export * from "./actions/quizzes";
export * from "./middleware/notificationManager";
export * from "./middleware/userConsistencyChecker";
export * from "./slices/api/gameboards";
export * from "./slices/api/assignments";
export * from "./actions";
export * from "./selectors";
export * from "./reducers";
export * from "./store";
