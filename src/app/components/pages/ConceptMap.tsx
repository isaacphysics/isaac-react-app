import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Col, Container, Input, Row } from "reactstrap";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import ReactFlow, { Background, BackgroundVariant, Controls, Edge, Handle, MiniMap, Node, NodeChange, NodeProps, Position, applyNodeChanges } from "reactflow";
import { SimulationNodeDatum, forceCollide, forceLink, forceManyBody, forceSimulation, forceX, forceY } from "d3";
import { Link } from "react-router-dom";
import { getMyAnsweredQuestionIds, selectors, useAppDispatch, useAppSelector } from "../../state";

// TODO:
// - filter by subject
// - filter by difficulty
// - smooth forces

// longer term:
// - don't use hardcoded script_result, run it and cache as needed (with etl?)
// - replace opacity with desaturation as lines are visible through nodes
//      - if you can figure out the custom edge it might help with full colouring the active edges
// - clean up the temporary force fix when showing only answered questions

// there are further simulation settings below, these are useful elsewhere though
const INITIAL_ALPHA = 0.5;
const MINIMUM_ALPHA = 0.0001;

interface SimulationNodeType extends SimulationNodeDatum {
    title: string;
    conceptId: string;
    subject: string;
    size: number;
}

interface SimulationEdgeType {
    id: string;
    source: SimulationNodeType;
    target: SimulationNodeType;
    type?: string;
    data?: {
        className?: string;
    }
}

