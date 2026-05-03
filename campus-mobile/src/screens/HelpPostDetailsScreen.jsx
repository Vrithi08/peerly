import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  TextInput, 
  Alert,
  Share as RNShare,
  KeyboardAvoidingView,
  Platform,
  Image,
  Modal,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { helpService, userService, uploadService, api } from '../services/api';
import { 
  ArrowLeft, 
  MessageCircle, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Coffee,
  Send,
  MoreVertical,
  Check,
  Code,
  User,
  Sparkles,
  Bookmark,
  Flag,
  Image as ImageIcon,
  Paperclip,
  FileText,
  X as CloseIcon
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HelpPostDetailsScreen({ route, navigation }) {
  const { postId } = route.params;
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [toast, setToast] = useState({ visible: false, message: '' });
  const toastOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchPost();
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const userStr = await AsyncStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setCurrentUserEmail(user.email);
    }
  };

  const fetchPost = async () => {
    try {
      const data = await helpService.getPostById(postId);
      setPost(data);
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to load post details.');
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
      setSelectedFile(null); // Clear file if image picked
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true
      });

      if (!result.canceled) {
        setSelectedFile(result.assets[0]);
        setSelectedImage(null); // Clear image if file picked
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostReply = async () => {
    if (!replyText.trim() && !selectedImage && !selectedFile) return;
    
    setSending(true);
    try {
      let mediaUrl = null;
      if (selectedImage) {
        const uploadRes = await uploadService.uploadFile(selectedImage);
        mediaUrl = uploadRes.url;
      } else if (selectedFile) {
        const uploadRes = await uploadService.uploadFile(selectedFile);
        mediaUrl = uploadRes.url;
      }

      await helpService.replyToPost(postId, {
        content: replyText,
        mediaUrl: mediaUrl
      });
      setReplyText('');
      setSelectedImage(null);
      setSelectedFile(null);
      fetchPost();
      showToastMessage('Reply posted! ✨');
    } catch (err) {
      console.error('Post Reply Error:', err);
      const msg = err.response?.data?.message || err.message || 'Network error';
      showToastMessage(`Error: ${msg}`);
    } finally {
      setSending(false);
    }
  };

  const handleAcceptAnswer = async (replyId) => {
    Alert.alert(
      'Accept Best Answer?',
      'Are you sure you want to mark this reply as the best answer and resolve this discussion?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Accept', 
          onPress: async () => {
            try {
              await helpService.acceptReply(replyId);
              fetchPost();
            } catch (err) {
              console.error(err);
              Alert.alert('Error', 'Failed to accept answer.');
            }
          }
        }
      ]
    );
  };

  const getUrgencyConfig = (urgency, resolved) => {
    if (resolved) return { label: 'RESOLVED', color: '#10B981', icon: CheckCircle2, bg: '#D1FAE5' };
    switch (urgency) {
      case 'URGENT': return { label: 'URGENT', color: '#EF4444', icon: AlertCircle, bg: '#FEE2E2' };
      case 'TODAY': return { label: 'TODAY', color: '#F59E0B', icon: Clock, bg: '#FEF3C7' };
      case 'CHILL': return { label: 'CHILL', color: '#10B981', icon: Coffee, bg: '#D1FAE5' };
      default: return { label: 'CHILL', color: '#10B981', icon: Coffee, bg: '#D1FAE5' };
    }
  };

  const showToastMessage = (message) => {
    setToast({ visible: true, message });
    Animated.sequence([
      Animated.timing(toastOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      Animated.delay(2000),
      Animated.timing(toastOpacity, { toValue: 0, duration: 300, useNativeDriver: true })
    ]).start(() => setToast({ visible: false, message: '' }));
  };

  const handleToggleBookmark = async () => {
    try {
      const newBookmarkStatus = !isBookmarked;
      setIsBookmarked(newBookmarkStatus);
      
      const bookmarksStr = await AsyncStorage.getItem('bookmarked_posts');
      let bookmarks = bookmarksStr ? JSON.parse(bookmarksStr) : [];
      
      if (newBookmarkStatus) {
        bookmarks.push(postId);
        showToastMessage('Post added to saved! 🔖');
      } else {
        bookmarks = bookmarks.filter(id => id !== postId);
        showToastMessage('Removed from saved.');
      }
      
      await AsyncStorage.setItem('bookmarked_posts', JSON.stringify(bookmarks));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    checkBookmarkStatus();
  }, [postId]);

  const checkBookmarkStatus = async () => {
    try {
      const bookmarksStr = await AsyncStorage.getItem('bookmarked_posts');
      if (bookmarksStr) {
        const bookmarks = JSON.parse(bookmarksStr);
        setIsBookmarked(bookmarks.includes(postId));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleMorePress = () => {
    setShowMenu(true);
  };

  if (loading) return (
    <View style={styles.center}><ActivityIndicator color="#F97316" /></View>
  );

  const config = getUrgencyConfig(post.urgency, post.resolved);
  const isOwner = currentUserEmail === post.postedByEmail;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <ArrowLeft size={24} color="#1F2937" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Post Discussion</Text>
          <TouchableOpacity style={styles.moreBtn} onPress={handleMorePress}>
            <MoreVertical size={24} color="#1F2937" />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          
          {/* Main Question Card */}
          <View style={styles.questionCard}>
            <View style={styles.cardHeader}>
              <View style={[styles.urgencyBadge, { backgroundColor: config.bg }]}>
                <config.icon size={12} color={config.color} />
                <Text style={[styles.urgencyText, { color: config.color }]}>{config.label}</Text>
              </View>
              <Text style={styles.subjectTag}>#{post.subject}</Text>
            </View>

            <Text style={styles.topicTitle}>{post.topic}</Text>
            <Text style={styles.descriptionText}>{post.description}</Text>

            <View style={styles.authorSection}>
              <Image source={{ uri: `https://i.pravatar.cc/100?u=${post.postedByEmail}` }} style={styles.avatar} />
              <View style={{ flex: 1 }}>
                <Text style={styles.authorName}>{post.postedByName}</Text>
                <Text style={styles.authorMeta}>{post.postedByDepartment} • {post.postedByBatch}</Text>
              </View>
              <Text style={styles.timeText}>2h ago</Text>
            </View>
          </View>

          <View style={styles.divider}>
            <Text style={styles.dividerText}>Discussion • {post.replies?.length || 0} Replies</Text>
          </View>

          {/* Replies Thread */}
          {post.replies?.map((reply, index) => (
            <View 
              key={reply.id || index} 
              style={[
                styles.replyCard, 
                reply.accepted && styles.acceptedReplyCard
              ]}
            >
              {reply.accepted && (
                <View style={styles.bestAnswerBadge}>
                  <CheckCircle2 size={14} color="#FFFFFF" />
                  <Text style={styles.bestAnswerText}>Best Answer</Text>
                </View>
              )}

              <View style={styles.replyHeader}>
                <Image source={{ uri: `https://i.pravatar.cc/100?u=${reply.repliedByEmail}` }} style={styles.avatarSmall} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.replyAuthorName}>{reply.repliedByName}</Text>
                  <Text style={styles.replyAuthorMeta}>{reply.repliedByDepartment} • {reply.repliedByBatch}</Text>
                </View>
                {isOwner && !post.resolved && (
                  <TouchableOpacity 
                    style={styles.acceptBtn}
                    onPress={() => handleAcceptAnswer(reply.id)}
                  >
                    <Check size={16} color="#F97316" />
                    <Text style={styles.acceptBtnText}>Accept</Text>
                  </TouchableOpacity>
                )}
              </View>

              <Text style={styles.replyContent}>{reply.content}</Text>
              <Text style={styles.replyTime}>1h ago</Text>
            </View>
          ))}

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Reply Input Bar */}
        {!post.resolved ? (
          <View style={styles.inputContainer}>
            {selectedImage && (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: selectedImage.uri }} style={styles.imagePreview} />
                <TouchableOpacity 
                  style={styles.removeImageBtn}
                  onPress={() => setSelectedImage(null)}
                >
                  <CloseIcon size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            )}
            {selectedFile && (
              <View style={styles.filePreviewContainer}>
                <View style={styles.fileChip}>
                  <FileText size={16} color="#F97316" />
                  <Text style={styles.fileChipText} numberOfLines={1}>{selectedFile.name}</Text>
                  <TouchableOpacity onPress={() => setSelectedFile(null)}>
                    <CloseIcon size={14} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            <View style={styles.inputBar}>
              <View style={{ flexDirection: 'row', gap: 4 }}>
                <TouchableOpacity style={styles.attachBtn} onPress={handlePickImage}>
                  <ImageIcon size={20} color={selectedImage ? '#F97316' : '#6B7280'} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.attachBtn} onPress={handlePickDocument}>
                  <Paperclip size={20} color={selectedFile ? '#F97316' : '#6B7280'} />
                </TouchableOpacity>
              </View>
              <TextInput 
                style={styles.input}
                placeholder="Type your reply..."
                placeholderTextColor="#9CA3AF"
                value={replyText}
                onChangeText={setReplyText}
                multiline
              />
              <TouchableOpacity 
                style={[styles.sendBtn, (!replyText.trim() && !selectedImage && !selectedFile) && { backgroundColor: '#FED7AA' }]}
                onPress={handlePostReply}
                disabled={sending || (!replyText.trim() && !selectedImage && !selectedFile)}
              >
                {sending ? <ActivityIndicator size="small" color="#FFFFFF" /> : <Send size={20} color="#FFFFFF" />}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.resolvedBanner}>
            <CheckCircle2 size={20} color="#10B981" />
            <Text style={styles.resolvedText}>This discussion has been resolved.</Text>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Web-style Options Menu */}
      <Modal
        visible={showMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity 
          style={styles.menuOverlay} 
          activeOpacity={1} 
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuContainer}>
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => { 
                setShowMenu(false); 
                handleToggleBookmark();
              }}
            >
              <Bookmark size={18} color={isBookmarked ? '#F97316' : '#4B5563'} fill={isBookmarked ? '#F97316' : 'transparent'} />
              <Text style={[styles.menuItemText, isBookmarked && { color: '#F97316' }]}>
                {isBookmarked ? 'Unbookmark' : 'Bookmark'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.menuItem}
              onPress={() => { 
                setShowMenu(false); 
                Alert.alert('Reported', 'Thank you for your feedback.');
              }}
            >
              <Flag size={18} color="#4B5563" />
              <Text style={styles.menuItemText}>Report</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Floating Toast Notification */}
      {toast.visible && (
        <Animated.View style={[styles.toast, { opacity: toastOpacity }]}>
          <Text style={styles.toastText}>{toast.message}</Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF7ED' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#1F2937' },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#FFFFFF', justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#FED7AA' },
  moreBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },

  scrollContent: { padding: 20 },
  
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: '#FED7AA',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 15
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  urgencyBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  urgencyText: { fontSize: 11, fontWeight: '900' },
  subjectTag: { fontSize: 13, fontWeight: '800', color: '#F97316' },
  
  topicTitle: { fontSize: 24, fontWeight: '900', color: '#1F2937', marginBottom: 12, lineHeight: 32 },
  descriptionText: { fontSize: 15, color: '#4B5563', lineHeight: 24, fontWeight: '500', marginBottom: 32 },
  
  authorSection: { flexDirection: 'row', alignItems: 'center', gap: 12, borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 20 },
  avatar: { width: 44, height: 44, borderRadius: 16, backgroundColor: '#E5E7EB' },
  authorName: { fontSize: 15, fontWeight: '800', color: '#1F2937' },
  authorMeta: { fontSize: 12, fontWeight: '600', color: '#9CA3AF' },
  timeText: { fontSize: 12, fontWeight: '700', color: '#9CA3AF' },

  divider: { marginVertical: 32, paddingHorizontal: 4 },
  dividerText: { fontSize: 14, fontWeight: '800', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 1 },

  replyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FED7AA'
  },
  acceptedReplyCard: {
    borderColor: '#10B981',
    borderWidth: 2,
    backgroundColor: '#F0FDF4'
  },
  bestAnswerBadge: {
    position: 'absolute',
    top: -12,
    left: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20
  },
  bestAnswerText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900' },

  replyHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  avatarSmall: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#E5E7EB' },
  replyAuthorName: { fontSize: 14, fontWeight: '800', color: '#1F2937' },
  replyAuthorMeta: { fontSize: 11, fontWeight: '600', color: '#9CA3AF' },
  
  acceptBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FFF7ED', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, borderWidth: 1, borderColor: '#FED7AA' },
  acceptBtnText: { color: '#F97316', fontSize: 11, fontWeight: '800' },
  
  replyContent: { fontSize: 14, color: '#4B5563', lineHeight: 22, fontWeight: '500' },
  replyTime: { fontSize: 11, fontWeight: '700', color: '#9CA3AF', marginTop: 12 },

  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#FED7AA',
    gap: 12
  },
  attachBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#F9FAFB', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 10, fontSize: 14, fontWeight: '500', color: '#1F2937', maxHeight: 100 },
  sendBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#F97316', justifyContent: 'center', alignItems: 'center' },

  resolvedBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    padding: 20,
    backgroundColor: '#F0FDF4',
    borderTopWidth: 1,
    borderTopColor: '#10B981'
  },
  resolvedText: { color: '#065F46', fontSize: 14, fontWeight: '700' },

  // Menu Styles
  menuOverlay: {
    flex: 1,
    backgroundColor: 'transparent'
  },
  menuContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 8,
    width: 180,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 10 },
    borderWidth: 1,
    borderColor: '#F3F4F6'
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 10,
    gap: 12
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4B5563'
  },

  // Toast Styles
  toast: {
    position: 'absolute',
    bottom: 100,
    alignSelf: 'center',
    backgroundColor: '#1F2937',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    elevation: 10,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 }
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700'
  },

  // Input Styles
  inputContainer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 20 : 10,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6'
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    paddingTop: 12,
    marginBottom: -8
  },
  imagePreview: {
    width: 60,
    height: 60,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FED7AA'
  },
  removeImageBtn: {
    position: 'absolute',
    top: 4,
    left: 48,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  filePreviewContainer: {
    paddingTop: 12,
    marginBottom: -8
  },
  fileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FED7AA',
    gap: 8,
    alignSelf: 'flex-start'
  },
  fileChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#F97316',
    maxWidth: 200
  }
});
