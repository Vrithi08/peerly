import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity, 
  Dimensions, 
  Image, 
  ScrollView,
  Platform,
  Animated,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { challengeService, leaderboardService } from '../services/api';
import { 
  Trophy, 
  Flame, 
  Zap, 
  ArrowRight,
  User,
  ShieldCheck,
  Rocket,
  BarChart2,
  Users,
  CheckCircle2,
  TrendingUp,
  Award,
  BookOpen,
  LogOut,
  HelpCircle
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75;

// --- Fade/Slide View Wrapper ---
const SlideUpView = ({ children, delay = 0, style }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
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

// --- Waving Robot Component ---
const WavingRobot = () => {
  const waveAnim = useRef(new Animated.Value(0)).current;
  const blinkAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    // Wave animation sequence (wave hello on mount)
    Animated.sequence([
      Animated.delay(800),
      Animated.timing(waveAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.timing(waveAnim, { toValue: -1, duration: 250, useNativeDriver: true }),
      Animated.timing(waveAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      Animated.timing(waveAnim, { toValue: -1, duration: 250, useNativeDriver: true }),
      Animated.timing(waveAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
    ]).start();

    // Blink animation sequence
    Animated.loop(
      Animated.sequence([
        Animated.delay(2000),
        Animated.timing(blinkAnim, { toValue: 0.1, duration: 100, useNativeDriver: true }),
        Animated.timing(blinkAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
        Animated.delay(200),
        Animated.timing(blinkAnim, { toValue: 0.1, duration: 100, useNativeDriver: true }),
        Animated.timing(blinkAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
        Animated.delay(3000),
      ])
    ).start();
  }, []);

  const rotate = waveAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-40deg', '0deg', '60deg']
  });

  return (
    <View style={[styles.robotContainer, { transform: [{ scale: 1.4 }] }]}>
      {/* Head */}
      <View style={styles.robotHead}>
        <View style={styles.robotAntenna} />
        <View style={styles.robotAntennaDot} />
        <View style={styles.robotEyes}>
          <Animated.View style={[styles.robotEye, { transform: [{ scaleY: blinkAnim }] }]} />
          <Animated.View style={[styles.robotEye, { transform: [{ scaleY: blinkAnim }] }]} />
        </View>
        <View style={styles.robotMouth} />
      </View>
      
      {/* Body & Arms */}
      <View style={styles.robotBodyContainer}>
        {/* Left Arm (static) */}
        <View style={[styles.robotArm, styles.robotLeftArm]} />
        
        {/* Body */}
        <View style={styles.robotBody}>
           <View style={styles.robotBodyDetail} />
           <View style={styles.robotBodyDetail2} />
        </View>
        
        {/* Right Arm (Waving) */}
        <Animated.View style={[styles.robotRightArmContainer, { transform: [{ translateY: 20 }, { rotate }, { translateY: -20 }] }]}>
          <View style={styles.robotRightArm} />
        </Animated.View>
      </View>
      
      {/* Base/Wheels */}
      <View style={styles.robotBase} />
    </View>
  );
};

export default function HomeScreen({ navigation, onLogout }) {
  const [trending, setTrending] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Peer');

  useEffect(() => { 
    fetchData(); 
    loadUser();
  }, []);

  const loadUser = async () => {
    const userStr = await AsyncStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserName(user.name?.split(' ')[0] || 'Peer');
      } catch (e) {
        setUserName('Peer');
      }
    }
  };

  const fetchData = async () => {
    try {
      const [challengesData, leaderboardData] = await Promise.all([
        challengeService.getAll(),
        leaderboardService.getGlobal()
      ]);
      setTrending(challengesData.slice(0, 4));
      setLeaderboard(leaderboardData.slice(0, 5));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFF7ED" />
      
      {/* STICKY NAVBAR */}
      <SafeAreaView edges={['top']} style={styles.navBar}>
        <View style={styles.navContent}>
          <Text style={styles.logoText}>Peer<Text style={styles.accentText}>ly</Text></Text>
          <View style={styles.navRight}>
            <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
              <LogOut size={20} color="#F97316" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scrollContent}
      >
        
        {/* 1. HERO SECTION (Split Layout on Mobile -> Stacked) */}
        <View style={styles.heroSection}>
          <SlideUpView delay={100} style={styles.heroTextContent}>
            <View style={styles.heroBadge}>
              <Sparkles size={14} color="#F97316" />
              <Text style={styles.heroBadgeText}>Welcome back, {userName}!</Text>
            </View>
            <Text style={styles.heroTitle}>
              <Text style={styles.titleWord1}>Connect. </Text>
              <Text style={styles.titleWord2}>Compete. </Text>
              <Text style={styles.titleWord3}>Conquer.</Text>
            </Text>
            <Text style={styles.heroSub}>
              The ultimate campus platform to showcase your skills, solve real-world challenges, and rise up the global leaderboard.
            </Text>
            <View style={styles.heroActions}>
              <TouchableOpacity 
                style={styles.heroMainBtn}
                onPress={() => navigation.navigate('ChallengesTab')}
                activeOpacity={0.8}
              >
                <Text style={styles.heroMainBtnText}>Get Started</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.heroOutlineBtn} 
                activeOpacity={0.7}
                onPress={() => navigation.navigate('LeaderboardTab')}
              >
                <Text style={styles.heroOutlineBtnText}>Learn More</Text>
              </TouchableOpacity>
            </View>
          </SlideUpView>
          
          <SlideUpView delay={300} style={styles.heroVisualContent}>
             <WavingRobot />
          </SlideUpView>
        </View>

        {/* 2. STATS SECTION */}
        <SlideUpView delay={400} style={styles.statsSection}>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>1.2k</Text>
              <Text style={styles.statLabel}>Challenges</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>45k</Text>
              <Text style={styles.statLabel}>Users</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>80k</Text>
              <Text style={styles.statLabel}>Submits</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>280k</Text>
              <Text style={styles.statLabel}>Votes</Text>
            </View>
          </View>
        </SlideUpView>

        {/* 3. FEATURES SECTION */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderCentered}>
            <Text style={styles.sectionTitle}>Why Choose <Text style={styles.accentText}>Peerly</Text>?</Text>
            <Text style={styles.sectionSub}>Everything you need to grow your campus reputation.</Text>
          </View>
          <View style={styles.featuresGrid}>
            {[
              { icon: HelpCircle, title: 'Help Desk', desc: 'Stuck? Drop a query in Student Sync and get campus-wide answers.' },
              { icon: ShieldCheck, title: 'Secure Voting', desc: 'Every vote is fair and transparent, ensuring the best ideas win.' },
              { icon: Trophy, title: 'Earn Rewards', desc: 'Get points, exclusive badges, and campus-wide recognition.' },
              { icon: Users, title: 'Community', desc: 'Collaborate with top peers and expand your personal network.' }
            ].map((feature, i) => (
              <SlideUpView key={i} delay={200 + (i * 100)} style={styles.featureCard}>
                <View style={styles.featureIconBox}>
                  <feature.icon size={22} color="#F97316" />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDesc}>{feature.desc}</Text>
              </SlideUpView>
            ))}
          </View>
        </View>

        {/* 5. HOW IT WORKS */}
        <View style={styles.sectionAlt}>
          <Text style={styles.sectionTitleCentered}>How It Works</Text>
          <View style={styles.stepsFlow}>
            <View style={styles.step}>
              <View style={styles.stepIconBox}>
                <View style={styles.stepNumberBadge}><Text style={styles.stepNumberText}>1</Text></View>
                <Rocket size={24} color="#F97316" />
              </View>
              <Text style={styles.stepTitle}>Connect</Text>
              <Text style={styles.stepDesc}>Find a challenge</Text>
            </View>
            <View style={styles.stepLine} />
            <View style={styles.step}>
              <View style={styles.stepIconBox}>
                <View style={styles.stepNumberBadge}><Text style={styles.stepNumberText}>2</Text></View>
                <Zap size={24} color="#F97316" />
              </View>
              <Text style={styles.stepTitle}>Compete</Text>
              <Text style={styles.stepDesc}>Engage with peers</Text>
            </View>
            <View style={styles.stepLine} />
            <View style={styles.step}>
              <View style={styles.stepIconBox}>
                <View style={styles.stepNumberBadge}><Text style={styles.stepNumberText}>3</Text></View>
                <Trophy size={24} color="#F97316" />
              </View>
              <Text style={styles.stepTitle}>Conquer</Text>
              <Text style={styles.stepDesc}>Rise to the top</Text>
            </View>
          </View>
        </View>

        {/* 4. CHALLENGE PREVIEW SECTION */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Live Challenges</Text>
              <Text style={styles.sectionSubLeft}>Solve or post challenges for your fellow students.</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('ChallengesTab')}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            contentContainerStyle={styles.horizontalScroll}
            snapToInterval={CARD_WIDTH + 16}
            decelerationRate="fast"
          >
            {loading ? (
              <ActivityIndicator color="#F97316" style={{ margin: 50 }} />
            ) : (
              trending.map((item, index) => (
                <TouchableOpacity 
                  key={item.id || index} 
                  style={styles.challengeCard}
                  onPress={() => navigation.navigate('ChallengeDetails', { challengeId: item.id })}
                >
                  <View style={styles.challengeCardHeader}>
                    <View style={styles.categoryBadge}><Text style={styles.categoryText}>{item.category}</Text></View>
                    <View style={[styles.statusBadge, { backgroundColor: item.status === 'OPEN' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)' }]}>
                      <Text style={[styles.statusText, { color: item.status === 'OPEN' ? '#22C55E' : '#EAB308' }]}>{item.status}</Text>
                    </View>
                  </View>
                  <Text style={styles.challengeCardTitle} numberOfLines={2}>{item.title}</Text>
                  <Text style={styles.challengeCardDesc} numberOfLines={2}>{item.description}</Text>
                  <View style={styles.challengeCardFooter}>
                    <Text style={styles.footerInfoText}>{item.creatorName}</Text>
                    <TouchableOpacity style={styles.viewBtn}>
                      <Text style={styles.viewBtnText}>View</Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </View>

        {/* 7. INSIGHTS / ACTIVITY SECTION */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Platform Insights</Text>
          </View>
          <View style={styles.insightsContainer}>
            <View style={styles.insightCard}>
              <TrendingUp size={20} color="#F97316" />
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.insightTitle}>Trending Category</Text>
                <Text style={styles.insightValue}>Technology & Dev</Text>
              </View>
            </View>
            <View style={styles.insightCard}>
              <Flame size={20} color="#EF4444" />
              <View style={{ marginLeft: 12 }}>
                <Text style={styles.insightTitle}>Hottest Challenge</Text>
                <Text style={styles.insightValue}>AI Hackathon 2026</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 6. LEADERBOARD PREVIEW */}
        <View style={styles.section}>
          <View style={styles.sectionHeaderCentered}>
            <Text style={styles.sectionTitle}>Top Performers</Text>
            <Text style={styles.sectionSub}>The best minds on campus.</Text>
          </View>
          <View style={styles.leaderboardContainer}>
            {leaderboard.map((user, index) => (
              <View key={user.id || index} style={[styles.leaderRow, index < 3 && styles.topLeaderRow]}>
                <View style={[styles.rankBadge, index === 0 && {backgroundColor: '#FEF3C7'}, index === 1 && {backgroundColor: '#F3F4F6'}, index === 2 && {backgroundColor: '#FFEDD5'}]}>
                  <Text style={[styles.rankNum, index === 0 && {color: '#D97706'}, index === 1 && {color: '#4B5563'}, index === 2 && {color: '#C2410C'}]}>{index + 1}</Text>
                </View>
                <Image source={{ uri: `https://i.pravatar.cc/100?u=${user.id}` }} style={styles.leaderAvatar} />
                <View style={styles.leaderInfo}>
                  <Text style={styles.leaderName}>{user.name}</Text>
                  <Text style={styles.leaderMeta}>Level {Math.floor(user.totalPoints/100) + 1}</Text>
                </View>
                <View style={styles.pointsBadge}>
                  <Text style={styles.leaderPoints}>{user.totalPoints} XP</Text>
                </View>
              </View>
            ))}
          </View>
          <TouchableOpacity style={styles.fullLeaderboardBtn} onPress={() => navigation.navigate('LeaderboardTab')}>
            <Text style={styles.fullLeaderboardBtnText}>View Full Leaderboard</Text>
          </TouchableOpacity>
        </View>

        {/* 8. CTA SECTION */}
        <View style={styles.ctaSection}>
          <LinearGradient
            colors={['#1F2937', '#111827']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaGradient}
          >
            <Text style={styles.ctaTitle}>Stuck on a problem?</Text>
            <Text style={styles.ctaSub}>Head over to Student Sync and ask your peers.</Text>
            <TouchableOpacity 
              style={styles.ctaBtn}
              onPress={() => navigation.navigate('HelpDeskTab')}
            >
              <Text style={styles.ctaBtnText}>Ask the Campus</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>

        {/* 9. FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerLogo}>Peer<Text style={styles.accentText}>ly</Text></Text>

          <View style={styles.footerDivider} />
          <Text style={styles.copyright}>© 2026 Peerly Platform. All rights reserved.</Text>
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const Sparkles = ({ size, color }) => (
  <View style={{ padding: 4, borderRadius: 12, backgroundColor: 'rgba(249, 115, 22, 0.1)' }}>
    <Zap size={size} color={color} />
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF7ED' },
  scrollContent: { paddingTop: 64 }, // account for navbar
  
  // Navbar
  navBar: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 100, backgroundColor: 'rgba(255, 247, 237, 0.95)' },
  navContent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, height: 60 },
  logoText: { fontSize: 22, fontWeight: '900', color: '#1F2937', letterSpacing: -0.5 },
  accentText: { color: '#F97316' },
  navRight: { flexDirection: 'row', alignItems: 'center' },
  logoutBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#FFF1E6', justifyContent: 'center', alignItems: 'center' },

  // 1. Hero Section
  heroSection: { paddingTop: 40, paddingBottom: 60, paddingHorizontal: 24 },
  heroTextContent: { marginBottom: 40 },
  heroBadge: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 8, backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 24, borderWidth: 1, borderColor: '#FED7AA' },
  heroBadgeText: { fontSize: 15, fontWeight: '800', color: '#F97316' },
  heroTitle: { fontSize: 44, fontWeight: '900', color: '#1F2937', lineHeight: 52, letterSpacing: -1 },
  titleWord1: { color: '#1F2937' },
  titleWord2: { color: '#F97316' },
  titleWord3: { color: '#1F2937', fontStyle: 'italic', textDecorationLine: 'underline', letterSpacing: 0 },
  heroSub: { fontSize: 16, color: '#6B7280', marginTop: 16, lineHeight: 24, fontWeight: '500' },
  heroActions: { flexDirection: 'row', gap: 12, marginTop: 32 },
  heroMainBtn: { flex: 1, height: 56, backgroundColor: '#F97316', borderRadius: 16, justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#F97316', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  heroMainBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  heroOutlineBtn: { flex: 1, height: 56, backgroundColor: '#FFFFFF', borderWidth: 2, borderColor: '#FED7AA', borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  heroOutlineBtnText: { color: '#F97316', fontSize: 16, fontWeight: '800' },
  
  // Robot Visual (Black and White Theme)
  heroVisualContent: { alignItems: 'center', justifyContent: 'center', marginTop: 40 },
  robotContainer: { alignItems: 'center', justifyContent: 'center', padding: 20 },
  robotHead: { width: 80, height: 60, backgroundColor: '#111827', borderRadius: 20, alignItems: 'center', justifyContent: 'center', position: 'relative', zIndex: 2 },
  robotAntenna: { width: 4, height: 20, backgroundColor: '#111827', position: 'absolute', top: -20 },
  robotAntennaDot: { width: 12, height: 12, backgroundColor: '#FFFFFF', borderRadius: 6, position: 'absolute', top: -26, borderWidth: 2, borderColor: '#111827' },
  robotEyes: { flexDirection: 'row', gap: 16, marginBottom: 8 },
  robotEye: { width: 16, height: 16, backgroundColor: '#FFFFFF', borderRadius: 8 },
  robotMouth: { width: 30, height: 6, backgroundColor: '#FFFFFF', borderRadius: 3 },
  
  robotBodyContainer: { flexDirection: 'row', alignItems: 'flex-start', marginTop: -5, zIndex: 1 },
  robotBody: { width: 100, height: 90, backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 5, borderColor: '#111827', alignItems: 'center', padding: 12, zIndex: 2 },
  robotBodyDetail: { width: '80%', height: 4, backgroundColor: '#111827', borderRadius: 2, marginBottom: 8 },
  robotBodyDetail2: { width: '50%', height: 4, backgroundColor: '#111827', borderRadius: 2 },
  
  robotArm: { width: 24, height: 60, backgroundColor: '#111827', borderRadius: 12 },
  robotLeftArm: { marginRight: -10, marginTop: 10, transform: [{ rotate: '20deg' }] },
  
  robotRightArmContainer: { width: 24, height: 60, marginLeft: -10, marginTop: 10, alignItems: 'center', zIndex: 3 },
  robotRightArm: { width: 24, height: 60, backgroundColor: '#111827', borderRadius: 12 },
  
  robotBase: { width: 60, height: 20, backgroundColor: '#111827', borderBottomLeftRadius: 30, borderBottomRightRadius: 30, marginTop: -5, zIndex: 0 },

  // 2. Stats Section
  statsSection: { paddingHorizontal: 24, marginBottom: 40 },
  statsContainer: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 20, paddingVertical: 24, paddingHorizontal: 16, borderWidth: 1, borderColor: '#FED7AA', elevation: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  statItem: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 20, fontWeight: '900', color: '#1F2937' },
  statLabel: { fontSize: 11, fontWeight: '700', color: '#6B7280', marginTop: 4, textTransform: 'uppercase' },

  // Generic Sections
  section: { paddingHorizontal: 24, marginBottom: 60 },
  sectionAlt: { paddingHorizontal: 24, paddingVertical: 60, backgroundColor: '#FFFFFF', marginBottom: 60 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 24 },
  sectionHeaderCentered: { alignItems: 'center', marginBottom: 32 },
  sectionTitle: { fontSize: 28, fontWeight: '900', color: '#1F2937', letterSpacing: -0.5 },
  sectionTitleCentered: { fontSize: 28, fontWeight: '900', color: '#1F2937', textAlign: 'center', marginBottom: 40 },
  sectionSub: { fontSize: 14, color: '#6B7280', marginTop: 8, textAlign: 'center' },
  sectionSubLeft: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  viewAllText: { fontSize: 14, color: '#F97316', fontWeight: '800' },

  // 3. Features Section (2-Column Grid)
  featuresGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  featureCard: { width: '48%', backgroundColor: '#FFFFFF', borderRadius: 20, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#FED7AA', elevation: 2, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8 },
  featureIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#FFF7ED', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  featureTitle: { fontSize: 16, fontWeight: '800', color: '#1F2937', marginBottom: 8 },
  featureDesc: { fontSize: 13, color: '#6B7280', lineHeight: 20, fontWeight: '500' },

  // 4. Challenge Preview Section
  horizontalScroll: { paddingRight: 24, gap: 16 },
  challengeCard: { width: CARD_WIDTH, backgroundColor: '#FFFFFF', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#FED7AA', elevation: 3, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10 },
  challengeCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  categoryBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#FFF7ED' },
  categoryText: { fontSize: 11, fontWeight: '800', color: '#F97316' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 10, fontWeight: '800' },
  challengeCardTitle: { fontSize: 18, fontWeight: '900', color: '#1F2937', marginBottom: 8 },
  challengeCardDesc: { fontSize: 13, color: '#6B7280', lineHeight: 20, marginBottom: 20 },
  challengeCardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 16 },
  footerInfoText: { fontSize: 12, fontWeight: '600', color: '#9CA3AF' },
  viewBtn: { backgroundColor: '#FFF7ED', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 12 },
  viewBtnText: { color: '#F97316', fontSize: 12, fontWeight: '800' },

  // 5. How It Works
  stepsFlow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  step: { flex: 1, alignItems: 'center' },
  stepIconBox: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#FFF7ED', justifyContent: 'center', alignItems: 'center', marginBottom: 12, borderWidth: 1, borderColor: '#FED7AA', position: 'relative' },
  stepNumberBadge: { position: 'absolute', top: -8, right: -8, width: 20, height: 20, borderRadius: 10, backgroundColor: '#1F2937', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFFFFF', zIndex: 2 },
  stepNumberText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900' },
  stepTitle: { fontSize: 14, fontWeight: '800', color: '#1F2937', marginBottom: 4 },
  stepDesc: { fontSize: 11, color: '#6B7280', fontWeight: '500', textAlign: 'center' },
  stepLine: { width: 40, height: 2, backgroundColor: '#FED7AA', marginTop: -30, opacity: 0.5 },

  // 7. Insights Section
  insightsContainer: { gap: 12 },
  insightCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  insightTitle: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
  insightValue: { fontSize: 16, fontWeight: '800', color: '#1F2937', marginTop: 2 },

  // 6. Leaderboard Preview
  leaderboardContainer: { backgroundColor: '#FFFFFF', borderRadius: 24, borderWidth: 1, borderColor: '#FED7AA', overflow: 'hidden', padding: 8 },
  leaderRow: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 16, marginVertical: 2 },
  topLeaderRow: { backgroundColor: '#FFF7ED' },
  rankBadge: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  rankNum: { fontSize: 12, fontWeight: '900', color: '#6B7280' },
  leaderAvatar: { width: 40, height: 40, borderRadius: 12, marginHorizontal: 12, backgroundColor: '#E5E7EB' },
  leaderInfo: { flex: 1 },
  leaderName: { fontSize: 15, fontWeight: '800', color: '#1F2937' },
  leaderMeta: { fontSize: 12, color: '#6B7280', fontWeight: '500' },
  pointsBadge: { backgroundColor: '#FFFFFF', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: '#FED7AA' },
  leaderPoints: { fontSize: 13, fontWeight: '800', color: '#F97316' },
  fullLeaderboardBtn: { marginTop: 16, alignItems: 'center', paddingVertical: 12 },
  fullLeaderboardBtnText: { color: '#F97316', fontSize: 14, fontWeight: '800' },

  // 8. CTA Section
  ctaSection: { marginHorizontal: 24, marginBottom: 60, borderRadius: 24, overflow: 'hidden', elevation: 8, shadowColor: '#F97316', shadowOpacity: 0.2, shadowRadius: 15 },
  ctaGradient: { padding: 40, alignItems: 'center' },
  ctaTitle: { fontSize: 26, fontWeight: '900', color: '#FFFFFF', textAlign: 'center', marginBottom: 12 },
  ctaSub: { fontSize: 14, color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginBottom: 32, fontWeight: '500' },
  ctaBtn: { paddingHorizontal: 32, paddingVertical: 16, backgroundColor: '#FFFFFF', borderRadius: 16 },
  ctaBtnText: { color: '#F97316', fontSize: 16, fontWeight: '900' },

  // 9. Footer
  footer: { paddingHorizontal: 24, alignItems: 'center' },
  footerLogo: { fontSize: 28, fontWeight: '900', color: '#1F2937', marginBottom: 20 },
  footerLinks: { flexDirection: 'row', gap: 24, marginBottom: 32 },
  footerLink: { fontSize: 13, fontWeight: '700', color: '#6B7280' },
  footerDivider: { width: '100%', height: 1, backgroundColor: '#E5E7EB', marginBottom: 24 },
  copyright: { fontSize: 12, color: '#9CA3AF', fontWeight: '500' },
});
