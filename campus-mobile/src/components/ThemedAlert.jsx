import React from 'react';
import { 
  Modal, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions 
} from 'react-native';
import { 
  CheckCircle2, 
  AlertCircle, 
  Bot,
  Info
} from 'lucide-react-native';

const ThemedAlert = ({ visible, title, message, type = 'info', onConfirm, confirmText = 'Acknowledge' }) => {
  const getMainColor = () => {
    switch (type) {
      case 'success': return '#10B981';
      case 'error': return '#EF4444';
      case 'warning': return '#F59E0B';
      default: return '#F97316';
    }
  };

  const getIcon = () => {
    const size = 50;
    const color = getMainColor();
    switch (type) {
      case 'success': return <CheckCircle2 size={size} color={color} strokeWidth={2} />;
      case 'error': return <AlertCircle size={size} color={color} strokeWidth={2} />;
      default: return <Bot size={size} color={color} strokeWidth={2} />;
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.donutModalOverlay}>
        <View style={[styles.donutCard, { borderColor: getMainColor() }]}>
          <View style={styles.donutCardInner}>
            <View style={styles.donutIllustrationBox}>
              {getIcon()}
            </View>

            <Text style={styles.donutHeadline}>{title}</Text>
            <Text style={styles.donutSubtext}>{message}</Text>

            <TouchableOpacity 
              style={[styles.donutActionBtn, { borderColor: getMainColor() }]} 
              onPress={onConfirm}
            >
              <Text style={[styles.donutActionText, { color: getMainColor() }]}>{confirmText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  donutModalOverlay: { flex: 1, backgroundColor: 'rgba(31, 41, 55, 0.7)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  donutCard: { 
    width: '75%', 
    backgroundColor: '#FFFFFF', 
    borderTopLeftRadius: 60,
    borderBottomRightRadius: 60,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
    elevation: 25, 
    shadowColor: '#000', 
    shadowOpacity: 0.1, 
    shadowRadius: 30, 
    borderWidth: 3, 
    overflow: 'hidden',
    transform: [{ rotate: '-1.5deg' }]
  },
  donutCardInner: { padding: 24, alignItems: 'center' },
  donutIllustrationBox: { height: 100, justifyContent: 'center', marginBottom: 15 },
  donutHeadline: { fontSize: 20, fontWeight: '900', color: '#374151', textAlign: 'center', marginBottom: 6, letterSpacing: -0.5 },
  donutSubtext: { fontSize: 13, color: '#6B7280', textAlign: 'center', marginBottom: 20, fontWeight: '500', lineHeight: 18 },
  donutActionBtn: { width: '100%', height: 48, borderRadius: 12, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  donutActionText: { fontSize: 13, fontWeight: '900', letterSpacing: 0.5 },
});

export default ThemedAlert;
