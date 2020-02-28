import {SITE, SITE_SUBJECT} from "./siteConstants";
import {PhysicsTagService} from "./tagsPhy";
import {CsTagService} from "./tagsCS";

const subjectSpecificTagService = {[SITE.PHY]: PhysicsTagService, [SITE.CS]: CsTagService}[SITE_SUBJECT];
export default new subjectSpecificTagService();
