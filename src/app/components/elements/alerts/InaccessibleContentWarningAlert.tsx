import React from 'react';
import { Alert } from 'reactstrap';
import { ACCESSIBILITY_WARNINGS } from '../../../services/accessibility';
import { isAda } from '../../../services';

export const InaccessibleContentWarningAlert = ({type}: {type: keyof typeof ACCESSIBILITY_WARNINGS}) => {
    return <Alert color="warning" className="d-flex no-print my-2 align-items-center">
        {isAda && <i className={`icon icon-md ${ACCESSIBILITY_WARNINGS[type].icon} icon-access-visual icon-color-black me-2 mb-1`} />}
        {ACCESSIBILITY_WARNINGS[type].description}
    </Alert>;
};
