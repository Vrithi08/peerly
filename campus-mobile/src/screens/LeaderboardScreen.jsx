import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  ActivityIndicator, 
  RefreshControl, 
  TouchableOpacity, 
  Animated, 
  Dimensions,
  Platform,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { leaderboardService, userService } from '../services/api';
import { 
  Trophy, 
  Crown, 
  ChevronLeft, 
  Sparkles, 
  Zap, 
  Rocket, 
  Target, 
  User, 
  Bot,
  Circle,
  MessageSquare,
  Heart
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

// --- Background Particle Component ---
const BackgroundParticles = () => {
  const particles = Array(6).fill(0);
  return (
    <View style={StyleSheet.absoluteFill}>
      {particles.map((_, i) => (
        <FloatingParticle key={i} index={i} />
      ))}
    </View>
  );
};

const FloatingParticle = ({ index }) => {
  const moveAnim = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const duration = 4000 + (index * 1000);
    Animated.loop(
      Animated.sequence([
        Animated.timing(moveAnim, {
          toValue: 1,
          duration: duration,
          useNativeDriver: true,
        }),
        Animated.timing(moveAnim, {
          toValue: 0,
          duration: duration,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const translateY = moveAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -30 - (index * 10)],
  });

  const opacity = moveAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.1, 0.3, 0.1],
  });

  const positions = [
    { top: '10%', left: '5%' },
    { top: '25%', right: '10%' },
    { top: '45%', left: '15%' },
    { top: '65%', right: '20%' },
    { top: '80%', left: '10%' },
    { top: '15%', left: '50%' },
  ];

  return (
    <Animated.View 
      style={[
        styles.particle, 
        positions[index % positions.length], 
        { transform: [{ translateY: translateY }], opacity: opacity }
      ]} 
    />
  );
};

// --- Avatar Illustration Component with Pulse Animation ---
const AvatarIllustration = ({ Icon, size, color = "#ffffff", glow = false }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={[styles.avatarCircle, { width: size, height: size, borderRadius: size / 2, transform: [{ scale: pulseAnim }] }]}>
      {glow && <View style={[styles.glowEffect, { width: size + 20, height: size + 20, borderRadius: (size + 20) / 2 }]} />}
      <Icon size={size * 0.5} color={color} strokeWidth={1.5} />
    </Animated.View>
  );
};

const MascotAppreciation = () => {
  const jumpAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(jumpAnim, {
          toValue: -15,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(jumpAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.delay(1000)
      ])
    ).start();
  }, []);

  return (
    <View style={styles.mascotContainer}>
      <View style={styles.speechBubble}>
        <Text style={styles.speechText}>"Your dedication to the campus is legendary! Keep climbing, future leader!"</Text>
        <View style={styles.bubbleTail} />
      </View>
      <Animated.View style={[styles.mascotBase, { transform: [{ translateY: jumpAnim }] }]}>
        <View style={styles.sparkleBox}>
          <Sparkles size={20} color="#FBBF24" fill="#FBBF24" />
        </View>
        <Bot size={60} color="#F97316" strokeWidth={1.5} />
        <View style={styles.mascotShadow} />
      </Animated.View>
    </View>
  );
};

