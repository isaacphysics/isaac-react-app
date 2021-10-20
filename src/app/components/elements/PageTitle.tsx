import React, {ReactElement, useEffect, useRef} from "react";
import {UncontrolledTooltip} from "reactstrap";
import {SITE, SITE_SUBJECT, SITE_SUBJECT_TITLE} from "../../services/siteConstants";
import {setMainContentId} from "../../state/actions";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../../state/reducers";
import {LaTeX} from "./LaTeX";
import {ViewingContext} from "../../../IsaacAppTypes";
import {AUDIENCE_DISPLAY_FIELDS, filterAudienceViewsByProperties, useUserContext} from "../../services/userContext";
import {difficultyLabelMap, STAGE, stageLabelMap} from "../../services/constants";

function AudienceViewer({audienceViews}: {audienceViews: ViewingContext[]}) {
    const userContext = useUserContext();
    const viewsWithMyStage = audienceViews.filter(vc => vc.stage === userContext.stage);
    // If there is a possible audience view that is correct for our user context, show that specific one
    const viewsToUse = viewsWithMyStage.length > 0 ? viewsWithMyStage.slice(0, 1) : audienceViews;
    const filteredViews = filterAudienceViewsByProperties(viewsToUse, AUDIENCE_DISPLAY_FIELDS);

    return <span className="float-right h-subtitle">
        {filteredViews.map(view => <div key={`${view.stage} ${view.difficulty} ${view.examBoard}`}>
            {view.stage && view.stage !== STAGE.ALL && <span>
                {stageLabelMap[view.stage]}
            </span>}
            {SITE_SUBJECT === SITE.PHY && view.difficulty && " - "}
            {SITE_SUBJECT === SITE.PHY && view.difficulty && <span>
                {difficultyLabelMap[view.difficulty]}
            </span>}
        </div>)}
    </span>;
}

export interface PageTitleProps {
    currentPageTitle: string;
    subTitle?: string;
    help?: string | ReactElement;
    className?: string;
    audienceViews?: ViewingContext[];
}
export const PageTitle = ({currentPageTitle, subTitle, help, className, audienceViews}: PageTitleProps) => {
    const dispatch = useDispatch();
    const openModal = useSelector((state: AppState) => Boolean(state?.activeModals?.length));
    const headerRef = useRef<HTMLHeadingElement>(null);

    useEffect(() => {dispatch(setMainContentId("main-heading"));}, []);
    useEffect(() => {
        document.title = currentPageTitle + " — Isaac " + SITE_SUBJECT_TITLE;
        const element = headerRef.current;
        if (element && (window as any).followedAtLeastOneSoftLink && !openModal) {
            element.focus();
        }
    }, [currentPageTitle]);

    return <h1 id="main-heading" tabIndex={-1} ref={headerRef} className={`h-title h-secondary${className ? ` ${className}` : ""}`}>
        <LaTeX markup={currentPageTitle} />
        {audienceViews && <AudienceViewer audienceViews={audienceViews} />}
        {help && <span id="title-help">Help</span>}
        {help && <UncontrolledTooltip target="#title-help" placement="bottom">{help}</UncontrolledTooltip>}
        {subTitle && <span className="h-subtitle d-none d-sm-block">{subTitle}</span>}
    </h1>
};
