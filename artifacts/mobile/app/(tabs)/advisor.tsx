import React, { useState, useRef } from 'react';
import {
  View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, KeyboardAvoidingView,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { NuveText } from '@/components/NuveText';
import { useStrings } from '@/hooks/useStrings';

interface Message {
  id: string;
  role: 'user' | 'advisor';
  text: string;
  time: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    role: 'advisor',
    text: "Hello! I'm Sarah, your dedicated Nuve investment advisor. I'm here to help you with personalized investment guidance, goal planning, and portfolio questions. How can I assist you today?",
    time: '10:00 AM',
  },
];

const QUICK_QUESTIONS = [
  "How is my portfolio performing?",
  "Should I rebalance now?",
  "What's the best way to reach my home goal?",
  "Explain treasury bills to me",
];

export default function AdvisorScreen() {
  const insets = useSafeAreaInsets();
  const s = useStrings();
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const isWeb = Platform.OS === 'web';
  const topPad = isWeb ? 67 : insets.top;
  const botPad = isWeb ? 34 : insets.bottom;

  const ADVISOR_RESPONSES: Record<string, string> = {
    "How is my portfolio performing?": "Your portfolio has returned +17.3% over the past year, significantly outperforming the EGX30 benchmark of +12.1%. Your Dream Home goal is progressing well at 17% of target. I'd recommend maintaining your current allocation given the strong performance.",
    "Should I rebalance now?": "Yes, your Dream Home portfolio has drifted 6.2% from its target allocation. I've already prepared a rebalancing proposal in your Portfolio tab. The trades will cost just EGP 28 in fees — well below the industry average. I'd recommend approving it soon.",
    "What's the best way to reach my home goal?": "To reach your EGP 2M home goal by 2030, I recommend increasing your monthly contribution from EGP 5,000 to EGP 7,500. This puts you on track for 100% completion by May 2030 with a projected portfolio value of EGP 2.1M. You can model this in the Scenarios tab.",
    "Explain treasury bills to me": "Treasury bills (T-bills) are short-term Egyptian government debt instruments, currently yielding 27.5% annually. They're considered risk-free as they're backed by the government, making them ideal for capital preservation. The minimum investment is EGP 10,000 and they mature in 91, 182, or 364 days.",
  };

  const sendMessage = (text: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const now = new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });
    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
      time: now,
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const response = ADVISOR_RESPONSES[text] ||
        "Thank you for your question. Based on your current portfolio and goals, I'll need to review the latest market data to give you the most accurate advice. I'll have a comprehensive response ready within the hour. In the meantime, you can check the Insights tab for the latest market pulse.";
      const advisorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'advisor',
        text: response,
        time: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, advisorMsg]);
      setIsTyping(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }, 1500);

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <View style={[styles.screen, { paddingTop: topPad }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.advisorInfo}>
          <View style={styles.advisorAvatar}>
            <NuveText variant="body" weight="bold" color={Colors.white}>S</NuveText>
          </View>
          <View>
            <NuveText variant="h3" weight="semibold" family="display">Sarah Al-Rashid</NuveText>
            <View style={styles.onlineRow}>
              <View style={styles.onlineDot} />
              <NuveText variant="caption" color={Colors.success}>Available now</NuveText>
            </View>
          </View>
        </View>
        <View style={styles.headerRight}>
          <NuveText variant="caption" color={Colors.slate}>Senior Advisor</NuveText>
          <View style={styles.acumenBadge}>
            <Feather name="award" size={10} color={Colors.gold} />
            <NuveText variant="caption" weight="bold" color={Colors.gold}>Nuve</NuveText>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={0}>
        <ScrollView
          ref={scrollRef}
          style={styles.messages}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map(msg => (
            <View
              key={msg.id}
              style={[styles.bubble, msg.role === 'user' ? styles.userBubble : styles.advisorBubble]}
            >
              {msg.role === 'advisor' && (
                <View style={styles.advisorMini}>
                  <NuveText variant="caption" weight="bold" color={Colors.white}>S</NuveText>
                </View>
              )}
              <View style={[styles.bubbleContent, msg.role === 'user' ? styles.userContent : styles.advisorContent]}>
                <NuveText
                  variant="body"
                  color={msg.role === 'user' ? Colors.white : Colors.textPrimary}
                  style={{ lineHeight: 22 }}
                >
                  {msg.text}
                </NuveText>
                <NuveText
                  variant="caption"
                  color={msg.role === 'user' ? Colors.white + '80' : Colors.textMuted}
                  style={{ marginTop: 4 }}
                >
                  {msg.time}
                </NuveText>
              </View>
            </View>
          ))}
          {isTyping && (
            <View style={[styles.bubble, styles.advisorBubble]}>
              <View style={styles.advisorMini}>
                <NuveText variant="caption" weight="bold" color={Colors.white}>S</NuveText>
              </View>
              <View style={styles.typingDots}>
                <View style={styles.dot} />
                <View style={[styles.dot, { opacity: 0.6 }]} />
                <View style={[styles.dot, { opacity: 0.3 }]} />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Quick Questions */}
        {messages.length === 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickQs} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
            {QUICK_QUESTIONS.map((q, i) => (
              <TouchableOpacity key={i} style={styles.quickQ} onPress={() => sendMessage(q)}>
                <NuveText variant="caption" weight="medium" color={Colors.teal}>{q}</NuveText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Input */}
        <View style={[styles.inputRow, { paddingBottom: botPad + 8 }]}>
          <TextInput
            style={styles.textInput}
            placeholder="Ask your advisor..."
            placeholderTextColor={Colors.textMuted}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[styles.sendBtn, { opacity: input.trim().length > 0 ? 1 : 0.4 }]}
            onPress={() => input.trim() && sendMessage(input.trim())}
            disabled={!input.trim()}
          >
            <Feather name="send" size={18} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  advisorInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  advisorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.midnight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  onlineDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.success },
  headerRight: { alignItems: 'flex-end', gap: 4 },
  acumenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.gold + '20',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  messages: { flex: 1 },
  messagesContent: { padding: 16, gap: 12 },
  bubble: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  userBubble: { justifyContent: 'flex-end' },
  advisorBubble: { justifyContent: 'flex-start' },
  advisorMini: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.midnight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleContent: {
    maxWidth: '80%',
    borderRadius: 20,
    padding: 16,
  },
  userContent: {
    backgroundColor: Colors.midnight,
    borderBottomRightRadius: 4,
  },
  advisorContent: {
    backgroundColor: Colors.white,
    borderBottomLeftRadius: 4,
    shadowColor: Colors.midnight,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 1,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 16,
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.teal,
  },
  quickQs: { marginBottom: 8 },
  quickQ: {
    backgroundColor: Colors.teal + '12',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.teal + '30',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  textInput: {
    flex: 1,
    fontFamily: 'DMSans_400Regular',
    fontSize: 15,
    color: Colors.textPrimary,
    maxHeight: 100,
    minHeight: 44,
    backgroundColor: Colors.gray50,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.teal,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