const scriptToJSObjects = () => {
    const script_result = {
        "concepts": [{"concept_id": "cc_isomerism", "title": "Isomerism", "related_content": ["cc_drawing_structures", "cc_functional_groups"]}, {"concept_id": "cc_energy_profiles", "title": "Energy Profiles", "related_content": ["viewing_in_profile", "reaction_profiling", "cc_activation_energy", "cc_enthalpy", "reaction_profile_pathways"]}, {"concept_id": "cc_transition_metals", "title": "Transition Metals", "related_content": ["cc_atomic_structure"]}, {"concept_id": "cc_moles", "title": "Moles", "related_content": ["burning_sucrose", "cc_writing_chemical_equations"]}, {"concept_id": "cc_shapes_of_molecules", "title": "Shapes of Molecules", "related_content": ["cc_bonding_types"]}, {"concept_id": "cc_non_ideal_gases", "title": "Non-ideal Gases", "related_content": ["cc_ideal_gas", "cc_intermolecular_forces", "van_der_waals"]}, {"concept_id": "cc_equilibrium", "title": "Equilibrium", "related_content": ["equilibrium", "hydrogen_iodine_equilibrium", "rate_effect_of_pressure", "cc_equilibrium_constant"]}, {"concept_id": "cc_equilibrium_constant", "title": "Equilibrium Constant", "related_content": ["gaseous_gases", "formic_acid_dissociation", "master_equations", "cc_gibbs_free_energy", "cc_equilibrium"]}, {"concept_id": "cc_maxwell_boltzmann_distribution", "title": "Maxwell-Boltzmann Distribution", "related_content": ["another_boltzmann_distribution_question", "maxwell_boltzman_distribution", "special_boltzmann", "cc_activation_energy"]}, {"concept_id": "cc_state_and_path_functions", "title": "State and Path Functions", "related_content": ["gas_sphere", "adiabatic_work", "latticework", "cc_enthalpy", "cc_entropy"]}, {"concept_id": "cc_catalysts", "title": "Catalysts", "related_content": ["cc_activation_energy", "cc_rates", "catalyser", "gases_and_rates", "graphing_rates_of_reaction", "cc_energy_profiles", "cc_enthalpy", "cc_equilibrium"]}, {"concept_id": "cc_bonding_types", "title": "Bonding Types", "related_content": ["cc_intermolecular_forces", "cc_shapes_of_molecules", "bonding_triangle"]}, {"concept_id": "cc_organic_reaction_mechanisms", "title": "Organic Reaction Mechanisms", "related_content": ["cc_functional_groups", "cc_isomerism", "cc_drawing_structures"]}, {"concept_id": "cc_heat_capacities", "title": "Heat Capacity & Latent Heat", "related_content": ["candle_calorimetry", "burning_sucrose", "cc_cooling_curves", "cooling_curves", "diet_cola", "the_mysterious_ice_machine", "calorimeter", "lhc_helium", "cc_enthalpy", "heat_capacities", "molar_heat"]}, {"concept_id": "cc_functional_groups", "title": "Functional Groups", "related_content": ["cc_drawing_structures", "cc_isomerism", "cc_organic_reaction_mechanisms", "common_functional_groups", "hops", "functional_group_tests"]}, {"concept_id": "cc_hess_law", "title": "Hess's Law", "related_content": ["wine_to_vinegar", "lunar_propulsion", "reducing_iron", "combustion_enthalpy", "cc_enthalpy", "cc_state_and_path_functions", "acid_rain", "bonds_carbon_dioxide", "hess_calorimetry", "combustion_and_formation", "jelly_babies", "molybdenum_reduction", "water_vaporisation"]}, {"concept_id": "cc_electrochemistry", "title": "Electrochemistry", "related_content": ["cc_writing_chemical_equations"]}, {"concept_id": "cc_cooling_curves", "title": "Cooling Curves", "related_content": ["cooling_curves", "phasing_in", "heating_mixture"]}, {"concept_id": "cc_rates", "title": "Rates", "related_content": ["hydroxide_acetate", "the_general_rate_constant", "basic_factors_affecting_rate", "integrated_rate_laws", "rate_constant_units", "simple_average_rate", "rate_of_gas_production", "gas_phase_mechanism_rate", "rate_constant_factors", "cc_activation_energy", "cc_catalysts"]}, {"concept_id": "cc_laws_of_thermodynamics", "title": "Laws of Thermodynamics", "related_content": ["cc_entropy", "adiabatic_work", "master_equations", "gas_sphere", "free_energy", "mixture_of_gases", "mixing_gases"]}, {"concept_id": "cc_activation_energy", "title": "Activation Energy", "related_content": ["cc_rates", "reaction_profile_activation_energy", "reaction_profile_pathways", "decomposition_of_benzenediazonium_chloride", "cc_energy_profiles", "cc_enthalpy", "cc_catalysts", "cc_maxwell_boltzmann_distribution"]}, {"concept_id": "cc_entropy", "title": "Entropy", "related_content": ["cooling_excalibur", "evaporative_cooling", "mixture_of_gases", "cc_laws_of_thermodynamics", "cc_enthalpy", "cc_equilibrium"]}, {"concept_id": "cc_ideal_gas", "title": "Ideal Gases", "related_content": ["vacuum_balloon", "an_indecisive_gas", "charles_law", "under_pressure", "hess_calorimetry", "gaseous_ideals", "atmospheric_pressure", "van_der_waals", "cc_non_ideal_gases"]}, {"concept_id": "cc_drawing_structures", "title": "Drawing Structures", "related_content": ["cc_functional_groups", "cc_isomerism"]}, {"concept_id": "cc_intermolecular_forces", "title": "Intermolecular Forces", "related_content": ["cc_shapes_of_molecules", "cc_bonding_types"]}, {"concept_id": "cc_enthalpy", "title": "Enthalpy", "related_content": ["the_mysterious_ice_machine", "burning_sucrose", "diet_cola", "calorimeter", "candle_calorimetry", "golden_ring", "bond_enthalpies", "combustion_enthalpy", "enthalpy_of_fusion", "bonds_carbon_dioxide", "cc_energy_profiles", "cc_activation_energy", "cc_entropy"]}, {"concept_id": "cc_gibbs_free_energy", "title": "Gibbs Free Energy", "related_content": ["cc_equilibrium_constant", "gaseous_gases", "heat_capacities", "master_equations", "free_energy", "great_gibbs", "latticework", "cc_laws_of_thermodynamics", "cc_enthalpy", "cc_entropy"]}, {"concept_id": "cc_writing_chemical_equations", "title": "Writing Chemical Equations", "related_content": ["cc_moles"]}, {"concept_id": "cc_intermolecular_forces_old", "title": "Intermolecular Forces", "related_content": ["cc_non_ideal_gases"]}, {"concept_id": "cc_atomic_structure", "title": "Atomic Structure", "related_content": ["cc_moles", "orbitals_and_subshells", "first_configurations", "electronic_configuration_d_block"]}, {"concept_id": "cm_algebra_manip_inequalities", "title": "Algebraic Manipulation - Inequalities", "related_content": []}, {"concept_id": "cm_stat_chi_squared_test", "title": "Chi-squared Tests", "related_content": []}, {"concept_id": "cm_vectors2", "title": "Vectors - Resolving Vectors", "related_content": ["cp_cons_momentum", "cp_newtonii", "cp_newtoniii", "cm_vectors"]}, {"concept_id": "cm_differentiation", "title": "Calculus - Differentiation", "related_content": ["cm_integration", "cm_integration2", "cm_integration3"]}, {"concept_id": "cm_algebra_manip", "title": "Algebraic Manipulation - Rearranging Equations and Units", "related_content": ["cm_algebra_simult", "cm_algebra_quadr"]}, {"concept_id": "cm_geometry1", "title": "Geometry - Angles and Triangles", "related_content": ["cm_trig1"]}, {"concept_id": "cm_graph_interpreting", "title": "Functions - Graph Interpreting", "related_content": ["cm_functions_simple", "cm_functions_exponentials_logarithms", "cm_functions_polynomials", "cm_functions_transformations", "cm_trig1", "cm_functions_other_properties", "cm_functions_modulus", "cm_differentiation", "cm_functions_hyperbolic", "cm_functions_composite", "graph_interpreting_5_rational_reciprocal", "graph_interpretation_1_linear", "graph_interpretation_2_symmetry", "graph_interpreting_4_lin_exp", "graph_interpreting_5_cos_exp", "graph_interpreting_5_rational_quad", "graph_interpreting_3_recip_quad", "graph_interpreting_3_exp_log", "graph_interpretation_1_cubic", "graph_interpretation_2_quartic", "graph_interpretation_1_quadr", "graph_interpretation_1_trig", "graph_interpretation_2_gravitational_field", "graph_interpreting_5_polynomial_exp", "graph_interpretation_2_magnetic_field", "interpretation_1_recip", "graph_interpreting_4_lin_power", "graph_interpreting_4_sines", "graph_interpreting_4_sinesquared"]}, {"concept_id": "cm_functions_transformations", "title": "Functions - Transformations", "related_content": ["functions_1_6", "functions_1_9", "functions_1_7", "functions_1_8", "functions_1_1", "functions_1_3", "functions_1_5", "functions_1_4", "functions_1_10", "functions_1_2"]}, {"concept_id": "cm_graphs_units", "title": "Graphs - Physical Quantities", "related_content": []}, {"concept_id": "cm_number_proof", "title": "Proof - Introduction", "related_content": ["cm_number_proof_induction", "proof_sums_series", "proof_hollow_pyramids", "proof_divisibility_exhaustion", "disproof_counter_example", "proof_odd_perfect_numbers", "proof_surface_areas"]}, {"concept_id": "cm_standard_form", "title": "Standard Form and Prefixes", "related_content": ["cm_algebra_manip_index"]}, {"concept_id": "cm_algebra_factor_theorem", "title": "Algebraic Division and The Factor Theorem", "related_content": ["cm_functions_polynomials", "cp_algebra_frac_part_frac"]}, {"concept_id": "cm_stat_probability", "title": "Probability", "related_content": ["cm_stat_binomial_dist", "cm_stat_normal"]}, {"concept_id": "matrices_linear_transformations2d", "title": "Matrices - Linear Transformations (2D)", "related_content": ["matrices_linear_transformations3d", "cm_matrices_multiplication", "cm_matrices_determinants"]}, {"concept_id": "cm_vectors3", "title": "Vectors - Vector (or Cross) Products", "related_content": ["cm_vectors2", "cm_vectors", "cp_lorentz_force"]}, {"concept_id": "cm_functions_simple", "title": "Functions - Simple Function Types", "related_content": ["quadratic_formula_4", "quadratic_formula_3", "quadratic_formula_1", "quadratic_formula_2", "quadratic_formula_5", "cm_algebra_quadr", "rearrange_linear_3", "rearrange_linear_1", "rearrange_linear_2", "rearrange_linear_4", "quadratic_formula_3_num", "rearrange_reciprocal1", "CRVLogs", "rearrange_quadratic2", "rearrange_quadratic1", "rearrange_suvat2", "rearrange_suvat1", "cm_functions_composite", "functions_1_5", "functions_1_3", "functions_1_8", "functions_1_6", "functions_4_1_sym", "functions_4_2_symb", "functions_1_4", "functions_1_1", "functions_1_2", "functions_1_10", "functions_1_7"]}, {"concept_id": "cm_stat_negbin_geom_dists", "title": "Negative Binomial, Geometric distributions", "related_content": ["cm_stat_binomial_dist"]}, {"concept_id": "cm_matrices_transposition", "title": "Matrices - Transposition", "related_content": ["cm_matrices", "cm_matrices_multiplication"]}, {"concept_id": "cm_stat_t_test", "title": "t-tests", "related_content": []}, {"concept_id": "cm_differential_equations", "title": "Differential Equations", "related_content": ["cm_differentiation", "cm_integration", "cm_integration2"]}, {"concept_id": "cm_functions_other_properties", "title": "Functions - Other Properties", "related_content": []}, {"concept_id": "cm_coordinates_straight_lines_equation", "title": "Straight Lines:  The Equation of a Straight Line", "related_content": ["cm_coordinates_straight_lines_2d", "cm_coordinates_straight_lines_3d"]}, {"concept_id": "cm_trig2", "title": "Trigonometry - Compound Angle Formulae", "related_content": ["cm_trig1", "cm_geometry1"]}, {"concept_id": "cm_algebra_simult", "title": "Simultaneous Equations", "related_content": ["cm_algebra_manip", "cm_algebra_quadr"]}, {"concept_id": "cm_matrices_determinants", "title": "Matrices - Determinants", "related_content": ["cm_matrices", "cm_matrices_multiplication", "cm_matrices_transposition", "cm_matrices_inverses"]}, {"concept_id": "matrices_linear_transformations3d", "title": "Matrices - Linear Transformations (3D)", "related_content": ["matrices_linear_transformations2d", "cm_matrices_multiplication", "cm_matrices_determinants"]}, {"concept_id": "cp_algebra_frac_part_frac", "title": "Algebraic Fractions & Partial Fractions", "related_content": ["cm_functions_polynomials", "cm_algebra_simult"]}, {"concept_id": "cm_functions_hyperbolic", "title": "Functions - Hyperbolic Functions", "related_content": ["cm_functions_exponentials_logarithms"]}, {"concept_id": "cm_integration2", "title": "Calculus - Integrating Common Functions", "related_content": ["cm_integration", "cm_integration3"]}, {"concept_id": "cm_stat_srcc_hypothesis_testing", "title": "Hypothesis Testing - Spearman's Rank Correlation Coefficient", "related_content": ["cm_stat_pmcc_hypothesis_testing"]}, {"concept_id": "cm_inverse_square", "title": "Inverse Square Laws in Physics", "related_content": ["cp_fields", "cp_gravitational_field", "cp_electric_field", "dim_distant_stars", "inverse_square_geometry_sym", "rayleigh_scattering"]}, {"concept_id": "cm_algebra_quadr", "title": "Quadratic Equations", "related_content": ["cm_algebra_manip", "cm_algebra_simult"]}, {"concept_id": "cm_stat_representing_data", "title": "Representing Data", "related_content": []}, {"concept_id": "cm_coordinates_straight_lines_3d", "title": "Straight Lines:  Coordinate Geometry in 3D", "related_content": ["cm_coordinates_straight_lines_equation", "cm_coordinates_straight_lines_2d"]}, {"concept_id": "cm_matrices_multiplication", "title": "Matrices - Matrix Multiplication", "related_content": ["cm_matrices", "cm_vectors2"]}, {"concept_id": "cm_coordinates_straight_lines_2d", "title": "Straight Lines:  Coordinate Geometry in 2D", "related_content": ["cm_coordinates_straight_lines_equation", "cm_coordinates_straight_lines_3d"]}, {"concept_id": "cm_trig1", "title": "Trigonometric Relationships", "related_content": ["cm_trig2", "cm_geometry1", "cm_geometry2"]}, {"concept_id": "cm_functions_composite", "title": "Functions - Composite Functions", "related_content": ["cm_functions_simple", "functions_4_1_sym", "functions_4_2_symb"]}, {"concept_id": "cm_stat_pmcc_hypothesis_testing", "title": "Hypothesis Testing - Pearson's Product Moment Correlation Coefficient", "related_content": ["cm_stat_srcc_hypothesis_testing"]}, {"concept_id": "cm_algebra_manip_surds", "title": "Algebraic Manipulation - Surds", "related_content": ["cm_algebra_manip_inequalities", "cm_algebra_manip_index", "cm_algebra_manip"]}, {"concept_id": "cm_functions_modulus", "title": "Functions - Modulus Functions", "related_content": []}, {"concept_id": "cm_geometry_coordinates_circles", "title": "Coordinate Geometry of Circles", "related_content": []}, {"concept_id": "cm_matrices_equations", "title": "Matrices - Systems of Equations", "related_content": ["cm_matrices_inverses", "cm_matrices_determinants"]}, {"concept_id": "cm_integration3", "title": "Calculus - Integration by Substitution and by Parts", "related_content": ["cm_integration", "cm_integration2"]}, {"concept_id": "cm_stat_discrete_rv", "title": "Discrete Random Variables", "related_content": ["cm_stat_probability", "cm_stat_binomial_dist", "cm_stat_negbin_geom_dists", "cm_stat_poisson_dist", "drv_exp_var_1", "drv_exp_var_2", "discrete_random_variables_1"]}, {"concept_id": "cm_complex_numbers", "title": "Complex Numbers", "related_content": ["cm_differential_equations", "cm_differentiation", "cm_series", "cm_integration2"]}, {"concept_id": "cp_log_integration_mod", "title": "Logarithmic Integration", "related_content": ["cm_integration", "cm_integration2", "cm_integration3", "exponentials"]}, {"concept_id": "cm_series", "title": "Series", "related_content": ["cm_functions_simple", "cm_functions_exponentials_logarithms", "cm_trig2", "cm_trig1"]}, {"concept_id": "cm_stat_normal", "title": "The Normal Distribution", "related_content": ["cm_average_spread", "cm_stat_binomial_dist", "cm_stat_probability"]}, {"concept_id": "cm_functions_polynomials", "title": "Functions - Polynomials and Rational Functions", "related_content": ["cm_functions_simple", "cm_integration", "cm_integration3", "cp_algebra_frac_part_frac"]}, {"concept_id": "cm_matrices_inverses", "title": "Matrices - Inverses", "related_content": ["cm_matrices", "cm_matrices_multiplication", "cm_matrices_determinants", "cm_matrices_transposition"]}, {"concept_id": "cm_graph_sketching", "title": "Functions - Graph Sketching", "related_content": []}, {"concept_id": "cm_number_proof_induction", "title": "Proof by Induction", "related_content": ["cm_number_proof"]}, {"concept_id": "cm_average_spread", "title": "Average and Spread of Data", "related_content": ["cp_uncertainties"]}, {"concept_id": "cm_integration", "title": "Calculus - Introduction to Integration", "related_content": ["cm_integration2", "cm_integration3", "cm_differentiation", "cm_differential_equations", "integration_parts2", "integration_parts4", "integration_parts6_new", "integration_parts1", "integration_parts3", "integration_parts5"]}, {"concept_id": "cm_algebra_manip_index", "title": "Algebraic Manipulation - Index Notation", "related_content": ["cm_algebra_manip_surds"]}, {"concept_id": "cm_geometry2", "title": "Geometry - Shapes and their Properties", "related_content": ["cm_geometry1", "cm_trig1"]}, {"concept_id": "cm_stat_binomial_dist", "title": "The Binomial Distribution", "related_content": ["cm_average_spread", "cm_stat_normal", "cm_stat_probability"]}, {"concept_id": "cm_matrices", "title": "Matrices - Definition", "related_content": ["cm_vectors", "cm_vectors2", "cm_matrices_multiplication"]}, {"concept_id": "cm_functions_exponentials_logarithms", "title": "Functions - Exponentials and Logarithms", "related_content": []}, {"concept_id": "cm_stat_poisson_dist", "title": "The Poisson Distribution", "related_content": []}, {"concept_id": "cm_vectors", "title": "Vectors - Describing and Adding Vectors", "related_content": ["cp_newtonii", "cp_cons_momentum", "cp_newtoniii", "cm_vectors2"]}, {"concept_id": "cp_cons_energy", "title": "Conservation of Energy", "related_content": ["cp_kinetic_energy", "cp_potential_energy", "cp_collisions", "the_lift_num", "chain_on_peg_num", "mercury_u_tube", "two_skaters", "spouting_can_num", "walking_up_hill", "weigh_machine_num"]}, {"concept_id": "cp_friction", "title": "Friction", "related_content": ["cp_newtonii", "cp_newtoni", "cp_newtoniii", "cp_moments", "cp_angular_motion", "cm_vectors", "block_friction", "lamina_table_num", "prism", "rope_between_inclines"]}, {"concept_id": "cp_circular_motion", "title": "Circular Kinematics", "related_content": ["cp_newtoni", "cp_newtonii", "cm_vectors", "geostationary_orbit", "record_player", "loop_the_loop_num", "rising_hoop", "hoola_hoop", "humpback_bridge", "tension_pendulum_num", "ang_vel_sun_num"]}, {"concept_id": "cp_cons_momentum", "title": "Momentum & Conservation of Momentum", "related_content": ["cp_newtonii", "cp_force", "cp_newtoniii", "the_lift", "the_lift_num", "road_collision", "discs_on_a_table_num", "discs_on_a_table", "three_collisions", "three_collisions_num", "head_on_collision", "the_hosepipe"]}, {"concept_id": "cp_relative_velocity", "title": "Relative Velocity", "related_content": ["cp_frame_reference", "cm_vectors", "cp_eq_of_motion", "cp_collisions", "ping_pong_bus_num", "michaelson_morley_num", "ant_tortoise_elastic_num", "water_wheel", "space_justice_num"]}, {"concept_id": "cp_momentum", "title": "Momentum", "related_content": []}, {"concept_id": "cp_buoyancy_archimedes", "title": "Buoyancy & Archimedes' Principle", "related_content": ["cp_equilibrium", "buoy_and_anchor", "co2_bubbles_straw", "galileo_thermometer", "helium_balloon_buoyancy", "hemispherical_bowl", "hieros_crown", "hot_air_balloon", "oscillating_cylinder", "iceberg_proportions", "submarine_buoyancy", "submerged_spheres_scales", "underwater_scales", "cartesian_diver", "ice_cubes_melting"]}, {"concept_id": "cp_kinetic_energy", "title": "Kinetic Energy", "related_content": ["cp_cons_energy", "cp_potential_energy", "cp_angular_motion", "cp_ang_eq_of_motion", "test_of_strength", "airzooka", "sphere_vs_cylinder", "windmill", "particles_on_string", "energy_of_bullet", "three_collisions", "the_lift"]}, {"concept_id": "cp_ang_eq_of_motion", "title": "Angular Equations of Motion", "related_content": ["cp_angular_motion", "cp_eq_of_motion", "tug_war", "rolling_objects", "flywheel", "acc_hard_disk", "lunar_collision_num", "test_of_strength", "ang_vel_sun_num", "acc_roundabout", "acc_roundabout_num", "angular_vs_linear", "music_CD", "ruler_space", "angular_rod_mass"]}, {"concept_id": "cp_angular_momentum", "title": "Angular Momentum", "related_content": ["cp_angular_motion", "cp_ang_eq_of_motion", "cp_cons_momentum", "cp_kinetic_energy", "spinning_ice_skater", "angular_rod_mass", "rev_astronaut", "funfair_rotating_targets", "music_CD", "cp_moment_inertia", "angular_vs_linear", "windmill"]}, {"concept_id": "cp_hookes_law", "title": "Hooke's Law", "related_content": ["cp_cons_energy", "cp_potential_energy", "cp_shm", "cp_force", "shm_simple_scale", "elastic_circular_motion", "spring_triangle", "weigh_machine_num", "shm_horizontal_spring", "weigh_sea_num", "diatomic_molecule"]}, {"concept_id": "cp_superposition", "title": "Superposition", "related_content": ["sand_ridges", "birefringence", "absent_reflection", "beat_frequency", "beats_tuning_forks", "combining_waves", "harbour_wall", "reflecting_on_the_cosmos", "single_slit_diffraction", "sound_and_light", "sounding_good", "air_sandwich", "diffraction_in_paraffin", "don't_bragg", "grating_spectrum", "modified_double_slit", "smoothness_test", "splitting_hairs", "microscope_slide", "cp_general_waves", "cp_standing_waves", "cp_diffraction", "thin_film_colour"]}, {"concept_id": "cp_angular_motion", "title": "Angular Motion", "related_content": ["cp_ang_eq_of_motion", "cp_moment_inertia", "cp_eq_of_motion", "acc_roundabout_num", "rev_astronaut", "record_ang_vel_num", "lunar_collision_num"]}, {"concept_id": "cp_capacitor", "title": "Capacitors", "related_content": ["measuring_resistances", "a_devious_diode", "bulbs_and_power", "power_of_a_light_bulb", "coulometer", "series_resistors", "point_of_no_return", "series_parallel_resistors", "batteries_and_resistors_in_parallel", "resistors_in_parallel", "current_through_parallel_resistors", "cp_electric_field", "cp_gauss_law", "resistor_for_led_cct"]}, {"concept_id": "cp_kirchhoffs_laws", "title": "Kirchhoff's Laws", "related_content": ["cp_electric_current", "cp_electrical_impedance", "cp_electrical_cell", "cp_electrical_components", "measuring_resistances", "odd_potential_difference", "a_capacitor_conundrum", "series_resistors", "current_through_parallel_resistors", "series_parallel_resistors", "cp_ohms_law"]}, {"concept_id": "cp_lorentz_force", "title": "Lorentz Force", "related_content": ["cp_magnetic_field", "cp_force", "cp_electric_current", "cm_vectors3", "Liquid_Pool", "ring_drop", "helical_path", "motor_effect", "deflecting_ions", "electrons_orbiting_earth", "vectors_in_fields"]}, {"concept_id": "cp_stress_strain_elastic", "title": "Stress, Strain and Young's Modulus", "related_content": ["cp_hookes_law", "identify_materials", "stress_strain_curve_features", "materials_properties", "true_stress_rubber", "solid_spring"]}, {"concept_id": "cp_power", "title": "Power", "related_content": ["cp_cons_energy", "cp_work", "cp_potential_energy", "sprinter_100m", "powering_up", "lifting_rod", "braking_a_car", "rapid_acceleration", "bike_power", "power_in_resistors", "power_limited_resistors"]}, {"concept_id": "cp_electrical_cell", "title": "Electrical Cell", "related_content": ["cp_potential", "cp_electric_current", "resistance_and_power", "potentiometer_capacitor", "batteries_and_resistors_in_parallel", "two_cell_and_two_resistors", "batteries_in_parallel", "exponential_i_v"]}, {"concept_id": "cp_electrical_impedance", "title": "Electrical Impedance", "related_content": ["cp_kirchhoffs_laws"]}, {"concept_id": "cp_faradays_law", "title": "Faraday's Law", "related_content": ["cp_alternating_current", "cp_transformer", "emf_generator", "coil_rotation", "pushing_wire_through_field_num", "basic_flux_linkage", "aeroplane_potential_diff", "cp_lenzs_law"]}, {"concept_id": "cp_electrical_components", "title": "Electrical Components", "related_content": ["cp_capacitor", "cp_electrical_cell", "cp_transformer", "cp_ohms_law", "cp_faradays_law", "cp_lenzs_law"]}, {"concept_id": "cp_equilibrium", "title": "Equilibrium", "related_content": ["cp_newtoni", "cp_moments", "cm_vectors", "cm_vectors2", "cases_of_equilibria", "buoy_and_anchor", "trapdoor_num", "uniform_ladder_num", "three_cylinders", "string_pegs_sym", "pick_up_chain_num"]}, {"concept_id": "cp_newtoniii", "title": "Newton's Third Law", "related_content": ["cp_newtoni", "cp_newtonii", "cm_vectors", "action_reaction_pairs", "cp_equilibrium", "two_cubes", "newton_iii_cases", "string_pegs_sym", "particle_in_bowl_num", "two_rods", "corner_climbing_num"]}, {"concept_id": "cp_ohms_law", "title": "Ohm's Law", "related_content": ["cp_electrical_impedance", "cp_electrical_components", "cp_electric_current", "cp_power", "series_parallel_resistors", "resistors_in_parallel", "vital_voltmeters", "power_limited_resistors", "bulbs_and_power", "work_in_resistors"]}, {"concept_id": "cp_electric_field", "title": "Electric Field", "related_content": ["cp_potential", "cm_inverse_square", "cp_em_waves", "cp_gauss_law", "inkjet_printing", "current_orbiting_electron_num", "current_orbiting_electron", "three_corner_charges", "oil_drop_multiple_fields_num", "oil_drop_multiple_fields", "charges_in_a_square", "charged_massive_shell", "protons_orbiting_a_star", "accelerating_voltage_diff", "capacitor_with_dielectric"]}, {"concept_id": "cp_general_waves", "title": "Waves", "related_content": ["travelling_vs_standing", "how_fast", "finding_frequency", "light_beats", "finding_wavespeed", "amplitude_modulation", "conical_wavefront", "light_pressure", "electromagnetic_frequencies", "electron_beam", "combining_waves", "sounding_good", "polarisation_rotation", "waveforms", "waving_along", "noise_production", "rayleigh_scattering", "break_free", "two_microphones", "echo_location", "cliff_reflection", "ripple_tank", "sound_profile", "lighting_up_a_mirror", "birefringence", "sand_ridges", "harbour_wall", "decibels", "cp_em_waves", "cp_standing_waves"]}, {"concept_id": "cp_strings_pulleys", "title": "Strings and Pulleys", "related_content": ["cp_force", "cp_newtonii", "cp_equilibrium", "particles_on_string", "pulleys", "pulleys_on_table_num", "connected_masses_2", "hanging_picture", "cp_newtoniii", "symmetric_chain_catenary"]}, {"concept_id": "cp_moment_inertia", "title": "Moment of Inertia", "related_content": ["cp_kinetic_energy", "cp_angular_momentum", "cp_moments", "cp_cons_energy", "cp_cons_momentum", "cp_angular_motion", "cp_ang_eq_of_motion", "record_ang_vel_num", "acc_hard_disk", "t_pendulum_num", "mom_inertia_objects_num", "moi_objects_num", "ang_vel_sun_num", "angular_rod_mass"]}, {"concept_id": "cp_centre_mass", "title": "Centre of Mass", "related_content": ["cp_moment_inertia", "cp_equilibrium", "cp_ang_eq_of_motion", "cp_frame_reference", "hoola_hoop", "finger_balance", "double_bus", "rolling_race", "t_pendulum_num", "weighing_lorry", "symmetry_and_com_num"]}, {"concept_id": "cp_frame_reference", "title": "Frames of Reference", "related_content": ["elastic_collision_ZMF_num", "angle_between_identical_masses", "superball_num", "transfer_energy_ZMF_num", "maximum_deflection_angle_num", "cm_vectors", "cm_vectors2", "cp_relative_velocity", "cp_collisions"]}, {"concept_id": "cp_photoelectric_effect", "title": "Photoelectric Effect", "related_content": ["the_photoelectric_effect", "energy_levels", "breakaway", "cp_em_waves"]}, {"concept_id": "cp_em_waves", "title": "Electromagnetic Waves", "related_content": ["energy_levels", "grating_spectrum", "volume_of_a_photon", "x_ray_production", "electromagnetic_frequencies", "searching_for_the_invisible", "reflecting_and_absorbing_surfaces", "diffraction_in_paraffin", "photon_momentum", "falling_photon", "dim_distant_stars", "rayleigh_scattering", "x_ray_crystallography", "doppler_spectral_lines"]}, {"concept_id": "cp_fields", "title": "Fields", "related_content": ["cp_gauss_law", "cp_gravitational_field", "cp_electric_field", "cp_magnetic_field", "cm_inverse_square", "inverse_square_geometry", "fields_in_a_triangle_num", "charges_in_a_square"]}, {"concept_id": "cp_work", "title": "Work", "related_content": ["cp_cons_energy", "cp_force", "cp_power", "sprinter_100m", "powerful_stuff", "powering_up", "lifting_rod", "rapid_acceleration", "bike_power"]}, {"concept_id": "cp_moments", "title": "Moments or Torques", "related_content": ["cp_equilibrium", "cp_angular_momentum", "cp_ang_eq_of_motion", "cp_angular_motion", "cp_newtonii", "trapdoor_num", "child_seesaw", "lamina_table_num", "uniform_ladder_num", "three_cylinders", "ice_roof_num", "flywheel", "cp_levers_gears"]}, {"concept_id": "cp_potential_energy", "title": "Potential Energy", "related_content": ["cp_hookes_law", "cp_force", "cp_gravitational_field", "cp_kinetic_energy", "hamburger", "pop_up_toy_num", "loop_the_loop_num", "the_lift_num", "mercury_u_tube", "jump_over_log_num", "lunar_landing", "ballistic_pendulum"]}, {"concept_id": "cp_abs_temperature", "title": "Absolute Temperature", "related_content": ["cc_ideal_gas"]}, {"concept_id": "cp_radioactive_decay", "title": "Radioactive Decay", "related_content": []}, {"concept_id": "cp_particles", "title": "Particles and Antiparticles", "related_content": ["cp_photoelectric_effect", "cp_radioactive_decay", "particle_puzzle", "phys19_l2_q1", "phys19_l2_q2", "phys19_l2_q8", "cp_nuclear_reactions"]}, {"concept_id": "cp_newtonii", "title": "Newton's Second Law", "related_content": ["cp_newtoniii", "cp_newtoni", "cm_vectors", "cp_equilibrium", "falling_masses", "two_mass_peg_num", "metal_block_num", "geostationary_orbit", "conical_pendulum", "two_mass_pendulum_num", "stoplight", "kepleriii_num"]}, {"concept_id": "cp_lenses", "title": "Lenses", "related_content": ["cp_ray_diagrams", "camera_lens", "two_lens_microscope", "compound_microscope", "deriving_lensmaker", "changing_perspective", "triple_trouble"]}, {"concept_id": "cp_potential", "title": "Field Potential", "related_content": ["cp_electric_field", "cp_fields", "cp_gravitational_field", "cp_potential_energy", "cp_capacitor", "potential_work_done", "potential_of_sphere", "accelerating_voltage_diff", "gravity_earth", "electric_potential"]}, {"concept_id": "cp_magnetic_field", "title": "Magnetic Fields", "related_content": ["cp_fields", "cp_lorentz_force", "cp_faradays_law", "cyclotron_dep", "ring_drop", "parallel_plates", "deflection_of_a_particle", "two_wires_field_force_magnitude", "em_induction_disc", "fields_around_magnets", "electron_in_a_B_field"]}, {"concept_id": "cp_eq_of_motion", "title": "Equations of Motion", "related_content": ["cp_ang_eq_of_motion", "cp_angular_motion", "light_clock_num", "highway_pursuit", "broken_cannon", "ball_bouncing_dip_num", "lifeguard_num", "define_suvat_num"]}, {"concept_id": "cp_impulse", "title": "Impulse", "related_content": ["cp_cons_momentum", "cp_newtonii", "cp_kinetic_energy", "cm_vectors", "head_on_collision", "pulleys_on_table_num", "water_wheel", "windmill", "particles_on_string"]}, {"concept_id": "cp_collisions", "title": "Collisions", "related_content": ["cp_frame_reference", "cp_cons_energy", "cp_kinetic_energy", "cp_newtoni", "cp_newtonii", "cp_cons_momentum", "three_collisions_num", "acceleration_string", "three_particles", "ball_bouncing_dip_num", "space_justice_num", "force_bouncing_ball_num"]}, {"concept_id": "cp_shm", "title": "Simple Harmonic Motion", "related_content": ["pendulum_lift", "car_suspension_bumps_num", "safe_passage", "oscillating_mass_energy_multi", "accuracy_shm_pendulum_num", "cp_ang_eq_of_motion", "cp_angular_momentum", "cp_angular_motion", "cp_newtonii", "gravtube_num"]}, {"concept_id": "cp_force", "title": "Force", "related_content": ["cp_newtonii", "cp_cons_momentum", "cp_impulse", "bed_of_nails", "trailer_truck", "block_friction", "damped_pendulum_num", "an_accident", "suspended_block", "spring_triangle"]}, {"concept_id": "cp_gauss_law", "title": "Flux and Gauss's Law", "related_content": ["cp_electric_field", "cp_gravitational_field", "cp_magnetic_field", "cp_fields", "modelling_earths_gravity", "gravity_on_a_disc_world_num", "travelling_through_the_earth", "star_in_galaxy"]}, {"concept_id": "cp_gravitational_field", "title": "Gravitational Field", "related_content": ["cp_potential_energy", "firing_the_rockets", "lunar_collision_num", "gravtube_num", "geostationary_orbit", "orbiting_moon", "ang_vel_sun_num", "cp_circular_motion"]}, {"concept_id": "cp_reflection_and_refraction", "title": "Reflection and Refraction", "related_content": ["lighting_up_a_mirror", "sand_ridges", "refractive_index", "light_has_the_power", "the_light_pipe", "mirage", "optical_path_difference", "moon_halo", "seeing_double", "wax_prism", "periscope", "echo_location", "reflecting_on_the_cosmos", "birefringence", "vanishing_light", "redirecting_waves", "floating_on_mercury", "optical_dipstick", "bending_light_in_atmosphere", "modified_double_slit", "underwater_ridge", "air_sandwich", "prism_deviations", "smoothness_test", "microscope_slide", "cp_general_waves", "cp_em_waves", "thin_film_colour", "off_the_optical_axis"]}, {"concept_id": "cp_transformer", "title": "Transformer", "related_content": ["cp_faradays_law", "cp_lenzs_law"]}, {"concept_id": "cp_standing_waves", "title": "Standing Waves", "related_content": ["sand_ridges", "singing_bottles", "travelling_vs_standing", "cp_general_waves", "cp_superposition"]}, {"concept_id": "cp_polarisation", "title": "Polarisation", "related_content": ["cp_em_waves", "cp_general_waves", "polarised_power", "polarisation_rotation", "birefringence", "polaroid"]}, {"concept_id": "cp_alternating_current", "title": "Alternating Current", "related_content": ["body_resistance", "lighting_a_lamp", "interpreting_oscilloscopes", "basic_battery_charger", "cp_electric_current"]}, {"concept_id": "cp_resistivity", "title": "Resistivity", "related_content": ["cp_ohms_law", "resistance_loop", "drift_velocity", "body_resistance", "conductivity", "metal_squares"]}, {"concept_id": "cp_eq_of_motion_vector", "title": "Equations of Motion: Vector Equations", "related_content": ["cp_angular_motion", "broken_cannon", "ball_bouncing_dip_num", "define_suvat", "cp_eq_of_motion"]}, {"concept_id": "cp_diffraction", "title": "Diffraction", "related_content": ["sound_and_light", "modified_double_slit", "splitting_hairs", "diffraction_in_paraffin", "harbour_wall", "x_ray_crystallography", "grating_spectrum", "single_slit_diffraction"]}, {"concept_id": "cp_levers_gears", "title": "Levers and Gears", "related_content": ["cp_newtoniii", "cp_moments", "cp_equilibrium", "turning_gears", "gears_properties", "bicycle_gears", "multiple_reduction", "tuning_a_guitar", "spirograph"]}, {"concept_id": "cp_lorentz_transform", "title": "Lorentz Transforms", "related_content": []}, {"concept_id": "cp_projectiles", "title": "Projectiles", "related_content": []}, {"concept_id": "cp_doppler_effect", "title": "Doppler Effect", "related_content": ["cp_general_waves", "cp_em_waves", "conveying_the_doppler_effect", "doppler_model_aircraft", "doppler_siren_driving_past", "doppler_spectral_lines"]}, {"concept_id": "cp_uncertainties", "title": "Uncertainties", "related_content": []}, {"concept_id": "cp_electric_current", "title": "Electric Current", "related_content": ["cp_kirchhoffs_laws", "cp_alternating_current", "microscopic_current", "metal_squares", "electron_current", "lighting_a_lamp", "body_resistance", "conveying_current"]}, {"concept_id": "cp_lenzs_law", "title": "Lenz's Law", "related_content": ["cp_faradays_law", "cp_magnetic_field", "cp_electric_current", "coils_and_resistors", "em_induction_disc", "ring_drop", "ring_and_coil", "pushing_wire_through_field_num"]}, {"concept_id": "cp_newtoni", "title": "Newton's First Law", "related_content": ["cm_vectors", "cp_newtonii", "cp_newtoniii", "cp_force", "thinking_about_friction", "table_forces", "spring_and_thread", "block_friction", "a_toboggan", "three_spheres", "spheres_diff_sizes_num", "fairground_ride_num"]}, {"concept_id": "cp_ray_diagrams", "title": "Ray Diagrams", "related_content": ["the_anglerfish", "multicoloured_pinhole", "changing_perspective", "periscope", "moving_object", "seeing_double", "optical_path_difference", "out_of_the_shadows", "dark_rain", "off_the_optical_axis", "cp_lenses"]}, {"concept_id": "cp_dim_analysis", "title": "Dimensional Analysis", "related_content": ["cp_kinetic_energy", "cp_force", "cp_moment_inertia", "cp_moments", "cp_cons_momentum", "cp_angular_momentum", "cp_eq_of_motion", "cp_ang_eq_of_motion", "cp_power", "powerful_stuff", "kepleriii_num"]}, {"concept_id": "cp_nuclear_reactions", "title": "Nuclear Reactions", "related_content": ["cp_radioactive_decay"]}],
        "connections": [[12, 14, 23], [10, 20, 25], [29], [27, 29], [11, 24], [22, 24, 28], [7, 10, 21], [6, 26], [20], [15, 21, 25], [1, 6, 18, 20, 25], [4, 24], [0, 14, 23], [17, 25], [0, 12, 23], [9, 25], [27], [13], [10, 20], [21, 26], [1, 8, 10, 18, 25], [6, 9, 19, 25, 26], [5, 129], [0, 12, 14], [4, 5, 11], [1, 9, 10, 13, 15, 20, 21, 26], [7, 19, 21, 25], [3, 16], [5], [2, 3], [69], [], [44, 64, 88, 91, 95, 114, 115, 122, 132], [36, 49, 58, 73, 75, 84], [53, 61, 69], [52, 66, 86], [33, 37, 45, 50, 57, 66, 67, 70, 79, 89], [36], [], [82], [85], [56, 79], [74, 78, 87], [54, 55, 64], [32, 91, 107], [36, 61, 67, 77, 79], [74, 87], [54, 64, 80, 88], [], [33, 58, 75, 84], [36], [63, 65], [35, 66, 77], [34, 56, 61], [43, 47, 55, 64, 72, 80, 88], [43, 54, 64], [41, 53, 79], [36, 89], [33, 49, 73, 75, 76, 84], [68], [117, 125, 142], [34, 45, 53], [], [51, 65], [32, 43, 47, 54, 55, 80, 88], [51, 63], [35, 36, 52, 77, 86], [36, 45], [59], [30, 34, 85], [36], [], [54, 80], [33, 58, 76, 79, 84], [42, 46, 87, 90], [33, 49, 58, 77], [58, 73, 84], [45, 52, 66, 75, 89], [42, 83, 87], [36, 41, 45, 56, 73, 84], [47, 54, 64, 72, 88], [], [39], [78, 87, 155], [33, 49, 58, 73, 76, 79], [40, 69], [35, 66], [42, 46, 74, 78, 83], [32, 47, 54, 64, 80, 91], [36, 57, 77], [74], [32, 44, 88, 93, 94, 95, 96, 114, 115, 122, 132, 137, 158], [99, 102, 109, 120, 126, 128, 138], [91, 104, 115, 127, 132, 158], [91, 132, 142, 158], [32, 91, 101, 115, 120, 132, 137, 138, 140, 160], [91, 122, 136, 138], [], [114], [92, 100, 101, 104, 120, 128, 137, 138, 160], [99, 101, 104, 120, 121, 127, 136, 139, 160], [95, 99, 100, 104, 120, 127, 139, 160], [92, 108, 128, 139, 140], [118, 145, 150], [93, 99, 100, 101, 120, 127, 136, 139, 149], [113, 117, 134, 141], [110, 111, 113, 116, 156], [44, 135, 140, 156], [102], [92, 116, 126, 128, 160], [106, 113, 134, 156], [106, 116], [113, 135, 144, 147, 157], [105, 106, 110, 112, 116, 144, 157], [32, 91, 98, 115, 119, 121, 127, 132, 151, 158], [32, 91, 93, 95, 114, 119, 132, 151, 158], [106, 109, 111, 113, 148, 156], [60, 105, 124, 125, 134, 141], [103, 124, 143, 145, 146, 154], [114, 115, 132, 140], [92, 95, 99, 100, 101, 104, 121, 127, 160], [100, 114, 120, 122], [32, 91, 96, 121, 138], [124, 131], [117, 118, 123, 143, 146, 154], [60, 117, 134, 135, 141, 142], [92, 109, 140], [93, 100, 101, 104, 114, 120, 132, 151, 160], [92, 99, 102, 109, 134, 140, 142], [22], [131, 161], [123, 130, 161], [32, 91, 93, 94, 95, 114, 115, 119, 127, 137, 138, 139, 140, 158], [159], [105, 110, 117, 125, 128, 142], [107, 112, 125, 141, 157], [96, 100, 104, 149, 160], [91, 95, 99, 132, 140], [92, 95, 96, 99, 122, 132, 158], [100, 101, 102, 104, 132], [95, 102, 107, 119, 126, 128, 132, 137, 158, 160], [105, 117, 125, 135, 142], [60, 94, 125, 128, 134, 141], [118, 124], [112, 113, 157], [103, 118], [118, 124], [112, 156], [116], [104, 136], [103], [114, 115, 127], [], [], [118, 124], [83], [106, 107, 110, 116, 147, 157], [112, 113, 135, 144, 156], [91, 93, 94, 114, 115, 132, 138, 140], [133], [95, 99, 100, 101, 109, 120, 127, 136, 140], [130, 131]]
    };

    const initialNodes : SimulationNodeType[] = [];
    const initialEdges : SimulationEdgeType[] = [];
    const relatedContent : string[][] = [];

    const subjectDict : {[key: string]: string} = {
        "p" : "physics-node",
        "m" : "maths-node",
        "c" : "chemistry-node",
        "b" : "biology-node"
    };

    script_result.concepts.forEach(({concept_id, title, related_content} : {concept_id: string, title: string, related_content: string[]}, index : number) => {
        initialNodes.push({
            index: index,
            title: title,
            conceptId: concept_id,
            subject: subjectDict[concept_id[1]] ?? "",
            x: Math.random() * 500,
            y: Math.random() * 500,
            size: related_content.length,
        });
        relatedContent.push(related_content);
    });

    script_result.connections.forEach((row : number[], rowIndex : number) => {
        row.forEach((cell : number) => {
            if (rowIndex < cell) {
                initialEdges.push({
                    id: `e${rowIndex}-${cell}`,
                    source: initialNodes[rowIndex],
                    target: initialNodes[cell],
                    type: "straight",
                });
            }
        });
    });

    return {nodes: initialNodes, edges: initialEdges, adjacencyMatrix: script_result.connections, relatedContent: relatedContent};
};

