import {
    getRTKQueryErrorMessage,
    AppDispatch,
    currentActiveModalSlice,
    useAppDispatch,
    useAppSelector,
    selectors
} from "../index";
import {Dispatch, useCallback, useEffect, useMemo, useState} from "react";
import {Action, ActiveModalSpecification, Toast} from "../../../IsaacAppTypes";
import {ACTION_TYPE, API_REQUEST_FAILURE_MESSAGE} from "../../services";
import ReactGA from "react-ga";
import {ModalProps} from "reactstrap/es/Modal";
import {ModalId, ModalTypeRegistry} from "../../components/elements/modals";
import {AnyAction} from "redux";
import {ThunkDispatch} from "redux-thunk";

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

export const showErrorToast = (error: string, body: string) => showToast({
    color: "danger",
    title: error,
    timeout: 5000,
    body
});
export const showSuccessToast = (title: string, body: string) => showToast({
    color: "success",
    timeout: 5000,
    title,
    body
});

export function showRTKQueryErrorToastIfNeeded(error: string, response: any) {
    if (response) {
        if (response.error) {
            if (response.error.status < 500) {
                return showErrorToast(error, getRTKQueryErrorMessage(response.error).message);
            }
        } else {
            ReactGA.exception({
                description: `load_fail: ${error}`
            });
            return showErrorToast(error, API_REQUEST_FAILURE_MESSAGE);
        }
    }
    return {type: ACTION_TYPE.TEST_ACTION};
}

// Modals
export const openActiveModal = (activeModal: ActiveModalSpecification) => ({type: ACTION_TYPE.ACTIVE_MODAL_OPEN, activeModal});

export const _openActiveModal = <Id extends ModalId, Args extends {} = ModalTypeRegistry[Id]>(id: Id, data?: Partial<Args>, uId?: string | number) => {
    return (dispatch: AppDispatch | ThunkDispatch<unknown, unknown, AnyAction>) => dispatch(currentActiveModalSlice.actions.openActiveModal({id: uId ? `${id}-${uId}` : id, data}));
}

export const _closeActiveModal = (id: ModalId, uId?: string | number) => {
    return (dispatch: AppDispatch | ThunkDispatch<unknown, unknown, AnyAction>) => dispatch(currentActiveModalSlice.actions.closeActiveModal(uId ? `${id}-${uId}` : id));
}

export const closeActiveModal = () => ({type: ACTION_TYPE.ACTIVE_MODAL_CLOSE});

interface UseActiveModalOptions {
    isOpen?: boolean;
    testId?: string;
}
// A hook that abstracts connecting a modal element to the `currentActiveModal` Redux state. When the modal is opened
// or closed via either the returned functions or the `isOpen` option, the `currentActiveModal` state is modified to
// reflect that change.
//
// The hook returns two functions - `openModal` and `closeModal` - along with a set of reactstrap `Modal` props that
// you should pass to the modal you want to connect to the active modal setup.
// ```
// <IsaacModal modalProps={modalProps} closeModal={closeModal} ... >
//     ...
// </IsaacModal>
// ```
export const useActiveModal = <T extends {}>(id: string, options: UseActiveModalOptions = {}): {openModal: () => void; closeModal: () => void; modalProps: ModalProps, data?: T} => {
    const dispatch = useAppDispatch();
    const {id: currentModalId, data} = useAppSelector(selectors.notifications.currentActiveModal) ?? {};
    const isOpen = currentModalId === id;

    const [lastData, setLastData] = useState<T | undefined>(undefined);
    // On modal open, always set last data to current data
    useEffect(() => {
        if (isOpen) setLastData(data);
    }, [isOpen]);

    const {isOpen: forceOpen, testId} = options;

    const openModal = useCallback(() => {
        dispatch(currentActiveModalSlice.actions.openActiveModal({id, data}));
    }, [isOpen]);
    const closeModal = useCallback(() => {
        dispatch(currentActiveModalSlice.actions.closeActiveModal(id));
    }, [isOpen]);
    const toggle = useCallback(() => {
        (isOpen ? closeModal : openModal)();
    }, [isOpen]);

    useEffect(() => {
        if (forceOpen === undefined) return;
        (forceOpen ? openModal : closeModal)();
    }, [forceOpen]);

    const modalProps = useMemo<ModalProps>(() => ({
        isOpen,
        toggle,
        // Miscellaneous props for accessibility, testing, etc.
        returnFocusAfterClose: true,
        "data-testid": testId ?? "active-modal"
    }), [isOpen, openModal, closeModal, toggle, testId]);

    return {
        data: lastData,
        openModal,
        closeModal,
        modalProps
    };
};
