import {AbstractBaseTagService, STAGE, SUBJECTS, TAG_ID, TAG_LEVEL} from "./";
import {BaseTag} from "../../IsaacAppTypes";
import {ContentDTO, ContentSummaryDTO} from "../../IsaacApiTypes";
import i18next from 'i18next'

const GCSE_COMING_2022 = {[STAGE.GCSE]: {comingSoonDate: "2022"}};
const GCSE_HIDDEN = {[STAGE.GCSE]: {hidden: true}};
const GCSE_NEW = {[STAGE.GCSE]: {new: true}};

export class CsTagService extends AbstractBaseTagService {
    private static readonly tagHierarchy = [TAG_LEVEL.category, TAG_LEVEL.subcategory, TAG_LEVEL.topic];
    private static readonly baseTags: BaseTag[] = [
        // Categories
        {id: TAG_ID.computerScience, title: i18next.t('computerScience', 'Computer Science')},

        // Computer science strands
        {id: TAG_ID.aiAndMachineLearning, title: i18next.t('tags.aiAndMachineLearning', 'AI and machine learning'), parent: TAG_ID.computerScience},
        {id: TAG_ID.dataStructuresAndAlgorithms, title: i18next.t('tags.algorithmsAndDataStructures', 'Algorithms and data structures'), parent: TAG_ID.computerScience},
        {id: TAG_ID.computerSystems, title: i18next.t('tags.computingSystems', 'Computing systems'), parent: TAG_ID.computerScience},
        {id: TAG_ID.creatingMedia, title: i18next.t('tags.creatingMedia', 'Creating media'), parent: TAG_ID.computerScience},
        {id: TAG_ID.dataAndInformation, title: i18next.t('tags.dataAndInformation', 'Data and information'), parent: TAG_ID.computerScience},
        {id: TAG_ID.designAndDevelopment, title: i18next.t('tags.designAndDevelopment', 'Design and development'), parent: TAG_ID.computerScience},
        {id: TAG_ID.effectiveUseOfTools, title: i18next.t('tags.effectiveUseOfTools', 'Effective use of tools'), parent: TAG_ID.computerScience},
        {id: TAG_ID.impactsOfDigitalTechnology, title: i18next.t('tags.impactOfTechnology', 'Impact of technology'), parent: TAG_ID.computerScience},
        {id: TAG_ID.computerNetworks, title: i18next.t('tags.networks', 'Networks'), parent: TAG_ID.computerScience},
        {id: TAG_ID.programming, title: i18next.t('tags.programming', 'Programming'), parent: TAG_ID.computerScience},
        {id: TAG_ID.cyberSecurity, title: i18next.t('tags.safetyAndSecurity', 'Safety and security'), parent: TAG_ID.computerScience},
        {id: TAG_ID.theoryOfComputation, title: i18next.t('tags.modelsOfComputation', 'Models of computation'), parent: TAG_ID.computerScience, stageOverride: GCSE_HIDDEN},
        {id: TAG_ID.projects, title: i18next.t('tags.softwareProjects', 'Software projects'), parent: TAG_ID.computerScience},


        // AI and machine learning topics
        {id: TAG_ID.artificialIntelligence, title: i18next.t('tags.artificialIntelligence', 'Artificial intelligence'), parent: TAG_ID.aiAndMachineLearning},
        {id: TAG_ID.machineLearning, title: i18next.t('tags.machineLearning', 'Machine learning'), parent: TAG_ID.aiAndMachineLearning},

        // Algorithms and data structures topics
        {id: TAG_ID.dataStructures, title: i18next.t('tags.dataStructures', 'Data structures'), parent: TAG_ID.dataStructuresAndAlgorithms},
        {id: TAG_ID.searching, title: i18next.t('tags.searchingAlgorithms', 'Searching algorithms'), parent: TAG_ID.dataStructuresAndAlgorithms},
        {id: TAG_ID.sorting, title: i18next.t('tags.sortingAlgorithms', 'Sorting algorithms'), parent: TAG_ID.dataStructuresAndAlgorithms},
        {id: TAG_ID.pathfinding, title: i18next.t('tags.pathfindingAlgorithms', 'Pathfinding algorithms'), parent: TAG_ID.dataStructuresAndAlgorithms, stageOverride: GCSE_HIDDEN},
        {id: TAG_ID.complexity, title: i18next.t('tags.complexity', 'Complexity'), parent: TAG_ID.dataStructuresAndAlgorithms, stageOverride: GCSE_HIDDEN},
        {id: TAG_ID.computationalThinking, title: i18next.t('tags.computationalThinking', 'Computational thinking'), parent: TAG_ID.dataStructuresAndAlgorithms},

        // Computing systems
        {id: TAG_ID.architecture, title: i18next.t('tags.systemsArchitecture', 'Systems architecture'), parent: TAG_ID.computerSystems},
        {id: TAG_ID.booleanLogic, title: i18next.t('tags.booleanLogic', 'Boolean logic'), parent: TAG_ID.computerSystems},
        {id: TAG_ID.memoryAndStorage, title: i18next.t('tags.memoryAndStorage', 'Memory and storage'), parent: TAG_ID.computerSystems},
        {id: TAG_ID.compression, title: i18next.t('tags.compression', 'Compression'), parent: TAG_ID.computerSystems},
        {id: TAG_ID.operatingSystems, title: i18next.t('tags.operatingSystems', 'Operating systems'), parent: TAG_ID.computerSystems},
        {id: TAG_ID.programmingLanguages, title: i18next.t('tags.programmingLanguages', 'Programming languages'), parent: TAG_ID.computerSystems},
        {id: TAG_ID.translators, title: i18next.t('tags.translators', 'Translators'), parent: TAG_ID.computerSystems},
        {id: TAG_ID.numberRepresentation, title: i18next.t('tags.representationOfNumbers', 'Representation of numbers'), parent: TAG_ID.computerSystems},
        {id: TAG_ID.textRepresentation, title: i18next.t('tags.representationOfText', 'Representation of text'), parent: TAG_ID.computerSystems},

        // Creating media topics
        {id: TAG_ID.imageRepresentation, title: i18next.t('tags.representationOfImages', 'Representation of images'), parent: TAG_ID.creatingMedia},
        {id: TAG_ID.soundRepresentation, title: i18next.t('tags.representationOfSound', 'Representation of sound'), parent: TAG_ID.creatingMedia},

        // Data and information topics
        {id: TAG_ID.fileOrganisation, title: i18next.t('tags.fileOrganisation', 'File organisation'), parent: TAG_ID.dataAndInformation, stageOverride: GCSE_HIDDEN},
        {id: TAG_ID.databases, title: i18next.t('tags.databases', 'Databases'), parent: TAG_ID.dataAndInformation},
        {id: TAG_ID.sql, title: i18next.t('tags.sql', 'SQL'), parent: TAG_ID.dataAndInformation},
        {id: TAG_ID.bigData, title: i18next.t('tags.bigData', 'Big Data'), parent: TAG_ID.dataAndInformation, stageOverride: GCSE_HIDDEN},

        // Design and development topics
        {id: TAG_ID.softwareEngineeringPrinciples, title: i18next.t('tags.softwareEngineeringPrinciples', 'Software engineering principles'), parent: TAG_ID.designAndDevelopment, stageOverride: GCSE_HIDDEN},
        {id: TAG_ID.programDesign, title: i18next.t('tags.programDesign', 'Program design'), parent: TAG_ID.designAndDevelopment},
        {id: TAG_ID.testing, title: i18next.t('tags.testing', 'Testing'), parent: TAG_ID.designAndDevelopment},

        // Effective use of tools topics
        {id: TAG_ID.hardware, title: i18next.t('tags.hardware', 'Hardware'), parent: TAG_ID.effectiveUseOfTools},
        {id: TAG_ID.software, title: i18next.t('tags.software', 'Software'), parent: TAG_ID.effectiveUseOfTools},

        // Impacts of technology topics
        {id: TAG_ID.impactsOfTech, title: i18next.t('tags.impactsAndConsequences', 'Impacts and consequences'), parent: TAG_ID.impactsOfDigitalTechnology},
        {id: TAG_ID.legislation, title: i18next.t('tags.legislation', 'Legislation'), parent: TAG_ID.impactsOfDigitalTechnology},

        // Networks topics
        {id: TAG_ID.communication, title: i18next.t('tags.communicationSystems', 'Communication systems'), parent: TAG_ID.computerNetworks, stageOverride: GCSE_HIDDEN},
        {id: TAG_ID.networking, title: i18next.t('tags.networkFundamentals', 'Network fundamentals'), parent: TAG_ID.computerNetworks},
        {id: TAG_ID.theInternet, title: i18next.t('tags.theInternet', 'The internet'), parent: TAG_ID.computerNetworks},
        {id: TAG_ID.webTechnologies, title: i18next.t('tags.webTechnologies', 'Web technologies'), parent: TAG_ID.computerNetworks, stageOverride: GCSE_HIDDEN},

        // Programming topics
        {id: TAG_ID.programmingConcepts, title: i18next.t('tags.programmingConcepts', 'Programming concepts'), parent: TAG_ID.programming},
        {id: TAG_ID.subroutines, title: i18next.t('tags.subroutines', 'Subroutines'), parent: TAG_ID.programming},
        {id: TAG_ID.stringHandling, title: i18next.t('tags.stringHandling', 'String handling'), parent: TAG_ID.programming},
        {id: TAG_ID.files, title: i18next.t('tags.fileHandling', 'File handling'), parent: TAG_ID.programming},
        {id: TAG_ID.recursion, title: i18next.t('tags.recursion', 'Recursion'), parent: TAG_ID.programming, stageOverride: GCSE_HIDDEN},
        {id: TAG_ID.proceduralProgramming, title: i18next.t('tags.proceduralProgramming', 'Procedural programming'), parent: TAG_ID.programming},
        {id: TAG_ID.objectOrientedProgramming, title: i18next.t('tags.objectorientedProgrammingOop', 'Object-oriented programming (OOP)'), parent: TAG_ID.programming},
        {id: TAG_ID.eventDrivenProgramming, title: i18next.t('tags.eventdrivenProgramming', 'Event-driven programming'), parent: TAG_ID.programming},
        {id: TAG_ID.functionalProgramming, title: i18next.t('tags.functionalProgramming', 'Functional programming'), parent: TAG_ID.programming, stageOverride: GCSE_HIDDEN},

        // Safety and security topics
        {id: TAG_ID.socialEngineering, title: i18next.t('tags.socialEngineering', 'Social engineering'), parent: TAG_ID.cyberSecurity},
        {id: TAG_ID.maliciousCode, title: i18next.t('tags.maliciousSoftware', 'Malicious software'), parent: TAG_ID.cyberSecurity},
        {id: TAG_ID.security, title: i18next.t('tags.networkSecurity', 'Network security'), parent: TAG_ID.cyberSecurity},
        {id: TAG_ID.encryption, title: i18next.t('tags.encryption', 'Encryption'), parent: TAG_ID.cyberSecurity},

        // Models of computation topics
        {id: TAG_ID.machinesWithMemory, title: i18next.t('tags.machinesWithMemory', 'Machines with memory'), parent: TAG_ID.theoryOfComputation, stageOverride: GCSE_HIDDEN},
        {id: TAG_ID.mathsForCs, title: i18next.t('tags.mathsForComputerScience', 'Maths for computer science'), parent: TAG_ID.theoryOfComputation, stageOverride: GCSE_HIDDEN},

        // Software projects topics
        {id: TAG_ID.projects_link_pseudo_project, title: i18next.t('tags.projects', 'Projects'), parent: TAG_ID.projects, new: true},
        {id: TAG_ID.aqa_nea_project, title: i18next.t('tags.aqaNeaCoursework', 'AQA NEA (coursework)'), parent: TAG_ID.projects},
        {id: TAG_ID.ocr_nea_project, title: i18next.t('tags.ocrNeaCoursework', 'OCR NEA (coursework)'), parent: TAG_ID.projects},

    ];
    public getTagHierarchy() {return CsTagService.tagHierarchy;}
    public getBaseTags() {return CsTagService.baseTags;}
    public augmentDocWithSubject<T extends ContentDTO | ContentSummaryDTO>(doc: T) {
        return {...doc, subjectId: SUBJECTS.CS};
    }
}
