Feature: Storage and sync (MVP)
  Ensure local persistence and baseline cloud sync.

  @mvp @storage
  Scenario: Local restore after reload
    Given I have a mid-game saved locally
    When I reload the app
    Then my progress, settings, and stats are restored

  @mvp @sync
  Scenario: Baseline cloud sync
    Given I am signed in on Device A
    When I complete a game
    Then my stats and settings sync to the cloud
    And Device B reflects the changes on next open or sync

  @mvp @conflict
  Scenario: Field-level conflict resolution
    Given different settings on Device A and Device B
    When both devices sync
    Then newer per-field timestamps win
    And major conflicts notify me
