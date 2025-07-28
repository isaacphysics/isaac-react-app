import React from "react";
import { Alert, Container } from "reactstrap";
import { isPhy } from "../../services";

export const IsaacScienceMigrationBanner = () => {
    return isPhy ? <Alert color="danger" className="mb-0 border-radius-0 mx-0 no-print" fade={false}>
        <Container className="text-center">
            On August 11th 2025, all pages on <a href="https://isaacphysics.org" target="_blank">isaacphysics.org</a> will redirect to <a href="https://isaacscience.org" target="_blank">isaacscience.org</a>.
            Your account and activity will not be changing. You can <a href="https://isaacphysics.org/pages/isaacscience" target="_blank">
                read more about the move <span className="visually-hidden">to Isaac Science</span> here
            </a>.
        </Container>
    </Alert> : null;
};
