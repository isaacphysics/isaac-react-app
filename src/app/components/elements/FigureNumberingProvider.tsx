import React, {useEffect, useRef} from "react";
import { useLocation } from "react-router";
import { FigureNumberingContext } from "../../../IsaacAppTypes";

export const FigureNumberingProvider = (props: React.PropsWithChildren) => {
    const location = useLocation();
    const figures = useRef<{[figureId: string]: number}>({});
    useEffect(() => {
        figures.current = {}; // Reset figure numbering on each route change
    }, [location]);

    {/* Create a figure numbering scope for each page */}
    return <FigureNumberingContext.Provider {...props} value={figures.current} />;
};
