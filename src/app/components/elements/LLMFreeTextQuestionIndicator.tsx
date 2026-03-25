import classNames from "classnames";
import React from "react";
import { isAda } from "../../services";

export function LLMFreeTextQuestionIndicator({small, symbol, className}: {small?: boolean, symbol?: boolean, className?: string}) {
    return <div className={classNames(className, "question-tag-indicator llm text-nowrap", {small, "my-1": !small})}>
        <span className={classNames("icon icon-ai", {"me-2": !symbol}, {"icon-md": isAda})}/> 
        {!symbol && `LLM marked question`}
    </div>;
}
