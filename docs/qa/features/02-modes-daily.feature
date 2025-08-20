Feature: Modes and Daily calendar (MVP)
  Ensure Classic and Daily behave as specified.

  @mvp @classic
  Scenario: Start Classic with a selected difficulty
    Given I am on the Home screen
    When I choose Classic and select "Expert"
    Then an Expert puzzle is generated and loaded

  @mvp @daily @utc
  Scenario: Daily is deterministic by UTC date
    Given the current UTC date is 2025-08-18
    When I open Daily on any device
    Then the same puzzle is loaded for that date

  @mvp @daily @seed
  Scenario: Daily displays a numeric seed
    Given I open the Daily puzzle
    Then I see the puzzle seed displayed as a numeric string in the footer

  @mvp @daily @calendar
  Scenario: Calendar shows streaks and allows past plays
    Given I am on the Daily calendar
    Then I see my current and best streaks
    When I tap a past date
    Then that day's puzzle opens
    And future dates cannot be opened

  @mvp @lives
  Scenario: Lives decrement on wrong solution entry
    Given a Hard puzzle with 4 lives
    When I enter an incorrect value
    Then my remaining lives decrease by 1
    And if lives reach 0 I lose the game
