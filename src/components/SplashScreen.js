import React, {useEffect, useRef} from 'react';
import {Animated, Easing, Image, StyleSheet, Text, View} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {colors, radius} from '../theme/theme';

// Branded animated splash for a smooth app open. Logo scales + fades in with a
// gentle continuous pulse; wordmark + tagline rise up; calls onDone when done.
export default function SplashScreen({onDone}) {
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(1)).current;
  const textY = useRef(new Animated.Value(16)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const ring = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 5,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(ring, {
          toValue: 1,
          duration: 900,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(textY, {
          toValue: 0,
          duration: 450,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // Gentle breathing pulse on the logo.
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.06,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    ).start();

    const t = setTimeout(() => onDone && onDone(), 1650);
    return () => clearTimeout(t);
  }, [logoScale, logoOpacity, pulse, textY, textOpacity, ring, onDone]);

  const ringScale = ring.interpolate({inputRange: [0, 1], outputRange: [0.8, 1.8]});
  const ringOpacity = ring.interpolate({inputRange: [0, 1], outputRange: [0.5, 0]});

  return (
    <LinearGradient
      colors={['#2A1B4D', '#3B1D52', colors.bg]}
      style={styles.fill}>
      <View style={styles.center}>
        {/* expanding ring */}
        <Animated.View
          style={[
            styles.ring,
            {opacity: ringOpacity, transform: [{scale: ringScale}]},
          ]}
        />
        <Animated.View
          style={{
            opacity: logoOpacity,
            transform: [{scale: Animated.multiply(logoScale, pulse)}],
          }}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>

        <Animated.View
          style={{opacity: textOpacity, transform: [{translateY: textY}]}}>
          <Text style={styles.brand}>Dhun</Text>
          <Text style={styles.tagline}>Feel every beat</Text>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  fill: {flex: 1},
  center: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  ring: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: '#EC4899',
    top: '50%',
    marginTop: -105,
  },
  logo: {
    width: 108,
    height: 108,
    borderRadius: radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.6,
    shadowRadius: 24,
    shadowOffset: {width: 0, height: 10},
    elevation: 18,
  },
  brand: {
    color: '#fff',
    fontSize: 40,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 28,
    letterSpacing: 1,
  },
  tagline: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
});
