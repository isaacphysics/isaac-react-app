import React from "react";
import { closeActiveModal, openActiveModal, useAppDispatch } from "../../state";
import { Question } from "../pages/Question";
import classNames from "classnames";

export const PreviewQuestionButton = ({id, className}: {id?: string, className?: string}) => {
    const dispatch = useAppDispatch();
    const openQuestionModal = (urlQuestionId: string) => {
        dispatch(openActiveModal({
            closeAction: () => {dispatch(closeActiveModal());}, size: "xl",
            title: "Question preview", body: <Question questionIdOverride={urlQuestionId} preview />
        }));
    };

    if (!id) return null;

    return <button
        type="button" title="Preview question in modal" className={classNames("d-flex pointer-cursor new-tab bg-transparent vertical-center", className)}
        aria-label="Preview question"
        onClick={() => id && openQuestionModal(id)}
    >
        <i className="icon icon-inline-sm icon-raw icon-preview"/>
    </button>;
};
