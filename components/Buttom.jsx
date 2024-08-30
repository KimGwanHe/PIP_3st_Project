import { Pressable, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import React from 'react';
import { theme } from '../constants/theme';
import { hp, wp } from '../constants/common';

const Button = ({
    buttonStyle,
    textStyle,
    title = '',
    onPress = () => {},
    loading = false,
    hasShadow = true,
}) => {

    const shadowStyle = {
        shadowColor: theme.colors.dark,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.8,
        elevation: 4,
    };

    if (loading) {
        return (
            <View style={[styles.button, buttonStyle, { backgroundColor: 'white' }]}>
                <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <Pressable onPress={onPress} style={[styles.button, buttonStyle, hasShadow && shadowStyle]}>
            <Text style={[styles.text, textStyle]}>{title}</Text>
        </Pressable>
    );
};

export default Button;

const styles = StyleSheet.create({
    button: {
        backgroundColor: theme.colors.primary,
        height: hp(15),
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: theme.radius.xl,
    },
    text: {
        fontSize: hp(5),
        color: '#535252',
        fontWeight: theme.fonts.bold,
    },
});
