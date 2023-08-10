import {getRTKQueryErrorMessage, AppDispatch} from "../index";
import {Dispatch} from "react";
import {Action, ActiveModal, Toast} from "../../../IsaacAppTypes";
import {ACTION_TYPE, API_REQUEST_FAILURE_MESSAGE, trackEvent} from "../../services";

// Toasts
const removeToast = (toastId: string) => (dispatch: Dispatch<Action>) => {
    dispatch({type: ACTION_TYPE.TOASTS_REMOVE, toastId});
};

export const hideToast = (toastId: string) => (dispatch: AppDispatch) => {
    dispatch({type: ACTION_TYPE.TOASTS_HIDE, toastId});
    setTimeout(() => {
        dispatch(removeToast(toastId));
    }, 1000);
};

let nextToastId = 0;
export const showToast = (toast: Toast) => (dispatch: AppDispatch) => {
    const toastId = toast.id = "toast" + nextToastId++;
    if (toast.timeout) {
        setTimeout(() => {
            dispatch(hideToast(toastId));
        }, toast.timeout);
    }
    if (toast.closable === undefined) toast.closable = true;
    toast.showing = true;
    dispatch({type: ACTION_TYPE.TOASTS_SHOW, toast});
    return toastId;
};

export const showErrorToast = (error: string, body?: string) => showToast({
    color: "danger",
    title: error,
    timeout: 5000,
    body
});
export const showSuccessToast = (title: string, body?: string) => showToast({
    color: "success",
    timeout: 5000,
    title,
    body
});

export function showRTKQueryErrorToastIfNeeded(error: string, response: any, message?: string) {
    if (response) {
        if (response.error) {
            if (response.error.status < 500) {
                return showErrorToast(error, message ?? getRTKQueryErrorMessage(response.error).message);
            }
        } else {
            trackEvent("exception", {props:
                    {
                        description: `load_fail: ${error}`
                    }
                }
            )
            return showErrorToast(error, API_REQUEST_FAILURE_MESSAGE);
        }
    }
    return {type: ACTION_TYPE.TEST_ACTION};
}

// Modals
export const openActiveModal = (activeModal: ActiveModal) => ({type: ACTION_TYPE.ACTIVE_MODAL_OPEN, activeModal});

export const closeActiveModal = () => ({type: ACTION_TYPE.ACTIVE_MODAL_CLOSE});
