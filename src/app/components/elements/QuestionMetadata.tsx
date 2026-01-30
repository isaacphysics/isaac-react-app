import React from "react";
import { Col } from "reactstrap";
import { IsaacQuestionPageDTO } from "../../../IsaacApiTypes";
import { DocumentSubject, ViewingContext } from "../../../IsaacAppTypes";
import { stageLabelMap, difficultyShortLabelMap, isPhy, TAG_ID, tags } from "../../services";
import { MetadataContainer } from "./panels/MetadataContainer";
import { StageAndDifficultySummaryIcons } from "./StageAndDifficultySummaryIcons";
import { ACCESSIBILITY_WARNINGS, getAccessibilityTags, useAccessibilitySettings } from "../../services/accessibility";

function getTags(docTags?: string[]) {
    if (!isPhy) {
        return [];
    }
    if (!docTags) return [];

    return tags.getByIdsAsHierarchy(docTags as TAG_ID[])
        .map(tag => ({title: tag.title}));
}

interface QuestionMetaDataProps {
    doc: IsaacQuestionPageDTO & DocumentSubject;
    audienceViews: ViewingContext[];
    allQuestionsCorrect: boolean;
    allQuestionsAttempted: boolean;
    anyQuestionAttempted: boolean;
}

export const QuestionMetaData = (props: QuestionMetaDataProps) => {
    const {doc, allQuestionsCorrect, allQuestionsAttempted, anyQuestionAttempted, audienceViews} = props;
    const accessibilitySettings = useAccessibilitySettings();
    const accessibilityTags = getAccessibilityTags(doc?.tags);

    return <>
        <MetadataContainer className="d-flex flex-wrap row no-print question-metadata">
            <Col className="d-flex flex-column mw-max-content" id="metadata-subject-topics">
                <span>Subject & topics</span>
                <div className="d-flex align-items-center">
                    <i className="icon icon-hexagon-bullet me-2"/>
                    {getTags(doc.tags).map((tag, index, arr) => <React.Fragment key={tag.title}>
                        <span key={tag.title} className="text-theme">{tag.title}</span>
                        {index !== arr.length - 1 && <span className="mx-2">|</span>}
                    </React.Fragment>)}
                </div>
            </Col>
            <Col className="d-flex flex-column mw-max-content" id="metadata-status">
                <span>Status</span>
                {allQuestionsCorrect
                    ? <div className="d-flex align-items-center"><span className="icon icon-raw icon-correct me-2"/> Correct</div>
                    : allQuestionsAttempted
                        // uncomment the lines below if reusing this logic elsewhere!
                        // ? isPhy
                        ? <div className="d-flex align-items-center"><span className="icon icon-raw icon-attempted me-2"/> All attempted (some errors)</div>
                        // : <div className="d-flex align-items-center"><span className="icon icon-raw icon-incorrect me-2"/> Incorrect</div>
                        : anyQuestionAttempted
                            ? <div className="d-flex align-items-center"><span className="icon icon-raw icon-in-progress me-2"/> In progress</div>
                            : <div className="d-flex align-items-center"><span className="icon icon-raw icon-not-started me-2"/> Not started</div>
                }
            </Col>
            <Col className="d-flex flex-column mw-max-content" id="metadata-stage-difficulty">
                <span>Stage & difficulty</span>
                <StageAndDifficultySummaryIcons audienceViews={audienceViews} iconClassName="ps-2" stack/>
            </Col>
            {accessibilitySettings?.SHOW_INACCESSIBLE_WARNING && accessibilityTags.length > 0 && <Col className="d-flex flex-column mw-max-content" id="metadata-accessibility">
                <span>Accessibility warnings</span>
                <div className="d-flex flex-column">
                    {accessibilityTags.map(tag => <div key={tag} className="d-flex align-items-center mb-1">
                        <i className={`icon ${ACCESSIBILITY_WARNINGS[tag].icon} me-2`}/>
                        <span>{ACCESSIBILITY_WARNINGS[tag].label}</span>
                    </div>)}
                </div>
            </Col>}
        </MetadataContainer>

        {/* One-line version of the question metadata, only used for printing */}
        <div className="only-print">
            <div className="d-flex my-2">
                <span className="me-2 fw-bold">Subject & topics:</span>
                <div>
                    {getTags(doc.tags).map((tag, index, arr) => <React.Fragment key={tag.title}>
                        <span key={tag.title}> {tag.title} </span>
                        {index !== arr.length - 1 && <span className="mx-1">|</span>}
                    </React.Fragment>)}
                </div>
                <span className="ms-5 me-2 fw-bold">Stage & difficulty:</span>
                <div>
                    {audienceViews.map(((view, i, arr) => 
                        view.stage && view.difficulty && <span key={`${view.stage} ${view.difficulty}`}>
                            {stageLabelMap[view.stage]} {difficultyShortLabelMap[view.difficulty]}
                            {i !== arr.length - 1 && <span className="me-1">,</span>}
                        </span>))}
                </div>
            </div>
        </div>
    </>;
};
