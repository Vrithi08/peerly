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
  Platform, 
  Dimensions, 
  Animated,
  Modal,
  Image
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
  Tag, 
  FileText, 
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
  CheckCircle2,
  Trophy,
  X
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'CODING', label: 'CODING', icon: Brain, color: '#6366F1' },
  { id: 'DESIGN', label: 'DESIGN', icon: Palette, color: '#EC4899' },
  { id: 'MUSIC', label: 'MUSIC', icon: Music, color: '#8B5CF6' },
  { id: 'PHOTOGRAPHY', label: 'PHOTO', icon: Camera, color: '#06B6D4' },
  { id: 'WRITING', label: 'WRITING', icon: PenTool, color: '#F59E0B' },
  { id: 'OTHER', label: 'OTHER', icon: Sparkles, color: '#10B981' }
];

const SlideUpView = ({ children, delay = 0, style }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        delay,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  return (
    <Animated.View style={[style, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
      {children}
    </Animated.View>
  );
};

// --- Victory Robot Component ---
const VictoryRobot = () => {
  const jumpAnim = useRef(new Animated.Value(0)).current;
  const armAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Cheering/Jumping animation
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(jumpAnim, { toValue: -20, duration: 400, useNativeDriver: true }),
          Animated.timing(armAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(jumpAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
          Animated.timing(armAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  const rotateL = armAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['15deg', '-30deg']
  });
  
  const rotateR = armAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-15deg', '30deg']
  });

  return (
    <Animated.View style={[styles.victoryBotWrapper, { transform: [{ translateY: jumpAnim }] }]}>
      <View style={styles.botHead}>
        <View style={styles.botEyes}>
          <View style={styles.botEye} />
          <View style={styles.botEye} />
        </View>
        <View style={styles.botSmile} />
      </View>
      <View style={styles.botBodyWrapper}>
        <Animated.View style={[styles.botArm, { transform: [{ rotate: rotateL }] }]} />
        <View style={styles.botMainBody}>
          <Trophy size={40} color="#F97316" strokeWidth={2.5} />
        </View>
        <Animated.View style={[styles.botArm, { transform: [{ rotate: rotateR }] }]} />
      </View>
      <View style={styles.botBase} />
    </Animated.View>
  );
};

export default function CreateChallengeScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('CODING');
  const [submissionDeadline, setSubmissionDeadline] = useState(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000));
  const [votingStartDate, setVotingStartDate] = useState(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000));
  const [votingDeadline, setVotingDeadline] = useState(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000));
  const [showPicker, setShowPicker] = useState(null); // 'submission', 'votingStart', or 'voting'
  const [loading, setLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', type: 'info' });

  const showAlert = (title, message, type = 'info') => {
    setAlertConfig({ visible: true, title, message, type });
  };
  const [errors, setErrors] = useState({});
  const [coverImage, setCoverImage] = useState(null);

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setCoverImage(result.assets[0]);
    }
  };

  const validate = () => {
    let newErrors = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    else if (title.length < 3) newErrors.title = 'Min 3 characters';
    
    if (!description.trim()) newErrors.description = 'Description is required';
    else if (description.length < 20) newErrors.description = 'Min 20 characters';
    
    if (votingStartDate < submissionDeadline) {
      newErrors.votingStart = 'Voting cannot start before submission ends';
    }

    if (votingDeadline <= votingStartDate) {
      newErrors.voting = 'Voting must end after it starts';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      let uploadedUrl = null;
      if (coverImage) {
        const fileUri = coverImage.uri;
        const fileName = fileUri.split('/').pop();
        const fileType = coverImage.mimeType || 'image/jpeg';

        const uploadResult = await uploadService.uploadFile({
          uri: fileUri,
          type: fileType,
          fileName: fileName || 'challenge_cover.jpg'
        });
        uploadedUrl = uploadResult.url || uploadResult;
      }

      await challengeService.create({
        title,
        description,
        category,
        submissionDeadline: submissionDeadline.toISOString().substring(0, 19),
        votingStartDate: votingStartDate.toISOString().substring(0, 19),
        votingDeadline: votingDeadline.toISOString().substring(0, 19),
        status: 'OPEN',
        imageUrl: uploadedUrl
      });
      setShowSuccessModal(true);
    } catch (err) {
      console.error(err);
      showAlert('DEPLOYMENT FAILED', 'The arena gates could not be opened. Please check your inputs.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event, selectedDate) => {
    if (selectedDate) {
      if (showPicker === 'submission') {
        setSubmissionDeadline(selectedDate);
        // Sync voting start if it's now before submission
        if (votingStartDate < selectedDate) {
          setVotingStartDate(selectedDate);
        }
      } else if (showPicker === 'votingStart') {
        setVotingStartDate(selectedDate);
        // Sync voting end if it's now before voting start
        if (votingDeadline < selectedDate) {
          setVotingDeadline(new Date(selectedDate.getTime() + 2 * 24 * 60 * 60 * 1000));
        }
      } else {
        setVotingDeadline(selectedDate);
      }
    }
    if (Platform.OS === 'android') {
      setShowPicker(null);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#FFF7ED', '#FFF1E2']}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Header */}
      <SafeAreaView edges={['top']} style={styles.headerSafe}>
        <View style={styles.navBar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={22} color="#1F2937" strokeWidth={2.5} />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.navTitle}>New Arena</Text>
            <View style={styles.headerDot} />
          </View>
          <TouchableOpacity style={styles.infoBtn} onPress={() => setShowInfo(true)}>
            <Info size={20} color="#F97316" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
        stickyHeaderIndices={[]}
      >
        <SlideUpView delay={100} style={styles.introSection}>
          <Text style={styles.introTitle}>Host a <Text style={styles.titleUnderline}>Challenge</Text></Text>
        </SlideUpView>

        {/* Form */}
        <View style={styles.form}>
          
          {/* Field 0: Cover Image */}
          <SlideUpView delay={150} style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>COVER IMAGE</Text>
            {coverImage ? (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: coverImage.uri }} style={styles.imagePreview} />
                <TouchableOpacity 
                  style={styles.removeImageBtn} 
                  onPress={() => setCoverImage(null)}
                >
                  <X size={16} color="#FFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.imagePickerPlaceholder} 
                onPress={handlePickImage}
                activeOpacity={0.7}
              >
                <ImageIcon size={32} color="#F97316" fill="#F97316" fillOpacity={0.1} />
                <Text style={styles.imagePickerText}>Add a descriptive banner</Text>
                <Text style={styles.imagePickerSubtext}>16:9 ratio recommended</Text>
              </TouchableOpacity>
            )}
          </SlideUpView>

          {/* Field 1: Title */}
          <SlideUpView delay={200} style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>CHALLENGE TITLE</Text>
            <View style={[styles.inputContainer, errors.title && styles.inputError]}>
              <View style={styles.inputIconBox}>
                <Zap size={18} color={errors.title ? '#F43F5E' : '#F97316'} fill={errors.title ? 'transparent' : '#F97316'} fillOpacity={0.1} />
              </View>
              <TextInput
                style={styles.input}
                placeholder="e.g. Pixel Perfect UI Sprint"
                placeholderTextColor="#9CA3AF"
                value={title}
                onChangeText={setTitle}
                maxLength={100}
              />
              <View style={styles.countBadge}>
                <Text style={styles.charCount}>{title.length}/100</Text>
              </View>
            </View>
            {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
          </SlideUpView>

          {/* Field 2: Description */}
          <SlideUpView delay={300} style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>BRIEF & RULES</Text>
            <View style={[styles.textAreaContainer, errors.description && styles.inputError]}>
              <TextInput
                style={styles.textArea}
                placeholder="What are the goals, rules, and prizes for this arena?"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={6}
                value={description}
                onChangeText={setDescription}
              />
              <View style={styles.textAreaDecor}>
                <PenTool size={14} color="#FED7AA" />
              </View>
            </View>
            {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
          </SlideUpView>

          {/* Field 3: Category Chips */}
          <SlideUpView delay={400} style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>SELECT DOMAIN</Text>
            <View style={styles.chipGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  activeOpacity={0.7}
                  style={[
                    styles.chip, 
                    category === cat.id && { borderColor: cat.color, backgroundColor: `${cat.color}10` }
                  ]}
                  onPress={() => setCategory(cat.id)}
                >
                  <View style={[styles.chipIconBox, category === cat.id && { backgroundColor: cat.color }]}>
                    <cat.icon size={14} color={category === cat.id ? '#FFFFFF' : cat.color} />
                  </View>
                  <Text style={[styles.chipText, category === cat.id && { color: cat.color, fontWeight: '900' }]}>{cat.label}</Text>
                  {category === cat.id && (
                    <View style={[styles.checkDot, { backgroundColor: cat.color }]}>
                      <Check size={8} color="#FFF" strokeWidth={4} />
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </SlideUpView>

          {/* Field 4, 5 & 6: Deadlines */}
          <View style={styles.deadlineGrid}>
            <View style={styles.fieldWrapper}>
              <Text style={styles.fieldLabel}>SUBMISSION DEADLINE</Text>
              <TouchableOpacity 
                activeOpacity={0.7}
                style={styles.datePickerBtn} 
                onPress={() => setShowPicker('submission')}
              >
                <Calendar size={18} color="#F97316" />
                <Text style={styles.dateText}>{submissionDeadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                <ChevronRight size={16} color="#FED7AA" />
              </TouchableOpacity>
            </View>

            <View style={styles.fieldWrapper}>
              <Text style={styles.fieldLabel}>VOTING START DATE</Text>
              <TouchableOpacity 
                activeOpacity={0.7}
                style={[styles.datePickerBtn, errors.votingStart && styles.inputError]} 
                onPress={() => setShowPicker('votingStart')}
              >
                <Clock size={18} color={errors.votingStart ? '#F43F5E' : '#10B981'} />
                <Text style={[styles.dateText, errors.votingStart && styles.errorText]}>{votingStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                <ChevronRight size={16} color="#FED7AA" />
              </TouchableOpacity>
              {errors.votingStart && <Text style={styles.errorText}>{errors.votingStart}</Text>}
            </View>

            <View style={styles.fieldWrapper}>
              <Text style={styles.fieldLabel}>VOTING DEADLINE</Text>
              <TouchableOpacity 
                activeOpacity={0.7}
                style={[styles.datePickerBtn, errors.voting && styles.inputError]} 
                onPress={() => setShowPicker('voting')}
              >
                <Target size={18} color={errors.voting ? '#F43F5E' : '#8B5CF6'} />
                <Text style={[styles.dateText, errors.voting && styles.errorText]}>{votingDeadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
                <ChevronRight size={16} color="#FED7AA" />
              </TouchableOpacity>
              {errors.voting && <Text style={styles.errorText}>{errors.voting}</Text>}
            </View>
          </View>


          {showPicker && (
            Platform.OS === 'ios' ? (
              <Modal transparent={true} animationType="slide">
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                      <TouchableOpacity onPress={() => setShowPicker(null)}>
                        <Text style={styles.modalDone}>Done</Text>
                      </TouchableOpacity>
                    </View>
                    <DateTimePicker
                      value={showPicker === 'submission' ? submissionDeadline : (showPicker === 'votingStart' ? votingStartDate : votingDeadline)}
                      mode="date"
                      display="spinner"
                      minimumDate={new Date()}
                      onChange={onDateChange}
                      textColor="#000000"
                      themeVariant="light"
                      style={{ height: 200 }}
                    />
                  </View>
                </View>
              </Modal>
            ) : (
              <DateTimePicker
                value={showPicker === 'submission' ? submissionDeadline : (showPicker === 'votingStart' ? votingStartDate : votingDeadline)}
                mode="date"
                display="default"
                minimumDate={new Date()}
                onChange={onDateChange}
                themeVariant="light"
              />
            )
          )}

          {/* Info Modal */}
          <Modal visible={showInfo} transparent animationType="fade">
            <View style={styles.infoOverlay}>
              <SlideUpView style={styles.infoContent}>
                <View style={styles.infoIconHeader}>
                  <Sparkles size={32} color="#F97316" />
                </View>
                <Text style={styles.infoTitle}>About Arenas</Text>
                <Text style={styles.infoDesc}>Arenas are peer-led challenges where you can showcase your skills and compete for glory.</Text>
                
                <View style={styles.infoList}>
                  <View style={styles.infoItem}>
                    <Send size={18} color="#F97316" />
                    <View style={styles.infoItemText}>
                      <Text style={styles.infoItemTitle}>Host a Challenge</Text>
                      <Text style={styles.infoItemDesc}>Set the rules, pick a domain, and define the deadlines.</Text>
                    </View>
                  </View>
                  <View style={styles.infoItem}>
                    <Target size={18} color="#F97316" />
                    <View style={styles.infoItemText}>
                      <Text style={styles.infoItemTitle}>Voting Phase</Text>
                      <Text style={styles.infoItemDesc}>Once submissions close, the community votes on the best entries.</Text>
                    </View>
                  </View>
                  <View style={styles.infoItem}>
                    <Zap size={18} color="#F97316" />
                    <View style={styles.infoItemText}>
                      <Text style={styles.infoItemTitle}>Earn XP</Text>
                      <Text style={styles.infoItemDesc}>Winners and participants gain XP to level up their profile.</Text>
                    </View>
                  </View>
                </View>

                <TouchableOpacity 
                  style={styles.closeInfoBtn} 
                  onPress={() => setShowInfo(false)}
                >
                  <Text style={styles.closeInfoText}>Got it!</Text>
                </TouchableOpacity>
              </SlideUpView>
            </View>
          </Modal>

          <SlideUpView delay={600} style={styles.publishSection}>
            <TouchableOpacity 
              style={styles.createBtn} 
              onPress={handleCreate}
              disabled={loading}
              activeOpacity={0.6}
            >
              {loading ? <ActivityIndicator color="#F97316" /> : (
                <>
                  <Text style={styles.createBtnText}>Initialize Arena</Text>
                  <View style={styles.btnIconBox}>
                    <Send size={24} color="#F97316" strokeWidth={2.5} />
                  </View>
                </>
              )}
            </TouchableOpacity>
            <Text style={styles.publishNote}>By initializing, you agree to the Arena community guidelines.</Text>
          </SlideUpView>
        </View>
      </ScrollView>

      {/* SUCCESS MODAL (Donut Reference Style) */}
      <Modal visible={showSuccessModal} transparent animationType="slide">
        <View style={styles.donutModalOverlay}>
          <View style={styles.donutCard}>
            <View style={styles.donutCardInner}>
              <View style={styles.donutIllustrationBox}>
                <VictoryRobot />
              </View>

              <Text style={styles.donutHeadline}>Arena Live!</Text>
              <Text style={styles.donutSubtext}>Your challenge is successfully launched.</Text>

              <TouchableOpacity 
                style={styles.donutActionBtn} 
                onPress={() => {
                  setShowSuccessModal(false);
                  navigation.goBack();
                }}
              >
                <Text style={styles.donutActionText}>EXPLORE FEED</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF7ED' },
  headerSafe: { backgroundColor: 'transparent', zIndex: 10 },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 64,
  },
  headerTitleContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  navTitle: { fontSize: 20, fontWeight: '900', color: '#1F2937', letterSpacing: -0.5 },
  headerDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#F97316', marginTop: 8 },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 22, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
  infoBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },

  scrollContent: { paddingBottom: 0 },

  introSection: { padding: 24, paddingBottom: 12 },
  introTitle: { fontSize: 36, fontWeight: '900', color: '#1F2937', letterSpacing: -1.5, lineHeight: 42 },
  titleUnderline: { color: '#F97316', fontStyle: 'italic' },
  
  form: { paddingHorizontal: 24, marginTop: 10 },
  fieldWrapper: { marginBottom: 30 },
  fieldLabel: { 
    fontSize: 12, 
    fontWeight: '900', 
    color: '#1F2937', 
    marginBottom: 16, 
    letterSpacing: 1.5, 
    textTransform: 'uppercase',
    borderLeftWidth: 3,
    borderLeftColor: '#F97316',
    paddingLeft: 10,
  },
  
  inputContainer: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', 
    borderWidth: 2, borderColor: '#FED7AA', borderRadius: 20, paddingHorizontal: 16, height: 64, gap: 12,
    elevation: 3, shadowColor: '#F97316', shadowOpacity: 0.05, shadowRadius: 10
  },
  inputIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#FFF7ED', justifyContent: 'center', alignItems: 'center' },
  input: { flex: 1, color: '#1F2937', fontSize: 16, fontWeight: '800' },
  inputError: { borderColor: '#F43F5E' },
  countBadge: { backgroundColor: '#F3F4F6', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  charCount: { fontSize: 10, fontWeight: '900', color: '#9CA3AF' },
  errorText: { fontSize: 12, color: '#F43F5E', fontWeight: '800', marginTop: 8, marginLeft: 4 },

  textAreaContainer: { 
    backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#FED7AA', 
    borderRadius: 24, padding: 20, minHeight: 180, elevation: 3, shadowColor: '#F97316', shadowOpacity: 0.05, shadowRadius: 10
  },
  textArea: { flex: 1, color: '#1F2937', fontSize: 16, fontWeight: '600', textAlignVertical: 'top', lineHeight: 24 },
  textAreaDecor: { position: 'absolute', bottom: 16, right: 16, opacity: 0.5 },

  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  chip: { 
    width: '48%',
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    gap: 10, 
    paddingVertical: 16, 
    borderRadius: 20, 
    backgroundColor: '#FFFFFF', 
    borderWidth: 2, 
    borderColor: '#F3F4F6',
    elevation: 2, 
    shadowColor: '#000', 
    shadowOpacity: 0.05, 
    shadowRadius: 5
  },
  chipIconBox: { width: 24, height: 24, borderRadius: 6, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  chipText: { fontSize: 12, fontWeight: '800', color: '#6B7280', letterSpacing: 0.5 },
  checkDot: { width: 14, height: 14, borderRadius: 7, justifyContent: 'center', alignItems: 'center' },

  deadlineGrid: { flexDirection: 'column', gap: 0 },
  datePickerBtn: { 
    flexDirection: 'row', alignItems: 'center', gap: 12, height: 64, 
    backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#FED7AA', borderRadius: 20, paddingHorizontal: 20,
    elevation: 3, shadowColor: '#F97316', shadowOpacity: 0.05, shadowRadius: 10
  },
  dateText: { flex: 1, fontSize: 15, fontWeight: '800', color: '#1F2937' },

  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(31, 41, 55, 0.4)' },
  modalContent: { backgroundColor: '#FFFFFF', paddingBottom: 40, borderTopLeftRadius: 32, borderTopRightRadius: 32, elevation: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'flex-end', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  modalDone: { color: '#F97316', fontSize: 18, fontWeight: '900' },

  publishSection: { marginTop: 16, alignItems: 'center', paddingBottom: 0 },
  createBtn: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 16,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderTopLeftRadius: 32,
    borderBottomRightRadius: 32,
    borderWidth: 2.5,
    borderColor: '#F97316',
    backgroundColor: 'transparent',
  },
  btnIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFF7ED',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FED7AA'
  },
  createBtnText: { color: '#F97316', fontSize: 20, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  publishNote: { fontSize: 11, color: '#9CA3AF', fontWeight: '600', marginTop: 16, textAlign: 'center', fontStyle: 'italic' },

  // Info Modal
  infoOverlay: { flex: 1, backgroundColor: 'rgba(31, 41, 55, 0.7)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  infoContent: { backgroundColor: '#FFFFFF', borderRadius: 32, padding: 32, width: '100%', alignItems: 'center', elevation: 20 },
  infoIconHeader: { width: 64, height: 64, borderRadius: 20, backgroundColor: '#FFF7ED', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  infoTitle: { fontSize: 24, fontWeight: '900', color: '#1F2937', marginBottom: 12 },
  infoDesc: { fontSize: 15, color: '#6B7280', textAlign: 'center', lineHeight: 22, marginBottom: 32, fontWeight: '500' },
  infoList: { width: '100%', gap: 20, marginBottom: 32 },
  infoItem: { flexDirection: 'row', gap: 16, alignItems: 'flex-start' },
  infoItemText: { flex: 1 },
  infoItemTitle: { fontSize: 16, fontWeight: '800', color: '#1F2937', marginBottom: 4 },
  infoItemDesc: { fontSize: 13, color: '#6B7280', lineHeight: 18, fontWeight: '500' },
  closeInfoBtn: { width: '100%', height: 56, backgroundColor: '#F97316', borderRadius: 16, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  closeInfoText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },

  imagePickerPlaceholder: {
    width: '100%',
    height: 160,
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#FED7AA',
    borderStyle: 'dashed',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  imagePickerText: { fontSize: 16, fontWeight: '900', color: '#1F2937' },
  imagePickerSubtext: { fontSize: 12, fontWeight: '600', color: '#9CA3AF' },
  imagePreviewContainer: { width: '100%', height: 180, borderRadius: 24, overflow: 'hidden', borderWidth: 2, borderColor: '#F97316' },
  imagePreview: { width: '100%', height: '100%' },
  removeImageBtn: { position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },

  // Victory Bot (Donut Style)
  victoryBotWrapper: { alignItems: 'center', justifyContent: 'center' },
  botHead: { width: 80, height: 60, backgroundColor: '#F97316', borderRadius: 20, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  botEyes: { flexDirection: 'row', gap: 12, marginBottom: 6 },
  botEye: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#FFFFFF' },
  botSmile: { width: 24, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.3)', marginTop: 2 },
  botBodyWrapper: { flexDirection: 'row', alignItems: 'flex-start', marginTop: -5, zIndex: 1 },
  botMainBody: { width: 100, height: 80, backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 5, borderColor: '#F97316', alignItems: 'center', justifyContent: 'center', elevation: 4 },
  botArm: { width: 16, height: 45, backgroundColor: '#EA580C', borderRadius: 8, marginTop: 15, marginHorizontal: -8 },
  botBase: { width: 60, height: 12, backgroundColor: '#EA580C', borderBottomLeftRadius: 24, borderBottomRightRadius: 24, marginTop: -5 },

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
