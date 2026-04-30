import React, { useState, useRef } from 'react';
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
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { helpService } from '../services/api';
import { 
  ArrowLeft, 
  ChevronDown, 
  AlertCircle, 
  Clock, 
  Coffee,
  Code,
  BookOpen,
  Check
} from 'lucide-react-native';

const SUBJECTS = [
  "Data Structures",
  "Operating Systems",
  "DBMS",
  "Computer Networks",
  "Machine Learning",
  "Discrete Mathematics",
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

export default function CreateHelpPostScreen({ navigation }) {
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState('CHILL');
  const [loading, setLoading] = useState(false);
  const [showSubjects, setShowSubjects] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const successScale = useRef(new Animated.Value(0)).current;

  const handlePost = async () => {
    if (!subject || !topic || !description) {
      Alert.alert('Missing Info', 'Please fill in all fields before posting.');
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
      setShowSuccess(true);
      Animated.spring(successScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true
      }).start();
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to post your question. Please try again.');
    } finally {
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
          
          {/* Subject Dropdown */}
          <Text style={styles.label}>Subject</Text>
          <TouchableOpacity 
            style={styles.dropdown}
            onPress={() => setShowSubjects(!showSubjects)}
            activeOpacity={0.7}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <BookOpen size={20} color="#F97316" />
              <Text style={[styles.dropdownText, !subject && { color: '#9CA3AF' }]}>
                {subject || "Select a subject..."}
              </Text>
            </View>
            <ChevronDown size={20} color="#6B7280" />
          </TouchableOpacity>

          {showSubjects && (
            <View style={styles.subjectsList}>
              {SUBJECTS.map((s) => (
                <TouchableOpacity 
                  key={s} 
                  style={styles.subjectItem}
                  onPress={() => {
                    setSubject(s);
                    setShowSubjects(false);
                  }}
                >
                  <Text style={[styles.subjectItemText, subject === s && { color: '#F97316', fontWeight: '800' }]}>
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Topic Input */}
          <Text style={styles.label}>Topic</Text>
          <TextInput 
            style={styles.input}
            placeholder="e.g. Dijkstra's Algorithm Complexity"
            placeholderTextColor="#9CA3AF"
            value={topic}
            onChangeText={setTopic}
          />

          {/* Description */}
          <View style={styles.labelRow}>
            <Text style={styles.label}>Description</Text>
            <View style={styles.codeBadge}>
              <Code size={12} color="#F97316" />
              <Text style={styles.codeBadgeText}>Snippets supported</Text>
            </View>
          </View>
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

          {/* Urgency Selector */}
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

      {/* Custom Success Modal */}
      <Modal
        visible={showSuccess}
        transparent={true}
        animationType="fade"
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.successBox, { transform: [{ scale: successScale }] }]}>
            <View style={styles.successIconBox}>
              <Check size={40} color="#FFFFFF" strokeWidth={3} />
            </View>
            <Text style={styles.successTitle}>Posted Successfully!</Text>
            <Text style={styles.successDesc}>Your question is now live on the campus board. Peers will be notified soon!</Text>
            <TouchableOpacity 
              style={styles.successBtn}
              onPress={() => {
                setShowSuccess(false);
                navigation.goBack();
              }}
            >
              <Text style={styles.successBtnText}>Back to Board</Text>
            </TouchableOpacity>
          </Animated.View>
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
  scrollContent: { padding: 24, paddingBottom: 100 },
  
  label: { fontSize: 15, fontWeight: '800', color: '#1F2937', marginBottom: 8, marginTop: 16 },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 8 },
  
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    height: 56,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: '#FED7AA'
  },
  dropdownText: { fontSize: 15, fontWeight: '600', color: '#1F2937' },
  subjectsList: { backgroundColor: '#FFFFFF', borderRadius: 16, marginTop: 8, borderWidth: 1, borderColor: '#FED7AA', overflow: 'hidden' },
  subjectItem: { padding: 16, borderBottomWidth: 1, borderBottomColor: '#FFF7ED' },
  subjectItemText: { fontSize: 14, fontWeight: '600', color: '#4B5563' },

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
  
  codeBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFF7ED', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#FED7AA' },
  codeBadgeText: { fontSize: 11, fontWeight: '800', color: '#F97316' },

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

  // Success Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(31, 41, 55, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  successBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    padding: 32,
    width: '100%',
    alignItems: 'center',
    elevation: 20,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 }
  },
  successIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F97316',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#F97316',
    shadowOpacity: 0.4,
    shadowRadius: 15,
    elevation: 8
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1F2937',
    marginBottom: 12
  },
  successDesc: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    fontWeight: '600'
  },
  successBtn: {
    backgroundColor: '#1F2937',
    paddingHorizontal: 40,
    paddingVertical: 16,
    borderRadius: 18,
    width: '100%',
    alignItems: 'center'
  },
  successBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800'
  }
});
