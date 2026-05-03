import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Image, 
  ActivityIndicator, 
  Alert, 
  Dimensions, 
  Animated,
  Platform,
  Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  X, 
  FileText, 
  Image as ImageIcon, 
  Music, 
  CheckCircle2, 
  ChevronRight, 
  Clock,
  Info,
  Send,
  EyeOff,
  Plus,
  Trash2,
  ShieldCheck,
  Zap,
  Play
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { challengeService, submissionService } from '../services/api';

const { width } = Dimensions.get('window');

export default function SubmissionScreen({ route, navigation }) {
  const { challengeId, challengeTitle } = route.params;
  
  // State
  const [challenge, setChallenge] = useState(null);
  const [submissionType, setSubmissionType] = useState('text'); // 'text', 'image', 'audio'
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState([]); // Multiple for image
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingSubmission, setExistingSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState('');

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchData();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, [submissionType]);

  const fetchData = async () => {
    try {
      const [challengeData, mySubs] = await Promise.all([
        challengeService.getById(challengeId),
        submissionService.getByChallengeId(challengeId)
      ]);
      setChallenge(challengeData);
      if (mySubs && mySubs.length > 0) {
        setExistingSubmission(mySubs[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateCountdown = () => {
    if (!challenge) return;
    const now = new Date().getTime();
    const end = new Date(challenge.endDate).getTime();
    const diff = end - now;
    if (diff <= 0) { setCountdown('ENDED'); return; }
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    setCountdown(`${h}h ${m}m ${s}s`);
  };

  const pickImage = async () => {
    if (attachments.length >= 4) {
      Alert.alert('Limit Reached', 'You can only upload up to 4 images.');
      return;
    }
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      setAttachments([...attachments, { uri: result.assets[0].uri, id: Date.now().toString() }]);
    }
  };

  const removeAttachment = (id) => {
    setAttachments(attachments.filter(a => a.id !== id));
  };

  const handleSubmit = async () => {
    if (submissionType === 'text' && !content.trim()) {
      Alert.alert('Empty Entry', 'Please write something before submitting.');
      return;
    }
    if (submissionType !== 'text' && attachments.length === 0) {
      Alert.alert('No Media', 'Please upload at least one file.');
      return;
    }

    setIsSubmitting(true);
    try {
      await submissionService.create(challengeId, { 
        content: submissionType === 'text' ? content : '',
        attachmentUri: attachments[0]?.uri, // Using first one for now as per current API
        type: submissionType,
        isAnonymous
      });
      Alert.alert('Entry Received', 'Your submission has been received. Good luck!', [
        { text: 'Done', onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      Alert.alert('Submission Failed', 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <View style={styles.center}><ActivityIndicator color="#F97316" /></View>;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeBtn}>
          <X size={24} color="#1F2937" />
        </TouchableOpacity>
        <View style={styles.headerTitleBox}>
          <Text style={styles.headerTitle} numberOfLines={1}>{challenge?.title}</Text>
          <Text style={styles.headerSub}>{challenge?.category} • {countdown}</Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {existingSubmission ? (
          /* PREVIOUS SUBMISSION VIEW */
          <View style={styles.submittedContainer}>
            <View style={styles.submittedIconBox}>
              <ShieldCheck size={48} color="#F97316" />
            </View>
            <Text style={styles.submittedTitle}>Submission Confirmed</Text>
            <Text style={styles.submittedDesc}>You have already participated in this challenge. Your entry is being reviewed by the judges.</Text>
            
            <View style={styles.previewCard}>
              <Text style={styles.previewLabel}>YOUR ENTRY</Text>
              {existingSubmission.contentType === 'TEXT' || existingSubmission.type === 'text' ? (
                <Text style={styles.previewText} numberOfLines={10}>{existingSubmission.textContent || existingSubmission.content}</Text>
              ) : (
                <View style={styles.previewMediaBox}>
                  {(existingSubmission.contentUrl || existingSubmission.secure_url || existingSubmission.url || existingSubmission.imageUrl || existingSubmission.attachmentUri) ? (
                    <Image 
                      source={{ uri: existingSubmission.contentUrl || existingSubmission.secure_url || existingSubmission.url || existingSubmission.imageUrl || existingSubmission.attachmentUri }} 
                      style={styles.previewImage} 
                    />
                  ) : (
                    <View style={styles.previewMediaPlaceholder}>
                      <ImageIcon size={32} color="rgba(249, 115, 22, 0.2)" />
                      <Text style={styles.previewMediaText}>Media Entry</Text>
                    </View>
                  )}
                </View>
              )}
            </View>

            <TouchableOpacity style={styles.backArenaBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.backArenaText}>Back to Arena</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* ACTIVE SUBMISSION FORM */
          <View style={styles.formContainer}>
            
            {/* Step 1: Type Selector (Chips) */}
            <Text style={styles.formLabel}>What type of entry are you submitting?</Text>
            <View style={styles.chipContainer}>
              {[
                { id: 'text', label: 'Text / Code', icon: FileText },
                { id: 'image', label: 'Image', icon: ImageIcon },
                { id: 'audio', label: 'Audio', icon: Music }
              ].map(item => (
                <TouchableOpacity 
                  key={item.id}
                  style={[styles.chip, submissionType === item.id && styles.chipActive]}
                  onPress={() => {
                    setSubmissionType(item.id);
                    setAttachments([]);
                    setContent('');
                  }}
                >
                  <item.icon size={16} color={submissionType === item.id ? '#FFFFFF' : '#6B7280'} />
                  <Text style={[styles.chipText, submissionType === item.id && styles.chipTextActive]}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Step 2: Dynamic Input Area */}
            <Animated.View style={[styles.inputWrapper, { opacity: fadeAnim }]}>
              <Text style={styles.inputTitle}>
                {submissionType === 'text' ? 'Write your solution' : submissionType === 'image' ? 'Upload photos' : 'Attach audio'}
              </Text>
              
              {submissionType === 'text' ? (
                <View style={styles.textContainer}>
                  <TextInput
                    style={styles.textArea}
                    placeholder="Describe your solution or paste your code here..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    value={content}
                    onChangeText={setContent}
                    maxLength={4000}
                  />
                  <Text style={styles.charCount}>{content.length}/4000</Text>
                </View>
              ) : submissionType === 'image' ? (
                <View style={styles.imageSection}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageScroll}>
                    {attachments.map(img => (
                      <View key={img.id} style={styles.imageThumbBox}>
                        <Image source={{ uri: img.uri }} style={styles.imageThumb} />
                        <TouchableOpacity style={styles.removeImgBtn} onPress={() => removeAttachment(img.id)}>
                          <X size={12} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    ))}
                    {attachments.length < 4 && (
                      <TouchableOpacity style={styles.addImgBtn} onPress={pickImage}>
                        <ImageIcon size={24} color="#9CA3AF" />
                        <Text style={styles.addImgText}>{attachments.length}/4</Text>
                      </TouchableOpacity>
                    )}
                  </ScrollView>
                  <Text style={styles.uploadHelper}>Support JPG, PNG, WEBP (Max 10MB)</Text>
                </View>
              ) : (
                <View style={styles.audioSection}>
                  <TouchableOpacity style={styles.audioPicker} onPress={() => Alert.alert('Peerly', 'Select audio file from your device')}>
                    <Music size={32} color="#9CA3AF" />
                    <Text style={styles.audioPickerText}>Choose Audio File</Text>
                  </TouchableOpacity>
                </View>
              )}
            </Animated.View>

            {/* Step 3: Options & Submit */}
            <View style={styles.optionsSection}>
              <View style={styles.toggleRow}>
                <View style={styles.toggleMeta}>
                  <EyeOff size={18} color="#1F2937" />
                  <Text style={styles.toggleLabel}>Hide my name from submission</Text>
                </View>
                <Switch 
                  value={isAnonymous} 
                  onValueChange={setIsAnonymous} 
                  trackColor={{ false: '#E5E7EB', true: '#F97316' }}
                  thumbColor={'#FFFFFF'}
                />
              </View>

              <TouchableOpacity 
                style={[styles.submitBtn, (submissionType === 'text' ? !content.trim() : attachments.length === 0) && styles.submitBtnDisabled]}
                onPress={handleSubmit}
                disabled={isSubmitting || (submissionType === 'text' ? !content.trim() : attachments.length === 0)}
              >
                {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Submit Entry</Text>}
              </TouchableOpacity>
              
              <Text style={styles.termsText}>
                By submitting, you agree to our <Text style={styles.termsLink}>Terms & Conditions</Text> and <Text style={styles.termsLink}>Privacy Policy</Text>.
              </Text>
            </View>

            <View style={styles.rulesCard}>
              <View style={styles.rulesHeader}>
                <Info size={16} color="#F97316" />
                <Text style={styles.rulesTitle}>Submission Guidelines</Text>
              </View>
              <View style={styles.rulesList}>
                <View style={styles.ruleItem}>
                  <CheckCircle2 size={12} color="#F97316" />
                  <Text style={styles.ruleText}>One unique submission allowed per challenge</Text>
                </View>
                <View style={styles.ruleItem}>
                  <CheckCircle2 size={12} color="#F97316" />
                  <Text style={styles.ruleText}>Entries cannot be modified after final submission</Text>
                </View>
                <View style={styles.ruleItem}>
                  <CheckCircle2 size={12} color="#F97316" />
                  <Text style={styles.ruleText}>Strict plagiarism checks are performed</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        <View style={{ height: 140 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF7ED' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { paddingBottom: 20 },

  // Header
  header: { 
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16, 
    borderBottomWidth: 1, borderBottomColor: '#FED7AA' 
  },
  closeBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center', marginLeft: -12 },
  headerTitleBox: { marginLeft: 12, flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#1F2937' },
  headerSub: { fontSize: 12, fontWeight: '600', color: '#6B7280', marginTop: 2 },

  // Submitted State
  submittedContainer: { padding: 32, alignItems: 'center' },
  submittedIconBox: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFF1E6', justifyContent: 'center', alignItems: 'center', marginBottom: 24, borderWidth: 1, borderColor: '#FED7AA' },
  submittedTitle: { fontSize: 24, fontWeight: '900', color: '#1F2937', marginBottom: 12 },
  submittedDesc: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  previewCard: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#FED7AA', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  previewLabel: { fontSize: 10, fontWeight: '900', color: '#F97316', letterSpacing: 1, marginBottom: 16 },
  previewText: { fontSize: 14, color: '#1F2937', lineHeight: 22, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  previewMediaPlaceholder: { height: 120, justifyContent: 'center', alignItems: 'center', gap: 12 },
  previewMediaText: { fontSize: 12, fontWeight: '700', color: '#9CA3AF' },
  previewMediaBox: { marginTop: 12, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#FED7AA' },
  previewImage: { width: '100%', height: 160 },
  backArenaBtn: { marginTop: 32, paddingHorizontal: 40, paddingVertical: 18, backgroundColor: '#F97316', borderRadius: 24, elevation: 4, shadowColor: '#F97316', shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 6 } },
  backArenaText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },

  // Form Container
  formContainer: { padding: 24 },
  formLabel: { fontSize: 16, fontWeight: '800', color: '#1F2937', marginBottom: 20 },
  
  // Chip UI
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 40 },
  chip: { 
    flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 12, 
    borderRadius: 24, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#FED7AA', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5
  },
  chipActive: { backgroundColor: '#F97316', borderColor: '#F97316' },
  chipText: { fontSize: 13, fontWeight: '700', color: '#6B7280' },
  chipTextActive: { color: '#FFFFFF' },

  // Input Area
  inputWrapper: { marginBottom: 32 },
  inputTitle: { fontSize: 16, fontWeight: '900', color: '#1F2937', marginBottom: 20 },
  textContainer: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, minHeight: 200, borderWidth: 1, borderColor: '#FED7AA', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  textArea: { fontSize: 15, color: '#1F2937', lineHeight: 22, textAlignVertical: 'top', flex: 1, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  charCount: { alignSelf: 'flex-end', fontSize: 11, fontWeight: '700', color: '#9CA3AF', marginTop: 12 },

  // Image Section
  imageSection: { },
  imageScroll: { gap: 12 },
  imageThumbBox: { width: 100, height: 100, borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#FED7AA' },
  imageThumb: { width: '100%', height: '100%' },
  removeImgBtn: { position: 'absolute', top: 6, right: 6, width: 22, height: 22, borderRadius: 11, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  addImgBtn: { width: 100, height: 100, borderRadius: 20, borderStyle: 'dashed', borderWidth: 2, borderColor: '#FED7AA', backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', gap: 8 },
  addImgText: { fontSize: 11, fontWeight: '800', color: '#9CA3AF' },
  uploadHelper: { fontSize: 11, color: '#6B7280', fontWeight: '700', marginTop: 16 },

  // Audio Section
  audioSection: { },
  audioPicker: { height: 140, backgroundColor: '#FFFFFF', borderRadius: 24, justifyContent: 'center', alignItems: 'center', gap: 12, borderStyle: 'dashed', borderWidth: 2, borderColor: '#FED7AA' },
  audioPickerText: { fontSize: 14, fontWeight: '800', color: '#6B7280' },

  // Options & Actions
  optionsSection: { marginTop: 10 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32 },
  toggleMeta: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleLabel: { fontSize: 14, fontWeight: '700', color: '#1F2937' },
  
  submitBtn: { height: 64, backgroundColor: '#F97316', borderRadius: 24, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#F97316', shadowOpacity: 0.3, shadowRadius: 15, shadowOffset: { width: 0, height: 8 } },
  submitBtnDisabled: { opacity: 0.3, backgroundColor: '#FED7AA' },
  submitBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '900' },
  
  termsText: { fontSize: 11, color: '#6B7280', fontWeight: '600', textAlign: 'center', marginTop: 24, lineHeight: 18 },
  termsLink: { color: '#F97316', textDecorationLine: 'underline', fontWeight: '800' },

  // Rules Card
  rulesCard: { marginTop: 48, backgroundColor: '#FFF1E6', borderRadius: 24, padding: 24, borderWidth: 1, borderColor: '#FED7AA' },
  rulesHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  rulesTitle: { fontSize: 15, fontWeight: '900', color: '#F97316' },
  rulesList: { gap: 16 },
  ruleItem: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ruleText: { fontSize: 12, color: '#6B7280', fontWeight: '600', lineHeight: 18, flex: 1 },
});
