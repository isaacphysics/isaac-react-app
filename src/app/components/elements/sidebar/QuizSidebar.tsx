import React from "react";
import { useLocation, useNavigate } from "react-router";
import { Row, Col } from "reactstrap";
import { QuizAttemptDTO } from "../../../../IsaacApiTypes";
import { useDeviceSize, TAG_ID, isDefined, below, isPhy } from "../../../services";
import { StyledTabPicker } from "../inputs/StyledTabPicker";
import { ContentSidebar } from "../layout/SidebarLayout";
import { SectionProgress, QuizView, QuizRubricButton } from "../quiz/QuizContentsComponent";
import { tags as tagsService } from "../../../services";
import { Pill, KeyItem } from "./SidebarElements";

interface QuizSidebarProps {
    viewingAsSomeoneElse: boolean;
    totalSections: number;
    currentSection?: number;
    sectionStates: SectionProgress[];
    sectionTitles: string[];
}

export interface QuizSidebarAttemptProps extends QuizSidebarProps {
    attempt: QuizAttemptDTO;
    view?: undefined;
}

export interface QuizSidebarViewProps extends QuizSidebarProps {
    attempt?: undefined;
    view: QuizView;
}

export const QuizSidebar = (props: QuizSidebarAttemptProps | QuizSidebarViewProps) => {
    const { attempt, view, viewingAsSomeoneElse, totalSections, currentSection, sectionStates, sectionTitles} = props;
    const deviceSize = useDeviceSize();
    const navigate = useNavigate();
    const location = useLocation();
    const rubricPath =
        viewingAsSomeoneElse ? location.pathname.split("/").slice(0, 6).join("/") :
            attempt && attempt.feedbackMode ? location.pathname.split("/").slice(0, 5).join("/") :
                location.pathname.split("/page")[0];
    const hasSections = totalSections > 0;
    const tags = attempt ? attempt.quiz?.tags : view.quiz?.tags;
    const subjects = tagsService.getSubjectTags(tags as TAG_ID[]);
    const topics = tagsService.getTopicTags(tags as TAG_ID[]);
    const fields = tagsService.getFieldTags(tags as TAG_ID[]);
    const topicsAndFields = (topics.length + fields.length) > 0 ? [...topics, ...fields] : [{id: 'na', title: "N/A", alias: undefined}];

    const progressIcon = (section: number) => {
        return sectionStates[section] === SectionProgress.COMPLETED ? "icon icon-raw icon-correct"
            : sectionStates[section] === SectionProgress.STARTED ? "icon icon-raw icon-in-progress"
                : "icon icon-raw icon-not-started";
    };

    const switchToPage = (page: string) => {
        if (viewingAsSomeoneElse || attempt && attempt.feedbackMode) {
            void navigate(rubricPath.concat("/", page));
        }
        else {
            void navigate(rubricPath.concat("/page/", page));
        }
    };

    const SidebarContents = () => {
        return <ContentSidebar buttonTitle={hasSections ? "Sections" : "Details"}>
            <div className="section-divider"/>
            <h5 className="mb-3">Test</h5>
            <div className="mb-2">
                Subject{subjects?.length > 1 && "s"}:
                <ul className="d-inline ms-1">{subjects.map(s => <li className="d-inline" key={s.id}><Pill title={s.title} theme={s.id}/></li>)}</ul>
            </div>
            <div className="mb-2">
                Topic{topicsAndFields?.length > 1 && "s"}:
                <ul className="d-inline ms-1">{topicsAndFields.map(e => <li className="d-inline" key={e.id}><Pill title={e.alias ?? e.title} theme="neutral"/></li>)}</ul>
            </div>

            {hasSections && <>
                <div className="section-divider"/>
                <h5 className="mb-3">Sections</h5>
                <ul>
                    <li>
                        <StyledTabPicker checkboxTitle={"Overview"} checked={!isDefined(currentSection)} onClick={() => navigate(rubricPath)}/>
                    </li>
                    {Array.from({length: totalSections}, (_, i) => i).map(section =>
                        <li key={section}>
                            <StyledTabPicker key={section} checkboxTitle={sectionTitles[section]} checked={currentSection === section+1} onClick={() => switchToPage(String(section+1))}
                                suffix={{icon: progressIcon(section), info: sectionStates[section]}}/>
                        </li>)}
                </ul>

                <div className="section-divider"/>

                <div className="d-flex flex-column sidebar-key">
                    Key
                    <ul>
                        <KeyItem icon="not-started" text="Section not started"/>
                        <KeyItem icon="in-progress" text="Section in progress"/>
                        <KeyItem icon="correct" text="Section completed"/>
                    </ul>
                </div>
            </>}

        </ContentSidebar>;
    };

    return <>
        {below["md"](deviceSize) && attempt && isPhy && currentSection ?
            <Row className="d-flex align-items-center">
                <Col>
                    <SidebarContents/>
                </Col>
                <Col className="d-flex justify-content-end">
                    <QuizRubricButton attempt={attempt}/>
                </Col>
            </Row> :
            <SidebarContents/>
        }
    </>;
};
