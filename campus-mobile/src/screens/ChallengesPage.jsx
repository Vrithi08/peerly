import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
// Premium Arena Refresh 1.2
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  ActivityIndicator, 
  Dimensions, 
  Animated,
  Platform,
  FlatList,
  RefreshControl,
  Modal,
  Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Search, 
  Filter, 
  ChevronRight, 
  Star, 
  Bookmark, 
  Users, 
  Clock, 
  Brain, 
  Palette, 
  Camera, 
  Music, 
  PenTool, 
  Sparkles,
  ArrowRight,
  ChevronLeft,
  LayoutGrid,
  Zap,
  ArrowUpRight,
  Plus,
  CheckCircle2
} from 'lucide-react-native';
import { challengeService } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const getCategoryColor = (cat) => {
  switch (cat?.toUpperCase()) {
    case 'CODING': return '#F97316'; // Primary Orange
    case 'DESIGN': return '#EA580C'; // Deeper Orange
    case 'WRITING': return '#C2410C'; // Rich Orange
    case 'MUSIC': return '#9A3412'; // Burnt Orange
    case 'PHOTO': 
    case 'PHOTOGRAPHY':
    case 'PHOTO CONTEST': return '#FB923C'; // Light Orange
    default: return '#F97316';
  }
};

const getCategoryIcon = (cat) => {
  switch (cat?.toUpperCase()) {
    case 'CODING': return Brain;
    case 'DESIGN': return Palette;
    case 'WRITING': return PenTool;
    case 'MUSIC': return Music;
    case 'PHOTO': 
    case 'PHOTOGRAPHY':
    case 'PHOTO CONTEST': return Camera;
    default: return Sparkles;
  }
};

const CATEGORIES = [
  { id: 'ALL', label: 'All', icon: LayoutGrid },
  { id: 'CODING', label: 'Coding', icon: Brain },
  { id: 'DESIGN', label: 'Design', icon: Palette },
  { id: 'PHOTOGRAPHY', label: 'Photo', icon: Camera },
  { id: 'MUSIC', label: 'Music', icon: Music },
  { id: 'WRITING', label: 'Writing', icon: PenTool },
  { id: 'OTHER', label: 'Other', icon: Sparkles },
];

const STATUS_FILTERS = ['All', 'OPEN', 'VOTING', 'CLOSED'];

