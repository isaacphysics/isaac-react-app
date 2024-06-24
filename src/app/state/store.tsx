import { Middleware } from "redux";
import reduxLogger from "redux-logger";
import {
  AppState,
  isaacApi,
  rootReducer,
  userConsistencyCheckerMiddleware,
  notificationCheckerMiddleware,
  hidePreviousQuestionAttemptMiddleware,
} from "./";
import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";

export const middleware: Middleware[] = [
  isaacApi.middleware,
  hidePreviousQuestionAttemptMiddleware,
  userConsistencyCheckerMiddleware,
  notificationCheckerMiddleware,
];
export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => {
    const newMiddleware = getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: process.env.NODE_ENV !== "test",
    }).concat(middleware);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (process.env.NODE_ENV !== "production" && !window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) {
      newMiddleware.concat([reduxLogger]);
    }

    return newMiddleware;
  },
  preloadedState: {},
  devTools: process.env.NODE_ENV !== "production",
});

export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector;
