import React from "react";
import AccordionItem from "./AccordionItem";

interface AccordionProps {
  sections: {
    id: string;
    title: string;
    section: (string | string[])[];
  }[];
  open: string | null;
  setOpenState: (id: string | undefined) => void;
}

const Accordion = ({ sections, open, setOpenState }: AccordionProps) => {
  return (
    <div className="accordion accordion-body">
      {sections.map(({ id, title, section }, index) => (
        <AccordionItem
          key={id}
          id={id}
          title={title}
          section={section}
          open={open}
          isLast={index === sections.length - 1}
          setOpenState={setOpenState}
        />
      ))}
    </div>
  );
};

export default Accordion;
