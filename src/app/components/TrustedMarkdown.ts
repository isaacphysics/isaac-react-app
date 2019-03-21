import React from "react";
import {TrustedHTML} from "./TrustedHTML";

export const TrustedMarkdown = ({markdown}: {markdown: string}) => {
    // TODO MT use remarkable to convert from markdown to html
    const html = markdown;
    return React.createElement(TrustedHTML, {html});
};
