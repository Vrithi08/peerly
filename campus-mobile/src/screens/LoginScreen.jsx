import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ActivityIndicator, 
  Alert, 
  KeyboardAvoidingView, 
  Platform, 
  Dimensions, 
  ScrollView,
  Animated 
} from 'react-native';
import { authService } from '../services/api';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  BookOpen,
  Globe,
  Rocket,
  Zap
} from 'lucide-react-native';

const { height } = Dimensions.get('window');

// --- Floating Icon Component ---
const FloatingIcon = ({ Icon, size, color, delay, initialPos, duration = 4000 }) => {
  const moveAnim = useRef(new Animated.Value(0)).current;

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
  }, []);

  const translateY = moveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  return (
    <Animated.View style={[
      styles.floatingIcon, 
      initialPos, 
      { transform: [{ translateY }] }
    ]}>
      <Icon size={size} color={color} strokeWidth={1.5} />
    </Animated.View>
  );
};

export default function LoginScreen({ navigation, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

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
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Info', 'Please enter both email and password');
      return;
    }
    
    if (!email.toLowerCase().endsWith('@cb.students.amrita.edu')) {
      Alert.alert('Access Denied', 'Only Amrita College students (@cb.students.amrita.edu) can log in.');
      return;
    }
    setLoading(true);
    try {
      await authService.login(email, password);
      onLoginSuccess();
    } catch (error) {
      const msg = error.response?.data?.message || (typeof error.response?.data === 'string' ? error.response.data : 'Invalid credentials.');
      Alert.alert('Login Failed', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Background Gradient */}
      <LinearGradient
        colors={['#FFF7ED', '#FFE4D6']}
        style={styles.topSection}
      >
        <View style={styles.illustrationArea}>
          <FloatingIcon Icon={Rocket} size={50} color="rgba(249, 115, 22, 0.25)" delay={0} initialPos={{ top: '15%', left: '20%' }} duration={4800} />
          <FloatingIcon Icon={Globe} size={60} color="rgba(249, 115, 22, 0.2)" delay={500} initialPos={{ top: '25%', right: '15%' }} duration={6500} />
          <FloatingIcon Icon={BookOpen} size={45} color="rgba(249, 115, 22, 0.3)" delay={800} initialPos={{ bottom: '35%', right: '25%' }} duration={4000} />
          <FloatingIcon Icon={Zap} size={40} color="rgba(249, 115, 22, 0.2)" delay={300} initialPos={{ bottom: '25%', left: '15%' }} duration={5200} />
        </View>
      </LinearGradient>

      {/* Bottom Form Card */}
      <Animated.View style={[styles.bottomCard, { opacity: fadeAnim, transform: [{ translateY: slideUpAnim }] }]}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.formContainer}
        >
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollForm}>
            
            <View style={styles.headerBox}>
              <Text style={styles.formTitle}>Login</Text>
              <Text style={styles.formSubtitle}>Your journey is finally here</Text>
            </View>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputBox}>
                <TextInput 
                  style={styles.input} 
                  placeholder="Enter your email" 
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputBox}>
                <TextInput 
                  style={styles.input} 
                  placeholder="Enter your password" 
                  placeholderTextColor="#9CA3AF"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={20} color="#9CA3AF" /> : <Eye size={20} color="#9CA3AF" />}
                </TouchableOpacity>
              </View>
              <TouchableOpacity style={styles.forgotLink}>
                <Text style={styles.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            {/* Primary CTA */}
            <TouchableOpacity 
              style={[styles.loginBtn, (!email || !password) && styles.loginBtnDisabled]} 
              onPress={handleLogin}
              disabled={loading || !email || !password}
              activeOpacity={0.8}
            >
              {loading ? <ActivityIndicator color="#ffffff" /> : (
                <Text style={styles.loginBtnText}>Login</Text>
              )}
            </TouchableOpacity>

            {/* Signup Link */}
            <View style={styles.signupLinkContainer}>
              <Text style={styles.signupText}>Don't have account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={styles.boldText}>Create one!</Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#FFF7ED' 
  },
  topSection: {
    height: height * 0.45,
    width: '100%',
    position: 'absolute',
    top: 0,
  },
  illustrationArea: {
    flex: 1,
    position: 'relative',
  },
  floatingIcon: {
    position: 'absolute',
  },
  
  bottomCard: { 
    flex: 1, 
    backgroundColor: '#FFFFFF', 
    borderTopLeftRadius: 40, 
    borderTopRightRadius: 40, 
    marginTop: height * 0.35, 
    elevation: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -10 },
  },
  formContainer: { 
    flex: 1 
  },
  scrollForm: { 
    paddingHorizontal: 32, 
    paddingTop: 32, 
    paddingBottom: 40 
  },
  headerBox: {
    alignItems: 'center',
    marginBottom: 40,
  },
  formTitle: { 
    fontSize: 28, 
    fontWeight: '900', 
    color: '#1F2937',
    marginBottom: 8,
  },
  formSubtitle: { 
    fontSize: 15, 
    color: '#6B7280', 
    fontWeight: '500', 
  },
  
  inputGroup: { 
    marginBottom: 24, 
    width: '100%' 
  },
  label: {
    fontSize: 14,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 8,
    marginLeft: 4,
  },
  inputBox: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    height: 56, 
    borderRadius: 16, 
    paddingHorizontal: 20, 
    backgroundColor: '#FFF1E6' 
  },
  input: { 
    flex: 1, 
    fontSize: 15, 
    fontWeight: '600', 
    color: '#1F2937' 
  },
  forgotLink: { 
    alignSelf: 'flex-end', 
    marginTop: 12,
    marginRight: 4,
  },
  forgotText: { 
    fontSize: 13, 
    fontWeight: '700', 
    color: '#6B7280', 
  },
  
  loginBtn: { 
    height: 56, 
    backgroundColor: '#F97316', 
    borderRadius: 16, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 16,
    marginBottom: 32,
    elevation: 4, 
    shadowColor: '#F97316', 
    shadowOpacity: 0.3, 
    shadowRadius: 8, 
    shadowOffset: { width: 0, height: 4 }
  },
  loginBtnDisabled: {
    opacity: 0.5,
    elevation: 0,
    shadowOpacity: 0,
  },
  loginBtnText: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  
  signupLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: { 
    fontSize: 14, 
    color: '#6B7280', 
    fontWeight: '600' 
  },
  boldText: { 
    color: '#F97316', 
    fontWeight: '800',
    fontSize: 14,
  },
});
