import React from 'react';
import {AppState, hideToast, useAppDispatch, useAppSelector} from "../../state";
import {Toast as ToastType} from "../../../IsaacAppTypes";
import {siteSpecific} from "../../services";
import { Toast, ToastHeader, ToastBody } from 'reactstrap';

export const FAILURE_TOAST: ToastType = {color: "danger", title: "Validation error", timeout: 5000, body: "Required information is not present."};
export const SUCCESS_TOAST: ToastType = {color: "success", title: "Action completed", timeout: 5000, body: "Action completed successfully."};

export const Toasts = () => {
    const dispatch = useAppDispatch();
    const toasts = useAppSelector((state: AppState) => state?.toasts || []);
    return <div className="toasts-container" data-testid='toasts'>{
        toasts.map((toast) => <Toast key={toast.id} isOpen={toast.showing}>
            <ToastHeader icon={toast.color} className={siteSpecific("py-2 px-3", "")}
                toggle={toast.closable ? (() => toast.id && dispatch(hideToast(toast.id))): undefined}>
                <span className={`ps-1 toast-heading text-${toast.color}`}>{toast.title}</span>
            </ToastHeader>
            {toast.body && <ToastBody className="p-3">
                {toast.body}
                {toast.buttons && <div className="text-end">{toast.buttons}</div>}
            </ToastBody>}
        </Toast>)
    }</div>;
};
