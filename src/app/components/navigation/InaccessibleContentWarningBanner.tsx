import React from 'react';
import { Alert } from 'reactstrap';

export const InaccessibleContentWarningBanner = () => {
    return <Alert color="warning" className="no-print mt-3">
        This content may be difficult to access through non-visual means.
    </Alert>;
};
