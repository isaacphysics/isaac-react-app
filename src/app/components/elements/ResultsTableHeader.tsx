import React, {Dispatch, ReactNode, SetStateAction, useContext} from "react";
import { AssignmentProgressPageSettingsContext } from "../../../IsaacAppTypes";
import { isAda, isPhy } from "../../services";
import { ICON, passMark } from "./quiz/QuizProgressCommon";
import { Label } from "reactstrap";
import { StyledCheckbox } from "./inputs/StyledCheckbox";
import { Spacer } from "./Spacer";
import classNames from "classnames";
import { CollapsibleContainer } from "./CollapsibleContainer";
import StyledToggle from "./inputs/StyledToggle";
import { useTranslation } from "react-i18next";

const AssignmentProgressSettings = () => {
    const { t } = useTranslation();
    const assignmentProgressContext = useContext(AssignmentProgressPageSettingsContext);

    return <div className="d-flex w-100 flex-column flex-md-row content-metadata-container my-0 align-items-stretch align-items-md-center px-4 px-sm-5 px-md-0 pb-3">
        <div className="d-flex flex-row flex-md-column flex-grow-1 align-items-center py-2 py-md-0">
            <span>{t("common:progress.settings.displayModeLabel")}</span>
            <Spacer />
            <StyledToggle falseLabel={t("common:progress.settings.fractionsOption")} trueLabel={t("common:progress.settings.percentagesOption")}
                checked={assignmentProgressContext?.formatAsPercentage}
                onChange={(e) => assignmentProgressContext?.setFormatAsPercentage?.(e.currentTarget.checked)}
            />
        </div>

        {isPhy && <div className="d-flex flex-row flex-md-column flex-grow-1 align-items-center py-2 py-md-0">
            <span>{t("sci:progress.settings.colourBlindLabel")}</span>
            <Spacer />
            <StyledToggle falseLabel={t("common:progress.settings.offOption")} trueLabel={t("common:progress.settings.onOption")}
                checked={assignmentProgressContext?.colourBlind}
                onChange={(e) => assignmentProgressContext?.setColourBlind?.(e.currentTarget.checked)}
            />
        </div>}

        {isPhy && <div className="d-flex flex-row flex-md-column flex-grow-1 align-items-center py-2 py-md-0">
            <span>{t("sci:progress.settings.completionModeLabel")}</span>
            <Spacer />
            <StyledToggle trueLabel={t("common:progress.legend.correct")} falseLabel={t("common:progress.settings.attemptedOption")}
                checked={assignmentProgressContext?.attemptedOrCorrect === "CORRECT"}
                onChange={(e) => assignmentProgressContext?.setAttemptedOrCorrect?.(e.currentTarget.checked ? "CORRECT" : "ATTEMPTED")}
            />
        </div>}
    </div>;
};

const LegendKey = ({cellClass, description}: {cellClass: string, description?: string}) => {
    return <li className="d-flex flex-row flex-md-column flex-lg-row flex-wrap px-1 py-1 py-md-2 justify-content-start justify-content-md-center align-items-center">
        <div className="key-cell d-flex me-2 me-md-0 me-lg-2"><span className={cellClass}/></div>
        {description && <div className="key-description">{description}</div>}
    </li>;
};

const AssignmentProgressLegend = () => {
    const { t } = useTranslation();
    const context = useContext(AssignmentProgressPageSettingsContext);
    const key = "key-progress-legend";

    return <div className="mb-2">
        <Label htmlFor={key} className="mt-2">{t("common:progress.legend.title")}</Label>
        <div className="d-flex flex-row flex-sm-column justify-content-between">
            {context?.attemptedOrCorrect === "CORRECT" 
                ? <ul id={key} className="block-grid-xs-1 block-grid-sm-2 block-grid-md-5 flex-grow-1 pe-2 ps-0 ps-sm-2 m-0">
                    <LegendKey cellClass="completed" description={t("common:progress.legend.fullCorrect")}/>
                    <LegendKey cellClass="passed" description={t("common:progress.legend.passedCorrect", { passPercentage: passMark * 100 })}/>
                    <LegendKey cellClass="in-progress" description={t("common:progress.legend.inProgressCorrect", { failThresholdPercentage: 100 - passMark * 100 })}/>
                    <LegendKey cellClass="failed" description={t("common:progress.legend.failedCorrect", { failThresholdPercentage: 100 - passMark * 100 })}/>
                    <LegendKey cellClass="" description={t("common:progress.legend.notAttempted")}/>
                </ul>
                : <ul id={key} className="block-grid-xs-1 block-grid-sm-2 block-grid-md-4 flex-grow-1 pe-2 ps-0 ps-sm-2 m-0">
                    <LegendKey cellClass="fully-attempted" description={t("common:progress.legend.fullAttempted")}/>
                    <LegendKey cellClass="passed" description={t("common:progress.legend.passedAttempted", { passPercentage: passMark * 100 })}/>
                    <LegendKey cellClass="in-progress" description={t("common:progress.legend.inProgressAttempted", { failThresholdPercentage: 100 - passMark * 100 })}/>
                    <LegendKey cellClass="" description={t("common:progress.legend.failedAttempted", { failThresholdPercentage: 100 - passMark * 100 })}/>
                </ul>
            }
        </div>
    </div>;
};


