import React, {ReactElement, useEffect, useRef} from "react";
import {Button, UncontrolledTooltip} from "reactstrap";
import {isPhy, SITE_SUBJECT_TITLE} from "../../services/siteConstants";
import {closeActiveModal, openActiveModal, setMainContentId} from "../../state/actions";
import {useAppDispatch, useAppSelector} from "../../state/store";
import {AppState} from "../../state/reducers";
import {PageFragment} from "./PageFragment";
import {ViewingContext} from "../../../IsaacAppTypes";
import {AUDIENCE_DISPLAY_FIELDS, filterAudienceViewsByProperties, useUserContext} from "../../services/userContext";
import {STAGE, stageLabelMap} from "../../services/constants";
import {DifficultyIcons} from "./svg/DifficultyIcons";
import classnames from "classnames";
import {Helmet} from "react-helmet";
import {Markup} from "./markup";

function AudienceViewer({audienceViews}: {audienceViews: ViewingContext[]}) {
    const userContext = useUserContext();
    const viewsWithMyStage = audienceViews.filter(vc => vc.stage === userContext.stage);
    // If there is a possible audience view that is correct for our user context, show that specific one
    const viewsToUse = viewsWithMyStage.length > 0 ? viewsWithMyStage.slice(0, 1) : audienceViews;
    const filteredViews = filterAudienceViewsByProperties(viewsToUse, AUDIENCE_DISPLAY_FIELDS);

    return <div className="h-subtitle pt-sm-0 mb-sm-0 d-sm-flex">
        {filteredViews.map((view, i) => <div key={`${view.stage} ${view.difficulty} ${view.examBoard}`} className={"d-flex d-sm-block"}>
            {view.stage && view.stage !== STAGE.ALL && <div className="text-center align-self-center">
                {stageLabelMap[view.stage]}
            </div>}
            {view.difficulty && <div className={"ml-2 ml-sm-0" + classnames({"mr-2": i > 0})}>
                <DifficultyIcons difficulty={view.difficulty} />
            </div>}
        </div>)}
    </div>;
}

export interface PageTitleProps {
    currentPageTitle: string;
    subTitle?: string;
    disallowLaTeX?: boolean;
    help?: ReactElement;
    className?: string;
    audienceViews?: ViewingContext[];
    modalId?: string;
}
export const PageTitle = ({currentPageTitle, subTitle, disallowLaTeX, help, className, audienceViews, modalId}: PageTitleProps) => {
    const dispatch = useAppDispatch();
    const openModal = useAppSelector((state: AppState) => Boolean(state?.activeModals?.length));
    const headerRef = useRef<HTMLHeadingElement>(null);

    const showModal = modalId && isPhy;

    useEffect(() => {dispatch(setMainContentId("main-heading"));}, []);
    useEffect(() => {
        document.title = currentPageTitle + " — Isaac " + SITE_SUBJECT_TITLE;
        const element = headerRef.current;
        if (element && (window as any).followedAtLeastOneSoftLink && !openModal) {
            element.focus();
        }
    }, [currentPageTitle]);

    interface HelpModalProps {
        modalId: string;
    }

    const HelpModal = (props: HelpModalProps) => {
        return <PageFragment fragmentId={props.modalId} ifNotFound={help}/>
    };

    function openHelpModal(modalId: string) {
        dispatch(openActiveModal({
            closeAction: () => {dispatch(closeActiveModal())},
            size: "xl",
            title: "Help",
            body: <HelpModal modalId={modalId}/>
        }))
    }

    return <h1 id="main-heading" tabIndex={-1} ref={headerRef} className={`h-title h-secondary d-sm-flex ${className ? className : ""}`}>
        <div className="mr-auto">
            {formatPageTitle(currentPageTitle, disallowLaTeX)}
            {subTitle && <span className="h-subtitle d-none d-sm-block">{subTitle}</span>}
        </div>
        <Helmet>
            <meta property="og:title" content={currentPageTitle} />
        </Helmet>
        {audienceViews && <AudienceViewer audienceViews={audienceViews} />}
        {help && !showModal && <React.Fragment>
            <div id="title-help" className="title-help">Help</div>
            <UncontrolledTooltip target="#title-help" placement="bottom">{help}</UncontrolledTooltip>
        </React.Fragment>}
        {modalId && showModal && <React.Fragment>
            <Button color="link" className="title-help title-help-modal" onClick={() => openHelpModal(modalId)}>Help</Button>
        </React.Fragment>}
    </h1>
};

export const formatPageTitle = (currentPageTitle: string, disallowLaTeX?: boolean) => <Markup encoding={disallowLaTeX ? "plaintext" : "latex"}>{currentPageTitle}</Markup>;