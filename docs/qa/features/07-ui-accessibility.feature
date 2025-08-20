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

  @mvp @a11y @contrast
  Scenario: Contrast meets WCAG AA
    When rendering key UI
    Then text and essential controls meet AA contrast

  @mvp @a11y @sr
  Scenario: Screen reader labels for cells
    Given a cell receives focus
    Then the screen reader announces row and column
    And announces the value or "empty"

  @mvp @a11y @ui @issue-112
  Scenario: Hearts-only lives with accessible label
    Given the header renders lives as hearts icons only
    Then the lives container exposes an accessible label like "3 lives remaining"

  @mvp @a11y @ui @tools @issue-111
  Scenario: Tool icons have descriptive labels and focus rings
    Given the tool row shows icon-only buttons
    When I navigate by keyboard or screen reader
    Then each tool announces a descriptive label (e.g., "Undo move") and shows a visible focus indicator

  @mvp @ui @timer @issue-116
  Scenario: Timer uses icon-only pause control without label
    Given the game is running
    When I view the header
    Then I see the time value and a pause icon
    And I do not see a textual label for "Timer"
    When I activate the pause icon
    Then the game pauses and the timer stops

  @mvp @ui @responsive @issue-117
  Scenario: Responsive layout across mobile and desktop
    Given a small mobile viewport width
    When the game screen renders
    Then the 9×9 grid is fully visible without overflow
    And the numpad remains a single row with adequate hit targets
    Given a tablet or desktop viewport
    When the game screen renders
    Then the grid is centered with spacing and the numpad aligns to the grid width
