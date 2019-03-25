import React from "react";
import {MARKDOWN_RENDERER} from "../services/constants";
import {TrustedHtml} from "./TrustedHtml";

export const TrustedMarkdown = ({markdown}: {markdown: string}) => {
    return <TrustedHtml html={MARKDOWN_RENDERER.render(markdown)} />;
};
