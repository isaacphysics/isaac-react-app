import {Dispatch, Middleware, MiddlewareAPI} from "redux";

export const signUpPromptMiddleware: Middleware = (middlewareApi: MiddlewareAPI) => (dispatch: Dispatch) => async action => {
    return await dispatch(action);
};
