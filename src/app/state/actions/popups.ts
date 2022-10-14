import {
    getRTKQueryErrorMessage,
    AppDispatch,
    currentActiveModalSlice,
    useAppDispatch,
    useAppSelector,
    selectors
} from "../index";
import {Dispatch, useCallback, useEffect, useMemo} from "react";
import {Action, ActiveModal, Toast} from "../../../IsaacAppTypes";
import {ACTION_TYPE, API_REQUEST_FAILURE_MESSAGE} from "../../services";
import ReactGA from "react-ga";
import {ModalProps} from "reactstrap/es/Modal";

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
    console.log(response);
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
export const openActiveModal = (activeModal: ActiveModal) => ({type: ACTION_TYPE.ACTIVE_MODAL_OPEN, activeModal});

export const closeActiveModal = () => ({type: ACTION_TYPE.ACTIVE_MODAL_CLOSE});

interface UseActiveModalOptions {
    isOpen?: boolean;
    testId?: string;
    passDataToOpenModal?: boolean;
}
// A hook that abstracts connecting a modal element to the `currentActiveModal` Redux state. When the modal is opened
// or closed via either the returned functions or the `isOpen` option, the `currentActiveModal` state is modified to
// reflect that change.
//
// The hook returns two functions - `openModal` and `closeModal` - along with a set of reactstrap `Modal` props that
// you should pass to the `Modal` you want to connect to the active modal setup.
// ```
// <Modal {...modalProps}>
//     ...
// </Modal>
// ```
// If you want to be able to pass static (non-updatable) data into the `openModal` function, set the option
// `passDataToOpenModal` to `true`. This lets the caller of `openModal` to pass data back up to the component
// which called the `useActiveModal` hook. This could be helpful if you're opening the modal from a deeply nested
// UI component for example.
export const useActiveModal = (id: string, options: UseActiveModalOptions = {passDataToOpenModal: false}): {openModal: (staticData?: any) => void; closeModal: () => void; data?: any; modalProps: ModalProps} => {
    const dispatch = useAppDispatch();
    const currentOpenModal = useAppSelector(selectors.notifications.currentActiveModal);
    const isOpen = currentOpenModal?.id === id;

    const {isOpen: forceOpen, testId, passDataToOpenModal} = options;

    const openModal = useCallback((staticData?: any) => {
        dispatch(currentActiveModalSlice.actions.openActiveModal({
            id,
            staticData: passDataToOpenModal ? staticData : undefined
        }));
    }, [id]);
    const closeModal = useCallback(() => {
        dispatch(currentActiveModalSlice.actions.closeActiveModal(id));
    }, [id]);
    const toggle = useCallback(() => {
        (isOpen ? openModal : closeModal)();
    }, [id, isOpen]);

    useEffect(() => {
        if (forceOpen === undefined) return;
        (forceOpen ? openModal : closeModal)();
    }, [forceOpen]);

    const modalProps = useMemo<ModalProps>(() => ({
        isOpen,
        toggle,
        // Make sure that if the modal is opened or closed some other way, we record that in Redux and close any
        // other active modals
        onOpened: openModal,
        onClosed: closeModal,
        // Miscellaneous props for accessibility, testing, etc.
        returnFocusAfterClose: true,
        "data-testid": testId ?? "active-modal"
    }), [isOpen, openModal, closeModal, toggle]);

    return {
        openModal,
        closeModal,
        data: currentOpenModal?.staticData,
        modalProps,
    };
};
