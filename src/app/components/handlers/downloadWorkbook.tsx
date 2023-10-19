import { api } from "../../services";
import { AppDispatch, showAxiosErrorToastIfNeeded } from "../../state";

export const downloadWorkbook = async (dispatch: AppDispatch, workbookType: "GCSE" | "AQA" | "OCR") => {
  try {
    const pdfLocation = {
      GCSE: "content/books/gcse_book_23/isaac_cs_gcse_book_2023.pdf",
      AQA: "content/books/workbook_20_aqa/isaac_cs_aqa_book_2022.pdf",
      OCR: "content/books/workbook_20_ocr/isaac_cs_ocr_book_2022.pdf",
    };
    const workbook = await api.documents.getWorkbooks(pdfLocation[workbookType]);
    const blob = new Blob([workbook.data], { type: "application/pdf" });
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = `isaac_cs_${workbookType}_book.pdf`;
    a.click();
    URL.revokeObjectURL(blobUrl);
  } catch (e) {
    dispatch(showAxiosErrorToastIfNeeded("Workbook download failed", e));
  }
};
