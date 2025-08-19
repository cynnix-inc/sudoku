Feature: Navigation and Help/About (MVP)
  Simple navigation and clear help content.

  @mvp @nav
  Scenario: Main menu navigation
    Given I am on the home screen
    When I select Play Classic / Daily / Stats / Settings / Help
    Then the respective screen opens

  @mvp @nav
  Scenario: Home button returns to main
    Given I am within a game
    When I press the Home button
    Then I return to the main menu
    And my in-progress game remains saved

  @mvp @help
  Scenario: Help/About content availability
    When I open Help/About
    Then I can access Rules, Techniques, Controls, Stats explainer, Credits, and Version info
