import React from "react";
import classNames from "classnames";
import {isAda, isPhy, siteSpecific, STAGE, stageLabelMap} from "../../services";
import {DifficultyIcons} from "./svg/DifficultyIcons";
import {ViewingContext} from "../../../IsaacAppTypes";

export function StageAndDifficultySummaryIcons({audienceViews}: {audienceViews: ViewingContext[]}) {
    return <div className={classNames("mt-1", {"d-flex": isAda, "d-sm-flex mt-md-0": isPhy})}>
        {audienceViews.map((view, i) =>
            <div key={`${view.stage} ${view.difficulty} ${view.examBoard}`} className={classNames("d-flex align-self-center", {[siteSpecific("ml-sm-3 ml-md-2", "ml-3")]: i > 0, "d-md-block": isPhy})}>
                {view.stage && view.stage !== STAGE.ALL && <div className="hierarchy-tags text-center">
                    {stageLabelMap[view.stage]}
                </div>}
                {view.difficulty && <div className={classNames("hierarchy-tags text-center ml-2", {"ml-md-0": isPhy})}>
                    <DifficultyIcons difficulty={view.difficulty} />
                </div>}
            </div>)
        }
    </div>
}
