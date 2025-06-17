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
import { below, isAda, isPhy, useDeviceSize } from '../../services';

interface PageMetadataProps {
    doc?: SeguePageDTO;
    title?: ReactNode;
    subtitle?: string;
    badges?: ReactNode;
    sidebarButtonText?: string;
    children?: ReactNode; // any content-type specific metadata that may require information outside of `doc`; e.g. question completion state, event info, etc.
    noTitle?: boolean; // if true, any children (usually text) will be rendered in place of the title, with any action buttons (e.g. share, print, report) rendered to the side
}

export const PageMetadata = (props: PageMetadataProps) => {
    const { doc, title, subtitle, badges, sidebarButtonText, children, noTitle } = props;
    const isQuestion = doc?.type === "isaacQuestionPage";
    const location = useLocation();
    const deviceSize = useDeviceSize();

    const ActionButtons = () => {
        return (
            <div className="d-flex gap-2 ms-auto">
                {<ShareLink linkUrl={location.pathname + location.hash} clickAwayClose />}
                <PrintButton questionPage={isQuestion} />
                {doc?.id && <ReportButton pageId={doc.id} />}
            </div>
        );
    };

    return <>
        {noTitle 
            ? <>
                <div className="d-flex align-items-start mt-3 gap-3 no-print">
                    <div>
                        {children}
                    </div>
                    <ActionButtons />
                    {isAda && <EditContentButton doc={doc} />}
                </div>
            </>
            : <>
                <div className="d-flex align-items-center mt-3 gap-3 no-print">
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
                        {doc?.subtitle && <h5><Markup encoding="latex">{subtitle ?? doc.subtitle}</Markup></h5>}
                    </div>}
                    {isAda && <EditContentButton doc={doc} />}
                    <ActionButtons />
                </div>
                {children}
            </>
        }
        {isPhy && <>
            {sidebarButtonText && below['md'](deviceSize) && <SidebarButton className="my-2" buttonTitle={sidebarButtonText}/>}
            <div className="section-divider mt-3" />
            <EditContentButton doc={doc} />
            <TeacherNotes notes={doc?.teacherNotes} />
        </>}
    </>;
};
