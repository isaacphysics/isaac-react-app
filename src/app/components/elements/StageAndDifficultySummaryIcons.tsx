import React from "react";
import classnames from "classnames";
import {STAGE, stageLabelMap} from "../../services";
import {DifficultyIcons} from "./svg/DifficultyIcons";
import {ViewingContext} from "../../../IsaacAppTypes";

export function StageAndDifficultySummaryIcons({audienceViews}: {audienceViews: ViewingContext[]}) {
    return <div className="d-sm-flex mt-1 mt-md-0">
        {audienceViews.map((view, i) =>
            <div key={`${view.stage} ${view.difficulty} ${view.examBoard}`} className={"d-flex d-md-block align-self-center " + classnames({"ml-sm-3 ml-md-2" : i > 0})}>
                {view.stage && view.stage !== STAGE.ALL && <div className="hierarchy-tags text-center">
                    {stageLabelMap[view.stage]}
                </div>}
                {view.difficulty && <div className="hierarchy-tags text-center ml-2 ml-md-0">
                    <DifficultyIcons difficulty={view.difficulty} />
                </div>}
            </div>)
        }
    </div>
}
