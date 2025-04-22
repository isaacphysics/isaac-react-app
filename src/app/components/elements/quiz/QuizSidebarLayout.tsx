import React, { ReactNode } from "react";
import { SidebarLayout, MainContent } from "../layout/SidebarLayout";

export const QuizSidebarLayout = ({ children } : { children: ReactNode }) =>
    <SidebarLayout className="d-flex flex-column align-items-end">
        <MainContent>
            <div className="d-flex border-top pt-2 my-2 align-items-center">
                {children}
            </div>
        </MainContent>
    </SidebarLayout>;