import React, { useState, useEffect, useMemo, useRef } from 'react';
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

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchChallenges();
    loadBookmarks();
  }, []);

  const loadBookmarks = async () => {
    try {
      const saved = await AsyncStorage.getItem('bookmarks');
      if (saved) setBookmarkedIds(JSON.parse(saved));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    AsyncStorage.setItem('bookmarks', JSON.stringify(bookmarkedIds));
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
                  <Text style={styles.metaText}>{item.participants || 0} enrolled</Text>
                </View>
                <View style={styles.metaDot} />
                <View style={styles.metaItem}>
                  <Clock size={12} color="#6B7280" />
                  <Text style={styles.metaText}>4d left</Text>
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
      <View style={styles.header}>
        <Text style={styles.title}>Explore Arena</Text>
        <Text style={styles.subtitle}>Discover and participate in challenges across categories</Text>
      </View>

      {/* Search & Filter Bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
          <Search size={18} color="#00000020" />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search challenges, categories..."
            placeholderTextColor="#9CA3AF"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity 
            style={styles.goBtn}
            onPress={() => Keyboard.dismiss()}
          >
            <ArrowRight size={18} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          style={styles.filterBtn}
          onPress={handleFilterPress}
        >
          <Filter size={18} color="#1F2937" />
          <Text style={styles.filterBtnText}>{selectedStatus}</Text>
        </TouchableOpacity>
      </View>

      {/* Category Chips */}
      <View style={styles.categoriesSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity 
              key={cat.id}
              style={[styles.catChip, selectedCategory === cat.id && styles.catChipActive]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <cat.icon size={14} color={selectedCategory === cat.id ? '#FFFFFF' : '#6B7280'} />
              <Text style={[styles.catChipText, selectedCategory === cat.id && styles.catChipTextActive]}>{cat.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator color="#F97316" /></View>
      ) : (
        <FlatList
          data={filteredChallenges}
          renderItem={renderChallengeCard}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F97316" />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Sparkles size={48} color="rgba(249, 115, 22, 0.2)" />
              <Text style={styles.emptyText}>No challenges found</Text>
            </View>
          }
          ListFooterComponent={
            <View style={styles.paginationContainer}>
              <Text style={styles.resultsText}>{filteredChallenges.length} results • Page 1 of 1</Text>
              <View style={styles.pageButtons}>
                <TouchableOpacity style={styles.pageBtn}><Text style={styles.pageBtnText}>Prev</Text></TouchableOpacity>
                {[1].map(n => (
                  <TouchableOpacity key={n} style={[styles.pageNum, n === 1 && styles.pageNumActive]}>
                    <Text style={[styles.pageNumText, n === 1 && styles.pageNumTextActive]}>{n}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity style={styles.pageBtn}><Text style={styles.pageBtnText}>Next</Text></TouchableOpacity>
              </View>
            </View>
          }
        />
      )}

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
  header: { paddingHorizontal: 24, paddingVertical: 16 },
  title: { fontSize: 28, fontWeight: '900', color: '#1F2937', letterSpacing: -1 },
  subtitle: { fontSize: 13, fontWeight: '600', color: '#6B7280', marginTop: 4 },

  // Search & Filter
  searchRow: { flexDirection: 'row', paddingHorizontal: 24, gap: 12, marginBottom: 20 },
  searchContainer: { 
    flex: 3, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', 
    borderRadius: 20, paddingHorizontal: 16, height: 56, borderWidth: 1, borderColor: '#FED7AA',
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 14, fontWeight: '700', color: '#1F2937' },
  goBtn: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#F97316', justifyContent: 'center', alignItems: 'center' },
  filterBtn: { 
    flex: 1.5, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, 
    backgroundColor: '#FFFFFF', borderRadius: 20, borderWidth: 1, borderColor: '#FED7AA',
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5
  },
  filterBtnText: { fontSize: 12, fontWeight: '800', color: '#1F2937' },

  // Categories
  categoriesSection: { marginBottom: 24 },
  categoryScroll: { paddingHorizontal: 24, gap: 8 },
  catChip: { 
    flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10, 
    borderRadius: 14, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#FED7AA' 
  },
  catChipActive: { backgroundColor: '#F97316', borderColor: '#F97316' },
  catChipText: { fontSize: 12, fontWeight: '800', color: '#6B7280' },
  catChipTextActive: { color: '#FFFFFF' },

  // List Layout
  listContent: { paddingHorizontal: 24, paddingBottom: 120, paddingTop: 8 },
  card: { 
    backgroundColor: '#FFFFFF', borderRadius: 24, marginBottom: 16, overflow: 'hidden',
    borderWidth: 1.5, borderColor: '#FED7AA', 
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    flexDirection: 'row'
  },
  cardAccent: { width: 6, height: '100%' },
  cardInner: { flex: 1, padding: 20 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  categoryIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  headerText: { flex: 1, marginLeft: 12 },
  cardTitle: { fontSize: 16, fontWeight: '900', color: '#1F2937', marginBottom: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 11, fontWeight: '700', color: '#6B7280' },
  metaDot: { width: 3, height: 3, borderRadius: 1.5, backgroundColor: '#D1D5DB', marginHorizontal: 8 },
  favBtn: { padding: 4 },

  cardDesc: { fontSize: 14, color: '#4B5563', lineHeight: 20, marginBottom: 20, fontWeight: '500' },

  cardFooter: { 
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', 
    paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F3F4F6' 
  },
  pointsInfo: { gap: 2 },
  pointsLabel: { fontSize: 10, fontWeight: '900', color: '#9CA3AF', letterSpacing: 0.5 },
  pointsValue: { fontSize: 16, fontWeight: '900' },
  
  actionBtn: { 
    flexDirection: 'row', alignItems: 'center', gap: 8, 
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 12 
  },
  actionBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },

  // Bottom / Pagination
  emptyContainer: { padding: 80, alignItems: 'center', justifyContent: 'center', gap: 16 },
  emptyText: { fontSize: 14, fontWeight: '800', color: '#6B7280' },
  paginationContainer: { paddingVertical: 32, alignItems: 'center' },
  resultsText: { fontSize: 12, fontWeight: '700', color: '#6B7280', marginBottom: 20 },
  pageButtons: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  pageBtn: { paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#FFFFFF', borderRadius: 10, borderWidth: 1, borderColor: '#FED7AA' },
  pageBtnText: { fontSize: 12, fontWeight: '800', color: '#1F2937' },
  pageNum: { width: 32, height: 32, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  pageNumActive: { backgroundColor: '#F97316' },
  pageNumText: { fontSize: 12, fontWeight: '800', color: '#6B7280' },
  pageNumTextActive: { color: '#FFFFFF' },

  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // FAB
  fab: {
    position: 'absolute', bottom: 110, right: 24, width: 64, height: 64, borderRadius: 32,
    backgroundColor: '#F97316', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#F97316', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: width * 0.8, backgroundColor: '#FFFFFF', borderRadius: 24, padding: 24, elevation: 20 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#1F2937', marginBottom: 20 },
  modalOption: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  modalOptionActive: { borderBottomColor: '#F9731610' },
  modalOptionText: { fontSize: 16, fontWeight: '700', color: '#6B7280' },
  modalOptionTextActive: { color: '#F97316', fontWeight: '900' },
});
