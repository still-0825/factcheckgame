/**
 * FactChecker Web Audio API BGM & SE 自動演奏システム
 * 外部の音声ファイルを読み込むことなく、ブラウザ上でリアルタイムにシンセサイズして再生します。
 */

type BGMMode = "mystery" | "investigation" | "board" | "tension" | "clear";

class AudioManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private seGain: GainNode | null = null;

  // 自動演奏用のスケジューラ変数
  private isBgmPlaying: boolean = false;
  private timerId: any = null;
  private nextNoteTime: number = 0;
  private currentStep: number = 0;
  private bpm: number = 105;
  private currentMode: BGMMode = "mystery";

  // 音量の設定 (0.0 〜 1.0)
  private masterVolumeVal: number = 0.5;
  private bgmVolumeVal: number = 0.4;
  private seVolumeVal: number = 0.6;

  // ディレイエフェクト（空間系）用のノード
  private delayNode: DelayNode | null = null;
  private delayFeedback: GainNode | null = null;

  constructor() {
    // サーバーサイドでのエラーを避けるためのガード
    if (typeof window !== "undefined") {
      // ユーザーのインタラクションを待って初期化します
    }
  }

  /**
   * AudioContextの遅延初期化
   */
  private init() {
    if (this.ctx) return;

    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) {
      console.warn("Web Audio API is not supported in this browser.");
      return;
    }

    this.ctx = new AudioContextClass();
    
    // マスターゲイン
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.masterVolumeVal, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // BGM用ゲイン
    this.bgmGain = this.ctx.createGain();
    this.bgmGain.gain.setValueAtTime(this.bgmVolumeVal, this.ctx.currentTime);
    this.bgmGain.connect(this.masterGain);

    // SE用ゲイン
    this.seGain = this.ctx.createGain();
    this.seGain.gain.setValueAtTime(this.seVolumeVal, this.ctx.currentTime);
    this.seGain.connect(this.masterGain);

    // ディレイノードの設定 (空間系エフェクトでBGMをリッチにする)
    this.delayNode = this.ctx.createDelay(1.0);
    this.delayFeedback = this.ctx.createGain();

    this.delayNode.delayTime.setValueAtTime(0.35, this.ctx.currentTime); // ディレイ時間 (約350ms)
    this.delayFeedback.gain.setValueAtTime(0.3, this.ctx.currentTime);  // フィードバック量

    // ディレイのループ接続
    this.delayNode.connect(this.delayFeedback);
    this.delayFeedback.connect(this.delayNode);
    this.delayNode.connect(this.bgmGain); // 最終的にBGMの出力へ
  }

  /**
   * マスター音量の設定
   */
  public setMasterVolume(volume: number) {
    this.masterVolumeVal = Math.max(0, Math.min(1, volume));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.masterVolumeVal, this.ctx.currentTime);
    }
  }

  /**
   * BGM音量の設定
   */
  public setBgmVolume(volume: number) {
    this.bgmVolumeVal = Math.max(0, Math.min(1, volume));
    if (this.bgmGain && this.ctx) {
      this.bgmGain.gain.setValueAtTime(this.bgmVolumeVal, this.ctx.currentTime);
    }
  }

  /**
   * SE音量の設定
   */
  public setSeVolume(volume: number) {
    this.seVolumeVal = Math.max(0, Math.min(1, volume));
    if (this.seGain && this.ctx) {
      this.seGain.gain.setValueAtTime(this.seVolumeVal, this.ctx.currentTime);
    }
  }

  public getBgmVolume(): number {
    return this.bgmVolumeVal;
  }

  /**
   * BGMの再生/一時停止
   */
  public toggleBgm(): boolean {
    this.init();
    if (!this.ctx) return false;

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    if (this.isBgmPlaying) {
      this.stopBgm();
    } else {
      this.startBgm();
    }
    return this.isBgmPlaying;
  }

  public isPlaying(): boolean {
    return this.isBgmPlaying;
  }

  private startBgm() {
    if (this.isBgmPlaying || !this.ctx) return;
    this.isBgmPlaying = true;
    this.nextNoteTime = this.ctx.currentTime;
    this.currentStep = 0;
    this.scheduler();
  }

  public stopBgm() {
    this.isBgmPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  }

  /**
   * BGMの雰囲気をゲームの状況に合わせて動的に切り替えます
   */
  public setMode(mode: BGMMode) {
    this.currentMode = mode;
    // モードに応じてテンポやコード進行の雰囲気を変える
    switch (mode) {
      case "mystery":
        this.bpm = 100;
        break;
      case "investigation":
        this.bpm = 112;
        break;
      case "board":
        this.bpm = 92; // 熟考用に少し遅く
        break;
      case "tension":
        this.bpm = 120; // 推理用に少し早く
        break;
      case "clear":
        this.bpm = 115;
        break;
    }
  }

  /**
   * 自動演奏の周期スケジューラ
   */
  private scheduler() {
    if (!this.isBgmPlaying || !this.ctx) return;

    // 先読み時間 (0.1秒) の間にある音符をすべてスケジュールする
    const scheduleAheadTime = 0.1;
    while (this.nextNoteTime < this.ctx.currentTime + scheduleAheadTime) {
      this.scheduleNote(this.currentStep, this.nextNoteTime);
      this.advanceNote();
    }

    // 25ミリ秒ごとにスケジューラを再起動
    this.timerId = setTimeout(() => this.scheduler(), 25);
  }

  /**
   * 次の音符へステップを進める
   */
  private advanceNote() {
    if (!this.ctx) return;
    const secondsPerBeat = 60.0 / this.bpm;
    // 1ステップは16分音符 (1拍の4分の1)
    const stepDuration = 0.25 * secondsPerBeat;
    this.nextNoteTime += stepDuration;
    this.currentStep = (this.currentStep + 1) % 16; // 16ステップのループ
  }

  /**
   * 特定のステップの音をシンセサイズしてトリガーする
   */
  private scheduleNote(step: number, time: number) {
    if (!this.ctx || !this.bgmGain) return;

    // モードごとのコード進行定義 (周波数 Hz)
    // A=220Hzを基準としたマイナースケール or メジャースケール
    // 0: A3, 1: B3, 2: C4, 3: D4, 4: E4, 5: F4, 6: G4, 7: A4, 8: B4, 9: C5, 10: D5, 11: E5
    const scale = [220.00, 246.94, 261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33, 659.25];

    let rootFreq = scale[0]; // A3 (220Hz)
    let chordNotes = [scale[0], scale[2], scale[4]]; // Am

    // 4小節(16ステップ * 4 = 64ステップ)の大きな流れを作るためのコード進行
    const measure = Math.floor(step / 4); // 0〜3
    // ここでは16ステップのループ内で4拍（4ステップごと）にコードを変える
    const chordIndex = Math.floor(step / 4); 

    if (this.currentMode === "clear") {
      // メジャー進行 (C -> G -> F -> G)
      const cMajor = [scale[2], scale[4], scale[7]]; // C
      const gMajor = [scale[1], scale[4], scale[6]]; // G
      const fMajor = [scale[0], scale[2], scale[5]]; // F
      if (chordIndex === 0) chordNotes = cMajor;
      else if (chordIndex === 1) chordNotes = gMajor;
      else if (chordIndex === 2) chordNotes = fMajor;
      else chordNotes = gMajor;
    } else if (this.currentMode === "tension") {
      // 緊張感のある半音の対立 (Am -> A#dim -> Am -> Bb)
      const am = [scale[0], scale[2], scale[4]];
      const ashock = [scale[0], scale[2], 233.08]; // A#ベースの不穏コード
      if (chordIndex === 0 || chordIndex === 2) {
        chordNotes = am;
      } else {
        chordNotes = ashock;
      }
    } else if (this.currentMode === "board") {
      // 熟考・静かな進行 (Am -> Em -> F -> Em)
      const am = [scale[0], scale[2], scale[4]];
      const em = [scale[1], scale[4], scale[6]];
      const fmaj = [scale[0], scale[2], scale[5]];
      if (chordIndex === 0) chordNotes = am;
      else if (chordIndex === 1) chordNotes = em;
      else if (chordIndex === 2) chordNotes = fmaj;
      else chordNotes = em;
    } else {
      // 通常・ミステリー (Am -> F -> C -> G)
      const am = [scale[0], scale[2], scale[4]];
      const fmaj = [scale[0], scale[2], scale[5]];
      const cmaj = [scale[2], scale[4], scale[7]];
      const gmaj = [scale[1], scale[4], scale[6]];
      if (chordIndex === 0) chordNotes = am;
      else if (chordIndex === 1) chordNotes = fmaj;
      else if (chordIndex === 2) chordNotes = cmaj;
      else chordNotes = gmaj;
    }

    // 1. ベースライン (ステップ 0, 4, 8, 12 で鳴らす)
    if (step % 4 === 0) {
      this.playBass(chordNotes[0] / 2, time, 0.8); // 1オクターブ下
    }

    // 2. アルペジオ (メロディー)
    // 16ステップの中で特定のパターンで音を散りばめる
    let shouldPlayMelody = false;
    let noteIndex = 0;

    if (this.currentMode === "board") {
      // 熟考モードは非常にまばらに
      const pattern = [true, false, false, false, false, true, false, false, true, false, false, false, false, false, false, false];
      shouldPlayMelody = pattern[step];
      noteIndex = (step * 3) % chordNotes.length;
    } else if (this.currentMode === "tension") {
      // 緊張モードは16分音符が焦らすように細かく刻む
      const pattern = [true, false, true, false, true, true, false, true, true, false, true, false, true, true, false, true];
      shouldPlayMelody = pattern[step];
      noteIndex = (step * 7) % chordNotes.length;
    } else if (this.currentMode === "clear") {
      // クリアモードは明るい高音が跳ねるように
      const pattern = [true, false, true, false, false, true, false, true, true, false, true, false, false, true, true, false];
      shouldPlayMelody = pattern[step];
      noteIndex = step % chordNotes.length;
    } else {
      // 通常
      const pattern = [true, false, false, true, false, true, false, false, true, false, true, false, false, true, false, false];
      shouldPlayMelody = pattern[step];
      noteIndex = (step * 2) % chordNotes.length;
    }

    if (shouldPlayMelody) {
      // ランダムにオクターブを上げてキラキラ感を出す
      let noteFreq = chordNotes[noteIndex];
      if (step % 3 === 0) noteFreq *= 2; // 1オクターブ上
      this.playPluck(noteFreq, time, 0.15);
    }

    // 3. ミニマルなビート (ハイハット的な金属音)
    // 推理・緊張、またはクリアの時のみリズムを刻む
    if (this.currentMode === "tension" || this.currentMode === "investigation" || this.currentMode === "clear") {
      // 16ステップのうち、8の裏、16の裏、あるいは偶数ステップで
      if (step % 2 === 1) {
        const volume = (step % 4 === 2) ? 0.05 : 0.02; // 強弱
        this.playTick(time, volume);
      }
    }
  }

  /**
   * 深い低音ベースをシンセサイズ
   */
  private playBass(freq: number, startTime: number, duration: number) {
    if (!this.ctx || !this.bgmGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(freq, startTime);

    // ローパスフィルターで高音をカットして丸く太い低音にする
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(250, startTime);

    // アンプエンベロープ (Attack, Decay, Release)
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.32, startTime + 0.1); // Attack
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration); // Decay-Release

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.bgmGain);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.1);
  }

  /**
   * キラキラしたアルペジオ・メロディ音をシンセサイズ
   */
  private playPluck(freq: number, startTime: number, duration: number) {
    if (!this.ctx || !this.bgmGain || !this.delayNode) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // 知的でクリアな三角波を使用
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, startTime);

    // アタックが極めて速く、すぐに消え入るプラックエンベロープ
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.18, startTime + 0.005); // Attack
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration); // Decay-Release

    osc.connect(gain);
    
    // ダイレクト音をBGMへ
    gain.connect(this.bgmGain);
    // 空間の広がりを作るためにディレイエフェクトへも送る
    gain.connect(this.delayNode);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }

  /**
   * ミニマルビート用の極めて短い金属音 (疑似ハイハット)
   */
  private playTick(startTime: number, volume: number) {
    if (!this.ctx || !this.bgmGain) return;

    // ノイズを生成する代わりに、高周波のサイン波で超高速なピチピチ音を作る
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(8000, startTime); // 高周波

    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.001);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.02); // 非常に短い

    osc.connect(gain);
    gain.connect(this.bgmGain);

    osc.start(startTime);
    osc.stop(startTime + 0.03);
  }

  // ==========================================
  // 効果音 (SE) シンセサイズセクション
  // ==========================================

  /**
   * ボタンクリック時のSE
   */
  public playClick() {
    this.init();
    if (!this.ctx || !this.seGain) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const t = this.ctx.currentTime;

    osc.type = "sine";
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(150, t + 0.05);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.connect(gain);
    gain.connect(this.seGain);

    osc.start(t);
    osc.stop(t + 0.06);
  }

  /**
   * ファクト（証拠）獲得・正解時のSE
   */
  public playCorrect() {
    this.init();
    if (!this.ctx || !this.seGain) return;

    const t = this.ctx.currentTime;
    // 明るいメジャー和音のアルペジオ（C5 -> E5 -> G5 -> C6）
    const notes = [523.25, 659.25, 783.99, 1046.50];
    
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const noteTime = t + idx * 0.06;

      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0, noteTime);
      gain.gain.linearRampToValueAtTime(0.15, noteTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.25);

      osc.connect(gain);
      gain.connect(this.seGain!);

      osc.start(noteTime);
      osc.stop(noteTime + 0.3);
    });
  }

  /**
   * 不正解・ダメージ時のSE
   */
  public playIncorrect() {
    this.init();
    if (!this.ctx || !this.seGain) return;

    const t = this.ctx.currentTime;
    
    // 不協和音（C#3 & D3）で嫌な警報感を演出
    const freqs = [138.59, 146.83];

    freqs.forEach((freq) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.linearRampToValueAtTime(freq - 20, t + 0.3);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.2, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

      // 少し耳障りな周波数を残すためローパスを通す
      const filter = this.ctx!.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(600, t);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.seGain!);

      osc.start(t);
      osc.stop(t + 0.5);
    });
  }

  /**
   * 章クリア時のファンファーレ
   */
  public playClear() {
    this.init();
    if (!this.ctx || !this.seGain) return;

    const t = this.ctx.currentTime;
    // 解決コード進行の駆け上がり
    // C5 -> D5 -> E5 -> G5 -> C6
    const melody = [523.25, 587.33, 659.25, 783.99, 1046.50];
    
    melody.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const noteTime = t + idx * 0.08;

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0, noteTime);
      gain.gain.linearRampToValueAtTime(0.18, noteTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.4);

      osc.connect(gain);
      gain.connect(this.seGain!);

      osc.start(noteTime);
      osc.stop(noteTime + 0.5);
    });
  }
}

// シングルトンとしてエクスポート
export const audioManager = new AudioManager();