export default function ChallengesPage({ navigation }) {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const hasLoaded = useRef(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      fetchChallenges();
      loadBookmarks();
    }, [])
  );

  const loadBookmarks = async () => {
    try {
      const userStr = await AsyncStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const userEmail = user.email || 'guest';
        const saved = await AsyncStorage.getItem(`bookmarks_${userEmail}`);
        if (saved) {
          const ids = JSON.parse(saved);
          setBookmarkedIds(Array.isArray(ids) ? ids : []);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      hasLoaded.current = true;
    }
  };

  useEffect(() => {
    const saveBookmarks = async () => {
      if (hasLoaded.current) {
        const userStr = await AsyncStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          const userEmail = user.email || 'guest';
          await AsyncStorage.setItem(`bookmarks_${userEmail}`, JSON.stringify(bookmarkedIds));
        }
      }
    };
    saveBookmarks();
  }, [bookmarkedIds]);

  const fetchChallenges = async () => {
    try {
      const data = await challengeService.getAll();
      setChallenges(data);
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }).start();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const toggleBookmark = (id) => {
    if (id === undefined || id === null) return;
    setBookmarkedIds(prev => 
      prev.includes(id) ? prev.filter(bId => bId !== id) : [...prev, id]
    );
  };

  const handleFilterPress = () => {
    setShowFilterModal(true);
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchChallenges();
  };

  const filteredChallenges = useMemo(() => {
    return challenges.filter(c => {
      const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           c.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'ALL' || c.category === selectedCategory;
      const matchesStatus = selectedStatus === 'All' || c.status === selectedStatus;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [challenges, searchQuery, selectedCategory, selectedStatus]);

  const getTimeRemaining = (item) => {
    const deadlineStr = item.status === 'OPEN' ? item.submissionDeadline : item.votingDeadline;
    if (!deadlineStr || item.status === 'CLOSED') return 'Closed';
    
    const now = new Date().getTime();
    const end = new Date(deadlineStr.replace(' ', 'T')).getTime();
    if (isNaN(end)) return 'TBD';
    
    const diff = end - now;
    if (diff <= 0) return 'Ended';
    
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (d > 0) return `${d}d ${h}h left`;
    if (h > 0) return `${h}h left`;
    return 'Ends soon';
  };

  const renderChallengeCard = ({ item }) => {
    const accentColor = getCategoryColor(item.category);
    const CategoryIcon = getCategoryIcon(item.category);
    
    return (
      <TouchableOpacity 
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('ChallengeDetails', { challengeId: item.id })}
      >
        <View style={[styles.cardAccent, { backgroundColor: accentColor }]} />
        
        <View style={styles.cardInner}>
          <View style={styles.cardHeader}>
            <View style={[styles.categoryIcon, { backgroundColor: accentColor + '15' }]}>
              <CategoryIcon size={18} color={accentColor} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Users size={12} color="#6B7280" />
                  <Text style={styles.metaText}>{item.participantsCount || 0} enrolled</Text>
                </View>
                <View style={styles.metaDot} />
                <View style={styles.metaItem}>
                  <Clock size={12} color="#6B7280" />
                  <Text style={styles.metaText}>{getTimeRemaining(item)}</Text>
                </View>
              </View>
            </View>
            <TouchableOpacity 
              style={styles.favBtn} 
              onPress={() => toggleBookmark(item.id)}
            >
              <Bookmark 
                size={16} 
                color={bookmarkedIds.includes(item.id) ? "#F97316" : "#9CA3AF"} 
                fill={bookmarkedIds.includes(item.id) ? "#F97316" : "none"}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.cardDesc} numberOfLines={2}>{item.description}</Text>

          <View style={styles.cardFooter}>
            <View style={styles.pointsInfo}>
              <Text style={styles.pointsLabel}>POTENTIAL REWARD</Text>
              <Text style={[styles.pointsValue, { color: accentColor }]}>{item.reward || '500 XP'}</Text>
            </View>
            
            <LinearGradient
              colors={['#1F2937', '#111827']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={styles.actionBtn}
            >
              <Text style={styles.actionBtnText}>Participate</Text>
              <ArrowUpRight size={14} color="#FFF" />
            </LinearGradient>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={['#FFF7ED', '#FFF1E2']}
        style={StyleSheet.absoluteFill}
      />
      
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>Explore <Text style={styles.accentText}>Arena</Text></Text>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveCount}>{challenges.filter(c => c.status === 'OPEN').length} Live Challenges</Text>
            </View>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={styles.createHeaderBtn}
              onPress={() => navigation.navigate('CreateChallenge')}
            >
              <LinearGradient
                colors={['#F97316', '#EA580C']}
                style={styles.profileGradient}
              >
                <Plus size={20} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.profileBtn}
              onPress={() => navigation.navigate('Profile')}
            >
              <LinearGradient
                colors={['#F97316', '#EA580C']}
                style={styles.profileGradient}
              >
                <Users size={18} color="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <FlatList
        data={filteredChallenges}
        renderItem={renderChallengeCard}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F97316" />}
        ListHeaderComponent={
          <>
            {/* Search & Filter Bar */}
            <View style={styles.searchRow}>
              <View style={styles.searchContainer}>
                <Search size={18} color="#F97316" />
                <TextInput 
                  style={styles.searchInput}
                  placeholder="Find your next arena..."
                  placeholderTextColor="#9CA3AF"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                <TouchableOpacity 
                  style={styles.filterBtnSmall}
                  onPress={handleFilterPress}
                >
                  <Filter size={16} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Featured Section */}
            {challenges.length > 0 && searchQuery === '' && selectedCategory === 'ALL' && (
              <View style={styles.featuredSection}>
                <Text style={styles.sectionLabel}>FEATURED ARENA</Text>
                <TouchableOpacity 
                  style={styles.featuredCard}
                  activeOpacity={0.9}
                  onPress={() => navigation.navigate('ChallengeDetails', { challengeId: challenges[0].id })}
                >
                  <LinearGradient
                    colors={['#1F2937', '#111827']}
                    style={styles.featuredGradient}
                  >
                    {challenges[0].imageUrl && (
                      <Image 
                        source={{ uri: challenges[0].imageUrl }} 
                        style={[StyleSheet.absoluteFill, { opacity: 0.4 }]} 
                        resizeMode="cover"
                      />
                    )}
                    <View style={styles.featuredContent}>
                      <View style={styles.featuredBadge}>
                        <Sparkles size={12} color="#F97316" />
                        <Text style={styles.featuredBadgeText}>Trending Now</Text>
                      </View>
                      <Text style={styles.featuredTitle}>{challenges[0].title}</Text>
                      <Text style={styles.featuredDesc} numberOfLines={2}>{challenges[0].description}</Text>
                      <View style={styles.featuredFooter}>
                        <View style={styles.featuredMeta}>
                          <Users size={14} color="rgba(255,255,255,0.6)" />
                          <Text style={styles.featuredMetaText}>{challenges[0].participantsCount || 0} active peers</Text>
                        </View>
                        <View style={styles.featuredAction}>
                          <Text style={styles.featuredActionText}>Enter Arena</Text>
                          <ArrowUpRight size={14} color="#F97316" />
                        </View>
                      </View>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}

            {/* Category Chips */}
            <View style={styles.categoriesSection}>
              <Text style={styles.sectionLabel}>DOMAINS</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                {CATEGORIES.map(cat => (
                  <TouchableOpacity 
                    key={cat.id}
                    activeOpacity={0.7}
                    style={[styles.catChip, selectedCategory === cat.id && styles.catChipActive]}
                    onPress={() => setSelectedCategory(cat.id)}
                  >
                    <cat.icon size={14} color={selectedCategory === cat.id ? '#FFFFFF' : '#6B7280'} />
                    <Text style={[styles.catChipText, selectedCategory === cat.id && styles.catChipTextActive]}>{cat.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <Text style={styles.sectionLabel}>ACTIVE CHALLENGES</Text>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <Sparkles size={48} color="#F97316" fill="#F97316" fillOpacity={0.1} />
            </View>
            <Text style={styles.emptyTitle}>No Arenas Found</Text>
            <Text style={styles.emptySub}>Try searching for a different category or keyword.</Text>
          </View>
        }

      />

      {/* Floating Action Button for New Challenge */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.8}
        onPress={() => navigation.navigate('CreateChallenge')}
      >
        <Plus color="#FFFFFF" size={28} />
      </TouchableOpacity>
      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setShowFilterModal(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Filter by Status</Text>
            {STATUS_FILTERS.map(status => (
              <TouchableOpacity 
                key={status} 
                style={[styles.modalOption, selectedStatus === status && styles.modalOptionActive]}
                onPress={() => {
                  setSelectedStatus(status);
                  setShowFilterModal(false);
                }}
              >
                <Text style={[styles.modalOptionText, selectedStatus === status && styles.modalOptionTextActive]}>
                  {status}
                </Text>
                {selectedStatus === status && <CheckCircle2 size={18} color="#F97316" />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF7ED' },
  header: { paddingHorizontal: 24, paddingTop: 24, paddingBottom: 16 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 32, fontWeight: '900', color: '#1F2937', letterSpacing: -1.5 },
  accentText: { color: '#F97316', fontStyle: 'italic' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#22C55E' },
  liveCount: { fontSize: 13, fontWeight: '700', color: '#6B7280' },
  profileBtn: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden' },
  headerActions: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  createHeaderBtn: { width: 44, height: 44, borderRadius: 22, overflow: 'hidden' },
  profileGradient: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  sectionLabel: { fontSize: 11, fontWeight: '900', color: '#9CA3AF', letterSpacing: 2, marginBottom: 16, paddingHorizontal: 24 },

  // Search
  searchRow: { paddingHorizontal: 24, marginBottom: 32 },
  searchContainer: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', 
    borderRadius: 24, paddingHorizontal: 20, height: 64, borderWidth: 2, borderColor: '#FED7AA',
    elevation: 4, shadowColor: '#F97316', shadowOpacity: 0.05, shadowRadius: 10
  },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 15, fontWeight: '800', color: '#1F2937' },
  filterBtnSmall: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },

  // Featured
  featuredSection: { marginBottom: 40 },
  featuredCard: { marginHorizontal: 24, borderRadius: 32, overflow: 'hidden', elevation: 8, shadowColor: '#1F2937', shadowOpacity: 0.2, shadowRadius: 15, shadowOffset: { width: 0, height: 8 } },
  featuredGradient: { padding: 24, minHeight: 200 },
  featuredContent: { flex: 1 },
  featuredBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 6, backgroundColor: 'rgba(249, 115, 22, 0.15)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginBottom: 16 },
  featuredBadgeText: { fontSize: 11, fontWeight: '900', color: '#F97316' },
  featuredTitle: { fontSize: 24, fontWeight: '900', color: '#FFFFFF', marginBottom: 8, letterSpacing: -0.5 },
  featuredDesc: { fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 22, fontWeight: '500', marginBottom: 24 },
  featuredFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', paddingTop: 16 },
  featuredMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  featuredMetaText: { fontSize: 12, color: 'rgba(255,255,255,0.6)', fontWeight: '600' },
  featuredAction: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  featuredActionText: { fontSize: 13, fontWeight: '900', color: '#F97316' },

  // Categories
  categoriesSection: { marginBottom: 40 },
  categoryScroll: { paddingHorizontal: 24, gap: 12 },
  catChip: { 
    flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 18, paddingVertical: 12, 
    borderRadius: 16, backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#FED7AA' 
  },
  catChipActive: { backgroundColor: '#F97316', borderColor: '#F97316', elevation: 4, shadowColor: '#F97316', shadowOpacity: 0.3, shadowRadius: 8 },
  catChipText: { fontSize: 13, fontWeight: '800', color: '#6B7280' },
  catChipTextActive: { color: '#FFFFFF' },

  // List
  listContent: { paddingBottom: 100, paddingTop: 8 },
  card: { 
    marginHorizontal: 24, backgroundColor: '#FFFFFF', borderRadius: 28, marginBottom: 20, overflow: 'hidden',
    borderWidth: 2, borderColor: '#FED7AA', elevation: 3, shadowColor: '#F97316', shadowOpacity: 0.05, shadowRadius: 10
  },
  cardAccent: { height: 4, width: '100%' },
  cardInner: { padding: 20 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  categoryIcon: { width: 48, height: 48, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  headerText: { flex: 1, marginLeft: 16 },
  cardTitle: { fontSize: 18, fontWeight: '900', color: '#1F2937', marginBottom: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaText: { fontSize: 12, fontWeight: '700', color: '#9CA3AF' },
  metaDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: '#E5E7EB', marginHorizontal: 10 },
  favBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  cardDesc: { fontSize: 14, color: '#6B7280', lineHeight: 22, marginBottom: 24, fontWeight: '500' },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F9FAFB', paddingTop: 20 },
  pointsInfo: { gap: 2 },
  pointsLabel: { fontSize: 10, fontWeight: '900', color: '#D1D5DB', letterSpacing: 1 },
  pointsValue: { fontSize: 18, fontWeight: '900' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 16 },
  actionBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },

  emptyContainer: { padding: 60, alignItems: 'center', justifyContent: 'center' },
  emptyIconBox: { width: 80, height: 80, borderRadius: 30, backgroundColor: '#FFF7ED', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '900', color: '#1F2937', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#9CA3AF', fontWeight: '500', textAlign: 'center' },

  paginationContainer: { paddingVertical: 40, alignItems: 'center' },
  resultsText: { fontSize: 12, fontWeight: '800', color: '#9CA3AF', fontStyle: 'italic' },

  fab: {
    position: 'absolute', bottom: 30, right: 24, width: 68, height: 68, borderRadius: 24,
    backgroundColor: '#F97316', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#F97316', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.4, shadowRadius: 15, elevation: 10,
    borderWidth: 3, borderColor: '#FFFFFF'
  },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(31, 41, 55, 0.4)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: width * 0.85, backgroundColor: '#FFFFFF', borderRadius: 32, padding: 32, elevation: 20 },
  modalTitle: { fontSize: 22, fontWeight: '900', color: '#1F2937', marginBottom: 24 },
  modalOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  modalOptionActive: { borderBottomColor: '#F97316' },
  modalOptionText: { fontSize: 16, fontWeight: '700', color: '#6B7280' },
  modalOptionTextActive: { color: '#F97316', fontWeight: '900' },
});
