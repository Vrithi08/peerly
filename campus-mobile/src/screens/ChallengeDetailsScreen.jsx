import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  TouchableOpacity, 
  Alert, 
  Dimensions, 
  Image, 
  Animated,
  Platform,
  RefreshControl,
  StatusBar,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL, challengeService, submissionService, votingService } from '../services/api';
import { 
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
  Info,
  Calendar,
  Layers,
  Star,
  ChevronDown,
  ChevronUp,
  Brain,
  Palette,
  Target,
  Bot,
  FileText
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

// --- Helper: Safe Date Formatter ---
const formatDate = (dateStr) => {
  if (!dateStr) return 'TBD';
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? 'TBD' : d.toLocaleDateString();
};

// --- Helper: Category Cover Images ---
const getCategoryCover = (category) => {
  const cat = category?.toUpperCase();
  if (cat?.includes('PHOTO')) return 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&q=80';
  if (cat?.includes('CODING')) return 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80';
  if (cat?.includes('DESIGN')) return 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80';
  if (cat?.includes('WRITING')) return 'https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=800&q=80';
  if (cat?.includes('MUSIC')) return 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&q=80';
  return 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80';
};

const getPreviewUrl = (sub) => {
  if (!sub) return null;
  const url = sub.contentUrl || sub.secure_url || sub.url || sub.imageUrl || sub.attachmentUri || sub.fileUrl || sub.mediaUrl || sub.file_url || sub.attachment?.url || sub.files?.[0]?.url;
  if (!url) return null;
  if (url.startsWith('http') || url.startsWith('file')) return url;
  const base = API_BASE_URL.replace('/api', '');
  return `${base}${url.startsWith('/') ? '' : '/'}${url}`;
};

const ChallengeDetailsScreen = ({ route, navigation }) => {
  const { challengeId } = route.params;
  
  const [challenge, setChallenge] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [votingId, setVotingId] = useState(null);
  const [countdown, setCountdown] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  useEffect(() => { 
    fetchData(); 
    checkBookmarkStatus();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  const checkBookmarkStatus = async () => {
    try {
      const saved = await AsyncStorage.getItem('bookmarks');
      if (saved) {
        const ids = JSON.parse(saved);
        setIsBookmarked(ids.includes(challengeId));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleBookmark = async () => {
    try {
      const saved = await AsyncStorage.getItem('bookmarks');
      let ids = saved ? JSON.parse(saved) : [];
      if (isBookmarked) {
        ids = ids.filter(id => id !== challengeId);
      } else {
        ids.push(challengeId);
      }
      await AsyncStorage.setItem('bookmarks', JSON.stringify(ids));
      setIsBookmarked(!isBookmarked);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchData = async () => {
    try {
      const [challengeData, subsData] = await Promise.all([
        challengeService.getById(challengeId),
        submissionService.getByChallengeId(challengeId),
      ]);
      setChallenge(challengeData);
      const sortedSubs = subsData.sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));
      setSubmissions(sortedSubs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
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

  const onRefresh = () => { setRefreshing(true); fetchData(); };

  const handleVote = async (submissionId) => {
    setVotingId(submissionId);
    try {
      await votingService.castVote(submissionId);
      setSubmissions(prev => {
        const updated = prev.map(s => s.id === submissionId ? { ...s, voteCount: (s.voteCount || 0) + 1 } : s);
        return updated.sort((a, b) => (b.voteCount || 0) - (a.voteCount || 0));
      });
    } catch (error) {
      Alert.alert('Peerly', 'Voting is limited to one vote per challenge.');
    } finally {
      setVotingId(null);
    }
  };

  if (loading || !challenge) return (
    <View style={[styles.center, { backgroundColor: '#FFF7ED' }]}><ActivityIndicator color="#F97316" /></View>
  );

  const phase = challenge.status; 
  const top3 = submissions.slice(0, 3);
  const totalVotes = submissions.reduce((sum, s) => sum + (s.voteCount || 0), 0);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.navHeader}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
            <ArrowLeft size={22} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.navTitle}>Challenge Details</Text>
          <TouchableOpacity style={styles.iconBtn} onPress={toggleBookmark}>
            <Bookmark 
              size={20} 
              color={isBookmarked ? "#F97316" : "#1F2937"} 
              fill={isBookmarked ? "#F97316" : "none"} 
            />
          </TouchableOpacity>
        </View>

        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F97316" />}
        >
          <View style={styles.bannerCard}>
            <View style={styles.illustrationBox}>
              <Image 
                source={{ uri: getCategoryCover(challenge.category) }} 
                style={styles.bannerImage}
                resizeMode="cover"
              />
              <View style={styles.bannerOverlay} />
            </View>

            <View style={styles.headerInfo}>
              <Text style={styles.challengeTitle}>{challenge.title}</Text>
              <View style={styles.ratingRow}>
                <View style={styles.starGroup}>
                  <Star size={14} color="#F59E0B" fill="#F59E0B" />
                  <Text style={styles.ratingVal}>4.8</Text>
                </View>
                <Text style={styles.participationText}>{submissions.length * 12} participants</Text>
              </View>

              <View style={styles.creatorRow}>
                <View style={styles.creatorAvatar}><Users size={14} color="#FFFFFF" /></View>
                <Text style={styles.creatorName}>{challenge.creatorName || challenge.createdBy || challenge.userName || 'Student Peer'}</Text>
                <View style={styles.statusTag}>
                  <View style={[styles.statusDot, { backgroundColor: phase === 'OPEN' ? '#10B981' : '#F43F5E' }]} />
                  <Text style={styles.statusText}>{phase}</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About <Text style={styles.titleUnderline}>This Challenge</Text></Text>
            <Text style={styles.aboutText}>{challenge.description}</Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{submissions.length * 8}+</Text>
              <Text style={styles.statLabel}>Participants</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{totalVotes}</Text>
              <Text style={styles.statLabel}>Total Votes</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{submissions.length}</Text>
              <Text style={styles.statLabel}>Submissions</Text>
            </View>
          </View>

          {submissions.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Hall of <Text style={styles.titleUnderline}>Fame</Text></Text>
              <View style={styles.leaderboardBox}>
                {top3.map((sub, idx) => (
                  <View key={sub.id} style={styles.leaderRow}>
                    <View style={styles.leaderAvatarBox}>
                      <View style={styles.leaderAvatarCircle}>
                        <Users size={16} color="#F97316" />
                      </View>
                      <View style={styles.medalBadge}>
                        <Text style={styles.medalIcon}>{idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'}</Text>
                      </View>
                    </View>
                    <View style={styles.leaderMeta}>
                      <Text style={styles.leaderName}>{sub.userName || sub.createdBy || 'Peer'}</Text>
                      <Text style={styles.leaderPoints}>{sub.voteCount} XP EARNED</Text>
                    </View>
                    <ArrowUpRight size={18} color="#FED7AA" />
                  </View>
                ))}
              </View>
            </View>
          )}

          <View style={[styles.section, { marginBottom: 40 }]}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Recent <Text style={styles.titleUnderline}>Submissions</Text></Text>
              <Text style={styles.timerVal}>{countdown}</Text>
            </View>
            <View style={styles.submissionGrid}>
              {submissions.map((sub) => (
                <TouchableOpacity 
                  key={sub.id} 
                  style={styles.submissionCard}
                  onPress={() => setSelectedSubmission(sub)}
                >
                  <View style={styles.subPreviewBox}>
                    {getPreviewUrl(sub) ? (
                      <Image source={{ uri: getPreviewUrl(sub) }} style={styles.subImage} />
                    ) : (
                      <View style={styles.subTextPlaceholder}>
                        <FileText size={20} color="#FED7AA" style={{ marginBottom: 8 }} />
                        <Text style={styles.subTextSnippet} numberOfLines={4}>{sub.textContent || sub.content || 'Text Submission'}</Text>
                      </View>
                    )}
                    {(sub.voteCount || 0) > 5 && (
                      <View style={styles.trendingBadge}>
                        <Flame size={10} color="#FFF" fill="#FFF" />
                        <Text style={styles.trendingText}>TRENDING</Text>
                      </View>
                    )}
                  </View>
                  <View style={styles.subCardFooter}>
                    <View style={styles.subUserRow}>
                      <View style={styles.subUserAvatar}><Users size={10} color="#F97316" /></View>
                      <Text style={styles.subUserName} numberOfLines={1}>{sub.userName || sub.createdBy || 'Peer'}</Text>
                    </View>
                    <View style={styles.voteControls}>
                      <View style={styles.voteCountBox}>
                        <Text style={styles.voteCountVal}>{sub.voteCount || 0}</Text>
                        <Text style={styles.voteLabel}>votes</Text>
                      </View>
                      <TouchableOpacity 
                        style={[styles.voteBtnSmall, phase !== 'VOTING' && styles.voteBtnDisabled]}
                        disabled={phase !== 'VOTING' || votingId === sub.id}
                        onPress={() => handleVote(sub.id)}
                      >
                        {votingId === sub.id ? <ActivityIndicator size="small" color="#ffffff" /> : <Flame size={14} color="#ffffff" />}
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>

      <View style={styles.bottomCtaContainer}>
        {phase === 'OPEN' ? (
          <TouchableOpacity 
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('Submission', { challengeId, challengeTitle: challenge.title })}
          >
            <Text style={styles.primaryBtnText}>Submit Your Entry</Text>
          </TouchableOpacity>
        ) : phase === 'VOTING' ? (
          <View style={styles.votingIndicator}>
            <Text style={styles.votingIndicatorText}>Voting is Live! Cast your votes below</Text>
          </View>
        ) : (
          <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: '#E5E7EB' }]} disabled>
            <Text style={[styles.primaryBtnText, { color: '#9CA3AF' }]}>Challenge Ended</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Submission Viewer Modal */}
      <Modal
        visible={!!selectedSubmission}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSelectedSubmission(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.viewerContent}>
            <View style={styles.viewerHeader}>
              <View style={styles.viewerUserRow}>
                <View style={styles.subUserAvatar}><Users size={14} color="#F97316" /></View>
                <Text style={styles.viewerUserName}>{selectedSubmission?.userName || 'Peer Creator'}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedSubmission(null)} style={styles.closeModalBtn}>
                <ArrowLeft size={24} color="#1F2937" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.viewerScroll}>
              {(selectedSubmission?.contentType === 'TEXT' || selectedSubmission?.type?.toLowerCase() === 'text') ? (
                <View style={styles.viewerTextContainer}>
                  <Text style={styles.viewerText}>{selectedSubmission?.textContent || selectedSubmission?.content}</Text>
                </View>
              ) : getPreviewUrl(selectedSubmission) ? (
                <Image 
                  source={{ uri: getPreviewUrl(selectedSubmission) }} 
                  style={styles.viewerImage} 
                  resizeMode="contain"
                />
              ) : (
                <View style={styles.viewerTextContainer}>
                  <Text style={styles.viewerText}>{selectedSubmission?.textContent || selectedSubmission?.content || selectedSubmission?.description || 'No content preview available'}</Text>
                </View>
              )}
              
              <View style={styles.viewerFooter}>
                <View style={styles.viewerStats}>
                  <Flame size={24} color="#F97316" fill="#F97316" />
                  <View>
                    <Text style={styles.viewerVoteCount}>{selectedSubmission?.voteCount || 0} Votes</Text>
                    <Text style={styles.viewerVoteLabel}>Current Standing</Text>
                  </View>
                </View>

                {phase === 'VOTING' && (
                  <TouchableOpacity 
                    style={styles.modalVoteBtn}
                    onPress={() => {
                      handleVote(selectedSubmission.id);
                      setSelectedSubmission(null);
                    }}
                  >
                    <Text style={styles.modalVoteBtnText}>Cast Your Vote</Text>
                  </TouchableOpacity>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default ChallengeDetailsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF7ED' },
  safeArea: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  navHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, height: 60, marginBottom: 8 },
  navTitle: { fontSize: 16, fontWeight: '800', color: '#1F2937' },
  iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#FED7AA', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  scrollContent: { paddingBottom: 20 },
  bannerCard: { marginHorizontal: 24, marginBottom: 32 },
  illustrationBox: { height: 240, backgroundColor: '#FFF1E6', borderRadius: 32, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderWidth: 1.5, borderColor: '#FED7AA' },
  bannerImage: { width: '100%', height: '100%' },
  bannerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255, 247, 237, 0.2)' },
  floatingBadges: { position: 'absolute', top: 40, right: 40 },
  floatBadge: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', elevation: 5, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, borderWidth: 1, borderColor: '#FED7AA' },
  headerInfo: { marginTop: 24 },
  challengeTitle: { fontSize: 36, fontWeight: '900', color: '#1F2937', letterSpacing: -1, lineHeight: 40 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 },
  starGroup: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ratingVal: { fontSize: 13, fontWeight: '800', color: '#1F2937' },
  participationText: { fontSize: 13, color: '#6B7280', fontWeight: '700' },
  creatorRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 20 },
  creatorAvatar: { width: 32, height: 32, borderRadius: 12, backgroundColor: '#F97316', justifyContent: 'center', alignItems: 'center' },
  creatorName: { fontSize: 14, fontWeight: '800', color: '#1F2937', flex: 1 },
  statusTag: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFF1E6', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, borderWidth: 1, borderColor: '#FED7AA' },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 10, fontWeight: '900', color: '#1F2937' },
  section: { paddingHorizontal: 24, marginBottom: 32 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  sectionTitle: { fontSize: 22, fontWeight: '900', color: '#1F2937', letterSpacing: -0.5, marginBottom: 16 },
  titleUnderline: { textDecorationLine: 'underline', textDecorationColor: '#FED7AA' },
  aboutText: { fontSize: 15, color: '#6B7280', lineHeight: 24, fontWeight: '500' },
  statsContainer: { flexDirection: 'row', marginHorizontal: 24, paddingVertical: 24, borderTopWidth: 1.5, borderBottomWidth: 1.5, borderColor: '#E5E7EB', justifyContent: 'space-between', marginBottom: 32 },
  statBox: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 18, fontWeight: '900', color: '#1F2937' },
  statLabel: { fontSize: 11, fontWeight: '700', color: '#6B7280', marginTop: 4 },
  statDivider: { width: 1.5, height: '60%', backgroundColor: '#E5E7EB', alignSelf: 'center' },
  leaderboardBox: { backgroundColor: '#FFFFFF', borderRadius: 28, padding: 20, borderWidth: 1.5, borderColor: '#FED7AA', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  leaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  leaderAvatarBox: { width: 50, height: 50, marginRight: 16 },
  leaderAvatarCircle: { width: 50, height: 50, borderRadius: 20, backgroundColor: '#FFF1E6', justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#FED7AA' },
  medalBadge: { position: 'absolute', bottom: -4, right: -4, width: 24, height: 24, borderRadius: 12, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, borderWidth: 1, borderColor: '#FED7AA' },
  medalIcon: { fontSize: 12 },
  leaderMeta: { flex: 1 },
  leaderName: { fontSize: 15, fontWeight: '900', color: '#1F2937' },
  leaderPoints: { fontSize: 10, fontWeight: '900', color: '#6B7280', letterSpacing: 1, marginTop: 4 },
  submissionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  submissionCard: { width: (width - 48 - 12) / 2, backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 1.5, borderColor: '#FED7AA', overflow: 'hidden', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  subPreviewBox: { height: 130, backgroundColor: '#FFF1E6', justifyContent: 'center', alignItems: 'center' },
  subImage: { width: '100%', height: '100%' },
  subTextPlaceholder: { padding: 12 },
  subTextSnippet: { fontSize: 11, color: '#6B7280', fontWeight: '600' },
  subCardFooter: { padding: 12, gap: 12 },
  subUserRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  subUserAvatar: { width: 18, height: 18, borderRadius: 6, backgroundColor: '#FFF1E6', justifyContent: 'center', alignItems: 'center' },
  subUserName: { fontSize: 11, fontWeight: '800', color: '#1F2937', flex: 1 },
  voteControls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  voteCountBox: { flexDirection: 'row', alignItems: 'baseline', gap: 2 },
  voteCountVal: { fontSize: 14, fontWeight: '900', color: '#1F2937' },
  voteLabel: { fontSize: 9, fontWeight: '700', color: '#9CA3AF' },
  voteBtnSmall: { width: 32, height: 32, backgroundColor: '#F97316', borderRadius: 10, justifyContent: 'center', alignItems: 'center', elevation: 2 },
  voteBtnDisabled: { opacity: 0.3, backgroundColor: '#FED7AA' },
  trendingBadge: { position: 'absolute', top: 8, right: 8, backgroundColor: '#F43F5E', flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6 },
  trendingText: { fontSize: 8, fontWeight: '900', color: '#FFF' },
  timerVal: { fontSize: 13, fontWeight: '900', color: '#F97316' },
  bottomCtaContainer: { position: 'absolute', bottom: 120, left: 24, right: 24 },
  primaryBtn: { height: 64, backgroundColor: '#F97316', borderRadius: 24, justifyContent: 'center', alignItems: 'center', shadowColor: '#F97316', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10 },
  primaryBtnText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
  votingIndicator: { height: 64, backgroundColor: '#FFFBEB', borderRadius: 24, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#FDE68A' },
  votingIndicatorText: { fontSize: 14, fontWeight: '900', color: '#F59E0B' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' },
  viewerContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 32, borderTopRightRadius: 32, height: '90%', width: '100%' },
  viewerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  viewerUserRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  viewerUserName: { fontSize: 18, fontWeight: '900', color: '#1F2937' },
  closeModalBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  viewerScroll: { padding: 24 },
  viewerImage: { width: width - 48, height: 450, borderRadius: 24, marginBottom: 24 },
  viewerTextContainer: { padding: 24, backgroundColor: '#FFF7ED', borderRadius: 24, borderWidth: 1, borderColor: '#FED7AA', marginBottom: 24 },
  viewerText: { fontSize: 16, color: '#1F2937', lineHeight: 26, fontWeight: '500' },
  viewerFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingBottom: 40 },
  viewerStats: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  viewerVoteCount: { fontSize: 20, fontWeight: '900', color: '#1F2937' },
  viewerVoteLabel: { fontSize: 12, fontWeight: '700', color: '#9CA3AF' },
  modalVoteBtn: { backgroundColor: '#F97316', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 16, elevation: 4 },
  modalVoteBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
});
