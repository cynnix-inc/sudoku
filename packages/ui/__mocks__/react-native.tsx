import React from 'react';

export const Text = ({ children, ...props }: any) => {
  return React.createElement('span', props, children);
};

export const View = ({ children, ...props }: any) => {
  return React.createElement('div', props, children);
};

export const Switch = ({ value, onValueChange, ...props }: any) => {
  return React.createElement('input', {
    type: 'checkbox',
    checked: value,
    onChange: (e: any) => onValueChange?.(e.target.checked),
    ...props
  });
};

export const Pressable = ({ children, onPress, ...props }: any) => {
  return React.createElement('button', {
    onClick: onPress,
    ...props
  }, children);
};

export const useColorScheme = () => 'light';

export const Appearance = {
  addChangeListener: (callback: any) => {
    // Mock implementation that returns a subscription object
    return { remove: () => {} };
  },
  getColorScheme: () => 'light',
};

export default {
  Text,
  View,
  Switch,
  Pressable,
  useColorScheme,
  Appearance,
};