const AdaAssignmentProgressKey = ({isAssignment}: {isAssignment?: boolean}) => {
    const { t } = useTranslation();
    const context = useContext(AssignmentProgressPageSettingsContext);

    const KeyItem = ({icon, label}: {icon: React.ReactNode, label: string}) => (
        <span className="d-flex align-items-center w-max-content gap-2 fw-bold">
            {icon} {label}
        </span>
    );

    return <div className={classNames("d-flex flex-column column-gap-4 row-gap-2", isAssignment ? "flex-md-row align-items-md-center" : "flex-sm-row align-items-sm-center")}>
        <span className="d-inline d-lg-none d-xl-inline font-size-1 fw-bold">{t("common:progress.key.label")}</span>
        {context?.attemptedOrCorrect === "CORRECT"
            ? <>
                <div className="d-flex flex-column flex-sm-row flex-md-col column-gap-4 row-gap-2">
                    <KeyItem icon={ICON.correct} label={t("common:progress.legend.correct")} />
                    {isAssignment && <KeyItem icon={ICON.partial} label={t("common:progress.legend.partiallyCorrect")} />}
                </div>
                <div className="d-flex flex-column flex-sm-row flex-md-col column-gap-4 row-gap-2">
                    <KeyItem icon={ICON.incorrect} label={t("common:progress.legend.incorrect")} />
                    <KeyItem icon={ICON.notAttempted} label={t("common:progress.legend.notAttempted")} />
                </div>
            </>
            : <>
                <div className="d-flex flex-column flex-md-row column-gap-4 row-gap-2">
                    <KeyItem icon={ICON.correct} label={t("common:progress.legend.fullyAttempted")} />
                    {isAssignment && <KeyItem icon={ICON.partial} label={t("common:progress.legend.partiallyAttempted")} />}
                    <KeyItem icon={ICON.notAttempted} label={t("common:progress.legend.notAttempted")} />
                </div>
            </>
        }
    </div>;
};

interface ResultsTableHeaderProps {
    headerText: ReactNode;
    settingsVisible: boolean;
    setSettingsVisible: Dispatch<SetStateAction<boolean>>;
    isAssignment?: boolean;
    showLegend?: boolean;
};

export const ResultsTableHeader = ({headerText, settingsVisible, setSettingsVisible, isAssignment, showLegend}: ResultsTableHeaderProps) => {
    const { t } = useTranslation();
    const assignmentProgressContext = useContext(AssignmentProgressPageSettingsContext);

    return <>
        <div className={classNames("d-flex", {"mb-3": isPhy})}>
            {headerText}
            <Spacer />
            {isPhy && <button onClick={() => setSettingsVisible(o => !o)} className="d-flex align-items-center bg-transparent gap-2 invert-underline">
                {settingsVisible ? t("common:progress.settings.hideButton") : t("common:progress.settings.showButton")}
                <i className={classNames("icon icon-cog anim-rotate-45", {"active": settingsVisible})}/>
            </button>}
        </div>

        <div className={"d-flex flex-column flex-lg-row row-gap-2 my-2"}>
            {isPhy && <CollapsibleContainer expanded={settingsVisible} className="w-100">
                <AssignmentProgressSettings />
            </CollapsibleContainer>}

            {isAda && <>
                <StyledCheckbox checked={assignmentProgressContext?.formatAsPercentage}
                    onChange={(e) => assignmentProgressContext?.setFormatAsPercentage?.(e.currentTarget.checked)}
                    label={<span className="text-muted">{t("ada:progress.settings.showPercentagesLabel")}</span>}
                />
                <Spacer />
                {showLegend && <AdaAssignmentProgressKey isAssignment={isAssignment} />}
            </>}
        </div>

        {isPhy && showLegend && <AssignmentProgressLegend/>}
    </>;
};
