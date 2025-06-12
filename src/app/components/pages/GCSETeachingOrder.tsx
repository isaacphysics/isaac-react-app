import React, { useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { Col, Container, Row } from "reactstrap";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import { EXAM_BOARD, EXAM_BOARDS_CS_GCSE, STAGE } from "../../services";
import { PageContent } from "../elements/GeneralPage";
import { Tabs } from "../elements/Tabs";

export const GCSETeachingOrder = () => {
  const history = useHistory();
  const location = useLocation();

  const stage = STAGE.GCSE;
  const stageExamBoards = Array.from(EXAM_BOARDS_CS_GCSE).filter((board) =>
    ["aqa", "edexcel", "ocr"].includes(board.toLowerCase()),
  );
  // Tab logic for GCSE only
  const activeTab = stageExamBoards.indexOf(location.hash.replace("#", "").toLowerCase() as EXAM_BOARD) + 1 || 1;
  function setActiveTab(tabIndex: number) {
    if (tabIndex < 1 || tabIndex > stageExamBoards.length) return;
    const hash = stageExamBoards[tabIndex - 1].toString();
    history.replace({ ...location, hash: `#${hash}` });
  }
  useEffect(() => {
    if (!location.hash) setActiveTab(activeTab);
  });

  return (
    <div className="pattern-02">
      <Container>
        <TitleAndBreadcrumb currentPageTitle="GCSE teaching order" />

        <Tabs
          className="pt-3"
          tabContentClass="pt-3"
          activeTabOverride={activeTab}
          refreshHash={stage}
          onActiveTabChange={setActiveTab}
        >
          {Object.assign(
            {},
            ...stageExamBoards.map((examBoard) => ({
              [examBoard.toUpperCase()]: (
                <Row>
                  <Col lg={{ size: 8, offset: 2 }} className="bg-light-grey py-md-4">
                    <PageContent
                      pageId={
                        examBoard.toLowerCase() === "edexcel"
                          ? "40975805-b61a-4d54-bb62-95156e1f5509"
                          : `teaching_order_g_${examBoard}`
                      }
                    />
                  </Col>
                </Row>
              ),
            })),
          )}
        </Tabs>
      </Container>
    </div>
  );
};
