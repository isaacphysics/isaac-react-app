import React from "react";
import { useLocation, useNavigate } from "react-router";
import { Row, Col } from "reactstrap";
import { DetailedQuizSummaryDTO, IsaacQuizDTO } from "../../../../IsaacApiTypes";
import { useDeviceSize, TAG_ID, isDefined, below, isPhy } from "../../../services";
import { StyledTabPicker } from "../inputs/StyledTabPicker";
import { ContentSidebar } from "../layout/SidebarLayout";
import { SectionProgress, QuizRubricButton } from "../quiz/QuizContentsComponent";
import { tags as tagsService } from "../../../services";
import { Pill, KeyItem } from "./SidebarElements";

export interface QuizSidebarProps {
    quiz: IsaacQuizDTO | DetailedQuizSummaryDTO;
    totalSections: number;
    currentSection?: number;
    sectionStates: SectionProgress[];
    sectionTitles: string[];
}

export const QuizSidebar = (props: QuizSidebarProps) => {
    const { quiz, totalSections, currentSection, sectionStates, sectionTitles } = props;
    const deviceSize = useDeviceSize();
    const location = useLocation();

    const rubricPath = location.pathname.split(new RegExp(/\/page\/\d+/))[0]; // i.e. "/test/{view|preview|attempt|assignment}/{id}".
    const hasSections = totalSections > 0;
    const subjects = tagsService.getSubjectTags(quiz.tags as TAG_ID[]);
    const topics = tagsService.getTopicTags(quiz.tags as TAG_ID[]);
    const fields = tagsService.getFieldTags(quiz.tags as TAG_ID[]);
    const topicsAndFields = (topics.length + fields.length) > 0 ? [...topics, ...fields] : [{id: 'na', title: "N/A", alias: undefined}];

    const progressIcon = (section: number) => {
        return sectionStates[section] === SectionProgress.COMPLETED ? "icon icon-raw icon-correct"
            : sectionStates[section] === SectionProgress.STARTED ? "icon icon-raw icon-in-progress"
                : "icon icon-raw icon-not-started";
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
                <h5 className="mb-3">Section(s)</h5>
                <ul>
                    <li>
                        <StyledTabPicker type="link" checkboxTitle={"Overview"} checked={!isDefined(currentSection)} to={rubricPath} />
                    </li>
                    {Array.from({length: totalSections}, (_, i) => i).map(section =>
                        <li key={section}>
                            <StyledTabPicker 
                                key={section} type="link" checkboxTitle={sectionTitles[section]} checked={currentSection === section+1} 
                                to={`${rubricPath}/page/${section+1}`}
                                suffix={{icon: progressIcon(section), info: sectionStates[section]}}
                            />
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
        {below["md"](deviceSize) && isPhy && currentSection ?
            <Row className="d-flex align-items-center">
                <Col>
                    <SidebarContents/>
                </Col>
                <Col className="d-flex justify-content-end">
                    <QuizRubricButton rubric={quiz.rubric}/>
                </Col>
            </Row> :
            <SidebarContents/>
        }
    </>;
};