const script_objects = scriptToJSObjects();
const INITIAL_NODES = script_objects.nodes;
const INITIAL_EDGES = script_objects.edges;
const ADJACENCY_MATRIX = script_objects.adjacencyMatrix;
const RELATED_CONTENT = script_objects.relatedContent;

let onTick = (_nodes: SimulationNodeType[], _edges: SimulationEdgeType[]) => {
    // do nothing
};

const simulation = forceSimulation(INITIAL_NODES)
    .force("edge", forceLink()
        // this is *really* strong for some reason
        .links(INITIAL_EDGES)
        .id((_n : SimulationNodeDatum, i : number) => i)
        .distance(10)
        .strength(0.6)
    )
    .force("collision", forceCollide()
        // spacing between all nodes, even those within cliques
        .strength(0.4)
        .radius((_d, index) => 30 + 3 * (INITIAL_NODES[index].size ?? 0))
    )
    .force("charge", forceManyBody()
        // spacing between cliques. the smaller the collision force's radius is compared to distanceMin, the further out the cliques will be spaced
        .distanceMax(1000)
        .distanceMin(200)
        .strength(-200)
        .theta(0.9)
    )
    .force("x", forceX()
        .x(250)
        .strength(0.01)
    )
    .force("y", forceY()
        .y(250)
        .strength(0.01)
    )
    .alpha(INITIAL_ALPHA)
    .alphaDecay(0.02)
    .alphaMin(MINIMUM_ALPHA)
    .alphaTarget(0)
    .velocityDecay(0.4);

