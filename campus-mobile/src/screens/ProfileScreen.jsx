import React, { useEffect, useState, useRef, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert, 
  Dimensions,
  Animated,
  Platform,
  Modal,
  TextInput,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { challengeService, userService, helpService } from '../services/api';
import { 
  Settings, 
  Camera,
  LogOut, 
  Award, 
  Zap, 
  ChevronRight, 
  Target, 
  History, 
  Users,
  Compass,
  Sparkles,
  Bot,
  Rocket,
  Flame,
  ArrowRight,
  Bookmark,
  Clock,
  ArrowLeft as BackIcon,
  X,
  Code as CodeIcon,
  Users as UsersIcon,
  Frown,
  CloudRain
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

const ALL_ACHIEVEMENTS = [
  { icon: Sparkles, label: 'Newbie', threshold: 0, color: '#9CA3AF' },
  { icon: Flame, label: 'Hot Streak', threshold: 500, color: '#F97316' },
  { icon: Target, label: 'Bullseye', threshold: 1500, color: '#EF4444' },
  { icon: Rocket, label: 'Fast Mover', threshold: 3000, color: '#3B82F6' },
  { icon: Users, label: 'Social Star', threshold: 5000, color: '#A855F7' },
  { icon: Zap, label: 'Elite Pro', threshold: 8000, color: '#EAB308' },
  { icon: Award, label: 'Scholar', threshold: 12000, color: '#10B981' },
];

// --- Staggered Reveal Component ---
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

// --- Avatar Illustration Component ---
const DynamicAvatar = ({ icon: Icon, color, size = 100 }) => {
  return (
    <View style={[styles.avatarCircle, { width: size, height: size, borderRadius: size / 2 }]}>
      <Icon size={size * 0.5} color={color} strokeWidth={1.5} />
    </View>
  );
};

export default function ProfileScreen({ navigation, onLogout }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookmarkedChallenges, setBookmarkedChallenges] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useEffect(() => {
    loadUserData();
    loadBookmarks();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadBookmarks();
    }, [])
  );

  const loadBookmarks = async () => {
    try {
      // Load Arena Bookmarks
      const savedChallenges = await AsyncStorage.getItem('bookmarks');
      if (savedChallenges) {
        const ids = JSON.parse(savedChallenges);
        const all = await challengeService.getAll();
        setBookmarkedChallenges(all.filter(c => ids.includes(c.id)));
      }

      // Load Student Sync Bookmarks
      const savedPostIdsStr = await AsyncStorage.getItem('bookmarked_posts');
      if (savedPostIdsStr) {
        const ids = JSON.parse(savedPostIdsStr);
        const allPosts = await helpService.getAllPosts();
        setSavedPosts(allPosts.filter(p => ids.includes(p.id)));
      } else {
        setSavedPosts([]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadUserData = async () => {
    try {
      const profile = await userService.getProfile();
      setUser(profile);
      // Optional: Update AsyncStorage with fresh data
      await AsyncStorage.setItem('user', JSON.stringify(profile));
    } catch (e) {
      console.error(e);
      // Fallback to local storage if offline
      const userData = await AsyncStorage.getItem('user');
      if (userData) setUser(JSON.parse(userData));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const handlePickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setIsUploadingImage(true);
      try {
        const response = await userService.uploadProfileImage(result.assets[0].uri);
        const newImageUrl = response.profileImage || response.url || response;
        setUser(prev => ({ ...prev, profileImage: newImageUrl }));
        
        const updatedUser = { ...user, profileImage: newImageUrl };
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      } catch (e) {
        console.error(e);
        Alert.alert("Error", "Failed to upload profile image.");
      } finally {
        setIsUploadingImage(false);
      }
    }
  };

  if (loading) return (
    <View style={styles.center}><ActivityIndicator color="#F97316" /></View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Top Header Actions */}
        <View style={styles.topActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.goBack()}>
            <BackIcon size={22} color="#1F2937" />
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity style={[styles.actionBtn, styles.logoutBtn]} onPress={handleLogout}>
              <LogOut size={22} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Profile Identity */}
        <View style={styles.profileHero}>
          <TouchableOpacity onPress={handlePickImage} disabled={isUploadingImage}>
            {user?.profileImage ? (
              <Image source={{ uri: user.profileImage }} style={styles.uploadedAvatar} />
            ) : (
              <DynamicAvatar icon={Bot} size={110} color="#F97316" />
            )}
            <View style={styles.editAvatarBadge}>
              {isUploadingImage ? <ActivityIndicator size={12} color="#fff" /> : <Camera size={14} color="#FFF" />}
            </View>
          </TouchableOpacity>
          <SlideUpView delay={200} style={styles.identityBox}>
            <Text style={styles.userName}>{user?.name || 'Peer Conqueror'}</Text>
          </SlideUpView>
        </View>

        {/* Key Stats Grid */}
        <SlideUpView delay={400} style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={styles.statIconBox}>
              <Rocket size={18} color="#F97316" />
            </View>
            <Text style={styles.statValue}>{user?.totalSubmissions || 0}</Text>
            <Text style={styles.statLabel}>Submissions</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconBox}>
              <Target size={18} color="#F97316" />
            </View>
            <Text style={styles.statValue}>{user?.acceptedReplies || 0}</Text>
            <Text style={styles.statLabel}>Help Solutions</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconBox}>
              <Award size={18} color="#F97316" />
            </View>
            <Text style={styles.statValue}>#{user?.rank || '--'}</Text>
            <Text style={styles.statLabel}>Campus Rank</Text>
          </View>
          <View style={styles.statCard}>
            <View style={styles.statIconBox}>
              <Zap size={18} color="#F97316" />
            </View>
            <Text style={styles.statValue}>{user?.totalPoints?.toLocaleString() || 0}</Text>
            <Text style={styles.statLabel}>Total XP</Text>
          </View>
        </SlideUpView>

        {/* Achievements Section */}
        <SlideUpView delay={600} style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Achievements</Text>
              <Text style={styles.sectionSubtitle}>Unlock more by helping peers & winning challenges</Text>
            </View>
            <Sparkles size={18} color="rgba(249, 115, 22, 0.4)" />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.achievementScroll}>
            {ALL_ACHIEVEMENTS.map((item, idx) => {
              const isUnlocked = (user?.totalPoints || 0) >= item.threshold;
              return (
                <View key={idx} style={[styles.achievementBadge, !isUnlocked && { opacity: 0.5 }]}>
                  <View style={[
                    styles.badgeCircle, 
                    isUnlocked ? { borderColor: item.color, backgroundColor: '#FFFFFF' } : { borderColor: '#E5E7EB', backgroundColor: '#F9FAFB' }
                  ]}>
                    <item.icon 
                      size={24} 
                      color={isUnlocked ? item.color : '#9CA3AF'} 
                      strokeWidth={isUnlocked ? 2.5 : 1.5}
                    />
                    {!isUnlocked && (
                      <View style={styles.lockOverlay}>
                        <Clock size={10} color="#9CA3AF" />
                      </View>
                    )}
                  </View>
                  <Text style={[styles.badgeLabel, isUnlocked ? { color: '#1F2937' } : { color: '#9CA3AF' }]}>
                    {item.label}
                  </Text>
                  {!isUnlocked && (
                    <Text style={styles.lockText}>{item.threshold} XP</Text>
                  )}
                </View>
              );
            })}
          </ScrollView>
        </SlideUpView>

        {/* Bookmarked Challenges */}
        {bookmarkedChallenges.length > 0 && (
          <SlideUpView delay={700} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Saved Challenges</Text>
              <Award size={18} color="#F97316" />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.submissionScroll}>
              {bookmarkedChallenges.map((item, idx) => (
                <TouchableOpacity 
                  key={idx} 
                  style={styles.submissionCard}
                  onPress={() => navigation.navigate('ChallengeDetails', { challengeId: item.id })}
                >
                  <View style={[styles.cardStatus, { backgroundColor: '#FFF7ED' }]}>
                    <Text style={styles.statusText}>{item.category}</Text>
                  </View>
                  <Text style={styles.cardTitle} numberOfLines={2}>{item.title}</Text>
                  <View style={styles.cardFooter}>
                    <Clock size={12} color="#9CA3AF" />
                    <Text style={styles.cardDate}>In Arena</Text>
                    <ArrowRight size={14} color="#9CA3AF" />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </SlideUpView>
        )}

        {/* Saved Student Sync Discussions */}
        {savedPosts.length > 0 && (
          <SlideUpView delay={800} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Saved Discussions</Text>
              <Bookmark size={18} color="#F97316" fill="#F97316" />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.submissionScroll}>
              {savedPosts.map((item, idx) => (
                <TouchableOpacity 
                  key={idx} 
                  style={styles.submissionCard}
                  onPress={() => navigation.navigate('HelpPostDetails', { postId: item.id })}
                >
                  <View style={[styles.cardStatus, { backgroundColor: '#F0FDF4' }]}>
                    <Text style={[styles.statusText, { color: '#10B981' }]}>{item.subject}</Text>
                  </View>
                  <Text style={styles.cardTitle} numberOfLines={2}>{item.topic}</Text>
                  <View style={styles.cardFooter}>
                    <Users size={12} color="#9CA3AF" />
                    <Text style={styles.cardDate}>{item.replies?.length || 0} Replies</Text>
                    <ArrowRight size={14} color="#9CA3AF" />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </SlideUpView>
        )}

        {/* My Submissions */}
        {(user?.recentSubmissions?.length > 0) && (
        <SlideUpView delay={900} style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Submissions</Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.submissionScroll}>
            {user.recentSubmissions.map((sub, idx) => {
              const timeAgo = sub.submittedAt
                ? (() => {
                    const diff = Date.now() - new Date(sub.submittedAt).getTime();
                    const mins = Math.floor(diff / 60000);
                    if (mins < 60) return `${mins}m ago`;
                    const hrs = Math.floor(mins / 60);
                    if (hrs < 24) return `${hrs}h ago`;
                    const days = Math.floor(hrs / 24);
                    return `${days}d ago`;
                  })()
                : '';
              return (
                <TouchableOpacity
                  key={sub.id || idx}
                  style={styles.submissionCard}
                  onPress={() => navigation.navigate('ChallengeDetails', { challengeId: sub.challengeId })}
                >
                  <View style={styles.cardStatus}>
                    <Text style={styles.statusText}>{sub.contentType || 'Submission'}</Text>
                  </View>
                  <Text style={styles.cardTitle} numberOfLines={2}>{sub.challengeTitle}</Text>
                  <View style={styles.cardFooter}>
                    <Text style={styles.cardDate}>{timeAgo}</Text>
                    <Text style={[styles.cardDate, { color: '#F97316' }]}>{sub.voteCount} votes</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </SlideUpView>
        )}

      </ScrollView>

      {/* Sad Logout Modal */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.sadModalOverlay}>
          <View style={styles.sadModalContent}>
            <View style={styles.sadIconContainer}>
              <View style={styles.rainCircle}>
                <CloudRain size={32} color="#F97316" />
              </View>
              <Frown size={50} color="#6B7280" style={styles.sadFace} />
            </View>
            
            <Text style={styles.sadTitle}>Leaving already?</Text>
            <Text style={styles.sadMessage}>
              The campus will feel a little quieter without you. Are you sure you want to go? 
            </Text>

            <View style={styles.sadActionBox}>
              <TouchableOpacity 
                style={styles.stayBtn} 
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.stayBtnText}>Wait, I'll stay!</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.sadLogoutBtn} 
                onPress={onLogout}
              >
                <Text style={styles.sadLogoutText}>Logout</Text>
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
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: {},
  
  topActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 10,
    marginBottom: 20,
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FED7AA',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5
  },
  logoutBtn: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    elevation: 0,
    shadowOpacity: 0
  },

  profileHero: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarCircle: {
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    elevation: 10,
    shadowColor: '#F97316',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 }
  },
  uploadedAvatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 1.5,
    borderColor: '#FED7AA'
  },
  editAvatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#F97316',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF7ED',
    elevation: 4
  },
  identityBox: {
    alignItems: 'center',
    marginTop: 20,
  },
  userName: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1F2937',
    letterSpacing: -0.5,
  },
  userTagline: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
    marginTop: 4,
  },

  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 40,
  },
  statCard: {
    width: (width - 32 - 12) / 2,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10
  },
  statIconBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#FFF1E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#6B7280',
    marginTop: 2,
    textTransform: 'uppercase',
  },

  section: {
    marginBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1F2937',
    letterSpacing: -0.5,
  },
  seeAll: {
    fontSize: 13,
    fontWeight: '700',
    color: '#F97316',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    height: '80%'
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1F2937'
  },
  label: {
    fontSize: 14,
    fontWeight: '800',
    color: '#4B5563',
    marginBottom: 8,
    marginTop: 16
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 54,
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  textArea: {
    height: 100,
    paddingTop: 16,
    textAlignVertical: 'top'
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 54,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12
  },
  flexInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937'
  },
  saveBtn: {
    backgroundColor: '#F97316',
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    marginBottom: 40,
    shadowColor: '#F97316',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800'
  },

  achievementScroll: {
    paddingHorizontal: 24,
    gap: 16,
  },
  achievementBadge: {
    alignItems: 'center',
    gap: 8,
  },
  badgeCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FED7AA',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5
  },
  badgeLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6B7280',
    marginTop: 4
  },
  lockOverlay: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 3,
    borderWidth: 1,
    borderColor: '#E5E7EB'
  },
  lockText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#9CA3AF',
    marginTop: 2
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
    marginTop: 2
  },

  submissionScroll: {
    paddingHorizontal: 24,
    gap: 16,
  },
  submissionCard: {
    width: width * 0.45,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#FED7AA',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5
  },
  cardStatus: {
    backgroundColor: '#FFF1E6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#F97316',
    textTransform: 'uppercase',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 16,
    height: 40,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardDate: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
  },

  // Sad Modal Styles
  sadModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  sadModalContent: {
    width: '85%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 60,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 60,
    borderBottomLeftRadius: 10,
    padding: 30,
    alignItems: 'center',
    elevation: 25,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    borderWidth: 1,
    borderColor: '#FFF7ED'
  },
  sadIconContainer: {
    marginBottom: 16,
    alignItems: 'center'
  },
  rainCircle: {
    position: 'absolute',
    top: -5,
    right: -15,
    opacity: 0.2
  },
  sadFace: {
    opacity: 0.9
  },
  sadTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#1F2937',
    marginBottom: 8
  },
  sadMessage: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 10
  },
  sadActionBox: {
    width: '100%',
    gap: 8
  },
  stayBtn: {
    width: '100%',
    backgroundColor: '#F97316',
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#F97316',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3
  },
  stayBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800'
  },
  sadLogoutBtn: {
    width: '100%',
    height: 44,
    justifyContent: 'center',
    alignItems: 'center'
  },
  sadLogoutText: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '700'
  }
});
