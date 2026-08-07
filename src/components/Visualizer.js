import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet, View} from 'react-native';

// Animated equalizer bars. Pulses while `playing` is true, using the current
// song's color. Pure JS (Animated) — no native module required.
export default function Visualizer({playing, color = '#1DB954', bars = 5, height = 46}) {
  const values = useRef(
    Array.from({length: bars}, () => new Animated.Value(0.3)),
  ).current;

  useEffect(() => {
    let loops = [];
    if (playing) {
      loops = values.map((v, i) => {
        const animate = () =>
          Animated.sequence([
            Animated.timing(v, {
              toValue: 1,
              duration: 260 + ((i * 70) % 300),
              useNativeDriver: true,
            }),
            Animated.timing(v, {
              toValue: 0.28,
              duration: 220 + ((i * 90) % 260),
              useNativeDriver: true,
            }),
          ]);
        const loop = Animated.loop(animate());
        loop.start();
        return loop;
      });
    } else {
      values.forEach(v =>
        Animated.timing(v, {
          toValue: 0.25,
          duration: 250,
          useNativeDriver: true,
        }).start(),
      );
    }
    return () => loops.forEach(l => l.stop());
  }, [playing, values]);

  return (
    <View style={[styles.row, {height}]}>
      {values.map((v, i) => (
        <Animated.View
          key={i}
          style={[
            styles.bar,
            {
              backgroundColor: color,
              height,
              transform: [{scaleY: v}],
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5},
  bar: {width: 5, borderRadius: 3, marginHorizontal: 3},
});
