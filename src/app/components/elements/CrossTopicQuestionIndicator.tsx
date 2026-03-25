import classNames from "classnames";
import React from "react";
import { isAda } from "../../services";

export function CrossTopicQuestionIndicator({small, symbol, className}: {small?: boolean, symbol?: boolean, className?: string}) {
    return <div className={classNames(className, "question-tag-indicator cross-topic text-nowrap", {small, "my-1": !small})}>
        <span className={classNames("icon icon-cross-topic", {"me-2": !symbol}, {"icon-md": isAda})}/> 
        {!symbol && "Cross-topic question"}
    </div>;
}
