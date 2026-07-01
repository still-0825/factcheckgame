import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, BookOpen, AlertTriangle, CheckCircle, HelpCircle, ArrowRight, RefreshCw, Volume2, VolumeX, X, Link as LinkIcon, Heart, Lock, Play, ArrowLeft } from "lucide-react";
import { chaptersData, Dialogue, Evidence, WebPage } from "./data/chaptersData";

// Web Audio API Retro Synth for 16-bit sound effects
class SoundEngine {
  private ctx: AudioContext | null = null;
  public muted: boolean = false;

  private initCtx() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  playTone(freq: number, type: OscillatorType, duration: number, delay: number = 0) {
    if (this.muted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + delay);
      
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime + delay);
      gain.gain.exponentialRampToValueAtTime(0.00001, this.ctx.currentTime + delay + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + delay);
      osc.stop(this.ctx.currentTime + delay + duration);
    } catch (e) {
      console.warn("Audio Context error:", e);
    }
  }

  playClick() {
    this.playTone(800, "square", 0.05);
  }

  playTextBeep() {
    // Soft short blip for text typewriter sound
    this.playTone(600, "sine", 0.03);
  }

  playIncorrect() {
    // Low double beep
    this.playTone(180, "sawtooth", 0.15);
    this.playTone(120, "sawtooth", 0.2, 0.12);
  }

  playCorrect() {
    // Upward chime
    this.playTone(523.25, "sine", 0.1); // C5
    this.playTone(659.25, "sine", 0.1, 0.08); // E5
    this.playTone(783.99, "sine", 0.1, 0.16); // G5
    this.playTone(1046.5, "sine", 0.25, 0.24); // C6
  }

  playEvidenceGathered() {
    // Retro level-up sub chime
    this.playTone(440, "triangle", 0.1);
    this.playTone(554.37, "triangle", 0.1, 0.08);
    this.playTone(659.25, "triangle", 0.15, 0.16);
  }

  playGameSuccess() {
    // Upward scale
    const notes = [523, 587, 659, 698, 784, 880, 987, 1046];
    notes.forEach((freq, idx) => {
      this.playTone(freq, "triangle", 0.15, idx * 0.1);
    });
  }
}

const sounds = new SoundEngine();

interface ConnectionDef {
  fromIndex: number;
  toIndex: number;
  pathD: string;
  labelX: number;
  labelY: number;
  label: string;
  colorClass: string;
  strokeColor: string;
}

const chapterConnections: Record<number, ConnectionDef[]> = {
  1: [
    {
      fromIndex: 0,
      toIndex: 1,
      pathD: "M 180 110 L 720 110",
      labelX: 400,
      labelY: 92,
      label: "⚡ 矛盾",
      colorClass: "bg-rose-600 border-rose-300 text-white",
      strokeColor: "#ef4444"
    },
    {
      fromIndex: 1,
      toIndex: 2,
      pathD: "M 720 110 L 450 330",
      labelX: 535,
      labelY: 202,
      label: "✓ 裏付け",
      colorClass: "bg-emerald-600 border-emerald-300 text-white",
      strokeColor: "#10b981"
    }
  ],
  2: [
    {
      fromIndex: 0,
      toIndex: 1,
      pathD: "M 180 110 L 720 110",
      labelX: 400,
      labelY: 92,
      label: "✓ 裏付け",
      colorClass: "bg-emerald-600 border-emerald-300 text-white",
      strokeColor: "#10b981"
    },
    {
      fromIndex: 1,
      toIndex: 2,
      pathD: "M 720 110 L 450 330",
      labelX: 535,
      labelY: 202,
      label: "✓ 裏付け",
      colorClass: "bg-emerald-600 border-emerald-300 text-white",
      strokeColor: "#10b981"
    }
  ],
  3: [
    {
      fromIndex: 0,
      toIndex: 1,
      pathD: "M 180 110 L 720 110",
      labelX: 400,
      labelY: 92,
      label: "✓ 裏付け",
      colorClass: "bg-emerald-600 border-emerald-300 text-white",
      strokeColor: "#10b981"
    }
  ],
  4: [
    {
      fromIndex: 0,
      toIndex: 1,
      pathD: "M 180 110 L 720 110",
      labelX: 400,
      labelY: 92,
      label: "🔗 関連",
      colorClass: "bg-emerald-600 border-emerald-300 text-white",
      strokeColor: "#10b981"
    },
    {
      fromIndex: 1,
      toIndex: 2,
      pathD: "M 720 110 L 450 330",
      labelX: 535,
      labelY: 202,
      label: "🔗 関連",
      colorClass: "bg-emerald-600 border-emerald-300 text-white",
      strokeColor: "#10b981"
    },
    {
      fromIndex: 0,
      toIndex: 2,
      pathD: "M 180 110 L 450 330",
      labelX: 265,
      labelY: 202,
      label: "🔗 関連",
      colorClass: "bg-emerald-600 border-emerald-300 text-white",
      strokeColor: "#10b981"
    }
  ]
};

// --- Types & Constants ---
type GameState =
  | "TITLE"
  | "CHAPTER_SELECT"
  | "CHAPTER_CLEAR_CHOICE"
  | "CHAPTER_INTRO"
  | "STORY_OPENING"
  | "BROWSER_SEARCH"
  | "BOARD_TRIGGER_CONVERSATION"
  | "DEDUCTION_PART"
  | "EXPLANATION_SHEET"
  | "STORY_EPILOGUE"
  | "CREDITS";

