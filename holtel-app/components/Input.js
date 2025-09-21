import React, { useState } from 'react';
import { TextInput, StyleSheet, View, Platform, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import theme from '../utils/theme';

const Input = ({ style, placeholderTextColor = '#333', secureTextEntry, ...props }) => {
  const [show, setShow] = useState(false);
  const isPassword = !!secureTextEntry;
  return (
    <View style={styles.wrapper}>
      <TextInput
        {...props}
        placeholderTextColor={placeholderTextColor}
        style={[styles.input, style, isPassword ? { paddingRight: 40 } : null]}
        underlineColorAndroid="transparent"
        autoCapitalize={props.autoCapitalize ?? 'none'}
        secureTextEntry={isPassword && !show}
      />
      {isPassword && (
        <TouchableOpacity
          style={styles.eyeBtn}
          onPress={() => setShow(s => !s)}
          activeOpacity={0.7}
        >
          <MaterialIcons name={show ? 'visibility' : 'visibility-off'} size={22} color={theme.muted} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    alignSelf: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  input: {
    // remove heavy grid/border lines to match the new soft UI
    borderWidth: 0,
    borderColor: 'transparent',
    borderRadius: 12,
    width: '100%',
    maxWidth: 360,
    alignSelf: 'center',
    // ensure padding/border are included in width on web
    boxSizing: 'border-box',
    marginBottom: 12,
    height: 56,
    fontSize: 16,
    paddingHorizontal: 14,
    paddingVertical: Platform.select({ ios: 14, android: 12, default: 14 }),
    backgroundColor: '#fff',
    color: theme.text,
    textAlignVertical: 'center',
  },
  eyeBtn: {
    position: 'absolute',
    right: 16,
    top: 17,
    zIndex: 2,
    padding: 4,
  },

});

export default Input;
