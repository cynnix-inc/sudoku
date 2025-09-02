Feature: Ultimate Sudoku Levels — Generation, Validation, and UI hooks
  The engine and UI should support six levels with deterministic, no-guessing rules.

  @ultimate @levels @novice
  Scenario: Novice generation and validation
    When a Novice puzzle is generated
    Then the puzzle has exactly one solution
    And allowed techniques are singles only

  @ultimate @levels @skilled
  Scenario: Skilled generation and validation
    When a Skilled puzzle is generated
    Then the puzzle has exactly one solution
    And techniques include pairs and box-line at most

  @ultimate @levels @advanced
  Scenario: Advanced generation and validation
    When an Advanced puzzle is generated
    Then the puzzle has exactly one solution
    And techniques include pointing pairs/triples and simple coloring

  @ultimate @levels @expert
  Scenario: Expert generation and validation
    Given an Expert puzzle
    When validated by the solver
    Then hardest technique is within multi-coloring/X-Wing/Swordfish limits

  @ultimate @levels @fiendish
  Scenario: Fiendish generation and validation
    Given a Fiendish puzzle
    When validated by the solver
    Then techniques may include XY/XYZ-Wing and forcing/alternating chains

  @ultimate @levels @ultimate
  Scenario: Ultimate generation and validation
    Given an Ultimate puzzle
    When validated by the solver
    Then techniques may include Nishio and long chains without guessing


