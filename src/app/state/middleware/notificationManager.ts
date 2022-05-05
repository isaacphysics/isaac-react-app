import {Dispatch, Middleware, MiddlewareAPI} from "redux";
import {ACTION_TYPE} from "../../services/constants";
import {Action} from "../../../IsaacAppTypes";
import {logAction, openActiveModal} from "../actions";
import {allRequiredInformationIsPresent, withinLast50Minutes, withinLast2Hours} from "../../services/validation";
import {isLoggedIn} from "../../services/user";
import * as persistence from "../../services/localStorage";
import {KEY} from "../../services/localStorage";
import {requiredAccountInformationModal} from "../../components/elements/modals/RequiredAccountInformationModal";
import {loginOrSignUpModal} from "../../components/elements/modals/LoginOrSignUpModal";
import {authApi} from "../slices/api/auth";

export const notificationCheckerMiddleware: Middleware = (middlewareApi: MiddlewareAPI) => (dispatch: Dispatch) => async (action: Action) => {

    const state = middlewareApi.getState();
    if([ACTION_TYPE.ROUTER_PAGE_CHANGE].includes(action.type) || authApi.endpoints.userPreferences.matchFulfilled(action) || authApi.endpoints.currentUser.matchFulfilled(action)) {
        if (
            state && isLoggedIn(state.user) && state?.isaacApi?.queries["userPreferences(undefined)"]?.status === "fulfilled" &&
            !allRequiredInformationIsPresent(state.user, state?.isaacApi?.queries["userPreferences(undefined)"]?.data, state.user.registeredContexts) &&
            !withinLast50Minutes(persistence.load(KEY.REQUIRED_MODAL_SHOWN_TIME))
        ) {
            persistence.save(KEY.REQUIRED_MODAL_SHOWN_TIME, new Date().toString());
            await dispatch(openActiveModal(requiredAccountInformationModal) as any);
        }
    }

    if (action.type === ACTION_TYPE.QUESTION_ATTEMPT_REQUEST) {
        const lastQuestionId = persistence.session.load(KEY.FIRST_ANON_QUESTION);

        if (lastQuestionId === null) {
            persistence.session.save(KEY.FIRST_ANON_QUESTION, action.questionId);
        } else {
            if (
                state && !isLoggedIn(state.user) &&
                lastQuestionId !== action.questionId &&
                !withinLast2Hours(persistence.load(KEY.LOGIN_OR_SIGN_UP_MODAL_SHOWN_TIME))
            ) {
                dispatch(logAction({
                    type: "LOGIN_MODAL_SHOWN"
                }));
                persistence.session.remove(KEY.FIRST_ANON_QUESTION);
                persistence.save(KEY.LOGIN_OR_SIGN_UP_MODAL_SHOWN_TIME, new Date().toString());
                await dispatch(openActiveModal(loginOrSignUpModal) as any);
            }
        }
    }

    return dispatch(action);
};
