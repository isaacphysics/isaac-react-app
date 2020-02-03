import {ContentDTO} from "../../../IsaacApiTypes";
import {FigureNumberingContext, FigureNumbersById} from "../../../IsaacAppTypes";
import React from "react";

interface WithFigureNumberingProps {
    doc: ContentDTO;
    children: any;
}

export const WithFigureNumbering = ({doc, children}: WithFigureNumberingProps) => {
    let figureNumbers: FigureNumbersById = {};

    let n = 1;
    let walk = (d: any) => {
        if (!d) {
            // Nothing to see here. Move along.
            return;
        } else if (d.type == "figure" && d.id) {
            figureNumbers[d.id] = n++;
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
    };

    walk(doc);

    return <FigureNumberingContext.Provider value={figureNumbers}>
        {children}
    </FigureNumberingContext.Provider>
};
