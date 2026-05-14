import React from "react";
import {Alert, Container} from "reactstrap";
import {isPhy} from "../../services";
import { Trans } from 'react-i18next'

export const IsaacScienceMigrationBanner = () => {
    return isPhy ? <Alert color="danger" className="mb-0 border-radius-0 mx-0 no-print" fade={false}>
        <Container className="text-center"><Trans i18nKey="fromAugust11th2025AllPagesOnAHrefhttpsisaacphysicsorgTarget_blankisaacphysicsorgaWillRedirectToAHrefhttpsisaacscienceorgTarget_blankisaacscienceorgaBrYourLoginAndAccountDataWillNotChangeYouCan">From August 11th 2025, all pages on <a href="https://isaacphysics.org" target="_blank">isaacphysics.org</a> will redirect to <a href="https://isaacscience.org" target="_blank">isaacscience.org</a>.
            <br />
            Your login and account data will not change. You can</Trans><a href="https://isaacphysics.org/pages/isaacscience" target="_blank"><Trans i18nKey="readMoreAboutTheMoveSpanClassnamevisuallyhiddentoIsaacSciencespanHere">read more about the move <span className="visually-hidden">to Isaac Science</span> here</Trans></a>.
        </Container>
    </Alert> : null;
};
