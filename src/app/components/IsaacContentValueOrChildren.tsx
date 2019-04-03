import React from "react";
import {IsaacContent} from "./IsaacContent";
import {TrustedHtml} from "./TrustedHtml";
import {TrustedMarkdown} from "./TrustedMarkdown";
import {ContentDTO} from "../../IsaacApiTypes";

interface ContentValueOrChildrenProps {
    value?: string,
    encoding?: string,
    children?: ContentDTO[],
}
export const IsaacContentValueOrChildren = ({value="", encoding, children=[]}: ContentValueOrChildrenProps) => {

    if (value != "" && children.length > 0) {
        throw new Error("Cannot render both value and children:\n" +
            "\tVALUE:\n" +  JSON.stringify(value) + "\n\n" +
            "\tCHILDREN:\n" + JSON.stringify(children));
    }

    return (
        <div>
            {value && (
                (encoding == "markdown" && <TrustedMarkdown markdown={value} />) ||
                (encoding == "html" && <TrustedHtml html={value} />) ||
                (<div>[CONTENT WITH UNKNOWN ENCODING: <i>{encoding} | {value} </i>]</div>)
            )}
            {children.map((child, index) =>
                <IsaacContent doc={child} key={index}/>
            )}
        </div>
    );
};
