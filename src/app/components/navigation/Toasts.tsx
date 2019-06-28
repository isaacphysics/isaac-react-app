import React from 'react';
import {connect} from "react-redux";
import * as RS from 'reactstrap';

import {AppState} from "../../state/reducers";
import {hideToast} from "../../state/actions";
import {Toast} from "../../../IsaacAppTypes";

function mapStateToProps(state: AppState) {
    return {toasts: state && state.toasts || []};
}

const mapDispatchToProps = {
    hideToast
};

interface ToastProps {
    toasts: Toast[];
    hideToast: (toastId: string) => void;
}
const ToastsComponent = ({toasts, hideToast}: ToastProps) => {
    return <div className="toasts-container">{
        toasts.map((toast) => <RS.Toast key={toast.id} isOpen={toast.showing}>
            <RS.ToastHeader icon={toast.color} className="py-2 px-3"
                toggle={toast.closable ? (() => toast.id && hideToast(toast.id)): undefined}>
                <span className={`pl-1 toast-heading text-${toast.color}`}>{toast.title}</span>
            </RS.ToastHeader>
            {toast.body && <RS.ToastBody className="p-3">{toast.body}</RS.ToastBody>}
        </RS.Toast>)
    }</div>;
};

export const Toasts = connect(mapStateToProps, mapDispatchToProps)(ToastsComponent);
