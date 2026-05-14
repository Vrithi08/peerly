import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Animated,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { helpService, uploadService } from '../services/api';
import ThemedAlert from '../components/ThemedAlert';
import { 
  CheckCircle2, 
  ChevronRight, 
  Zap, 
  Lightbulb,
  ArrowLeft, 
  ChevronDown, 
  AlertCircle, 
  Clock, 
  Coffee,
  Code,
  BookOpen,
  Check,
  Compass,
  X
} from 'lucide-react-native';

const SUBJECTS = [
  "Academic",
  "Other"
];

const URGENCY_LEVELS = [
  { 
    id: 'URGENT', 
    label: 'URGENT', 
    icon: AlertCircle, 
    color: '#EF4444', 
    desc: 'Need help ASAP' 
  },
  { 
    id: 'TODAY', 
    label: 'TODAY', 
    icon: Clock, 
    color: '#F59E0B', 
    desc: 'Within 24 hours' 
  },
  { 
    id: 'CHILL', 
    label: 'CHILL', 
    icon: Coffee, 
    color: '#10B981', 
    desc: 'No rush at all' 
  },
];


// --- Idea Bot (Donut Style) ---
const IdeaBot = () => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Bobbing motion
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -12, duration: 1500, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
      ])
    ).start();

    // Pulse lightbulb
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.25, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.ideaBotWrapper, { transform: [{ translateY: floatAnim }] }]}>
      <View style={styles.botHead}>
        <View style={styles.botEyes}>
          <View style={styles.botEye} />
          <View style={styles.botEye} />
        </View>
      </View>
      <View style={styles.botBodyWrapper}>
        <View style={[styles.botArm, { transform: [{ rotate: '45deg' }] }]} />
        <View style={styles.botMainBody}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Lightbulb size={40} color="#F97316" fill="#FEF3C7" strokeWidth={2} />
          </Animated.View>
        </View>
        <View style={[styles.botArm, { transform: [{ rotate: '-20deg' }] }]} />
      </View>
      <View style={styles.botBase} />
    </Animated.View>
  );
};

