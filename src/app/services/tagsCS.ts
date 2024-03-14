import {AbstractBaseTagService, STAGE, SUBJECTS, TAG_ID, TAG_LEVEL} from "./";
import {BaseTag} from "../../IsaacAppTypes";
import {ContentDTO} from "../../IsaacApiTypes";

const GCSE_COMING_2022 = {[STAGE.GCSE]: {comingSoonDate: "2022"}};
const GCSE_HIDDEN = {[STAGE.GCSE]: {hidden: true}};
const GCSE_NEW = {[STAGE.GCSE]: {new: true}};

export class CsTagService extends AbstractBaseTagService {
    private static readonly tagHierarchy = [TAG_LEVEL.category, TAG_LEVEL.subcategory, TAG_LEVEL.topic];
    private static readonly baseTags: BaseTag[] = [
        // Categories
        {id: TAG_ID.computerScience, title: "Computer Science"},

        // Computer science strands
        {id: TAG_ID.aiAndMachineLearning, title: "AI and machine learning", parent: TAG_ID.computerScience},
        {id: TAG_ID.dataStructuresAndAlgorithms, title: "Algorithms and data structures", parent: TAG_ID.computerScience},
        {id: TAG_ID.computerSystems, title: "Computing systems", parent: TAG_ID.computerScience},
        {id: TAG_ID.creatingMedia, title: "Creating media", parent: TAG_ID.computerScience},
        {id: TAG_ID.dataAndInformation, title: "Data and information", parent: TAG_ID.computerScience},
        {id: TAG_ID.designAndDevelopment, title: "Design and development", parent: TAG_ID.computerScience},
        {id: TAG_ID.effectiveUseOfTools, title: "Effective use of tools", parent: TAG_ID.computerScience},
        {id: TAG_ID.impactsOfDigitalTechnology, title: "Impact of technology", parent: TAG_ID.computerScience},
        {id: TAG_ID.computerNetworks, title: "Networks", parent: TAG_ID.computerScience},
        {id: TAG_ID.programming, title: "Programming", parent: TAG_ID.computerScience},
        {id: TAG_ID.cyberSecurity, title: "Safety and security", parent: TAG_ID.computerScience},
        {id: TAG_ID.theoryOfComputation, title: "Models of computation", parent: TAG_ID.computerScience, stageOverride: GCSE_HIDDEN},

        // AI and machine learning topics
        {id: TAG_ID.artificialIntelligence, title: "Artificial intelligence", parent: TAG_ID.aiAndMachineLearning, new: true},
        {id: TAG_ID.machineLearning, title: "Machine learning", parent: TAG_ID.aiAndMachineLearning, new: true},

        // Algorithms and data structures topics
        {id: TAG_ID.dataStructures, title: "Data structures", parent: TAG_ID.dataStructuresAndAlgorithms},
        {id: TAG_ID.searching, title: "Searching algorithms", parent: TAG_ID.dataStructuresAndAlgorithms},
        {id: TAG_ID.sorting, title: "Sorting algorithms", parent: TAG_ID.dataStructuresAndAlgorithms},
        {id: TAG_ID.pathfinding, title: "Pathfinding algorithms", parent: TAG_ID.dataStructuresAndAlgorithms, stageOverride: GCSE_HIDDEN},
        {id: TAG_ID.complexity, title: "Complexity", parent: TAG_ID.dataStructuresAndAlgorithms, stageOverride: GCSE_HIDDEN},
        {id: TAG_ID.computationalThinking, title: "Computational thinking", parent: TAG_ID.dataStructuresAndAlgorithms},

        // Computing systems
        {id: TAG_ID.architecture, title: "Systems architecture", parent: TAG_ID.computerSystems},
        {id: TAG_ID.booleanLogic, title: "Boolean logic", parent: TAG_ID.computerSystems},
        {id: TAG_ID.memoryAndStorage, title: "Memory and storage", parent: TAG_ID.computerSystems},
        {id: TAG_ID.compression, title: "Compression", parent: TAG_ID.computerSystems},
        {id: TAG_ID.operatingSystems, title: "Operating systems", parent: TAG_ID.computerSystems},
        {id: TAG_ID.programmingLanguages, title: "Programming languages", parent: TAG_ID.computerSystems},
        {id: TAG_ID.translators, title: "Translators", parent: TAG_ID.computerSystems},
        {id: TAG_ID.numberRepresentation, title: "Representation of numbers", parent: TAG_ID.computerSystems},
        {id: TAG_ID.textRepresentation, title: "Representation of text", parent: TAG_ID.computerSystems},

        // Creating media topics
        {id: TAG_ID.imageRepresentation, title: "Representation of images", parent: TAG_ID.creatingMedia},
        {id: TAG_ID.soundRepresentation, title: "Representation of sound", parent: TAG_ID.creatingMedia},

        // Data and information topics
        {id: TAG_ID.fileOrganisation, title: "File organisation", parent: TAG_ID.dataAndInformation, stageOverride: GCSE_HIDDEN},
        {id: TAG_ID.databases, title: "Databases", parent: TAG_ID.dataAndInformation},
        {id: TAG_ID.sql, title: "SQL", parent: TAG_ID.dataAndInformation},
        {id: TAG_ID.bigData, title: "Big Data", parent: TAG_ID.dataAndInformation, stageOverride: GCSE_HIDDEN},

        // Design and development topics
        {id: TAG_ID.softwareEngineeringPrinciples, title: "Software engineering principles", parent: TAG_ID.designAndDevelopment, stageOverride: GCSE_HIDDEN},
        {id: TAG_ID.programDesign, title: "Program design", parent: TAG_ID.designAndDevelopment},
        {id: TAG_ID.testing, title: "Testing", parent: TAG_ID.designAndDevelopment},
        {id: TAG_ID.softwareProject, title: "Software projects (coursework)", parent: TAG_ID.designAndDevelopment, stageOverride: GCSE_HIDDEN},

        // Effective use of tools topics
        {id: TAG_ID.hardware, title: "Hardware", parent: TAG_ID.effectiveUseOfTools},
        {id: TAG_ID.software, title: "Software", parent: TAG_ID.effectiveUseOfTools},

        // Impacts of technology topics
        {id: TAG_ID.impactsOfTech, title: "Impacts and consequences", parent: TAG_ID.impactsOfDigitalTechnology},
        {id: TAG_ID.legislation, title: "Legislation", parent: TAG_ID.impactsOfDigitalTechnology},

        // Networks topics
        {id: TAG_ID.communication, title: "Communication systems", parent: TAG_ID.computerNetworks, stageOverride: GCSE_HIDDEN},
        {id: TAG_ID.networking, title: "Network fundamentals", parent: TAG_ID.computerNetworks},
        {id: TAG_ID.theInternet, title: "The internet", parent: TAG_ID.computerNetworks},
        {id: TAG_ID.webTechnologies, title: "Web technologies", parent: TAG_ID.computerNetworks, stageOverride: GCSE_HIDDEN},

        // Programming topics
        {id: TAG_ID.programmingConcepts, title: "Programming concepts", parent: TAG_ID.programming},
        {id: TAG_ID.subroutines, title: "Subroutines", parent: TAG_ID.programming},
        {id: TAG_ID.stringHandling, title: "String handling", parent: TAG_ID.programming},
        {id: TAG_ID.files, title: "File handling", parent: TAG_ID.programming},
        {id: TAG_ID.recursion, title: "Recursion", parent: TAG_ID.programming, stageOverride: GCSE_HIDDEN},
        {id: TAG_ID.proceduralProgramming, title: "Procedural programming", parent: TAG_ID.programming},
        {id: TAG_ID.objectOrientedProgramming, title: "Object-oriented programming (OOP)", parent: TAG_ID.programming},
        {id: TAG_ID.eventDrivenProgramming, title: "Event-driven programming", parent: TAG_ID.programming},
        {id: TAG_ID.functionalProgramming, title: "Functional programming", parent: TAG_ID.programming, stageOverride: GCSE_HIDDEN},

        // Safety and security topics
        {id: TAG_ID.socialEngineering, title: "Social engineering", parent: TAG_ID.cyberSecurity},
        {id: TAG_ID.maliciousCode, title: "Malicious software", parent: TAG_ID.cyberSecurity},
        {id: TAG_ID.security, title: "Network security", parent: TAG_ID.cyberSecurity},
        {id: TAG_ID.encryption, title: "Encryption", parent: TAG_ID.cyberSecurity},

        // Models of computation topics
        {id: TAG_ID.machinesWithMemory, title: "Machines with memory", parent: TAG_ID.theoryOfComputation, stageOverride: GCSE_HIDDEN},
        {id: TAG_ID.mathsForCs, title: "Maths for computer science", parent: TAG_ID.theoryOfComputation, stageOverride: GCSE_HIDDEN}
    ];
    public getTagHierarchy() {return CsTagService.tagHierarchy;}
    public getBaseTags() {return CsTagService.baseTags;}
    public augmentDocWithSubject<T extends ContentDTO>(doc: T) {
        return {...doc, subjectId: SUBJECTS.CS};
    }
}
