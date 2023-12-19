import { fireEvent, waitFor } from "@testing-library/react";
import { checkPageTitle, renderTestEnvironment } from "../utils";
import { WorkbookDownload } from "../../app/components/pages/WorkbookDownload";
import { DefaultBodyType, MockedRequest, RestHandler, rest } from "msw";
import * as actions from "../../app/state/actions";
import * as download from "../../app/components/handlers/downloadWorkbook";
import { screen } from "@testing-library/dom";
import { API_PATH } from "../../app/services";

const errorMessageSpy = jest.spyOn(actions, "showAxiosErrorToastIfNeeded");
const downloadSpy = jest.spyOn(download, "downloadWorkbook");

const getDownloadButtons = () => {
  const gcseButton = () =>
    screen.getByRole("button", {
      name: /download gcse workbook/i,
    });
  const aqaButton = () =>
    screen.getByRole("button", {
      name: /download aqa workbook/i,
    });
  const ocrButton = () =>
    screen.getByRole("button", {
      name: /download ocr workbook/i,
    });
  return { gcseButton, aqaButton, ocrButton };
};

const extraDownloadEndpoints = {
  working: [
    rest.get(API_PATH + `/documents/content/books/gcse_book_23/isaac_cs_gcse_book_2023.pdf`, (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ data: "this is a book" }));
    }),
    rest.get(API_PATH + `/documents/content/books/workbook_20_aqa/isaac_cs_aqa_book_2022.pdf`, (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ data: "this is a book" }));
    }),
    rest.get(API_PATH + `/documents/content/books/workbook_20_ocr/isaac_cs_ocr_book_2022.pdf`, (req, res, ctx) => {
      return res(ctx.status(200), ctx.json({ data: "this is a book" }));
    }),
  ],
  broken: [
    rest.get(API_PATH + `/documents/content/books/gcse_book_23/isaac_cs_gcse_book_2023.pdf`, (req, res, ctx) => {
      return res(
        ctx.status(404),
        ctx.json({
          responseCode: 404,
          responseCodeType: "Not Found",
          errorMessage: "Unable to locate the file: content/books/gcse_book_23/isaac_cs_gcse_book_2023.pdf.",
          bypassGenericSiteErrorPage: false,
        }),
      );
    }),
    rest.get(API_PATH + `/documents/content/books/workbook_20_ocr/isaac_cs_ocr_book_2022.pdf`, (req, res, ctx) => {
      return res(
        ctx.status(404),
        ctx.json({
          responseCode: 404,
          responseCodeType: "Not Found",
          errorMessage: "Unable to locate the file: content/books/workbook_20_ocr/isaac_cs_ocr_book_2022.pdf.",
          bypassGenericSiteErrorPage: false,
        }),
      );
    }),
    rest.get(API_PATH + `/documents/content/books/workbook_20_ocr/isaac_cs_ocr_book_2022`, (req, res, ctx) => {
      return res(
        ctx.status(404),
        ctx.json({
          responseCode: 404,
          responseCodeType: "Not Found",
          errorMessage: "Unable to locate the file: /content/books/workbook_20_ocr/isaac_cs_ocr_book_2022.",
          bypassGenericSiteErrorPage: false,
        }),
      );
    }),
  ],
};

const renderWorkbookDownload = (endpoints: RestHandler<MockedRequest<DefaultBodyType>>[]) => {
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

  it.each(buttons)("clicking on the button requests a download for the %s workbook", async (button) => {
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
  });

  it("displays an error popup if handleDownload encounters an error", async () => {
    renderWorkbookDownload(extraDownloadEndpoints.broken);
    const { gcseButton } = getDownloadButtons();
    fireEvent.click(gcseButton());
    await waitFor(() => {
      expect(errorMessageSpy).toHaveBeenCalled();
    });
  });
});
