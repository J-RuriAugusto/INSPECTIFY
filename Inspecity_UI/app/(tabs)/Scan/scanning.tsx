import React, { useEffect, useRef } from 'react';
import { View, Text, Image, StyleSheet, Dimensions, Animated } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { BlurView } from 'expo-blur';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const Scanning = () => {
  const params = useLocalSearchParams();
  // const router = useRouter();
  const photo = Array.isArray(params.photo) ? params.photo[0] : params.photo;
  const scanAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Scanning effect animation (moving up & down)
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, {
          toValue: hp(66.7), // 68% height
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(scanAnim, {
          toValue: hp(1), // 1% height
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [photo]);  

  return (
    <View style={styles.container}>
      {/* Full-screen image */}
      {photo ? (
        <Image source={{ uri: photo }} style={styles.fullScreenImage} />
      ) : (
        <Text style={styles.errorText}>No photo available</Text>
      )}

      {/* Blur overlay effect - top, bottom, left, and right */}
      <BlurView style={styles.topBlur} intensity={10} tint="light" />
      <BlurView style={styles.bottomBlur} intensity={10} tint="light" />
      <BlurView style={styles.leftBlur} intensity={10} tint="light" />
      <BlurView style={styles.rightBlur} intensity={10} tint="light" />

      {/* Scanning Overlay */}
      {/* <View style={styles.overlay}>
        <Text style={styles.title}>Analyzing the structures</Text>
        <Text style={styles.title}>for cracks and damages...</Text>
      </View> */}

      {/* Corner Brackets */}
      <View style={styles.cornersContainer}>
        <View style={[styles.corner, styles.topLeft]} />
        <View style={[styles.corner, styles.topRight]} />
        <View style={[styles.corner, styles.bottomLeft]} />
        <View style={[styles.corner, styles.bottomRight]} />
      </View>

      {/* Scanning Line */}
      <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanAnim }] }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#002B5B',
  },
  fullScreenImage: {
    width: wp(100),
    height: hp(100),
    resizeMode: 'cover',
  },
  topBlur: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: hp(15),
    zIndex: 1,
  },
  bottomBlur: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: hp(15),
    zIndex: 1,
  },
  leftBlur: {
    position: 'absolute',
    top: hp(15),
    left: 0,
    bottom: hp(15),
    width: wp(10),
    zIndex: 1,
  },
  rightBlur: {
    position: 'absolute',
    top: hp(15),
    right: 0,
    bottom: hp(15),
    width: wp(10),
    zIndex: 1,
  },
  // overlay: {
  //   position: 'absolute',
  //   top: 0,
  //   left: 0,
  //   right: 0,
  //   bottom: 0,
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   zIndex: 2,
  // },
  // title: {
  //   fontSize: wp(4.8),
  //   fontFamily: 'Epilogue-SemiBold',
  //   color: '#FFFFFF',
  //   textAlign: 'center',
  // },
  errorText: {
    color: '#FF5B5B',
    fontSize: wp(4.8),
    textAlign: 'center',
  },
  cornersContainer: {
    position: 'absolute',
    top: hp(15),
    left: wp(10),
    width: wp(80),
    height: hp(67.5),
  },
  corner: {
    position: 'absolute',
    width: wp(20),
    height: hp(15),
    borderColor: '#00A8E8',
    borderWidth: 4,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  scanLine: {
    position: 'absolute',
    top: hp(15.5),
    left: wp(10),
    width: wp(80),
    height: 4,
    backgroundColor: '#00A8E8',
    opacity: 0.8,
  },
});

export default Scanning;
