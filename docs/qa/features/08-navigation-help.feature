Feature: Navigation and Help/About (MVP)
  Simple navigation and clear help content.

  @mvp @nav
  Scenario: Main menu navigation
    Given I am on the home screen
    When I select Play Classic / Daily / Stats / Settings / Help
    Then the respective screen opens

  @mvp @nav @daily
  Scenario: Daily route is not available (SPA model) (#279)
    Given I navigate to "/daily"
    Then I see a friendly not-found message
    And I see a link to return Home

  @mvp @nav @daily
  Scenario: Daily opens from Home without changing URL (#279)
    Given I am on the home screen
    When I select Daily
    Then the Daily screen opens

  @mvp @nav @notfound
  Scenario: Not-found page is friendly and does not expose site map (#279)
    Given I navigate to "/this/route/does-not-exist"
    Then I see a friendly not-found message
    And I see a link to return Home
    And the full site map is not exposed
    # Tracking: SPA not-found boundary (#279)

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
