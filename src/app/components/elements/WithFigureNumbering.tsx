import {useContext} from "react";
import {ContentDTO} from "../../../IsaacApiTypes";
import {FigureNumberingContext} from "../../../IsaacAppTypes";
import {extractFigureId} from "../content/IsaacFigure";

interface WithFigureNumberingProps {
    doc: ContentDTO;
    children: any;
}

export const WithFigureNumbering = ({doc, children}: WithFigureNumberingProps) => {
    const figureNumbers = useContext(FigureNumberingContext);

    const figuresOutOfNormalFlow = new Set<string>();
    let n = Object.keys(figureNumbers).length + 1;
    function walk(d: any, outOfNormalFlow: boolean) {
        if (!d) {
            // Nothing to see here. Move along.
            return;
        } else if (d.type == "figure" && d.id) {
            const figureId = extractFigureId(d.id);
            if (outOfNormalFlow) {
                figuresOutOfNormalFlow.add(figureId);
            } else if (!Object.keys(figureNumbers).includes(figureId)) {
                figureNumbers[figureId] = n++;
            }
        } else {
            // Walk all the things that might possibly contain figures. Doesn't blow up if they don't exist.
            for (let c of d.children || []) {
                walk(c, outOfNormalFlow);
            }
            for (let h of d.hints || []) {
                walk(h, outOfNormalFlow);
            }
            walk(d.answer, outOfNormalFlow);
            // Walk figures in question choices, marking them as being out of the usual document flow
            for (let c of d.choices || []) {
                walk(c.explanation, true);
            }
            // If we find that some figures aren't getting numbers, add additional walks here to find them.
        }
    }

    walk(doc, false);

    // Add all figures that exist out of the normal flow of the document (figures in choices for example)
    for (const figureId of figuresOutOfNormalFlow.values()) {
        if (!Object.keys(figureNumbers).includes(figureId)) {
            figureNumbers[figureId] = n++;
        }
    }

    return children;
};
