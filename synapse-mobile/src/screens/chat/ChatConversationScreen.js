import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '../../components/common/Header';
import Avatar from '../../components/common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { useTheme } from '../../context/ThemeContext';
import client from '../../api/client';

export default function ChatConversationScreen({ route }) {
  const { chatId, title } = route.params || {};
  const { currentUser } = useAuth();
  const { socket } = useSocket();
  const { colors, isDarkMode } = useTheme();

  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const flatListRef = useRef(null);

  useEffect(() => {
    fetchMessages();
  }, [chatId]);

  // Real-time socket message listener
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMsg) => {
      const msgChatId = newMsg.chatId?._id || newMsg.chatId;
      if (msgChatId === chatId) {
        setMessages((prev) => [...prev, newMsg]);
      }
    };

    socket.on('message:new', handleNewMessage);
    return () => {
      socket.off('message:new', handleNewMessage);
    };
  }, [socket, chatId]);

  const fetchMessages = async () => {
    try {
      const { data } = await client.get(`/messages/${chatId}`);
      setMessages(Array.isArray(data) ? data : data.messages || []);
    } catch (err) {
      console.log('Error fetching messages', err?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const textToSend = inputText.trim();
    setInputText('');
    setSending(true);

    try {
      const { data } = await client.post('/messages', {
        chatId,
        content: textToSend,
      });

      setMessages((prev) => [...prev, data]);
    } catch (err) {
      console.log('Error sending message', err?.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Header showBack title={title || 'Chat'} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item._id || String(Math.random())}
            contentContainerStyle={styles.listContent}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
            renderItem={({ item }) => {
              const senderId = item.sender?._id || item.senderId?._id || item.sender || item.senderId;
              const isMine = senderId === currentUser?._id;

              return (
                <View
                  style={[
                    styles.messageBubbleRow,
                    isMine ? styles.myMessageRow : styles.otherMessageRow,
                  ]}
                >
                  <View
                    style={[
                      styles.messageBubble,
                      isMine
                        ? [styles.myBubble, { backgroundColor: colors.primary }]
                        : [styles.otherBubble, { backgroundColor: colors.card, borderColor: colors.border }],
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        { color: isMine ? '#FFFFFF' : colors.text },
                      ]}
                    >
                      {item.content || item.text}
                    </Text>

                    <Text
                      style={[
                        styles.messageTime,
                        { color: isMine ? 'rgba(255,255,255,0.7)' : colors.textMuted },
                      ]}
                    >
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : ''}
                    </Text>
                  </View>
                </View>
              );
            }}
          />
        )}

        {/* Input Bar */}
        <View style={[styles.inputBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: isDarkMode ? '#1E293B' : '#F9FAFB',
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            placeholder="Type a message..."
            placeholderTextColor={colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
          />

          <TouchableOpacity
            style={[styles.sendBtn, { backgroundColor: colors.primary }]}
            onPress={handleSend}
            disabled={sending || !inputText.trim()}
          >
            <Ionicons name="send" size={17} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 10,
  },
  messageBubbleRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  myMessageRow: {
    justifyContent: 'flex-end',
  },
  otherMessageRow: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  myBubble: {
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 14.5,
    lineHeight: 20,
  },
  messageTime: {
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 4,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  input: {
    flex: 1,
    maxHeight: 90,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 14.5,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
