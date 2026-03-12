import React, { ReactNode } from 'react';
import { ShareLink } from './ShareLink';
import { PrintButton } from './PrintButton';
import { ReportButton } from './ReportButton';
import { SeguePageDTO } from '../../../IsaacApiTypes';
import { Markup } from './markup';
import { EditContentButton } from './EditContentButton';
import { TeacherNotes } from './TeacherNotes';
import { useLocation } from 'react-router';
import { SidebarButton } from './SidebarButton';
import { HelpButton } from './HelpButton';
import { above, below, isAda, isPhy, useDeviceSize } from '../../services';
import type { Location } from 'history';
import classNames from 'classnames';
import { UserContextPicker } from './inputs/UserContextPicker';
import { LLMFreeTextQuestionIndicator } from './LLMFreeTextQuestionIndicator';
import { CrossTopicQuestionIndicator } from './CrossTopicQuestionIndicator';
import { selectors, useAppSelector } from '../../state';

type PageMetadataProps = {
    doc?: SeguePageDTO;
    title?: ReactNode;
    subtitle?: string;
    badges?: ReactNode;
    children?: ReactNode; // any content-type specific metadata that may require information outside of `doc`; e.g. question completion state, event info, etc.
    noTitle?: boolean; // if true, any children (usually text) will be rendered in place of the title, with any action buttons (e.g. share, print, report) rendered to the side
    helpModalId?: string;
    pageContainsLLMFreeTextQuestion?: boolean;
} & (
    {
        showSidebarButton: true;
        sidebarButtonText?: string;
        sidebarInTitle?: boolean; // if true, the sidebar button will be rendered in the title area, otherwise it will be rendered below the title. best for pages with absolutely no content at the top. incompatible with `noTitle`.
    } | {
        showSidebarButton?: never;
        sidebarButtonText?: never;
        sidebarInTitle?: never;
    }
);

interface ActionButtonsProps extends React.HTMLAttributes<HTMLDivElement> {
    location: Location;
    isQuestion: boolean;
    helpModalId?: string;
    doc?: SeguePageDTO;
}

export const ActionButtons = ({location, isQuestion, helpModalId, doc, ...rest}: ActionButtonsProps) => {
    const deviceSize = useDeviceSize();

    const anyActionButtonShown = isPhy && helpModalId || above['sm'](deviceSize) || doc?.id;

    return anyActionButtonShown && <div {...rest} className={classNames("d-flex no-print gap-2", rest.className)}>
        {isPhy && helpModalId && <HelpButton modalId={helpModalId} />}
        {above['sm'](deviceSize) && <>
            <ShareLink linkUrl={location.pathname + location.hash} clickAwayClose />
            {doc && <PrintButton questionPage={isQuestion} />} {/* don't show print for internal (non content-driven) pages */}
        </>}
        {doc?.id && <ReportButton pageId={doc.id} />}
    </div>;
};

interface TagStackProps extends React.HTMLAttributes<HTMLDivElement> {
    doc?: SeguePageDTO;
}

const TagStack = ({doc, className}: TagStackProps) => {
    const isCrossTopic = doc?.tags?.includes("cross_topic");
    const pageContainsLLMFreeTextQuestion = useAppSelector(selectors.questions.includesLLMFreeTextQuestion);

    return <div className={className}>
        {(isCrossTopic || pageContainsLLMFreeTextQuestion) && <div className="d-lg-flex align-items-center gap-3 me-3">
            {isAda && isCrossTopic && <CrossTopicQuestionIndicator/>}
            {pageContainsLLMFreeTextQuestion && <LLMFreeTextQuestionIndicator/>}
        </div>}
        <EditContentButton doc={doc}/>
    </div>;
};

interface MetadataTitleProps {
    doc?: SeguePageDTO;
    title: ReactNode;
    subtitle?: string;
    badges?: ReactNode;
}

const MetadataTitle = ({doc, title, subtitle, badges}: MetadataTitleProps) => {
    return <div>
        <h3 className="text-theme-dark d-xl-flex align-items-center gap-3">
            {title 
                ? typeof title === "string"
                    ? <Markup encoding="latex">{title}</Markup>
                    : title
                : <Markup encoding="latex">
                    {doc?.title}
                </Markup>
            }
            <div className="d-flex flex-wrap gap-2 mt-1">
                {badges}
            </div>
        </h3>
        {(subtitle || doc?.subtitle) && <h5><Markup encoding="latex">{subtitle ?? doc?.subtitle}</Markup></h5>}
    </div>;
};

export const PageMetadata = (props: PageMetadataProps) => {
    const { doc, title, subtitle, badges, children, noTitle, helpModalId, showSidebarButton, sidebarButtonText, sidebarInTitle } = props;
    const isQuestion = doc?.type === "isaacQuestionPage";
    const isConcept = doc?.type === "isaacConceptPage";
    const location = useLocation();
    const deviceSize = useDeviceSize();
    const actionButtonsFloat = noTitle && children;

    return <>
        {isPhy && showSidebarButton && sidebarInTitle && below['md'](deviceSize) && <SidebarButton buttonTitle={sidebarButtonText} absolute/>}
        <div className="page-metadata">
            {isPhy && <div className={classNames("title-action-bar", {"d-flex align-items-center": !actionButtonsFloat})}>
                {actionButtonsFloat && <ActionButtons location={location} isQuestion={isQuestion} helpModalId={helpModalId} doc={doc} className="float-end ms-3 mb-2"/>}
                {noTitle ? children : <MetadataTitle doc={doc} title={title} subtitle={subtitle} badges={badges}/>}
                {!actionButtonsFloat && <ActionButtons location={location} isQuestion={isQuestion} helpModalId={helpModalId} doc={doc} className={classNames("ms-auto", {"mb-auto": !noTitle && badges})}/>}
            </div>}

            {isAda && <div className={classNames("title-action-bar", {"d-flex align-items-end": !children})}>
                {children && <ActionButtons location={location} isQuestion={isQuestion} helpModalId={helpModalId} doc={doc} className="float-end ms-3 mb-3"/>}
                <TagStack doc={doc} className={classNames({"mb-3": children, "d-flex align-items-end": !children})}/>
                {children}
                {!children && <ActionButtons location={location} isQuestion={isQuestion} helpModalId={helpModalId} doc={doc} className="ms-auto"/>}
            </div>}

            {isPhy && !noTitle && children}

            {isPhy && <div className={classNames("section-divider my-3", {"no-print": noTitle || (showSidebarButton && sidebarInTitle)})}/>}

            <div className="d-flex align-items-end">
                {isPhy && <TagStack doc={doc} className="d-flex align-items-end gap-3"/>}
                {isConcept && <UserContextPicker className={classNames("flex-grow-1", {"mt-3": isAda})}/>}
            </div>

            {isPhy && <TeacherNotes notes={doc?.teacherNotes} />}
        </div>
        {isPhy && showSidebarButton && !sidebarInTitle && below['md'](deviceSize) && <SidebarButton className="my-2" buttonTitle={sidebarButtonText}/>}
    </>;
};
