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

    let n = Object.keys(figureNumbers).length + 1;
    function walk(d: any) {
        if (!d) {
            // Nothing to see here. Move along.
            return;
        } else if (d.type == "figure" && d.id) {
            const figureId = extractFigureId(d.id)
            if (!Object.keys(figureNumbers).includes(figureId)) {
                figureNumbers[figureId] = n++;
            }
        } else {
            // Walk all the things that might possibly contain figures. Doesn't blow up if they don't exist.
            for (let c of d.children || []) {
                walk(c);
            }
            for (let h of d.hints || []) {
                walk(h);
            }
            walk(d.answer);

            // If we find that some figures aren't getting numbers, add additional walks here to find them.
        }
    }

    walk(doc);

    return children;
};
