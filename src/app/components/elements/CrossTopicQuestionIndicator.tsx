import classNames from "classnames";
import React from "react";
import { isAda } from "../../services";
import { useTranslation } from "react-i18next";

export function CrossTopicQuestionIndicator({small, symbol, className}: {small?: boolean, symbol?: boolean, className?: string}) {
    const { t } = useTranslation();
    return <div className={classNames(className, "question-tag-indicator cross-topic text-nowrap", {small, "my-1": !small})}>
        <span className={classNames("icon icon-cross-topic", {"me-2": !symbol}, {"icon-md": isAda})}/> 
        {!symbol && t("common:questions.crossTopicIndicator")}
    </div>;
}
