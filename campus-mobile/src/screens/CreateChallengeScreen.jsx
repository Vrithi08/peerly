import React, { useState, useEffect } from 'react';
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
  Animated 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { challengeService } from '../services/api';
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
  Target
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const CATEGORIES = [
  { id: 'CODING', label: 'CODING', icon: Brain },
  { id: 'DESIGN', label: 'DESIGN', icon: Palette },
  { id: 'MUSIC', label: 'MUSIC', icon: Music },
  { id: 'PHOTOGRAPHY', label: 'PHOTO', icon: Camera },
  { id: 'WRITING', label: 'WRITING', icon: PenTool },
  { id: 'OTHER', label: 'OTHER', icon: Sparkles }
];

export default function CreateChallengeScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('CODING');
  const [submissionDeadline, setSubmissionDeadline] = useState(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000));
  const [votingDeadline, setVotingDeadline] = useState(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000));
  const [showPicker, setShowPicker] = useState(null); // 'submission' or 'voting'
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    let newErrors = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    else if (title.length < 3) newErrors.title = 'Min 3 characters';
    
    if (!description.trim()) newErrors.description = 'Description is required';
    else if (description.length < 20) newErrors.description = 'Min 20 characters';
    
    if (votingDeadline <= submissionDeadline) {
      newErrors.voting = 'Voting must end after submission';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await challengeService.create({
        title,
        description,
        category,
        submissionDeadline: submissionDeadline.toISOString(),
        endDate: votingDeadline.toISOString(), // Voting deadline is the final end date
        status: 'OPEN'
      });
      Alert.alert('Arena Ready!', 'Your challenge is now live for everyone to see.', [
        { text: 'View Arena', onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      Alert.alert('Deployment Failed', 'Could not create challenge. Please check your inputs.');
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event, selectedDate) => {
    if (selectedDate) {
      if (showPicker === 'submission') setSubmissionDeadline(selectedDate);
      else setVotingDeadline(selectedDate);
    }
    setShowPicker(null);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Create Arena</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>Host a <Text style={styles.titleUnderline}>Challenge</Text></Text>
          <Text style={styles.introSubtitle}>Define the rules and let the competition begin.</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          
          {/* Field 1: Title */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>Challenge Title</Text>
            <View style={[styles.inputContainer, errors.title && styles.inputError]}>
              <Tag size={18} color={errors.title ? '#F43F5E' : '#9CA3AF'} />
              <TextInput
                style={styles.input}
                placeholder="e.g. Minimalist UI Sprint"
                placeholderTextColor="#9CA3AF"
                value={title}
                onChangeText={setTitle}
                maxLength={100}
              />
              <Text style={styles.charCount}>{title.length}/100</Text>
            </View>
            {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}
          </View>

          {/* Field 2: Description */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>Challenge Description</Text>
            <View style={[styles.textAreaContainer, errors.description && styles.inputError]}>
              <TextInput
                style={styles.textArea}
                placeholder="What are the goals, rules, and prizes?"
                placeholderTextColor="#9CA3AF"
                multiline
                numberOfLines={6}
                value={description}
                onChangeText={setDescription}
              />
            </View>
            {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
          </View>

          {/* Field 3: Category Chips */}
          <View style={styles.fieldWrapper}>
            <Text style={styles.fieldLabel}>Domain / Category</Text>
            <View style={styles.chipGrid}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[styles.chip, category === cat.id && styles.chipActive]}
                  onPress={() => setCategory(cat.id)}
                >
                  <cat.icon size={14} color={category === cat.id ? '#FFFFFF' : '#6B7280'} />
                  <Text style={[styles.chipText, category === cat.id && styles.chipTextActive]}>{cat.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Field 4 & 5: Deadlines */}
          <View style={styles.deadlineRow}>
            <View style={[styles.fieldWrapper, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>Submission Ends</Text>
              <TouchableOpacity 
                style={styles.datePickerBtn} 
                onPress={() => setShowPicker('submission')}
              >
                <Calendar size={16} color="#6B7280" />
                <Text style={styles.dateText}>{submissionDeadline.toLocaleDateString()}</Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.fieldWrapper, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>Voting Ends</Text>
              <TouchableOpacity 
                style={[styles.datePickerBtn, errors.voting && styles.inputError]} 
                onPress={() => setShowPicker('voting')}
              >
                <Target size={16} color={errors.voting ? '#F43F5E' : '#6B7280'} />
                <Text style={[styles.dateText, errors.voting && styles.errorText]}>{votingDeadline.toLocaleDateString()}</Text>
              </TouchableOpacity>
            </View>
          </View>
          {errors.voting && <Text style={[styles.errorText, { marginTop: -12, marginBottom: 20 }]}>{errors.voting}</Text>}

          {/* Preview Section */}
          <View style={styles.previewContainer}>
            <Text style={styles.previewHeader}>Live Preview</Text>
            <View style={styles.previewCard}>
              <View style={styles.previewBadge}><Text style={styles.previewBadgeText}>{category}</Text></View>
              <Text style={styles.previewTitle} numberOfLines={1}>{title || 'Untitled Challenge'}</Text>
              <Text style={styles.previewDesc} numberOfLines={2}>{description || 'Describe your challenge to see the preview here...'}</Text>
              <View style={styles.previewFooter}>
                <Clock size={12} color="#9CA3AF" />
                <Text style={styles.previewTimer}>ENDS IN 5 DAYS</Text>
              </View>
            </View>
          </View>

          {showPicker && (
            <DateTimePicker
              value={showPicker === 'submission' ? submissionDeadline : votingDeadline}
              mode="date"
              display="default"
              minimumDate={new Date()}
              onChange={onDateChange}
            />
          )}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Primary CTA */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.createBtn, (!title || !description) && styles.btnDisabled]} 
          onPress={handleCreate}
          disabled={loading || !title || !description}
        >
          {loading ? <ActivityIndicator color="#fff" /> : (
            <>
              <Text style={styles.createBtnText}>Publish Arena</Text>
              <ChevronRight size={18} color="#fff" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF7ED' },
  scrollContent: { paddingBottom: 20 },
  
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    height: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#FED7AA',
  },
  navTitle: { fontSize: 16, fontWeight: '800', color: '#1F2937' },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },

  introSection: { padding: 24, marginBottom: 12 },
  introTitle: { fontSize: 28, fontWeight: '900', color: '#1F2937', letterSpacing: -1 },
  titleUnderline: { textDecorationLine: 'underline', textDecorationColor: '#FED7AA' },
  introSubtitle: { fontSize: 14, color: '#6B7280', fontWeight: '600', marginTop: 6 },
  
  form: { paddingHorizontal: 24 },
  fieldWrapper: { marginBottom: 24 },
  fieldLabel: { fontSize: 13, fontWeight: '800', color: '#1F2937', marginBottom: 12, letterSpacing: 0.5 },
  
  inputContainer: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', 
    borderWidth: 1.5, borderColor: '#FED7AA', borderRadius: 16, paddingHorizontal: 16, height: 56, gap: 12 
  },
  input: { flex: 1, color: '#1F2937', fontSize: 15, fontWeight: '700' },
  inputError: { borderColor: '#F43F5E', backgroundColor: 'rgba(244, 63, 94, 0.05)' },
  charCount: { fontSize: 10, fontWeight: '800', color: '#6B7280' },
  errorText: { fontSize: 12, color: '#F43F5E', fontWeight: '700', marginTop: 6 },

  textAreaContainer: { 
    backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#FED7AA', 
    borderRadius: 20, padding: 20, minHeight: 140 
  },
  textArea: { flex: 1, color: '#1F2937', fontSize: 15, fontWeight: '600', textAlignVertical: 'top' },

  chipGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { 
    flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, 
    paddingVertical: 10, borderRadius: 12, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#FED7AA' 
  },
  chipActive: { backgroundColor: '#F97316', borderColor: '#F97316' },
  chipText: { fontSize: 11, fontWeight: '800', color: '#6B7280' },
  chipTextActive: { color: '#FFFFFF' },

  deadlineRow: { flexDirection: 'row', gap: 16 },
  datePickerBtn: { 
    flexDirection: 'row', alignItems: 'center', gap: 10, height: 52, 
    backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#FED7AA', borderRadius: 16, paddingHorizontal: 16 
  },
  dateText: { fontSize: 13, fontWeight: '800', color: '#1F2937' },

  // Preview
  previewContainer: { marginTop: 20, padding: 20, backgroundColor: 'rgba(249, 115, 22, 0.05)', borderRadius: 24, borderStyle: 'dashed', borderWidth: 1.5, borderColor: '#FED7AA' },
  previewHeader: { fontSize: 12, fontWeight: '900', color: '#F97316', letterSpacing: 1, marginBottom: 16, textAlign: 'center' },
  previewCard: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#FED7AA', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  previewBadge: { alignSelf: 'flex-start', backgroundColor: '#F97316', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 12 },
  previewBadgeText: { fontSize: 8, fontWeight: '900', color: '#FFFFFF' },
  previewTitle: { fontSize: 18, fontWeight: '900', color: '#1F2937', marginBottom: 6 },
  previewDesc: { fontSize: 12, color: '#6B7280', lineHeight: 18 },
  previewFooter: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 16 },
  previewTimer: { fontSize: 10, fontWeight: '900', color: '#6B7280' },

  footer: { padding: 24, paddingBottom: 110, borderTopWidth: 1, borderTopColor: '#E5E7EB', backgroundColor: '#FFF7ED' },
  createBtn: { 
    height: 64, backgroundColor: '#F97316', borderRadius: 24, 
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12,
    elevation: 4, shadowColor: '#F97316', shadowOpacity: 0.3, shadowRadius: 15, shadowOffset: { width: 0, height: 8 }
  },
  btnDisabled: { opacity: 0.3, backgroundColor: '#FED7AA' },
  createBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '900' },
});
