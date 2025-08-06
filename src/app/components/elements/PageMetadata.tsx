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

type PageMetadataProps = {
    doc?: SeguePageDTO;
    title?: ReactNode;
    subtitle?: string;
    badges?: ReactNode;
    children?: ReactNode; // any content-type specific metadata that may require information outside of `doc`; e.g. question completion state, event info, etc.
    noTitle?: boolean; // if true, any children (usually text) will be rendered in place of the title, with any action buttons (e.g. share, print, report) rendered to the side
    helpModalId?: string;
} & (
    {
        showSidebarButton: true;
        sidebarButtonText?: string;
        sidebarInTitle?: boolean; // if true, the sidebar button will be rendered in the title area, otherwise it will be rendered below the title. incompatible with `noTitle`.
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

const ActionButtons = ({location, isQuestion, helpModalId, doc, ...rest}: ActionButtonsProps) => {
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

export const PageMetadata = (props: PageMetadataProps) => {
    const { doc, title, subtitle, badges, children, noTitle, helpModalId, showSidebarButton, sidebarButtonText, sidebarInTitle } = props;
    const isQuestion = doc?.type === "isaacQuestionPage";
    const isConcept = doc?.type === "isaacConceptPage";
    const location = useLocation();
    const deviceSize = useDeviceSize();

    return <>
        {noTitle 
            ? <>
                <div className={classNames("d-flex align-items-start gap-3 no-print", {"mt-3": isPhy})}>
                    <div className="w-100">
                        <ActionButtons 
                            location={location} isQuestion={isQuestion} helpModalId={helpModalId} doc={doc}
                            className="float-end ms-3 mb-3"
                        />
                        {children}
                    </div>
                </div>
                {isAda && <EditContentButton doc={doc} />}
            </>
            : <>
                {isPhy && showSidebarButton && sidebarInTitle && below['md'](deviceSize) && <SidebarButton buttonTitle={sidebarButtonText} absolute />}
                <div className={classNames("d-flex align-items-center gap-3", {"mt-3": isPhy})}>
                    {isPhy && <div>
                        <div className="d-flex align-items-center gap-3">
                            <h3 className="text-theme-dark">
                                {title 
                                    ? typeof title === "string"
                                        ? <Markup encoding="latex">{title}</Markup>
                                        : title
                                    : <Markup encoding="latex">{doc?.title}</Markup>
                                }
                            </h3>
                            {badges}
                        </div>
                        {(subtitle || doc?.subtitle) && <h5><Markup encoding="latex">{subtitle ?? doc?.subtitle}</Markup></h5>}
                    </div>}
                    {isAda && <EditContentButton doc={doc} />}
                    <ActionButtons location={location} isQuestion={isQuestion} helpModalId={helpModalId} doc={doc} className="ms-auto"/>
                </div>
                {children}
            </>
        }
        {isPhy && <>
            {showSidebarButton && !sidebarInTitle && below['md'](deviceSize) && <SidebarButton className="my-2" buttonTitle={sidebarButtonText}/>}
            <div className={classNames("section-divider my-3", {"no-print": noTitle || (showSidebarButton && sidebarInTitle)})} />
            <div className="d-flex">
                <EditContentButton doc={doc} />
                {isConcept && <UserContextPicker className="flex-grow-1"/>}
            </div>
            <TeacherNotes notes={doc?.teacherNotes} />
        </>}
    </>;
};
