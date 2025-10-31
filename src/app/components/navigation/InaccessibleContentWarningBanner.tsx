import React from 'react';
import { Alert } from 'reactstrap';
import { ACCESSIBILITY_WARNINGS } from '../../services/accessibility';

export const InaccessibleContentWarningBanner = ({type}: {type: keyof typeof ACCESSIBILITY_WARNINGS}) => {
    return <Alert color="warning" className="no-print my-2">
        {ACCESSIBILITY_WARNINGS[type].description}
    </Alert>;
};
