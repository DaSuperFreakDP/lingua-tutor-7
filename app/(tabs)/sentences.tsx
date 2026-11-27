import React, { useState, useRef, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  ScrollView,
  Modal,
  Platform,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Speech from "expo-speech";
import Colors from "@/constants/colors";
import { TENSE_NAMES, TenseId } from "@/lib/italian-data";
import { SENTENCES, SentenceExercise } from "@/lib/sentence-data";
import {
  Word,
  CATEGORY_LABELS,
  getVerb,
  parseWords,
  verbOptions,
  modelSentence,
  isCorrectSentence,
  buildWordBank,
  shuffle,
} from "@/lib/sentence-builder";
import { translateConjugation, capitalizeFirst } from "@/lib/english-translation";
import { checkAndRecordStudyDay } from "@/lib/progress-storage";
import StreakBanner from "@/components/StreakBanner";

// Only tenses that have sentences, in the order they appear in the sentence list.
const SENTENCE_TENSES: TenseId[] = Array.from(new Set(SENTENCES.map(s => s.tense)));

type CheckState = "building" | "correct" | "wrong" | "revealed";

interface Deck {
  items: SentenceExercise[];
  index: number;
}

function newDeck(tenses: Set<TenseId>, avoidFirst?: SentenceExercise): Deck {
  const items = shuffle(SENTENCES.filter(s => tenses.has(s.tense)));
  // Don't show the same sentence twice in a row when the deck is reshuffled.
  if (items.length > 1 && items[0] === avoidFirst) items.push(items.shift()!);
  return { items, index: 0 };
}

/** A verb picker is either adding a verb from the word bank or changing a placed one. */
interface PickerTarget {
  verbId: string;
  position: number | null;
}

export default function SentencesScreen() {
  const colorScheme = useColorScheme();
  const theme = colorScheme === "dark" ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();

  const [selectedTenses, setSelectedTenses] = useState<Set<TenseId>>(new Set(SENTENCE_TENSES));
  const [deck, setDeck] = useState<Deck>(() => newDeck(new Set(SENTENCE_TENSES)));
  const [placed, setPlaced] = useState<Word[]>([]);
  const [state, setState] = useState<CheckState>("building");
  const [picker, setPicker] = useState<PickerTarget | null>(null);
  const [score, setScore] = useState({ correct: 0, answered: 0 });
  const [isMuted, setIsMuted] = useState(false);

  const [streakVisible, setStreakVisible] = useState(false);
  const [streakCount, setStreakCount] = useState(0);
  const streakChecked = useRef(false);

  useFocusEffect(useCallback(() => {
    streakChecked.current = false;
  }, []));

  const exercise = deck.items[deck.index];
  const bank = useMemo(() => buildWordBank(exercise), [exercise]);
  const answered = state !== "building";

  const resetAnswer = () => {
    Speech.stop();
    setPlaced([]);
    setState("building");
    setPicker(null);
  };

  const nextSentence = () => {
    resetAnswer();
    setDeck(d => (d.index + 1 < d.items.length
      ? { ...d, index: d.index + 1 }
      : newDeck(selectedTenses, d.items[d.index])));
  };

  const applyTenses = (next: Set<TenseId>) => {
    setSelectedTenses(next);
    setDeck(newDeck(next));
    resetAnswer();
    Haptics.selectionAsync();
  };

  const toggleTense = (tense: TenseId) => {
    const next = new Set(selectedTenses);
    if (next.has(tense)) {
      if (next.size === 1) return;
      next.delete(tense);
    } else {
      next.add(tense);
    }
    applyTenses(next);
  };

  const tapBankWord = (word: Word) => {
    if (answered) return;
    Haptics.selectionAsync();
    if (word.category === "verb") setPicker({ verbId: word.verbId!, position: null });
    else setPlaced(p => [...p, word]);
  };

  const tapPlacedWord = (position: number) => {
    if (answered) return;
    Haptics.selectionAsync();
    const word = placed[position];
    if (word.category === "verb") setPicker({ verbId: word.verbId!, position });
    else setPlaced(p => p.filter((_, i) => i !== position));
  };

  const chooseForm = (word: Word) => {
    if (!picker) return;
    const { position } = picker;
    setPlaced(p => (position === null ? [...p, word] : p.map((old, i) => (i === position ? word : old))));
    setPicker(null);
    Haptics.selectionAsync();
  };

  const removeFromPicker = () => {
    if (!picker || picker.position === null) return;
    const { position } = picker;
    setPlaced(p => p.filter((_, i) => i !== position));
    setPicker(null);
  };

  const speak = (text: string) => {
    Speech.stop();
    // "andato/a" is read as just "andato"
    Speech.speak(text.replace(/\/[ae]\b/g, ""), { language: "it-IT", rate: 0.8 });
  };

  const finish = async (result: Exclude<CheckState, "building">) => {
    setState(result);
    setScore(s => ({ correct: s.correct + (result === "correct" ? 1 : 0), answered: s.answered + 1 }));
    if (!isMuted) speak(modelSentence(exercise));
    if (!streakChecked.current) {
      streakChecked.current = true;
      const streak = await checkAndRecordStudyDay();
      if (streak.shouldCelebrate) {
        setStreakCount(streak.streak);
        setStreakVisible(true);
      }
    }
  };

  const check = () => {
    if (placed.length === 0 || answered) return;
    const correct = isCorrectSentence(exercise, placed);
    Haptics.notificationAsync(correct ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Error);
    finish(correct ? "correct" : "wrong");
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  // Extra room so the last words aren't hidden behind the tab bar.
  const bottomPad = (Platform.OS === "web" ? 34 : insets.bottom) + 96;

  const feedbackColor = state === "correct" ? Colors.palette.success : state === "wrong" ? Colors.palette.error : Colors.palette.gold;
  const feedbackBackground = state === "correct" ? Colors.palette.successLight : state === "wrong" ? Colors.palette.errorLight : Colors.palette.gold + "22";
  const expectedVerbs = parseWords(exercise.it, exercise.tense).filter(w => w.category === "verb");

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <StreakBanner streak={streakCount} visible={streakVisible} onHide={() => setStreakVisible(false)} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: topPad + 16, paddingBottom: bottomPad }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Frasi</Text>
            <Text style={[styles.headerSub, { color: theme.textSecondary }]}>Build the sentence in Italian</Text>
          </View>
          <TouchableOpacity
            onPress={() => { if (!isMuted) Speech.stop(); setIsMuted(!isMuted); Haptics.selectionAsync(); }}
            style={[styles.roundBtn, { backgroundColor: theme.backgroundSecondary }]}
            accessibilityLabel={isMuted ? "Unmute" : "Mute"}
          >
            <Ionicons name={isMuted ? "volume-mute" : "volume-high"} size={18} color={theme.text} />
          </TouchableOpacity>
          <View style={[styles.scoreChip, { backgroundColor: Colors.palette.success + "22" }]}>
            <Text style={[styles.scoreChipText, { color: Colors.palette.success }]}>{score.correct}/{score.answered}</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          <TouchableOpacity
            style={[styles.filterChip, { borderColor: theme.border }]}
            onPress={() => applyTenses(new Set(SENTENCE_TENSES))}
          >
            <Text style={[styles.filterText, { color: theme.tint }]}>All</Text>
          </TouchableOpacity>
          {SENTENCE_TENSES.map(tense => {
            const on = selectedTenses.has(tense);
            return (
              <TouchableOpacity
                key={tense}
                style={[styles.filterChip, { backgroundColor: on ? Colors.palette.wine : theme.backgroundSecondary, borderColor: on ? Colors.palette.wine : theme.border }]}
                onPress={() => toggleTense(tense)}
              >
                <Text style={[styles.filterText, { color: on ? "#FFF" : theme.text }]}>{TENSE_NAMES[tense]}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={[styles.promptCard, { backgroundColor: theme.card }]}>
          <View style={[styles.tensePill, { backgroundColor: Colors.palette.wine + "18" }]}>
            <Text style={[styles.tensePillText, { color: Colors.palette.wine }]}>{TENSE_NAMES[exercise.tense]}</Text>
          </View>
          <Text style={[styles.prompt, { color: theme.text }]}>{exercise.en}</Text>
        </View>

        <View style={[styles.answerBox, { backgroundColor: theme.card, borderColor: answered ? feedbackColor : theme.border }]}>
          {exercise.lead && <Text style={[styles.lead, { color: theme.textSecondary }]}>{exercise.lead}</Text>}
          {placed.map((word, i) => (
            <TouchableOpacity
              key={`${i}-${word.text}`}
              testID="placed-word"
              style={[styles.chip, { backgroundColor: theme.backgroundSecondary, borderColor: word.category === "verb" ? Colors.palette.wine : theme.border }]}
              onPress={() => tapPlacedWord(i)}
              disabled={answered}
            >
              <Text style={[styles.chipText, { color: theme.text }]}>{word.text}</Text>
            </TouchableOpacity>
          ))}
          {placed.length === 0 && (
            <Text style={[styles.placeholder, { color: theme.textMuted }]}>Tap the words below in order</Text>
          )}
        </View>

        {answered && (
          <View style={[styles.feedbackBox, { backgroundColor: feedbackBackground }]}>
            <Ionicons
              name={state === "correct" ? "checkmark-circle" : state === "wrong" ? "close-circle" : "eye-outline"}
              size={20}
              color={feedbackColor}
            />
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={[styles.feedbackTitle, { color: feedbackColor }]}>
                {state === "correct" ? "Perfetto!" : "Correct answer:"}
              </Text>
              <Text style={[styles.feedbackSentence, { color: feedbackColor }]}>{modelSentence(exercise)}</Text>
              {expectedVerbs.map((word, i) => (
                <Text key={i} style={[styles.feedbackSub, { color: feedbackColor }]}>
                  {capitalizeFirst(word.text)} ({getVerb(word.verbId!).infinitive}): "{translateConjugation(getVerb(word.verbId!), exercise.tense, word.person!)}"
                </Text>
              ))}
            </View>
            <TouchableOpacity onPress={() => speak(modelSentence(exercise))} accessibilityLabel="Play sentence">
              <Ionicons name="volume-high-outline" size={20} color={feedbackColor} />
            </TouchableOpacity>
          </View>
        )}

        {!answered ? (
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); finish("revealed"); }}
              accessibilityLabel="Show answer"
            >
              <Ionicons name="eye-outline" size={18} color={theme.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.iconBtn, { backgroundColor: theme.backgroundSecondary, borderColor: theme.border }]}
              onPress={() => { setPlaced([]); Haptics.selectionAsync(); }}
              accessibilityLabel="Clear sentence"
            >
              <Ionicons name="trash-outline" size={18} color={theme.textSecondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.mainBtn, { backgroundColor: Colors.palette.wine, opacity: placed.length ? 1 : 0.5 }]}
              onPress={check}
              disabled={placed.length === 0}
            >
              <Ionicons name="checkmark" size={20} color="#FFF" />
              <Text style={styles.mainBtnText}>Check</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.btnRow}>
            <TouchableOpacity style={[styles.mainBtn, { backgroundColor: Colors.palette.wine }]} onPress={nextSentence}>
              <Text style={styles.mainBtnText}>Next Sentence</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}

        {!answered && bank.map(group => (
          <View key={group.category} style={styles.bankGroup}>
            <Text style={[styles.bankLabel, { color: theme.textMuted }]}>{CATEGORY_LABELS[group.category]}</Text>
            <View style={styles.chipRow}>
              {group.words.map(word => (
                <TouchableOpacity
                  key={word.verbId ?? word.text}
                  testID={`bank-${group.category}`}
                  style={[styles.chip, { backgroundColor: theme.card, borderColor: group.category === "verb" ? Colors.palette.wine : theme.border }]}
                  onPress={() => tapBankWord(word)}
                >
                  <Text style={[styles.chipText, { color: theme.text }]}>{word.text}</Text>
                  {group.category === "verb" && <Ionicons name="chevron-down" size={14} color={Colors.palette.wine} />}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal visible={picker !== null} transparent animationType="slide" onRequestClose={() => setPicker(null)}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.backdrop} onPress={() => setPicker(null)} accessibilityLabel="Close" />
          {picker && (
            <View style={[styles.sheet, { backgroundColor: theme.card, paddingBottom: insets.bottom + 16 }]}>
              <View style={styles.sheetHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.sheetTitle, { color: theme.text }]}>{getVerb(picker.verbId).infinitive}</Text>
                  <Text style={[styles.headerSub, { color: theme.textMuted }]}>{TENSE_NAMES[exercise.tense]} · choose the correct form</Text>
                </View>
                <TouchableOpacity onPress={() => setPicker(null)} style={[styles.roundBtn, { backgroundColor: theme.backgroundSecondary }]}>
                  <Ionicons name="close" size={18} color={theme.text} />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.optionList} showsVerticalScrollIndicator persistentScrollbar>
                {verbOptions(getVerb(picker.verbId), exercise.tense).map(option => (
                  <TouchableOpacity
                    key={option.person}
                    testID="verb-option"
                    style={[styles.option, { borderBottomColor: theme.separator }]}
                    onPress={() => chooseForm({ text: option.form, category: "verb", verbId: picker.verbId, person: option.person })}
                  >
                    <Text style={[styles.optionText, { color: theme.text }]}>{option.form}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {picker.position !== null && (
                <TouchableOpacity style={styles.removeBtn} onPress={removeFromPicker}>
                  <Ionicons name="trash-outline" size={16} color={Colors.palette.error} />
                  <Text style={[styles.removeText, { color: Colors.palette.error }]}>Remove from sentence</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 14 },
  headerRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerTitle: { fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.5 },
  headerSub: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  roundBtn: { width: 36, height: 36, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  scoreChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  scoreChipText: { fontSize: 15, fontFamily: "Inter_700Bold" },
  filterRow: { gap: 8 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1 },
  filterText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  promptCard: { borderRadius: 20, padding: 20, gap: 12, shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },
  tensePill: { alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  tensePillText: { fontSize: 11, fontFamily: "Inter_600SemiBold", letterSpacing: 0.3 },
  prompt: { fontSize: 21, lineHeight: 29, fontFamily: "Inter_600SemiBold" },
  answerBox: { minHeight: 70, borderRadius: 14, borderWidth: 2, borderStyle: "dashed", padding: 12, flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 },
  lead: { fontSize: 16, fontFamily: "Inter_600SemiBold" },
  placeholder: { fontSize: 14, fontFamily: "Inter_400Regular" },
  chip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12, borderWidth: 1 },
  chipText: { fontSize: 16, fontFamily: "Inter_500Medium" },
  chipRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  bankGroup: { gap: 8 },
  bankLabel: { fontSize: 10, fontFamily: "Inter_600SemiBold", textTransform: "uppercase", letterSpacing: 0.5 },
  feedbackBox: { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12 },
  feedbackTitle: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  feedbackSentence: { fontSize: 18, fontFamily: "Inter_700Bold" },
  feedbackSub: { fontSize: 13, fontFamily: "Inter_500Medium" },
  btnRow: { flexDirection: "row", gap: 10 },
  iconBtn: { width: 54, height: 54, borderRadius: 14, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  mainBtn: { flex: 1, height: 54, borderRadius: 14, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  mainBtnText: { color: "#FFF", fontSize: 16, fontFamily: "Inter_600SemiBold" },
  modalRoot: { flex: 1, justifyContent: "flex-end" },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.4)" },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingTop: 18, gap: 10 },
  sheetHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  sheetTitle: { fontSize: 22, fontFamily: "Inter_700Bold" },
  // Shows about five and a half rows, so it is clear the list scrolls.
  optionList: { maxHeight: 286 },
  option: { height: 52, alignItems: "center", justifyContent: "center", borderBottomWidth: 1 },
  optionText: { fontSize: 18, fontFamily: "Inter_500Medium" },
  removeBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10 },
  removeText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
