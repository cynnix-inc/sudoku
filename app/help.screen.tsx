import React, { useContext, useState } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { ThemeContext } from './_layout';

type HelpSection = 'rules' | 'techniques' | 'controls' | 'stats' | 'about';

export default function HelpScreen() {
  const theme = useContext(ThemeContext);
  const [activeSection, setActiveSection] = useState<HelpSection>('rules');

  const sections: { key: HelpSection; title: string }[] = [
    { key: 'rules', title: 'How to Play' },
    { key: 'techniques', title: 'Techniques Primer' },
    { key: 'controls', title: 'Controls Guide' },
    { key: 'stats', title: 'Stats Explainer' },
    { key: 'about', title: 'About' },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'rules':
        return (
          <View>
            <Text
              style={{ fontSize: 18, fontWeight: '600', marginBottom: 12, color: theme.foreground }}
            >
              How to Play Sudoku
            </Text>
            <Text
              style={{ fontSize: 16, lineHeight: 24, marginBottom: 16, color: theme.foreground }}
            >
              Sudoku is a logic-based number placement puzzle. The goal is to fill a 9×9 grid with
              digits so that each column, each row, and each of the nine 3×3 subgrids contains all
              of the digits from 1 to 9.
            </Text>
            <Text
              style={{ fontSize: 16, lineHeight: 24, marginBottom: 16, color: theme.foreground }}
            >
              • Each row must contain the numbers 1-9 without repetition{'\n'}• Each column must
              contain the numbers 1-9 without repetition{'\n'}• Each 3×3 box must contain the
              numbers 1-9 without repetition{'\n'}• Some numbers are given as clues and cannot be
              changed
            </Text>
            <Text style={{ fontSize: 16, lineHeight: 24, color: theme.foreground }}>
              Start with the given numbers and use logic to determine where the remaining numbers
              should go. The puzzle is solved when every cell contains a number and all the rules
              are satisfied.
            </Text>
          </View>
        );

      case 'techniques':
        return (
          <View>
            <Text
              style={{ fontSize: 18, fontWeight: '600', marginBottom: 12, color: theme.foreground }}
            >
              Solving Techniques
            </Text>
            <Text
              style={{ fontSize: 16, lineHeight: 24, marginBottom: 16, color: theme.foreground }}
            >
              Here are some fundamental techniques to help you solve Sudoku puzzles:
            </Text>
            <Text
              style={{ fontSize: 16, lineHeight: 24, marginBottom: 16, color: theme.foreground }}
            >
              <Text style={{ fontWeight: '600' }}>Single Candidate:</Text> When a cell has only one
              possible number, place it there.{'\n\n'}
              <Text style={{ fontWeight: '600' }}>Single Position:</Text> When a number can only go
              in one place in a row, column, or box, place it there.{'\n\n'}
              <Text style={{ fontWeight: '600' }}>Elimination:</Text> Use the given numbers to
              eliminate possibilities from other cells.{'\n\n'}
              <Text style={{ fontWeight: '600' }}>Notes:</Text> Use the notes feature to mark
              possible numbers in cells when you're unsure.
            </Text>
            <Text style={{ fontSize: 16, lineHeight: 24, color: theme.foreground }}>
              Start with easier puzzles to practice these techniques. As you improve, you'll
              discover more advanced strategies.
            </Text>
          </View>
        );

      case 'controls':
        return (
          <View>
            <Text
              style={{ fontSize: 18, fontWeight: '600', marginBottom: 12, color: theme.foreground }}
            >
              Game Controls
            </Text>
            <Text
              style={{ fontSize: 16, lineHeight: 24, marginBottom: 16, color: theme.foreground }}
            >
              Here's how to control the game:
            </Text>
            <Text
              style={{ fontSize: 16, lineHeight: 24, marginBottom: 16, color: theme.foreground }}
            >
              <Text style={{ fontWeight: '600' }}>Cell Selection:</Text> Tap on any empty cell to
              select it.{'\n\n'}
              <Text style={{ fontWeight: '600' }}>Number Input:</Text> Use the number pad at the
              bottom to place numbers.{'\n\n'}
              <Text style={{ fontWeight: '600' }}>Notes Mode:</Text> Long press the notes button to
              toggle notes mode for marking possibilities.{'\n\n'}
              <Text style={{ fontWeight: '600' }}>Erase:</Text> Use the eraser tool to clear numbers
              or notes.{'\n\n'}
              <Text style={{ fontWeight: '600' }}>Undo/Redo:</Text> Use the arrow buttons to undo or
              redo your moves.{'\n\n'}
              <Text style={{ fontWeight: '600' }}>Hints:</Text> Use the hint button when you're
              stuck to get help.
            </Text>
            <Text style={{ fontSize: 16, lineHeight: 24, color: theme.foreground }}>
              The game automatically saves your progress, so you can return to incomplete puzzles
              later.
            </Text>
          </View>
        );

      case 'stats':
        return (
          <View>
            <Text
              style={{ fontSize: 18, fontWeight: '600', marginBottom: 12, color: theme.foreground }}
            >
              Understanding Your Stats
            </Text>
            <Text
              style={{ fontSize: 16, lineHeight: 24, marginBottom: 16, color: theme.foreground }}
            >
              Track your progress and performance with detailed statistics:
            </Text>
            <Text
              style={{ fontSize: 16, lineHeight: 24, marginBottom: 16, color: theme.foreground }}
            >
              <Text style={{ fontWeight: '600' }}>Games Played:</Text> Total number of games you've
              started.{'\n\n'}
              <Text style={{ fontWeight: '600' }}>Wins:</Text> Games you've successfully completed.
              {'\n\n'}
              <Text style={{ fontWeight: '600' }}>Losses:</Text> Games where you ran out of lives or
              gave up.{'\n\n'}
              <Text style={{ fontWeight: '600' }}>Win Rate:</Text> Percentage of games you've won.
              {'\n\n'}
              <Text style={{ fontWeight: '600' }}>Best Times:</Text> Your fastest completion times
              by difficulty level.{'\n\n'}
              <Text style={{ fontWeight: '600' }}>Daily Results:</Text> Your performance on daily
              challenge puzzles.
            </Text>
            <Text style={{ fontSize: 16, lineHeight: 24, color: theme.foreground }}>
              Use these stats to track your improvement and set personal goals for faster solving
              times.
            </Text>
          </View>
        );

      case 'about':
        return (
          <View>
            <Text
              style={{ fontSize: 18, fontWeight: '600', marginBottom: 12, color: theme.foreground }}
            >
              About Ultimate Sudoku
            </Text>
            <Text
              style={{ fontSize: 16, lineHeight: 24, marginBottom: 16, color: theme.foreground }}
            >
              Ultimate Sudoku is a modern, accessible Sudoku game designed to provide an engaging
              puzzle-solving experience for players of all skill levels.
            </Text>
            <Text
              style={{ fontSize: 16, lineHeight: 24, marginBottom: 16, color: theme.foreground }}
            >
              <Text style={{ fontWeight: '600' }}>Version:</Text> MVP v0.9{'\n\n'}
              <Text style={{ fontWeight: '600' }}>Features:</Text>
              {'\n'}• Classic 9×9 Sudoku puzzles{'\n'}• Daily challenge puzzles{'\n'}• Multiple
              difficulty levels{'\n'}• Comprehensive statistics tracking{'\n'}• Accessibility
              features{'\n'}• Dark/light theme support{'\n\n'}
              <Text style={{ fontWeight: '600' }}>Accessibility:</Text> Built with screen reader
              support, keyboard navigation, and high contrast themes.
            </Text>
            <Text
              style={{ fontSize: 16, lineHeight: 24, marginBottom: 16, color: theme.foreground }}
            >
              <Text style={{ fontWeight: '600' }}>Credits:</Text> Developed by the Ultimate Sudoku
              team with a focus on user experience and accessibility.
            </Text>
            <Text style={{ fontSize: 16, lineHeight: 24, color: theme.foreground }}>
              For support or feedback, please visit our GitHub repository or contact the development
              team.
            </Text>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 12 }}>
      <Text style={{ fontSize: 24, fontWeight: '700', marginBottom: 16, color: theme.foreground }}>
        Help & About
      </Text>

      {/* Navigation Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
        {sections.map((section) => (
          <Pressable
            key={section.key}
            onPress={() => setActiveSection(section.key)}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              marginRight: 8,
              borderRadius: 20,
              backgroundColor:
                activeSection === section.key
                  ? theme.isDark
                    ? '#3b82f6'
                    : '#2563eb'
                  : theme.isDark
                    ? '#374151'
                    : '#e5e7eb',
            }}
            accessibilityRole="button"
            accessibilityLabel={`${section.title} section`}
            accessibilityState={{ selected: activeSection === section.key }}
          >
            <Text
              style={{
                color: activeSection === section.key ? '#ffffff' : theme.foreground,
                fontWeight: activeSection === section.key ? '600' : '400',
              }}
            >
              {section.title}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Content */}
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        {renderSection()}
      </ScrollView>
    </View>
  );
}
