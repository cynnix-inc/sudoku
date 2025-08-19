Feature: Hints (MVP)
  Hints assist play with penalties and limits.

  @mvp @hints
  Scenario: Direct number placement hint
    Given a solvable cell exists
    When I use a Direct hint
    Then the correct value is placed in a cell
    And 30 seconds are added to my timer
    And the remaining hint count decreases

  @mvp @hints
  Scenario: Logic-based guidance hint
    Given a logically solvable cell exists
    When I use a Logic-based hint
    Then that cell and candidate are highlighted
    And a brief technique label is shown
    And 30 seconds are added to my timer

  @mvp @hints
  Scenario: Best time blocked when hints used
    Given I used at least one hint
    When I complete the puzzle
    Then my best time is not updated for that difficulty
