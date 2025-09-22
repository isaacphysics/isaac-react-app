import classNames from "classnames";
import React from "react";

export function LLMFreeTextQuestionIndicator({small, symbol, className}: {small?: boolean, symbol?: boolean, className?: string}) {
    return <div className={classNames(className, "llm-indicator text-nowrap my-1", { small })}>
        <span className="icon-ai me-1"/> 
        {!symbol && `LLM marked question`}
    </div>;
}
