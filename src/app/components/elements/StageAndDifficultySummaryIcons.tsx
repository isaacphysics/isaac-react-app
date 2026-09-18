import React from "react";
import classNames from "classnames";
import {isAda, simpleDifficultyLabelMap, siteSpecific, STAGE, STAGE_TO_LEARNING_STAGE, stageLabelMap} from "../../services";
import {DifficultyIcons} from "./svg/DifficultyIcons";
import {PageContextState, ViewingContext} from "../../../IsaacAppTypes";
import { Difficulty } from "../../../IsaacApiTypes";
import { Spacer } from "./Spacer";

interface StageAndDifficultySummaryIconsProps {
    audienceViews: ViewingContext[];
    pageContext?: PageContextState,
    className?: string,
    iconClassName?: string,
    stack?: boolean,
    spacerWidth?: number,
}

// audienceViews contains info about the difficulties for each stage;
// pageContext contains info about which stages are displayed. if not provided, assume all stages are displayed.
export const StageAndDifficultySummaryIcons = (props: StageAndDifficultySummaryIconsProps) => {
    const {audienceViews, pageContext, className, iconClassName, stack, spacerWidth} = props;
    const difficulties: Difficulty[] = audienceViews.map(v => v.difficulty).filter(v => v !== undefined);

    const audienceViewsForPageContext = pageContext?.stage
        ? audienceViews.filter(v => v.stage && STAGE_TO_LEARNING_STAGE[v.stage] && pageContext.stage!.includes(STAGE_TO_LEARNING_STAGE[v.stage]!))
        : audienceViews;

    // Prefer Core over Advanced if both are present
    const adaStage = isAda && (audienceViews.some(v => v.stage === STAGE.CORE) ? STAGE.CORE : 
        audienceViews.some(v => v.stage === STAGE.ADVANCED) ? STAGE.ADVANCED : undefined);

    return siteSpecific(
        <div className={classNames(className, "d-flex flex-column")}>
            {audienceViewsForPageContext.map((view) =>
                <span key={`${view.stage} ${view.difficulty} ${view.examBoard}`} className="d-flex w-100 hierarchy-tags text-center">
                    {view.stage && view.stage !== STAGE.ALL && stageLabelMap[view.stage] + " "}
                    {view.difficulty && <>
                        {simpleDifficultyLabelMap[view.difficulty]}
                        <Spacer width={spacerWidth}/>
                        <DifficultyIcons className={classNames("d-inline-block ps-1", iconClassName)} difficulty={view.difficulty} />
                    </>}
                </span>
            )}
        </div>,
        <div className={classNames(className, "d-sm-flex flex-wrap align-items-baseline", {"justify-content-end": !stack})}>
            <div key={`${difficulties[0]}`} className={classNames("align-self-center d-flex align-items-center")}>
                {difficulties.length > 0 && <>
                    <div className="hierarchy-tags text-center text-nowrap me-2">
                        {!!adaStage && stageLabelMap[adaStage] + ": "}
                        {simpleDifficultyLabelMap[difficulties[0]]}
                    </div>
                    <div className="hierarchy-tags text-center">
                        <DifficultyIcons difficulty={difficulties[0]} blank className="mt-n1"/>
                    </div>
                </>}
            </div>
        </div>,
    );
};
