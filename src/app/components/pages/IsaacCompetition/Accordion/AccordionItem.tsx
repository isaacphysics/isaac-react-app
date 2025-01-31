import React, { memo } from "react";
import { Card, CardBody, CardHeader, Collapse } from "reactstrap";

type NestedStringArray = string | NestedStringArray[];
interface AccordionItemProps {
  id: string;
  title: string;
  section: NestedStringArray[];
  open: string | null;
  isLast: boolean;
  setOpenState: (id: string | undefined) => void;
}

const renderSectionContent = (section: NestedStringArray[]) => (
  <>
    {section.map((item, index) => {
      if (Array.isArray(item)) {
        return (
          <ul key={`list-${index}`}>
            {item.map((nestedItem, nestedIndex) => (
              <li key={`nested-list-item-${nestedIndex}`}>
                {typeof nestedItem === "string" && nestedItem.includes("<a") ? (
                  <span dangerouslySetInnerHTML={{ __html: nestedItem }} />
                ) : (
                  nestedItem
                )}
              </li>
            ))}
          </ul>
        );
      } else {
        return (
          <p key={`item-${index}`}>
            {typeof item === "string" && item.includes("<a") ? (
              <span dangerouslySetInnerHTML={{ __html: item }} />
            ) : (
              item
            )}
          </p>
        );
      }
    })}
  </>
);

const AccordionItem: React.FC<AccordionItemProps> = ({ id, title, section, open, isLast, setOpenState }) => {
  const headerClasses = [
    "accordion-button p-3 m-0 d-flex justify-content-between",
    id === "0" && "rounded-top",
    isLast && "rounded-bottom border-bottom-0",
    open !== id && "border-bottom border-dark",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Card eventKey={id} data-testid="accordion-item">
      <CardHeader className={headerClasses} onClick={() => setOpenState(open === id ? undefined : id)}>
        {title}
        {open === id ? (
          <img src={"/assets/chevron_up.svg"} alt="Up Icon" className="p-2" />
        ) : (
          <img src={"/assets/chevron_down.svg"} alt="Down Icon" className="p-2" />
        )}
      </CardHeader>

      <Collapse isOpen={open === id}>
        <CardBody className="p-3 bg-white border-bottom border-dark">{renderSectionContent(section)}</CardBody>
      </Collapse>
    </Card>
  );
};

export default memo(AccordionItem);
