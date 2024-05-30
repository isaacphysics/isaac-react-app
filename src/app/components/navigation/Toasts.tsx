import React from "react";
import { hideToast, selectors, useAppDispatch, useAppSelector } from "../../state";
import { Toast as ToastTypes } from "../../../IsaacAppTypes";
import { Toast, ToastBody, ToastHeader } from "reactstrap";

export const FAILURE_TOAST: ToastTypes = {
  color: "danger",
  title: "Validation error",
  timeout: 5000,
  body: "Required information is not present.",
};
export const SUCCESS_TOAST: ToastTypes = {
  color: "success",
  title: "Action completed",
  timeout: 5000,
  body: "Action completed successfully.",
};

export const Toasts = () => {
  const dispatch = useAppDispatch();
  const toasts = useAppSelector(selectors.toasts.toasts);
  return (
    <div className="toasts-container">
      {toasts.map((toast) => (
        <Toast key={toast.id} isOpen={toast.showing}>
          <ToastHeader
            icon={toast.color}
            className="py-2 px-3"
            toggle={toast.closable ? () => toast.id && dispatch(hideToast(toast.id)) : undefined}
          >
            <span className={`pl-1 toast-heading text-${toast.color}`}>{toast.title}</span>
          </ToastHeader>
          {toast.body && (
            <ToastBody className="p-3">
              {toast.body}
              {toast.buttons && <div className="text-right">{toast.buttons}</div>}
            </ToastBody>
          )}
        </Toast>
      ))}
    </div>
  );
};
