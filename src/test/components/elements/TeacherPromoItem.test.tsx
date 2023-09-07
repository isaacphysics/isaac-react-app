import React from "react";
import { render } from "@testing-library/react";
import { TeacherPromoItem } from "../../../app/components/elements/TeacherPromoItem";
import { mockPromoPods } from "../../../mocks/data";

describe("TeacherPromoItem", () => {
  it("renders without crashing if 'item' is undefined", () => {
    const { container } = render(<TeacherPromoItem item={undefined} />);
    expect(container).toBeDefined();
  });

  it("renders the NewsCard when 'item' is defined", () => {
    const mockItem = mockPromoPods.results[0];

    const { getByText } = render(<TeacherPromoItem item={mockItem} />);
    expect(getByText(mockItem.title)).toBeInTheDocument();
    expect(getByText(mockItem.subtitle)).toBeInTheDocument();
  });
});
