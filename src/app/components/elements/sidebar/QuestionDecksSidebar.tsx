import React from "react";
import { useNavigate } from "react-router";
import { PageContextState } from "../../../../IsaacAppTypes";
import { PHY_NAV_SUBJECTS, ArrayElement, LEARNING_STAGE, HUMAN_STAGES, HUMAN_SUBJECTS } from "../../../services";
import { StyledTabPicker } from "../inputs/StyledTabPicker";
import { ContentSidebarProps, ContentSidebar } from "../layout/SidebarLayout";

interface QuestionDecksSidebarProps extends ContentSidebarProps {
    validStageSubjectPairs: {[subject in keyof typeof PHY_NAV_SUBJECTS]: ArrayElement<typeof PHY_NAV_SUBJECTS[subject]>[]};
    context: NonNullable<Required<PageContextState>>;
};

export const QuestionDecksSidebar = (props: QuestionDecksSidebarProps) => {
    const { validStageSubjectPairs, context, ...rest } = props;

    const navigate = useNavigate();

    const isValidStage = (stage: LEARNING_STAGE) => {
        return (validStageSubjectPairs[context.subject] as LEARNING_STAGE[]).includes(stage);
    };

    const isValidSubject = (subjectStages: LEARNING_STAGE[]) => {
        return subjectStages.includes(context.stage[0] as LEARNING_STAGE);
    };

    return <ContentSidebar buttonTitle="Switch stage/subject" {...rest}>
        <div className="section-divider"/>
        <search>
            <h5>Decks by stage</h5>
            <ul>
                {[...new Set(Object.values(validStageSubjectPairs).flat())].map((stage, index) =>
                    <li key={index}>
                        <StyledTabPicker
                            checkboxTitle={HUMAN_STAGES[stage]}
                            checked={context.stage.includes(stage)}
                            disabled={!isValidStage(stage)}
                            onClick={() => isValidStage(stage) && navigate(`/${context.subject}/${stage}/question_decks`)}
                        />
                    </li>
                )}
            </ul>
            <div className="section-divider"/>
            <h5>Decks by subject</h5>
            <ul>
                {Object.entries(validStageSubjectPairs)
                    .map(([subject, stages], index) =>
                        <li key={index}>
                            <StyledTabPicker
                                checkboxTitle={HUMAN_SUBJECTS[subject]}
                                checked={context.subject === subject}
                                disabled={!isValidSubject(stages)}
                                onClick={() => isValidSubject(stages) && navigate(`/${subject}/${context.stage}/question_decks`)}
                            />
                        </li>
                    )
                }
            </ul>
        </search>
    </ContentSidebar>;
};
