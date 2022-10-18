import {Action, ActiveModal, ActiveModalSpecification, Toast} from "../../../IsaacAppTypes";
import {ACTION_TYPE} from "../../services";
import {createSlice, PayloadAction} from "@reduxjs/toolkit";
import {ModalId} from "../../components/elements/modals";

export type ToastsState = Toast[] | null;
export const toasts = (toasts: ToastsState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.TOASTS_SHOW:
            toasts = toasts || [];
            return [...toasts, action.toast];
        case ACTION_TYPE.TOASTS_HIDE:
            toasts = toasts || [];
            return toasts.map(toast => toast.id == action.toastId ? {...toast, showing: false} : toast);
        case ACTION_TYPE.TOASTS_REMOVE:
            toasts = toasts || [];
            return toasts.filter(toast => toast.id != action.toastId);
        default:
            return toasts;
    }
};

export type ActiveModalsState = ActiveModalSpecification[] | null;
export const activeModals = (activeModals: ActiveModalsState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.ACTIVE_MODAL_OPEN:
            activeModals = activeModals || [];
            return [...activeModals, action.activeModal];
        case ACTION_TYPE.ACTIVE_MODAL_CLOSE:
            return activeModals && activeModals.length > 1 ? activeModals.slice(0, activeModals.length - 1) : null;
        default:
            return activeModals;
    }
};

type NotificationsState = {notifications?: any[]} | null;
export const notifications = (notifications: NotificationsState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.NOTIFICATIONS_RESPONSE_SUCCESS:
            return {notifications: Array.from(action.notifications)};
        default:
            return notifications;
    }
};

export const currentActiveModalSlice = createSlice({
    name: "currentActiveModal",
    initialState: null as ActiveModal | null,
    reducers: {
        openActiveModal: (_, action: PayloadAction<ActiveModal>) => action.payload,
        closeActiveModal: (state, action: PayloadAction<string>) => state && state.id === action.payload ? null : state,
    }
});
