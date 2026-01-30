import React, {ReactElement, useEffect} from "react";
import {UncontrolledTooltip} from "reactstrap";
import {
    isAda,
    isPhy,
    simpleDifficultyLabelMap,
    SITE_TITLE,
    siteSpecific,
} from "../../services";
import { mainContentIdSlice, useAppDispatch } from "../../state";
import {ViewingContext} from "../../../IsaacAppTypes";
import {DifficultyIcons} from "./svg/DifficultyIcons";
import classNames from "classnames";
import {Helmet} from "react-helmet";
import {Markup} from "./markup";
import { HexIcon, HexIconProps, IconProps } from "./svg/HexIcon";

function AudienceViewer({audienceViews}: {audienceViews: ViewingContext[]}) {
    const difficulty = audienceViews.map(v => v.difficulty).filter(d => d !== undefined)[0];

    return difficulty && <div className="h-subtitle pt-sm-0 mb-sm-0 d-flex d-sm-block align-content-center">
        <div className="fw-regular align-self-center">
            {simpleDifficultyLabelMap[difficulty]}
        </div>
        <div className="ms-2 ms-sm-0">
            <DifficultyIcons difficulty={difficulty}/>
        </div>
    </div>;
}

export type TitleIconProps = Omit<HexIconProps, "icon"> & {
    height?: string;
    width?: string;
    alt?: string;
    label?: string;
} & (
    { type: "icon"; icon: IconProps | string } |
    { type: "img" | "placeholder"; icon?: string }
);

export const TitleIcon = ({icon}: {icon: TitleIconProps}) => {
    switch (icon.type) {
        case "img":
            return <img src={icon.icon} alt={icon.alt ?? ""} height={icon.height} width={icon.width} className={classNames(icon.className, {"me-3": isPhy})}/>;
        case "icon":
            return <HexIcon icon={icon.icon} subject={icon.subject} className={icon.className}/>;
        case "placeholder":
            return <div style={{width: icon.width, height: icon.height}}/>;
    }
};

export interface PageTitleProps {
    currentPageTitle: string;
    displayTitleOverride?: string;
    subTitle?: string;
    disallowLaTeX?: boolean;
    preview?: boolean;
    icon?: TitleIconProps;
}

export const PageTitle = ({currentPageTitle, displayTitleOverride, subTitle, disallowLaTeX, preview, icon}: PageTitleProps) => {
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (preview) return; // Don't set the main content ID if we're in preview mode
        dispatch(mainContentIdSlice.actions.set({id: "main-heading", priority: 1}));
    }, [dispatch, preview]);

    useEffect(() => {
        if (preview) return; // Don't set the document title if we're in preview mode
        document.title = currentPageTitle + " — " + SITE_TITLE;
    }, [currentPageTitle, preview]);

    return <h1 id="main-heading" data-testid="main-heading" className={classNames("h-title d-flex pb-0 mb-0", {"flex-column w-100": isAda})}>
        {isPhy && icon && <TitleIcon icon={icon} />}
        {formatPageTitle(displayTitleOverride ?? currentPageTitle, disallowLaTeX, siteSpecific("align-self-center", undefined))}
        {isAda && subTitle && <span className="h-subtitle d-none d-sm-block">{subTitle}</span>}

        <Helmet>
            <meta property="og:title" content={currentPageTitle} />
        </Helmet>
    </h1>;
};

export interface TitleMetadataProps {
    audienceViews?: ViewingContext[];
    help?: ReactElement;
}

export const TitleMetadata = ({audienceViews, help}: TitleMetadataProps) => {
    return <>
        {isAda && audienceViews && <AudienceViewer audienceViews={audienceViews} />}
        {isAda && help && <>
            <div id="title-help" className="title-help">Help</div>
            <UncontrolledTooltip target="title-help" placement="bottom">{help}</UncontrolledTooltip>
        </>}
    </>;
};

export const formatPageTitle = (currentPageTitle: string, disallowLaTeX?: boolean, className?: string) => <Markup encoding={disallowLaTeX ? "plaintext" : "latex"} className={className}>{currentPageTitle}</Markup>;
