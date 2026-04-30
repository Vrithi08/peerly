import React, { useEffect, useState, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ScrollView,
  ActivityIndicator, 
  TouchableOpacity, 
  RefreshControl, 
  TextInput,
  Dimensions,
  Animated,
  Platform
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { helpService, notificationService } from '../services/api';
import { 
  Search, 
  Plus, 
  MessageCircle, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Coffee,
  Filter,
  ArrowRight,
  BookOpen,
  X,
  Users
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Modal } from 'react-native';

const { width } = Dimensions.get('window');

const FILTER_PILLS = [
  { id: 'ALL', label: 'All' },
  { id: 'URGENT', label: 'Urgent' },
  { id: 'TODAY', label: 'Today' },
  { id: 'CHILL', label: 'Chill' }
];

export default function HelpBoardScreen({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [activeSubject, setActiveSubject] = useState('All');
  const [activeStatus, setActiveStatus] = useState('ALL'); // ALL, OPEN, RESOLVED
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchPosts();
      fetchUnreadCount();
    }, [])
  );

  const fetchUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (err) {
      console.error(err);
    }
  };

  const handleShowNotifications = async () => {
    try {
      const data = await notificationService.getAll();
      setNotifications(data);
      setShowNotifications(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAsRead = async (id, refId) => {
    try {
      await notificationService.markAsRead(id);
      setUnreadCount(prev => Math.max(0, prev - 1));
      setShowNotifications(false);
      if (refId) {
        navigation.navigate('HelpPostDetails', { postId: refId });
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [posts, searchQuery, activeFilter, activeSubject, activeStatus]);

  const fetchPosts = async () => {
    try {
      const data = await helpService.getAllPosts();
      setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...posts];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(post => 
        post.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.subject.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Tab filter
    if (activeFilter === 'URGENT') filtered = filtered.filter(p => p.urgency === 'URGENT' && !p.resolved);
    else if (activeFilter === 'TODAY') filtered = filtered.filter(p => p.urgency === 'TODAY' && !p.resolved);
    else if (activeFilter === 'CHILL') filtered = filtered.filter(p => p.urgency === 'CHILL' && !p.resolved);
    else if (activeFilter === 'RESOLVED') filtered = filtered.filter(p => p.resolved);

    // Subject filter
    if (activeSubject !== 'All') {
      filtered = filtered.filter(p => p.subject === activeSubject);
    }

    // Status filter
    if (activeStatus === 'OPEN') {
      filtered = filtered.filter(p => !p.resolved);
    } else if (activeStatus === 'RESOLVED') {
      filtered = filtered.filter(p => p.resolved);
    }

    setFilteredPosts(filtered);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  const getUrgencyConfig = (urgency, resolved) => {
    if (resolved) return { label: 'RESOLVED', color: '#6B7280', icon: CheckCircle2, bg: '#F3F4F6' };
    switch (urgency) {
      case 'URGENT': return { label: 'URGENT', color: '#EF4444', icon: AlertCircle, bg: '#FEE2E2' };
      case 'TODAY': return { label: 'TODAY', color: '#F59E0B', icon: Clock, bg: '#FEF3C7' };
      case 'CHILL': return { label: 'CHILL', color: '#10B981', icon: Coffee, bg: '#D1FAE5' };
      default: return { label: 'CHILL', color: '#10B981', icon: Coffee, bg: '#D1FAE5' };
    }
  };

  const BackgroundBlobs = () => (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <View style={[styles.blob, { top: -50, right: -50, backgroundColor: 'rgba(249, 115, 22, 0.08)', width: 300, height: 300 }]} />
      <View style={[styles.blob, { bottom: 100, left: -100, backgroundColor: 'rgba(249, 115, 22, 0.05)', width: 400, height: 400 }]} />
    </View>
  );

  const HelpingMascot = () => {
    const tiltAnim = useRef(new Animated.Value(0)).current;
    const waveAnim = useRef(new Animated.Value(0)).current;
    
    useEffect(() => {
      // Body tilt animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(tiltAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
          Animated.timing(tiltAnim, { toValue: -1, duration: 1500, useNativeDriver: true }),
          Animated.timing(tiltAnim, { toValue: 0, duration: 1500, useNativeDriver: true })
        ])
      ).start();

      // Arm wave animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(waveAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(waveAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
          Animated.timing(waveAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
          Animated.timing(waveAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
          Animated.delay(2000)
        ])
      ).start();
    }, []);

    const tilt = tiltAnim.interpolate({
      inputRange: [-1, 1],
      outputRange: ['-10deg', '10deg']
    });

    const wave = waveAnim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '-60deg']
    });

    return (
      <Animated.View style={[styles.mascotContainer, { transform: [{ rotate: tilt }] }]}>
        <View style={styles.mascotHead}>
          <View style={styles.mascotEyeGroup}>
            <View style={styles.mascotEye} />
            <View style={styles.mascotEye} />
          </View>
        </View>
        <View style={styles.mascotBody}>
          <View style={styles.mascotArms}>
            <Animated.View style={[styles.mascotArm, { transform: [{ rotate: wave }, { translateX: -4 }] }]} />
            <View style={[styles.mascotArm, { transform: [{ rotate: '30deg' }, { translateX: 4 }] }]} />
          </View>
        </View>
        <View style={styles.mascotBase} />
      </Animated.View>
    );
  };

  const PostCard = ({ item, index }) => {
    const config = getUrgencyConfig(item.urgency, item.resolved);
    
    return (
      <Animated.View 
        style={[
          styles.cardWrapper,
          { opacity: 1 } // We can use the SlideUpView logic or just native animation
        ]}
      >
        <TouchableOpacity
          style={[styles.card, item.resolved && styles.cardResolved]}
          activeOpacity={0.9}
          onPress={() => navigation.navigate('HelpPostDetails', { postId: item.id })}
        >
          {/* Card Accent Line */}
          <View style={[styles.cardAccent, { backgroundColor: config.color }]} />

          <View style={styles.cardHeader}>
            <View style={[styles.urgencyBadge, { backgroundColor: config.bg }]}>
              <config.icon size={10} color={config.color} />
              <Text style={[styles.urgencyText, { color: config.color }]}>{config.label}</Text>
            </View>
            <View style={styles.subjectContainer}>
              <BookOpen size={10} color="#6B7280" />
              <Text style={styles.subjectText}>{item.subject}</Text>
            </View>
          </View>

          <Text style={styles.topicText}>{item.topic}</Text>
          <Text style={styles.descriptionText} numberOfLines={2}>{item.description}</Text>

          <View style={styles.statsRow}>
            <View style={styles.authorGroup}>
              <View style={styles.avatarMini}>
                <Text style={styles.avatarText}>{item.postedByName?.[0]}</Text>
              </View>
              <Text style={styles.authorName}>{item.postedByName}</Text>
            </View>
            <View style={styles.statPill}>
              <MessageCircle size={14} color="#F97316" />
              <Text style={styles.statText}>{item.replies?.length || 0} solutions</Text>
            </View>
            {item.resolved ? (
              <View style={styles.resolvedBadge}>
                <CheckCircle2 size={14} color="#10B981" />
                <Text style={styles.resolvedText}>Solved</Text>
              </View>
            ) : (
              <View style={styles.helpingPill}>
                <Users size={14} color="#9CA3AF" />
                <Text style={styles.helpingText}>Peers helping</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <BackgroundBlobs />
      <View style={styles.header}>
        <View style={styles.headerTitleGroup}>
          <HelpingMascot />
          <View>
            <Text style={styles.title}>🎓 Student Sync</Text>
            <Text style={styles.subtitle}>Ask anything. Answer everything.</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={styles.notificationBtn}
          onPress={handleShowNotifications}
        >
          <AlertCircle size={24} color="#F97316" />
          {unreadCount > 0 && <View style={styles.dot} />}
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color="#9CA3AF" />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search by subject or topic..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity 
          style={[styles.filterBtn, (activeSubject !== 'All' || activeStatus !== 'ALL') && styles.filterBtnActive]}
          onPress={() => setShowFilterModal(true)}
        >
          <Filter size={20} color={(activeSubject !== 'All' || activeStatus !== 'ALL') ? '#F97316' : '#6B7280'} />
        </TouchableOpacity>
      </View>

      <View style={{ height: 60 }}>
        <FlatList 
          horizontal
          data={FILTER_PILLS}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={[styles.pill, activeFilter === item.id && styles.pillActive]}
              onPress={() => setActiveFilter(item.id)}
            >
              <Text style={[styles.pillText, activeFilter === item.id && styles.pillTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#F97316" />
        </View>
      ) : (
        <FlatList 
          data={filteredPosts}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item, index }) => <PostCard item={item} index={index} />}
          contentContainerStyle={[styles.listContent, { paddingHorizontal: 24, paddingTop: 10 }]}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F97316" />}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Coffee size={64} color="#FED7AA" />
              <Text style={styles.emptyTitle}>No posts found</Text>
              <Text style={styles.emptyDesc}>Try adjusting your filters or search terms.</Text>
              <TouchableOpacity 
                style={styles.emptyBtn}
                onPress={() => navigation.navigate('CreateHelpPost')}
              >
                <Text style={styles.emptyBtnText}>Ask a Question</Text>
              </TouchableOpacity>
            </View>
          }
        />
      )}

      {/* Notifications Modal */}
      <Modal
        visible={showNotifications}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowNotifications(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Activity Alerts</Text>
              <TouchableOpacity onPress={() => setShowNotifications(false)}>
                <X size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>

            {notifications.length === 0 ? (
              <View style={styles.emptyNotif}>
                <MessageCircle size={48} color="#E5E7EB" />
                <Text style={styles.emptyText}>No recent activity</Text>
              </View>
            ) : (
              <FlatList
                data={notifications}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity 
                    style={[styles.notifCard, !item.read && styles.notifUnread]}
                    onPress={() => handleMarkAsRead(item.id, item.referenceId)}
                  >
                    <View style={styles.notifIconBox}>
                      <AlertCircle size={18} color={item.type === 'BEST_ANSWER' ? '#10B981' : '#F97316'} />
                    </View>
                    <View style={styles.notifTextContent}>
                      <Text style={styles.notifMessage}>{item.message}</Text>
                      <Text style={styles.notifTime}>Tap to view discussion</Text>
                    </View>
                    {!item.read && <View style={styles.unreadIndicator} />}
                  </TouchableOpacity>
                )}
              />
            )}
          </View>
        </View>
      </Modal>

      {/* Unified Filter Modal */}
      <Modal
        visible={showFilterModal}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.centerModalOverlay}>
          <View style={styles.subjectModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Refine Feed</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <X size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>

            <Text style={styles.filterSectionTitle}>Discussion Status</Text>
            <View style={styles.subjectGrid}>
              {[
                { id: 'ALL', label: 'All Status' },
                { id: 'OPEN', label: 'Open Questions' },
                { id: 'RESOLVED', label: 'Resolved' }
              ].map(status => (
                <TouchableOpacity 
                  key={status.id} 
                  style={[styles.subjectChip, activeStatus === status.id && styles.subjectChipActive]}
                  onPress={() => setActiveStatus(status.id)}
                >
                  <Text style={[styles.subjectChipText, activeStatus === status.id && styles.subjectChipTextActive]}>{status.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={[styles.filterSectionTitle, { marginTop: 24 }]}>Academic Subject</Text>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 300 }}>
              <View style={styles.subjectGrid}>
                {['All', 'Data Structures', 'Algorithms', 'DBMS', 'Operating Systems', 'Computer Networks', 'Mathematics', 'Physics', 'Other'].map(s => (
                  <TouchableOpacity 
                    key={s} 
                    style={[styles.subjectChip, activeSubject === s && styles.subjectChipActive]}
                    onPress={() => setActiveSubject(s)}
                  >
                    <Text style={[styles.subjectChipText, activeSubject === s && styles.subjectChipTextActive]}>{s}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            <TouchableOpacity 
              style={styles.applyBtn}
              onPress={() => setShowFilterModal(false)}
            >
              <Text style={styles.applyBtnText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <TouchableOpacity 
        style={styles.fab}
        onPress={() => navigation.navigate('CreateHelpPost')}
      >
        <Plus size={32} color="#FFFFFF" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  blob: { position: 'absolute', borderRadius: 200 },
  header: { paddingHorizontal: 24, paddingVertical: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: '900', color: '#1F2937', letterSpacing: -1 },
  subtitle: { fontSize: 14, color: '#6B7280', fontWeight: '600', marginTop: 2 },
  
  notificationBtn: { 
    width: 48, height: 48, borderRadius: 16, backgroundColor: '#FFF7ED', 
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#FED7AA' 
  },
  dot: { position: 'absolute', top: 12, right: 12, width: 10, height: 10, borderRadius: 5, backgroundColor: '#F97316', borderWidth: 2, borderColor: '#FFF7ED' },

  searchContainer: { paddingHorizontal: 24, marginBottom: 20, flexDirection: 'row', gap: 12 },
  searchBar: { 
    flex: 1, height: 54, backgroundColor: '#F9FAFB', borderRadius: 18, 
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, 
    borderWidth: 1, borderColor: '#E5E7EB' 
  },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 15, fontWeight: '600', color: '#1F2937' },
  filterBtn: { 
    width: 54, height: 54, backgroundColor: '#F9FAFB', borderRadius: 18, 
    justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB' 
  },

  filterScroll: { paddingHorizontal: 24, paddingBottom: 15 },
  listContent: { paddingBottom: 100 },
  pill: { 
    paddingHorizontal: 20, height: 40, borderRadius: 20, backgroundColor: '#F3F4F6', 
    justifyContent: 'center', marginRight: 10, borderWidth: 1, borderColor: 'transparent' 
  },
  pillActive: { backgroundColor: '#1F2937', borderColor: '#1F2937' },
  pillText: { fontSize: 13, fontWeight: '700', color: '#6B7280' },
  pillTextActive: { color: '#FFFFFF' },

  feed: { padding: 24, paddingTop: 10 },
  
  cardWrapper: { marginBottom: 20 },
  card: { 
    backgroundColor: '#FFFFFF', borderRadius: 28, padding: 20, 
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 15, 
    shadowOffset: { width: 0, height: 10 }, borderWidth: 1, borderColor: '#F3F4F6',
    overflow: 'hidden'
  },
  cardResolved: { opacity: 0.8, backgroundColor: '#F9FAFB' },
  cardAccent: { position: 'absolute', top: 0, left: 0, width: 6, height: '100%' },

  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  urgencyBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, gap: 4 },
  urgencyText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  subjectContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, backgroundColor: '#F3F4F6', borderRadius: 10, gap: 6 },
  subjectText: { fontSize: 11, fontWeight: '700', color: '#4B5563' },

  topicText: { fontSize: 18, fontWeight: '800', color: '#1F2937', marginBottom: 8, lineHeight: 24 },
  descriptionText: { fontSize: 14, color: '#6B7280', fontWeight: '500', lineHeight: 20, marginBottom: 20 },

  statsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 16 },
  authorGroup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatarMini: { width: 24, height: 24, borderRadius: 8, backgroundColor: '#F97316', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900' },
  authorName: { fontSize: 12, fontWeight: '700', color: '#4B5563' },

  statPill: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statText: { fontSize: 13, fontWeight: '700', color: '#F97316' },
  helpingPill: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  helpingText: { fontSize: 12, fontWeight: '600', color: '#9CA3AF' },
  resolvedBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#ECFDF5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  resolvedText: { fontSize: 12, fontWeight: '700', color: '#10B981' },

  // Mascot Styles
  headerTitleGroup: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  mascotContainer: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  mascotHead: { width: 20, height: 16, backgroundColor: '#F97316', borderRadius: 6, justifyContent: 'center' },
  mascotEyeGroup: { flexDirection: 'row', justifyContent: 'center', gap: 4 },
  mascotEye: { width: 4, height: 4, backgroundColor: '#FFFFFF', borderRadius: 2 },
  mascotBody: { width: 14, height: 10, backgroundColor: '#FB923C', borderBottomLeftRadius: 4, borderBottomRightRadius: 4, marginTop: -2 },
  mascotArms: { flexDirection: 'row', justifyContent: 'space-between', width: 28, position: 'absolute', top: 0 },
  mascotArm: { width: 8, height: 3, backgroundColor: '#FDBA74', borderRadius: 2 },
  mascotBase: { width: 18, height: 4, backgroundColor: '#E5E7EB', borderRadius: 4, marginTop: 2 },

  fab: { position: 'absolute', bottom: 100, right: 24, width: 72, height: 72, borderRadius: 36, backgroundColor: '#F97316', justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#F97316', shadowOpacity: 0.3, shadowRadius: 15 },
  
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyState: { alignItems: 'center', paddingVertical: 80 },
  emptyTitle: { fontSize: 20, fontWeight: '900', color: '#1F2937', marginTop: 20 },
  emptyDesc: { fontSize: 14, color: '#6B7280', fontWeight: '500', marginTop: 8, textAlign: 'center', paddingHorizontal: 40 },
  emptyBtn: { marginTop: 32, backgroundColor: '#FFF1E6', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 16, borderWidth: 1, borderColor: '#FED7AA' },
  emptyBtnText: { color: '#F97316', fontSize: 15, fontWeight: '800' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, height: '70%', padding: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 22, fontWeight: '900', color: '#1F2937', letterSpacing: -0.5 },
  emptyNotif: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16 },
  emptyText: { fontSize: 16, color: '#9CA3AF', fontWeight: '600' },
  notifCard: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#F9FAFB', borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#F3F4F6' },
  notifUnread: { backgroundColor: '#FFF7ED', borderColor: '#FED7AA' },
  notifIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', marginRight: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  notifTextContent: { flex: 1 },
  notifMessage: { fontSize: 14, fontWeight: '700', color: '#1F2937', lineHeight: 20 },
  notifTime: { fontSize: 12, color: '#9CA3AF', marginTop: 4, fontWeight: '600' },
  unreadIndicator: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#F97316', marginLeft: 8 },

  // Subject Modal
  centerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  subjectModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxHeight: '80%'
  },
  subjectGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10
  },
  subjectChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  subjectChipActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#F97316'
  },
  subjectChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280'
  },
  subjectChipTextActive: {
    color: '#F97316',
    fontWeight: '800'
  },
  filterBtnActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#F97316'
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12
  },
  applyBtn: {
    backgroundColor: '#F97316',
    height: 54,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    elevation: 4,
    shadowColor: '#F97316',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 }
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800'
  }
});
