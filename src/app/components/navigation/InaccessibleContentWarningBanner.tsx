import React from 'react';
import { Alert } from 'reactstrap';
import { ACCESSIBILITY_WARNINGS, useDragAndDropAccessibility } from '../../services/accessibility';
import { Spacer } from '../elements/Spacer';
import { selectors, useAppSelector } from '../../state';
import { StyledCheckbox } from '../elements/inputs/StyledCheckbox';
import classNames from 'classnames';
import { siteSpecific } from '../../services';
import StyledToggle from '../elements/inputs/StyledToggle';

export const DragAndDropInputModeToggle = ({className}: {className?: string}) => {
    const { dragAndDropEnabled, toggleDragAndDropEnabled } = useDragAndDropAccessibility();

    return siteSpecific(<div className={classNames("no-print d-flex flex-column align-items-center w-min-content", className)}>
        <span>Question input mode</span>
        <Spacer />
        <StyledToggle
            checked={dragAndDropEnabled}
            falseLabel="Dropdown"
            trueLabel="Drag and drop"
            onChange={(e) => {toggleDragAndDropEnabled(); e.stopPropagation();}}
        />
    </div>,
    <div className={classNames("no-print", className)}>
        <StyledCheckbox checked={!dragAndDropEnabled} onChange={toggleDragAndDropEnabled} label={<span className="text-muted">Use dropdowns for drag and drop questions</span>} /> 
    </div>
    );
};

export const InaccessibleContentWarningBanner = ({type}: {type: keyof typeof ACCESSIBILITY_WARNINGS}) => {
    const pageContainsClozeOrDragAndDropQuestion = useAppSelector(selectors.questions.includesClozeOrDragAndDropQuestion);

    return <Alert color="warning" className="no-print d-flex align-items-center my-2">
        {ACCESSIBILITY_WARNINGS[type].description}
        {pageContainsClozeOrDragAndDropQuestion && <>
            <Spacer/>
            <DragAndDropInputModeToggle/>
        </>}
    </Alert>;
};