export default function LeaderboardScreen({ navigation }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCat, setSelectedCat] = useState('Global');
  const [myRank, setMyRank] = useState({ rank: '--', xp: 0 });

  const ILLUSTRATIONS = [Bot, Rocket, Zap, Target, User, Sparkles];

  useEffect(() => { 
    fetchLeaderboard(); 
  }, [selectedCat]);

  const fetchLeaderboard = async () => {
    try {
      const [leaderboardData, profileData] = await Promise.all([
        leaderboardService.getGlobal(),
        userService.getProfile()
      ]);
      setUsers(leaderboardData);
      setMyRank({ rank: profileData.rank, xp: profileData.totalPoints });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => { setRefreshing(true); fetchLeaderboard(); };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack()}>
          <ChevronLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Hall of Fame</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={styles.catWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
          {['Global', 'Coding', 'Design', 'Photography', 'Writing'].map(cat => (
            <TouchableOpacity 
              key={cat} 
              style={[styles.catChip, selectedCat === cat && styles.catChipActive]}
              onPress={() => setSelectedCat(cat)}
            >
              <Text style={[styles.catText, selectedCat === cat && styles.catTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.podiumContainer}>
        {/* #2 Rank */}
        <View style={styles.podiumItem}>
          <View style={styles.avatarWrapper}>
            <AvatarIllustration Icon={Zap} size={70} color="rgba(249, 115, 22, 0.6)" />
            <View style={styles.rankBadgeSmall}><Text style={styles.rankBadgeText}>2</Text></View>
          </View>
          <View style={styles.podiumTextContent}>
            <Text style={styles.podiumName} numberOfLines={1}>{users[1]?.name || 'Elite Peer'}</Text>
            <Text style={styles.podiumScore}>{users[1]?.totalPoints || 0} XP</Text>
          </View>
        </View>

        {/* #1 Rank */}
        <View style={[styles.podiumItem, styles.rank1Item]}>
          <View style={styles.crownBox}>
            <Crown size={32} color="#F97316" fill="#F97316" />
          </View>
          <View style={styles.avatarWrapper}>
            <AvatarIllustration Icon={Bot} size={100} color="#F97316" glow={true} />
            <View style={styles.rankBadgeLarge}><Text style={styles.rankBadgeTextDark}>1</Text></View>
          </View>
          <View style={styles.podiumTextContent}>
            <Text style={styles.podiumNameBold} numberOfLines={1}>{users[0]?.name || 'Top Conqueror'}</Text>
            <View style={styles.xpBox}>
              <Text style={styles.xpValueBold}>{users[0]?.totalPoints || 0}</Text>
              <Text style={styles.xpLabelBold}>XP</Text>
            </View>
          </View>
        </View>

        {/* #3 Rank */}
        <View style={styles.podiumItem}>
          <View style={styles.avatarWrapper}>
            <AvatarIllustration Icon={Rocket} size={64} color="rgba(249, 115, 22, 0.4)" />
            <View style={styles.rankBadgeSmall}><Text style={styles.rankBadgeText}>3</Text></View>
          </View>
          <View style={styles.podiumTextContent}>
            <Text style={styles.podiumName} numberOfLines={1}>{users[2]?.name || 'Rising Star'}</Text>
            <Text style={styles.podiumScore}>{users[2]?.totalPoints || 0} XP</Text>
          </View>
        </View>
      </View>

      <View style={styles.listHeader}>
        <Text style={styles.listHeaderTitle}>RANKINGS</Text>
        <View style={styles.headerLine} />
      </View>
    </View>
  );

  const renderUser = ({ item, index }) => {
    if (index < 3) return null;
    const Illustration = ILLUSTRATIONS[index % ILLUSTRATIONS.length];
    
    return (
      <View style={styles.userRow}>
        <View style={styles.rankCircle}>
          <Text style={styles.rankText}>{index + 1}</Text>
        </View>
        <View style={styles.userIllustrationBox}>
          <Illustration size={20} color="rgba(249, 115, 22, 0.6)" strokeWidth={1.5} />
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          <Text style={styles.userStatus}>Verified Contributor</Text>
        </View>
        <View style={styles.userScoreBox}>
          <Text style={styles.userScoreText}>{item.totalPoints}</Text>
          <Text style={styles.userScoreUnit}>XP</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <BackgroundParticles />
      {loading ? (
        <View style={styles.center}><ActivityIndicator color="#F97316" /></View>
      ) : (
        <>
          <FlatList
            data={users}
            keyExtractor={(item, index) => item?.id?.toString() || index.toString()}
            renderItem={renderUser}
            ListHeaderComponent={renderHeader}
            ListFooterComponent={(
              <View style={{ paddingBottom: 80 }}>
                <MascotAppreciation />
              </View>
            )}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#F97316" />}
          />

          <LinearGradient
            colors={['#1F2937', '#111827']}
            style={styles.myRankContainer}
          >
            <View style={styles.myRankRow}>
              <View style={styles.myRankLeft}>
                <View style={styles.myRankCircle}>
                  <Text style={styles.myRankNum}>{myRank.rank}</Text>
                </View>
                <View>
                  <Text style={styles.myRankTitle}>Your Current Rank</Text>
                  <Text style={styles.myRankSub}>Top 15% this week</Text>
                </View>
              </View>
              <View style={styles.myRankRight}>
                <Text style={styles.myRankXP}>{myRank.xp}</Text>
                <Text style={styles.myRankXPLabel}>XP</Text>
              </View>
            </View>
          </LinearGradient>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF7ED' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  // Particles
  particle: {
    position: 'absolute',
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#F97316',
    opacity: 0.1,
  },

  header: { paddingHorizontal: 24, paddingTop: 10, paddingBottom: 20 },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
  screenTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1F2937',
    letterSpacing: -1,
  },

  // Podium
  podiumContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  catWrapper: { marginBottom: 30 },
  catScroll: { paddingHorizontal: 24, gap: 10 },
  catChip: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#FED7AA' },
  catChipActive: { backgroundColor: '#F97316', borderColor: '#F97316' },
  catText: { fontSize: 13, fontWeight: '700', color: '#6B7280' },
  catTextActive: { color: '#FFFFFF' },
  podiumItem: {
    alignItems: 'center',
    flex: 1,
  },
  rank1Item: {
    marginTop: -20,
  },
  avatarWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  avatarCircle: {
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10
  },
  glowEffect: {
    position: 'absolute',
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    zIndex: -1,
  },
  crownBox: {
    marginBottom: -10,
    zIndex: 10,
  },
  rankBadgeSmall: {
    position: 'absolute',
    bottom: -8,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#FED7AA',
    zIndex: 20,
    elevation: 2
  },
  rankBadgeLarge: {
    position: 'absolute',
    bottom: -10,
    backgroundColor: '#F97316',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 20,
    elevation: 4,
    shadowColor: '#F97316',
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 }
  },
  rankBadgeText: { fontSize: 12, fontWeight: '900', color: '#6B7280' },
  rankBadgeTextDark: { fontSize: 14, fontWeight: '900', color: '#FFFFFF' },

  podiumTextContent: {
    alignItems: 'center',
    marginTop: 5,
  },
  podiumName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
    textAlign: 'center',
    maxWidth: 80,
  },
  podiumNameBold: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1F2937',
    textAlign: 'center',
    maxWidth: 100,
  },
  podiumScore: {
    fontSize: 11,
    fontWeight: '800',
    color: '#6B7280',
    marginTop: 2,
  },
  xpBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#FED7AA',
    elevation: 1
  },
  xpValueBold: { fontSize: 14, fontWeight: '900', color: '#F97316' },
  xpLabelBold: { fontSize: 10, fontWeight: '900', color: '#6B7280' },

  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  listHeaderTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#6B7280',
    letterSpacing: 2,
  },
  headerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#FED7AA',
  },

  list: { paddingBottom: 100 },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 24,
    marginBottom: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#FED7AA',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5
  },
  rankCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFF1E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: { fontSize: 12, fontWeight: '900', color: '#6B7280' },
  userIllustrationBox: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#FFF1E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  userInfo: { flex: 1 },
  userName: { fontSize: 16, fontWeight: '800', color: '#1F2937' },
  userStatus: { fontSize: 11, fontWeight: '600', color: '#6B7280' },
  userScoreBox: { alignItems: 'flex-end' },
  userScoreText: { fontSize: 18, fontWeight: '900', color: '#1F2937' },
  userScoreUnit: { fontSize: 10, fontWeight: '900', color: '#9CA3AF', marginLeft: 4 },

  // My Rank Bar
  myRankContainer: {
    position: 'absolute',
    bottom: 110,
    left: 16,
    right: 16,
    borderRadius: 24,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 10 }
  },
  myRankRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  myRankLeft: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  myRankCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#F97316', justifyContent: 'center', alignItems: 'center' },
  myRankNum: { color: '#FFFFFF', fontSize: 18, fontWeight: '900' },
  myRankTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  myRankSub: { color: '#9CA3AF', fontSize: 11, fontWeight: '600' },
  myRankRight: { alignItems: 'flex-end' },
  myRankXP: { color: '#F97316', fontSize: 20, fontWeight: '900' },
  myRankXPLabel: { color: '#9CA3AF', fontSize: 10, fontWeight: '800' },

  // Mascot
  mascotContainer: { alignItems: 'center', marginTop: 40, marginBottom: 20 },
  speechBubble: { 
    backgroundColor: '#FFFFFF', padding: 16, borderRadius: 20, 
    borderWidth: 1.5, borderColor: '#FED7AA', maxWidth: width * 0.7,
    marginBottom: 12, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5
  },
  speechText: { fontSize: 13, fontWeight: '700', color: '#1F2937', textAlign: 'center', fontStyle: 'italic' },
  bubbleTail: { 
    position: 'absolute', bottom: -8, alignSelf: 'center', width: 16, height: 16, 
    backgroundColor: '#FFFFFF', transform: [{ rotate: '45deg' }],
    borderBottomWidth: 1.5, borderRightWidth: 1.5, borderColor: '#FED7AA'
  },
  mascotBase: { alignItems: 'center' },
  mascotShadow: { width: 40, height: 6, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 10, marginTop: 4 },
  sparkleBox: { position: 'absolute', top: -10, right: -10 },
});
