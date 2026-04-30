import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Dimensions, 
  TouchableOpacity, 
  Animated, 
  Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Rocket, 
  Trophy, 
  BookOpen, 
  Zap, 
  GraduationCap,
  Sparkles,
  Globe
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

// --- Floating Icon Component ---
const FloatingIcon = ({ Icon, size, color, delay, initialPos, duration = 4000 }) => {
  const moveAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(moveAnim, {
          toValue: 1,
          duration: duration,
          useNativeDriver: true,
        }),
        Animated.timing(moveAnim, {
          toValue: 0,
          duration: duration,
          useNativeDriver: true,
        }),
      ])
    ).start();

    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: duration * 2,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateY = moveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={[
      styles.floatingIcon, 
      initialPos, 
      { transform: [{ translateY }, { rotate }] }
    ]}>
      <Icon size={size} color={color} strokeWidth={1.5} />
    </Animated.View>
  );
};

export default function OnboardingScreen({ navigation }) {
  const slideUpAnim = useRef(new Animated.Value(100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideUpAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Top Background Gradient */}
      <LinearGradient
        colors={['#FFF7ED', '#FFE4D6']}
        style={styles.topSection}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Floating Illustrations */}
          <View style={styles.illustrationArea}>
            <FloatingIcon Icon={GraduationCap} size={50} color="rgba(249, 115, 22, 0.4)" delay={0} initialPos={{ top: '10%', left: '15%' }} duration={4500} />
            <FloatingIcon Icon={Rocket} size={40} color="rgba(249, 115, 22, 0.3)" delay={500} initialPos={{ top: '25%', right: '15%' }} duration={5000} />
            <FloatingIcon Icon={Globe} size={60} color="rgba(249, 115, 22, 0.5)" delay={1000} initialPos={{ top: '50%', left: '10%' }} duration={6000} />
            <FloatingIcon Icon={Trophy} size={45} color="rgba(249, 115, 22, 0.4)" delay={200} initialPos={{ bottom: '20%', right: '10%' }} duration={5500} />
            <FloatingIcon Icon={Sparkles} size={30} color="rgba(249, 115, 22, 0.3)" delay={800} initialPos={{ bottom: '30%', left: '30%' }} duration={4000} />
            <FloatingIcon Icon={BookOpen} size={35} color="rgba(249, 115, 22, 0.4)" delay={400} initialPos={{ top: '40%', right: '35%' }} duration={4800} />
            
            {/* Center Branding */}
            <Animated.View style={[styles.brandingContainer, { opacity: fadeAnim }]}>
              <View style={styles.logoCircle}>
                <Zap size={48} color="#F97316" fill="#F97316" />
              </View>
              <Text style={styles.brandTitle}>Peerly</Text>
              <Text style={styles.brandSubtitle}>Connect. Compete. Conquer.</Text>
            </Animated.View>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Bottom Form Card */}
      <Animated.View style={[styles.bottomCard, { transform: [{ translateY: slideUpAnim }] }]}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Ready to start your journey?</Text>
          <Text style={styles.cardDescription}>
            Join the elite campus platform to showcase your skills, solve challenges, and grow with your peers.
          </Text>
        </View>

        <View style={styles.actionContainer}>
          <TouchableOpacity 
            style={styles.primaryBtn} 
            onPress={() => navigation.navigate('Register')}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryBtnText}>Get Started</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.secondaryBtn} 
            onPress={() => navigation.navigate('Login')}
            activeOpacity={0.8}
          >
            <Text style={styles.secondaryBtnText}>Login to existing account</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF7ED',
  },
  topSection: {
    height: height * 0.65,
    width: '100%',
    position: 'absolute',
    top: 0,
  },
  safeArea: {
    flex: 1,
  },
  illustrationArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  floatingIcon: {
    position: 'absolute',
  },
  brandingContainer: {
    alignItems: 'center',
    marginTop: -40,
  },
  logoCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    elevation: 8,
    shadowColor: '#F97316',
    shadowOpacity: 0.2,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 8 }
  },
  brandTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: '#1F2937',
    letterSpacing: -1.5,
  },
  brandSubtitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 8,
    letterSpacing: 0.5,
  },

  bottomCard: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: height * 0.42,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 32,
    paddingTop: 40,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    elevation: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -10 },
  },
  cardHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 12,
  },
  cardDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
  actionContainer: {
    gap: 16,
  },
  primaryBtn: {
    height: 60,
    backgroundColor: '#F97316',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#F97316',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  secondaryBtn: {
    height: 60,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FED7AA',
  },
  secondaryBtnText: {
    color: '#F97316',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
