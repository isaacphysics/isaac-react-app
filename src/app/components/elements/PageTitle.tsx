import React, {ReactElement, useEffect, useRef} from "react";
import {Button, UncontrolledTooltip} from "reactstrap";
import {
    AUDIENCE_DISPLAY_FIELDS,
    filterAudienceViewsByProperties,
    isAda,
    isPhy,
    simpleDifficultyLabelMap,
    SITE_TITLE,
    siteSpecific,
    STAGE,
    stageLabelMap,
    useUserViewingContext
} from "../../services";
import {
    AppState,
    closeActiveModal,
    mainContentIdSlice,
    openActiveModal,
    useAppDispatch,
    useAppSelector
} from "../../state";
import {PageFragment} from "./PageFragment";
import {ViewingContext} from "../../../IsaacAppTypes";
import {DifficultyIcons} from "./svg/DifficultyIcons";
import classNames from "classnames";
import {Helmet} from "react-helmet";
import {Markup} from "./markup";
import { Difficulty } from "../../../IsaacApiTypes";
import { PhyHexIcon, PhyHexIconProps } from "./svg/PhyHexIcon";

function AudienceViewer({audienceViews}: {audienceViews: ViewingContext[]}) {
    const userContext = useUserViewingContext();
    const viewsWithMyStage = audienceViews.filter(vc => userContext.contexts.some(uc => uc.stage === vc.stage));
    // If there is a possible audience view that is correct for our user context, show that specific one
    const viewsToUse = viewsWithMyStage.length > 0 ? viewsWithMyStage.slice(0, 1) : audienceViews;
    const filteredViews = filterAudienceViewsByProperties(viewsToUse, AUDIENCE_DISPLAY_FIELDS);
    const difficulties: Difficulty[] = audienceViews.map(v => v.difficulty).filter(v => v !== undefined);

    return <div className="h-subtitle pt-sm-0 mb-sm-0 d-sm-flex">
        {/* Show all stage/difficulty combinations for Phy, but just the first difficulty for Ada */}
        {siteSpecific(filteredViews, [{difficulty: difficulties[0], stage: undefined}]).map((view, i) => {
            return <div key={`${view.difficulty} ${view.stage}`} className={classNames("d-flex d-sm-block", {"ms-sm-2": i > 0})}>
                <div className={classNames("text-center align-self-center", {"fw-regular": isAda})}>
                    {siteSpecific(view.stage && stageLabelMap[view.stage], view.difficulty && simpleDifficultyLabelMap[view.difficulty])}
                </div>
                {view.difficulty && <div className="ms-2 ms-sm-0 text-center">
                    <DifficultyIcons difficulty={view.difficulty}/>
                </div>}
            </div>})}
    </div>;
}

interface IconPlaceholderProps extends React.HTMLAttributes<HTMLDivElement> {
    width: string;
    height: string;
}

export const placeholderIcon = (props: IconPlaceholderProps): TitleIconProps => {
    const {width, height} = props;
    return {
        type: "placeholder",
        icon: undefined,
        height,
        width,
    };
};

export interface TitleIconProps extends PhyHexIconProps {
    type: "img" | "hex" | "placeholder";
    height?: string;
    width?: string;
}

export interface PageTitleProps {
    currentPageTitle: string;
    displayTitleOverride?: string;
    subTitle?: string;
    disallowLaTeX?: boolean;
    help?: ReactElement;
    className?: string;
    audienceViews?: ViewingContext[];
    preview?: boolean;
    icon?: TitleIconProps;
}
export const PageTitle = ({currentPageTitle, displayTitleOverride, subTitle, disallowLaTeX, help, className, audienceViews, preview, icon}: PageTitleProps) => {
    const dispatch = useAppDispatch();
    const openModal = useAppSelector((state: AppState) => Boolean(state?.activeModals?.length));
    const headerRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {
        if (preview) return; // Don't set the main content ID if we're in preview mode
        dispatch(mainContentIdSlice.actions.set("main-heading"));
    }, []);
    useEffect(() => {
        if (preview) return; // Don't set the document title if we're in preview mode
        document.title = currentPageTitle + " — " + SITE_TITLE;
        const element = headerRef.current;
        if (element && (window as any).followedAtLeastOneSoftLink && !openModal) {
            element.focus();
        }
    }, [currentPageTitle, preview]);

    return <h1 id="main-heading" tabIndex={-1} ref={headerRef} className={classNames("h-title h-secondary d-sm-flex", {"align-items-center py-2 mb-0": isPhy}, className)}>
        <div className="d-flex w-100" data-testid={"main-heading"}>
            {isPhy && icon && (
                icon.type === "img" ? <img src={icon.icon} alt="" height={icon.height} width={icon.width} className="me-3"/> 
                    : icon.type === "hex" ? <PhyHexIcon icon={icon.icon} subject={icon.subject} style={{"height": icon.height, "width": icon.width}}/> 
                        : icon.type === "placeholder" ? <div style={{width: icon.width, height: icon.height}}/>
                            : undefined
            )}
            <div className="d-flex flex-column justify-content-center">
                {formatPageTitle(displayTitleOverride ?? currentPageTitle, disallowLaTeX)}
                {/* in the new isaac designs, subtitles should only ever exist in the page title, not alongside this super-title */}
                {isAda && subTitle && <span className="h-subtitle d-none d-sm-block">{subTitle}</span>}
            </div>
        </div>
        <Helmet>
            <meta property="og:title" content={currentPageTitle} />
        </Helmet>
        {audienceViews && <AudienceViewer audienceViews={audienceViews} />}
        {isAda && help && <React.Fragment>
            <div id="title-help" className="title-help">Help</div>
            <UncontrolledTooltip target="#title-help" placement="bottom">{help}</UncontrolledTooltip>
        </React.Fragment>}
    </h1>;
};

export const formatPageTitle = (currentPageTitle: string, disallowLaTeX?: boolean) => <Markup encoding={disallowLaTeX ? "plaintext" : "latex"}>{currentPageTitle}</Markup>;
