import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  Switch, 
  Alert, 
  ActivityIndicator,
  Platform,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  ArrowLeft, 
  User, 
  Bell, 
  Palette, 
  Shield, 
  Trash2, 
  ChevronRight, 
  Code as CodeIcon, 
  Users as UsersIcon,
  Lock,
  Mail,
  Smartphone,
  Moon,
  Sun,
  Layout,
  CheckCircle2,
  Bot,
  Award
} from 'lucide-react-native';
import { userService } from '../services/api';

const { width } = Dimensions.get('window');

export default function SettingsScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form States
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [dept, setDept] = useState('');
  const [batch, setBatch] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');

  // Notification States
  const [notifReplies, setNotifReplies] = useState(true);
  const [notifAccepted, setNotifAccepted] = useState(true);
  const [notifChallenges, setNotifChallenges] = useState(true);
  const [notifVoting, setNotifVoting] = useState(true);

  // Appearance States
  const [theme, setTheme] = useState('system'); // light, dark, system
  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await userService.getProfile();
      setUser(data);
      setName(data.name || '');
      setUsername(data.rollNumber || ''); // Using rollNumber as username handle for now
      setBio(data.bio || '');
      setDept(data.department || '');
      setBatch(data.batch || '');
      setGithubUrl(data.githubUrl || '');
      setLinkedinUrl(data.linkedinUrl || '');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAccount = async () => {
    setSaving(true);
    try {
      const payload = {
        name,
        bio,
        department: dept,
        batch,
        githubUrl,
        linkedinUrl
      };
      const updatedUser = await userService.updateProfile(payload);
      setUser(updatedUser);
      Alert.alert('Success', 'Account settings updated! ✨');
    } catch (err) {
      console.error('Update Profile Error:', err);
      const msg = err.response?.data?.message || err.message || 'Check your connection';
      Alert.alert('Save Failed', `Details: ${msg}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you absolutely sure? This will permanently remove all your progress, points, and discussions. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete Permanently', style: 'destructive', onPress: () => Alert.alert('Request Sent', 'Your account deletion request has been submitted.') }
      ]
    );
  };

  const SettingSection = ({ title, children }) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>
        {children}
      </View>
    </View>
  );

  const SettingItem = ({ icon: Icon, label, value, onPress, type = 'navigate', showBorder = true }) => (
    <TouchableOpacity 
      style={[styles.settingItem, !showBorder && { borderBottomWidth: 0 }]} 
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingItemLeft}>
        <View style={styles.settingIconBox}>
          <Icon size={18} color="#F97316" />
        </View>
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      <View style={styles.settingItemRight}>
        {type === 'navigate' && (
          <>
            <Text style={styles.settingValue} numberOfLines={1}>{value}</Text>
            <ChevronRight size={16} color="#9CA3AF" />
          </>
        )}
        {type === 'toggle' && (
          <Switch 
            value={value} 
            onValueChange={onPress}
            trackColor={{ false: '#E5E7EB', true: '#FED7AA' }}
            thumbColor={value ? '#F97316' : '#F3F4F6'}
          />
        )}
      </View>
    </TouchableOpacity>
  );

  if (loading) return (
    <View style={styles.center}><ActivityIndicator color="#F97316" size="large" /></View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <TouchableOpacity onPress={handleSaveAccount} disabled={saving}>
          {saving ? <ActivityIndicator size="small" color="#F97316" /> : <Text style={styles.saveHeaderBtn}>Save</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* 👤 Account Section */}
        <SettingSection title="ACCOUNT">
          <View style={styles.profileEditHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatarCircle}>
                <Bot size={40} color="#F97316" />
              </View>
              <TouchableOpacity style={styles.editAvatarBtn}>
                <Text style={styles.editAvatarText}>Change</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.headerInputs}>
              <TextInput 
                style={styles.headerInput} 
                placeholder="Full Name"
                value={name}
                onChangeText={setName}
              />
              <TextInput 
                style={[styles.headerInput, styles.handleInput]} 
                placeholder="@username"
                value={username}
                editable={false} // Handle usually immutable or requires special check
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Bio</Text>
            <TextInput 
              style={styles.textArea}
              placeholder="Tell us about yourself..."
              multiline
              value={bio}
              onChangeText={setBio}
            />
          </View>

          <View style={styles.rowInputs}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Department</Text>
              <TextInput 
                style={styles.rowInput}
                placeholder="CSE / ECE"
                value={dept}
                onChangeText={setDept}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Batch</Text>
              <TextInput 
                style={styles.rowInput}
                placeholder="2023-27"
                value={batch}
                onChangeText={setBatch}
              />
            </View>
          </View>

          <SettingItem icon={Lock} label="Change Password" value="••••••••" onPress={() => Alert.alert('Security', 'Password reset email sent!')} />
          <SettingItem icon={Mail} label="Email" value={user?.email} showBorder={false} />
        </SettingSection>

        {/* 🔗 Social Links */}
        <SettingSection title="SOCIAL PROFILES">
          <View style={styles.socialInput}>
            <CodeIcon size={20} color="#4B5563" />
            <TextInput 
              style={styles.flexInput}
              placeholder="GitHub URL"
              value={githubUrl}
              onChangeText={setGithubUrl}
            />
          </View>
          <View style={[styles.socialInput, { borderBottomWidth: 0 }]}>
            <UsersIcon size={20} color="#0077B5" />
            <TextInput 
              style={styles.flexInput}
              placeholder="LinkedIn URL"
              value={linkedinUrl}
              onChangeText={setLinkedinUrl}
            />
          </View>
        </SettingSection>

        {/* 🔔 Notifications */}
        <SettingSection title="NOTIFICATIONS">
          <SettingItem icon={Bell} label="Discussion Replies" type="toggle" value={notifReplies} onPress={setNotifReplies} />
          <SettingItem icon={CheckCircle2} label="Answer Accepted" type="toggle" value={notifAccepted} onPress={setNotifAccepted} />
          <SettingItem icon={Layout} label="New Challenges" type="toggle" value={notifChallenges} onPress={setNotifChallenges} />
          <SettingItem icon={Award} label="Voting Results" type="toggle" value={notifVoting} onPress={setNotifVoting} showBorder={false} />
          
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>Notifications are delivered via in-app alerts and email.</Text>
          </View>
        </SettingSection>

        {/* 🎨 Appearance */}
        <SettingSection title="APPEARANCE">
          <View style={styles.themeSelector}>
            <TouchableOpacity 
              style={[styles.themeOption, theme === 'light' && styles.themeOptionActive]}
              onPress={() => setTheme('light')}
            >
              <Sun size={20} color={theme === 'light' ? '#F97316' : '#6B7280'} />
              <Text style={[styles.themeText, theme === 'light' && styles.themeTextActive]}>Light</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.themeOption, theme === 'dark' && styles.themeOptionActive]}
              onPress={() => setTheme('dark')}
            >
              <Moon size={20} color={theme === 'dark' ? '#F97316' : '#6B7280'} />
              <Text style={[styles.themeText, theme === 'dark' && styles.themeTextActive]}>Dark</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.themeOption, theme === 'system' && styles.themeOptionActive]}
              onPress={() => setTheme('system')}
            >
              <Layout size={20} color={theme === 'system' ? '#F97316' : '#6B7280'} />
              <Text style={[styles.themeText, theme === 'system' && styles.themeTextActive]}>System</Text>
            </TouchableOpacity>
          </View>

          <SettingItem icon={Layout} label="Compact Mode" type="toggle" value={isCompact} onPress={setIsCompact} showBorder={false} />
        </SettingSection>

        {/* ⚠️ Danger Zone */}
        <SettingSection title="DANGER ZONE">
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount}>
            <Trash2 size={20} color="#EF4444" />
            <Text style={styles.deleteBtnText}>Delete Account Permanently</Text>
          </TouchableOpacity>
        </SettingSection>

        <View style={styles.footer}>
          <Text style={styles.versionText}>Student Sync v1.2.0</Text>
          <Text style={styles.copyrightText}>Handcrafted for Campus Communities 🎓</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#1F2937' },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#F9FAFB', justifyContent: 'center', alignItems: 'center' },
  saveHeaderBtn: { color: '#F97316', fontSize: 16, fontWeight: '800' },
  scrollContent: { padding: 16, paddingBottom: 60 },

  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 12, fontWeight: '800', color: '#9CA3AF', marginBottom: 8, marginLeft: 8, letterSpacing: 1 },
  sectionCard: { backgroundColor: '#FFFFFF', borderRadius: 24, padding: 4, overflow: 'hidden', borderWidth: 1, borderColor: '#F3F4F6' },

  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB'
  },
  settingItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#FFF7ED', justifyContent: 'center', alignItems: 'center' },
  settingLabel: { fontSize: 15, fontWeight: '600', color: '#374151' },
  settingItemRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  settingValue: { fontSize: 14, color: '#9CA3AF', fontWeight: '500', maxWidth: 120 },

  profileEditHeader: { flexDirection: 'row', padding: 16, gap: 20, alignItems: 'center' },
  avatarContainer: { alignItems: 'center' },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#FFF1E6', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FED7AA' },
  editAvatarBtn: { marginTop: 8 },
  editAvatarText: { fontSize: 12, color: '#F97316', fontWeight: '800' },
  headerInputs: { flex: 1, gap: 10 },
  headerInput: { fontSize: 20, fontWeight: '800', color: '#1F2937', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', paddingVertical: 4 },
  handleInput: { fontSize: 14, color: '#F97316', fontWeight: '700' },

  inputGroup: { padding: 16 },
  inputLabel: { fontSize: 13, fontWeight: '700', color: '#6B7280', marginBottom: 8 },
  textArea: { backgroundColor: '#F9FAFB', borderRadius: 16, padding: 12, height: 80, textAlignVertical: 'top', fontSize: 14, fontWeight: '500', color: '#1F2937' },
  rowInputs: { flexDirection: 'row', paddingHorizontal: 16, gap: 16, marginBottom: 16 },
  rowInput: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 12, fontSize: 14, fontWeight: '600', color: '#1F2937' },

  socialInput: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, borderBottomWidth: 1, borderBottomColor: '#F9FAFB' },
  flexInput: { flex: 1, fontSize: 14, fontWeight: '600', color: '#1F2937' },

  infoBox: { padding: 16, backgroundColor: '#F0F9FF', borderTopWidth: 1, borderTopColor: '#E0F2FE' },
  infoText: { fontSize: 12, color: '#0369A1', fontWeight: '500', textAlign: 'center' },

  themeSelector: { flexDirection: 'row', padding: 8, gap: 8, backgroundColor: '#F9FAFB', margin: 16, borderRadius: 16 },
  themeOption: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 12, borderRadius: 12 },
  themeOptionActive: { backgroundColor: '#FFFFFF', elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 },
  themeText: { fontSize: 13, fontWeight: '700', color: '#6B7280' },
  themeTextActive: { color: '#F97316' },

  deleteBtn: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, justifyContent: 'center' },
  deleteBtnText: { fontSize: 15, fontWeight: '800', color: '#EF4444' },

  footer: { alignItems: 'center', marginTop: 20, marginBottom: 40 },
  versionText: { fontSize: 13, fontWeight: '800', color: '#D1D5DB' },
  copyrightText: { fontSize: 11, color: '#D1D5DB', fontWeight: '600', marginTop: 4 }
});
