import React from 'react';
import { View, StyleSheet } from 'react-native';
import theme from '../utils/theme';

const Card = ({ children, style, elevated = true }) => {
  return <View style={[styles.card, elevated ? styles.boxShadow : null, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.card || '#fff',
    borderRadius: 14,
    padding: 16,
    marginVertical: 10,
    width: '100%',
    borderWidth: 1,
    borderColor: theme.border || '#eee',
  },
  boxShadow: {
    boxShadow: '0 6px 18px rgba(43,198,207,0.08)',
  },
});

export default Card;
