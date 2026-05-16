import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  Platform, 
  Dimensions, 
  Animated,
  Modal,
  Image,
  KeyboardAvoidingView,
  Vibration
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ImagePicker from 'expo-image-picker';
import { challengeService, uploadService } from '../services/api';
import ThemedAlert from '../components/ThemedAlert';
import { 
  ArrowLeft, 
  Calendar, 
  ChevronRight, 
  Check, 
  Brain, 
  Palette, 
  Music, 
  Camera, 
  PenTool, 
  Sparkles,
  Info,
  Clock,
  Send,
  Zap,
  Target,
  Image as ImageIcon,
  Trophy,
  X,
  ArrowRight,
  Flame,
  Star,
  Cpu,
  ArrowUpRight,
  CheckCircle2,
  Crown,
  Layers,
  Rocket,
  ChevronDown,
  Layout,
  CheckCircle,
  Users
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'CODING', label: 'Coding', icon: Brain, color: '#F97316' },
  { id: 'DESIGN', label: 'Design', icon: Palette, color: '#EA580C' },
  { id: 'PHOTOGRAPHY', label: 'Photo', icon: Camera, color: '#FB923C' },
  { id: 'MUSIC', label: 'Music', icon: Music, color: '#9A3412' },
  { id: 'WRITING', label: 'Writing', icon: PenTool, color: '#C2410C' },
  { id: 'OTHER', label: 'Other', icon: Sparkles, color: '#F97316' }
];

// --- Animated Hero Decoration (Floating Rocket) ---
const HeroDecoration = () => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(floatAnim, { toValue: -15, duration: 2000, useNativeDriver: true }),
          Animated.timing(rotateAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(floatAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
          Animated.timing(rotateAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['5deg', '-5deg']
  });

  return (
    <Animated.View style={[styles.heroDecor, { transform: [{ translateY: floatAnim }, { rotate }] }]}>
      <View style={styles.rocketBase}>
        <Rocket size={40} color="#F97316" fill="#F97316" fillOpacity={0.1} />
        <View style={styles.rocketFlameBox}>
          <Animated.View style={[styles.rocketFlame, { transform: [{ scaleY: floatAnim.interpolate({ inputRange: [-15, 0], outputRange: [1.5, 1] }) }] }]} />
        </View>
      </View>
    </Animated.View>
  );
};

const SectionCard = ({ children, title, step, currentStep, icon: Icon }) => {
  const isActive = step === currentStep;
  return (
    <View style={[styles.sectionCard, isActive && styles.activeSectionCard]}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIconBox, isActive && styles.activeIconBox]}>
          <Icon size={18} color={isActive ? '#FFF' : '#9CA3AF'} />
        </View>
        <Text style={[styles.sectionTitle, isActive && styles.activeSectionTitle]}>{title}</Text>
        {step < currentStep && <CheckCircle2 size={18} color="#22C55E" style={styles.completedIcon} />}
      </View>
      <View style={!isActive && { display: 'none' }}>
        {children}
      </View>
    </View>
  );
};

