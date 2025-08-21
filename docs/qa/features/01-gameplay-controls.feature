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

  @mvp @ui @web @issue-110
  Scenario: Numpad aligns to board and does not wrap
    Given the game screen on a common device width
    When the numpad renders
    Then digits 1–9 appear in a single row without wrapping
    And the numpad width matches the grid width

  @mvp @ui @issue-111
  Scenario: Tools are icon-only buttons below the numpad
    Given the Classic screen is rendered
    When the tools render
    Then Notes, Pause/Resume, Erase, Undo, and Redo are icon-only buttons
    And each tool exposes a clear accessible label for screen readers

  @mvp @web @keyboard @issue-106
  Scenario: Prevent browser shortcuts and scrolling for handled keys on web
    Given the Classic screen is focused in a web environment
    When I press handled keys like Arrow keys, digits, Backspace, or N
    Then the app prevents default browser behavior such as scrolling or shortcuts

  @mvp @notes
  Scenario: Toggle notes mode
    Given a selected cell
    When I press the N key
    Then notes mode toggles

  @mvp @storage @issue-107
  Scenario: Persist UI toggles across sessions
    Given I enable notes mode and pause the game and lock a digit
    When I restart the app
    Then notes mode, paused state, and the locked digit are restored

  @mvp @lock
  Scenario: Numpad lock places repeated digit
    Given the numpad lock is enabled on digit 7
    When I tap multiple empty cells
    Then 7 is placed in each cell

  @mvp @lock @tools @issue-118
  Scenario: Lock toggle in tool row locks the active digit
    Given digit 4 is the active input
    And I toggle the Lock icon in the tool row ON
    When I tap multiple empty cells
    Then 4 is placed in each tapped cell until I toggle Lock OFF

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

  @mvp @undo @lives
  Scenario: Undo/Redo does not change lives
    Given I have made a mistake that decremented lives
    When I tap Undo
    Then the board state reverts but the lives count remains unchanged
    And when I tap Redo
    Then the board state reapplies and the lives count remains unchanged

  @mvp @end @issue-108
  Scenario: End-state banner and restart
    Given I have solved the puzzle or lost all lives
    Then I see an end-state banner with a message
    And I can restart the puzzle with the same seed

  @mvp @ui @numpad @issue-110
  Scenario: Numpad is a single row aligned to the grid
    Given the game screen is visible
    When the numpad renders
    Then digits 1 through 9 appear on a single row without wrapping
    And the numpad width aligns to the grid width

  @mvp @ui @tools @issue-111
  Scenario: Tools are icon-only and below the numpad
    Given the game screen is visible
    When the tool row renders
    Then I see icon-only buttons for Hint, Undo, Redo, Lock, Notes, and Erase below the numpad
    And each tool has an accessible label

  @mvp @seed @issue-63
  Scenario: Seed copy in footer
    Given the footer displays the puzzle seed
    When I tap the seed copy control
    Then the seed string is copied to the clipboard
    And a confirmation is displayed

  @mvp @pause @issue-105
  Scenario: Manual pause and resume
    Given a running game
    When I tap the pause control
    Then the game shows a pause overlay and stops the timer
    When I resume
    Then gameplay and timer continue

  @mvp @highlight @issue-115
  Scenario: Highlight same digits when selecting a number
    Given the grid contains multiple cells with the value 6
    When I select a cell that has the value 6
    Then all cells with value 6 are highlighted
    And the numpad key 6 is highlighted

  @mvp @idle @issue-105
  Scenario: Idle auto-pause
    Given Auto-pause is on with a 2 minute timeout
    When I am inactive for 2 minutes
    Then the game pauses automatically
