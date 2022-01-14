import React from 'react';
import {useDispatch, useSelector} from "react-redux";
import * as RS from 'reactstrap';
import {AppState} from "../../state/reducers";
import {hideToast} from "../../state/actions";
import {Toast} from "../../../IsaacAppTypes";
import {ContentSummaryDTO} from "../../../IsaacApiTypes";
import {linkToContent} from "../elements/list-groups/ContentSummaryListGroupItem";

export const FAILURE_TOAST: Toast = {color: "danger", title: "Validation error", timeout: 5000, body: "Required information is not present."};
export const SUCCESS_TOAST: Toast = {color: "success", title: "Action completed", timeout: 5000, body: "Action completed successfully."};

export const questionRecommendationToast: (questions: ContentSummaryDTO[]) => Toast = (qs) => {
    return {title: "Recommended content", color: "black",
        body: (dispatch, toastId) => <RS.ListGroup className={"link-list list-group-links"}>
            {qs.slice(0, 1).map(q => linkToContent("", q, true, () => dispatch(hideToast(toastId))))}
        </RS.ListGroup>}
};

export const Toasts = () => {
    const dispatch = useDispatch();
    const toasts = useSelector((state: AppState) => state?.toasts || []);

    const toastIcon = (toast : Toast) => typeof toast.body !== "string"
        ?
            <img className={"text-black"} style={{height: 30, width: "auto"}} src="/assets/wildcard.svg" alt="Concept page"/>
        :
            toast.color;

    const toastTitleColour = (toast : Toast) => toast.color;

    return <div className="toasts-container">{
        toasts.map((toast) => {
            return <RS.Toast key={toast.id} isOpen={toast.showing}>
                <RS.ToastHeader icon={toastIcon(toast)} className="py-2 px-3"
                                toggle={toast.closable ? (() => toast.id && dispatch(hideToast(toast.id))): undefined}>
                    <span className={`pl-1 toast-heading text-${toastTitleColour(toast)}`}>{toast.title}</span>
                </RS.ToastHeader>
                {toast.body && <RS.ToastBody className="p-3">
                    {typeof toast.body === "string"
                        ? toast.body
                        : toast.id && toast.body(dispatch, toast.id)}
                    {toast.buttons && <div className="text-right">{toast.buttons}</div>}
                </RS.ToastBody>}
            </RS.Toast>;
        })
    }</div>;
};