import React from 'react';
import { Alert } from 'reactstrap';
import { ACCESSIBILITY_WARNINGS, useDragAndDropAccessibility } from '../../../services/accessibility';
import { Spacer } from '../Spacer';
import { selectors, useAppSelector } from '../../../state';
import StyledToggle from '../inputs/StyledToggle';

export const DragAndDropInputModeToggle = () => {
    const { dragAndDropEnabled, toggleDragAndDropEnabled } = useDragAndDropAccessibility();

    return <div className="input-mode-toggle">
        <span>Question input mode</span>
        <Spacer />
        <StyledToggle
            checked={dragAndDropEnabled}
            falseLabel="Dropdown"
            trueLabel="Drag and drop"
            onChange={(e) => {toggleDragAndDropEnabled(); e.stopPropagation();}}
        />
    </div>;
};

export const InaccessibleContentWarningAlert = ({type}: {type: keyof typeof ACCESSIBILITY_WARNINGS}) => {
    const pageContainsClozeOrDragAndDropQuestion = useAppSelector(selectors.questions.includesClozeOrDragAndDropQuestion);

    return <Alert color="warning" className="no-print d-flex align-items-center my-2">
        {ACCESSIBILITY_WARNINGS[type].description}
        {pageContainsClozeOrDragAndDropQuestion && <>
            <Spacer/>
            <DragAndDropInputModeToggle/>
        </>}
    </Alert>;
};
