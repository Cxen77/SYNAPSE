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
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import client from '../../api/client';

export default function ImportEventModal({ visible, onClose, onImported }) {
  const { colors, isDarkMode } = useTheme();

  const [url, setUrl] = useState('');
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [scrapedData, setScrapedData] = useState(null);
  const [isDuplicate, setIsDuplicate] = useState(false);

  const handleFetch = async () => {
    if (!url.trim()) {
      Alert.alert('Required', 'Please paste an event link from Unstop, Devfolio, Devpost, etc.');
      return;
    }

    setParsing(true);
    setScrapedData(null);
    setIsDuplicate(false);

    try {
      const { data } = await client.post('/events/parse-external-link', { url: url.trim() });
      if (data.success) {
        setScrapedData(data.data);
        setIsDuplicate(data.isDuplicate);
      }
    } catch (err) {
      Alert.alert(
        'Fetch Error',
        err.response?.data?.message || 'Could not fetch event details. Please verify the URL.'
      );
    } finally {
      setParsing(false);
    }
  };

  const handleImport = async () => {
    if (!scrapedData) return;

    setImporting(true);
    try {
      const { data } = await client.post('/events/import-external', scrapedData);
      Alert.alert('Imported!', 'Event has been added to Synapse successfully.');
      onImported && onImported(data.event);
      handleClose();
    } catch (err) {
      Alert.alert('Import Failed', err.response?.data?.message || 'Could not import event.');
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setUrl('');
    setScrapedData(null);
    setIsDuplicate(false);
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
            <View style={styles.headerTitleRow}>
              <Ionicons name="link" size={20} color={colors.primary} style={{ marginRight: 8 }} />
              <Text style={[styles.headerTitle, { color: colors.text }]}>Import External Event</Text>
            </View>
            <TouchableOpacity onPress={handleClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} keyboardShouldPersistTaps="handled">
            <Text style={[styles.instruction, { color: colors.textSecondary }]}>
              Paste a hackathon link from Unstop, Devfolio, Devpost, HackerEarth, or MLH to automatically import all details.
            </Text>

            {/* Input Row */}
            <View style={[styles.inputRow, { backgroundColor: isDarkMode ? '#1E293B' : '#F9FAFB', borderColor: colors.border }]}>
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="https://unstop.com/hackathons/..."
                placeholderTextColor={colors.textMuted}
                value={url}
                onChangeText={setUrl}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={[styles.fetchBtn, { backgroundColor: colors.primary }]}
                onPress={handleFetch}
                disabled={parsing || !url.trim()}
              >
                {parsing ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.fetchBtnText}>Fetch</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Scraped Result Card */}
            {scrapedData ? (
              <View style={[styles.previewCard, { borderColor: colors.border, backgroundColor: isDarkMode ? '#1E293B' : '#F9FAFB' }]}>
                {scrapedData.imageUrl ? (
                  <Image
                    source={{ uri: scrapedData.imageUrl }}
                    style={styles.previewBanner}
                    contentFit="cover"
                  />
                ) : null}

                <View style={styles.previewBody}>
                  <View style={styles.platformBadge}>
                    <Text style={styles.platformText}>{scrapedData.platform || 'External'}</Text>
                  </View>

                  <Text style={[styles.previewTitle, { color: colors.text }]}>
                    {scrapedData.title}
                  </Text>

                  {scrapedData.description ? (
                    <Text style={[styles.previewDesc, { color: colors.textSecondary }]} numberOfLines={3}>
                      {scrapedData.description}
                    </Text>
                  ) : null}

                  {/* Metadata Chips */}
                  <View style={styles.chipsRow}>
                    {scrapedData.date ? (
                      <View style={[styles.chip, { backgroundColor: colors.card }]}>
                        <Ionicons name="calendar-outline" size={13} color={colors.primary} />
                        <Text style={[styles.chipText, { color: colors.text }]}>
                          {new Date(scrapedData.date).toLocaleDateString()}
                        </Text>
                      </View>
                    ) : null}

                    {scrapedData.prizes ? (
                      <View style={[styles.chip, { backgroundColor: '#FEF3C7' }]}>
                        <Ionicons name="trophy-outline" size={13} color="#D97706" />
                        <Text style={[styles.chipText, { color: '#B45309' }]}>
                          {scrapedData.prizes}
                        </Text>
                      </View>
                    ) : null}

                    <View style={[styles.chip, { backgroundColor: colors.card }]}>
                      <Ionicons name="people-outline" size={13} color={colors.textSecondary} />
                      <Text style={[styles.chipText, { color: colors.text }]}>
                        Team: {scrapedData.minTeamSize || 1}-{scrapedData.maxTeamSize || 4}
                      </Text>
                    </View>
                  </View>

                  {isDuplicate ? (
                    <View style={styles.duplicateWarning}>
                      <Ionicons name="alert-circle" size={16} color="#DC2626" />
                      <Text style={styles.duplicateWarningText}>
                        This event URL has already been imported on Synapse.
                      </Text>
                    </View>
                  ) : null}

                  {/* Confirm Button */}
                  <TouchableOpacity
                    style={[
                      styles.importConfirmBtn,
                      { backgroundColor: isDuplicate ? colors.border : colors.primary },
                    ]}
                    onPress={handleImport}
                    disabled={importing || isDuplicate}
                  >
                    {importing ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text style={styles.importConfirmBtnText}>
                        {isDuplicate ? 'Already Imported' : 'Import to Synapse'}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            ) : null}
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
    maxHeight: '85%',
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
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  scrollArea: {
    marginTop: 14,
  },
  instruction: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    padding: 6,
    paddingLeft: 12,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    fontSize: 14,
    height: 42,
  },
  fetchBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  fetchBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  previewCard: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 24,
  },
  previewBanner: {
    width: '100%',
    height: 150,
    backgroundColor: '#E5E7EB',
  },
  previewBody: {
    padding: 16,
  },
  platformBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#2563EB',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  platformText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  previewDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '600',
  },
  duplicateWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEE2E2',
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
  },
  duplicateWarningText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  importConfirmBtn: {
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  importConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
