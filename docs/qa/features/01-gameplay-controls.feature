Feature: Gameplay and controls (MVP)
  As a player I want reliable input so I can solve puzzles efficiently.

  @mvp @controls
  Scenario: Place digit with numpad
    Given a selected empty cell
    And the numpad is unlocked with digit 5
    When I tap digit 5 on the numpad
    Then the cell shows 5
    And selection remains unless Auto-advance is ON

  @mvp @controls
  Scenario: Place digit with keyboard
    Given a selected empty cell
    When I press a number key "1"
    Then the cell shows 1

  @mvp @notes
  Scenario: Toggle notes mode
    Given a selected cell
    When I press the N key
    Then notes mode toggles

  @mvp @lock
  Scenario: Numpad lock places repeated digit
    Given the numpad lock is enabled on digit 7
    When I tap multiple empty cells
    Then 7 is placed in each cell

  @mvp @erase
  Scenario: Erase a value and its notes
    Given a cell contains a value and notes
    When I use the eraser on the cell
    Then the value and notes in that cell are cleared

  @mvp @erase @notes
  Scenario: Erase notes only for a selected digit
    Given a cell contains notes only
    And the active digit is 3
    When I use the eraser on the cell
    Then only note 3 toggles

  @mvp @undo
  Scenario: Undo/Redo actions
    Given I have placed a value then erased it
    When I tap Undo
    Then the erase is reverted
    And when I tap Redo
    Then the erase is reapplied

  @mvp @seed
  Scenario: Seed copy in footer
    Given the footer displays the puzzle seed
    When I tap the seed value
    Then the seed string is copied to the clipboard
    And a confirmation is displayed

  @mvp @pause
  Scenario: Manual pause and resume
    Given a running game
    When I tap the pause control
    Then the game shows a pause overlay and stops the timer
    When I resume
    Then gameplay and timer continue

  @mvp @idle
  Scenario: Idle auto-pause
    Given Auto-pause is on with a 2 minute timeout
    When I am inactive for 2 minutes
    Then the game pauses automatically
