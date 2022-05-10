import React from "react";
import {IsaacContent} from "./IsaacContent";
import {TrustedHtml} from "../elements/TrustedHtml";
import {TrustedMarkdown} from "../elements/TrustedMarkdown";
import {ContentDTO} from "../../../IsaacApiTypes";

type ContentOrAccordionChunk = ContentDTO[] & {isAccordion?: boolean, isFirstChunk?: boolean};

interface ContentValueOrChildrenProps {
    value?: string;
    encoding?: string;
    children?: ContentDTO[];
}
export const IsaacContentValueOrChildren = ({value, encoding, children}: ContentValueOrChildrenProps) => {
    // Content chunking inherited from Isaac Physics
    const contentChunks: ContentOrAccordionChunk[] = []; // One of these for each chunk of content, where accordions may only appear on their own in a chunk.
    let breakOnTypeChange = false;
    let lastType = "";
    let currentChunk: ContentDTO[] = [];
    children?.forEach(child => {
        if ((breakOnTypeChange && child.type != lastType) || (!breakOnTypeChange && child.type == "isaacFeaturedProfile")) {
            // Split profiles into a separate content chunk
            // This means the index when iterating over the profiles starts from 0 and allows the multi-column design to be more simply implemented
            breakOnTypeChange = !breakOnTypeChange; // toggle
            if (currentChunk.length > 0) {
                contentChunks.push(currentChunk);
            }
            currentChunk = [child];
        } else if (child.layout == "accordion" || child.layout == "tabs") {
            if (currentChunk.length > 0) {
                contentChunks.push(currentChunk);
            }
            const accordionChunk: ContentOrAccordionChunk = [child];
            accordionChunk.isAccordion = true;
            accordionChunk.isFirstChunk = contentChunks.length == 0;
            contentChunks.push(accordionChunk);
            currentChunk = [];
        } else {
            currentChunk.push(child);
        }
        lastType = child.type as string;
    })
    if (currentChunk.length > 0) {
        contentChunks.push(currentChunk);
    }

    // Report content error
    if (value && value != "" && children && children.length > 0) {
        throw new Error("Cannot render both value and children:\n" +
            "\tVALUE:\n" +  JSON.stringify(value) + "\n\n" +
            "\tCHILDREN:\n" + JSON.stringify(children));
    }

    return <React.Fragment>
        {value && <div className="content-value">
           {
                (encoding == "markdown" && <TrustedMarkdown markdown={value}/>) ||
                (encoding == "html" && <TrustedHtml html={value}/>) ||
                (<div>[CONTENT WITH UNKNOWN ENCODING: <i>{encoding} | {value} </i>]</div>)
            }
        </div>}
        {contentChunks.map((contentChunk, chunkIndex) => {
            if (contentChunk.isAccordion) {
                return <React.Fragment key={chunkIndex}>
                    {contentChunk.map((content, contentIndex) =>
                        <IsaacContent doc={content} key={contentIndex} contentIndex={contentIndex}/>)
                    }
                </React.Fragment>;
            } else {
                return <div className="clearfix content-chunk" key={chunkIndex}>
                    {contentChunk.map((content, contentIndex) =>
                        <IsaacContent doc={content} key={contentIndex} contentIndex={contentIndex}/>)}
                </div>
            }
        })}
   </React.Fragment>;
};
