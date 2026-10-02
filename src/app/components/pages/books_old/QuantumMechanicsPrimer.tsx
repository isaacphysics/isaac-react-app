import {Col, Container} from "reactstrap";
import React from "react";
import {TitleAndBreadcrumb} from "../../elements/TitleAndBreadcrumb";
import {PageFragment} from "../../elements/PageFragment";
import { useTranslation } from "react-i18next";

export const QuantumMechanicsPrimer = () => {
    const { t } = useTranslation();

    return <Container className="physics">
        <Col>
            <div className="book-intro">
                <TitleAndBreadcrumb className="mb-7" currentPageTitle={t("common:quantumMechanicsPrimer.title")} />
                <PageFragment fragmentId="quantum_mechanics_primer_intro"/>
            </div>
        </Col>
    </Container>;
};
