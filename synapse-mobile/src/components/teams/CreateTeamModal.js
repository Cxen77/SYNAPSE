import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import client from '../../api/client';

export default function CreateTeamModal({ visible, onClose, onTeamCreated }) {
  const { colors, isDarkMode } = useTheme();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [college, setCollege] = useState('');
  const [maxMembers, setMaxMembers] = useState('4');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter a team name.');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim(),
        college: college.trim(),
        maxMembers: parseInt(maxMembers, 10) || 4,
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      };

      const { data } = await client.post('/teams', payload);
      Alert.alert('Created!', `Team "${name}" created successfully.`);
      onTeamCreated && onTeamCreated(data.team || data);
      handleClose();
    } catch (err) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to create team.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setCollege('');
    setTags('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Create Team</Text>
            <TouchableOpacity onPress={handleClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.formScroll} keyboardShouldPersistTaps="handled">
            {/* Team Name */}
            <Text style={[styles.label, { color: colors.text }]}>Team Name *</Text>
            <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? '#1E293B' : '#F9FAFB', borderColor: colors.border }]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="e.g. Quantum Coders"
                placeholderTextColor={colors.textMuted}
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Description */}
            <Text style={[styles.label, { color: colors.text, marginTop: 14 }]}>Description / Goal</Text>
            <View style={[styles.textAreaContainer, { backgroundColor: isDarkMode ? '#1E293B' : '#F9FAFB', borderColor: colors.border }]}>
              <TextInput
                style={[styles.textArea, { color: colors.text }]}
                placeholder="What project or hackathon is this team targeting?"
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={3}
                value={description}
                onChangeText={setDescription}
                textAlignVertical="top"
              />
            </View>

            {/* College */}
            <Text style={[styles.label, { color: colors.text, marginTop: 14 }]}>College / University</Text>
            <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? '#1E293B' : '#F9FAFB', borderColor: colors.border }]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="e.g. Stanford University"
                placeholderTextColor={colors.textMuted}
                value={college}
                onChangeText={setCollege}
              />
            </View>

            {/* Max Members */}
            <Text style={[styles.label, { color: colors.text, marginTop: 14 }]}>Max Members (2-6)</Text>
            <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? '#1E293B' : '#F9FAFB', borderColor: colors.border }]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="4"
                placeholderTextColor={colors.textMuted}
                keyboardType="number-pad"
                value={maxMembers}
                onChangeText={setMaxMembers}
              />
            </View>

            {/* Tags */}
            <Text style={[styles.label, { color: colors.text, marginTop: 14 }]}>
              Required Skills / Tags (comma separated)
            </Text>
            <View style={[styles.inputContainer, { backgroundColor: isDarkMode ? '#1E293B' : '#F9FAFB', borderColor: colors.border }]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="React, AI, Python, UI/UX"
                placeholderTextColor={colors.textMuted}
                value={tags}
                onChangeText={setTags}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.createBtn, { backgroundColor: colors.primary }]}
              onPress={handleCreate}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.createBtnText}>Create Team</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
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
    maxHeight: '90%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  formScroll: {
    marginTop: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
  },
  inputContainer: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    justifyContent: 'center',
  },
  input: {
    fontSize: 14,
  },
  textAreaContainer: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    height: 80,
  },
  textArea: {
    fontSize: 14,
    height: '100%',
  },
  createBtn: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
    marginBottom: 30,
  },
  createBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
