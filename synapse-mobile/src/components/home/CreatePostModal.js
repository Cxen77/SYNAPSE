import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Avatar from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import client from '../../api/client';

export default function CreatePostModal({ visible, onClose, onPostCreated }) {
  const { currentUser } = useAuth();
  const { colors, isDarkMode } = useTheme();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!content.trim()) {
      Alert.alert('Empty Post', 'Please write something before posting.');
      return;
    }

    setLoading(true);
    try {
      const { data } = await client.post('/posts', { content: content.trim() });
      setContent('');
      onPostCreated && onPostCreated(data);
      onClose();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to publish post.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Create Post</Text>
            <TouchableOpacity
              style={[styles.publishBtn, { backgroundColor: colors.primary }]}
              onPress={handleCreate}
              disabled={loading || !content.trim()}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.publishBtnText}>Post</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* User info */}
          <View style={styles.authorRow}>
            <Avatar
              uri={currentUser?.profilePic}
              name={currentUser?.name}
              size={40}
              style={{ marginRight: 10 }}
            />
            <View>
              <Text style={[styles.authorName, { color: colors.text }]}>
                {currentUser?.name || 'You'}
              </Text>
              <Text style={[styles.authorMeta, { color: colors.textSecondary }]}>
                Public • Anyone on Synapse
              </Text>
            </View>
          </View>

          {/* Composer */}
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Share a project update, hackathon idea, or question..."
            placeholderTextColor={colors.textMuted}
            multiline
            autoFocus
            value={content}
            onChangeText={setContent}
            textAlignVertical="top"
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    height: '80%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  publishBtn: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  publishBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 14,
  },
  authorName: {
    fontSize: 14,
    fontWeight: '700',
  },
  authorMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
  },
});
