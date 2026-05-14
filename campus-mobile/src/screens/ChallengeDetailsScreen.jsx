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
import { LinearGradient } from 'expo-linear-gradient';
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
  FileText,
  X
} from 'lucide-react-native';
import ThemedAlert from '../components/ThemedAlert';

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
  const [showVoteSuccess, setShowVoteSuccess] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ visible: false, title: '', message: '', type: 'info' });

  const showAlert = (title, message, type = 'info') => {
    setAlertConfig({ visible: true, title, message, type });
  };

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
    const deadlineStr = challenge.status === 'OPEN' ? challenge.submissionDeadline : challenge.votingDeadline;
    if (!deadlineStr) {
      setCountdown('--');
      return;
    }
    const end = new Date(deadlineStr.replace(' ', 'T')).getTime();
    if (isNaN(end)) {
      setCountdown('--');
      return;
    }
    
    const diff = end - now;
    if (diff <= 0) { 
      setCountdown(challenge.status === 'OPEN' ? 'CLOSED' : 'VOTING ENDED'); 
      return; 
    }
    
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);
    
    if (d > 0) {
      setCountdown(`${d}d ${h}h`);
    } else {
      setCountdown(`${h}h ${m}m ${s}s`);
    }
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
      setShowVoteSuccess(true);
    } catch (error) {
      showAlert('VOTE LIMITED', 'Your voice has already been heard in this arena! You can only vote once per challenge.', 'warning');
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
                source={{ uri: challenge.imageUrl || getCategoryCover(challenge.category) }} 
                style={styles.bannerImage}
                resizeMode="cover"
              />
              <View style={styles.bannerOverlay} />
            </View>

            <View style={styles.headerInfo}>
              <View style={styles.headerBadgeRow}>
                <View style={styles.statusTag}>
                  <View style={[styles.statusDot, { backgroundColor: phase === 'OPEN' ? '#10B981' : '#F43F5E' }]} />
                  <Text style={styles.statusText}>{phase}</Text>
                </View>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{challenge.category}</Text>
                </View>
              </View>
              <Text style={styles.challengeTitle}>{challenge.title}</Text>
              
              <View style={styles.creatorRow}>
                <View style={styles.creatorAvatar}><Users size={14} color="#FFFFFF" /></View>
                <Text style={styles.creatorName}>Hosted by <Text style={styles.boldText}>{challenge.creatorName || challenge.createdBy || challenge.userName || 'Student Peer'}</Text></Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About <Text style={styles.titleUnderline}>This Challenge</Text></Text>
            <Text style={styles.aboutText}>{challenge.description}</Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{totalVotes}</Text>
              <Text style={styles.statLabel}>VOTES</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{submissions.length}</Text>
              <Text style={styles.statLabel}>ENTRIES</Text>
            </View>
          </View>

          {challenge && challenge.topPerformerName && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Arena <Text style={styles.titleUnderline}>Champion</Text></Text>
              <View style={styles.championCard}>
                <View style={styles.championAvatarBox}>
                  <View style={[styles.championAvatar, { borderColor: '#F59E0B' }]}>
                    <Users size={32} color="#F59E0B" />
                    <View style={styles.crownContainer}>
                      <Award size={24} color="#F59E0B" fill="#F59E0B" fillOpacity={0.2} />
                    </View>
                  </View>
                  <View style={styles.championRankBadge}>
                    <Sparkles size={14} color="#FFF" fill="#FFF" />
                    <Text style={styles.championRankText}>RANK #1</Text>
                  </View>
                </View>
                <View style={styles.championMeta}>
                  <Text style={styles.championName}>{challenge.topPerformerName}</Text>
                  <Text style={styles.championVotes}>{challenge.topPerformerVotes} COMMUNITY VOTES</Text>
                  <View style={styles.championStatus}>
                    <Zap size={12} color="#F59E0B" fill="#F59E0B" />
                    <Text style={styles.championStatusText}>Official Winner</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          <View style={[styles.section, { marginBottom: 10 }]}>
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
        </ScrollView>
      </SafeAreaView>

      <View style={styles.bottomCtaContainer}>
        {phase === 'OPEN' ? (
          <TouchableOpacity 
            style={styles.primaryBtn}
            onPress={() => navigation.navigate('Submission', { challengeId, challengeTitle: challenge.title })}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={['#F97316', '#EA580C']}
              style={styles.primaryGradient}
            >
              <Text style={styles.primaryBtnText}>CONQUER ARENA</Text>
              <ArrowUpRight size={20} color="#FFF" />
            </LinearGradient>
          </TouchableOpacity>
        ) : phase === 'VOTING' ? (
          <View style={styles.votingIndicator}>
            <Zap size={18} color="#F59E0B" fill="#F59E0B" />
            <Text style={styles.votingIndicatorText}>Voting is Live! Cast your votes below</Text>
          </View>
        ) : (
          <View style={[styles.primaryBtn, { backgroundColor: '#374151' }]}>
            <Text style={[styles.primaryBtnText, { color: '#D1D5DB' }]}>Arena Closed</Text>
          </View>
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

      {/* VOTE SUCCESS MODAL */}
      <Modal visible={showVoteSuccess} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successCard}>
            <LinearGradient colors={['#FFF7ED', '#FFFFFF']} style={styles.successCardInner}>
              <View style={styles.iconCircle}>
                <Zap size={40} color="#F59E0B" fill="#F59E0B" />
              </View>
              <Text style={styles.modalTitle}>VOTE RECORDED!</Text>
              <Text style={styles.modalSubtitle}>
                Your support has been etched into the arena. Every vote brings a peer closer to glory.
              </Text>
              <TouchableOpacity style={styles.modalActionBtn} onPress={() => setShowVoteSuccess(false)}>
                <LinearGradient colors={['#F97316', '#EA580C']} style={styles.modalActionGradient}>
                  <Text style={styles.modalActionText}>Back to Arena</Text>
                </LinearGradient>
              </TouchableOpacity>
            </LinearGradient>
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
    </View>
  );
};

export default ChallengeDetailsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF7ED' },
  safeArea: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  navHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, height: 60, marginBottom: 8 },
  navTitle: { fontSize: 16, fontWeight: '800', color: '#1F2937' },
  iconBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#FED7AA', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  scrollContent: { paddingBottom: 70, paddingTop: 8 },
  bannerCard: { marginHorizontal: 20, marginBottom: 20 },
  illustrationBox: { height: 260, backgroundColor: '#FFF1E6', borderRadius: 36, justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderWidth: 2, borderColor: '#FED7AA' },
  bannerImage: { width: '100%', height: '100%' },
  bannerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(255, 247, 237, 0.1)' },
  headerInfo: { marginTop: 20 },
  headerBadgeRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  categoryBadge: { backgroundColor: '#FFF', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  categoryBadgeText: { fontSize: 10, fontWeight: '900', color: '#6B7280', letterSpacing: 1 },
  challengeTitle: { fontSize: 32, fontWeight: '900', color: '#1F2937', letterSpacing: -1.5, lineHeight: 38, marginBottom: 16 },
  creatorRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  creatorAvatar: { width: 32, height: 32, borderRadius: 12, backgroundColor: '#1F2937', justifyContent: 'center', alignItems: 'center' },
  creatorName: { fontSize: 14, fontWeight: '600', color: '#6B7280', flex: 1 },
  boldText: { color: '#1F2937', fontWeight: '800' },
  statusTag: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#E5E7EB', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 11, fontWeight: '900', color: '#1F2937', letterSpacing: 0.5 },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  sectionTitle: { fontSize: 24, fontWeight: '900', color: '#1F2937', letterSpacing: -1, marginBottom: 12 },
  titleUnderline: { color: '#F97316', fontStyle: 'italic' },
  aboutText: { fontSize: 15, color: '#6B7280', lineHeight: 26, fontWeight: '500' },
  statsContainer: { flexDirection: 'row', marginHorizontal: 20, paddingVertical: 12, borderTopWidth: 2, borderBottomWidth: 2, borderColor: '#FED7AA', justifyContent: 'space-around', marginBottom: 24, backgroundColor: '#FFF7ED' },
  statBox: { flex: 1, alignItems: 'center' },
  emptyContainer: { padding: 20, alignItems: 'center', justifyContent: 'center' },
  emptyIconBox: { width: 80, height: 80, borderRadius: 30, backgroundColor: '#FFF7ED', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '900', color: '#1F2937', marginBottom: 8 },
  statLabel: { fontSize: 10, fontWeight: '900', color: '#9CA3AF', letterSpacing: 1, textTransform: 'uppercase' },
  statDivider: { width: 2, height: '50%', backgroundColor: '#FED7AA', alignSelf: 'center' },
  championCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderRadius: 32, padding: 24, borderWidth: 2, borderColor: '#FED7AA', marginTop: 10, elevation: 4, shadowColor: '#F97316', shadowOpacity: 0.1, shadowRadius: 15 },
  championAvatarBox: { alignItems: 'center', marginRight: 24 },
  championAvatar: { width: 80, height: 80, borderRadius: 32, backgroundColor: '#FFF7ED', justifyContent: 'center', alignItems: 'center', borderWidth: 2.5 },
  championRankBadge: { position: 'absolute', bottom: -12, backgroundColor: '#F59E0B', flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 2, borderColor: '#FFF' },
  championRankText: { fontSize: 10, fontWeight: '900', color: '#FFF' },
  championMeta: { flex: 1 },
  championName: { fontSize: 20, fontWeight: '900', color: '#1F2937', marginBottom: 4 },
  championVotes: { fontSize: 11, fontWeight: '900', color: '#6B7280', letterSpacing: 1 },
  championStatus: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 12, backgroundColor: '#FFF7ED', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, alignSelf: 'flex-start' },
  championStatusText: { fontSize: 10, fontWeight: '800', color: '#F59E0B', textTransform: 'uppercase' },
  crownContainer: { position: 'absolute', top: -20 },
  submissionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  submissionCard: { width: (width - 48 - 12) / 2, backgroundColor: '#FFFFFF', borderRadius: 28, borderWidth: 2, borderColor: '#FED7AA', overflow: 'hidden', elevation: 3, shadowColor: '#F97316', shadowOpacity: 0.05, shadowRadius: 10 },
  subPreviewBox: { height: 140, backgroundColor: '#FFF7ED', justifyContent: 'center', alignItems: 'center' },
  subImage: { width: '100%', height: '100%' },
  subTextPlaceholder: { padding: 16 },
  subTextSnippet: { fontSize: 12, color: '#6B7280', fontWeight: '600', lineHeight: 18 },
  subCardFooter: { padding: 16, gap: 12 },
  subUserRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  subUserAvatar: { width: 20, height: 20, borderRadius: 8, backgroundColor: '#FFF7ED', justifyContent: 'center', alignItems: 'center' },
  subUserName: { fontSize: 12, fontWeight: '800', color: '#1F2937', flex: 1 },
  voteControls: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  voteCountBox: { flexDirection: 'row', alignItems: 'baseline', gap: 3 },
  voteCountVal: { fontSize: 16, fontWeight: '900', color: '#1F2937' },
  voteLabel: { fontSize: 10, fontWeight: '700', color: '#9CA3AF' },
  voteBtnSmall: { width: 36, height: 36, backgroundColor: '#F97316', borderRadius: 12, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  voteBtnDisabled: { opacity: 0.3, backgroundColor: '#FED7AA' },
  trendingBadge: { position: 'absolute', top: 10, right: 10, backgroundColor: '#F43F5E', flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  trendingText: { fontSize: 9, fontWeight: '900', color: '#FFF' },
  timerVal: { fontSize: 14, fontWeight: '900', color: '#F97316', backgroundColor: '#FFF7ED', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: '#FED7AA' },
  bottomCtaContainer: { position: 'absolute', bottom: 24, left: 0, right: 0, alignItems: 'center', backgroundColor: 'transparent' },
  primaryBtn: { 
    width: width * 0.85, 
    height: 56, 
    borderRadius: 16, 
    overflow: 'hidden', 
    elevation: 12, 
    shadowColor: '#F97316', 
    shadowOpacity: 0.4, 
    shadowRadius: 20, 
    shadowOffset: { width: 0, height: 8 }, 
    justifyContent: 'center', 
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)'
  },
  primaryGradient: { 
    width: '100%', 
    height: '100%', 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    gap: 12 
  },
  primaryBtnText: { 
    color: '#FFFFFF', 
    fontSize: 15, 
    fontWeight: '900', 
    letterSpacing: 2, 
    textTransform: 'uppercase' 
  },
  votingIndicator: { width: width * 0.85, height: 56, backgroundColor: '#FFFFFF', borderRadius: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, borderWidth: 2, borderColor: '#FDE68A', elevation: 4 },
  votingIndicatorText: { fontSize: 15, fontWeight: '900', color: '#B45309' },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(31, 41, 55, 0.9)', justifyContent: 'flex-end' },
  viewerContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 36, borderTopRightRadius: 36, height: '92%', width: '100%' },
  viewerHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  viewerUserRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  viewerUserName: { fontSize: 20, fontWeight: '900', color: '#1F2937' },
  closeModalBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  viewerScroll: { padding: 24 },
  viewerImage: { width: width - 48, height: 480, borderRadius: 32, marginBottom: 24 },
  viewerTextContainer: { padding: 28, backgroundColor: '#FFF7ED', borderRadius: 32, borderWidth: 2, borderColor: '#FED7AA', marginBottom: 24 },
  viewerText: { fontSize: 17, color: '#1F2937', lineHeight: 28, fontWeight: '500' },
  viewerFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingBottom: 60 },
  viewerStats: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  viewerVoteCount: { fontSize: 24, fontWeight: '900', color: '#1F2937' },
  viewerVoteLabel: { fontSize: 13, fontWeight: '700', color: '#9CA3AF' },
  modalVoteBtn: { backgroundColor: '#F97316', paddingHorizontal: 28, paddingVertical: 16, borderRadius: 20, elevation: 8, shadowColor: '#F97316', shadowOpacity: 0.3 },
  modalVoteBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
  
  // Custom Alerts & Success Modals
  successCard: { width: '85%', borderRadius: 32, overflow: 'hidden', elevation: 20, shadowColor: '#F97316', shadowOpacity: 0.3, shadowRadius: 30, alignSelf: 'center' },
  successCardInner: { padding: 32, alignItems: 'center' },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFF7ED', justifyContent: 'center', alignItems: 'center', marginBottom: 24, borderWidth: 2, borderColor: '#FED7AA' },
  modalTitle: { fontSize: 22, fontWeight: '900', color: '#1F2937', letterSpacing: -0.5, marginBottom: 12 },
  modalSubtitle: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20, marginBottom: 24, fontWeight: '500' },
  modalActionBtn: { width: '100%', height: 56, borderRadius: 16, overflow: 'hidden' },
  modalActionGradient: { flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12 },
  modalActionText: { color: '#FFFFFF', fontSize: 16, fontWeight: '900' },
});
