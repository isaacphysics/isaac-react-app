import React, { ReactElement, useEffect, useState } from "react";
import { Col, Container, Row } from "reactstrap";
import { Tabs } from "../elements/Tabs";
import { PageFragment } from "../elements/PageFragment";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import { MetaDescription } from "../elements/MetaDescription";

enum TEACHING_ORDER_STAGE {
    CORE_Y1 = "Core Y1",
    CORE_Y2 = "Core Y2",
    ADVANCED_Y1 = "Advanced Y1",
    ADVANCED_Y2 = "Advanced Y2"
}

const sanitiseStageTab = (stageTab: string) => stageTab.replace(" ", "_").toLowerCase();
const sanitisedStageTabsMap = Object.fromEntries(Object.keys(TEACHING_ORDER_STAGE).map(stage => [sanitiseStageTab(stage), stage]));

const getStageFromURL = () : TEACHING_ORDER_STAGE | undefined => {
    const urlStage = window.location.hash.slice(1);
    return sanitisedStageTabsMap[urlStage] as TEACHING_ORDER_STAGE | undefined;
};

export const TeachingOrders = () => {
    const TEACHING_ORDER_STAGES = Object.keys(TEACHING_ORDER_STAGE);
    const [stageTab, setStageTab] = useState<typeof TEACHING_ORDER_STAGES[number]>(getStageFromURL() || TEACHING_ORDER_STAGE.CORE_Y1);
    const [stageTabOverride, _setStageTabOverride] = useState<number | undefined>(Object.values(sanitisedStageTabsMap).indexOf(stageTab) + 1 || undefined);
    const [fragmentId, setFragmentId] = useState<string>("");

    const metaDescription = (stageTab === TEACHING_ORDER_STAGE.CORE_Y1 || stageTab === TEACHING_ORDER_STAGE.CORE_Y2)
        ? "Discover our free Core computer science topics and questions. Learn or revise for your exams with us today."
        : "Discover our free Advanced computer science topics and questions. Learn or revise for your exams with us today.";

    const tabTitlesToContent: {[title: string]: ReactElement} = {};
    for (const stageName of Object.values(TEACHING_ORDER_STAGE)) {
        tabTitlesToContent[stageName] = <></>;
    }

    const stageTabs = <Tabs style={"buttons"} className={"mt-3"} tabContentClass={"mt-3"}
        activeTabOverride={stageTabOverride}
        onActiveTabChange={(n) => {
            setStageTab(TEACHING_ORDER_STAGES[n-1]);
        }}
    >
        {tabTitlesToContent}
    </Tabs>;

    useEffect(() => {
        const sanitisedStageTab = stageTab.replace(" ", "_").toLowerCase();
        setFragmentId(`ada_teaching_order_${sanitisedStageTab}`);
        location.replace(`#${sanitisedStageTab}`);
    }, [stageTab]);

    return <Container>
        <TitleAndBreadcrumb currentPageTitle={"Suggested teaching order"} />
        <MetaDescription description={metaDescription} />
        {stageTabs}
        <Row>
            <Col lg={{size: 8, offset: 2}}>
                {fragmentId && <PageFragment fragmentId={fragmentId}/>}
            </Col>
        </Row>
    </Container>;
};
