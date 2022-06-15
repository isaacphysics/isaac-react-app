import {siteSpecific} from "./siteConstants";
import {PhysicsTagService} from "./tagsPhy";
import {CsTagService} from "./tagsCS";

const subjectSpecificTagService = siteSpecific(PhysicsTagService, CsTagService);
export default new subjectSpecificTagService();
