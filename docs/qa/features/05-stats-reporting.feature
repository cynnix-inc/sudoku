Feature: Stats and reporting (MVP)
  Track outcomes and visualize progress.

  @mvp @stats
  Scenario: Win rate and totals
    Given I have played multiple games
    When I view Stats
    Then I see Total Wins, Total Losses, and Win Rate overall and per difficulty

  @mvp @stats
  Scenario: By-difficulty chart
    Given games across difficulties
    When I open Stats
    Then I see Played, Wins, Win%, and Best Time for each difficulty

  @mvp @stats
  Scenario: Time distribution graph updates
    Given I complete a game
    When I open the time distribution graph
    Then it includes my latest completion time

  @mvp @history
  Scenario: Game history entry recorded
    Given I finish a game
    Then an entry is saved with type, variant, difficulty, time, win/loss, hints used, and mistakes
