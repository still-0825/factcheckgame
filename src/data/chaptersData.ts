export interface Dialogue {
  char: string;
  text: string;
  avatar: "ren" | "aoi" | "takashi" | "haruto" | "joe" | "sato" | "none";
}

export interface Evidence {
  id: string;
  title: string;
  source: string;
  content: string;
  badgeColor: string;
}

export interface WebPage {
  id: string;
  title: string;
  category: string;
  url: string;
  excerpt: string;
  contentHtml: string;
  evidenceId?: string; // If opening this page awards an evidence
}

export interface ChapterData {
  id: number;
  title: string;
  theme: string;
  introDialogues: Dialogue[];
  matchDialogues: Dialogue[];
  evidenceDialogues: Record<string, Dialogue[]>;
  evidenceList: Evidence[];
  searchKeywords: { word: string; category: string }[];
  searchMatches: Record<string, string[]>; // Map keyword -> webPageIds
  webPages: Record<string, WebPage>;
  timelinePosts: {
    author: string;
    authorHandle: string;
    avatarText: string;
    avatarColor: string;
    timeText: string;
    badgeText?: string;
    textHtml: string; // React or simple string helper to render keywords with highlights
  }[];
  classmatePost?: {
    author: string;
    authorHandle: string;
    avatarText: string;
    avatarColor: string;
    timeText: string;
    textHtml: string;
  };
  deduction: {
    title: string;
    opponentName: string;
    opponentAvatar: "takashi" | "haruto" | "joe" | "sato";
    opponentStatus: string;
    claims: { id: string; label: string; text: string }[];
    correctMatch: { claimId: string; evidenceIds: string[] };
    softGuidance: string;
  };
  explanation: {
    title: string;
    subtitle: string;
    modelTitle: string;
    modelText: string;
    skillsTitle: string;
    skills: string[];
  };
}