export default function CreateHelpPostScreen({ navigation }) {
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState('CHILL');
  const [loading, setLoading] = useState(false);
  const [showSubjects, setShowSubjects] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', type: 'info' });

  const showAlert = (title, message, type = 'info') => {
    setAlertConfig({ visible: true, title, message, type });
  };

  const handlePost = async () => {
    if (!subject || !topic || !description) {
      showAlert('MISSING INFO', 'Please provide a subject, topic, and description so peers can help you effectively.', 'warning');
      return;
    }

    setLoading(true);
    try {
      await helpService.createPost({
        subject,
        topic,
        description,
        urgency
      });
      setLoading(false);
      setShowSuccessModal(true);
    } catch (err) {
      console.error(err);
      showAlert('POST FAILED', 'Your question could not reach the board. Check your connection and try again.', 'error');
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ask a Question</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          <Text style={styles.label}>Subject</Text>
          <View style={styles.stylishDropdownContainer}>
            <TouchableOpacity 
              style={[styles.stylishDropdownHeader, showSubjects && styles.stylishDropdownHeaderActive]}
              onPress={() => setShowSubjects(!showSubjects)}
              activeOpacity={0.9}
            >
              <View style={styles.dropdownHeaderLeft}>
                <View style={styles.dropdownIconGlow}>
                  {subject === 'Academic' ? <BookOpen size={20} color="#FFFFFF" /> : 
                   subject === 'Other' ? <Compass size={20} color="#FFFFFF" /> : 
                   <BookOpen size={20} color="#FFFFFF" />}
                </View>
                <Text style={[styles.stylishDropdownText, !subject && { color: '#9CA3AF' }]}>
                  {subject || "Select a subject..."}
                </Text>
              </View>
              <View style={{ transform: [{ rotate: showSubjects ? '180deg' : '0deg' }] }}>
                <ChevronDown size={24} color={showSubjects ? '#F97316' : '#9CA3AF'} />
              </View>
            </TouchableOpacity>

            {showSubjects && (
              <View style={styles.stylishDropdownList}>
                <TouchableOpacity 
                  style={[styles.stylishDropdownItem, subject === 'Academic' && styles.stylishDropdownItemActive]}
                  onPress={() => { setSubject('Academic'); setShowSubjects(false); }}
                >
                  <BookOpen size={18} color={subject === 'Academic' ? '#F97316' : '#6B7280'} />
                  <Text style={[styles.stylishDropdownItemText, subject === 'Academic' && styles.stylishDropdownItemTextActive]}>
                    Academic
                  </Text>
                  {subject === 'Academic' && <Check size={18} color="#F97316" style={{ marginLeft: 'auto' }} />}
                </TouchableOpacity>

                <View style={styles.dropdownDivider} />

                <TouchableOpacity 
                  style={[styles.stylishDropdownItem, subject === 'Other' && styles.stylishDropdownItemActive]}
                  onPress={() => { setSubject('Other'); setShowSubjects(false); }}
                >
                  <Compass size={18} color={subject === 'Other' ? '#F97316' : '#6B7280'} />
                  <Text style={[styles.stylishDropdownItemText, subject === 'Other' && styles.stylishDropdownItemTextActive]}>
                    Other
                  </Text>
                  {subject === 'Other' && <Check size={18} color="#F97316" style={{ marginLeft: 'auto' }} />}
                </TouchableOpacity>
              </View>
            )}
          </View>

          <Text style={styles.label}>Topic</Text>
          <TextInput 
            style={styles.input}
            placeholder="e.g. Dijkstra's Algorithm Complexity"
            placeholderTextColor="#9CA3AF"
            value={topic}
            onChangeText={setTopic}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput 
            style={[styles.input, styles.textArea]}
            placeholder="Describe your doubt in detail. Be specific!"
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            value={description}
            onChangeText={setDescription}
          />

          <Text style={styles.label}>Urgency</Text>
          <View style={styles.urgencyContainer}>
            {URGENCY_LEVELS.map((level) => (
              <TouchableOpacity 
                key={level.id}
                style={[
                  styles.urgencyCard, 
                  urgency === level.id && { borderColor: level.color, backgroundColor: level.color + '08' }
                ]}
                onPress={() => setUrgency(level.id)}
                activeOpacity={0.8}
              >
                <level.icon size={20} color={level.color} />
                <Text style={[styles.urgencyLabel, { color: level.color }]}>{level.label}</Text>
                <Text style={styles.urgencyDesc}>{level.desc}</Text>
                {urgency === level.id && <View style={[styles.activeDot, { backgroundColor: level.color }]} />}
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity 
            style={styles.postBtn}
            onPress={handlePost}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.postBtnText}>Post My Question</Text>
            )}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>

      <ThemedAlert 
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onConfirm={() => {
          setAlertConfig({ ...alertConfig, visible: false });
          if (alertConfig.type === 'success') {
            navigation.goBack();
          }
        }}
      />

      {/* SUCCESS MODAL (Donut Reference Style) */}
      <Modal visible={showSuccessModal} transparent animationType="slide">
        <View style={styles.donutModalOverlay}>
          <View style={styles.donutCard}>
            <View style={styles.donutCardInner}>
              <View style={styles.donutIllustrationBox}>
                <IdeaBot />
              </View>

              <Text style={styles.donutHeadline}>Synced!</Text>
              <Text style={styles.donutSubtext}>Your question is on the campus board.</Text>

              <TouchableOpacity 
                style={styles.donutActionBtn} 
                onPress={() => {
                  setShowSuccessModal(false);
                  navigation.goBack();
                }}
              >
                <Text style={styles.donutActionText}>CHECK FEED</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF7ED' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFF7ED'
  },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#1F2937' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#FED7AA' },
  scrollContent: { padding: 24 },
  
  label: { fontSize: 15, fontWeight: '800', color: '#1F2937', marginBottom: 8, marginTop: 16 },
  
  stylishDropdownContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    shadowColor: '#F97316',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    marginBottom: 8,
  },
  stylishDropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    height: 64,
  },
  stylishDropdownHeaderActive: {
    borderBottomWidth: 1.5,
    borderBottomColor: '#FFF7ED',
  },
  dropdownHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dropdownIconGlow: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#F97316',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F97316',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  stylishDropdownText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
  },
  stylishDropdownList: {
    padding: 8,
  },
  stylishDropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
  },
  stylishDropdownItemActive: {
    backgroundColor: '#FFF7ED',
  },
  stylishDropdownItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4B5563',
  },
  stylishDropdownItemTextActive: {
    color: '#F97316',
    fontWeight: '800',
  },
  dropdownDivider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 12,
  },

  input: {
    backgroundColor: '#FFFFFF',
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    borderWidth: 1.5,
    borderColor: '#FED7AA'
  },
  textArea: { height: 150, paddingTop: 16, paddingBottom: 16 },
  
  urgencyContainer: { flexDirection: 'row', gap: 10, marginTop: 4 },
  urgencyCard: { flex: 1, backgroundColor: '#FFFFFF', borderRadius: 20, padding: 12, alignItems: 'center', borderWidth: 1.5, borderColor: '#E5E7EB', position: 'relative' },
  urgencyLabel: { fontSize: 11, fontWeight: '900', marginTop: 8 },
  urgencyDesc: { fontSize: 9, color: '#6B7280', fontWeight: '600', marginTop: 2, textAlign: 'center' },
  activeDot: { position: 'absolute', top: 8, right: 8, width: 6, height: 6, borderRadius: 3 },

  postBtn: {
    backgroundColor: '#F97316',
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    shadowColor: '#F97316',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8
  },
  postBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },

  // Idea Bot (Donut Style)
  ideaBotWrapper: { alignItems: 'center', justifyContent: 'center' },
  botHead: { width: 70, height: 50, backgroundColor: '#F97316', borderRadius: 20, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  botEyes: { flexDirection: 'row', gap: 12, marginBottom: 6 },
  botEye: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFFFFF' },
  botBodyWrapper: { flexDirection: 'row', alignItems: 'flex-start', marginTop: -5, zIndex: 1 },
  botMainBody: { width: 90, height: 75, backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 5, borderColor: '#F97316', alignItems: 'center', justifyContent: 'center', elevation: 4 },
  botArm: { width: 14, height: 40, backgroundColor: '#EA580C', borderRadius: 8, marginTop: 15, marginHorizontal: -8 },
  botBase: { width: 55, height: 10, backgroundColor: '#EA580C', borderBottomLeftRadius: 24, borderBottomRightRadius: 24, marginTop: -5 },

  // Donut Modal Styles
  donutModalOverlay: { flex: 1, backgroundColor: 'rgba(31, 41, 55, 0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  donutCard: { 
    width: '75%', 
    backgroundColor: '#FFFFFF', 
    borderTopLeftRadius: 60,
    borderBottomRightRadius: 60,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
    elevation: 25, 
    shadowColor: '#F97316', 
    shadowOpacity: 0.3, 
    shadowRadius: 30, 
    borderWidth: 3, 
    borderColor: '#F97316', 
    overflow: 'hidden',
    transform: [{ rotate: '-2deg' }]
  },
  donutCardInner: { padding: 24, alignItems: 'center' },
  donutIllustrationBox: { height: 120, justifyContent: 'center', marginBottom: 15 },
  donutHeadline: { fontSize: 24, fontWeight: '900', color: '#374151', textAlign: 'center', marginBottom: 6, letterSpacing: -0.5 },
  donutSubtext: { fontSize: 13, color: '#6B7280', textAlign: 'center', marginBottom: 20, fontWeight: '500', lineHeight: 18 },
  donutActionBtn: { width: '100%', height: 48, borderRadius: 12, borderWidth: 2, borderColor: '#F97316', justifyContent: 'center', alignItems: 'center' },
  donutActionText: { color: '#F97316', fontSize: 13, fontWeight: '900', letterSpacing: 0.5 },
});
