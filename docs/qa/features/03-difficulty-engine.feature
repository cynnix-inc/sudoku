Feature: Difficulty generation and rating (MVP)
  The generator must produce puzzles that match thresholds and uniqueness.

  @mvp @difficulty
  Scenario: Generated puzzles are unique
    When a puzzle is generated
    Then it has exactly one solution

  @mvp @difficulty @expert
  Scenario: Expert tier conformance
    Given an Expert puzzle
    When rated by the human-like solver
    Then the hardest technique is at most L4
    And chain length is at most 5
    And technique counts are within thresholds

  @mvp @performance
  Scenario: Generation performance meets budget
    When generating 1000 puzzles per tier
    Then average time is within tier targets
    And the 95th percentile duration is <= 5 seconds
