import React from "react";
import classNames from "classnames";
import {simpleDifficultyLabelMap, siteSpecific, STAGE, stageLabelMap} from "../../services";
import {DifficultyIcons} from "./svg/DifficultyIcons";
import {ViewingContext} from "../../../IsaacAppTypes";
import { Difficulty } from "../../../IsaacApiTypes";
import { Spacer } from "./Spacer";

interface StageAndDifficultySummaryIconsProps {
    audienceViews: ViewingContext[],
    className?: string,
    iconClassName?: string,
    stack?: boolean,
}

export const StageAndDifficultySummaryIcons = (props: StageAndDifficultySummaryIconsProps) => {
    const {audienceViews, className, iconClassName, stack} = props;
    const difficulties: Difficulty[] = audienceViews.map(v => v.difficulty).filter(v => v !== undefined);
    return siteSpecific(
        <div className={classNames(className, "d-flex flex-column")}>
            {audienceViews.map((view, i) =>
                <span key={`${view.stage} ${view.difficulty} ${view.examBoard}`} className="d-flex w-100 hierarchy-tags text-center">
                    {view.stage && view.stage !== STAGE.ALL && stageLabelMap[view.stage] + " "}
                    {view.difficulty && <>
                        {simpleDifficultyLabelMap[view.difficulty]}
                        <Spacer/>
                        <DifficultyIcons className={classNames("d-inline-block ps-1", iconClassName)} difficulty={view.difficulty} />
                    </>}
                </span>
            )}
        </div>,
        <div className={classNames(className, "d-sm-flex flex-wrap mt-1 align-items-baseline", {"justify-content-end": !stack})}>
            <div key={`${difficulties[0]}`} className={classNames("align-self-center d-flex align-items-center")}>
                {difficulties.length > 0 && <>
                    <div className="hierarchy-tags text-center me-2">
                        {simpleDifficultyLabelMap[difficulties[0]]}
                    </div>
                    <div className="hierarchy-tags text-center">
                        <DifficultyIcons difficulty={difficulties[0]} blank className="mt-n1"/>
                    </div>
                </>}
            </div>
        </div>,
    );
}
