import classNames from "classnames";
import React from "react";

export function LLMFreeTextQuestionIndicator({small}: {small?: boolean}) {
    return <div className={classNames("llm-indicator text-nowrap my-1", { small })}>
        <span className="icon-ai me-1"/> LLM marked question
    </div>;
}