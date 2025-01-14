import React from "react";
import classNames from "classnames";
import {difficultyLabelMap, simpleDifficultyLabelMap, siteSpecific, STAGE, stageLabelMap} from "../../services";
import {DifficultyIcons} from "./svg/DifficultyIcons";
import {ViewingContext} from "../../../IsaacAppTypes";
import { Difficulty } from "../../../IsaacApiTypes";

export function StageAndDifficultySummaryIcons({audienceViews, className, stack}: {
    audienceViews: ViewingContext[],
    className?: string,
    stack?: boolean,
}) {
    const difficulties: Difficulty[] = audienceViews.map(v => v.difficulty).filter(v => v !== undefined);
    return siteSpecific(
        <div className={classNames(className, "mt-1 d-inline mt-md-0")}>
            {audienceViews.map((view, i) =>
                <div key={`${view.stage} ${view.difficulty} ${view.examBoard}`} className={classNames("d-flex", {"ms-sm-3 ms-md-2": i > 0})}>
                    {view.stage && view.difficulty && view.stage !== STAGE.ALL && <div className="hierarchy-tags text-center">
                        {stageLabelMap[view.stage] + " " + simpleDifficultyLabelMap[view.difficulty]}
                    </div>}
                    {view.difficulty && <div className="hierarchy-tags text-center ms-2">
                        <DifficultyIcons difficulty={view.difficulty} />
                    </div>}
                </div>)
            }
        </div>,
        <div className={classNames(className, "d-sm-flex flex-wrap mt-1 align-items-baseline", {"justify-content-end": !stack})}>
            <div key={`${difficulties[0]}`} className={classNames("align-self-center d-flex align-items-center")}>
                {difficulties.length > 0 && <>
                    <div className="hierarchy-tags text-center me-2">
                        {simpleDifficultyLabelMap[difficulties[0]]}
                    </div>
                    <div className="hierarchy-tags text-center">
                        <DifficultyIcons difficulty={difficulties[0]} blank classnames="mt-n1"/>
                    </div>
                </>}
            </div>
        </div>,
    );
}
