import React, {useState} from "react";
import {printingSettingsSlice, useAppDispatch} from "../../state";
import {Button} from "reactstrap";
import { IconButton } from "./AffixButton";
import { isAda, siteSpecific } from "../../services";
import classNames from "classnames";

interface PrintProps {
    questionPage?: boolean;
}

const FONT_LOAD_TIMEOUT = 2000;

// Function that goes through all fonts on the page, waits for them to load/fail, and then prints the page
async function printWithFontsReady() {

    const loads = Array.from(document.fonts).map(font => (font.status === "unloaded" ? font.load() : font.loaded ).catch(() => undefined));
    
    await Promise.race([
        Promise.all(loads).then(()=> document.fonts.ready),
        new Promise(resolve => setTimeout(resolve,FONT_LOAD_TIMEOUT)),
    ]);

    window.print();
}

export const PrintButton = ({questionPage}: PrintProps ) => {

    const [questionPrintOpen, setQuestionPrintOpen] = useState(false);
    const dispatch = useAppDispatch();

    return questionPage ?
        <div className="position-relative">
            {questionPrintOpen && <div className={classNames("action-buttons-popup-container", {"not-mobile": isAda})}>
                <div className="question-actions-link text-nowrap">
                    <Button
                        size={"sm"}
                        color={"link"}
                        title={"Print with hints"}
                        className="a-alt"
                        onClick={() => {
                            dispatch(printingSettingsSlice.actions.enableHints(true));
                            setTimeout(printWithFontsReady, 100);
                        }}
                    ><span className="visually-hidden">Print{" "}</span>With hints
                    </Button>
                    |
                    <Button
                        size={"sm"}
                        color={"link"}
                        title={"Print without hints"}
                        className="a-alt"
                        onClick={() => {
                            dispatch(printingSettingsSlice.actions.enableHints(false));
                            setTimeout(printWithFontsReady, 100);
                        }}
                    ><span className="visually-hidden">Print{" "}</span>Without hints</Button>
                </div>
            </div>}
            <IconButton
                icon={{name: "icon-print icon-color-black-hoverable", color: "white"}}
                className={classNames("w-max-content h-max-content action-button", {"not-mobile": isAda})}
                aria-label="Print page"
                title="Print page"
                color={siteSpecific("tint", "primary")}
                data-bs-theme="neutral"
                onClick={() => setQuestionPrintOpen(!questionPrintOpen)}
            />
        </div>
        :
        <IconButton
            icon={{name: "icon-print icon-color-black-hoverable", color: "white"}}
            className={classNames("w-max-content h-max-content action-button", {"not-mobile": isAda})}
            aria-label="Print page"
            title="Print page"
            color={siteSpecific("tint", "primary")}
            data-bs-theme="neutral"
            onClick={() => {
                dispatch(printingSettingsSlice.actions.enableHints(false)); 
                setTimeout(printWithFontsReady, 100);
            }}
        />;
};