// Fixed Pixel Concepts Images
const AVATAR_IMAGES = {
  ren: "/src/assets/images/ren_young_pixel_1782282787763.jpg",
  aoi: "/src/assets/images/aoi_clean_pixel_1782282803962.jpg",
  takashi: "/src/assets/images/character_pixel_concept_1782279857351.jpg",
  haruto: "/src/assets/images/character_pixel_concept_1782279857351.jpg",
  joe: "/src/assets/images/character_pixel_concept_1782279857351.jpg",
  sato: "/src/assets/images/character_pixel_concept_1782279857351.jpg",
  system: ""
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>("TITLE");
  const [currentChapter, setCurrentChapter] = useState(1);
  const [maxUnlockedChapter, setMaxUnlockedChapter] = useState<number>(() => {
    const saved = localStorage.getItem("factchecker_max_unlocked");
    return saved ? parseInt(saved, 10) : 1;
  });

  const resetChapterStates = () => {
    setSearchQuery("");
    setSearchResults([]);
    setOpenedPages([]);
    setGatheredEvidences([]);
    setShowEvidenceBoardOverlay(false);
    setSelectedClaimId(null);
    setSelectedEvidenceId(null);
    setLives(3);
    setActiveTab("sns");
    setIsDeductionTriggered(false);
    setCurrentDialogueIndex(0);
  };

  const [currentDialogueIndex, setCurrentDialogueIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [openedPages, setOpenedPages] = useState<string[]>([]);
  const [gatheredEvidences, setGatheredEvidences] = useState<Evidence[]>([]);
  const [showEvidenceBoardOverlay, setShowEvidenceBoardOverlay] = useState(false);
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(null);
  const [lives, setLives] = useState(3);
  const [isMuted, setIsMuted] = useState(false);
  const [activeTab, setActiveTab] = useState<"sns" | "search">("sns");
  const [isTyping, setIsTyping] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [isDeductionTriggered, setIsDeductionTriggered] = useState(false);

  // Evidence Dialogues types and state
  const [activeEvidenceDialogue, setActiveEvidenceDialogue] = useState<{
    evidenceId: string;
    lines: Dialogue[];
    currentIndex: number;
  } | null>(null);
  const [evidenceTypedText, setEvidenceTypedText] = useState("");
  const [isEvidenceTyping, setIsEvidenceTyping] = useState(false);
  const evidenceTypingTimerRef = useRef<any>(null);

  // Typewriter effect ref
  const typingTimerRef = useRef<any>(null);
  const browserRef = useRef<HTMLDivElement | null>(null);

  // Sound Muting handler
  const toggleMute = () => {
    sounds.muted = !sounds.muted;
    setIsMuted(sounds.muted);
  };

  // Dynamically computed dialogue list for the current chapter
  const currentChapterData = chaptersData[currentChapter] || chaptersData[1];

  const ev0 = currentChapterData.evidenceList[0];
  const ev1 = currentChapterData.evidenceList[1];
  const ev2 = currentChapterData.evidenceList[2];

  const openingDialogues = currentChapterData.introDialogues;
  const matchDialogues = currentChapterData.matchDialogues;
  const evidenceDialoguesMap = currentChapterData.evidenceDialogues;

  const epilogueDialogues: Dialogue[] = currentChapter === 4 ? [
    { char: "レン", text: "サトウを告発できて本当に良かった……。僕たちの街のパニックもこれで収まるね。", avatar: "ren" },
    { char: "レン", text: "それにしても、ネットの情報って本当に怖いんだね。", avatar: "ren" },
    { char: "レン", text: "僕、これまでは『みんなが言ってるから』『面白そうだから』って理由だけで、SNSを信じ込んで拡散してたよ……。", avatar: "ren" },
    { char: "レン", text: "傷つける手伝いになってたかもしれないんだなって気付いたよ。", avatar: "ren" },
    { char: "レン", text: "これからは、安易に信じてシェアする前に、一度立ち止まって、自分で裏づけとなる一次情報をしっかり調べるようにするよ！", avatar: "ren" },
    { char: "アオイ", text: "ふふ、レン、本当に成長したわね。情報社会を生きる私たちには、そういう自覚が何より大切なのよ。", avatar: "aoi" },
    { char: "レン", text: "それにさ……今回、アオイが隣にいて、調べ方を優しく教えてくれなかったら、僕は今でもデマに踊らされたままだったよ。", avatar: "ren" },
    { char: "レン", text: "真実を見抜く目を教えてくれたのは、アオイんだ。本当に、本当にありがとう！", avatar: "ren" },
    { char: "アオイ", text: "もう、急に真面目になっちゃって……。ちょっと照れるじゃない。", avatar: "aoi" },
    { char: "アオイ", text: "でも、レンがそうやって真剣に成長してくれたなら、私の教え甲斐もあったってものよ。", avatar: "aoi" },
    { char: "アオイ", text: "さあ、これからもネットの海を渡る時は、二人で一緒にね！", avatar: "aoi" }
  ] : currentChapter === 3 ? [
    { char: "レン", text: "ジョーが騙されずに済んで本当に良かった……！ディープフェイク動画の仕組み、恐ろしいね。", avatar: "ren" },
    { char: "レン", text: "動画や本人の声だから本物だなんて、もう信じちゃいけない時代なんだな。", avatar: "ren" },
    { char: "アオイ", text: "その通りよ、レン。これからは『本人の口から喋っている動画』すら、一次データと比較して、科学的な検証やフル会見をチェックする必要があるわ。", avatar: "aoi" },
    { char: "レン", text: "でも、こうしてデマを見破る力がついてくると、ちょっと楽しくなってきたよ！", avatar: "ren" },
    { char: "アオイ", text: "その調子よ！でも、まだすべての事件が終わったわけじゃないわ。次も気合を入れていきましょう！", avatar: "aoi" }
  ] : currentChapter === 2 ? [
    { char: "レン", text: "ハルトがパニックにならずに済んで本当に良かった……。", avatar: "ren" },
    { char: "レン", text: "災害のときは不安で、ついみんなに危険を知らせなきゃって、不確かな情報を拡散しがちだよね。", avatar: "ren" },
    { char: "アオイ", text: "そう、それが災害デマの拡散する最大の原因なの。パニックの時こそ、一歩引いて公的機関の一次データを見る冷静さが求められるわ。", avatar: "aoi" },
    { char: "レン", text: "うん！すごく勉強になったよ！", avatar: "ren" },
    { char: "アオイ", text: "よし、この調子で次のデマも暴きに行きましょう！", avatar: "aoi" }
  ] : [
    { char: "レン", text: "タカシがデマに騙されずに済んで本当に良かった……。", avatar: "ren" },
    { char: "レン", text: "それにしても、ネットの情報って本当に怖いんだね。", avatar: "ren" },
    { char: "レン", text: "僕、これまでは『みんなが言ってるから』って理由だけで、SNSを信じ込んで拡散してたよ……。", avatar: "ren" },
    { char: "レン", text: "大切な人を傷つける手伝いになってたかもしれないんだなって気付いたよ。", avatar: "ren" },
    { char: "レン", text: "これからは、安易に信じてシェアする前に、一度立ち止まって、自分でしっかり調べるようにするよ！", avatar: "ren" },
    { char: "アオイ", text: "ふふ、分かってくれたなら嬉しいわ。", avatar: "aoi" },
    { char: "アオイ", text: "情報を発信する側にも責任があるんだから、私たちももっと賢くならなきゃね。", avatar: "aoi" },
    { char: "アオイ", text: "さあ、これからもネットの海を渡る時は、二人で一緒にね！", avatar: "aoi" }
  ];

  // Aoi's soft guidance dialogue when failing in deduction
  const [aoiGuidanceActive, setAoiGuidanceActive] = useState(false);
  const aoiGuidanceText = currentChapterData.deduction.softGuidance;

  // Typewriter effect implementation
  const currentDialogueList = 
    gameState === "STORY_OPENING" ? openingDialogues : 
    gameState === "BOARD_TRIGGER_CONVERSATION" ? matchDialogues : 
    gameState === "STORY_EPILOGUE" ? epilogueDialogues : [];

  const currentDialogue = currentDialogueList[currentDialogueIndex];

  useEffect(() => {
    if (!currentDialogue) return;

    setIsTyping(true);
    setTypedText("");

    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }

    let currentText = currentDialogue.text;
    let index = 0;

    const tick = () => {
      setTypedText(currentText.slice(0, index + 1));
      sounds.playTextBeep();
      index++;
      if (index < currentText.length) {
        typingTimerRef.current = setTimeout(tick, 45);
      } else {
        setIsTyping(false);
      }
    };

    typingTimerRef.current = setTimeout(tick, 45);

    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
    };
  }, [currentDialogueIndex, gameState]);

  // Click single dialogue line forward
  const nextDialogue = () => {
    if (isTyping) {
      // Skip typing and show full text immediately
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
      setTypedText(currentDialogue.text);
      setIsTyping(false);
      sounds.playClick();
      return;
    }

    sounds.playClick();
    if (currentDialogueIndex < currentDialogueList.length - 1) {
      setCurrentDialogueIndex(currentDialogueIndex + 1);
    } else {
      // Transition to next state
      if (gameState === "STORY_OPENING") {
        setGameState("BROWSER_SEARCH");
      } else if (gameState === "BOARD_TRIGGER_CONVERSATION") {
        setShowEvidenceBoardOverlay(true); // Auto show board matching
        setGameState("DEDUCTION_PART");
      } else if (gameState === "STORY_EPILOGUE") {
        if (currentChapter < 4) {
          const nextChap = currentChapter + 1;
          if (nextChap > maxUnlockedChapter) {
            setMaxUnlockedChapter(nextChap);
            localStorage.setItem("factchecker_max_unlocked", String(nextChap));
          }
          setGameState("CHAPTER_CLEAR_CHOICE");
        } else {
          setGameState("CREDITS");
        }
      }
      setCurrentDialogueIndex(0);
    }
  };

  // Typewriter effect for evidence gathering dialogues
  useEffect(() => {
    if (!activeEvidenceDialogue) return;

    const currentLine = activeEvidenceDialogue.lines[activeEvidenceDialogue.currentIndex];
    if (!currentLine) return;

    setIsEvidenceTyping(true);
    setEvidenceTypedText("");

    if (evidenceTypingTimerRef.current) {
      clearTimeout(evidenceTypingTimerRef.current);
    }

    let currentText = currentLine.text;
    let index = 0;

    const tick = () => {
      setEvidenceTypedText(currentText.slice(0, index + 1));
      sounds.playTextBeep();
      index++;
      if (index < currentText.length) {
        evidenceTypingTimerRef.current = setTimeout(tick, 45);
      } else {
        setIsEvidenceTyping(false);
      }
    };

    evidenceTypingTimerRef.current = setTimeout(tick, 45);

    return () => {
      if (evidenceTypingTimerRef.current) {
        clearTimeout(evidenceTypingTimerRef.current);
      }
    };
  }, [activeEvidenceDialogue?.currentIndex, activeEvidenceDialogue?.evidenceId]);

  // Advance evidence dialogue
  const nextEvidenceDialogue = () => {
    if (!activeEvidenceDialogue) return;

    const currentLine = activeEvidenceDialogue.lines[activeEvidenceDialogue.currentIndex];

    if (isEvidenceTyping) {
      // Skip typing and show full text immediately
      if (evidenceTypingTimerRef.current) {
        clearTimeout(evidenceTypingTimerRef.current);
      }
      setEvidenceTypedText(currentLine.text);
      setIsEvidenceTyping(false);
      sounds.playClick();
      return;
    }

    sounds.playClick();
    const nextIndex = activeEvidenceDialogue.currentIndex + 1;
    if (nextIndex < activeEvidenceDialogue.lines.length) {
      setActiveEvidenceDialogue({
        ...activeEvidenceDialogue,
        currentIndex: nextIndex
      });
    } else {
      // Dialogue finished! Check if we should trigger the main board matching phase
      const finishedId = activeEvidenceDialogue.evidenceId;
      setActiveEvidenceDialogue(null);

      // Check if ALL evidences for the current chapter are gathered
      const chapterEvidenceIds = currentChapterData.evidenceList.map((e) => e.id);
      const isAllGathered = chapterEvidenceIds.every((id) => 
        gatheredEvidences.some((ge) => ge.id === id) || finishedId === id
      );
      
      if (isAllGathered && !isDeductionTriggered) {
        setIsDeductionTriggered(true);
        setTimeout(() => {
          setGameState("BOARD_TRIGGER_CONVERSATION");
          setCurrentDialogueIndex(0);
        }, 800);
      }
    }
  };

  // Helper: Make keywords within a text block clickable and styled as a badge-like underline
  const renderHighlightedText = (text: string, keywords: { word: string }[]) => {
    if (!keywords || keywords.length === 0) return text;
    
    // Sort keywords by length in descending order to avoid matching partial substrings first
    const sortedKeywords = [...keywords].sort((a, b) => b.word.length - a.word.length);
    
    // Escape special regex chars
    const escapedWords = sortedKeywords.map(k => k.word.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
    const regex = new RegExp(`(${escapedWords.join('|')})`, 'g');
    
    const parts = text.split(regex);
    return parts.map((part, index) => {
      const isKeyword = sortedKeywords.some(k => k.word === part);
      if (isKeyword) {
        return (
          <span
            key={index}
            onClick={() => handleKeywordClick(part)}
            className="cursor-pointer font-bold text-amber-400 hover:text-amber-300 underline decoration-amber-400/50 underline-offset-2 transition-colors px-1 bg-amber-500/10 rounded"
          >
            {part}
          </span>
        );
      }
      return part;
    });
  };

  // Browser Mock Engine Clicking Keyword Handlers (NO underlines, NO cursor hovers style!)
  const handleKeywordClick = (word: string) => {
    sounds.playClick();
    setSearchQuery(word);
    setActiveTab("search");
    
    // Auto-execute search results when keyword clicked from current chapter data
    let results: string[] = [];
    const searchMatches = currentChapterData.searchMatches;
    
    // Try to find matching key
    const matchedKey = Object.keys(searchMatches).find(
      (key) => word.toLowerCase().includes(key.toLowerCase()) || key.toLowerCase().includes(word.toLowerCase())
    );
    
    if (matchedKey) {
      results = searchMatches[matchedKey as keyof typeof searchMatches] || [];
    } else {
      results = ["no_results"];
    }
    setSearchResults(results);

    // Smooth scroll browser container into view
    setTimeout(() => {
      if (browserRef.current) {
        browserRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  // Execute Search Query logic
  const handleSearchExecute = () => {
    if (!searchQuery.trim()) return;
    sounds.playClick();
    setActiveTab("search");

    const query = searchQuery.trim().toLowerCase();
    let results: string[] = [];
    const searchMatches = currentChapterData.searchMatches;

    Object.keys(searchMatches).forEach((key) => {
      if (query.includes(key.toLowerCase()) || key.toLowerCase().includes(query)) {
        results = [...results, ...searchMatches[key as keyof typeof searchMatches]];
      }
    });

    // Deduplicate results
    results = Array.from(new Set(results));

    if (results.length === 0) {
      results = ["no_results"];
    }
    setSearchResults(results);

    // Smooth scroll browser container into view
    setTimeout(() => {
      if (browserRef.current) {
        browserRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  // Open web page in mock browser and possibly gather evidence
  const handleOpenPage = (pageId: string) => {
    sounds.playClick();
    if (!openedPages.includes(pageId)) {
      setOpenedPages((prev) => [...prev, pageId]);
    }

    // Add corresponding evidence dynamically from current chapter data
    let newEvidence: Evidence | null = null;
    const page = currentChapterData.webPages[pageId];
    if (page && page.evidenceId) {
      const evidenceId = page.evidenceId;
      const found = currentChapterData.evidenceList.find((e) => e.id === evidenceId);
      if (found) {
        newEvidence = found;
      }
    }

    if (newEvidence && !gatheredEvidences.some((e) => e.id === newEvidence!.id)) {
      const updated = [...gatheredEvidences, newEvidence];
      setGatheredEvidences(updated);
      sounds.playEvidenceGathered();

      // Trigger the interactive dialogue between characters for this evidence!
      if (evidenceDialoguesMap[newEvidence.id]) {
        setActiveEvidenceDialogue({
          evidenceId: newEvidence.id,
          lines: evidenceDialoguesMap[newEvidence.id],
          currentIndex: 0
        });
      }
    }
  };

  // 2-Step Deduction Verification Logic
  const handleDeductionSubmit = () => {
    if (!selectedClaimId || !selectedEvidenceId) return;

    const correctMatch = currentChapterData.deduction.correctMatch;
    const isCorrect = 
      selectedClaimId === correctMatch.claimId && 
      correctMatch.evidenceIds.includes(selectedEvidenceId);

    if (isCorrect) {
      sounds.playCorrect();
      setGameState("EXPLANATION_SHEET");
    } else {
      sounds.playIncorrect();
      const newLives = lives - 1;
      setLives(newLives);

      if (newLives <= 0) {
        // Retry logic: restore lives and reset
        alert(`説得失敗……！デマを信じた${currentChapterData.deduction.opponentName}を説得できませんでした。もう一度挑戦しましょう！`);
        setLives(3);
        setSelectedClaimId(null);
        setSelectedEvidenceId(null);
      } else if (newLives === 2) {
        // SPEC REQUIREMENT: Trigger Aoi's soft guidance when lives drop to 2 (1st fail)
        setAoiGuidanceActive(true);
      } else {
        alert("突きつけた証拠が噛み合っていません！もう一度相手の主張と証拠を見比べてみましょう。");
      }
    }
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-neutral-100 font-sans flex flex-col antialiased select-none">
      
      {/* HEADER SECTION */}
      {gameState !== "TITLE" && gameState !== "CHAPTER_SELECT" && gameState !== "CHAPTER_CLEAR_CHOICE" && (
        <header className="bg-neutral-950 border-b-4 border-neutral-800 p-4 flex justify-between items-center z-10">
          <div className="flex items-center gap-3">
            <span className="retro-border bg-rose-600 px-3 py-1 font-bold text-sm tracking-wide text-white uppercase shadow-sm">
              FactChecker
            </span>
            <h1 className="text-xl md:text-2xl font-bold text-rose-500 tracking-tight">
              偽りのニュースを検証せよ
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* LIVES/HP BAR */}
            {(gameState === "BROWSER_SEARCH" || gameState === "DEDUCTION_PART") && (
              <div className="flex items-center gap-2 bg-neutral-900 px-3 py-1.5 rounded-lg border-2 border-neutral-700">
                <span className="text-xs text-neutral-400 font-bold">信用度:</span>
                <div className="flex gap-1">
                  {[1, 2, 3].map((heart) => (
                    <Heart
                      key={heart}
                      className={`w-5 h-5 ${
                        heart <= lives ? "text-rose-500 fill-rose-500" : "text-neutral-700"
                      } transition-all duration-300`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* SOUND TOGGLE */}
            <button
              onClick={toggleMute}
              className="p-2 hover:bg-neutral-800 rounded-lg text-neutral-400 hover:text-neutral-200 transition"
              title={isMuted ? "ミュート解除" : "ミュート"}
            >
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
          </div>
        </header>
      )}

      {/* MAIN LAYOUT */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 flex flex-col justify-start relative overflow-y-auto pt-6 gap-6">
        
        {/* ========================================================
            0. TITLE SCREEN
            ======================================================== */}
        <AnimatePresence>
          {gameState === "TITLE" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center gap-12 py-16"
            >
              <div className="text-center flex flex-col gap-4">
                <motion.h1 
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="text-6xl md:text-8xl font-black text-rose-500 tracking-wider uppercase font-sans drop-shadow-[0_4px_12px_rgba(239,68,68,0.3)] select-none"
                >
                  FactChecker
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  transition={{ delay: 0.5 }}
                  className="text-neutral-400 text-sm md:text-base tracking-widest font-mono uppercase"
                >
                  - Information Literacy & Fact-Checking Game -
                </motion.p>
              </div>

              <motion.button
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  sounds.playClick();
                  if (maxUnlockedChapter > 1) {
                    setGameState("CHAPTER_SELECT");
                  } else {
                    setCurrentChapter(1);
                    setGameState("CHAPTER_INTRO");
                    resetChapterStates();
                  }
                }}
                className="retro-border bg-rose-600 hover:bg-rose-500 text-white font-black text-xl md:text-2xl px-12 py-5 shadow-[0_6px_20px_rgba(239,68,68,0.4)] transition-all cursor-pointer select-none"
              >
                PLAY GAME
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========================================================
            0.2. CHAPTER SELECT SCREEN
            ======================================================== */}
        <AnimatePresence>
          {gameState === "CHAPTER_SELECT" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex-1 flex flex-col items-center justify-center gap-8 py-10 w-full max-w-4xl mx-auto"
            >
              <div className="text-center flex flex-col gap-2">
                <span className="text-rose-500 font-bold tracking-widest text-xs font-mono uppercase">
                  Select Chapter
                </span>
                <h2 className="text-4xl font-black text-neutral-100 tracking-wide">
                  章を選択してください
                </h2>
                <p className="text-neutral-400 text-xs md:text-sm">
                  挑戦する章を選んでファクトチェックを開始しましょう
                </p>
              </div>

              {/* Chapters Grid List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl px-4">
                {[1, 2, 3, 4].map((chNum) => {
                  const isUnlocked = chNum <= maxUnlockedChapter;
                  const chapData = chaptersData[chNum as keyof typeof chaptersData];
                  const chapTitle = isUnlocked && chapData ? chapData.title : "【 ロックされています 】";
                  const chapDesc = isUnlocked && chapData 
                    ? `対戦相手: ${chapData.deduction.opponentName} / 信じているデマを暴け` 
                    : "前の章をクリアしてアンロック";

                  return (
                    <motion.button
                      key={chNum}
                      disabled={!isUnlocked}
                      whileHover={isUnlocked ? { scale: 1.02, y: -2 } : {}}
                      whileTap={isUnlocked ? { scale: 0.98 } : {}}
                      onClick={() => {
                        sounds.playClick();
                        setCurrentChapter(chNum);
                        setGameState("CHAPTER_INTRO");
                        resetChapterStates();
                      }}
                      className={`retro-border text-left p-5 flex flex-col justify-between gap-4 h-40 transition-all ${
                        isUnlocked
                          ? "bg-neutral-900 border-neutral-700 hover:border-rose-500 cursor-pointer text-neutral-100 group"
                          : "bg-neutral-950/40 border-neutral-800/80 text-neutral-600 opacity-60 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex justify-between items-start w-full">
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 border ${
                          isUnlocked 
                            ? "bg-rose-950/30 border-rose-900/60 text-rose-400 group-hover:bg-rose-900/40" 
                            : "bg-neutral-900 border-neutral-800 text-neutral-500"
                        }`}>
                          CHAPTER {String(chNum).padStart(2, "0")}
                        </span>
                        {isUnlocked ? (
                          <Play className="w-4 h-4 text-rose-500 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                        ) : (
                          <Lock className="w-4 h-4 text-neutral-600" />
                        )}
                      </div>

                      <div>
                        <h3 className={`text-base font-bold leading-tight ${isUnlocked ? "text-neutral-100 group-hover:text-rose-400" : "text-neutral-600"}`}>
                          {chapTitle}
                        </h3>
                        <p className="text-[11px] text-neutral-400 mt-1.5 font-sans leading-normal line-clamp-2">
                          {chapDesc}
                        </p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Back to Title Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  sounds.playClick();
                  setGameState("TITLE");
                }}
                className="retro-border bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-bold px-8 py-3.5 text-xs tracking-widest transition-all cursor-pointer flex items-center gap-2 mt-4"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>タイトル画面に戻る</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========================================================
            0.3. CHAPTER CLEAR CHOICE SCREEN
            ======================================================== */}
        <AnimatePresence>
          {gameState === "CHAPTER_CLEAR_CHOICE" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex-1 flex flex-col items-center justify-center gap-8 py-16 bg-neutral-950/40 rounded-2xl border-2 border-neutral-800 p-8 my-auto"
            >
              <div className="text-center flex flex-col gap-3">
                <span className="text-emerald-400 font-bold tracking-widest text-sm font-mono uppercase">
                  CONGRATULATIONS!
                </span>
                <h2 className="text-3xl md:text-4xl font-black text-neutral-100 leading-snug">
                  第{currentChapter}章 ファクトチェック成功！
                </h2>
                <p className="text-neutral-400 text-xs md:text-sm max-w-md mx-auto mt-2 leading-relaxed">
                  デマを冷静に検証し、見事に相手の誤った主張を解きほぐしました。
                  真実を広めるための次のステップへ進みましょう！
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md justify-center mt-4">
                <button
                  onClick={() => {
                    sounds.playClick();
                    const nextChap = currentChapter + 1;
                    setCurrentChapter(nextChap);
                    setGameState("CHAPTER_INTRO");
                    resetChapterStates();
                  }}
                  className="retro-border bg-rose-600 hover:bg-rose-500 text-white font-black py-4 px-6 text-base tracking-widest transition-all cursor-pointer text-center flex-1 shadow-lg shadow-rose-950/40"
                >
                  次の章に進む
                </button>

                <button
                  onClick={() => {
                    sounds.playClick();
                    setGameState("TITLE");
                    resetChapterStates();
                  }}
                  className="retro-border bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-black py-4 px-6 text-base tracking-widest transition-all cursor-pointer text-center flex-1"
                >
                  タイトルへ戻る
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========================================================
            0.5. CHAPTER INTRO SCREEN
            ======================================================== */}
        <AnimatePresence>
          {gameState === "CHAPTER_INTRO" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              onClick={() => {
                sounds.playClick();
                setGameState("STORY_OPENING");
              }}
              className="flex-1 flex flex-col items-center justify-center gap-6 py-16 cursor-pointer select-none bg-neutral-950/40 rounded-2xl border-2 border-neutral-800 p-8 hover:bg-neutral-950/60 transition-colors my-auto"
            >
              <motion.div
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-rose-500 font-bold tracking-widest text-lg md:text-xl font-mono"
              >
                CHAPTER {String(currentChapter).padStart(2, "0")}
              </motion.div>

              <motion.h2
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-3xl md:text-5xl font-extrabold text-neutral-100 tracking-wide text-center leading-snug max-w-2xl px-4"
              >
                {currentChapterData.title}
              </motion.h2>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ delay: 0.6, repeat: Infinity, duration: 1.8 }}
                className="text-neutral-500 text-xs md:text-sm font-mono uppercase tracking-widest mt-10 flex items-center gap-2"
              >
                <span>CLICK TO START STORY</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========================================================
            1. STORY INTRO / DIALOGUE PANEL
            ======================================================== */}
        <AnimatePresence mode="wait">
          {(gameState === "STORY_OPENING" || gameState === "BOARD_TRIGGER_CONVERSATION" || gameState === "STORY_EPILOGUE") && (
            <motion.div
              key={gameState}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="w-full flex flex-col gap-6"
            >
              {/* STAGE & CHARACTERS STAGE */}
              <div className="h-64 md:h-80 retro-border bg-neutral-950 flex justify-around items-end p-4 relative overflow-hidden pixel-bg">
                
                {/* Visual Concept Tag */}
                <div className="absolute top-2 left-2 bg-neutral-800 text-neutral-400 text-xs px-2 py-1 rounded border border-neutral-700">
                  {gameState === "STORY_OPENING" ? currentChapterData.title : 
                   gameState === "BOARD_TRIGGER_CONVERSATION" ? "緊急ファクトチェック検証" : "エピローグ：真実と信頼"}
                </div>

                {/* Character Sprites with Concept Art integration */}
                {currentDialogue?.avatar === "ren" || currentDialogue?.avatar === "aoi" ? (
                  <div className="flex justify-center items-end w-full h-full gap-8">
                    {/* Character: Ren */}
                    <div className={`flex flex-col items-center transition-all duration-300 ${currentDialogue.avatar === "ren" ? "scale-105 opacity-100" : "opacity-50 scale-95"}`}>
                      <div className="w-28 h-36 md:w-36 md:h-44 border-4 border-neutral-700 rounded bg-neutral-900 overflow-hidden relative">
                        <img 
                          src={AVATAR_IMAGES.ren} 
                          alt="レン" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover pixelated scale-110 object-top"
                        />
                      </div>
                      <span className="mt-2 text-xs bg-blue-900 px-3 py-0.5 rounded border border-blue-600 font-bold text-blue-200">
                        レン (主人公)
                      </span>
                    </div>

                    {/* Character: Aoi */}
                    <div className={`flex flex-col items-center transition-all duration-300 ${currentDialogue.avatar === "aoi" ? "scale-105 opacity-100" : "opacity-50 scale-95"}`}>
                      <div className="w-28 h-36 md:w-36 md:h-44 border-4 border-neutral-700 rounded bg-neutral-900 overflow-hidden relative">
                        <img 
                          src={AVATAR_IMAGES.aoi} 
                          alt="アオイ" 
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover pixelated scale-110 object-bottom"
                        />
                      </div>
                      <span className="mt-2 text-xs bg-rose-900 px-3 py-0.5 rounded border border-rose-600 font-bold text-rose-200">
                        アオイ (幼馴染)
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center w-full pb-12">
                    <span className="text-rose-500 font-bold text-lg block mb-2">♪ SE: ピコピコ 検索完了 ♪</span>
                    <p className="text-neutral-400 text-sm">２つの矛盾した証拠が揃ったことで、論理回路が接続されました。</p>
                  </div>
                )}
              </div>

              {/* DIALOGUE BOX */}
              <div 
                onClick={nextDialogue}
                className="retro-border bg-neutral-950 pt-5 pb-5 pr-5 pl-12 md:pl-16 cursor-pointer hover:bg-neutral-900/90 transition-all flex flex-col justify-between min-h-36 shadow-lg relative group"
              >
                <div className="pl-6 md:pl-8">
                  <div className="text-rose-500 text-xs md:text-sm font-bold mb-2 flex items-center gap-1 select-none pl-1">
                    <span>【 {currentDialogue?.char} 】</span>
                  </div>
                  <p className="text-sm md:text-base leading-relaxed text-neutral-100 tracking-wide font-medium whitespace-pre-wrap break-words pl-2 pr-2">
                    {typedText}
                    {isTyping && <span className="inline-block w-2 h-4 bg-neutral-400 ml-1 animate-pulse" />}
                  </p>
                </div>

                <div className="self-end flex items-center gap-1.5 text-[10px] md:text-xs text-neutral-500 group-hover:text-rose-500 transition-colors mt-4 pl-6 md:pl-8">
                  <span>{isTyping ? "スキップ" : "クリックで次へ"}</span>
                  <ArrowRight className="w-3.5 h-3.5 animate-bounce" />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========================================================
            2. MOCK BROWSER & SEARCH PLAYGROUND
            ======================================================== */}
        <AnimatePresence>
          {gameState === "BROWSER_SEARCH" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col gap-4"
            >
              {/* Header Info / Tutorial Hint from Aoi */}
              <div className="bg-blue-950/40 border border-blue-900/60 p-3 rounded-lg flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <span className="text-blue-400 font-bold">アオイのアドバイス: </span>
                  SNS等でオレンジ色に強調された怪しい重要キーワード（
                  <span className="text-amber-400 font-bold">青い果物</span>、
                  <span className="text-amber-400 font-bold">副作用</span>、
                  <span className="text-amber-400 font-bold">臨床データ</span>など）をクリックしてみましょう！
                  <span className="text-amber-400 font-bold ml-1">自動的に検索エンジンのタブに飛んで、関連する情報が表示されるわ！</span>
                </div>
              </div>

              {/* BROWSER CONTAINER */}
              <div ref={browserRef} className="bg-neutral-950 border-4 border-neutral-800 rounded-lg overflow-hidden flex flex-col min-h-[500px]">
                
                {/* Browser Address & Tools bar */}
                <div className="bg-neutral-900 p-3 border-b-2 border-neutral-800 flex flex-wrap gap-2 items-center justify-between">
                  <div className="flex gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-rose-500" />
                    <span className="w-3.5 h-3.5 rounded-full bg-amber-500" />
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-500" />
                  </div>

                  {/* Browser URL Display */}
                  <div className="flex-1 max-w-md mx-4 bg-neutral-950 border border-neutral-800 px-3 py-1 rounded text-xs text-neutral-400 font-mono flex items-center gap-2">
                    <LinkIcon className="w-3.5 h-3.5 text-neutral-600" />
                    <span>http://mock-browser.net/{activeTab === "sns" ? "sns_timeline" : "search_results"}</span>
                  </div>

                  {/* SPEC REQ: 常設の「証拠ボードを見る」ボタン */}
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setShowEvidenceBoardOverlay(true);
                    }}
                    className="retro-border bg-amber-600 hover:bg-amber-500 text-white font-bold px-4 py-1.5 text-sm transition-transform active:scale-95 flex items-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>証拠ボードを見る</span>
                  </button>
                </div>

                {/* Sub Tab Selection: SNS vs Browser Search */}
                <div className="bg-neutral-900/60 flex border-b border-neutral-800">
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setActiveTab("sns");
                    }}
                    className={`px-6 py-2.5 font-bold text-sm border-r border-neutral-800 transition ${
                      activeTab === "sns"
                        ? "bg-neutral-950 text-rose-500 border-t-2 border-t-rose-500"
                        : "text-neutral-400 hover:bg-neutral-800/50"
                    }`}
                  >
                    SNS タイムライン
                  </button>
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setActiveTab("search");
                    }}
                    className={`px-6 py-2.5 font-bold text-sm transition ${
                      activeTab === "search"
                        ? "bg-neutral-950 text-rose-500 border-t-2 border-t-rose-500"
                        : "text-neutral-400 hover:bg-neutral-800/50"
                    }`}
                  >
                    ファクト検索エンジン
                  </button>
                </div>

                {/* BROWSER BODY AREA */}
                <div className="p-4 flex-1 flex flex-col bg-neutral-950 overflow-y-auto">
                  
                  {/* TAB 1: SNS TIMELINE */}
                  {activeTab === "sns" && (
                    <div className="flex flex-col gap-4 max-w-xl mx-auto w-full py-4">
                      {/* Dynamic chapter timeline posts */}
                      {currentChapterData.timelinePosts.map((post, index) => (
                        <div key={index} className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 shadow-md">
                          <div className="flex gap-3 items-center mb-3">
                            <div className={`w-10 h-10 rounded-full ${post.avatarColor || "bg-rose-700 border-rose-500"} flex items-center justify-center font-bold text-white text-sm border`}>
                              {post.avatarText}
                            </div>
                            <div>
                              <div className="font-bold text-sm text-neutral-100 flex items-center gap-1.5">
                                <span>{post.author}</span>
                                {post.badgeText && (
                                  <span className="bg-sky-900 text-sky-200 text-[10px] px-1.5 py-0.5 rounded font-bold border border-sky-600 scale-90">
                                    {post.badgeText}
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-neutral-500 font-mono">{post.authorHandle} • {post.timeText}</div>
                            </div>
                          </div>

                          <div className="text-neutral-200 leading-relaxed text-sm md:text-base mb-4 tracking-wide font-medium bg-neutral-950 p-3 rounded border border-neutral-800 whitespace-pre-wrap">
                            {renderHighlightedText(post.textHtml, currentChapterData.searchKeywords)}
                          </div>

                          <div className="text-xs text-neutral-500 border-t border-neutral-800 pt-3 flex justify-between">
                            <span>🔁 1.2万件のリポスト</span>
                            <span>❤️ 3.5万件のいいね</span>
                          </div>
                        </div>
                      ))}

                      {/* Classmate's panic posting from chapter data */}
                      {currentChapterData.classmatePost && (
                        <div className="bg-neutral-900/60 p-4 rounded-xl border border-neutral-800/80">
                          <div className="flex gap-3 items-center mb-2">
                            <div className={`w-8 h-8 rounded-full ${currentChapterData.classmatePost.avatarColor || "bg-blue-900 border-blue-600"} flex items-center justify-center font-bold text-white text-xs border`}>
                              {currentChapterData.classmatePost.avatarText}
                            </div>
                            <div>
                              <div className="font-bold text-xs text-neutral-300">{currentChapterData.classmatePost.author}</div>
                              <div className="text-[9px] text-neutral-500 font-mono">{currentChapterData.classmatePost.authorHandle} • {currentChapterData.classmatePost.timeText}</div>
                            </div>
                          </div>
                          <div className="text-xs text-neutral-300 leading-relaxed bg-neutral-950/40 p-2.5 rounded border border-neutral-800/40 mt-1 whitespace-pre-wrap">
                            {renderHighlightedText(currentChapterData.classmatePost.textHtml, currentChapterData.searchKeywords)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: SEARCH ENGINE */}
                  {activeTab === "search" && (
                    <div className="flex flex-col gap-4 max-w-2xl mx-auto w-full py-2">
                      
                      {/* Search Bar Block */}
                      <div className="flex gap-2">
                        <div className="flex-1 bg-neutral-900 rounded-lg border-2 border-neutral-700 flex items-center px-3 relative">
                          <Search className="w-5 h-5 text-neutral-500" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleSearchExecute()}
                            placeholder="キーワードを入力、またはタイムラインの怪しい単語をクリック"
                            className="bg-transparent border-none outline-none flex-1 py-3.5 px-2 text-sm text-neutral-100 placeholder-neutral-600 font-bold"
                          />
                          {searchQuery && (
                            <button onClick={() => setSearchQuery("")} className="text-neutral-500 hover:text-neutral-300 p-1">
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <button
                          onClick={handleSearchExecute}
                          className="retro-border bg-rose-600 hover:bg-rose-500 text-white font-bold px-6 py-2 text-sm transition"
                        >
                          検索
                        </button>
                      </div>

                      {/* SEARCH RESULTS LIST */}
                      <div className="mt-4 flex flex-col gap-4">
                        <h3 className="text-xs font-mono text-neutral-500 uppercase tracking-widest border-b border-neutral-800 pb-2">
                          検索結果 ({searchResults.length} 件)
                        </h3>

                        {searchResults.length === 0 ? (
                          <div className="text-center py-12 text-neutral-600">
                            <Search className="w-12 h-12 mx-auto mb-2 opacity-30" />
                            <p className="text-sm font-bold">検索履歴がありません</p>
                            <p className="text-xs mt-1">タイムラインや他のページの疑わしいキーワードをクリックして、検索してみましょう。</p>
                          </div>
                        ) : searchResults[0] === "no_results" ? (
                          <div className="bg-neutral-900/40 border border-neutral-800 rounded-lg p-8 text-center text-neutral-500">
                            <p className="text-sm font-bold">「{searchQuery}」に関する信頼できる情報は見つかりませんでした。</p>
                            <p className="text-xs mt-1">他の単語（青い果物、臨床データ、副作用など）を試してみてください。</p>
                          </div>
                        ) : (
                          searchResults.map((pageId) => {
                            const page = currentChapterData.webPages[pageId as keyof typeof currentChapterData.webPages];
                            if (!page) return null;

                            // Set custom badge styling based on category
                            let badgeColor = "bg-neutral-900 border-neutral-800 text-neutral-400";
                            if (page.category.includes("公式") || page.category.includes(".go.jp") || page.category.includes("プレス")) {
                              badgeColor = "bg-emerald-950/40 border-emerald-900/60 text-emerald-400";
                            } else if (page.category.includes("ファクトチェック") || page.category.includes("検証")) {
                              badgeColor = "bg-rose-950/40 border-rose-900/60 text-rose-400";
                            } else if (page.category.includes("医療") || page.category.includes("専門") || page.category.includes("報道") || page.category.includes("ニュース")) {
                              badgeColor = "bg-amber-950/40 border-amber-900/60 text-amber-400";
                            }

                            return (
                              <div key={pageId} className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 hover:border-neutral-700 transition-all shadow">
                                <span className={`text-[10px] font-bold border px-2 py-0.5 rounded ${badgeColor}`}>
                                  {page.category}
                                </span>
                                <h4 
                                  onClick={() => handleOpenPage(pageId)}
                                  className="text-base md:text-lg font-bold text-sky-400 hover:underline cursor-pointer mt-1.5"
                                >
                                  {page.title}
                                </h4>
                                <p className="text-xs text-neutral-500 mt-0.5">{page.url}</p>
                                <p className="text-sm text-neutral-300 mt-2 leading-relaxed">
                                  {renderHighlightedText(page.excerpt, currentChapterData.searchKeywords)}
                                </p>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer status / Collected evidence info */}
                <div className="bg-neutral-900/80 p-3 border-t border-neutral-800 flex justify-between items-center text-xs">
                  <div className="text-neutral-400">
                    現在の収集済み証拠付箋: <span className="text-rose-500 font-bold">{gatheredEvidences.length}</span> / 3
                  </div>
                  {gatheredEvidences.length > 0 && (
                    <div className="flex gap-2">
                      {gatheredEvidences.map((ev) => (
                        <span key={ev.id} className="bg-neutral-950 text-amber-500 border border-amber-800 px-2 py-0.5 rounded font-mono">
                          ★ {ev.title.substring(0, 8)}...
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========================================================
            3. DEDUCTION & CONTRADICTION MATCHING ENGINE
            ======================================================== */}
        <AnimatePresence>
          {gameState === "DEDUCTION_PART" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col gap-6"
            >
              {/* Introduction Title */}
              <div className="text-center">
                <span className="bg-rose-900/50 border border-rose-500 text-rose-300 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
                  {currentChapterData.deduction.title}
                </span>
                <p className="text-neutral-400 text-xs mt-2">
                  {currentChapterData.deduction.opponentName}の誤った主張を1つクリックし、それと「完全に矛盾する証拠付箋」を突きつけて冷静にさせましょう！
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6 items-start">
                
                {/* COLUMN 1: OPPONENT SPEECH BUBBLES */}
                <div className="flex flex-col gap-4">
                  <div className="bg-neutral-950 retro-border p-4 flex flex-col gap-3 min-h-[300px] justify-between">
                    <div>
                      {/* Character Header */}
                      <div className="flex gap-3 items-center mb-4 border-b border-neutral-800 pb-2">
                        <div className="w-12 h-12 rounded-lg bg-neutral-900 overflow-hidden border-2 border-neutral-700 relative">
                          <img 
                            src={AVATAR_IMAGES[currentChapterData.deduction.opponentAvatar as keyof typeof AVATAR_IMAGES]} 
                            alt={currentChapterData.deduction.opponentName} 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover pixelated scale-110 object-top"
                          />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-neutral-200">{currentChapterData.deduction.opponentName}</h4>
                          <span className="text-[10px] text-rose-400 bg-rose-950/40 px-2 py-0.5 border border-rose-900/60 font-mono">{currentChapterData.deduction.opponentStatus}</span>
                        </div>
                      </div>

                      {/* OPPONENT CLAIMS (STEP 1 Selection) */}
                      <div className="flex flex-col gap-3">
                        {currentChapterData.deduction.claims.map((claim) => (
                          <button
                            key={claim.id}
                            onClick={() => {
                              sounds.playClick();
                              setSelectedClaimId(claim.id);
                            }}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                              selectedClaimId === claim.id
                                ? "bg-rose-950/40 border-rose-500 shadow-rose-900/40 shadow-lg text-white"
                                : "bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700"
                            }`}
                          >
                            <div className="text-[10px] font-mono text-rose-500 mb-1">【{claim.label}】</div>
                            <p className="text-base font-bold leading-relaxed">
                              {claim.text}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="text-xs text-neutral-500 italic mt-4 text-center">
                      ステップ1：上の主張から矛盾している方を1つクリックして選んでください。
                    </div>
                  </div>
                </div>

                {/* COLUMN 2: EVIDENCES HAND (STEP 2 Selection) */}
                <div className="flex flex-col gap-4">
                  <div className="bg-neutral-950 retro-border p-4 flex flex-col justify-between min-h-[300px]">
                    <div>
                      <h4 className="text-xs font-bold text-neutral-400 border-b border-neutral-800 pb-2 mb-3">
                        手持ちの証拠付箋一覧 (ステップ2)
                      </h4>

                      <div className="flex flex-col gap-3">
                        {gatheredEvidences.length === 0 ? (
                          <p className="text-sm text-neutral-600 text-center py-12">
                            獲得した証拠がありません。ブラウザで調べ直してください。
                          </p>
                        ) : (
                          gatheredEvidences.map((ev) => (
                            <button
                              key={ev.id}
                              onClick={() => {
                                sounds.playClick();
                                setSelectedEvidenceId(ev.id);
                              }}
                              className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                                selectedEvidenceId === ev.id
                                  ? "bg-amber-950/40 border-amber-500 shadow-amber-950/40 shadow-md text-white scale-[1.01]"
                                  : "bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700"
                              }`}
                            >
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-[10px] bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800 font-bold text-amber-500">
                                  {ev.title}
                                </span>
                                <span className="text-[9px] text-neutral-500 font-mono truncate max-w-[150px]">
                                  {ev.source}
                                </span>
                              </div>
                              <p className="text-xs leading-relaxed text-neutral-300">
                                {ev.content}
                              </p>
                            </button>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => {
                          sounds.playClick();
                          setShowEvidenceBoardOverlay(true);
                        }}
                        className="flex-1 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 py-3 rounded font-bold text-sm transition"
                      >
                        証拠ボードを確認
                      </button>

                      <button
                        onClick={handleDeductionSubmit}
                        disabled={!selectedClaimId || !selectedEvidenceId}
                        className={`flex-1 font-bold py-3 rounded text-sm transition ${
                          selectedClaimId && selectedEvidenceId
                            ? "bg-rose-600 hover:bg-rose-500 text-white shadow-lg active:scale-95 cursor-pointer"
                            : "bg-neutral-800 text-neutral-600 cursor-not-allowed"
                        }`}
                      >
                        証拠を突きつける！
                      </button>
                    </div>

                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========================================================
            4. CLEAR EDUCATIONAL REPORT SHEET
            ======================================================== */}
        <AnimatePresence>
          {gameState === "EXPLANATION_SHEET" && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full bg-neutral-950 retro-border p-6 shadow-2xl relative max-w-3xl mx-auto flex flex-col gap-6"
            >
              {/* Badge Clear */}
              <div className="flex items-center gap-3 border-b-4 border-emerald-600 pb-4">
                <CheckCircle className="w-10 h-10 text-emerald-500 shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold text-emerald-400">{currentChapterData.explanation.title}</h2>
                  <p className="text-xs text-neutral-400">
                    {currentChapterData.explanation.subtitle}
                  </p>
                </div>
              </div>

              {/* SHEET CONTENT CONTAINER */}
              <div className="flex flex-col gap-4 text-neutral-300 leading-relaxed text-sm md:text-base">
                
                {/* CASE MODEL */}
                <div className="bg-neutral-900 p-4 rounded-lg border border-neutral-800">
                  <h3 className="text-emerald-400 font-bold text-base mb-1.5 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-emerald-500 inline-block" />
                    {currentChapterData.explanation.modelTitle}
                  </h3>
                  <p className="text-neutral-300 text-xs md:text-sm">
                    {currentChapterData.explanation.modelText}
                  </p>
                </div>

                {/* PRACTICAL SKILLS */}
                <div className="bg-neutral-900 p-4 rounded-lg border border-neutral-800">
                  <h3 className="text-emerald-400 font-bold text-base mb-1.5 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-emerald-500 inline-block" />
                    {currentChapterData.explanation.skillsTitle}
                  </h3>
                  <ul className="list-decimal pl-5 space-y-2 text-xs md:text-sm text-neutral-300">
                    {currentChapterData.explanation.skills.map((skill, index) => {
                      const colonIndex = skill.indexOf(":");
                      if (colonIndex !== -1) {
                        const boldPart = skill.slice(0, colonIndex + 1);
                        const restPart = skill.slice(colonIndex + 1);
                        return (
                          <li key={index}>
                            <strong className="text-white">{boldPart}</strong>
                            {restPart}
                          </li>
                        );
                      }
                      return <li key={index}>{skill}</li>;
                    })}
                  </ul>
                </div>

              </div>

              {/* NEXT / CONTINUE BUTTON */}
              <button
                onClick={() => {
                  sounds.playClick();
                  setGameState("STORY_EPILOGUE");
                  setCurrentDialogueIndex(0);
                }}
                className="retro-border bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 text-base tracking-wider transition-all flex items-center justify-center gap-2"
              >
                <span>エピローグへ進む</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========================================================
            5. GAME END / CREDITS
            ======================================================== */}
        <AnimatePresence>
          {gameState === "CREDITS" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center max-w-lg mx-auto py-12 flex flex-col gap-6"
            >
              <div className="retro-border bg-neutral-950 p-8 pixel-bg">
                <span className="bg-emerald-950 text-emerald-400 border border-emerald-500 px-4 py-1.5 rounded font-bold text-xs">
                  COMPLETED DEMO
                </span>
                <h2 className="text-3xl font-bold text-rose-500 tracking-tight mt-4">
                  FactChecker (仮)
                </h2>
                <p className="text-neutral-400 text-xs mt-1">仕様書インタラクティブ・デモ</p>

                <div className="border-t border-neutral-800 my-6 pt-6 text-sm text-neutral-300 flex flex-col gap-2.5">
                  <p>企画・ゲームデザイン：熟練のゲームデザイナーAI</p>
                  <p>プログラミング：熟練のゲームプログラマーAI</p>
                  <p>開発環境：Google AI Studio Build</p>
                </div>

                <p className="text-xs text-neutral-500 leading-relaxed">
                  本デモは、メディアリテラシー向上ゲーム「FactChecker」のコアシステムおよび第1章（青い果実デモ騒動）が仕様書通りに実装されているかを確認するためのプロトタイプです。
                </p>

                <div className="flex flex-col gap-3 mt-6">
                  <button
                    onClick={() => {
                      sounds.playClick();
                      // Reset Game to main menu
                      setGameState("TITLE");
                      setGatheredEvidences([]);
                      setOpenedPages([]);
                      setCurrentDialogueIndex(0);
                      setIsDeductionTriggered(false);
                    }}
                    className="retro-border bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 text-sm tracking-widest transition-all"
                  >
                    タイトルメニューに戻る
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========================================================
            9. EVIDENCE BOARD OVERLAY (MANDATE: BIGGER & FULL SCREEN FOCUS)
            ======================================================== */}
        <AnimatePresence>
          {showEvidenceBoardOverlay && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-neutral-950/95 flex justify-center items-center z-50 p-4 md:p-8 backdrop-blur-md"
            >
              <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                className="bg-neutral-900 retro-border w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl relative overflow-hidden"
              >
                {/* Board Header */}
                <div className="bg-amber-950 p-4 border-b-2 border-amber-900 flex justify-between items-center shrink-0">
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-amber-400" />
                    <h3 className="font-bold text-lg text-amber-200">現在の証拠検証ボード</h3>
                  </div>
                  <button
                    onClick={() => {
                      sounds.playClick();
                      setShowEvidenceBoardOverlay(false);
                    }}
                    className="p-1 hover:bg-amber-900/50 rounded text-amber-400 hover:text-amber-200 transition"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Board Grid Area */}
                <div className="flex-1 bg-neutral-950 p-6 relative overflow-auto pixel-bg flex items-center justify-center min-h-[450px]">
                  
                  {/* Fixed Canvas Container: Guarantees pin positioning and SVG line alignment never drift */}
                  <div className="relative w-[900px] h-[450px] shrink-0 z-10">
                    
                    {/* SVG Layer for Drawing Connections - Inside the scoped container */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                      {(chapterConnections[currentChapter] || []).map((conn, idx) => {
                        const hasEvFrom = currentChapterData.evidenceList[conn.fromIndex] && 
                          gatheredEvidences.some(e => e.id === currentChapterData.evidenceList[conn.fromIndex].id);
                        const hasEvTo = currentChapterData.evidenceList[conn.toIndex] && 
                          gatheredEvidences.some(e => e.id === currentChapterData.evidenceList[conn.toIndex].id);
                        
                        if (hasEvFrom && hasEvTo) {
                          return (
                            <g key={idx}>
                              <path 
                                d={conn.pathD} 
                                fill="none" 
                                stroke={conn.strokeColor} 
                                strokeWidth="4" 
                                strokeDasharray="6,4"
                              />
                              <foreignObject x={conn.labelX} y={conn.labelY} width="100" height="36">
                                <div className={`${conn.colorClass} border px-2 py-0.5 rounded text-[10px] font-bold text-center font-mono shadow-md`}>
                                  {conn.label}
                                </div>
                              </foreignObject>
                            </g>
                          );
                        }
                        return null;
                      })}
                    </svg>

                    {/* STICKY 1: ev0 (Absolutely Pinned) */}
                    <div className="absolute left-[50px] top-[30px] w-[260px] h-[160px] z-10">
                      {ev0 ? (
                        gatheredEvidences.some(e => e.id === ev0.id) ? (
                          <motion.div
                            initial={{ scale: 0, rotate: -15 }}
                            animate={{ scale: 1, rotate: -2 }}
                            className="w-full h-full bg-amber-100 border-2 border-amber-300 p-4 rounded shadow-xl text-neutral-800 flex flex-col justify-between"
                          >
                            <div className="w-4 h-4 bg-rose-600 rounded-full border border-neutral-900 absolute -top-2 left-1/2 -translate-x-1/2 shadow-inner" /> {/* Red Pin */}
                            <div>
                              <span className="text-[9px] font-bold bg-amber-200 px-1.5 py-0.5 rounded text-amber-800">
                                証拠A
                              </span>
                              <h4 className="font-bold text-sm mt-1 border-b border-amber-200 pb-1 truncate">
                                {ev0.title}
                              </h4>
                              <p className="text-[11px] leading-relaxed mt-1 text-neutral-700 line-clamp-4">
                                {ev0.content}
                              </p>
                            </div>
                          </motion.div>
                        ) : (
                          <div className="w-full h-full border-2 border-dashed border-neutral-600 rounded flex flex-col items-center justify-center p-4 text-center text-xs text-neutral-500 bg-neutral-900/50">
                            <span>未発見の証拠A</span>
                            <span className="text-[10px] text-neutral-600 mt-1">({ev0.title})</span>
                          </div>
                        )
                      ) : null}
                    </div>

                    {/* STICKY 2: ev1 (Absolutely Pinned) */}
                    <div className="absolute left-[590px] top-[30px] w-[260px] h-[160px] z-10">
                      {ev1 ? (
                        gatheredEvidences.some(e => e.id === ev1.id) ? (
                          <motion.div
                            initial={{ scale: 0, rotate: 15 }}
                            animate={{ scale: 1, rotate: 3 }}
                            className="w-full h-full bg-rose-100 border-2 border-rose-300 p-4 rounded shadow-xl text-neutral-800 flex flex-col justify-between"
                          >
                            <div className="w-4 h-4 bg-sky-600 rounded-full border border-neutral-900 absolute -top-2 left-1/2 -translate-x-1/2 shadow-inner" /> {/* Blue Pin */}
                            <div>
                              <span className="text-[9px] font-bold bg-rose-200 px-1.5 py-0.5 rounded text-rose-800">
                                証拠B
                              </span>
                              <h4 className="font-bold text-sm mt-1 border-b border-rose-200 pb-1 truncate">
                                {ev1.title}
                              </h4>
                              <p className="text-[11px] leading-relaxed mt-1 text-neutral-700 line-clamp-4">
                                {ev1.content}
                              </p>
                            </div>
                          </motion.div>
                        ) : (
                          <div className="w-full h-full border-2 border-dashed border-neutral-600 rounded flex flex-col items-center justify-center p-4 text-center text-xs text-neutral-500 bg-neutral-900/50">
                            <span>未発見の証拠B</span>
                            <span className="text-[10px] text-neutral-600 mt-1">({ev1.title})</span>
                          </div>
                        )
                      ) : null}
                    </div>

                    {/* STICKY 3: ev2 (Absolutely Pinned) */}
                    <div className="absolute left-[320px] top-[250px] w-[260px] h-[160px] z-10">
                      {ev2 ? (
                        gatheredEvidences.some(e => e.id === ev2.id) ? (
                          <motion.div
                            initial={{ scale: 0, rotate: -5 }}
                            animate={{ scale: 1, rotate: 1 }}
                            className="w-full h-full bg-emerald-100 border-2 border-emerald-300 p-4 rounded shadow-xl text-neutral-800 flex flex-col justify-between"
                          >
                            <div className="w-4 h-4 bg-emerald-600 rounded-full border border-neutral-900 absolute -top-2 left-1/2 -translate-x-1/2 shadow-inner" /> {/* Green Pin */}
                            <div>
                              <span className="text-[9px] font-bold bg-emerald-200 px-1.5 py-0.5 rounded text-emerald-800">
                                証拠C
                              </span>
                              <h4 className="font-bold text-sm mt-1 border-b border-emerald-200 pb-1 truncate">
                                {ev2.title}
                              </h4>
                              <p className="text-[11px] leading-relaxed mt-1 text-neutral-700 line-clamp-4">
                                {ev2.content}
                              </p>
                            </div>
                          </motion.div>
                        ) : (
                          <div className="w-full h-full border-2 border-dashed border-neutral-600 rounded flex flex-col items-center justify-center p-4 text-center text-xs text-neutral-500 bg-neutral-900/50">
                            <span>未発見の証拠C</span>
                            <span className="text-[10px] text-neutral-600 mt-1">({ev2.title})</span>
                          </div>
                        )
                      ) : null}
                    </div>

                  </div>

                </div>

                {/* Bottom bar of Board */}
                <div className="bg-amber-950 p-4 text-center text-xs text-amber-200 border-t-2 border-amber-900 shrink-0">
                  証拠同士を繋ぐ実線の関係性を整理して、対決時の論破ロジックを頭の中で組み立てましょう。
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ========================================================
          8. EVIDENCE ACQUISITION DIALOGUE OVERLAY
          ======================================================== */}
      <AnimatePresence>
        {activeEvidenceDialogue && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-neutral-950/95 flex justify-center items-center z-50 p-2 sm:p-4 md:p-8 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-neutral-900 retro-border w-[96vw] max-w-7xl h-[92vh] p-5 md:p-8 shadow-2xl flex flex-col gap-5 relative overflow-hidden justify-between"
            >
              {/* Header section (strictly avoids overlap) */}
              <div className="flex justify-between items-center border-b-2 border-neutral-800 pb-3.5 shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <BookOpen className="w-5 h-5 md:w-6 h-6 text-amber-400 shrink-0" />
                  <span className="font-bold text-base md:text-lg text-neutral-200 truncate">検証ボード（証拠詳細対話）</span>
                </div>
                <span className="text-xs md:text-sm text-amber-400 font-bold tracking-widest bg-amber-950/70 px-3.5 py-1.5 rounded border border-amber-800 shrink-0 whitespace-nowrap">
                  証拠獲得！
                </span>
              </div>

              {/* Characters Visual Stage - Magnified to fill vertical space beautifully */}
              <div className="flex-1 bg-neutral-950 rounded-lg border-2 border-neutral-800 flex justify-around items-end p-6 relative overflow-hidden pixel-bg min-h-[260px] lg:min-h-[380px]">
                {/* Background grid label */}
                <div className="absolute top-2 left-2 text-[10px] text-neutral-600 font-mono select-none">
                  STAGE AREA
                </div>

                {/* Speaker indicator & Characters layout */}
                <div className="flex justify-center items-end w-full h-full gap-10 sm:gap-20 md:gap-32 pb-4 z-10">
                  {/* Ren */}
                  <div className={`flex flex-col items-center transition-all duration-300 ${activeEvidenceDialogue.lines[activeEvidenceDialogue.currentIndex]?.avatar === "ren" ? "scale-105 opacity-100" : "opacity-45 scale-95"}`}>
                    <div className="w-28 h-36 sm:w-40 sm:h-52 md:w-52 md:h-64 lg:w-60 lg:h-76 border-2 border-neutral-700 rounded bg-neutral-900 overflow-hidden relative shadow-2xl">
                      <img 
                        src={AVATAR_IMAGES.ren} 
                        alt="レン" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover pixelated scale-110 object-top"
                      />
                    </div>
                    <span className="mt-3 text-xs sm:text-sm bg-blue-900 px-3.5 py-1 rounded border border-blue-600 font-bold text-blue-200">
                      レン
                    </span>
                  </div>

                  {/* Aoi */}
                  <div className={`flex flex-col items-center transition-all duration-300 ${activeEvidenceDialogue.lines[activeEvidenceDialogue.currentIndex]?.avatar === "aoi" ? "scale-105 opacity-100" : "opacity-45 scale-95"}`}>
                    <div className="w-28 h-36 sm:w-40 sm:h-52 md:w-52 md:h-64 lg:w-60 lg:h-76 border-2 border-neutral-700 rounded bg-neutral-900 overflow-hidden relative shadow-2xl">
                      <img 
                        src={AVATAR_IMAGES.aoi} 
                        alt="アオイ" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover pixelated scale-115 object-bottom"
                      />
                    </div>
                    <span className="mt-3 text-xs sm:text-sm bg-rose-900 px-3.5 py-1 rounded border border-rose-600 font-bold text-rose-200">
                      アオイ
                    </span>
                  </div>
                </div>
              </div>

              {/* Speech bubble */}
              <div 
                onClick={nextEvidenceDialogue}
                className="retro-border bg-neutral-950 p-5 md:p-6 cursor-pointer hover:bg-neutral-900 transition-all flex flex-col min-h-[110px] md:min-h-[140px] justify-between relative group shrink-0"
              >
                <div>
                  <div className="text-amber-500 text-xs md:text-sm lg:text-base font-bold mb-2 select-none">
                    <span>【 {activeEvidenceDialogue.lines[activeEvidenceDialogue.currentIndex]?.char} 】</span>
                  </div>
                  <p className="text-sm md:text-base lg:text-lg leading-relaxed text-neutral-100 tracking-wide font-medium whitespace-pre-wrap break-words">
                    {evidenceTypedText}
                    {isEvidenceTyping && <span className="inline-block w-1.5 h-3 bg-neutral-400 ml-1 animate-pulse" />}
                  </p>
                </div>

                <div className="self-end flex items-center gap-1.5 text-[10px] md:text-xs lg:text-sm text-neutral-500 group-hover:text-amber-400 transition-colors mt-4">
                  <span>{isEvidenceTyping ? "スキップ" : activeEvidenceDialogue.currentIndex < activeEvidenceDialogue.lines.length - 1 ? "クリックで次へ" : "閉じる"}</span>
                  <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 animate-bounce" />
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================================
          7. AOI'S GENTLE ASSIST DIALOGUE (SPEC MANDATE)
          ======================================================== */}
      <AnimatePresence>
        {aoiGuidanceActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-neutral-950/90 flex justify-center items-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="bg-neutral-900 retro-border w-full max-w-xl p-5 shadow-2xl flex flex-col gap-5"
            >
              <div className="flex items-center gap-3 border-b border-neutral-800 pb-3">
                <div className="w-16 h-20 border-2 border-neutral-700 rounded overflow-hidden bg-neutral-950 shrink-0">
                  <img 
                    src={AVATAR_IMAGES.aoi} 
                    alt="アオイ" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover pixelated scale-115 object-bottom"
                  />
                </div>
                <div>
                  <h3 className="font-bold text-rose-400">アオイの柔らかいアドバイス</h3>
                  <p className="text-[10px] text-neutral-400 font-mono">1ST ERROR ASSISTANCE ACTIVE</p>
                </div>
              </div>

              {/* Gentle dialogue content */}
              <p className="text-sm md:text-base leading-relaxed text-neutral-200 tracking-wide font-medium bg-neutral-950 p-4 rounded-lg border border-neutral-800 whitespace-pre-wrap break-words">
                {aoiGuidanceText}
              </p>

              <button
                onClick={() => {
                  sounds.playClick();
                  setAoiGuidanceActive(false);
                }}
                className="retro-border bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 text-sm transition active:scale-95 flex items-center justify-center gap-2"
              >
                <span>もう一度、見比べて推理する</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>



      </main>
    </div>
  );
}
