import React from "react";
import {TrustedHtml} from "./TrustedHtml";
import {MARKDOWN_RENDERER} from "../services/constants";

export const TrustedMarkdown = ({markdown}: {markdown: string}) => {
    return <TrustedHtml html={MARKDOWN_RENDERER.render(markdown)} />;
};
