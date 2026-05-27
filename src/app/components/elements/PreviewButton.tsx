import React from "react";
import { closeActiveModal, openActiveModal, useAppDispatch } from "../../state";
import { Question } from "../pages/Question";

export const PreviewQuestionButton = ({id}: {id?: string}) => {
    const dispatch = useAppDispatch();
    const openQuestionModal = (urlQuestionId: string) => {
        dispatch(openActiveModal({
            closeAction: () => {dispatch(closeActiveModal());}, size: "xl",
            title: "Question preview", body: <Question questionIdOverride={urlQuestionId} preview />
        }));
    };

    if (!id) return null;

    return <button
        type="button" title="Preview question in modal" className="pointer-cursor align-middle new-tab p-0 mt-1 ms-2 bg-transparent"
        aria-label="Preview question"
        onClick={() => id && openQuestionModal(id)}
    >
        <i className="icon icon-md icon-raw icon-new-tab"/>
    </button>;
};
