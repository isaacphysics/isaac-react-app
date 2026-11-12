import React from "react";
import { closeActiveModal, openActiveModal, useAppDispatch } from "../../state";
import { Question } from "../pages/Question";
import classNames from "classnames";
import { useTranslation } from "react-i18next";

export const PreviewQuestionButton = ({id, className}: {id?: string, className?: string}) => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const openQuestionModal = (urlQuestionId: string) => {
        dispatch(openActiveModal({
            closeAction: () => {dispatch(closeActiveModal());}, size: "xl",
            title: t("common:questions.preview.title"), body: <Question questionIdOverride={urlQuestionId} preview />
        }));
    };

    if (!id) return null;

    return <button
        type="button" title={`Preview question '${id}' in modal`} className={classNames("d-flex pointer-cursor new-tab bg-transparent vertical-center", className)}
        aria-label={t("common:questions.preview.ariaLabel")}
        onClick={() => id && openQuestionModal(id)}
    >
        <i className="icon icon-inline-sm icon-raw icon-preview"/>
    </button>;
};
