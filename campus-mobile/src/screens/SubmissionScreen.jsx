import React, { useState, useEffect, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
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
  Switch,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  X, 
  Trash2, 
  Plus, 
  CheckCircle2, 
  Bot, 
  Info, 
  Search, 
  ArrowLeft, 
  Users, 
  ThumbsUp, 
  Flame, 
  Clock, 
  Award, 
  Bookmark, 
  Share2, 
  Trophy,
  Zap,
  Sparkles,
  ArrowUpRight,
  Calendar,
  Layers,
  Star,
  ChevronDown,
  ChevronUp,
  Brain,
  Palette,
  Target,
  FileText,
  Music,
  Image as ImageIcon,
  Video,
  File,
  Play,
  EyeOff,
  ChevronRight
} from 'lucide-react-native';
import ThemedAlert from '../components/ThemedAlert';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { challengeService, submissionService } from '../services/api';

const { width } = Dimensions.get('window');

// --- Victory Robot (Donut Style) ---
const VictoryRobot = () => {
  const jumpAnim = useRef(new Animated.Value(0)).current;
  const armAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(jumpAnim, { toValue: -15, duration: 400, useNativeDriver: true }),
          Animated.timing(armAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(jumpAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
          Animated.timing(armAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  const rotateL = armAnim.interpolate({ inputRange: [0, 1], outputRange: ['15deg', '-30deg'] });
  const rotateR = armAnim.interpolate({ inputRange: [0, 1], outputRange: ['-15deg', '30deg'] });

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
          <Trophy size={32} color="#F97316" strokeWidth={2.5} />
        </View>
        <Animated.View style={[styles.botArm, { transform: [{ rotate: rotateR }] }]} />
      </View>
      <View style={styles.botBase} />
    </Animated.View>
  );
};

export default function SubmissionScreen({ route, navigation }) {
  const { challengeId, challengeTitle } = route.params;
  
  // State
  const [challenge, setChallenge] = useState(null);
  const [existingSubmission, setExistingSubmission] = useState(null);
  const [submissionType, setSubmissionType] = useState('text'); // 'text', 'image', 'audio'
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState([]); // Multiple for image
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', type: 'info' });

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const showAlert = (title, message, type = 'info') => {
    setAlertConfig({ visible: true, title, message, type });
  };

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
      const [challengeData, mySub] = await Promise.all([
        challengeService.getById(challengeId),
        submissionService.getMySubmission(challengeId)
      ]);
      setChallenge(challengeData);
      setExistingSubmission(mySub);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    try {
      const normalized = dateStr.toString().replace(' ', 'T');
      const date = new Date(normalized);
      return isNaN(date.getTime()) ? null : date;
    } catch (e) {
      return null;
    }
  };

  const updateCountdown = () => {
    if (!challenge) return;
    const deadline = challenge.submissionDeadline || challenge.endDate;
    const end = parseDate(deadline);
    if (!end) { setCountdown('--'); return; }

    const now = new Date().getTime();
    const diff = end.getTime() - now;
    
    if (diff <= 0) { 
      setCountdown('CLOSED'); 
      return; 
    }

    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    setCountdown(`${h}h ${m}m ${s}s`);
  };

  const pickImage = async () => {
    try {
      console.log('Picking image...');
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      console.log('Picker result:', result);

      if (!result.canceled) {
        const newAssets = result.assets.map(asset => ({
          id: Math.random().toString(36).substr(2, 9),
          uri: asset.uri,
          type: 'image',
          mimeType: asset.mimeType || 'image/jpeg',
          fileName: asset.fileName || `img_${Date.now()}.jpg`
        }));
        setAttachments([...attachments, ...newAssets].slice(0, 4));
      }
    } catch (err) {
      console.error('Pick Image Error:', err);
      showAlert('PICK FAILED', 'Could not open your gallery. Check permissions!', 'error');
    }
  };

  const pickVideo = async () => {
    try {
      console.log('Picking video...');
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'videos',
        allowsEditing: true,
        quality: 0.8,
      });

      console.log('Video Picker result:', result);

      if (!result.canceled) {
        const newAssets = result.assets.map(asset => ({
          id: Math.random().toString(36).substr(2, 9),
          uri: asset.uri,
          type: 'video',
          mimeType: asset.mimeType || 'video/mp4',
          fileName: asset.fileName || `vid_${Date.now()}.mp4`
        }));
        setAttachments([...attachments, ...newAssets].slice(0, 1)); // One video at a time
      }
    } catch (err) {
      console.error('Pick Video Error:', err);
      showAlert('PICK FAILED', 'Could not access your video vault!', 'error');
    }
  };

  const pickAudio = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        multiple: false
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        setAttachments([{
          id: Math.random().toString(36).substr(2, 9),
          uri: asset.uri,
          name: asset.name || asset.fileName || `audio_${Date.now()}.mp3`,
          type: 'audio',
          mimeType: asset.mimeType || 'audio/mpeg'
        }]);
      }
    } catch (err) {
      showAlert('PICK FAILED', 'Your anthem could not be retrieved from the vault!', 'error');
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-powerpoint', 'text/plain'],
        multiple: false
      });

      if (!result.canceled) {
        const asset = result.assets[0];
        setAttachments([{
          id: Math.random().toString(36).substr(2, 9),
          uri: asset.uri,
          name: asset.name || asset.fileName || 'document.pdf',
          type: 'document',
          mimeType: asset.mimeType || 'application/pdf'
        }]);
      }
    } catch (err) {
      showAlert('PICK FAILED', 'We could not access your document vault. Check permissions!', 'error');
    }
  };

  const removeAttachment = (id) => {
    setAttachments(attachments.filter(a => a.id !== id));
  };

  const handleSubmit = async () => {
    if (submissionType === 'text' && !content.trim()) {
      showAlert('EMPTY ENTRY', 'A silent warrior cannot win. Write something before submitting!', 'warning');
      return;
    }
    if (submissionType !== 'text' && attachments.length === 0) {
      showAlert('NO MEDIA', 'An arena requires proof! Upload at least one file.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      if (submissionType === 'text') {
        await submissionService.create(challengeId, { 
          content,
          type: 'text'
        });
      } else {
        // Submit all attachments in parallel for better performance
        const uploadPromises = attachments.map(asset => 
          submissionService.create(challengeId, { 
            content: '',
            attachmentUri: asset.uri,
            type: submissionType,
            mimeType: asset.mimeType,
            fileName: asset.fileName || asset.name
          })
        );
        await Promise.all(uploadPromises);
      }
      
      setShowSuccessModal(true);
    } catch (err) {
      console.error('Submission Error:', err);
      const status = err.response?.status;
      
      let friendlyMsg = 'The arena walls held strong. Please try conquering again.';
      
      if (status === 400) {
        friendlyMsg = 'Your submission seems to be missing something or the challenge is no longer accepting entries.';
      } else if (status === 413) {
        friendlyMsg = 'This file is a bit too heavy for the arena! Try a smaller one.';
      } else if (err.message?.includes('timeout')) {
        friendlyMsg = 'The connection timed out. Please check your signal and try again.';
      }
      
      showAlert('SUBMISSION FAILED', friendlyMsg, 'error');
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
          <View style={styles.conqueredContainer}>
            <View style={styles.conqueredIllustration}>
              <VictoryRobot />
            </View>
            
            <View style={styles.conqueredBadge}>
              <Sparkles size={16} color="#B45309" />
              <Text style={styles.conqueredBadgeText}>CHAMPION'S MARK DETECTED</Text>
            </View>

            <Text style={styles.conqueredTitle}>ARENA CONQUERED!</Text>
            <Text style={styles.conqueredSubtitle}>
              You've already left your mark in this arena. The judges are currently reviewing your conquest! 
              {challenge?.status === 'VOTING' ? " \n\nGo forth and cast your votes for other warriors!" : " \n\nSit back and watch the others fight for glory."}
            </Text>
            
            <View style={styles.conqueredInfoBox}>
              <View style={styles.conqueredInfoInner}>
                <Trophy size={20} color="#F97316" />
                <View>
                  <Text style={styles.conqueredInfoLabel}>CONQUEST DATE</Text>
                  <Text style={styles.conqueredInfoValue}>{new Date(existingSubmission.submittedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</Text>
                </View>
              </View>
              <ChevronRight size={20} color="#D1D5DB" />
            </View>

            <TouchableOpacity 
              style={styles.arenaActionBtn}
              onPress={() => navigation.goBack()}
            >
              <LinearGradient
                colors={['#F97316', '#EA580C']}
                style={styles.arenaActionGradient}
              >
                <Text style={styles.arenaActionText}>RETURN TO ARENA FEED</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.formContainer}>
            
            {/* Step 1: Type Selector (Chips) */}
            <Text style={styles.formLabel}>What type of entry are you submitting?</Text>
            <View style={styles.chipContainer}>
              {[
                { id: 'text', label: 'Text / Code', icon: FileText },
                { id: 'image', label: 'Image', icon: ImageIcon },
                { id: 'video', label: 'Video', icon: Video },
                { id: 'document', label: 'Document', icon: File },
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
                {submissionType === 'text' ? 'Write your solution' : 
                 submissionType === 'image' ? 'Upload photos' : 
                 submissionType === 'video' ? 'Upload video' :
                 submissionType === 'document' ? 'Attach documents' : 'Attach audio'}
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
              ) : submissionType === 'video' ? (
                <View style={styles.imageSection}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageScroll}>
                    {attachments.map(vid => (
                      <View key={vid.id} style={styles.imageThumbBox}>
                        <View style={[styles.imageThumb, { backgroundColor: '#1F2937', justifyContent: 'center', alignItems: 'center' }]}>
                          <Play size={32} color="#FFF" />
                        </View>
                        <TouchableOpacity style={styles.removeImgBtn} onPress={() => removeAttachment(vid.id)}>
                          <X size={12} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    ))}
                    {attachments.length < 1 && (
                      <TouchableOpacity style={styles.addImgBtn} onPress={pickVideo}>
                        <Video size={24} color="#9CA3AF" />
                        <Text style={styles.addImgText}>Add Video</Text>
                      </TouchableOpacity>
                    )}
                  </ScrollView>
                  <Text style={styles.uploadHelper}>Support MP4, MOV (Max 50MB)</Text>
                </View>
              ) : submissionType === 'document' ? (
                <View style={styles.imageSection}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.imageScroll}>
                    {attachments.map(doc => (
                      <View key={doc.id} style={styles.imageThumbBox}>
                        <View style={[styles.imageThumb, { backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', padding: 10 }]}>
                          <FileText size={32} color="#F97316" />
                          <Text style={{ fontSize: 8, color: '#6B7280', marginTop: 4, textAlign: 'center' }} numberOfLines={2}>{doc.name}</Text>
                        </View>
                        <TouchableOpacity style={styles.removeImgBtn} onPress={() => removeAttachment(doc.id)}>
                          <X size={12} color="#fff" />
                        </TouchableOpacity>
                      </View>
                    ))}
                    {attachments.length < 1 && (
                      <TouchableOpacity style={styles.addImgBtn} onPress={pickDocument}>
                        <File size={24} color="#9CA3AF" />
                        <Text style={styles.addImgText}>Select File</Text>
                      </TouchableOpacity>
                    )}
                  </ScrollView>
                  <Text style={styles.uploadHelper}>Support PDF, DOC, DOCX, TXT (Max 20MB)</Text>
                </View>
              ) : (
                <View style={styles.audioSection}>
                  {attachments.length > 0 ? (
                    <View style={styles.audioPreviewBox}>
                      <View style={styles.audioInfo}>
                        <Music size={24} color="#F97316" />
                        <Text style={styles.audioName} numberOfLines={1}>{attachments[0].name}</Text>
                      </View>
                      <TouchableOpacity onPress={() => removeAttachment(attachments[0].id)}>
                        <X size={20} color="#6B7280" />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity style={styles.audioPicker} onPress={pickAudio}>
                      <Music size={32} color="#9CA3AF" />
                      <Text style={styles.audioPickerText}>Choose Audio File</Text>
                    </TouchableOpacity>
                  )}
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
                  <Text style={styles.ruleText}>One entry per warrior. Make your submission count!</Text>
                </View>
                <View style={styles.ruleItem}>
                  <CheckCircle2 size={12} color="#F97316" />
                  <Text style={styles.ruleText}>Entries cannot be modified after final submission.</Text>
                </View>
                <View style={styles.ruleItem}>
                  <CheckCircle2 size={12} color="#F97316" />
                  <Text style={styles.ruleText}>Every submission counts towards your profile XP.</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

        {/* SUCCESS MODAL (Donut Style) */}
        <Modal visible={showSuccessModal} transparent animationType="slide">
          <View style={styles.donutModalOverlay}>
            <View style={styles.donutCard}>
              <View style={styles.donutCardInner}>
                <View style={styles.donutIllustrationBox}>
                  <VictoryRobot />
                </View>

                <Text style={styles.donutHeadline}>Conquest!</Text>
                <Text style={styles.donutSubtext}>Your entries are sealed in the arena.</Text>

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

        <ThemedAlert 
          visible={alertConfig.visible}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          onConfirm={() => setAlertConfig({ ...alertConfig, visible: false })}
        />
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

  // Success State
  successWrapper: { padding: 24, alignItems: 'center' },
  congratsHeader: { alignItems: 'center', marginBottom: 32, marginTop: 20 },
  sparkleBox: { width: 80, height: 80, borderRadius: 30, backgroundColor: '#FEF3C7', justifyContent: 'center', alignItems: 'center', marginBottom: 20, transform: [{ rotate: '12deg' }] },
  successTitle: { fontSize: 32, fontWeight: '900', color: '#1F2937', letterSpacing: -1 },
  successSubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 22, marginTop: 12, paddingHorizontal: 20 },
  
  rewardCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1F2937', borderRadius: 24, padding: 20, width: '100%', marginBottom: 32, elevation: 8, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 15 },
  rewardInfo: { flex: 1 },
  rewardLabel: { fontSize: 10, fontWeight: '900', color: '#9CA3AF', letterSpacing: 1, marginBottom: 4 },
  rewardValue: { fontSize: 16, fontWeight: '800', color: '#FFFFFF' },
  rewardBadge: { backgroundColor: '#F59E0B', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  rewardXp: { fontSize: 14, fontWeight: '900', color: '#FFFFFF' },

  artifactCard: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 32, borderWidth: 2, borderColor: '#FED7AA', overflow: 'hidden', elevation: 4, shadowColor: '#F97316', shadowOpacity: 0.1, shadowRadius: 20 },
  artifactHeader: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#F3F4F6', gap: 10 },
  artifactTitle: { fontSize: 11, fontWeight: '900', color: '#F97316', letterSpacing: 1.5, flex: 1 },
  artifactDate: { fontSize: 10, fontWeight: '700', color: '#9CA3AF' },
  artifactContent: { padding: 24 },
  artifactText: { fontSize: 15, color: '#1F2937', lineHeight: 24, fontWeight: '500', fontStyle: 'italic' },
  artifactMediaWrapper: { borderRadius: 24, overflow: 'hidden', backgroundColor: '#F9FAFB' },
  artifactImage: { width: '100%', height: 240 },
  mediaOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', padding: 16 },
  mediaTag: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(31, 41, 55, 0.8)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  mediaTagText: { fontSize: 10, fontWeight: '900', color: '#FFF', letterSpacing: 1 },

  returnBtn: { width: '100%', height: 64, borderRadius: 24, overflow: 'hidden', marginTop: 40 },
  returnGradient: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12 },
  returnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },

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

  // Conquered Section
  conqueredContainer: { padding: 24, alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 40, borderTopLeftRadius: 80, borderBottomRightRadius: 80, borderWidth: 1, borderColor: '#FED7AA', marginTop: 10, marginHorizontal: 4, elevation: 5, shadowColor: '#F97316', shadowOpacity: 0.1, shadowRadius: 20 },
  conqueredIllustration: { height: 160, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  conqueredBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FEF3C7', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100, marginBottom: 20 },
  conqueredBadgeText: { fontSize: 10, fontWeight: '900', color: '#B45309', letterSpacing: 1 },
  conqueredTitle: { fontSize: 28, fontWeight: '900', color: '#1F2937', letterSpacing: -0.5, marginBottom: 12 },
  conqueredSubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 22, marginBottom: 32, fontWeight: '500', paddingHorizontal: 10 },
  conqueredInfoBox: { width: '100%', backgroundColor: '#F9FAFB', borderRadius: 28, padding: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 32, borderWidth: 1, borderColor: '#F3F4F6' },
  conqueredInfoInner: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  conqueredInfoLabel: { fontSize: 10, fontWeight: '900', color: '#9CA3AF', letterSpacing: 1, marginBottom: 4 },
  conqueredInfoValue: { fontSize: 15, fontWeight: '800', color: '#1F2937' },
  arenaActionBtn: { 
    width: '100%', 
    height: 64, 
    borderTopLeftRadius: 32,
    borderBottomRightRadius: 32,
    borderTopRightRadius: 8,
    borderBottomLeftRadius: 8,
    overflow: 'hidden', 
    elevation: 8, 
    shadowColor: '#F97316', 
    shadowOpacity: 0.3, 
    shadowRadius: 15, 
    shadowOffset: { width: 0, height: 8 } 
  },
  arenaActionGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  arenaActionText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900', letterSpacing: 1.2 },
  
  // Audio Section
  audioSection: { },
  audioPicker: { height: 140, backgroundColor: '#FFFFFF', borderRadius: 24, justifyContent: 'center', alignItems: 'center', gap: 12, borderStyle: 'dashed', borderWidth: 2, borderColor: '#FED7AA' },
  audioPickerText: { fontSize: 14, fontWeight: '800', color: '#6B7280' },
  audioPreviewBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FFFFFF', padding: 20, borderRadius: 24, borderWidth: 1, borderColor: '#FED7AA' },
  audioInfo: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  audioName: { fontSize: 14, fontWeight: '700', color: '#1F2937', flex: 1 },

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

  // Success Modal Styles
  modalOverlay: { 
    flex: 1, 
    backgroundColor: 'rgba(31, 41, 55, 0.8)', 
    justifyContent: 'center', 
    alignItems: 'center',
    padding: 24
  },
  successCard: { 
    width: '100%', 
    borderRadius: 32, 
    overflow: 'hidden',
    elevation: 20,
    shadowColor: '#F97316',
    shadowOpacity: 0.3,
    shadowRadius: 30
  },
  successCardInner: { 
    padding: 32, 
    alignItems: 'center' 
  },
  iconCircle: { 
    width: 80, 
    height: 80, 
    borderRadius: 40, 
    backgroundColor: '#FFF7ED', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#FED7AA'
  },
  modalTitle: { 
    fontSize: 24, 
    fontWeight: '900', 
    color: '#1F2937', 
    letterSpacing: -0.5,
    marginBottom: 12
  },
  modalSubtitle: { 
    fontSize: 15, 
    color: '#6B7280', 
    textAlign: 'center', 
    lineHeight: 22, 
    marginBottom: 24,
    fontWeight: '500'
  },
  pointsBadge: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 8, 
    backgroundColor: '#FEF3C7', 
    paddingHorizontal: 16, 
    paddingVertical: 8, 
    borderRadius: 12,
    marginBottom: 32
  },
  pointsText: { 
    fontSize: 12, 
    fontWeight: '900', 
    color: '#B45309', 
    letterSpacing: 1 
  },
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
  donutIllustrationBox: { height: 110, justifyContent: 'center', marginBottom: 15 },
  donutHeadline: { fontSize: 24, fontWeight: '900', color: '#374151', textAlign: 'center', marginBottom: 6, letterSpacing: -0.5 },
  donutSubtext: { fontSize: 13, color: '#6B7280', textAlign: 'center', marginBottom: 20, fontWeight: '500', lineHeight: 18 },
  donutActionBtn: { width: '100%', height: 48, borderRadius: 12, borderWidth: 2, borderColor: '#F97316', justifyContent: 'center', alignItems: 'center' },
  donutActionText: { color: '#F97316', fontSize: 13, fontWeight: '900', letterSpacing: 0.5 },

  // Victory Bot (Donut Style)
  victoryBotWrapper: { alignItems: 'center', justifyContent: 'center' },
  botHead: { width: 70, height: 55, backgroundColor: '#F97316', borderRadius: 18, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  botEyes: { flexDirection: 'row', gap: 10, marginBottom: 5 },
  botEye: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FFFFFF' },
  botSmile: { width: 20, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.3)', marginTop: 2 },
  botBodyWrapper: { flexDirection: 'row', alignItems: 'flex-start', marginTop: -5, zIndex: 1 },
  botMainBody: { width: 90, height: 70, backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 4, borderColor: '#F97316', alignItems: 'center', justifyContent: 'center', elevation: 4 },
  botArm: { width: 14, height: 40, backgroundColor: '#EA580C', borderRadius: 8, marginTop: 15, marginHorizontal: -8 },
  botBase: { width: 55, height: 10, backgroundColor: '#EA580C', borderBottomLeftRadius: 20, borderBottomRightRadius: 20, marginTop: -5 },
});