simulation.on("tick", () => {
    // connect the simulation nodes and edges to the react flow state
    onTick(simulation.nodes(), INITIAL_EDGES);
});

interface NodeDataProps extends NodeProps {
    label?: string;
    conceptId?: string;
    className?: string;
    nodeSize?: number;
}

interface GraphNodeProps {
    data: NodeDataProps;
}

const GraphNode = (props: GraphNodeProps) => {
    const size = 30 + 3 * (props.data.nodeSize ?? 0);
    return <>
        <Handle type="target" position={Position.Top} />
        <div className={`p-2 text-center ${props.data.className}`} style={{width: size, height: size}}>
            <div className="concept-map-text-container">
                {props.data.label}
            </div>
        </div>
        <Handle type="source" position={Position.Top} />
    </>;
};


// TODO: custom edge
// interface GraphEdgeProps extends EdgeProps {
//     className?: string;
// }

// const GraphEdge = ({id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, style = {}, markerEnd, className}: GraphEdgeProps) => {
//     const [edgePath, labelX, labelY] = getStraightPath({sourceX, sourceY, targetX, targetY});

//     return <>
//         <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} className={className} />
//     </>;
// };

export const ConceptMap = () => {
    const nodeTypes = useMemo(() => ({ graphNode: GraphNode }), []);

    const [filterByProgress, setFilterByProgress] = useState<boolean>(true);
    const [bidirectionalConceptRelations, setBidirectionalConceptRelations] = useState<boolean>(false);
    const [showOnlyAnswered, setShowOnlyAnswered] = useState<boolean>(false);

    const [activeNode, setActiveNode] = useState<Node | undefined>(undefined);
    const [adjacentNodeIndices, setAdjacentNodesIndices] = useState<number[]>([]);
    const [visibleRelatedContent, setVisibleRelatedContent] = useState<string[][]>(RELATED_CONTENT);

    const [isNodeVisible, setIsNodeVisible] = useState<(i: number) => boolean>(() => (() => true));

    const [adjacencyMatrix, setAdjacencyMatrix] = useState<number[][]>([]);

    useEffect(() => {
        if (!filterByProgress) setShowOnlyAnswered(false);
    }, [filterByProgress]);

    useEffect(() => {
        // apparently, reactflow only updates if the simulation is running..?
        // this force-restarts the simulation with a low alpha to make it update but (hopefully) not move anything around.
        if (simulation.alpha() < MINIMUM_ALPHA) {
            simulation.alpha(MINIMUM_ALPHA + 0.001).restart();
        }
    }, [activeNode, filterByProgress, bidirectionalConceptRelations, showOnlyAnswered]);

    useEffect(() => {
        // TODO: when moving script out of python, transpose_or will need reimplementing here
        const transpose_or = (m : number[][]) => m;
        setAdjacencyMatrix(bidirectionalConceptRelations ? transpose_or(ADJACENCY_MATRIX) : ADJACENCY_MATRIX);
    }, [bidirectionalConceptRelations]);

    useEffect(() => {
        setAdjacentNodesIndices(activeNode ? adjacencyMatrix[activeNode.data.numericId] : []);
    }, [activeNode, adjacencyMatrix]);

    const [mapAnsweredToNodeQuestions, setMapAnsweredToNodeQuestions] = useState<(_n: number) => number>(() => ((n: number) => n));
    const [nodeQuestionsAnswered, setNodeQuestionsAnswered] = useState<string[][]>([]);

    const simulationNodeToReactFlowNode = useMemo(() => (node : SimulationNodeType) : Node => {
        return {
            id: "" + node.index,
            type: "graphNode",
            position: {x: node.x ?? 0, y: node.y ?? 0},
            data: { 
                label: node.title, 
                conceptId: node.conceptId, 
                className: `concept-map-node ${node.subject} ${activeNode && node.index === activeNode.data.numericId ? "active" : ""} ${!filterByProgress || ((node.index || node.index === 0) && nodeQuestionsAnswered[mapAnsweredToNodeQuestions(node.index)] && nodeQuestionsAnswered[mapAnsweredToNodeQuestions(node.index)].length > 0) ? "answered" : ""} ${node.index && adjacentNodeIndices.includes(node.index) ? "adjacent" : ""}`,
                nodeSize: node.size,
                numericId: node.index,
            }
        };
    }, [activeNode, filterByProgress, nodeQuestionsAnswered, mapAnsweredToNodeQuestions, adjacentNodeIndices]);
    
    const simulationEdgeToReactFlowEdge = useMemo(() => (edge : SimulationEdgeType) : Edge => {
        return {
            id: edge.id,
            source: "" + edge.source.index,
            target: "" + edge.target.index,
            type: edge.type ?? "default",
            data: {
                className: ``,
            }
        };
    }, []);

    const [nodes, setNodes] = useState(INITIAL_NODES.map(simulationNodeToReactFlowNode));
    const [edges, setEdges] = useState(INITIAL_EDGES.map(simulationEdgeToReactFlowEdge));

    useEffect(() => {
        let newNodes;
        if (showOnlyAnswered) {
            // reconstruct the important lists (nodes, edges, adjacency matrix, etc.) with only the relevant nodes.
            // this is currently quite inefficient but it's only run when the toggle changes, so workable for now.

            // get only the relevant nodes, i.e. those that have been answered and those that are adjacent to them
            const answeredNodeIds = INITIAL_NODES.map((_n, index) => nodeQuestionsAnswered[index] && nodeQuestionsAnswered[index].length > 0 ? index : undefined).filter((n) => n !== undefined) as number[];
            setMapAnsweredToNodeQuestions(() => ((n : number) => answeredNodeIds[n]));

            const answeredNodes = INITIAL_NODES.filter((_n, index) => answeredNodeIds.includes(index));
            // get nodes adjacent to the answered nodes
            const adjacentNodes = answeredNodes.flatMap((node : SimulationNodeType) => adjacencyMatrix[node.index ?? 0]);
            // get the union of the two, as SimulationNodeTypes; remove duplicates
            const relevantNodes = [...answeredNodes, ...INITIAL_NODES.filter((_n, i) => adjacentNodes.includes(i))].filter((n, i, a) => a.indexOf(n) === i);
            // get the ids of the relevant nodes
            const relevantNodeIds = relevantNodes.map(n => n.index);
            setIsNodeVisible(() => ((i : number) => relevantNodeIds.includes(i)));
            // remake the adjacency matrix by only considering the relevant nodes
            const newAdjacencyMatrix = adjacencyMatrix
                .filter((_n, i) => relevantNodeIds.includes(i))
                .map((row : number[]) => row.filter((cell : number) => relevantNodeIds.includes(cell)));
            // update the indices of the relevant nodes to match the new matrix
            relevantNodes.forEach((n, i) => n.index = i);

            const relevantEdges : SimulationEdgeType[] = [];
            
            newAdjacencyMatrix.forEach((row : number[], rowIndex : number) => {
                row.forEach((cell : number) => {
                    const mappedCell = relevantNodeIds.indexOf(cell);
                    if (rowIndex < mappedCell) {
                        relevantEdges.push({
                            id: `e22${rowIndex}-${mappedCell}`,
                            source: relevantNodes[rowIndex],
                            target: relevantNodes[mappedCell],
                            type: "straight",
                        });
                    }
                });
            });

            simulation.nodes(relevantNodes)
                // temporary fix to stop overlapping when there are fewer nodes on screen.
                .force("collision", forceCollide()
                .strength(0.8)
                .radius((_d, index) => 80 + 3 * (INITIAL_NODES[index].size ?? 0))
            );
            // we don't need to update the simulation edges, i think because we don't change the simulation node ids? 
            newNodes = relevantNodes.map(simulationNodeToReactFlowNode);
            setNodes(newNodes);
            setEdges(relevantEdges.map(simulationEdgeToReactFlowEdge));
            setAdjacencyMatrix(newAdjacencyMatrix);
        } else {
            simulation.nodes(INITIAL_NODES)
                .force("collision", forceCollide()
                .strength(0.4)
                .radius((_d, index) => 30 + 3 * (INITIAL_NODES[index].size ?? 0))
            );
            newNodes = INITIAL_NODES.map(simulationNodeToReactFlowNode);
            setNodes(newNodes);
            setEdges(INITIAL_EDGES.map(simulationEdgeToReactFlowEdge));
            setAdjacencyMatrix(ADJACENCY_MATRIX);
            setIsNodeVisible(() => (() => true));
            setMapAnsweredToNodeQuestions(() => ((n : number) => n));
        }

        setVisibleRelatedContent(newNodes.map((n) => RELATED_CONTENT[INITIAL_NODES.findIndex((i) => i.conceptId === n.data.conceptId)]));// RELATED_CONTENT[n.data.conceptId])); // RELATED_CONTENT.filter((_rc, i) => relevantNodeIds.includes(i)));
        simulation.alpha(INITIAL_ALPHA).restart();
        // this has quite a lot of cyclic dependencies that react wants...
        // we should only run it when the toggle changes.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [showOnlyAnswered]);

    const user = useAppSelector(selectors.user.orNull);
    const myAnsweredQuestionsIds = useAppSelector(selectors.user.answeredQuestionsIds);
    const [questionsRelatedToAttemptedConcepts, setQuestionsRelatedToAttemptedConcepts] = useState<string[]>([]);
    const [relatedUnseenConcepts, setRelatedUnseenConcepts] = useState<string[]>([]);
    const dispatch = useAppDispatch();

    useEffect(() => {
        if (user?.loggedIn) {
            dispatch(getMyAnsweredQuestionIds(user.id as number));
        }
    }, [user, dispatch]);

    useEffect(() => {
        if (myAnsweredQuestionsIds) {
            const simplifiedQuestionAttemptIds = (myAnsweredQuestionsIds as string[]).map((q : string) => q.split("|")[0]).filter((q, i, a) => a.indexOf(q) === i);
            setNodeQuestionsAnswered(RELATED_CONTENT.map((rc : string[]) => rc.filter((p : string) => simplifiedQuestionAttemptIds.includes(p))));

            // get the indices into INITIAL_NODES of the concepts which have related questions which have been attempted
            const attemptedConceptsIndices = RELATED_CONTENT.map((rc : string[], index : number) => rc.some((p : string) => simplifiedQuestionAttemptIds.includes(p)) ? index : undefined).filter((n) => n !== undefined) as number[];
            const attemptedConcepts = attemptedConceptsIndices.map((i : number) => INITIAL_NODES[i].conceptId);

            // find 3 questions, each related to an attempted concept which has not yet been answered
            const unansweredQuestions = attemptedConcepts.slice(0, 3).flatMap((c : string) => RELATED_CONTENT[INITIAL_NODES.findIndex((n) => n.conceptId === c)].find((q : string) => !isConceptPage(q) && !simplifiedQuestionAttemptIds.includes(q)) ?? []);
            setQuestionsRelatedToAttemptedConcepts(unansweredQuestions);

            // find 3 concepts, each related to an attempted concept, which has no answered questions
            const relatedUnseenConcepts = attemptedConcepts.slice(0, 3).flatMap((c : string) => RELATED_CONTENT[INITIAL_NODES.findIndex((n) => n.conceptId === c)].find((q : string) => isConceptPage(q) && !attemptedConcepts.includes(q)) ?? []);
            setRelatedUnseenConcepts(relatedUnseenConcepts);
        }
    }, [isNodeVisible, myAnsweredQuestionsIds]);

    const onNodeClick = useCallback((_event: unknown, node: Node) => {
        setActiveNode(nodes[parseInt(node.id)]);
    }, [nodes]);

    const onNodesChange = useCallback((changes: NodeChange[]) => {
        setNodes((nds: Node[]) => applyNodeChanges(changes, nds));
        const simulationNodes = simulation.nodes();
        let diff = 0;
        changes.forEach((changed: NodeChange) => {
            if (changed.type === "position") {
                const node = simulationNodes[parseInt(changed.id)];
                if (node) {
                    diff = ((node.fx ?? 0) - (changed.position?.x ?? 0)) || ((node.fy ?? 0) - (changed.position?.y ?? 0));
                    node.fx = changed.position?.x;
                    node.fy = changed.position?.y;
                    node.vx = 0;
                    node.vy = 0;
                }
            }
        });

        if (Math.abs(diff) > 0) {
            simulation.alpha(INITIAL_ALPHA).restart();
        }
    }, []);

    useEffect(() => {
        onTick = (simulationNodes: SimulationNodeType[], simulationEdges: SimulationEdgeType[]) => {
            // optimisation: change just the position of each rather than the entire list
            // unfortunately setState needs a new array.. :/
            const n = simulationNodes.map(simulationNodeToReactFlowNode);
            const e = simulationEdges.map(simulationEdgeToReactFlowEdge);
            // nodes.forEach((node: Node, index: number) => {
            //     node.position = {"x": simulationNodes[index].x ?? 0, "y": simulationNodes[index].y ?? 0};
            // }
            setNodes([...n]);
            setEdges([...e]);
        };
    }, [setNodes, setEdges, simulationEdgeToReactFlowEdge, simulationNodeToReactFlowNode]);

    const isConceptPage = (id : string) => id.startsWith("c") && id[2] === "_";

    const relatedConcepts = activeNode && visibleRelatedContent[activeNode.data.numericId].filter(isConceptPage);
    const relatedQuestions = activeNode && visibleRelatedContent[activeNode.data.numericId].filter(p => !isConceptPage(p));

    return <Container id="concept-map" className="pb-5">
        <TitleAndBreadcrumb currentPageTitle="Concept Map" />
        <Row>
            <Col xs={8} className="p-0">
                <div className="concept-map-bounding-box">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodeClick={onNodeClick}
                        onNodesChange={onNodesChange}
                        edgesFocusable={false}
                        edgesUpdatable={false}
                        nodeTypes={nodeTypes}
                        onPaneClick={() => { // unfortunately on mouse *up* rather than down, but it'll do
                            setActiveNode(undefined);
                        }} 
                    >
                        <Controls />
                        <MiniMap />
                        <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
                    </ReactFlow>
                </div>
            </Col>
            <Col xs={4} className="p-0">
                <div className="concept-map-bounding-box">
                    <div className="concept-map-related-content">
                        {activeNode ? <>
                            <h3><Link to={`/concepts/${activeNode.data.conceptId}`}>{activeNode.data.label}</Link></h3>

                            <div className="related-content-container">
                                {relatedConcepts && <>
                                    <p>Related concepts:</p>
                                    <ul>
                                        {/* these are currently *one-way*! two concepts may be joined but not appear in this list on one of the pages. */}
                                        {relatedConcepts.map((q : string, keyIndex : number) => <li key={keyIndex}><Link to={`/concepts/${q}`}>{q}</Link></li>)}
                                    </ul>
                                </>}

                                {relatedQuestions && <>
                                    <p>Related questions:</p>
                                    <ul>
                                        {relatedQuestions.map((q : string, keyIndex : number) => <li key={keyIndex}><Link to={`/questions/${q}`}>{q}</Link></li>)}
                                    </ul>
                                </>}
                            </div>
                        </> :
                        <div className="w-100 h-100 d-flex flex-column justify-content-center">
                            <span className="concept-map-side-help-text px-3">
                                Click on a node to view related questions.
                            </span>
                        </div>}
                    </div>
                    <div className="concept-map-filters">
                        <div className="ml-4">
                            <Input type="checkbox" id="progress-filter" name="progress-filter" onChange={() => setFilterByProgress(p => !p)} className="mr-1" checked={filterByProgress}/>
                            <label htmlFor="progress-filter">Filter by your progress</label>
                        </div>
                        <div className="ml-4">
                            <Input type="checkbox" disabled={!filterByProgress} id="only-answered-filter" name="only-answered-filter" onChange={() => setShowOnlyAnswered(a => !a)} className="mr-1" checked={showOnlyAnswered}/>
                            <label htmlFor="only-answered-filter" className={!filterByProgress ? "text-muted" : ""}>Only show your answered questions</label>
                        </div>
                        <div className="ml-4">
                            <Input type="checkbox" disabled={true} id="bidirectional-filter" name="bidirectional-filter" onChange={() => setBidirectionalConceptRelations(b => !b)} className="mr-1" checked={bidirectionalConceptRelations}/>
                            <label htmlFor="bidirectional-filter" className="text-muted">(todo) Bidirectional concept relations</label>
                        </div>
                        
                    </div>
                </div>
            </Col>
        </Row>
        <Row className="concept-map-suggested-content">
            <Col>
                <h3 className="mt-2">Suggested Content</h3>
                {/* 
                    "revise a topic" -> suggest a question page that's:
                         - not in the user's question attempts
                         - is related to a concept they've attempted
                         - has a difficulty rating of Px
                    "learn something new" -> suggest a concept page that:
                         - is related to a concept they've attempted
                         - but that they have no attempted questions in
                    "up for a challenge?" -> suggest a question that's:
                         - not in the user's question attempts
                         - is related to a concept they've attempted
                         - then best-effort the following:
                             - has a difficulty rating of Cx
                             - has a stage equal to the highest stage they've achieved in that topic
                */}
                <Row>
                    <Col>
                        {questionsRelatedToAttemptedConcepts.length > 0 && <div>
                            <p>Revise content you&apos;ve seen before:</p>
                            <ul>
                                {questionsRelatedToAttemptedConcepts.map((q : string, keyIndex : number) => <li key={keyIndex}><Link to={`/questions/${q}`}>{q}</Link></li>)}
                            </ul>
                        </div>}
                    </Col>
                    <Col>
                        {relatedUnseenConcepts.length > 0 && <div>
                            <p>Learn something new:</p>
                            <ul>
                                {relatedUnseenConcepts.map((q : string, keyIndex : number) => <li key={keyIndex}><Link to={`/concepts/${q}`}>{q}</Link></li>)}
                            </ul>
                        </div>}
                    </Col>    
                </Row>
            </Col>
        </Row>
    </Container>;
};