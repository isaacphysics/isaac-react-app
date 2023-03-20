import React, {ReactElement, useEffect, useRef} from "react";
import {Button, UncontrolledTooltip} from "reactstrap";
import {
    AUDIENCE_DISPLAY_FIELDS,
    filterAudienceViewsByProperties,
    isAda,
    isPhy,
    SITE_TITLE,
    STAGE,
    stageLabelMap,
    useUserContext
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

function AudienceViewer({audienceViews}: {audienceViews: ViewingContext[]}) {
    const userContext = useUserContext();
    const viewsWithMyStage = audienceViews.filter(vc => vc.stage === userContext.stage);
    // If there is a possible audience view that is correct for our user context, show that specific one
    const viewsToUse = viewsWithMyStage.length > 0 ? viewsWithMyStage.slice(0, 1) : audienceViews;
    const filteredViews = filterAudienceViewsByProperties(viewsToUse, AUDIENCE_DISPLAY_FIELDS);

    return <div className="h-subtitle pt-sm-0 mb-sm-0 d-sm-flex">
        {filteredViews.map((view, i) => <div key={`${view.stage} ${view.difficulty} ${view.examBoard}`} className={classNames("d-flex d-sm-block", {"ml-sm-2": i > 0})}>
            {view.stage && view.stage !== STAGE.ALL && <div className={classNames("text-center align-self-center", {"font-weight-regular": isAda})}>
                {stageLabelMap[view.stage]}
            </div>}
            {view.difficulty && <div className={"ml-2 ml-sm-0 text-center"}>
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

    useEffect(() => {dispatch(mainContentIdSlice.actions.set("main-heading"));}, []);
    useEffect(() => {
        document.title = currentPageTitle + " — " + SITE_TITLE;
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
        <div className="mr-auto" data-testid={"main-heading"}>
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