export default function CreateChallengeScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('CODING');
  const [submissionDeadline, setSubmissionDeadline] = useState(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000));
  const [votingStartDate, setVotingStartDate] = useState(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000));
  const [votingDeadline, setVotingDeadline] = useState(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000));
  const [coverImage, setCoverImage] = useState(null);
  
  const [showDatePickerModal, setShowDatePickerModal] = useState(false);
  const [tempDate, setTempDate] = useState(new Date());
  const [pickingType, setPickingType] = useState(null); 

  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', type: 'info' });

  const isStep1Valid = title.trim().length >= 3 && category;
  const isStep2Valid = coverImage && description.trim().length >= 20;
  const isStep3Valid = votingDeadline > votingStartDate && votingStartDate >= submissionDeadline;
  const isAllValid = isStep1Valid && isStep2Valid && isStep3Valid;

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images', allowsEditing: true, aspect: [16, 9], quality: 0.8,
    });
    if (!result.canceled) {
      setCoverImage(result.assets[0]);
      Vibration.vibrate(50);
    }
  };

  const openDatePicker = (type) => {
    setPickingType(type);
    let initialDate = type === 'submission' ? submissionDeadline : (type === 'votingStart' ? votingStartDate : votingDeadline);
    setTempDate(initialDate);
    setShowDatePickerModal(true);
  };

  const confirmDate = () => {
    if (pickingType === 'submission') {
      setSubmissionDeadline(tempDate);
      if (votingStartDate < tempDate) setVotingStartDate(tempDate);
    } else if (pickingType === 'votingStart') {
      setVotingStartDate(tempDate);
      if (votingDeadline < tempDate) setVotingDeadline(new Date(tempDate.getTime() + 2 * 24 * 60 * 60 * 1000));
    } else {
      setVotingDeadline(tempDate);
    }
    setShowDatePickerModal(false);
    Vibration.vibrate(50);
  };

  const handleCreate = async () => {
    if (!isAllValid) return;
    setLoading(true);
    try {
      let uploadedUrl = null;
      if (coverImage) {
        const uploadResult = await uploadService.uploadFile({
          uri: coverImage.uri,
          type: coverImage.mimeType || 'image/jpeg',
          fileName: coverImage.uri.split('/').pop() || 'challenge_cover.jpg'
        });
        uploadedUrl = uploadResult.url || uploadResult;
      }
      await challengeService.create({
        title, description, category,
        submissionDeadline: submissionDeadline.toISOString().substring(0, 19),
        votingStartDate: votingStartDate.toISOString().substring(0, 19),
        votingDeadline: votingDeadline.toISOString().substring(0, 19),
        status: 'OPEN', imageUrl: uploadedUrl
      });
      setShowSuccessModal(true);
    } catch (err) {
      console.error(err);
      setAlertConfig({ visible: true, title: 'DEPLOYMENT FAILED', message: 'The arena gates remain closed.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={['#FFF7ED', '#FFF1E2', '#FFFFFF']} style={StyleSheet.absoluteFill} />
      
      <SafeAreaView edges={['top']} style={styles.header}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={22} color="#1F2937" />
          </TouchableOpacity>
          <View style={styles.stepContainer}>
            {[1, 2, 3].map(s => (
              <View key={s} style={styles.stepWrapper}>
                <View style={[styles.stepDot, step >= s && styles.activeStepDot, step > s && styles.completedStepDot]}>
                  {step > s ? <Check size={10} color="#FFF" /> : <Text style={[styles.stepText, step >= s && styles.activeStepText]}>{s}</Text>}
                </View>
                {s < 3 && <View style={[styles.stepLine, step > s && styles.activeStepLine]} />}
              </View>
            ))}
          </View>
          <View style={{ width: 44 }} />
        </View>
      </SafeAreaView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.heroRow}>
          <View style={styles.heroText}>
            <Text style={styles.heroTitle}>Host an{'\n'}<Text style={styles.heroAccent}>Arena</Text></Text>
          </View>
          <HeroDecoration />
        </View>

        <View style={styles.formContent}>
          {/* Step 1 */}
          <SectionCard title="ARENA IDENTITY" step={1} currentStep={step} icon={Zap}>
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>CHALLENGE TITLE</Text>
                <Text style={styles.charCount}>{title.length}/40</Text>
              </View>
              <TextInput style={styles.largeInput} placeholder="Arena name..." placeholderTextColor="#D1D5DB" maxLength={40} value={title} onChangeText={setTitle} />
            </View>
            <View style={styles.categoryGrid}>
              {CATEGORIES.map(cat => (
                <TouchableOpacity key={cat.id} onPress={() => setCategory(cat.id)} style={[styles.categoryTile, category === cat.id && { backgroundColor: cat.color, borderColor: cat.color }]}>
                  <cat.icon size={20} color={category === cat.id ? '#FFF' : '#6B7280'} />
                  <Text style={[styles.categoryLabel, category === cat.id && { color: '#FFF' }]}>{cat.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={[styles.nextBtn, !isStep1Valid && styles.disabledBtn]} onPress={() => setStep(2)} disabled={!isStep1Valid}>
              <Text style={styles.nextBtnText}>CONTINUE TO VISUALS</Text>
              <ArrowRight size={18} color="#FFF" />
            </TouchableOpacity>
          </SectionCard>

          {/* Step 2 */}
          <SectionCard title="VISUALS & BRIEF" step={2} currentStep={step} icon={Palette}>
            <TouchableOpacity onPress={handlePickImage} style={styles.uploadBox}>
              {coverImage ? (
                <View style={styles.previewImageWrap}>
                  <Image source={{ uri: coverImage.uri }} style={styles.previewImage} />
                  <View style={styles.reUploadOverlay}><Camera size={20} color="#FFF" /></View>
                </View>
              ) : (
                <View style={styles.uploadPlaceholder}>
                  <ImageIcon size={32} color="#F97316" />
                  <Text style={styles.uploadText}>Select banner...</Text>
                </View>
              )}
            </TouchableOpacity>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>RULES & GOALS</Text>
              <View style={styles.textAreaBox}>
                <TextInput style={styles.textArea} placeholder="Objectives, requirements, prizes..." placeholderTextColor="#D1D5DB" multiline value={description} onChangeText={setDescription} />
              </View>
            </View>
            <View style={styles.stepNavRow}>
              <TouchableOpacity style={styles.backStepBtn} onPress={() => setStep(1)}><Text style={styles.backStepText}>BACK</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.nextBtn, { flex: 1 }, !isStep2Valid && styles.disabledBtn]} onPress={() => setStep(3)} disabled={!isStep2Valid}><Text style={styles.nextBtnText}>CONTINUE TO DATES</Text></TouchableOpacity>
            </View>
          </SectionCard>

          {/* Step 3 */}
          <SectionCard title="ARENA TIMELINE" step={3} currentStep={step} icon={Clock}>
            <View style={styles.timelineList}>
              <TouchableOpacity style={styles.dateSelectorRow} onPress={() => openDatePicker('submission')}>
                <View style={[styles.dateDot, { backgroundColor: '#F97316' }]} />
                <View style={styles.dateInfo}><Text style={styles.dateLabel}>Submissions End</Text><Text style={styles.dateValue}>{submissionDeadline.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</Text></View>
                <ChevronRight size={20} color="#FED7AA" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.dateSelectorRow} onPress={() => openDatePicker('votingStart')}>
                <View style={[styles.dateDot, { backgroundColor: '#22C55E' }]} />
                <View style={styles.dateInfo}><Text style={styles.dateLabel}>Voting Starts</Text><Text style={styles.dateValue}>{votingStartDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</Text></View>
                <ChevronRight size={20} color="#FED7AA" />
              </TouchableOpacity>
              <TouchableOpacity style={[styles.dateSelectorRow, { borderBottomWidth: 0 }]} onPress={() => openDatePicker('voting')}>
                <View style={[styles.dateDot, { backgroundColor: '#8B5CF6' }]} />
                <View style={styles.dateInfo}><Text style={styles.dateLabel}>Arena Closes</Text><Text style={styles.dateValue}>{votingDeadline.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</Text></View>
                <ChevronRight size={20} color="#FED7AA" />
              </TouchableOpacity>
            </View>
            <View style={styles.stepNavRow}>
              <TouchableOpacity style={styles.backStepBtn} onPress={() => setStep(2)}><Text style={styles.backStepText}>BACK</Text></TouchableOpacity>
              <TouchableOpacity style={[styles.launchBtn, !isAllValid && styles.disabledBtn]} onPress={handleCreate} disabled={!isAllValid || loading}>
                <LinearGradient colors={['#F97316', '#EA580C']} style={styles.launchGradient}>
                  {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.launchText}>🚀 LAUNCH ARENA</Text>}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </SectionCard>
        </View>
      </ScrollView>

      {/* CUSTOM BOTTOM DATE PICKER */}
      <Modal visible={showDatePickerModal} transparent animationType="slide">
        <View style={styles.bottomSheetOverlay}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => setShowDatePickerModal(false)} />
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHeader}><View style={styles.sheetHandle} /><Text style={styles.sheetTitle}>Select {pickingType === 'submission' ? 'Deadline' : (pickingType === 'votingStart' ? 'Voting Start' : 'Closing Date')}</Text></View>
            <View style={styles.pickerWrap}><DateTimePicker value={tempDate} mode="date" display={Platform.OS === 'ios' ? 'spinner' : 'default'} minimumDate={new Date()} onChange={(e, d) => d && setTempDate(d)} textColor="#1F2937" /></View>
            <TouchableOpacity style={styles.confirmBtn} onPress={confirmDate}><LinearGradient colors={['#F97316', '#EA580C']} style={styles.confirmGradient}><Text style={styles.confirmText}>DONE</Text></LinearGradient></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successCard}>
            <View style={styles.celebration}><Sparkles size={40} color="#F97316" /></View>
            <Text style={styles.successTitle}>Arena Deployed!</Text>
            <Text style={styles.successDesc}>Your challenge is now live. Glory awaits!</Text>
            <TouchableOpacity style={styles.successAction} onPress={() => { setShowSuccessModal(false); navigation.goBack(); }}><Text style={styles.successActionText}>GO TO FEED</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ThemedAlert visible={alertConfig.visible} title={alertConfig.title} message={alertConfig.message} type={alertConfig.type} onConfirm={() => setAlertConfig({ ...alertConfig, visible: false })} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF7ED' },
  header: { paddingHorizontal: 20, paddingVertical: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center', elevation: 3 },
  stepContainer: { flexDirection: 'row', alignItems: 'center', flex: 1, justifyContent: 'center' },
  stepWrapper: { flexDirection: 'row', alignItems: 'center' },
  stepDot: { width: 24, height: 24, borderRadius: 12, backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#FFF' },
  activeStepDot: { backgroundColor: '#FFF', borderColor: '#F97316' },
  completedStepDot: { backgroundColor: '#22C55E', borderColor: '#22C55E' },
  stepText: { fontSize: 10, fontWeight: '900', color: '#9CA3AF' },
  activeStepText: { color: '#F97316' },
  stepLine: { width: 30, height: 2, backgroundColor: '#E5E7EB', marginHorizontal: 4 },
  activeStepLine: { backgroundColor: '#F97316' },

  scrollContent: { paddingBottom: 20 },
  heroRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 20 },
  heroText: { flex: 1 },
  heroTag: { fontSize: 10, fontWeight: '900', color: '#F97316', letterSpacing: 2, marginBottom: 8 },
  heroTitle: { fontSize: 36, fontWeight: '900', color: '#1F2937', letterSpacing: -1.5, lineHeight: 40 },
  heroAccent: { color: '#F97316', fontStyle: 'italic' },
  heroDecor: { width: 80, height: 80, alignItems: 'center', justifyContent: 'center' },
  rocketBase: { alignItems: 'center' },
  rocketFlameBox: { marginTop: -5, alignItems: 'center' },
  rocketFlame: { width: 4, height: 10, backgroundColor: '#FB923C', borderRadius: 2 },

  formContent: { paddingHorizontal: 20, gap: 20 },
  sectionCard: { backgroundColor: '#FFF', borderRadius: 32, padding: 24, elevation: 4, shadowColor: '#F97316', shadowOpacity: 0.05, shadowRadius: 15 },
  activeSectionCard: { borderWidth: 2, borderColor: '#FED7AA' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  sectionIconBox: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  activeIconBox: { backgroundColor: '#F97316' },
  sectionTitle: { fontSize: 16, fontWeight: '900', color: '#6B7280', letterSpacing: 1 },
  activeSectionTitle: { color: '#1F2937' },
  completedIcon: { marginLeft: 'auto' },

  inputGroup: { marginBottom: 24 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  inputLabel: { fontSize: 14, fontWeight: '900', color: '#1F2937', letterSpacing: 0.5 },
  charCount: { fontSize: 10, color: '#9CA3AF', fontWeight: '700' },
  largeInput: { fontSize: 18, fontWeight: '700', color: '#1F2937', borderBottomWidth: 2, borderBottomColor: '#F3F4F6', paddingBottom: 10 },

  categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  categoryTile: { width: (width - 120) / 3, height: 80, borderRadius: 20, backgroundColor: '#F9FAFB', alignItems: 'center', justifyContent: 'center', gap: 8, borderWidth: 1, borderColor: '#F3F4F6' },
  categoryLabel: { fontSize: 11, fontWeight: '800', color: '#6B7280' },

  nextBtn: { height: 60, borderRadius: 20, backgroundColor: '#1F2937', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12 },
  nextBtnText: { color: '#FFF', fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  disabledBtn: { opacity: 0.3 },

  uploadBox: { height: 200, borderRadius: 24, backgroundColor: '#FFF7ED50', borderWidth: 2, borderStyle: 'dashed', borderColor: '#FED7AA', overflow: 'hidden', marginBottom: 24 },
  uploadPlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  uploadText: { fontSize: 16, fontWeight: '900', color: '#1F2937' },
  previewImageWrap: { flex: 1 },
  previewImage: { width: '100%', height: '100%' },
  reUploadOverlay: { position: 'absolute', top: 12, right: 12, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },

  textAreaBox: { minHeight: 140, backgroundColor: '#F9FAFB', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#F3F4F6' },
  textArea: { flex: 1, fontSize: 15, fontWeight: '500', color: '#1F2937', textAlignVertical: 'top' },

  stepNavRow: { flexDirection: 'row', gap: 12, marginTop: 10 },
  backStepBtn: { height: 60, width: 80, borderRadius: 20, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
  backStepText: { fontSize: 12, fontWeight: '900', color: '#9CA3AF' },

  timelineList: { gap: 0, marginBottom: 24 },
  dateSelectorRow: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  dateDot: { width: 12, height: 12, borderRadius: 6 },
  dateInfo: { flex: 1 },
  dateLabel: { fontSize: 10, fontWeight: '800', color: '#9CA3AF' },
  dateValue: { fontSize: 16, fontWeight: '900', color: '#1F2937', marginTop: 2 },

  launchBtn: { flex: 1, borderRadius: 20, overflow: 'hidden' },
  launchGradient: { height: 60, alignItems: 'center', justifyContent: 'center' },
  launchText: { color: '#FFF', fontSize: 16, fontWeight: '900' },

  bottomSheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  bottomSheet: { backgroundColor: '#FFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, paddingBottom: Platform.OS === 'ios' ? 40 : 20 },
  sheetHeader: { padding: 20, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB', marginBottom: 12 },
  sheetTitle: { fontSize: 16, fontWeight: '900', color: '#1F2937' },
  pickerWrap: { height: 220, justifyContent: 'center' },
  confirmBtn: { marginHorizontal: 24, marginTop: 10, borderRadius: 20, overflow: 'hidden' },
  confirmGradient: { height: 60, alignItems: 'center', justifyContent: 'center' },
  confirmText: { color: '#FFF', fontSize: 16, fontWeight: '900' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(31, 41, 55, 0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  successCard: { backgroundColor: '#FFF', borderRadius: 40, padding: 40, alignItems: 'center', width: '100%' },
  celebration: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFF7ED', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  successTitle: { fontSize: 26, fontWeight: '900', color: '#1F2937', marginBottom: 12 },
  successDesc: { fontSize: 15, color: '#6B7280', textAlign: 'center' },
  successAction: { width: '100%', height: 64, backgroundColor: '#F97316', borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginTop: 24 },
  successActionText: { color: '#FFF', fontSize: 16, fontWeight: '900' },
});
