import {
    ACTION_TYPE,
    allRequiredInformationIsPresent,
    isDefined,
    isLoggedIn,
    KEY,
    persistence,
    withinLast2Hours,
    withinLast50Minutes
} from "../../services";
import {
    _openActiveModal,
    AppState,
    logAction,
    needToUpdateUserContextDetails,
    openActiveModal,
    routerPageChange
} from "../index";
import {requiredAccountInformationModal} from "../../components/elements/modals/RequiredAccountInformationModal";
import {userContextReconfimationModal} from "../../components/elements/modals/UserContextReconfirmationModal";
import {MODAL_ID} from "../../components/elements/modals";
import {createListenerMiddleware} from "@reduxjs/toolkit";

export const notificationCheckerMiddleware = createListenerMiddleware();

notificationCheckerMiddleware.startListening({
    predicate: (action) => {
        return [ACTION_TYPE.CURRENT_USER_RESPONSE_SUCCESS, routerPageChange.type].includes(action.type)
    },
    effect: async (action, {dispatch, getState}) => {
        const state = getState() as AppState;
        // Get user object either from the action or state
        const user = action.type === ACTION_TYPE.CURRENT_USER_RESPONSE_SUCCESS
            ? action.user
            : (state && isLoggedIn(state.user)
                ? state.user
                : undefined);

        if (isDefined(user)) {
            // Required account info modal - takes precedence over stage/exam board re-confirmation modal, and is only
            // shown once every 50 minutes (using a key in clients browser storage)
            if (isDefined(state?.userPreferences) && !allRequiredInformationIsPresent(user, state?.userPreferences, user.registeredContexts) &&
                !withinLast50Minutes(persistence.load(KEY.REQUIRED_MODAL_SHOWN_TIME))) {
                persistence.save(KEY.REQUIRED_MODAL_SHOWN_TIME, new Date().toString());
                await dispatch(openActiveModal(requiredAccountInformationModal));
            }
            // User context re-confirmation modal - used to request a user to update their stage and/or exam board
            // once every academic year.
            else if (needToUpdateUserContextDetails(user.registeredContextsLastConfirmed) &&
                     !withinLast50Minutes(persistence.load(KEY.RECONFIRM_USER_CONTEXT_SHOWN_TIME))) {
                persistence.save(KEY.RECONFIRM_USER_CONTEXT_SHOWN_TIME, new Date().toString());
                await dispatch(openActiveModal(userContextReconfimationModal));
            }
        }
    }
});

notificationCheckerMiddleware.startListening({
    predicate: action => action.type === ACTION_TYPE.QUESTION_ATTEMPT_REQUEST,
    effect: async (action, {dispatch, getState}) => {
        const state = getState() as AppState;
        const lastQuestionId = persistence.session.load(KEY.FIRST_ANON_QUESTION);

        if (lastQuestionId === null) {
            persistence.session.save(KEY.FIRST_ANON_QUESTION, action.questionId);
        } else if (
            state && !isLoggedIn(state?.user) &&
            lastQuestionId !== action.questionId &&
            !withinLast2Hours(persistence.load(KEY.LOGIN_OR_SIGN_UP_MODAL_SHOWN_TIME))
        ) {
            dispatch(logAction({
                type: "LOGIN_MODAL_SHOWN"
            }));
            persistence.session.remove(KEY.FIRST_ANON_QUESTION);
            persistence.save(KEY.LOGIN_OR_SIGN_UP_MODAL_SHOWN_TIME, new Date().toString());
            await dispatch(_openActiveModal(MODAL_ID.loginOrSignUp));
        }
    }
});
