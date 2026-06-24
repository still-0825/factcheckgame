import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, BookOpen, AlertTriangle, CheckCircle, HelpCircle, ArrowRight, RefreshCw, Volume2, VolumeX, X, Link as LinkIcon, Heart } from "lucide-react";

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

// --- Types & Constants ---
type GameState =
  | "STORY_OPENING"
  | "BROWSER_SEARCH"
  | "BOARD_TRIGGER_CONVERSATION"
  | "DEDUCTION_PART"
  | "EXPLANATION_SHEET"
  | "STORY_EPILOGUE"
  | "CREDITS";

interface Evidence {
  id: string;
  title: string;
  source: string;
  content: string;
  badgeColor: string;
}

interface Dialogue {
  char: "レン" | "アオイ" | "タカシ" | "システム";
  text: string;
  avatar: "ren" | "aoi" | "takashi" | "none";
}

// Fixed Pixel Concepts Images
const AVATAR_IMAGES = {
  ren: "/src/assets/images/ren_young_pixel_1782282787763.jpg",
  aoi: "/src/assets/images/aoi_clean_pixel_1782282803962.jpg",
  takashi: "/src/assets/images/character_pixel_concept_1782279857351.jpg",
};

export default function App() {
  const [gameState, setGameState] = useState<GameState>("STORY_OPENING");
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
    lines: Array<{ char: string; text: string; avatar: "ren" | "aoi" }>;
    currentIndex: number;
  } | null>(null);
  const [evidenceTypedText, setEvidenceTypedText] = useState("");
  const [isEvidenceTyping, setIsEvidenceTyping] = useState(false);
  const evidenceTypingTimerRef = useRef<any>(null);

  const evidenceDialoguesMap: Record<string, Array<{ char: string; text: string; avatar: "ren" | "aoi" }>> = {
    evidence_mika: [
      { char: "アオイ", avatar: "aoi", text: "ミカちゃんの個人ブログを見つけたわ。宣伝がすごくいかにもって感じね…。" },
      { char: "レン", avatar: "ren", text: "『1週間で10kg痩せる、副作用ゼロ』か…。それにしても、このサプリ、8,000円ってかなり高額だな。" },
      { char: "アオイ", avatar: "aoi", text: "これで1つ目の証拠付箋ゲットね！他にも証拠がないか調べてみましょう！" }
    ],
    evidence_health: [
      { char: "レン", avatar: "ren", text: "ヘルス・ファクト・オンラインの記事だ。専門家の警告が載っているな。" },
      { char: "アオイ", avatar: "aoi", text: "『多量摂取すると強い下痢の副作用を引き起こす危険性がある』…やっぱり！副作用ゼロなんて大嘘じゃない！" },
      { char: "レン", avatar: "ren", text: "これで重要な証拠付箋が集まったな。嘘を暴く手がかりになりそうだ。" }
    ],
    evidence_national: [
      { char: "アオイ", avatar: "aoi", text: "国民生活安全センター（.go.jp）からの公式警告よ！すごく信頼性の高い一次情報ね。" },
      { char: "レン", avatar: "ren", text: "『臨床データのない誇大広告や健康被害の相談が急増している』か。完全にアウトだな。" },
      { char: "アオイ", avatar: "aoi", text: "公的機関のサイトが発信しているから、最強のファクトチェック素材になるわね！" }
    ]
  };

  // Typewriter effect ref
  const typingTimerRef = useRef<any>(null);
  const browserRef = useRef<HTMLDivElement | null>(null);

  // Sound Muting handler
  const toggleMute = () => {
    sounds.muted = !sounds.muted;
    setIsMuted(sounds.muted);
  };

  // Dialogue Data for Opening
  const openingDialogues: Dialogue[] = [
    { char: "レン", text: "うおおおっ！このSNSの投稿、めちゃくちゃ凄くない！？アオイ！", avatar: "ren" },
    { char: "アオイ", text: "どれどれ？……『奇跡のダイエットフルーツ！』", avatar: "aoi" },
    { char: "アオイ", text: "『青い果物を食べるだけで、運動せずに1週間で10kg痩せる！』", avatar: "aoi" },
    { char: "アオイ", text: "『副作用もゼロ！』……って、これミカが紹介してるやつじゃない。", avatar: "aoi" },
    { char: "レン", text: "そう！ミカちゃんが大絶賛してるんだから絶対に本物だよ！", avatar: "ren" },
    { char: "レン", text: "売り切れる前に早く買わなきゃって、クラスのみんなも騒いでるんだ！", avatar: "ren" },
    { char: "アオイ", text: "ちょっと、レン！いつからネットの書き込みが全部本物になったのよ。", avatar: "aoi" },
    { char: "アオイ", text: "そんな怪しすぎる広告、まずは裏を調べてみなくちゃダメ！", avatar: "aoi" },
    { char: "レン", text: "ええ〜、ミカちゃんが嘘をつくわけないよ。", avatar: "ren" },
    { char: "レン", text: "でもまあ、アオイがそこまで言うなら一応調べてみるけど……。", avatar: "ren" },
    { char: "アオイ", text: "よし、じゃあブラウザの検索システムを立ち上げて。", avatar: "aoi" },
    { char: "アオイ", text: "怪しいと思う「単語」をクリックして、検索窓にセットするのよ。", avatar: "aoi" },
    { char: "アオイ", text: "今回のターゲットは『青い果物』。", avatar: "aoi" },
    { char: "アオイ", text: "見た目での下線やホバーハイライトが出ているものがあるわ。", avatar: "aoi" },
    { char: "アオイ", text: "重要なワードかもしれないわ！クリックしてみてね！", avatar: "aoi" }
  ];

  // Dialogue Data for Board Match Trigger
  const matchDialogues: Dialogue[] = [
    { char: "アオイ", text: "レン、ついに証拠が揃ったわね！", avatar: "aoi" },
    { char: "レン", text: "本当だ！ミカちゃんのブログに書かれている内容と……", avatar: "ren" },
    { char: "レン", text: "医療機関の『痩せる効果はなく、強い下痢になる副作用がある』って記述……", avatar: "ren" },
    { char: "レン", text: "これが完全に矛盾してる！", avatar: "ren" },
    { char: "アオイ", text: "そう、これがデマの正体よ。", avatar: "aoi" },
    { char: "アオイ", text: "集めた証拠を『証拠ボード』で整理したから、一回確認してみましょう！", avatar: "aoi" }
  ];

  // Dialogue Data for Epilogue
  const epilogueDialogues: Dialogue[] = [
    { char: "レン", text: "タカシがデマに騙されずに済んで本当に良かった……。", avatar: "ren" },
    { char: "レン", text: "それにしても、ネットの情報って本当に怖いんだね。", avatar: "ren" },
    { char: "レン", text: "僕、これまでは『みんなが言ってるから』って理由だけで、SNSを信じ込んで拡散してたよ……。", avatar: "ren" },
    { char: "レン", text: "でもそれって、こういうデマで儲けている人を助けて、", avatar: "ren" },
    { char: "レン", text: "大切な人を傷つける手伝いになってたかもしれないんだなって気付いたよ。", avatar: "ren" },
    { char: "レン", text: "これからは、安易に信じてシェアする前に、", avatar: "ren" },
    { char: "レン", text: "一度立ち止まって、自分でしっかり調べるようにするよ！", avatar: "ren" },
    { char: "アオイ", text: "ふふ、分かってくれたなら嬉しいわ。", avatar: "aoi" },
    { char: "アオイ", text: "情報を発信する側にも責任があるんだから、私たちももっと賢くならなきゃね。", avatar: "aoi" },
    { char: "アオイ", text: "さあ、これからもネットの海を渡る時は、二人で一緒にね！", avatar: "aoi" }
  ];




  // Aoi's soft guidance dialogue when failing in deduction
  const [aoiGuidanceActive, setAoiGuidanceActive] = useState(false);
  const aoiGuidanceText = "レン、焦らなくて大丈夫だよ。一度落ち着いてみよう。\n\nタカシくんの『効果が証明された安全な果物』という発言と、私たちが集めた『臨床データが準備中』や『下痢の副作用がある』という証拠に、何か矛盾はないかな？\n\nもう一度、よく見比べてみて！";

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
        setGameState("CREDITS");
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

      // Check if both evidence A and B are gathered to trigger the board match dialogue
      const hasMika = gatheredEvidences.some((e) => e.id === "evidence_mika") || finishedId === "evidence_mika";
      const hasHealth = gatheredEvidences.some((e) => e.id === "evidence_health") || finishedId === "evidence_health";
      
      if (hasMika && hasHealth && !isDeductionTriggered) {
        setIsDeductionTriggered(true);
        setTimeout(() => {
          setGameState("BOARD_TRIGGER_CONVERSATION");
          setCurrentDialogueIndex(0);
        }, 800);
      }
    }
  };

  // Browser Mock Engine Clicking Keyword Handlers (NO underlines, NO cursor hovers style!)
  const handleKeywordClick = (word: string) => {
    sounds.playClick();
    setSearchQuery(word);
    setActiveTab("search");
    
    // Auto-execute search results when keyword clicked
    let results: string[] = [];
    if (word.includes("青い果物") || word.includes("ダイエット")) {
      results = ["mika_blog", "health_fact", "national_center"];
    } else if (word.includes("副作用")) {
      results = ["health_fact", "national_center"];
    } else if (word.includes("臨床データ")) {
      results = ["mika_blog", "national_center"];
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

    const query = searchQuery.trim();
    let results: string[] = [];

    if (query.includes("青い果物") || query.includes("ダイエット")) {
      results = ["mika_blog", "health_fact", "national_center"];
    } else if (query.includes("副作用")) {
      results = ["health_fact", "national_center"];
    } else if (query.includes("臨床データ")) {
      results = ["mika_blog", "national_center"];
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

  // Open web page in mock browser and possibly gather evidence
  const handleOpenPage = (pageId: string) => {
    sounds.playClick();
    if (!openedPages.includes(pageId)) {
      setOpenedPages((prev) => [...prev, pageId]);
    }

    // Add corresponding evidence
    let newEvidence: Evidence | null = null;
    if (pageId === "mika_blog") {
      newEvidence = {
        id: "evidence_mika",
        title: "ミカの宣伝ブログ",
        source: "個人ブログ：ミカのダイエット日記",
        content: "「青い果物は食べるだけで1週間で10kg痩せる！臨床データは準備中だけど、副作用はゼロで安心！」との紹介。高額な購入リンク（8,000円）が貼られている。",
        badgeColor: "bg-amber-100 text-amber-800 border-amber-300"
      };
    } else if (pageId === "health_fact") {
      newEvidence = {
        id: "evidence_health",
        title: "医療ファクトオンラインの記事",
        source: "医療ニュース：ヘルス・ファクト・オンライン",
        content: "専門家による警告。「青い果物は激減効果があるような医学的根拠はなく、多量摂取すると強い下痢の副作用を引き起こす危険性がある」と発表。",
        badgeColor: "bg-rose-100 text-rose-800 border-rose-300"
      };
    } else if (pageId === "national_center") {
      newEvidence = {
        id: "evidence_national",
        title: "国民安全センターの警告",
        source: "公的機関：国民生活安全センター（.go.jp）",
        content: "「海外製の特定の青い果実に関して、臨床データのない誇大広告や、激しい副作用（腹痛・下痢）を伴う健康被害トラブルの相談が急増している」と注意喚起。",
        badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300"
      };
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

    // Claims made by Takashi
    // Claim A: "ミカちゃんが紹介してるんだから、科学的に効果が証明された安全な果物に決まってるだろ！" (Claim ID: "claim_1")
    // Claim B: "早く買わないと売り切れちゃうよ！みんなも買ってるし！" (Claim ID: "claim_2")
    
    // Valid matches: Claim 1 with "evidence_health" (medical news) OR "evidence_national" (national center)
    const isCorrect = 
      selectedClaimId === "claim_1" && 
      (selectedEvidenceId === "evidence_health" || selectedEvidenceId === "evidence_national");

    if (isCorrect) {
      sounds.playCorrect();
      setGameState("EXPLANATION_SHEET");
    } else {
      sounds.playIncorrect();
      const newLives = lives - 1;
      setLives(newLives);

      if (newLives <= 0) {
        // Retry logic: restore lives and reset
        alert("説得失敗……！デマを信じた友達を説得できませんでした。もう一度挑戦しましょう！");
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

      {/* MAIN LAYOUT */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 flex flex-col justify-center relative overflow-hidden">
        
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
                  {gameState === "STORY_OPENING" ? "第1章：奇跡のダイエットフルーツ" : 
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
                      <div className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 shadow-md">
                        <div className="flex gap-3 items-center mb-3">
                          <div className="w-10 h-10 rounded-full bg-rose-700 flex items-center justify-center font-bold text-white text-sm border border-rose-500">
                            ミカ
                          </div>
                          <div>
                            <div className="font-bold text-sm text-neutral-100 flex items-center gap-1.5">
                              <span>ミカ★インフルエンサー</span>
                              <span className="bg-sky-900 text-sky-200 text-[10px] px-1.5 py-0.5 rounded font-bold border border-sky-600">公式</span>
                            </div>
                            <div className="text-[10px] text-neutral-500 font-mono">@mika_diet_life • 10分前</div>
                          </div>
                        </div>

                        {/* CLICKABLE TEXT - HIGHLIGHTED KEYWORDS */}
                        {/* Users click on words to search. We split text and handle clicks. */}
                        <p className="text-neutral-200 leading-relaxed text-base mb-4 tracking-wide font-medium bg-neutral-950 p-3 rounded border border-neutral-800">
                          最近ウワサの「
                          <span 
                            onClick={() => handleKeywordClick("青い果物")} 
                            className="cursor-pointer font-bold text-amber-400 hover:text-amber-300 underline decoration-amber-400/50 underline-offset-2 transition-colors px-1 py-0.5 bg-amber-500/10 rounded"
                          >
                            青い果物
                          </span>
                          」を食べるだけで、運動ゼロで「
                          <span 
                            onClick={() => handleKeywordClick("1週間で10kg")} 
                            className="cursor-pointer font-bold text-amber-400 hover:text-amber-300 underline decoration-amber-400/50 underline-offset-2 transition-colors px-1 py-0.5 bg-amber-500/10 rounded"
                          >
                            1週間で10kg
                          </span>
                          」激痩せしたよ！
                          <span 
                            onClick={() => handleKeywordClick("副作用")} 
                            className="cursor-pointer font-bold text-amber-400 hover:text-amber-300 underline decoration-amber-400/50 underline-offset-2 transition-colors px-1 py-0.5 bg-amber-500/10 rounded"
                          >
                            副作用
                          </span>
                          もなくて本当に安心！私の個人ブログに特設購入リンクを貼ったのでみんな急いで！
                        </p>

                        <div className="text-xs text-neutral-500 border-t border-neutral-800 pt-3 flex justify-between">
                          <span>🔁 1.2万件のリポスト</span>
                          <span>❤️ 3.5万件のいいね</span>
                        </div>
                      </div>

                      {/* Classmate Takashi's panic posting */}
                      <div className="bg-neutral-900/60 p-4 rounded-xl border border-neutral-800/80">
                        <div className="flex gap-3 items-center mb-2">
                          <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center font-bold text-white text-xs border border-blue-600">
                            タ
                          </div>
                          <div>
                            <div className="font-bold text-xs text-neutral-300">タカシ (クラスメイト)</div>
                            <div className="text-[9px] text-neutral-500 font-mono">@takashi_soccer • 2分前</div>
                          </div>
                        </div>
                        <p className="text-xs text-neutral-300 leading-relaxed">
                          ミカちゃんお勧めの「
                          <span 
                            onClick={() => handleKeywordClick("青い果物")} 
                            className="cursor-pointer font-bold text-amber-400 hover:text-amber-300 underline decoration-amber-400/50 underline-offset-1 transition-colors px-1 bg-amber-500/10 rounded"
                          >
                            青い果物
                          </span>
                          」ガチじゃん！！これ買えば部活サボっても体が軽くなるやつ！？売り切れる前に小遣い全部はたいて買うしかないな
                        </p>
                      </div>
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
                            if (pageId === "mika_blog") {
                              return (
                                <div key={pageId} className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 hover:border-amber-500/50 transition-all shadow">
                                  <span className="text-xs text-amber-500 font-bold">個人ブログ</span>
                                  <h4 
                                    onClick={() => handleOpenPage("mika_blog")}
                                    className="text-lg font-bold text-sky-400 hover:underline cursor-pointer mt-1"
                                  >
                                    ミカのダイエットブログ：飲むだけで1週間10kg!? 奇跡の青い果実!
                                  </h4>
                                  <p className="text-xs text-neutral-500 mt-0.5">http://mika-diet-diary.net/special-blue-fruit</p>
                                  <p className="text-sm text-neutral-300 mt-2 leading-relaxed">
                                    みんな、あの噂の「
                                    <span 
                                      onClick={() => handleKeywordClick("青い果物")} 
                                      className="cursor-pointer font-bold text-amber-400 hover:text-amber-300 underline decoration-amber-400/50 underline-offset-1 transition-colors px-1 bg-amber-500/10 rounded"
                                    >
                                      青い果物
                                    </span>
                                    」の効果はガチ！
                                    飲むだけで理想のスタイルに。現在、検証のための詳しい「
                                    <span 
                                      onClick={() => handleKeywordClick("臨床データ")} 
                                      className="cursor-pointer font-bold text-amber-400 hover:text-amber-300 underline decoration-amber-400/50 underline-offset-1 transition-colors px-1 bg-amber-500/10 rounded"
                                    >
                                      臨床データ
                                    </span>
                                    」は準備中だけど、副作用は完全にゼロだよ！
                                  </p>
                                </div>
                              );
                            }
                            if (pageId === "health_fact") {
                              return (
                                <div key={pageId} className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 hover:border-rose-500/50 transition-all shadow">
                                  <span className="text-xs text-rose-500 font-bold">医療専門ニュース</span>
                                  <h4 
                                    onClick={() => handleOpenPage("health_fact")}
                                    className="text-lg font-bold text-sky-400 hover:underline cursor-pointer mt-1"
                                  >
                                    【専門家警告】噂の「青い果物」のダイエット効果と重篤な副作用の懸念
                                  </h4>
                                  <p className="text-xs text-neutral-500 mt-0.5">http://health-fact-online.org/article/blue-fruit-caution</p>
                                  <p className="text-sm text-neutral-300 mt-2 leading-relaxed">
                                    SNSで流布する「
                                    <span 
                                      onClick={() => handleKeywordClick("青い果物")} 
                                      className="cursor-pointer font-bold text-amber-400 hover:text-amber-300 underline decoration-amber-400/50 underline-offset-1 transition-colors px-1 bg-amber-500/10 rounded"
                                    >
                                      青い果物
                                    </span>
                                    」について、
                                    日本医師機関は「劇的な減量を裏付ける具体的な科学的根拠（
                                    <span 
                                      onClick={() => handleKeywordClick("臨床データ")} 
                                      className="cursor-pointer font-bold text-amber-400 hover:text-amber-300 underline decoration-amber-400/50 underline-offset-1 transition-colors px-1 bg-amber-500/10 rounded"
                                    >
                                      臨床データ
                                    </span>
                                    ）は一切ない」と発表。
                                    さらに、多量摂取した場合、強い下痢や脱水症状などの「
                                    <span 
                                      onClick={() => handleKeywordClick("副作用")} 
                                      className="cursor-pointer font-bold text-amber-400 hover:text-amber-300 underline decoration-amber-400/50 underline-offset-1 transition-colors px-1 bg-amber-500/10 rounded"
                                    >
                                      副作用
                                    </span>
                                    」を惹起する恐れがあるとして強く警告している。
                                  </p>
                                </div>
                              );
                            }
                            if (pageId === "national_center") {
                              return (
                                <div key={pageId} className="bg-neutral-900 p-4 rounded-xl border border-neutral-800 hover:border-emerald-500/50 transition-all shadow">
                                  <span className="text-xs text-emerald-500 font-bold">公的・政府機関 (.go.jp)</span>
                                  <h4 
                                    onClick={() => handleOpenPage("national_center")}
                                    className="text-lg font-bold text-sky-400 hover:underline cursor-pointer mt-1"
                                  >
                                    国民生活安全センター：海外製の未承認「青い果実」による健康トラブル相談への注意喚起
                                  </h4>
                                  <p className="text-xs text-neutral-500 mt-0.5">https://www.kokusen.go.jp/news/blue-fruit-alert.html</p>
                                  <p className="text-sm text-neutral-300 mt-2 leading-relaxed">
                                    海外の不当な業者が販売している「
                                    <span 
                                      onClick={() => handleKeywordClick("青い果物")} 
                                      className="cursor-pointer font-bold text-amber-400 hover:text-amber-300 underline decoration-amber-400/50 underline-offset-1 transition-colors px-1 bg-amber-500/10 rounded"
                                    >
                                      青い果物
                                    </span>
                                    」の輸入トラブル相談が激増。
                                    「
                                    <span 
                                      onClick={() => handleKeywordClick("臨床データ")} 
                                      className="cursor-pointer font-bold text-amber-400 hover:text-amber-300 underline decoration-amber-400/50 underline-offset-1 transition-colors px-1 bg-amber-500/10 rounded"
                                    >
                                      臨床データ
                                    </span>
                                    」がなく、過大な広告による詐欺被害が疑われるもの、および激しい「
                                    <span 
                                      onClick={() => handleKeywordClick("副作用")} 
                                      className="cursor-pointer font-bold text-amber-400 hover:text-amber-300 underline decoration-amber-400/50 underline-offset-1 transition-colors px-1 bg-amber-500/10 rounded"
                                    >
                                      副作用
                                    </span>
                                    」の被害情報。
                                    ドメインが「.go.jp」等の公的機関の一次情報を精査するよう呼びかけています。
                                  </p>
                                </div>
                              );
                            }
                            return null;
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
                  デマ論破パート：タカシを説得せよ
                </span>
                <p className="text-neutral-400 text-xs mt-2">
                  タカシの誤った主張を1つクリックし、それと「完全に矛盾する証拠付箋」を突きつけて冷静にさせましょう！
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
                            src={AVATAR_IMAGES.takashi} 
                            alt="タカシ" 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover pixelated scale-110 object-top"
                          />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-neutral-200">タカシ (クラスメイト)</h4>
                          <span className="text-[10px] text-rose-400 bg-rose-950/40 px-2 py-0.5 border border-rose-900/60 font-mono">デマ信じ込み状態</span>
                        </div>
                      </div>

                      {/* OPPONENT CLAIMS (STEP 1 Selection) */}
                      <div className="flex flex-col gap-3">
                        <button
                          onClick={() => {
                            sounds.playClick();
                            setSelectedClaimId("claim_1");
                          }}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                            selectedClaimId === "claim_1"
                              ? "bg-rose-950/40 border-rose-500 shadow-rose-900/40 shadow-lg text-white"
                              : "bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700"
                          }`}
                        >
                          <div className="text-[10px] font-mono text-rose-500 mb-1">【主張A】</div>
                          <p className="text-base font-bold leading-relaxed">
                            「ミカちゃんが紹介してるんだから、科学的に効果が証明された安全な果物に決まってるだろ！」
                          </p>
                        </button>

                        <button
                          onClick={() => {
                            sounds.playClick();
                            setSelectedClaimId("claim_2");
                          }}
                          className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                            selectedClaimId === "claim_2"
                              ? "bg-rose-950/40 border-rose-500 shadow-rose-900/40 shadow-lg text-white"
                              : "bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-700"
                          }`}
                        >
                          <div className="text-[10px] font-mono text-rose-500 mb-1">【主張B】</div>
                          <p className="text-base font-bold leading-relaxed">
                            「早く買わないと売り切れちゃうよ！みんなも買ってるし！」
                          </p>
                        </button>
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
                  <h2 className="text-2xl font-bold text-emerald-400">第1章ファクトチェック完了！</h2>
                  <p className="text-xs text-neutral-400">
                    科学的根拠（臨床データ）のないヘルスケアデマの矛盾を見事に暴き、友達を救いました！
                  </p>
                </div>
              </div>

              {/* SHEET CONTENT CONTAINER */}
              <div className="flex flex-col gap-4 text-neutral-300 leading-relaxed text-sm md:text-base">
                
                {/* CASE MODEL */}
                <div className="bg-neutral-900 p-4 rounded-lg border border-neutral-800">
                  <h3 className="text-emerald-400 font-bold text-base mb-1.5 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-emerald-500 inline-block" />
                    実在する類似のデマ・フェイク事例モデル
                  </h3>
                  <p className="text-neutral-300 text-xs md:text-sm">
                    過去、SNSやブログ上で「〇〇という食材を食べるだけで劇的に痩せる」「病気が完治する」といった広告や偽ニュースが数多く流行しました。
                    特にインフルエンサーの信頼度を悪用し、実態のないサプリメントや果物を高額で販売するアフィリエイト詐欺や誇大広告は、日常的に頻発しています。
                  </p>
                </div>

                {/* PRACTICAL SKILLS */}
                <div className="bg-neutral-900 p-4 rounded-lg border border-neutral-800">
                  <h3 className="text-emerald-400 font-bold text-base mb-1.5 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-emerald-500 inline-block" />
                    日常生活でだまされないためのファクトチェック技術
                  </h3>
                  <ul className="list-decimal pl-5 space-y-2 text-xs md:text-sm text-neutral-300">
                    <li>
                      <strong className="text-white">情報の発信元（一次データ）を特定する:</strong> 
                      インフルエンサーの言葉を鵜呑みにせず、大学の研究機関や医師会、または厚生労働省などの公的な一次ソースで調べ直す。
                    </li>
                    <li>
                      <strong className="text-white">URLの「ドメイン（末尾）」に注目する:</strong> 
                      日本の政府機関や公的機関は <code className="bg-neutral-950 text-rose-400 px-1 rounded font-mono font-bold">.go.jp</code>、
                      大学・研究機関は <code className="bg-neutral-950 text-rose-400 px-1 rounded font-mono font-bold">.ac.jp</code> という専用のドメインを使用しています。
                      これらが含まれるURLは非常に高い信頼性を持っています。
                    </li>
                    <li>
                      <strong className="text-white">シェアする前に「立ち止まる」:</strong> 
                      「面白い」「みんなに教えたい」と感情が刺激された時ほど、それが悪質なデマ発信者を儲けさせる手助け（アクセス数稼ぎ）になっていないか、一度考える癖をつけましょう。
                    </li>
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
                  本デモは、メディアリテラシー向上ゲーム「FactChecker」のコアシステムおよび第1章（ヘルスケアデマ）をシミュレートしたものです。
                  この仕様書とプロトタイプを元に、次回のフルビルドへと進みます。
                </p>
              </div>

              <button
                onClick={() => {
                  sounds.playClick();
                  setGameState("STORY_OPENING");
                  setCurrentDialogueIndex(0);
                  setGatheredEvidences([]);
                  setOpenedPages([]);
                  setSearchQuery("");
                  setLives(3);
                  setIsDeductionTriggered(false);
                }}
                className="retro-border bg-neutral-800 hover:bg-neutral-700 text-neutral-200 py-3 font-bold transition flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>タイトルへ（もう一度遊ぶ）</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

      </main>

      {/* ========================================================
          6. EVIDENCE BOARD OVERLAY (SPEC MANDATE)
          ======================================================== */}
      <AnimatePresence>
        {showEvidenceBoardOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            // SPEC RULE: 灰色系のフィルター(バックドロップ)で、裏の画面の操作を完全に遮断
            className="fixed inset-0 bg-neutral-950/85 backdrop-blur-[3px] backdrop-grayscale flex justify-center items-center z-50 p-4"
            onClick={() => setShowEvidenceBoardOverlay(false)} // Click outside to close safely
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-amber-950/20 border-4 border-amber-900 w-full max-w-4xl retro-border rounded-xl shadow-2xl relative flex flex-col h-[550px] overflow-hidden"
              onClick={(e) => e.stopPropagation()} // Stop propagation so clicking board doesn't close it
            >
              
              {/* Header Corkboard bar */}
              <div className="bg-amber-950 text-amber-100 p-4 flex justify-between items-center border-b-2 border-amber-900">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-lg tracking-wide">証拠整理ボード (Evidence Board)</h3>
                </div>
                
                <button
                  onClick={() => {
                    sounds.playClick();
                    setShowEvidenceBoardOverlay(false);
                  }}
                  className="bg-amber-900 hover:bg-amber-800 p-1 rounded text-amber-200 transition"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Corkboard Workspace (rendered via wood-style retro pixel pattern) */}
              <div 
                className="flex-1 p-6 relative overflow-auto"
                style={{
                  backgroundColor: "#5c3a21",
                  backgroundImage: "radial-gradient(#4d2e1a 15%, transparent 15%)",
                  backgroundSize: "16px 16px"
                }}
              >
                
                {/* SVG Connections Canvas for Relationship lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                  {/* Draw connection if we have Mika and Medical news */}
                  {gatheredEvidences.some(e => e.id === "evidence_mika") && 
                   gatheredEvidences.some(e => e.id === "evidence_health") && (
                    <g>
                      {/* Red line representing CONTRADICTION */}
                      <path 
                        d="M 220 200 Q 420 180 620 200" 
                        fill="none" 
                        stroke="#ef4444" 
                        strokeWidth="5" 
                        strokeDasharray="8,6"
                        className="animate-[dash_2s_linear_infinite]"
                      />
                      {/* Label for relation */}
                      <foreignObject x="350" y="150" width="140" height="36">
                        <div className="bg-rose-600 text-white border-2 border-rose-400 px-2 py-0.5 rounded text-xs font-bold text-center font-mono shadow">
                          ⚡ 矛盾
                        </div>
                      </foreignObject>
                    </g>
                  )}

                  {/* Draw connection if we have Mika and National Center */}
                  {gatheredEvidences.some(e => e.id === "evidence_mika") && 
                   gatheredEvidences.some(e => e.id === "evidence_national") && (
                    <g>
                      {/* Blue/Red line representing Warning/Reference */}
                      <path 
                        d="M 220 200 Q 420 380 620 350" 
                        fill="none" 
                        stroke="#ef4444" 
                        strokeWidth="4" 
                        strokeDasharray="6,4"
                      />
                      <foreignObject x="370" y="270" width="100" height="36">
                        <div className="bg-rose-600 text-white border border-rose-300 px-2 py-0.5 rounded text-[10px] font-bold text-center font-mono">
                          ⚡ 矛盾
                        </div>
                      </foreignObject>
                    </g>
                  )}

                  {/* Draw connection if we have Medical News and National Center */}
                  {gatheredEvidences.some(e => e.id === "evidence_health") && 
                   gatheredEvidences.some(e => e.id === "evidence_national") && (
                    <g>
                      {/* Green line representing SUPPORT/CORROBORATION */}
                      <path 
                        d="M 620 200 L 620 350" 
                        fill="none" 
                        stroke="#10b981" 
                        strokeWidth="4" 
                        strokeDasharray="6,4"
                      />
                      <foreignObject x="580" y="260" width="100" height="36">
                        <div className="bg-emerald-600 text-white border border-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold text-center font-mono">
                          ✓ 裏付け
                        </div>
                      </foreignObject>
                    </g>
                  )}
                </svg>

                {/* PLACED STICKY NOTES WITH ANIMATION (MANDATE: Pinned Animation) */}
                <div className="relative w-full h-full min-h-[400px] z-10">
                  
                  {/* STICKY 1: MIKA BLOG */}
                  {gatheredEvidences.some(e => e.id === "evidence_mika") ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -15 }}
                      animate={{ scale: 1, rotate: -2 }}
                      className="absolute left-4 top-12 w-64 bg-amber-100 border-2 border-amber-300 p-4 rounded shadow-xl text-neutral-800"
                    >
                      <div className="w-4 h-4 bg-rose-600 rounded-full border border-neutral-900 absolute -top-2 left-1/2 -translate-x-1/2 shadow-inner" /> {/* Red Pin */}
                      <span className="text-[9px] font-bold bg-amber-200 px-1.5 py-0.5 rounded text-amber-800">
                        証拠A
                      </span>
                      <h4 className="font-bold text-xs mt-1 border-b border-amber-200 pb-1">
                        ミカのダイエットブログ
                      </h4>
                      <p className="text-[11px] leading-relaxed mt-1 text-neutral-700">
                        「青い果物は食べるだけで1週間で10kg痩せる！臨床データは準備中、副作用はゼロ！」と高額な購入リンクを掲載。
                      </p>
                    </motion.div>
                  ) : (
                    <div className="absolute left-4 top-12 w-64 h-32 border-2 border-dashed border-neutral-600 rounded flex items-center justify-center text-xs text-neutral-500">
                      未発見の証拠A
                    </div>
                  )}

                  {/* STICKY 2: MEDICAL NEWS */}
                  {gatheredEvidences.some(e => e.id === "evidence_health") ? (
                    <motion.div
                      initial={{ scale: 0, rotate: 15 }}
                      animate={{ scale: 1, rotate: 3 }}
                      className="absolute right-4 top-12 w-64 bg-rose-100 border-2 border-rose-300 p-4 rounded shadow-xl text-neutral-800"
                    >
                      <div className="w-4 h-4 bg-sky-600 rounded-full border border-neutral-900 absolute -top-2 left-1/2 -translate-x-1/2 shadow-inner" /> {/* Blue Pin */}
                      <span className="text-[9px] font-bold bg-rose-200 px-1.5 py-0.5 rounded text-rose-800">
                        証拠B
                      </span>
                      <h4 className="font-bold text-xs mt-1 border-b border-rose-200 pb-1">
                        医療ニュース：ヘルスファクト
                      </h4>
                      <p className="text-[11px] leading-relaxed mt-1 text-neutral-700">
                        「劇的減量を裏付ける科学的根拠（臨床データ）はなく、多量摂取は強い下痢などの副作用を引き起こす」と警告。
                      </p>
                    </motion.div>
                  ) : (
                    <div className="absolute right-4 top-12 w-64 h-32 border-2 border-dashed border-neutral-600 rounded flex items-center justify-center text-xs text-neutral-500">
                      未発見の証拠B
                    </div>
                  )}

                  {/* STICKY 3: NATIONAL COKUSEN */}
                  {gatheredEvidences.some(e => e.id === "evidence_national") ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -5 }}
                      animate={{ scale: 1, rotate: 1 }}
                      className="absolute left-1/3 bottom-4 w-72 bg-emerald-100 border-2 border-emerald-300 p-4 rounded shadow-xl text-neutral-800"
                    >
                      <div className="w-4 h-4 bg-emerald-600 rounded-full border border-neutral-900 absolute -top-2 left-1/2 -translate-x-1/2 shadow-inner" /> {/* Green Pin */}
                      <span className="text-[9px] font-bold bg-emerald-200 px-1.5 py-0.5 rounded text-emerald-800">
                        証拠C
                      </span>
                      <h4 className="font-bold text-xs mt-1 border-b border-emerald-200 pb-1">
                        国民生活安全センター (.go.jp)
                      </h4>
                      <p className="text-[11px] leading-relaxed mt-1 text-neutral-700">
                        「臨床データのない誇大広告によるトラブル、強い副作用（下痢）を伴う健康トラブルの相談が急増中」と公的に警告。
                      </p>
                    </motion.div>
                  ) : (
                    <div className="absolute left-1/3 bottom-4 w-72 h-32 border-2 border-dashed border-neutral-600 rounded flex items-center justify-center text-xs text-neutral-500">
                      未発見の証拠C
                    </div>
                  )}

                </div>

              </div>

              {/* Bottom bar of Board */}
              <div className="bg-amber-950 p-4 text-center text-xs text-amber-200 border-t-2 border-amber-900">
                証拠同士を繋ぐ実線の関係性を整理して、対決時の論破ロジックを頭の中で組み立てましょう。
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

      {/* ========================================================
          8. EVIDENCE ACQUISITION DIALOGUE OVERLAY
          ======================================================== */}
      <AnimatePresence>
        {activeEvidenceDialogue && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-neutral-950/85 flex justify-center items-center z-50 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-neutral-900 retro-border w-full max-w-xl p-5 shadow-2xl flex flex-col gap-5 relative overflow-hidden"
            >
              {/* Evidence header info */}
              <div className="absolute top-2 right-3 text-[10px] text-amber-400 font-bold tracking-widest bg-amber-950/50 px-2 py-0.5 rounded border border-amber-800">
                証拠獲得！
              </div>

              {/* Characters Visual Stage */}
              <div className="h-40 bg-neutral-950 rounded-lg border-2 border-neutral-800 flex justify-around items-end p-2 relative overflow-hidden pixel-bg">
                <div className="absolute top-2 left-2 text-[10px] text-neutral-500 font-mono">
                  検証ボード
                </div>

                {/* Speaker indicator & Characters layout */}
                <div className="flex justify-center items-end w-full h-full gap-8">
                  {/* Ren */}
                  <div className={`flex flex-col items-center transition-all duration-300 ${activeEvidenceDialogue.lines[activeEvidenceDialogue.currentIndex]?.avatar === "ren" ? "scale-105 opacity-100" : "opacity-40 scale-95"}`}>
                    <div className="w-16 h-20 border-2 border-neutral-700 rounded bg-neutral-900 overflow-hidden relative">
                      <img 
                        src={AVATAR_IMAGES.ren} 
                        alt="レン" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover pixelated scale-110 object-top"
                      />
                    </div>
                    <span className="mt-1 text-[10px] bg-blue-900 px-2 py-0.5 rounded border border-blue-600 font-bold text-blue-200">
                      レン
                    </span>
                  </div>

                  {/* Aoi */}
                  <div className={`flex flex-col items-center transition-all duration-300 ${activeEvidenceDialogue.lines[activeEvidenceDialogue.currentIndex]?.avatar === "aoi" ? "scale-105 opacity-100" : "opacity-40 scale-95"}`}>
                    <div className="w-16 h-20 border-2 border-neutral-700 rounded bg-neutral-900 overflow-hidden relative">
                      <img 
                        src={AVATAR_IMAGES.aoi} 
                        alt="アオイ" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover pixelated scale-115 object-bottom"
                      />
                    </div>
                    <span className="mt-1 text-[10px] bg-rose-900 px-2 py-0.5 rounded border border-rose-600 font-bold text-rose-200">
                      アオイ
                    </span>
                  </div>
                </div>
              </div>

              {/* Speech bubble */}
              <div 
                onClick={nextEvidenceDialogue}
                className="retro-border bg-neutral-950 p-4 cursor-pointer hover:bg-neutral-900 transition-all flex flex-col min-h-[100px] justify-between relative group"
              >
                <div>
                  <div className="text-amber-500 text-xs font-bold mb-1 select-none">
                    <span>【 {activeEvidenceDialogue.lines[activeEvidenceDialogue.currentIndex]?.char} 】</span>
                  </div>
                  <p className="text-sm leading-relaxed text-neutral-100 tracking-wide font-medium whitespace-pre-wrap break-words">
                    {evidenceTypedText}
                    {isEvidenceTyping && <span className="inline-block w-1.5 h-3 bg-neutral-400 ml-1 animate-pulse" />}
                  </p>
                </div>

                <div className="self-end flex items-center gap-1 text-[10px] text-neutral-500 group-hover:text-amber-400 transition-colors mt-3">
                  <span>{isEvidenceTyping ? "スキップ" : activeEvidenceDialogue.currentIndex < activeEvidenceDialogue.lines.length - 1 ? "クリックで次へ" : "閉じる"}</span>
                  <ArrowRight className="w-3 h-3 animate-bounce" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
