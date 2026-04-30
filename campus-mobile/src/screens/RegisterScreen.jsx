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
  User, 
  Eye, 
  EyeOff, 
  Check,
  BookOpen,
  Globe,
  Rocket
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

export default function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
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

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Missing Fields', 'Please fill in all fields');
      return;
    }
    if (!agreed) {
      Alert.alert('Terms Required', 'Please agree to the Terms & Conditions and Privacy Policy.');
      return;
    }
    
    if (!email.toLowerCase().endsWith('@cb.students.amrita.edu')) {
      Alert.alert('Registration Denied', 'Only Amrita College students (@cb.students.amrita.edu) can register for this platform.');
      return;
    }
    
    setLoading(true);
    try {
      await authService.register({ name, email, password, college: 'Amrita Vishwa Vidyapeetham' });
      Alert.alert('Account Created', 'You can now log in with your credentials.', [
        { text: 'Continue', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (error) {
      const msg = error.response?.data?.message || (typeof error.response?.data === 'string' ? error.response.data : 'An error occurred.');
      Alert.alert('Registration Failed', msg);
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
          <FloatingIcon Icon={Rocket} size={45} color="rgba(249, 115, 22, 0.2)" delay={0} initialPos={{ top: '20%', left: '15%' }} duration={5000} />
          <FloatingIcon Icon={Globe} size={60} color="rgba(249, 115, 22, 0.3)" delay={500} initialPos={{ top: '10%', right: '15%' }} duration={6000} />
          <FloatingIcon Icon={BookOpen} size={40} color="rgba(249, 115, 22, 0.25)" delay={800} initialPos={{ bottom: '40%', right: '25%' }} duration={4500} />
          <FloatingIcon Icon={User} size={35} color="rgba(249, 115, 22, 0.2)" delay={300} initialPos={{ bottom: '30%', left: '20%' }} duration={5500} />
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
              <Text style={styles.formTitle}>Create Your Account</Text>
              <Text style={styles.formSubtitle}>Create your account to start your journey</Text>
            </View>

            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputBox}>
                <TextInput 
                  style={styles.input} 
                  placeholder="Enter your full name" 
                  placeholderTextColor="#9CA3AF"
                  value={name}
                  onChangeText={setName}
                />
              </View>
            </View>

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputBox}>
                <TextInput 
                  style={styles.input} 
                  placeholder="Enter your email address" 
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
            </View>

            {/* Terms Checkbox */}
            <TouchableOpacity 
              style={styles.checkboxRow} 
              onPress={() => setAgreed(!agreed)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, agreed && styles.checkboxActive]}>
                {agreed && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
              </View>
              <Text style={styles.checkboxText}>
                I agree to the <Text style={styles.linkText}>Terms & Conditions</Text> and <Text style={styles.linkText}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            {/* Primary CTA */}
            <TouchableOpacity 
              style={[styles.registerBtn, (!name || !email || !password || !agreed) && styles.registerBtnDisabled]} 
              onPress={handleRegister}
              disabled={loading || !name || !email || !password || !agreed}
              activeOpacity={0.8}
            >
              {loading ? <ActivityIndicator color="#ffffff" /> : (
                <Text style={styles.registerBtnText}>Sign Up</Text>
              )}
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginLinkContainer}>
              <Text style={styles.loginText}>Already have account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.boldText}>Sign in</Text>
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
    marginTop: height * 0.25, 
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
    marginBottom: 32,
  },
  formTitle: { 
    fontSize: 26, 
    fontWeight: '900', 
    color: '#1F2937',
    marginBottom: 8,
  },
  formSubtitle: { 
    fontSize: 14, 
    color: '#6B7280', 
    fontWeight: '500', 
  },
  
  inputGroup: { 
    marginBottom: 20, 
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
  
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 8,
    paddingRight: 20,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#9CA3AF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxActive: {
    backgroundColor: '#F97316',
    borderColor: '#F97316',
  },
  checkboxText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
    lineHeight: 18,
  },
  linkText: {
    color: '#F97316',
    fontWeight: '700',
  },

  registerBtn: { 
    height: 56, 
    backgroundColor: '#F97316', 
    borderRadius: 16, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginBottom: 24,
    elevation: 4, 
    shadowColor: '#F97316', 
    shadowOpacity: 0.3, 
    shadowRadius: 8, 
    shadowOffset: { width: 0, height: 4 }
  },
  registerBtnDisabled: {
    opacity: 0.5,
    elevation: 0,
    shadowOpacity: 0,
  },
  registerBtnText: { 
    color: '#FFFFFF', 
    fontSize: 16, 
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: { 
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
