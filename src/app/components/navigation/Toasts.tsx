import React from 'react';
import {AppState, hideToast, useAppDispatch, useAppSelector} from "../../state";
import * as RS from 'reactstrap';
import {Toast} from "../../../IsaacAppTypes";

export const FAILURE_TOAST: Toast = {color: "danger", title: "Validation error", timeout: 5000, body: "Required information is not present."};
export const SUCCESS_TOAST: Toast = {color: "success", title: "Action completed", timeout: 5000, body: "Action completed successfully."};

export const Toasts = () => {
    const dispatch = useAppDispatch();
    const toasts = useAppSelector((state: AppState) => state?.toasts || []);
    return <div className="toasts-container">{
        toasts.map((toast) => <RS.Toast key={toast.id} isOpen={toast.showing}>
            <RS.ToastHeader icon={toast.color} className="py-2 px-3"
                toggle={toast.closable ? (() => toast.id && dispatch(hideToast(toast.id))): undefined}>
                <span className={`pl-1 toast-heading text-${toast.color}`}>{toast.title}</span>
            </RS.ToastHeader>
            {toast.body && <RS.ToastBody className="p-3">
                {toast.body}
                {toast.buttons && <div className="text-right">{toast.buttons}</div>}
            </RS.ToastBody>}
        </RS.Toast>)
    }</div>;
};
