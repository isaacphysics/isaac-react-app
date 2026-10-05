import React, {useState} from "react";
import {AppDispatch, printingSettingsSlice, useAppDispatch} from "../../state";
import {Button} from "reactstrap";
import { IconButton } from "./AffixButton";
import { isAda, siteSpecific } from "../../services";
import classNames from "classnames";
import { Trans, useTranslation } from "react-i18next";

interface PrintProps {
    questionPage?: boolean;
}

const FONT_LOAD_TIMEOUT = 2000;

async function printWithHintsAndLoadedFonts(dispatch: AppDispatch, withHints: boolean) {
    dispatch(printingSettingsSlice.actions.enableHints(withHints));

    // Two animation frames, so that any hints we just toggled have been rendered before we look at them
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    // Ask for every font the page uses...
    const fontsInUse = new Set<string>();
    for (const element of document.body.querySelectorAll("*")) {
        const {fontStyle, fontWeight, fontFamily} = getComputedStyle(element);
        fontsInUse.add(`${fontStyle} ${fontWeight} 1em ${fontFamily}`);
    }

    //... and load them specifically
    await Promise.race([
        Promise.all(Array.from(fontsInUse, font => document.fonts.load(font).catch(() => undefined))),
        new Promise(resolve => setTimeout(resolve, FONT_LOAD_TIMEOUT)),
    ]);

    window.print();
}

export const PrintButton = ({questionPage}: PrintProps ) => {
    const { t } = useTranslation();

    const [questionPrintOpen, setQuestionPrintOpen] = useState(false);
    const dispatch = useAppDispatch();

    return questionPage ?
        <div className="position-relative">
            {questionPrintOpen && <div className={classNames("action-buttons-popup-container", {"not-mobile": isAda})}>
                <div className="question-actions-link text-nowrap">
                    <Button
                        size={"sm"}
                        color={"link"}
                        title={t("common:printButton.withHints.title")}
                        className="a-alt"
                        onClick={() => printWithHintsAndLoadedFonts(dispatch, true)}
                    ><Trans
                        i18nKey="common:printButton.withHints.label"
                        components={{
                            visuallyHidden: <span className="visually-hidden" />,
                        }}
                    />
                    </Button>
                    |
                    <Button
                        size={"sm"}
                        color={"link"}
                        title={t("common:printButton.withoutHints.title")}
                        className="a-alt"
                        onClick={() => printWithHintsAndLoadedFonts(dispatch, false)}
                    ><Trans
                        i18nKey="common:printButton.withoutHints.label"
                        components={{
                            visuallyHidden: <span className="visually-hidden" />,
                        }}
                    /></Button>
                </div>
            </div>}
            <IconButton
                icon={{name: "icon-print icon-color-black-hoverable", color: "white"}}
                className={classNames("w-max-content h-max-content action-button", {"not-mobile": isAda})}
                aria-label={t("common:printButton.ariaLabel")}
                title={t("common:printButton.title")}
                color={siteSpecific("tint", "primary")}
                data-bs-theme="neutral"
                onClick={() => setQuestionPrintOpen(!questionPrintOpen)}
            />
        </div>
        :
        <IconButton
            icon={{name: "icon-print icon-color-black-hoverable", color: "white"}}
            className={classNames("w-max-content h-max-content action-button", {"not-mobile": isAda})}
            aria-label={t("common:printButton.ariaLabel")}
            title={t("common:printButton.title")}
            color={siteSpecific("tint", "primary")}
            data-bs-theme="neutral"
            onClick={() => printWithHintsAndLoadedFonts(dispatch, false)}
        />;
};
