Feature: UI/UX and accessibility (MVP)
  Provide a consistent, accessible experience.

  @mvp @confetti
  Scenario: Confetti shown for unassisted win
    Given I win with zero hints used
    Then a confetti animation is shown
    And a results banner displays my time, difficulty, and lives used

  @mvp @haptics
  Scenario: Haptics on placement and errors
    Given my device supports haptics
    When I place a digit or trigger an error highlight
    Then I feel a brief haptic pulse

  @mvp @a11y @keyboard
  Scenario: Keyboard navigation across the grid
    Given focus is on a cell
    When I press arrow keys
    Then focus moves with a visible focus ring

  @mvp @seed @toast
  Scenario: Seed footer copies without underline and without layout shift (#261)
    Given the seed is shown in the footer
    When I tap the seed value
    Then the seed is copied to the clipboard
    And the seed text is not underlined
    And a non-shifting confirmation appears

  @mvp @a11y @contrast
  Scenario: Contrast meets WCAG AA
    When rendering key UI
    Then text and essential controls meet AA contrast

  @mvp @a11y @sr
  Scenario: Screen reader labels for cells
    Given a cell receives focus
    Then the screen reader announces row and column
    And announces the value or "empty"
