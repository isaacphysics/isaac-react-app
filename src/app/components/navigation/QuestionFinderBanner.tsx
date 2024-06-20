import React from 'react';
import {Link} from "react-router-dom";
import * as RS from 'reactstrap';

export const QuestionFinderBanner = () => {
    return <RS.Alert color="info" className={"no-print mt-3"}>
        We&apos;ll be retiring this version of our question finder in August. You can try our improved question finder <Link to="/questions">here</Link>.
    </RS.Alert>;
};