export const chaptersData: Record<number, ChapterData> = {
  1: {
    id: 1,
    title: "第1章：奇跡のダイエットフルーツ",
    theme: "ヘルスケアデマ（身近な健康情報の嘘）",
    introDialogues: [
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
      { char: "アオイ", text: "今回のターゲットは『青い果物』。『副作用』『臨床データ』も気になるわね。", avatar: "aoi" },
      { char: "アオイ", text: "オレンジ色に光る重要なワードをクリックしてみてね！", avatar: "aoi" }
    ],
    matchDialogues: [
      { char: "アオイ", text: "レン、ついに証拠が揃ったわね！", avatar: "aoi" },
      { char: "レン", text: "本当だ！ミカちゃんのブログに書かれている内容と……", avatar: "ren" },
      { char: "レン", text: "医療機関の『痩せる効果はなく、強い下痢になる副作用がある』って記述……", avatar: "ren" },
      { char: "レン", text: "これが完全に矛盾してる！", avatar: "ren" },
      { char: "アオイ", text: "そう、これがデマの正体よ。宣伝されている効果には医学的な根拠がないわ。", avatar: "aoi" },
      { char: "アオイ", text: "集めた証拠を『証拠ボード』で整理したから、一度確認してみましょう！", avatar: "aoi" }
    ],
    evidenceDialogues: {
      evidence_mika: [
        { char: "アオイ", text: "ミカちゃんの個人ブログを見つけたわ。宣伝がすごくいかにもって感じね…。", avatar: "aoi" },
        { char: "レン", text: "『1週間で10kg痩せる、副作用ゼロ』か…。それにしても、このサプリ、8,000円ってかなり高額だな。", avatar: "ren" },
        { char: "アオイ", text: "これで1つ目の証拠付箋ゲットね！他にも証拠がないか調べてみましょう！", avatar: "aoi" }
      ],
      evidence_health: [
        { char: "レン", text: "ヘルス・ファクト・オンラインの記事だ。専門家の警告が載っているな。", avatar: "ren" },
        { char: "アオイ", text: "『多量摂取すると強い下痢の副作用を引き起こす危険性がある』…やっぱり！副作用ゼロなんて大嘘じゃない！", avatar: "aoi" },
        { char: "レン", text: "これで重要な証拠付箋が集まったな。嘘を暴く手がかりになりそうだ。", avatar: "ren" }
      ],
      evidence_national: [
        { char: "アオイ", text: "国民生活安全センター（.go.jp）からの公式警告よ！すごく信頼性の高い一次情報ね。", avatar: "aoi" },
        { char: "レン", text: "『臨床データのない誇大広告や健康被害の相談が急増している』か。完全にアウトだな。", avatar: "ren" },
        { char: "アオイ", text: "公的機関のサイトが発信しているから、最強のファクトチェック素材になるわね！", avatar: "aoi" }
      ]
    },
    evidenceList: [
      {
        id: "evidence_mika",
        title: "ミカの宣伝ブログ",
        source: "個人ブログ：ミカのダイエット日記",
        content: "「青い果物は食べるだけで1週間で10kg痩せる！臨床データは準備中だけど、副作用はゼロで安心！」との紹介。高額な購入リンク（8,000円）が貼られている。",
        badgeColor: "bg-amber-100 text-amber-800 border-amber-300"
      },
      {
        id: "evidence_health",
        title: "医療ファクトオンラインの記事",
        source: "医療ニュース：ヘルス・ファクト・オンライン",
        content: "専門家による警告。「青い果物は激減効果があるような医学的根拠はなく、多量摂取すると強い下痢の副作用を引き起こす危険性がある」と発表。",
        badgeColor: "bg-rose-100 text-rose-800 border-rose-300"
      },
      {
        id: "evidence_national",
        title: "国民安全センターの警告",
        source: "公的機関：国民生活安全センター（.go.jp）",
        content: "「海外製の特定の青い果実に関して、臨床データのない誇大広告や、激しい副作用（腹痛・下痢）を伴う健康被害トラブルの相談が急増している」と注意喚起。",
        badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300"
      }
    ],
    searchKeywords: [
      { word: "青い果物", category: "核" },
      { word: "副作用", category: "核" },
      { word: "臨床データ", category: "核" },
      { word: "1週間で10kg", category: "副" }
    ],
    searchMatches: {
      "青い果物": ["mika_blog", "health_fact", "national_center"],
      "副作用": ["health_fact", "national_center"],
      "臨床データ": ["mika_blog", "national_center"],
      "1週間で10kg": ["mika_blog"]
    },
    webPages: {
      mika_blog: {
        id: "mika_blog",
        title: "ミカのダイエットブログ：飲むだけで1週間10kg!? 奇跡の青い果実!",
        category: "個人ブログ",
        url: "http://mika-diet-diary.net/special-blue-fruit",
        excerpt: "みんな、あの噂の青い果物の効果はガチ！現在詳しいデータは準備中だけど、副作用はゼロだから安心だよ！",
        contentHtml: "ミカちゃんが大絶賛！「本当に運動なしで1週間で10kg痩せられたよ！これは奇跡のダイエットフルーツだね。臨床データは現在メーカーが準備中だけど、植物由来だから副作用は完全にゼロ！ここから8,000円で今すぐ購入できるよ！」",
        evidenceId: "evidence_mika"
      },
      health_fact: {
        id: "health_fact",
        title: "【専門家警告】噂の「青い果物」のダイエット効果と重篤な副作用の懸念",
        category: "医療専門ニュース",
        url: "http://health-fact-online.org/article/blue-fruit-caution",
        excerpt: "医師機関は「劇的な減量を裏付ける科学的根拠（臨床データ）は一切ない」と発表。多量摂取は下痢や脱水症状を引き起こす恐れがある。",
        contentHtml: "日本ダイエット医学専門ニュース：「最近SNSで流行している『青い果実』を用いた減量サプリについて、日本医師機関は科学的根拠、つまり信頼できる臨床データを伴う医学的根拠が一切存在しないことを確認しました。また、主成分とされる成分は多量摂取した場合、腸管を過剰に刺激し、重篤な下痢や激しい腹痛、それに伴う脱水症状を引き起こす副作用の危険性があります。安易な購入・摂取は避けてください」と強く警告しています。",
        evidenceId: "evidence_health"
      },
      national_center: {
        id: "national_center",
        title: "国民生活安全センター：海外製の未承認「青い果実」による健康トラブル相談への注意喚起",
        category: "公的・政府機関 (.go.jp)",
        url: "https://www.kokusen.go.jp/news/blue-fruit-alert.html",
        excerpt: "「海外製の特定の青い果実に関して、臨床データのない誇大広告や、激しい副作用（腹痛・下痢）を伴う健康被害トラブルの相談が急増している」",
        contentHtml: "独立行政法人 国民生活安全センター（ドメイン .go.jp）発表：「インターネット上でインフルエンサー等が紹介している、海外製の特定の『青い果物』を用いた痩身サプリメントに関し、健康被害トラブルおよび不当契約に関する相談が全国で急増（前年同期比4倍）しています。科学的な裏付けとなる『臨床データ』は存在せず、誇大広告である可能性が高いです。さらに、摂取後に『激しい下痢や血便、激痛』を訴え医師の治療を要した副作用事案が複数確認されています。ドメインが .go.jp などの公的な情報、あるいは専門医の判断を参照してください」",
        evidenceId: "evidence_national"
      }
    },
    timelinePosts: [
      {
        author: "ミカ★インフルエンサー",
        authorHandle: "@mika_diet_life",
        avatarText: "ミカ",
        avatarColor: "bg-rose-700 border-rose-500",
        timeText: "10分前",
        badgeText: "公式",
        textHtml: `最近ウワサの「青い果物」を食べるだけで、運動ゼロで「1週間で10kg」激痩せしたよ！副作用もなくて本当に安心！私の個人ブログに特設購入リンクを貼ったのでみんな急いで！`
      }
    ],
    classmatePost: {
      author: "タカシ (クラスメイト)",
      authorHandle: "@takashi_soccer",
      avatarText: "タ",
      avatarColor: "bg-blue-900 border-blue-600",
      timeText: "2分前",
      textHtml: `ミカちゃんお勧めの「青い果物」ガチじゃん！！これ買えば部活サボっても体が軽くなるやつ！？売り切れる前に小遣い全部はたいて買うしかないな`
    },
    deduction: {
      title: "デマ論破パート：タカシを説得せよ",
      opponentName: "タカシ (クラスメイト)",
      opponentAvatar: "takashi",
      opponentStatus: "デマ信じ込み状態",
      claims: [
        {
          id: "claim_1",
          label: "主張A",
          text: "「ミカちゃんが紹介してるんだから、科学的に効果が証明された安全な果物に決まってるだろ！」"
        },
        {
          id: "claim_2",
          label: "主張B",
          text: "「早く買わないと売り切れちゃうよ！みんなも買ってるし！」"
        }
      ],
      correctMatch: {
        claimId: "claim_1",
        evidenceIds: ["evidence_health", "evidence_national"]
      },
      softGuidance: "レン、焦らなくて大丈夫だよ。一度落ち着いてみよう。\n\nタカシくんの『効果が証明された安全な果物』という発言と、私たちが集めた『臨床データが準備中』や『下痢の副作用がある』という証拠に、何か矛盾はないかな？\n\nもう一度、よく見比べてみて！"
    },
    explanation: {
      title: "第1章ファクトチェック完了！",
      subtitle: "科学的根拠（臨床データ）のないヘルスケアデマの矛盾を見事に暴き、友達を救いました！",
      modelTitle: "実在する類似のデマ・フェイク事例モデル",
      modelText: "過去、SNSやブログ上で「〇〇という食材を食べるだけで劇的に痩せる」「病気が完治する」といった広告や偽ニュースが数多く流行しました。特にインフルエンサーの信頼度を悪用し、実態のないサプリメントや果物を高額で販売するアフィリエイト詐欺や誇大広告は、日常的に頻発しています。",
      skillsTitle: "日常生活でだまされないためのファクトチェック技術",
      skills: [
        "情報の発信元（一次データ）を特定する: インフルエンサーの言葉を鵜呑みにせず、大学の研究機関や医師会、または厚生労働省などの公的な一次ソースで調べ直す。",
        "URLの「ドメイン（末尾）」に注目する: 日本の政府機関や公的機関は .go.jp、大学・研究機関は .ac.jp という専用のドメインを使用しています。これらが含まれるURLは非常に高い信頼性を持っています。",
        "シェアする前に「立ち止まる」: 「面白い」「みんなに教えたい」と感情が刺激された時ほど、それが悪質なデマ発信者を儲けさせる手助け（アクセス数稼ぎ）になっていないか、一度考える癖をつけましょう。"
      ]
    }
  },
  2: {
    id: 2,
    title: "第2章：崩壊した化学工場",
    theme: "災害時のデマ（パニック情報の拡散）",
    introDialogues: [
      { char: "レン", text: "大変だアオイ！さっきの地震で、市内の『〇〇工業』の化学工場が爆発したって！", avatar: "ren" },
      { char: "アオイ", text: "えっ、本当！？それ、どこからの情報？", avatar: "aoi" },
      { char: "レン", text: "ほら、SNSで画像付きの投稿がものすごい勢いで拡散されてるんだよ！", avatar: "ren" },
      { char: "レン", text: "『大爆発が発生！有害なガスが流出している。ただちに避難を！』って…画像もめちゃくちゃリアルだよ！", avatar: "ren" },
      { char: "アオイ", text: "待って、一回落ち着いて。災害時のSNSは特にパニックでデマや勘違いが混じりやすいの。", avatar: "aoi" },
      { char: "アオイ", text: "その『爆発画像』、本当に今日、私たちの市内で撮影されたものかしら？", avatar: "aoi" },
      { char: "レン", text: "でも写真があるんだから嘘のつきようがないよ…！早く逃げないと！", avatar: "ren" },
      { char: "アオイ", text: "だまされないで。まずは検索システムを使って、『〇〇工業』『爆発画像』『ガス流出』、それに公的な『気象庁 避難指示』などを調べてみましょう！", avatar: "aoi" },
      { char: "アオイ", text: "避難するにしても、正しい情報を掴んでから動くのが一番安全よ！", avatar: "aoi" }
    ],
    matchDialogues: [
      { char: "アオイ", text: "やっぱりね！レン、集まった証拠を見て！", avatar: "aoi" },
      { char: "レン", text: "えっ……これって、SNSで出回っている爆発画像は、5年前の海外の事故のコラージュや流用だったの！？", avatar: "ren" },
      { char: "アオイ", text: "ええ。しかも〇〇工業は『爆発もガス漏れも起きていない。安全に停止中』って公式に発表しているわ。", avatar: "aoi" },
      { char: "レン", text: "うそだろ……。公式発表と、SNSに流れているデマ画像が完全に『矛盾』してる！", avatar: "ren" },
      { char: "アオイ", text: "このデマのせいで避難所は大混乱に陥りかけてるわ。証拠ボードで関係性を整理しましょう！", avatar: "aoi" }
    ],
    evidenceDialogues: {
      evidence_ch2_pic: [
        { char: "アオイ", text: "画像検索の検証記事を見つけたわ。やっぱり流用された偽物ね！", avatar: "aoi" },
        { char: "レン", text: "『SNSの画像は5年前の海外の別工場事故の写真』…！今回の地震とは全く関係ないじゃないか！", avatar: "ren" },
        { char: "アオイ", text: "不安な時にリアルな画像を見せられると、みんな反射的に信じて拡散しちゃうの。これで1つの証拠付箋ね！", avatar: "aoi" }
      ],
      evidence_ch2_official: [
        { char: "レン", text: "〇〇工業の公式声明サイトを見つけたぞ！", avatar: "ren" },
        { char: "アオイ", text: "『工場は自動安全システムで緊急停止しており、ガス漏れや火災は一切発生していない』、はっきり明記されているわね！", avatar: "aoi" },
        { char: "レン", text: "デマの元の情報がこれで完全に否定されたな。すごく重要な公式ファクトだ！", avatar: "ren" }
      ],
      evidence_ch2_weather: [
        { char: "アオイ", text: "気象庁と防災ポータルの公式サイトよ。", avatar: "aoi" },
        { char: "レン", text: "『有害物質による避難指示は一切出ていません。虚偽の災害情報に惑わされないで』と注意を呼びかけてるね。", avatar: "ren" },
        { char: "アオイ", text: "公的機関の一次データが、デマ情報によるパニックを静めようと発信しているのね。", avatar: "aoi" }
      ]
    },
    evidenceList: [
      {
        id: "evidence_ch2_pic",
        title: "爆発画像の検証結果",
        source: "ファクトチェック：検証ネット",
        content: "「SNSで拡散されている爆発画像は、5年前に海外の化学工場で起きた爆発事故の画像であり、今回の地震とは完全に無関係」であることを証明。",
        badgeColor: "bg-rose-100 text-rose-800 border-rose-300"
      },
      {
        id: "evidence_ch2_official",
        title: "〇〇工業の公式声明",
        source: "公式HP：〇〇工業株式会社",
        content: "「当社の工場は地震発生直後に安全装置が起動し、自動停止。爆発、火災、および有害ガスの流出は一切発生していない」と公式に表明。",
        badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300"
      },
      {
        id: "evidence_ch2_weather",
        title: "気象庁・防災ポータルの警告",
        source: "公的：気象庁防災ポータル（.go.jp）",
        content: "「〇〇市全域における有害ガス等に伴う避難指示は一切発令されていません。不審なニュースサイトやSNS上の虚偽情報に警戒してください」との公式発表。",
        badgeColor: "bg-blue-100 text-blue-800 border-blue-300"
      }
    ],
    searchKeywords: [
      { word: "〇〇工業", category: "核" },
      { word: "ガス流出", category: "核" },
      { word: "爆発画像", category: "核" },
      { word: "気象庁 避難指示", category: "副" }
    ],
    searchMatches: {
      "〇〇工業": ["ch2_industrial_site", "ch2_news_warning"],
      "ガス流出": ["ch2_industrial_site", "ch2_news_warning"],
      "爆発画像": ["ch2_image_check"],
      "気象庁 避難指示": ["ch2_weather_site"]
    },
    webPages: {
      ch2_image_check: {
        id: "ch2_image_check",
        title: "【画像検証】「〇〇工業の爆発」とされる画像はフェイク？ネット画像の出処を追う",
        category: "ファクトチェックメディア",
        url: "http://verification-net.org/article/ch2_image_fake",
        excerpt: "SNSで数万回拡散されている化学工場爆発の画像。画像検索によると、これは5年前に東欧の化学工場で発生した火災のものでした。",
        contentHtml: "検証ネット記事：「地震直後からSNS上で『〇〇工業が爆発した。有害ガスが出ている』という不気味な赤黒い煙の画像が大量に拡散されています。しかし、当編集部がこの画像を用いて逆画像検索（検索エンジンを使った画像一致調査）を行ったところ、本写真は5年前に海外の地方工業地帯で発生した別件の爆発火災事故のニュース画像であることが判明しました。画像にテキストをコラージュして合成された、悪質な災害デマ画像です。騙されないでください」",
        evidenceId: "evidence_ch2_pic"
      },
      ch2_industrial_site: {
        id: "ch2_industrial_site",
        title: "〇〇工業株式会社：本日発生した地震への対応および工場の稼働状況について",
        category: "企業公式プレス",
        url: "https://www.industrial-oo.co.jp/press/earthquake-info",
        excerpt: "「自動安全停止システムにより工場は完全に停止。爆発、火災、およびガス漏洩等のトラブルは一切発生しておりません」",
        contentHtml: "〇〇工業公式声明：「本日〇〇地区にて観測された地震に関しまして、当社〇〇工場は直ちに自動安全緊急システムが正常に動作し、無事安全に稼働を完全停止いたしました。ネット上で『煙が出ている』『有害物質が流出した』という情報が散見されますが、工場での爆発、火災、および有害ガス漏洩の事象は一切ございません。従業員も全員避難を完了し安全が確保されています。周辺住民の皆様におかれましては、どうぞご安心ください」",
        evidenceId: "evidence_ch2_official"
      },
      ch2_news_warning: {
        id: "ch2_news_warning",
        title: "〇〇地方報道：〇〇工業「ガス流出」デマ情報への消防・現地調査速報",
        category: "地方報道ニュース",
        url: "http://oo-local-news.jp/news/industrial-gas-leak-fact",
        excerpt: "SNSで流布している「〇〇工業の化学工場から有害ガス流出」について、地元消防局は「現地調査の結果、漏洩および火災の事実は一切ない」と速報を発表。",
        contentHtml: "〇〇地方ニュース速報：「本日発生した大地震後、SNSを中心に『〇〇工業の工場で有害ガスが流出している』とするデマ情報が急激に拡散されました。これについて地元消防局が速やかに化学防護隊を現地に派遣しガス検知・現地状況の確認を行った結果、ガス流出やそれに伴う異常な熱源・火災は一切検出されなかったと発表しました。消防および警察は、災害時のデマは避難行動を阻害し二次被害を招く危険性があるため、虚偽情報の拡散に荷担しないよう住民に冷静な対応を呼びかけています」",
        evidenceId: "evidence_ch2_official"
      },
      ch2_weather_site: {
        id: "ch2_weather_site",
        title: "気象庁・〇〇市防災情報：不審な有害ガスデマ情報に対する緊急注意喚起",
        category: "公的・政府機関 (.go.jp)",
        url: "https://www.jma.go.jp/bousai/oo_city_emergency",
        excerpt: "「〇〇市内において化学工場からの有害ガス発生の事実は確認されておらず、避難指示も発令されていません。公式情報に基づき行動を」",
        contentHtml: "気象庁・防災本部緊急ポータル（.go.jp）：「現在、SNS上において『〇〇工業の化学工場爆発により有害な硫黄ガスが流出し、緊急避難指示が発令された』という虚偽の情報が急激に拡散されております。地元消防および気象庁での監視データによれば、有害なガスの発生および流出の事実は一切確認されておりません。避難指示、避難勧告も発令されておりません。災害時は恐怖心から不穏な情報が拡散されやすくなります。公のテレビ・ラジオ、または自治体公式ホームページ等の信頼できる一次情報を確認してください」",
        evidenceId: "evidence_ch2_weather"
      }
    },
    timelinePosts: [
      {
        author: "地震・災害速報アラート（非公式）",
        authorHandle: "@disaster_alert_fake",
        avatarText: "災",
        avatarColor: "bg-red-700 border-red-500",
        timeText: "3分前",
        textHtml: `【超拡散希望】市内の「〇〇工業」の化学工場で爆発が発生！現在、周辺に「ガス流出」が生じており、住民がパニックになっています！「爆発画像」を添付します。ただちに逃げて！`
      },
      {
        author: "防災デマ拡散防止bot",
        authorHandle: "@bousai_verify",
        avatarText: "防",
        avatarColor: "bg-emerald-700 border-emerald-500",
        timeText: "2分前",
        textHtml: `【注意喚起】SNSで噂されている〇〇工業の有害ガス漏れや大爆発について、現時点で公式な「気象庁 避難指示」などの発表は一切ありません。不確かな情報に惑わされず、公的機関の一次情報を検索して冷静に確認してください。`
      }
    ],
    classmatePost: {
      author: "ハルト (クラスメイト)",
      authorHandle: "@haruto_soccer_2",
      avatarText: "ハ",
      avatarColor: "bg-blue-800 border-blue-500",
      timeText: "1分前",
      textHtml: `マジかよ、〇〇工業の爆発画像リアルすぎる！有害ガスってヤバいやつだろ？ハルトも今すぐ逃げないと！SNSでみんな大パニックになってる！！`
    },
    deduction: {
      title: "デマ論破パート：ハルトを冷静にさせよ",
      opponentName: "ハルト (クラスメイト)",
      opponentAvatar: "haruto",
      opponentStatus: "大パニック状態",
      claims: [
        {
          id: "claim_ch2_1",
          text: "「ネットで工場の爆発写真を見たんだ！有害ガスが出てるから今すぐ遠くに逃げないと！」",
          label: "主張A"
        },
        {
          id: "claim_ch2_2",
          text: "「避難所に向かう途中でみんなが走ってたから、避難指示が出たに違いないよ！」",
          label: "主張B"
        }
      ],
      correctMatch: {
        claimId: "claim_ch2_1",
        evidenceIds: ["evidence_ch2_pic", "evidence_ch2_official"]
      },
      softGuidance: "レン、ハルトくんは恐怖で冷静さを失っているみたい。\n\n彼の『爆発写真があるから有害ガスが出ている』という主張に対して、写真の「真実（過去の流用）」や、工場の「公式発表」の証拠を突きつけて、落ち着かせてあげて！"
    },
    explanation: {
      title: "第2章ファクトチェック完了！",
      subtitle: "災害時に発生しやすい不穏なデマ画像を見破り、パニックを未然に防ぎました！",
      modelTitle: "災害時のデマと拡散心理モデル",
      modelText: "大きな災害が発生した際、人々は不安と恐怖心から「みんなに危険を知らせなきゃ」という善意によって、真偽不明の情報を反射的に拡散しやすくなります。過去の大地震でも「ライオンが逃げた」「製油所が爆発して毒性の雨が降る」といった捏造・流用画像デマが拡散し、救助活動を妨げる事態が実際に発生しました。",
      skillsTitle: "日常生活で災害デマに騙されないためのファクトチェック技術",
      skills: [
        "画像の「逆画像検索」を活用する: スマホやPCの画像検索機能を使って、その画像が過去に別のニュースや海外のブログで使われていないかをチェックする。これで画像流用デマは瞬時に見破れます。",
        "公的な発表（警察、消防、気象庁、自治体）を必ず確認する: 拡散元のSNSアカウントが非公式（個人のアカウント）である場合、必ず政府機関や当事者企業の一次発表を見に行く。",
        "「パニック時の拡散は百害あって一利なし」と心得ること: 危険情報は刺激が強いですが、不確かな情報を拡散することは、被災地での無用な混乱や買い占めを招き、本当に必要な人への物資到着を遅らせる原因になります。"
      ]
    }
  },
  3: {
    id: 3,
    title: "第3章：現職市長の「失言」ビデオ",
    theme: "AI・ハイテクデマ（偽動画・ディープフェイク）",
    introDialogues: [
      { char: "レン", text: "アオイ、大変だよ！現職の市長が、ものすごい失言をしている動画がYouTubeで大拡散されてるんだ！", avatar: "ren" },
      { char: "アオイ", text: "市長の失言ビデオ……？それってどんな内容？", avatar: "aoi" },
      { char: "レン", text: "市長が記者会見で『市民の税金を自分の趣味に使い込む。バレなければ問題ない』ってニヤニヤしながら言ってるんだよ！", avatar: "ren" },
      { char: "レン", text: "街の人たちも激怒していて、市長の辞職を求めるデモまで始まりそうなんだよ！", avatar: "ren" },
      { char: "アオイ", text: "そんなことを現職市長がハッキリ言うなんて、普通に考えて異常じゃない？ちょっとその動画を見せて。", avatar: "aoi" },
      { char: "アオイ", text: "うーん……これ、声と口の形がほんの少しズレている場面があるし、映像にデジタルノイズが混じっているわ。", avatar: "aoi" },
      { char: "アオイ", text: "レン、これAIを使った『ディープフェイク動画』か、悪質な『切り取り編集』かもしれないわ！", avatar: "aoi" },
      { char: "レン", text: "ええ！？でも本当に喋っているように見えるよ！今のAIってそんなことまでできるの！？", avatar: "ren" },
      { char: "アオイ", text: "できるのよ、今は誰でもそれらしく作れちゃうの。早速、元の『市長 失言動画』の出元や、『ディープフェイク解析』、『オリジナル音声データ』を検索して、悪質な『発言の前後カット』がされていないか検証しましょう！", avatar: "aoi" }
    ],
    matchDialogues: [
      { char: "アオイ", text: "やっぱり！思った通りの完全な捏造動画だったわね！", avatar: "aoi" },
      { char: "レン", text: "これはひどい……！専門機関の解析で『AI合成の不自然なノイズ』がバッチリ検出されているね。", avatar: "ren" },
      { char: "レン", text: "しかも、公式会見のオリジナル音声と突き合わせたら、『税金を趣味に使い込むようなことはあってはならない』という発言の、後半をバッサリカットして『使い込む』と繋ぎ合わせていたんだ！", avatar: "ren" },
      { char: "アオイ", text: "そう、映像解析（技術的検証）とノーカット会見（一次ソースとの比較）、この2つの決定的な証拠が揃ったわ。", avatar: "aoi" },
      { char: "アオイ", text: "動画の真実を証拠ボードで結びつけて、このフェイクを暴き出しましょう！", avatar: "aoi" }
    ],
    evidenceDialogues: {
      evidence_ch3_ai: [
        { char: "アオイ", text: "ディープフェイク解析研究所の記事を見つけたわ！テクノロジーの嘘を暴く科学的ファクトね。", avatar: "aoi" },
        { char: "レン", text: "『動画の一部で、口元の輪郭のブレとAI合成時に生じる特有のノイズ波形を検出』。やっぱりAIの偽動画だったんだ！", avatar: "ren" },
        { char: "アオイ", text: "見た目が本物そっくりでも、最新の解析プログラムにかければ一瞬で化けの皮が剥がれるのね！重要な証拠付箋よ。", avatar: "aoi" }
      ],
      evidence_ch3_full: [
        { char: "レン", text: "市役所の公式記者会見ノーカット映像を入手したよ！アオイ、これを聞いてみて！", avatar: "ren" },
        { char: "アオイ", text: "本来の発言は『税金を趣味に使い込む…ようなことは絶対にあってはならない！』なのに、後半部分が巧みに消されてるわ！", avatar: "aoi" },
        { char: "レン", text: "言葉を切り取って繋ぎ合わせるだけで、正反対の意味にしてたのか。なんて悪質な編集手法なんだ！", avatar: "ren" }
      ]
    },
    evidenceList: [
      {
        id: "evidence_ch3_ai",
        title: "失言動画の映像・音声解析",
        source: "技術機関：AI・ハイテク解析研究所",
        content: "「拡散されている市長失言ビデオをディープラーニング技術で解析。口元の不自然なフレーム飛びと、AI音声合成の不自然な高周波ノイズを検出。偽動画の可能性が極めて高い」と結論づけた検証報告。",
        badgeColor: "bg-rose-100 text-rose-800 border-rose-300"
      },
      {
        id: "evidence_ch3_full",
        title: "記者会見ノーカット映像",
        source: "一次資料：市役所公式アーカイブ（.go.jp）",
        content: "実際の会見における発言のオリジナル書き起こしとフル映像。「市民の税金を趣味に使い込む…ような事態は、絶対にあってはならない」という発言の後半を意図的にカットし、悪意を持って繋ぎ合わせていた事実を確認。",
        badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300"
      }
    ],
    searchKeywords: [
      { word: "市長 失言動画", category: "核" },
      { word: "ディープフェイク解析", category: "核" },
      { word: "オリジナル音声データ", category: "核" },
      { word: "発言の前後カット", category: "副" }
    ],
    searchMatches: {
      "市長 失言動画": ["ch3_ai_check_site", "ch3_city_archive"],
      "ディープフェイク解析": ["ch3_ai_check_site"],
      "オリジナル音声データ": ["ch3_city_archive"],
      "発言の前後カット": ["ch3_city_archive"]
    },
    webPages: {
      ch3_ai_check_site: {
        id: "ch3_ai_check_site",
        title: "【AI解析報告】大拡散中の市長会見「使い込み発言」のフェイク検知検証",
        category: "ハイテク・ITセキュリティ",
        url: "http://hitech-security.org/ai-analysis/mayor-fake-video",
        excerpt: "大拡散中の失言動画をAI検出アルゴリズムで精査。口元のフレーム合成処理によるデジタルノイズと、不自然な母音波形を明確に検出。",
        contentHtml: "ハイテク解析研究所：「現在、SNS等で批判が殺到している〇〇市長の『税金趣味使い込み』とする動画について、当所が最新の偽映像検知ツールで解析した結果、口元のドットパターンに不連続なブレ（フレーム合成痕）と、AI音声合成モデル（TTS）に特有の超音波領域ノイズが多数含まれていることが判明しました。現行のディープフェイク技術により、本人の記者会見から声を模倣して再構築した、100%の偽動画（フェイクメディア）です」",
        evidenceId: "evidence_ch3_ai"
      },
      ch3_city_archive: {
        id: "ch3_city_archive",
        title: "〇〇市役所公式：市長記者会見（令和8年6月15日開催）の全編フル映像および発言のテキストアーカイブ",
        category: "公的・政府機関 (.go.jp)",
        url: "https://www.city.oo.lg.jp/archive/press/conference-r80615.html",
        excerpt: "「市政の信頼回復に全力を尽くし、市民の税金を趣味に使い込むような不祥事は、万が一にも絶対にあってはならないと強調」",
        contentHtml: "〇〇市役所広報課プレス（ドメイン .go.jp）：「昨日よりSNS等のショート動画プラットフォームにおいて、市長の記者会見における一部の発言が虚偽の意図で編集・拡散されている事態を受けて、当時の会見のノーカットフル映像（25分）および全文字起こしをここに公開します。動画では『税金を趣味に使い込む』部分のみが切り取られていますが、実際の発言は『……一部の悪質な実例について、市民の皆様の税金を、そのような趣味や不透明な使途に使い込む……といった不祥事は、我々の市政において万が一にも絶対にあってはならないと考えております』と発言しています。悪意ある映像の『前後カット（切り取り編集）』に強く抗議いたします」",
        evidenceId: "evidence_ch3_full"
      }
    },
    timelinePosts: [
      {
        author: "正義の告発チャンネル（バズ狙い）",
        authorHandle: "@justice_reveal_news",
        avatarText: "正",
        avatarColor: "bg-purple-700 border-purple-500",
        timeText: "5分前",
        textHtml: `【激怒】市長のヤバすぎる本音が流出！「市長 失言動画」が暴露されました。会見で「税金を趣味に使い込む」と言い放ってニヤついています。これは今すぐ辞職案件だろ！「発言の前後カット」すら疑えないハッキリした生映像です！`
      }
    ],
    classmatePost: {
      author: "ジョー (ネット世論ウォッチャー)",
      authorHandle: "@joe_watch_buzz",
      avatarText: "ジ",
      avatarColor: "bg-zinc-800 border-zinc-500",
      timeText: "40秒前",
      textHtml: `この市長の動画ガチでアウトだろ。YouTubeショートでもTikTokでも大爆発してる。言い逃れできない本人の姿が映ってるんだから、これ以上のファクトはないね。市長交代決定！`
    },
    deduction: {
      title: "デマ論破パート：インフルエンサー「ジョー」の主張を打ち破れ",
      opponentName: "ジョー (ネット世論ウォッチャー)",
      opponentAvatar: "joe",
      opponentStatus: "大バズり・煽り状態",
      claims: [
        {
          id: "claim_ch3_1",
          text: "「この動画の市長を見てみろ！『税金を趣味に使い込む、バレなければ問題ない』と本人の口からハッキリ喋っている！嘘のつきようがない本物だ！」",
          label: "主張A"
        },
        {
          id: "claim_ch3_2",
          text: "「こんな失言をする市長は今すぐ辞職すべきだ！ネットの動画が何よりの証拠だ！」",
          label: "主張B"
        }
      ],
      correctMatch: {
        claimId: "claim_ch3_1",
        evidenceIds: ["evidence_ch3_ai", "evidence_ch3_full"]
      },
      softGuidance: "レン、ジョーくんは『動画だから本物だ』と強く信じ込ませようとしているわ。\n\n彼に対して、「最新のAI音声・映像解析（ディープフェイク）」の証明、もしくは「市役所が公開しているノーカットのフル会見一次ソース」を突きつけて、映像がいかに悪質に捏造・編集されているかを証明してあげて！"
    },
    explanation: {
      title: "第3章ファクトチェック完了！",
      subtitle: "最新のAIディープフェイクと切り取り編集の手口を暴き、街の不当な大混乱を鎮めました！",
      modelTitle: "ディープフェイクと確証バイアスの脅威モデル",
      modelText: "現代の生成AI技術の発展により、本人の顔や声を極めて高精度に再現した「ディープフェイク」が大きな社会問題となっています。さらに、事実である記者会見の特定の部分を「悪質に切り取って繋ぎ合わせる（前後カット）」ことで、本物の映像を使いつつ全く逆の意味を持たせるデマ手法が選挙や世論誘導の場で頻発しています。人間は『見たい現実を信じやすい（確証バイアス）』ため、一度嫌悪感を抱いた相手の悪い噂（フェイク映像）を疑わずにシェアしてしまう傾向があります。",
      skillsTitle: "日常生活でAI・ハイテク偽動画に騙されないためのファクトチェック技術",
      skills: [
        "感情を激しく刺激する動画ほど、まず一歩引いて「一次情報」を探す: センセーショナルで怒りや笑いを誘う短い動画を見た際は、大手の報道機関、本人の公式ホームページ、テレビ中継、公式の文字起こしデータ（全文）と比較する習慣をつけましょう。",
        "「切り取り」がないか、文脈を確認する: 一部分だけを切り取った動画は、発言の「前後の文脈」をすべて消去しています。前後にどんな質問があり、どんな意図で喋ったのかを確認することが決定的な防衛策です。",
        "映像も音声も100%捏造可能な時代であることを認識する: 『百聞は一見に如かず』は過去の言葉です。これからの時代は『一見しただけでも疑い、一次データで確かめる』という情報防衛の姿勢が不可欠です。"
      ]
    }
  },
  4: {
    id: 4,
    title: "第4章：偽情報（フェイク）の生産工場",
    theme: "複合デマと黒幕との対決（世論誘導と真犯人）",
    introDialogues: [
      { char: "レン", text: "アオイ、これまでの3つの事件（ダイエットフルーツ、工場爆発、市長偽動画）を整理していたら、恐ろしいことに気づいたよ！", avatar: "ren" },
      { char: "アオイ", text: "どうしたの、レン？", avatar: "aoi" },
      { char: "レン", text: "あのデマをバズらせていた「ダイエットまとめブログ」「災害パニック速報」「市長弾劾サイト」の裏のソースコードを見ていたら…", avatar: "ren" },
      { char: "レン", text: "広告を表示するための『広告ID』や、サイトが設置されているサーバーの『同一サーバーIP』が、全部一致しているんだ！", avatar: "ren" },
      { char: "アオイ", text: "えええっ！？それって、別々の個人やアカウントがやってると思われていた事件の裏で…", avatar: "aoi" },
      { char: "アオイ", text: "すべて同じ『1人の人物（黒幕）』が、お金稼ぎのアクセス集めのために計画的にデマを量産していたってこと！？", avatar: "aoi" },
      { char: "レン", text: "そういうことだ！ネットの混乱を裏で操って、自分だけ広告収入で大儲けしていたんだ！", avatar: "ren" },
      { char: "アオイ", text: "許せないわ！私たちは、そのサイトの『ドメイン所有者』『広告ID』『同一サーバーIP』、そしてダミー企業の『サーバー契約者情報』を調べ上げましょう！", avatar: "aoi" },
      { char: "アオイ", text: "すべての線が1つの場所、あの黒幕のアフィリエイト業者サトウに繋がっているはずよ。決定的な証拠を集めて、彼を完全に告発するのよ！", avatar: "aoi" }
    ],
    matchDialogues: [
      { char: "アオイ", text: "レン、ついに外堀を埋めたわ！すべてのパズルが繋がったわね！", avatar: "aoi" },
      { char: "レン", text: "ああ！ドメイン所有者の名義、同一サーバーのIP、そして何よりデマサイトすべてに貼られていた共通の『広告配信ID』…", avatar: "ren" },
      { char: "レン", text: "すべてが、合同会社デマ・プロモートの代表『サトウ』を指している！", avatar: "ren" },
      { char: "アオイ", text: "サトウは裏で、意図的にダイエットデマ、災害パニック、政治フェイクを代わる代わる配信して、広告の表示数（アクセス数）で荒稼ぎしていたのよ。これが現代の『デマ・ビジネス』の闇ね。", avatar: "aoi" },
      { char: "アオイ", text: "この恐ろしいデマ工場のつながりを証拠ボードですべて結びつけて、最後の対決に挑みましょう！", avatar: "aoi" }
    ],
    evidenceDialogues: {
      evidence_ch4_ip: [
        { char: "アオイ", text: "サーバーの接続元解析データを手に入れたわ！強力な科学的裏付けよ。", avatar: "aoi" },
        { char: "レン", text: "『3つの極端なデマサイトは、同一の物理サーバーIP（192.168.x.x）のホスト領域を共有している』、これでサーバー側は完全に繋がった！", avatar: "ren" },
        { char: "アオイ", text: "別々の人がやっているというのはただの偽装で、同一のサーバーからすべてのデマが放たれていた証拠ね！", avatar: "aoi" }
      ],
      evidence_ch4_ads: [
        { char: "レン", text: "デマサイトすべてのHTMLコードから、同じアフィリエイト広告IDを検出したぞ！", avatar: "ren" },
        { char: "アオイ", text: "『Google Adsense ID: pub-9999-XXXX』がすべての検証サイトに埋め込まれているわ！お金の流れる先が、完全に1つの口座に集約されているわね！", avatar: "aoi" },
        { char: "レン", text: "「広告ID」の共通性は、偶然なんて言い訳が絶対に通用しない最強の物的証拠だ！", avatar: "ren" }
      ],
      evidence_ch4_owner: [
        { char: "アオイ", text: "ドメイン（URL）の登録情報を契約代理店から追跡したわ！", avatar: "aoi" },
        { char: "レン", text: "『契約会社の登録住所と名義は「合同会社デマ・プロモート」、代表取締役「サトウ」』、ついに黒幕の正体を突き止めたぞ！", avatar: "ren" },
        { char: "アオイ", text: "「サーバー契約者情報」やドメイン所有者名義から、個人を特定したわね。言い逃れはさせないわよ！", avatar: "aoi" }
      ]
    },
    evidenceList: [
      {
        id: "evidence_ch4_ip",
        title: "同一サーバーIP解析データ",
        source: "セキュリティ調査：サイバーネット研究所",
        content: "「3つのデマ検証サイト（ダイエットフルーツ紹介、化学工場避難アラート、市長失言切り取りビデオ）のホストドメインが、同一のグローバルサーバーIP（198.51.100.24）上に完全に共有設定されている」ことを証明する解析レポート。",
        badgeColor: "bg-blue-100 text-blue-800 border-blue-300"
      },
      {
        id: "evidence_ch4_ads",
        title: "広告配信IDの追跡報告書",
        source: "調査：ネット広告監査連合",
        content: "3つのフェイクニュースサイトに表示されていた、アフィリエイトバナー広告（アドセンス等）の内部広告配信ID（Publisher ID）がすべて「pub-7777-9999」という同一のアカウントIDであることを証明する報告書。全デマの広告収入が、同一口座へ流入していたことを裏付ける。",
        badgeColor: "bg-rose-100 text-rose-800 border-rose-300"
      },
      {
        id: "evidence_ch4_owner",
        title: "ドメイン所有者・契約者情報",
        source: "登録簿：国際ドメイン名鑑データベース",
        content: "3つのデマサイトドメインの所有者登録から、「合同会社デマ・プロモート」というペーパーカンパニーが浮上。登記簿より代表者契約者名義「サトウ・ケンジ」という同一人物を完全特定。",
        badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300"
      }
    ],
    searchKeywords: [
      { word: "ドメイン所有者", category: "核" },
      { word: "広告ID", category: "核" },
      { word: "同一サーバーIP", category: "核" },
      { word: "サーバー契約者情報", category: "副" }
    ],
    searchMatches: {
      "ドメイン所有者": ["ch4_domain_check"],
      "広告ID": ["ch4_ads_check"],
      "同一サーバーIP": ["ch4_ip_check"],
      "サーバー契約者情報": ["ch4_domain_check"]
    },
    webPages: {
      ch4_ip_check: {
        id: "ch4_ip_check",
        title: "【サイバー追跡】不審なトレンドまとめサイト群のサーバーホスティング同一性レポート",
        category: "サイバーセキュリティ・インシデント",
        url: "http://cyber-net-lab.org/incident/server-tracking-demasite",
        excerpt: "「一見無関係に見える複数のバズサイトが、同一のサーバーIPにホストされていることがDNS解析により裏付けられました」",
        contentHtml: "サイバーネット研究所報告：「当チームで、最近世間を騒がせたダイエット食品紹介ブログ、災害デマアラート、および市長失言切り取り動画まとめサイトの3つのWEBページについてDNS及びルートサーバー調査を行いました。結果、すべてのドメインが米国西海岸に設置された同一の仮想ホスティングサーバーIP『198.51.100.24』上で稼働していることが判明。個別のサイトではなく、同一のサーバー管理者が裏でコントロールしていることが技術的に完全に証明されました」",
        evidenceId: "evidence_ch4_ip"
      },
      ch4_ads_check: {
        id: "ch4_ads_check",
        title: "ネット広告監査レポート：デマ・アフィリエイトサイトへの広告ID共通化と収益流出経路",
        category: "広告取引・メディア監査",
        url: "http://ad-audit-union.org/report/ad-id-tracking",
        excerpt: "「デマサイト群に貼られたGoogle広告の配信コードに、全く同一のアドネットワークID：pub-7777-9999が埋め込まれていることを検知しました」",
        contentHtml: "ネット広告監査連合：「監査チームは、悪質なフェイクニュースやパニック煽りによって不正にPV数（アクセス数）を稼ぎ、アフィリエイト収入を得ている複数のドメインを追跡。結果として、それらすべてのサイトのHTMLソースコード内部から、同一のアフィリエイト広告アカウントに紐づく配信ID『pub-7777-9999』を発見しました。これにより、各サイトに集まった数百万アクセスによる広告収入、総額数千万円が一つの金融アカウントに直接流れ込んでいた事実を突き止めました。デマの配信元が同一の金銭目的グループであることを示す、絶対的な証拠です」",
        evidenceId: "evidence_ch4_ads"
      },
      ch4_domain_check: {
        id: "ch4_domain_check",
        title: "WHOIS情報＆法人登記追跡：不当アフィリエイトグループ「デマ・プロモート」の実態",
        category: "調査報道・リサーチ",
        url: "http://investigative-journal.net/news/dema-promote-sato",
        excerpt: "「複数のデマサイトを契約していたドメイン所有者の名義を追跡。ダミー法人『デマ・プロモート』の代表者サトウの特定に成功」",
        contentHtml: "調査報道ネットワーク：「バズによるPV稼ぎを組織的に行うドメイン契約者の登録情報（WHOIS情報）を当サイトが追跡したところ、3つのデマドメインの契約者は、すべて『合同会社デマ・プロモート』という渋谷区に登記された実体のない法人でした。法人登記簿を取得して『サーバー契約者情報』を照らし合わせた結果、代表取締役はアフィリエイトマーケターである『サトウ・ケンジ』であることが判明。彼は数年前から、複数の偽ニュースサイトやパニックブログを自動生成して巨額の広告費を得ていた『デマ・ビジネス』の黒幕です」",
        evidenceId: "evidence_ch4_owner"
      }
    },
    timelinePosts: [
      {
        author: "サトウ★まとめサイト経営（一般人）",
        authorHandle: "@sato_marketing_easy",
        avatarText: "サ",
        avatarColor: "bg-zinc-700 border-zinc-500",
        timeText: "8分前",
        textHtml: `ネットで私の運営しているサイトに言いがかりをつけている人がいるようですが、私はただ流行りのまとめサイトを趣味で運営している一般人ですよ。各サイトはネットの書き込みをただまとめてるだけ。組織的なデマ配信なんて、ただの言いがかりや陰謀論ですし、私は一切関わっていません！`
      }
    ],
    classmatePost: {
      author: "アオイ (ナビゲーター)",
      authorHandle: "@aoi_checker",
      avatarText: "葵",
      avatarColor: "bg-rose-950 border-rose-600",
      timeText: "今さっき",
      textHtml: `レン、ついに突き止めたわ。サトウが運営しているサイトと、広告の裏のつながり…！この『広告ID』と『ドメイン所有者』『同一サーバーIP』の情報は絶対に言い逃れできないわよ！`
    },
    deduction: {
      title: "最終決戦デマ論破パート：デマビジネスの黒幕サトウを告発せよ",
      opponentName: "サトウ (デマサイト運営会社代表)",
      opponentAvatar: "sato",
      opponentStatus: "余裕の言い逃れ状態",
      claims: [
        {
          id: "claim_ch4_1",
          text: "「私はただ流行りのまとめサイトを趣味で運営している一般人だ。各サイトは別々の人が作ったものだし、私は組織的なデマ配信なんて一切関わっていない！」",
          label: "主張A"
        },
        {
          id: "claim_ch4_2",
          text: "「ただアクセスが多かっただけで、デマを広めてお金を稼ぐビジネスなんて陰謀論だ！」",
          label: "主張B"
        }
      ],
      correctMatch: {
        claimId: "claim_ch4_1",
        evidenceIds: ["evidence_ch4_ads", "evidence_ch4_ip", "evidence_ch4_owner"]
      },
      softGuidance: "レン、サトウは『趣味のバラバラなサイトで、デマ組織とは無関係』とすっとぼけているわ。\n\n彼の言い逃れに対し、すべてのデマサイトの収益が彼に流れていることを示す「共通の広告配信ID」や、同じ「サーバーIP」「ドメイン登録名義（デマ・プロモート）」の証拠を突きつけて、彼がすべてのデマを仕組んだ黒幕であることを完全に証明し、告発しましょう！"
    },
    explanation: {
      title: "第4章ファクトチェック完了！",
      subtitle: "ネットにデマを氾濫させて荒稼ぎしていた組織的なデマビジネスの黒幕サトウを完全に告発しました！",
      modelTitle: "デマ・ビジネス（MFAサイト）の実態とインセンティブモデル",
      modelText: "現代のネット上において、デマやパニック情報を意図的に流す最大の目的（インセンティブ）の1つは『広告収入（金銭的利益）』です。これらはMFA（Made For Advertising：広告のためだけに作られたサイト）や、AIで自動量産されたまとめサイトと呼ばれます。ショッキングな嘘ほど多くの人にクリックされ、バズを巻き起こし、そのPV数に応じて広告報酬がデマ配信者に支払われます。彼らは社会の混乱や誰かの尊厳を傷つけることなど一切顧みず、ただお金のためにデマを量産し続けているのです。私たち読者が不穏なデマを『面白いから』とクリックしたりシェアしたりすること自体が、彼らの金銭的報酬を助長し、デマを育てる肥料になってしまっているのが情報社会の恐ろしい真実です。",
      skillsTitle: "日常生活で悪質なデマビジネスの餌食にならないための最終メディアリテラシー",
      skills: [
        "「発信者のインセンティブ（目的）」を裏読みする: その情報が流れることで、『誰が一番儲かるのか、どんな利益（金銭、政治、知名度）が誰に入るのか』を冷静に考えるメタ認知能力を身につけましょう。",
        "安易なクリック、安易なシェア（リポスト）を絶対にしない: センセーショナルな見出しを見ても、『これってアクセス数稼ぎ（アフィリエイト目的）じゃないか？』と一歩立ち止まる。シェアをしないことが、デマビジネスを社会から駆逐する最大の防衛策です。",
        "情報の『生態系（エコシステム）』を健全に保つのは私たち一人一人の指先: デマを広めない、確かな情報だけを大切にする。あなた自身の情報リテラシーこそが、大切な家族や友達をネットの詐欺や偏見から守る最強の盾になります。"
      ]
    }
  }
};
