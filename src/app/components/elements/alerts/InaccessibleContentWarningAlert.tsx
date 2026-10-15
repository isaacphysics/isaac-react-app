import React from 'react';
import { Alert } from 'reactstrap';
import { ACCESSIBILITY_WARNINGS, useDragAndDropAccessibility } from '../../../services/accessibility';
import { Spacer } from '../Spacer';
import { selectors, useAppSelector } from '../../../state';
import StyledToggle from '../inputs/StyledToggle';
import { isAda, isLoggedIn } from '../../../services';
import { useTranslation } from "react-i18next";

export const DragAndDropInputModeToggle = () => {
    const { t } = useTranslation();
    const { dragAndDropEnabled, toggleDragAndDropEnabled } = useDragAndDropAccessibility();

    return <div className="input-mode-toggle">
        <span>{t("common:accessibility.inputModeTitle")}</span>
        <Spacer />
        <StyledToggle
            checked={dragAndDropEnabled}
            falseLabel={t("common:accessibility.dropdownLabel")}
            trueLabel={t("common:accessibility.dragAndDropLabel")}
            onChange={(e) => {toggleDragAndDropEnabled(); e.stopPropagation();}}
        />
    </div>;
};

export const InaccessibleContentWarningAlert = ({type}: {type: keyof typeof ACCESSIBILITY_WARNINGS}) => {
    const pageContainsClozeOrDragAndDropQuestion = useAppSelector(selectors.questions.includesClozeOrDragAndDropQuestion);
    const user = useAppSelector(selectors.user.orNull);

    return <Alert color="warning" className="no-print d-flex align-items-center my-2">
        <div className="d-flex">
            {isAda && <i className={`icon icon-md ${ACCESSIBILITY_WARNINGS[type].icon} icon-access-visual icon-color-black me-2 mb-1`} />}
            {ACCESSIBILITY_WARNINGS[type].description}
        </div>
        <Spacer/>
        {/* Logged-out users cannot enable accessibility settings, so require a per-question page toggle instead */}
        {!isLoggedIn(user) && pageContainsClozeOrDragAndDropQuestion && type === "access:motor" &&
            <div className="d-none d-sm-flex ms-1 mt-1 mt-sm-0">
                <DragAndDropInputModeToggle/>
            </div>
        }
    </Alert>;
};
