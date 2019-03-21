import React from "react";
import {TrustedHTML} from "./TrustedHTML";
import {MARKDOWN_RENDERER} from "../constants";

export const TrustedMarkdown = ({markdown}: {markdown: string}) => {
    return <TrustedHTML html={MARKDOWN_RENDERER.render(markdown)} />;
};
