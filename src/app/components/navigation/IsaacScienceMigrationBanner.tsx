import React from "react";
import { Alert, Container } from "reactstrap";
import { isPhy } from "../../services";

export const IsaacScienceMigrationBanner = () => {
    return isPhy ? <Alert color="danger" className="mb-0 border-radius-0 mx-0 no-print" fade={false}>
        <Container className="text-center">
            On August 11th 2025, all pages on Isaac Physics will redirect to the new <a href="https://isaacscience.org" target="_blank">Isaac Science</a> platform.
            You can log in with the same account, and all progress, boards and groups have been maintained.
            You can <a href="https://isaacphysics.org/pages/isaacscience" target="_blank">
                learn more about these changes here <span className="visually-hidden">(opens in a new tab)</span>
            </a>.
        </Container>
    </Alert> : null;
};
