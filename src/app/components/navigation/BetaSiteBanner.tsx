import React from 'react';
import {Alert, Container} from 'reactstrap';
import {Link} from "react-router-dom";
import {isPhy} from "../../services";

export const BetaSiteBanner = () => {

    return isPhy ? <Alert color="warning" className="mb-0 border-radius-0 mx-0 no-print" fade={false}>
        <Container className="text-center">
                 This site is still under construction.
            You can <a href="https://isaacphysics.org/pages/isaacscience" target="_blank">
                learn more about our redesign <span className="visually-hidden">(in a new tab)</span>
            </a>,
            or <Link to="/contact?subject=Isaac%20Science">give us any feedback here</Link>.
        </Container>
    </Alert> : null;
};
