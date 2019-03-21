import React from "react";
import {IsaacContent} from "./IsaacContent";
import {TrustedHTML} from "./TrustedHTML";
import {TrustedMarkdown} from "./TrustedMarkdown";

interface ContentValueOrChildren {
    value: string,
    encoding: string,
    children: {type: string, layout: string}[],
}

export const IsaacContentValueOrChildren = ({value="", encoding, children=[]}: ContentValueOrChildren) => {
    if (value != "" && children.length > 0) {
        throw new Error("Cannot render both value and children:\n" +
            "\tVALUE:\n" +  JSON.stringify(value) + "\n\n" +
            "\tCHILDREN:\n" + JSON.stringify(children));
    }

    return (
        <div>
            {value && (
                (encoding == "markdown" && <TrustedMarkdown markdown={value} />) ||
                (encoding == "html" && <TrustedHTML html={value} />) ||
                (<div>[CONTENT WITH UNKNOWN ENCODING: <i>{encoding} | {value} </i>]</div>)
            )}
            {children.map((child: any, index: number) =>
                <IsaacContent doc={child} key={index}/>
            )}
        </div>
    );
};
