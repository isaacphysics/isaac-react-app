import React from "react";
import { Col, Container, Row } from "reactstrap";
import { Route, withRouter } from "react-router-dom";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import { Redirect, RouteComponentProps } from "react-router";
import { Tabs } from "../elements/Tabs";
import { history, isDefined } from "../../services";
import { fromPairs } from "lodash";
import { PageFragment } from "../elements/PageFragment";
import { NotFound } from "./NotFound";
import { MetaDescription } from "../elements/MetaDescription";

type SupportType = "student" | "teacher" | "tutor";

interface Params {
  type?: SupportType;
  category?: string;
}

interface SupportCategories {
  title: string;
  categories: {
    [category: string]: {
      category: string;
      title: string;
      icon: string;
    };
  };
}

const support: { student: SupportCategories; teacher: SupportCategories; tutor?: SupportCategories } = {
  student: {
    title: "Student support",
    categories: {
      general: { category: "general", title: "General questions", icon: "faq" },
      homework: { category: "homework", title: "Finding homework", icon: "faq" },
      code: { category: "code", title: "Code and pseudocode", icon: "faq" },
    },
  },
  teacher: {
    title: "Teacher support",
    categories: {
      general: { category: "general", title: "General questions", icon: "faq" },
      assignments: { category: "assignments", title: "Assigning work", icon: "faq" },
      progress: { category: "progress", title: "Viewing student progress", icon: "faq" },
      code: { category: "code", title: "Code and pseudocode", icon: "faq" },
    },
  },
};

function supportPath(type?: string, category?: string) {
  return `/support/${type || "student"}/${category || "general"}`;
}

export const SupportPageComponent = ({
  match: {
    params: { type, category },
  },
}: RouteComponentProps<Params>) => {
  if (type == undefined) {
    return <Redirect to={supportPath()} />;
  }

  if (category == undefined) {
    return <Redirect to={supportPath(type)} />;
  }

  const section = support[type];

  if (section == undefined) {
    return <Route component={NotFound} />;
  }

  const categoryNames = Object.keys(section.categories);
  const categoryIndex = categoryNames.indexOf(category);

  if (categoryIndex == -1) {
    return <Route component={NotFound} />;
  }

  function activeTabChanged(tabIndex: number) {
    history.push(supportPath(type, categoryNames[tabIndex - 1]));
  }

  function tabTitleClass(tabName: string, tabIndex: number) {
    return "support-tab-" + section?.categories[categoryNames[tabIndex - 1]].icon;
  }

  const metaDescriptionMap = {
    student:
      "Got a question about our GCSE and A Level Computer Science online learning programme? Read our student FAQs.",
    teacher:
      "Got a question about our GCSE and A Level Computer Science online learning programme? Read our teacher FAQs.",
  };

  return (
    <Container>
      <Row>
        <Col>
          <TitleAndBreadcrumb currentPageTitle={section.title} />
          {isDefined(type) && type !== "tutor" && <MetaDescription description={metaDescriptionMap[type]} />}
        </Col>
      </Row>
      <Row>
        <Col className="pt-4 pb-5">
          <Tabs
            activeTabOverride={categoryIndex + 1}
            onActiveTabChange={activeTabChanged}
            tabTitleClass={tabTitleClass}
            tabContentClass="pt-4"
          >
            {fromPairs(
              Object.values(section.categories).map((category) => {
                // eslint-disable-next-line react/jsx-key
                return [category.title, <PageFragment fragmentId={`support_${type}_${category.category}`} />];
              }),
            )}
          </Tabs>
        </Col>
      </Row>
    </Container>
  );
};

export const Support = withRouter(SupportPageComponent);
