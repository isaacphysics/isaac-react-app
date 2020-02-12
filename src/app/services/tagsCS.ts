import {TAG_ID, TAG_LEVEL} from "./constants";
import {BaseTag} from "../../IsaacAppTypes";

export const tagHierarchy = [TAG_LEVEL.category, TAG_LEVEL.subcategory, TAG_LEVEL.topic];

export const baseTags: BaseTag[] = [
    // Categories
    {id: TAG_ID.theory, title: "Theory"},
    {id: TAG_ID.programming, title: "Programming"},

    // Theory sub-categories
    {id: TAG_ID.gcseToALevel, title: "GCSE to A level transition", parent: TAG_ID.theory},
    {id: TAG_ID.dataAndInformation, title: "Data and information", parent: TAG_ID.theory},
    {id: TAG_ID.dataStructuresAndAlgorithms, title: "Data structures and algorithms", parent: TAG_ID.theory},
    {id: TAG_ID.computerNetworks, title: "Computer networks", parent: TAG_ID.theory},
    {id: TAG_ID.computerSystems, title: "Computer systems", parent: TAG_ID.theory},
    // Programming sub-categories
    {id: TAG_ID.programmingFundamentals, title: "Programming fundamentals", parent: TAG_ID.programming},
    {id: TAG_ID.programmingParadigms, title: "Programming paradigms", parent: TAG_ID.programming},
    {id: TAG_ID.computingPracticalProject, title: "Computing practical project", parent: TAG_ID.programming},

    // GCSE to A level transition topics
    {id: TAG_ID.gcseProgrammingConcepts, title: "Programming concepts", parent: TAG_ID.gcseToALevel},
    {id: TAG_ID.gcseDataRepresentation, title: "Data representation", parent: TAG_ID.gcseToALevel},
    {id: TAG_ID.gcseBooleanLogic, title: "Boolean logic", parent: TAG_ID.gcseToALevel},
    {id: TAG_ID.gcseSystems, title: "Systems", parent: TAG_ID.gcseToALevel},
    {id: TAG_ID.gcseNetworking, title: "Networking", parent: TAG_ID.gcseToALevel},
    // Data structures and algorithms topics
    {id: TAG_ID.dataStructures, title: "Data structures", parent: TAG_ID.dataStructuresAndAlgorithms},
    {id: TAG_ID.searchingSortingPathfinding, title: "Searching, sorting & pathfinding", parent: TAG_ID.dataStructuresAndAlgorithms},
    {id: TAG_ID.complexity, title: "Complexity", parent: TAG_ID.dataStructuresAndAlgorithms, comingSoon: 'Apr 2020'},
    {id: TAG_ID.theoryOfComputation, title: "Theory of computation (AQA)", parent: TAG_ID.dataStructuresAndAlgorithms},
    // Computer networks topics
    {id: TAG_ID.networking, title: "Networking", parent: TAG_ID.computerNetworks},
    {id: TAG_ID.networkHardware, title: "Network hardware", parent: TAG_ID.computerNetworks},
    {id: TAG_ID.theInternet, title: "The internet", parent: TAG_ID.computerNetworks},
    {id: TAG_ID.security, title: "Security", parent: TAG_ID.computerNetworks, comingSoon: 'Apr 2020'},
    {id: TAG_ID.communication, title: "Communication (AQA)", parent: TAG_ID.computerNetworks, comingSoon: 'Apr 2020'},
    // Computer systems topics
    {id: TAG_ID.booleanLogic, title: "Boolean logic", parent: TAG_ID.computerSystems},
    {id: TAG_ID.architecture, title: "Architecture", parent: TAG_ID.computerSystems, comingSoon: 'Apr 2020'},
    {id: TAG_ID.hardware, title: "Hardware", parent: TAG_ID.computerSystems, new: true},
    {id: TAG_ID.operatingSystemsAndSoftware, title: "Operating systems and software", parent: TAG_ID.computerSystems},
    {id: TAG_ID.translators, title: "Translators", parent: TAG_ID.computerSystems},
    {id: TAG_ID.programmingLanguages, title: "Programming languages", parent: TAG_ID.computerSystems},
    // Data and information topics
    {id: TAG_ID.numberSystems, title: "Number systems (AQA)", parent: TAG_ID.dataAndInformation},
    {id: TAG_ID.numberBases, title: "Number bases", parent: TAG_ID.dataAndInformation},
    {id: TAG_ID.representation, title: "Representation", parent: TAG_ID.dataAndInformation},
    {id: TAG_ID.compression, title: "Compression", parent: TAG_ID.dataAndInformation, comingSoon: 'Apr 2020'},
    {id: TAG_ID.encryption, title: "Encryption", parent: TAG_ID.dataAndInformation},
    {id: TAG_ID.databases, title: "Databases", parent: TAG_ID.dataAndInformation, comingSoon: 'Apr 2020'},
    {id: TAG_ID.bigData, title: "Big Data (AQA)", parent: TAG_ID.dataAndInformation, new: true},

    // Procedural programming topics
    {id: TAG_ID.programmingConcepts, title: "Programming concepts", parent: TAG_ID.programmingFundamentals},
    {id: TAG_ID.stringManipulation, title: "String manipulation", parent: TAG_ID.programmingFundamentals},
    {id: TAG_ID.subroutines, title: "Subroutines", parent: TAG_ID.programmingFundamentals},
    {id: TAG_ID.files, title: "Files", parent: TAG_ID.programmingFundamentals},
    {id: TAG_ID.structureAndRobustness, title: "Structure & robustness", parent: TAG_ID.programmingFundamentals, comingSoon: 'Apr 2020'},
    {id: TAG_ID.recursion, title: "Recursion", parent: TAG_ID.programmingFundamentals, new: true},
    {id: TAG_ID.guis, title: "GUIs (OCR)", parent: TAG_ID.programmingFundamentals},
    {id: TAG_ID.planningAndDebugging, title: "Planning and debugging", parent: TAG_ID.dataStructuresAndAlgorithms, comingSoon: 'Apr 2020'},
    {id: TAG_ID.softwareEngineeringPrinciples, title: "Software engineering principles", parent: TAG_ID.programmingFundamentals, comingSoon: 'Apr 2020'},
    // Programming paradigms topics:
    {id: TAG_ID.objectOrientedProgramming, title: "Object-oriented programming", parent: TAG_ID.programmingParadigms},
    {id: TAG_ID.functionalProgramming, title: "Functional programming (AQA)", parent: TAG_ID.programmingParadigms},
    // Software project topics
    {id: TAG_ID.softwareProject, title: "Software project", parent: TAG_ID.computingPracticalProject},
];
