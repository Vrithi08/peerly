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
import { LinearGradient } from 'expo-linear-gradient';
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

// --- Sad Ghost Component ---
const SadGhost = () => {
  const floatAnim = useRef(new Animated.Value(0)).current;
  const tearAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Floating bobbing motion
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    ).start();

    // Tear drop
    Animated.loop(
      Animated.sequence([
        Animated.timing(tearAnim, { toValue: 1, duration: 2000, delay: 500, useNativeDriver: true }),
        Animated.timing(tearAnim, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15]
  });

  const tearY = tearAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 25]
  });

  const tearOpacity = tearAnim.interpolate({
    inputRange: [0, 0.2, 0.8, 1],
    outputRange: [0, 1, 1, 0]
  });

  return (
    <View style={styles.ghostWrapper}>
      <Animated.View style={[styles.ghostBody, { transform: [{ translateY }] }]}>
        <View style={styles.ghostEyes}>
          <View style={styles.ghostEyeBox}>
            <View style={styles.ghostEye} />
            <Animated.View style={[styles.ghostTear, { transform: [{ translateY: tearY }], opacity: tearOpacity }]} />
          </View>
          <View style={styles.ghostEye} />
        </View>
        <View style={styles.ghostMouth} />
        <View style={styles.ghostSkirt}>
          <View style={styles.ghostSkirtWave} />
          <View style={styles.ghostSkirtWave} />
          <View style={styles.ghostSkirtWave} />
        </View>
      </Animated.View>
      <View style={styles.ghostShadow} />
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
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', type: 'info' });

  const showAlert = (title, message, type = 'info') => {
    setAlertConfig({ visible: true, title, message, type });
  };

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
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setIsUploadingImage(true);
      try {
        const asset = result.assets[0];
        const fileName = asset.uri.split('/').pop() || 'profile.jpg';
        const fileType = asset.mimeType || 'image/jpeg';

        const response = await userService.uploadProfileImage(asset.uri);
        const newImageUrl = response.profileImage || response.url || response;
        setUser(prev => ({ ...prev, profileImage: newImageUrl }));
        
        const updatedUser = { ...user, profileImage: newImageUrl };
        await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      } catch (e) {
        console.error(e);
        showAlert('UPLOAD FAILED', 'Your new avatar could not be reach the server. Try again!', 'error');
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
                    const date = new Date(sub.submittedAt.replace(' ', 'T'));
                    if (isNaN(date.getTime())) return 'Recently';
                    const diff = Date.now() - date.getTime();
                    const mins = Math.floor(diff / 60000);
                    if (mins < 1) return 'Just now';
                    if (mins < 60) return `${mins}m ago`;
                    const hrs = Math.floor(mins / 60);
                    if (hrs < 24) return `${hrs}h ago`;
                    const days = Math.floor(hrs / 24);
                    return `${days}d ago`;
                  })()
                : 'Recently';
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
        <View style={styles.donutModalOverlay}>
          <View style={[styles.donutCard, { borderColor: '#9CA3AF' }]}>
            <View style={styles.donutCardInner}>
              <View style={styles.donutIllustrationBox}>
                <SadGhost />
              </View>
              
              <Text style={styles.donutHeadline}>Leaving?</Text>
              <Text style={styles.donutSubtext}>The campus walls will feel empty without your spirit.</Text>

              <View style={styles.donutActionRow}>
                <TouchableOpacity 
                  style={[styles.donutActionBtn, { flex: 1, backgroundColor: '#F97316', borderColor: '#F97316' }]} 
                  onPress={() => setShowLogoutModal(false)}
                >
                  <Text style={[styles.donutActionText, { color: '#FFF' }]}>STAY</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.donutActionBtn, { flex: 1, borderColor: '#9CA3AF' }]} 
                  onPress={onLogout}
                >
                  <Text style={[styles.donutActionText, { color: '#9CA3AF' }]}>LEAVE</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* SYSTEM ALERT (Donut Style) */}
      <Modal visible={alertConfig.visible} transparent animationType="fade">
        <View style={styles.donutModalOverlay}>
          <View style={[styles.donutCard, { borderColor: alertConfig.type === 'error' ? '#EF4444' : '#F97316' }]}>
            <View style={styles.donutCardInner}>
              <View style={styles.donutIllustrationBox}>
                {alertConfig.type === 'error' ? (
                  <XCircle size={60} color="#EF4444" strokeWidth={2} />
                ) : (
                  <Info size={60} color="#F97316" strokeWidth={2} />
                )}
              </View>

              <Text style={styles.donutHeadline}>{alertConfig.title}</Text>
              <Text style={styles.donutSubtext}>{alertConfig.message}</Text>

              <TouchableOpacity 
                style={[styles.donutActionBtn, { borderColor: alertConfig.type === 'error' ? '#EF4444' : '#F97316' }]} 
                onPress={() => setAlertConfig({ ...alertConfig, visible: false })}
              >
                <Text style={[styles.donutActionText, { color: alertConfig.type === 'error' ? '#EF4444' : '#F97316' }]}>
                  ACKNOWLEDGE
                </Text>
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
    marginBottom: 10,
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
    backgroundColor: 'rgba(31, 41, 55, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24
  },
  sadModalContent: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 32,
    overflow: 'hidden',
    elevation: 25,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 }
  },
  premiumModalInner: {
    padding: 32,
    alignItems: 'center'
  },
  sadIconContainer: {
    marginBottom: 24,
    alignItems: 'center',
    position: 'relative',
    height: 180,
    justifyContent: 'center'
  },
  rainCircle: {
    position: 'absolute',
    top: 0,
    opacity: 0.5,
    transform: [{ scale: 2 }]
  },
  sadTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center'
  },
  sadMessage: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
    fontWeight: '500',
    paddingHorizontal: 10
  },
  sadActionBox: {
    width: '100%',
    gap: 12
  },
  stayBtn: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#F97316',
    shadowOpacity: 0.3,
    shadowRadius: 8
  },
  premiumActionGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  
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
  donutIllustrationBox: { height: 110, justifyContent: 'center', marginBottom: 15 },
  donutHeadline: { fontSize: 24, fontWeight: '900', color: '#374151', textAlign: 'center', marginBottom: 6, letterSpacing: -0.5 },
  donutSubtext: { fontSize: 13, color: '#6B7280', textAlign: 'center', marginBottom: 20, fontWeight: '500', lineHeight: 18 },
  donutActionRow: { flexDirection: 'row', gap: 12, width: '100%' },
  donutActionBtn: { height: 48, borderRadius: 12, borderWidth: 2, borderColor: '#F97316', justifyContent: 'center', alignItems: 'center' },
  donutActionText: { color: '#F97316', fontSize: 13, fontWeight: '900', letterSpacing: 0.5 },

  // Ghost Styles
  ghostWrapper: { alignItems: 'center', width: 100, height: 140, justifyContent: 'center' },
  ghostBody: {
    width: 70,
    height: 80,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 35,
    borderTopRightRadius: 35,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
    padding: 15,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    borderWidth: 2,
    borderColor: '#F3F4F6'
  },
  ghostEyes: { flexDirection: 'row', gap: 15, marginTop: 10 },
  ghostEyeBox: { position: 'relative' },
  ghostEye: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#374151' },
  ghostTear: { width: 4, height: 6, backgroundColor: '#60A5FA', borderBottomLeftRadius: 2, borderBottomRightRadius: 2, position: 'absolute', top: 8, left: 2 },
  ghostMouth: { width: 10, height: 6, borderRadius: 5, borderWidth: 2, borderColor: '#374151', marginTop: 12, borderTopWidth: 0 },
  ghostSkirt: { flexDirection: 'row', position: 'absolute', bottom: -10, left: 0, right: 0, justifyContent: 'center' },
  ghostSkirtWave: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFFFFF', marginTop: -10, borderWidth: 2, borderColor: '#F3F4F6' },
  ghostShadow: { width: 50, height: 10, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 5, marginTop: 20 },
});
