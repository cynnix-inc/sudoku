import React, { useContext } from 'react';
import { Text } from 'react-native';
import { ThemeContext } from '../_layout';

type SeedFooterProps = {
  seed: string;
};

export default function SeedFooter({ seed }: SeedFooterProps) {
  const theme = useContext(ThemeContext);
  return (
    <Text
      accessibilityLabel="Seed footer"
      style={{ fontSize: 12, opacity: 0.6, marginTop: 12, color: theme.foreground }}
    >
      Seed: {seed}
    </Text>
  );
}
