import {CsTagService, PhysicsTagService, siteSpecific} from "./";

const subjectSpecificTagService = siteSpecific(PhysicsTagService, CsTagService);
export const tags = new subjectSpecificTagService();
