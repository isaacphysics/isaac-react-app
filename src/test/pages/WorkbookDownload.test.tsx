import { fireEvent, waitFor } from "@testing-library/react";
import {
  checkPageTitle,
  extraDownloadEndpoints,
  getDownloadButtons,
  renderTestEnvironment,
} from "../utils";
import { WorkbookDownload } from "../../app/components/pages/WorkbookDownload";
import { DefaultBodyType, MockedRequest, RestHandler } from "msw";
import * as actions from "../../app/state/actions";
import * as download from "../../app/components/handlers/downloadWorkbook";

const errorMessageSpy = jest.spyOn(actions, "showAxiosErrorToastIfNeeded");
const downloadSpy = jest.spyOn(download, "downloadWorkbook");

const renderWorkbookDownload = (
  endpoints: RestHandler<MockedRequest<DefaultBodyType>>[]
) => {
  renderTestEnvironment({
    role: "TEACHER",
    PageComponent: WorkbookDownload,
    initialRouteEntries: ["/workbook-download"],
    extraEndpoints: endpoints,
  });
};

const buttons = ["GCSE", "OCR", "AQA"];

describe("WorkbookDownload Component", () => {
  it("renders the buttons", () => {
    renderWorkbookDownload(extraDownloadEndpoints.working);
    checkPageTitle("Isaac CS Workbook PDF Downloader");
    const { gcseButton, aqaButton, ocrButton } = getDownloadButtons();
    [gcseButton(), aqaButton(), ocrButton()].forEach((button) => {
      expect(button).toBeInTheDocument();
    });
  });

  it.each(buttons)(
    "clicking on the button requests a download for the %s workbook",
    async (button) => {
      renderWorkbookDownload(extraDownloadEndpoints.working);
      const { gcseButton, aqaButton, ocrButton } = getDownloadButtons();
      const buttonElement = {
        GCSE: gcseButton(),
        AQA: aqaButton(),
        OCR: ocrButton(),
      }[button];
      buttonElement && fireEvent.click(buttonElement);
      await waitFor(() => {
        expect(downloadSpy).toHaveBeenCalledWith(expect.any(Function), button);
      });
    }
  );

  it("displays an error popup if handleDownload encounters an error", async () => {
    renderWorkbookDownload(extraDownloadEndpoints.broken);
    const { gcseButton } = getDownloadButtons();
    fireEvent.click(gcseButton());
    await waitFor(() => {
      expect(errorMessageSpy).toHaveBeenCalled();
    });
  });
});
