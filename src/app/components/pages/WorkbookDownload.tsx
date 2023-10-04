import React from "react";
import { Button, Card, CardBody, Col, Container, Row } from "reactstrap";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import { Link } from "react-router-dom";
import { AppDispatch, useAppDispatch } from "../../state";
import { downloadWorkbook } from "../handlers/downloadWorkbook";

export const WorkbookDownload = () => {
  const dispatch: AppDispatch = useAppDispatch();

  const WorkbookDownloadButton = ({
    workbookType,
  }: {
    workbookType: "GCSE" | "OCR" | "AQA";
  }) => {
    return (
      <Row className="justify-content-center">
        <Col xs={12} lg={6} className="py-2">
          <Button
            size="lg"
            onClick={() => downloadWorkbook(dispatch, workbookType)}
            color="secondary"
            block
          >
            Download {workbookType} workbook
          </Button>
        </Col>
      </Row>
    );
  };

  return (
    <Container id="workbook-download" className="mb-5">
      <TitleAndBreadcrumb currentPageTitle="Isaac CS Workbook PDF Downloader" />
      <Card className="mt-4">
        <CardBody>
          <Col>
            <Row className="pb-4">
              <p>
                Below are links to download the PDF versions of our AQA and OCR
                workbooks. These are only available to users with a Teacher
                account.
              </p>
              <p>
                If you require accessible versions of the questions please use
                the online versions, you can find them by using our new{" "}
                <Link to="/gameboards/new">Question Finder</Link>.
              </p>
            </Row>
            <Col xs={12} md={10} className="mx-auto">
              <h3>GCSE</h3>
              <WorkbookDownloadButton workbookType="GCSE" />
              <h3>A level</h3>
              <WorkbookDownloadButton workbookType="AQA" />
              <WorkbookDownloadButton workbookType="OCR" />
            </Col>
          </Col>
        </CardBody>
      </Card>
    </Container>
  );
};
