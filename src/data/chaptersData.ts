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
      { char: "アオイ", text: "どれどれ？……『奇跡 of ダイエットフルーツ！』", avatar: "aoi" },
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
        contentHtml: "ミカちゃんが大絶賛！「本当に運動なしで1週間で10kg痩せることも実質可能と謳う極端なサプリですが、臨床データは現在メーカーが準備中。しかし植物由来なので副作用は完全にゼロとのことです」",
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
        { char: "アオイ", text: "気象庁と市の防災ポータルサイトね。ここにもはっきり書いてあるわ！", avatar: "aoi" },
        { char: "レン", text: "『有害ガス発生の事実は確認されておらず、避難指示も発令されていません。公式情報に基づいて冷静に行動してください』だって！", avatar: "ren" },
        { char: "アオイ", text: "避難指示が出ていないことが分かって本当に良かったわ。これで3つの証拠集まったわね！", avatar: "aoi" }
      ]
    },
    evidenceList: [
      {
        id: "evidence_ch2_pic",
        title: "爆発画像の逆画像検索結果",
        source: "外部機関：ネットベリファイ（ファクトチェックサイト）",
        content: "拡散されている工場の爆発写真は、5年前に海外の地方工業地帯で発生した別件の火災事故ニュース of 画像であることが判明。画像にデマ文言をコラージュした合成流用写真。",
        badgeColor: "bg-rose-100 text-rose-800 border-rose-300"
      },
      {
        id: "evidence_ch2_official",
        title: "〇〇工業の公式声明",
        source: "一次資料：〇〇工業株式会社 プレスリリース",
        content: "「自動安全停止システムにより工場は完全に停止。爆発、火災、および有害ガスの漏洩トラブルは一切発生していない。従業員の安全も確認済み」との公式発表。",
        badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300"
      },
      {
        id: "evidence_ch2_weather",
        title: "気象庁・防災緊急発表",
        source: "公的機関：気象庁・〇〇市防災情報ポータル",
        content: "「〇〇工業の化学工場爆発および有害ガス流出の事実は確認されておらず、避難指示・避難勧告も発令されていない。公的機関の発表に基づき行動を」との注意喚起。",
        badgeColor: "bg-sky-100 text-sky-800 border-sky-300"
      }
    ],
    searchKeywords: [
      { word: "〇〇工業", category: "核" },
      { word: "爆発画像", category: "核" },
      { word: "ガス流出", category: "核" },
      { word: "気象庁 避難指示", category: "副" }
    ],
    searchMatches: {
      "〇〇工業": ["ch2_industrial_site", "ch2_news_warning"],
      "爆発画像": ["ch2_pic_check_site"],
      "ガス流出": ["ch2_industrial_site", "ch2_news_warning", "ch2_weather_site"],
      "気象庁 避難指示": ["ch2_weather_site"]
    },
    webPages: {
      ch2_pic_check_site: {
        id: "ch2_pic_check_site",
        title: "【ファクトチェック】「化学工場で大爆発」SNS画像は5年前の海外事故写真の流用と判明",
        category: "ファクトチェック報道",
        url: "http://verify-news.oo-city.jp/article/ch2_fact_check",
        excerpt: "地震後に拡散した『〇〇工業の化学工場爆発』とされる画像は、2019年の海外事故のものであることが判明しました。",
        contentHtml: "ネットベリファイ：「本日大地震の直後から、SNS上で『〇〇工業の化学工場が爆発し、有害ガスが噴き出している』とする衝撃的な画像が大量に拡散されています。しかし、当編集部がこの画像を用いて逆画像検索（検索エンジンを使った画像一致調査）を行ったところ、本写真は5年前に海外の地方工業地帯で発生した別件の爆発火災事故のニュース画像であることが判明しました。画像にテキストをコラージュして合成された、悪質な災害デマ画像です。騙されないでください」",
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
      { char: "アオイ", text: "できるのよ、今は誰でもそれらしく作れちゃうの。早速、元の『市長 失言動画』の出元や、『ディープフェイク解析』、『オリジナル音声データ』を検索して、悪質な『発言の前後カット』や『記者会見 実際の映像』がどうなっているか検証しましょう！", avatar: "aoi" }
    ],
    matchDialogues: [
      { char: "アオイ", text: "やっぱりね！思った通りの完全なディープフェイク捏造動画だったわね！", avatar: "aoi" },
      { char: "レン", text: "これはひどい……！専門機関の解析で『AI合成の不自然なノイズ』がバッチリ検出されているね。これで音声解析（証拠A）とフェイク映像（証拠C）の矛盾・対立が証明された！", avatar: "ren" },
      { char: "レン", text: "しかも、公式会見のオリジナルフル映像（証拠B）と突き合わせたら、本来の『使い込む…ような事態は、絶対にあってはならない』という発言の後半をバッサリカットして『使い込む』と繋ぎ合わせていたんだ！これもフェイク映像（証拠C）と完全に対立するね！", avatar: "ren" },
      { char: "アオイ", text: "その通りよ、レン！SNSに流れたフェイク映像（証拠C）に対して、技術面の嘘（証拠A）と文脈の嘘（証拠B）という2つの角度から、矛盾・対立関係を証明できるわね！", avatar: "aoi" },
      { char: "レン", text: "なるほど！この対立ネットワークを見れば、誰でも動画が嘘だと一目で納得するよ！", avatar: "ren" },
      { char: "アオイ", text: "証拠ボードでこの対立の矢印をバッチリ結びつけて、ジョーに突きつけに行きましょう！", avatar: "aoi" }
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
      ],
      evidence_ch3_video: [
        { char: "アオイ", text: "これがSNSで拡散されている、問題の『市長の失言フェイク映像』ね。", avatar: "aoi" },
        { char: "レン", text: "本当に市長本人が笑いながら『税金を使い込む』って喋っているように見えるよ……！", avatar: "ren" },
        { char: "アオイ", text: "見た目はすごくリアルだけど、これを証拠Cとしてボードに貼り付けて、技術解析（証拠A）とノーカット映像（証拠B）の2つを突きつけて、矛盾（対立）をあぶり出すのよ！", avatar: "aoi" }
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
      },
      {
        id: "evidence_ch3_video",
        title: "SNSの市長失言フェイク映像",
        source: "SNS：拡散されているショート動画",
        content: "SNSで数万件リポストされている、市長が記者会見で「市民の税金を自分の趣味に使い込む」と発言しているとされるフェイク映像。検証の対象であり、証拠A（技術解析）と証拠B（ノーカット本物）の両方と完全に対立・矛盾する。",
        badgeColor: "bg-rose-100 text-rose-800 border-rose-300"
      }
    ],
    searchKeywords: [
      { word: "市長 失言動画", category: "核" },
      { word: "ディープフェイク解析", category: "核" },
      { word: "オリジナル音声データ", category: "核" },
      { word: "発言の前後カット", category: "副" },
      { word: "記者会見 実際の映像", category: "副" }
    ],
    searchMatches: {
      "市長 失言動画": ["ch3_ai_check_site", "ch3_city_archive", "ch3_original_video_site"],
      "ディープフェイク解析": ["ch3_ai_check_site"],
      "オリジナル音声データ": ["ch3_city_archive"],
      "発言の前後カット": ["ch3_city_archive"],
      "記者会見 実際の映像": ["ch3_original_video_site"]
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
      },
      ch3_original_video_site: {
        id: "ch3_original_video_site",
        title: "【生中継アーカイブ】令和8年6月15日 市長記者会見（フル・高画質配信）",
        category: "ニュース動画配信・公的中継",
        url: "http://broadcasting-live.oo-pref.jp/mayor-live-archive",
        excerpt: "「中継配信局による、市長記者会見の当日ノーカット生中継アーカイブ。合成、加工、編集が一切ないオリジナル映像データ」",
        contentHtml: "地方ネット放送局：「本日実施された市長記者会見の全編録画（高画質1080p）を公開中。一部SNS等で拡散されている、音声と口元の動きが歪んで見える失言シーンの映像は、AI技術で偽造されたものです。当局が中継録画したこのオリジナル映像と突き合わせれば、それが不自然に歪められた『ディープフェイク』であることが一目瞭然で確認できます」",
        evidenceId: "evidence_ch3_video"
      }
    },
    timelinePosts: [
      {
        author: "正義の市民ジャーナリスト（非公式）",
        authorHandle: "@justice_citizen_oo",
        avatarText: "正",
        avatarColor: "bg-red-700 border-red-500",
        timeText: "5分前",
        textHtml: `【激怒】市長が記者会見で「税金使い込むの最高」って言ってる動画が流れてきた！絶対に許せない、今すぐ市長をリコール（解職請求）すべきだ！こんなやつがトップでいいのか！？「市長 失言動画」を今すぐ検索して見てくれ！`
      },
      {
        author: "テクノロジー検証bot",
        authorHandle: "@tech_verifier",
        avatarText: "技",
        avatarColor: "bg-blue-700 border-blue-500",
        timeText: "3分前",
        textHtml: `【技術的警戒】拡散中の市長記者会見動画について、一部シーンでデジタル不連続点や「ディープフェイク解析」が必要なノイズが確認されています。本物と断定せず、オリジナルの「記者会見 実際の映像」や「オリジナル音声データ」と比較するまで拡散は控えてください。`
      }
    ],
    classmatePost: {
      author: "ジョー (クラスメイト)",
      authorHandle: "@joe_pc_master",
      avatarText: "ジ",
      avatarColor: "bg-blue-900 border-blue-600",
      timeText: "1分前",
      textHtml: `これ、僕も見たけどマジで市長本人が喋ってるように見える。もし合成動画だとしたら恐ろしすぎる技術だな……。どっちが本当なんだろう？`
    },
    deduction: {
      title: "デマ論破パート：ジョーを納得させよ",
      opponentName: "ジョー (クラスメイト)",
      opponentAvatar: "joe",
      opponentStatus: "真偽を疑う状態",
      claims: [
        {
          id: "claim_ch3_1",
          text: "「動画では市長本人が確かに『税金を趣味に使い込む』って言ってるように見える。これが本物の会見映像じゃないと証明できるの？」",
          label: "主張A"
        },
        {
          id: "claim_ch3_2",
          text: "「声も市長そっくりだし、わざわざこんな偽動画を何のために作るんだよ？」",
          label: "主張B"
        }
      ],
      correctMatch: {
        claimId: "claim_ch3_1",
        evidenceIds: ["evidence_ch3_ai", "evidence_ch3_full", "evidence_ch3_video"]
      },
      softGuidance: "レン、ジョーくんはテクノロジーに詳しいけど、ディープフェイクや前後カット（切り取り編集）の可能性についてまだ半信半疑みたい。\n\n彼の『これが本物じゃない証拠はあるのか』という疑問に対して、SNSの「フェイク映像（証拠C）」を提示しながら、それが「AI解析（証拠A）」や「ノーカットフル音声（証拠B）」という真実のデータと、どう矛盾・対立しているかを突きつけてあげて！"
    },
    explanation: {
      title: "第3章ファクトチェック完了！",
      subtitle: "高度なAI偽動画（ディープフェイク）や悪意ある切り取り編集を見事に論破しました！",
      modelTitle: "実在する類似のAI・ハイテクフェイク事例モデル",
      modelText: "現在、ディープフェイク（Deepfake）と呼ばれるAIによる音声・映像合成技術は急速に進化しています。実際に海外の選挙戦や政治の現場で、現職大統領や有力な政治家が「戦争や不祥事を肯定する」偽動画が作られ、大パニックを招きかけた実例が多数存在します。また、悪意のある「前後カット（切り取り編集）」によって、主旨が180度異なる発言に改ざんされたショート動画も日常的に拡散しています。",
      skillsTitle: "日常生活でディープフェイクや切り取り動画に騙されないためのファクトチェック技術",
      skills: [
        "一次ソースの「ノーカット映像・テキスト」を探す: 拡散されている「数秒〜数十秒の切り取り動画」だけを信じるのではなく、公式サイトで記者会見のノーカット版アーカイブを閲覧し、発言の前後関係（文脈）を確かめる。",
        "細部に注目する（不自然なノイズ・瞬きの少なさ）: AI合成動画は、目や口の動きが異様にぎこちなかったり、瞬きを全くしていなかったり、輪郭が揺らいでデジタルノイズ（フレーム飛び）が生じたりします。",
        "科学的・専門的な検証（ファクトチェックサイト等）を待つ: 高度な偽動画は一見して見分けるのが難しいため、専門の技術機関によるAI検証データや、信頼性の高い大手報道機関のファクトチェック記事を冷静に待つ姿勢が大切です。"
      ]
    }
  },
  4: {
    id: 4,
    title: "第4章：偽情報（フェイク）の生産工場",
    theme: "複合デマと黒幕との対決（世論誘導と真犯人）",
    introDialogues: [
      { char: "レン", text: "大変だアオイ！これまでのデマサイト……ダイエットフルーツも、工場の爆発デマも、市長の偽動画も、全部同じ人物が仕組んだんじゃないかって噂があるんだ！", avatar: "ren" },
      { char: "アオイ", text: "えっ、本当！？でも、全くテーマも性質も違う事件に見えるけど……", avatar: "aoi" },
      { char: "レン", text: "ネットで調べてみよう。デマサイトの裏側、サーバーの契約情報や、広告の配信IDに何か共通点があるかもしれないよ！", avatar: "ren" },
      { char: "アオイ", text: "なるほどね！ドメイン所有者や広告ID、同一サーバーIP、サーバー契約者情報などを検索して、それらの裏データを結びつけてみましょう！", avatar: "aoi" }
    ],
    matchDialogues: [
      { char: "アオイ", text: "これを見て！驚いたわ、やっぱりすべての事件が裏で繋がっていたのよ！", avatar: "aoi" },
      { char: "レン", text: "うそだろ……。これまでの3つのデマサイトの裏データ（広告ID、サーバーIP、契約者名義）が、すべて『SATO』という同一アカウントで結びついている！", avatar: "ren" },
      { char: "アオイ", text: "そうよ。これは単なる悪戯や趣味のデマじゃないわ。アクセスを集めて多額のアフィリエイト広告収入を得るために、組織的に仕組まれた『デマ・ビジネス』だったのよ！", avatar: "aoi" },
      { char: "レン", text: "サトウって、僕たちの知り合いのサトウじゃないか！？証拠ボードに貼り付けて、彼を告発しに行こう！", avatar: "ren" }
    ],
    evidenceDialogues: {
      evidence_ch4_fruit: [
        { char: "アオイ", text: "ダイエットフルーツの紹介サイトのサーバー情報を調べたわ。ドメインの所有者名は隠されていたけど、広告配信用のアフィリエイトID（AdID）は『AD-SATO-999』になってるわ！", avatar: "aoi" },
        { char: "レン", text: "やっぱり！広告収入を得るためにあのダイエットデマ記事を書いていたんだね！", avatar: "ren" }
      ],
      evidence_ch4_factory: [
        { char: "レン", text: "災害デマサイトのサーバーIPアドレスを特定したぞ！アオイ、これ見て！", avatar: "ren" },
        { char: "アオイ", text: "サーバーのIPアドレスがダイエットフルーツのサイトと完全に同一ね。さらに、ドメインの登録名義は非公開だけど、同じネームサーバーが使われているわ。これは同じ人間が運営している証拠よ！", avatar: "aoi" }
      ],
      evidence_ch4_mayor: [
        { char: "アオイ", text: "市長フェイク動画の動画拡散ドメインの契約者情報を、WHOISデータベースの過去ログから復元できたわ！", avatar: "aoi" },
        { char: "レン", text: "登録契約者の本名が書いてある！『Satoru Sato（佐藤覚）』……！これ、間違いない、サトウの仕業だ！", avatar: "ren" },
        { char: "アオイ", text: "これで3つのデマ事件すべての裏で、同じ佐藤という人物が暗躍し、アフィリエイト報酬を同じ口座で受け取っていたという『関連性』が証明されたわ！", avatar: "aoi" }
      ]
    },
    evidenceList: [
      {
        id: "evidence_ch4_fruit",
        title: "フルーツサイトの広告配信ID",
        source: "技術データ：ソースコード解析",
        content: "第1章のダイエットフルーツ広告記事に埋め込まれていた、広告配信用のアフィリエイトID。アカウント契約者名が『AD-SATO-999』と記録されている。",
        badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300"
      },
      {
        id: "evidence_ch4_factory",
        title: "災害デマサイトの同一IPサーバー",
        source: "通信データ：DNS・IPホスト情報",
        content: "第2章の工場大爆発デマを発信していた海外ドメインのホストサーバー。そのIPアドレスおよびネームサーバー情報が、第1章のダイエットフルーツサイトと100%同一であることが判明。",
        badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-300"
      },
      {
        id: "evidence_ch4_mayor",
        title: "市長フェイク動画ドメイン契約者",
        source: "一次資料：WHOISドメイン登録履歴",
        content: "第3章の市長ディープフェイク動画を最初に投稿した匿名ドメインの登録者情報。復元された登録者名義は『Satoru Sato』であり、同一口座にアフィリエイト収入が振り込まれていた証拠を確保。",
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
      "ドメイン所有者": ["ch4_fruit_check_site", "ch4_mayor_check_site"],
      "広告ID": ["ch4_fruit_check_site"],
      "同一サーバーIP": ["ch4_factory_check_site"],
      "サーバー契約者情報": ["ch4_mayor_check_site"]
    },
    webPages: {
      ch4_fruit_check_site: {
        id: "ch4_fruit_check_site",
        title: "【ドメイン裏解析】奇跡のダイエットフルーツ詐欺サイトの広告掲載タグ調査",
        category: "サイバーセキュリティ調査",
        url: "http://cyber-detective.oo-net.jp/analysis/diet-fruit",
        excerpt: "ダイエットフルーツの販売・宣伝アフィリエイト広告IDが『AD-SATO-999』であることを検出。",
        contentHtml: "セキュリティ解析ブログ：「第1章で大問題となったダイエットフルーツ詐欺広告のランディングページについて、当サイトがソースコードを調査したところ、埋め込まれていたGoogle Adsおよびアフィリエイト広告の配信用タグIDが『AD-SATO-999』であることが明らかになりました。このサイトの運営者は、アクセスが集まるたびにこのIDを紐づけて広告収入を得る仕組みを構築していました」",
        evidenceId: "evidence_ch4_fruit"
      },
      ch4_factory_check_site: {
        id: "ch4_factory_check_site",
        title: "【サーバー通信分析】「崩壊した化学工場」デマサイトのホストIP履歴",
        category: "通信解析・DNS調査",
        url: "http://network-scanner.oo-pref.jp/dns/factory-hoax",
        excerpt: "災害デマを発信した海外匿名サーバーのIPアドレスは、ダイエットフルーツ詐欺サイトと全く同じ物理サーバーであることを検知。",
        contentHtml: "ネットワークアナリスト：「第2章で災害パニックを引き起こした『化学工場爆発デマ』のニュース風サイトは、一見すると海外の匿名サーバーを経由していますが、DNS of 履歴とネームサーバーを追跡したところ、そのIPアドレスは第1章のダイエットフルーツ広告サイトと完全に一致。同一のバーチャルホスト上に構築され、同じ物理サーバー上で運用されていたことが判明しました。これは完全に同じ運営者グループ、または同一人物による仕業です」",
        evidenceId: "evidence_ch4_factory"
      },
      ch4_mayor_check_site: {
        id: "ch4_mayor_check_site",
        title: "【ドメイン公開情報】市長失言ディープフェイク動画配信元のドメイン登録履歴復元",
        category: "WHOISデータベースアーカイブ",
        url: "https://www.whois-registry-archive.jp/record/mayor-fake-domain",
        excerpt: "非公開にされる前の市長偽動画投稿ドメインの初期登録者名義が『Satoru Sato』であることを確認。",
        contentHtml: "WHOIS情報保管サービス：「第3章で市長選を大混乱に陥れた『市長ディープフェイク動画』の配信ドメインは、公開当初からプライバシー保護により登録者名が隠されていましたが、ドメイン登録直後のWHOIS情報の履歴をアーカイブから復元したところ、初期登録者名に『Satoru Sato（佐藤覚）』という本名と登録用アドレスが記録されていました。この佐藤氏、つまりサトウは、広告アフィリエイトタグ『AD-SATO-999』のアカウントの所有者とも100%一致しており、これまでの3つのデマによるアクセス急増が、彼の広告収入口座に多額のお金を流し込んでいた直接の証拠を握りました」",
        evidenceId: "evidence_ch4_mayor"
      }
    },
    timelinePosts: [
      {
        author: "情報倫理ネットワーク",
        authorHandle: "@info_ethics_japan",
        avatarText: "倫",
        avatarColor: "bg-purple-900 border-purple-600",
        timeText: "10分前",
        textHtml: `【黒幕説の浮上】これまでに大問題となった3つのデマ。何者かが裏で組織的に「ドメイン所有者」や「広告ID」を隠して運用している可能性があります。それぞれの「同一サーバーIP」や「サーバー契約者情報」を追跡し、フェイクニュースの本当の発生源を特定する必要があります。`
      }
    ],
    classmatePost: {
      author: "サトウ (クラスメイト)",
      authorHandle: "@sato_satoru",
      avatarText: "サ",
      avatarColor: "bg-amber-900 border-amber-600",
      timeText: "5分前",
      textHtml: `へえ、ネットのデマを追跡するなんて面白そうだね。ドメインの所有者や広告IDを調べたり、同一サーバーIPやサーバー契約者情報を追跡できれば本当に誰が作ったか分かるのかな？`
    },
    deduction: {
      title: "デマ論破パート：サトウの嘘を暴け",
      opponentName: "サトウ (デマ業者)",
      opponentAvatar: "sato",
      opponentStatus: "余裕の言い逃れ状態",
      claims: [
        {
          id: "claim_ch4_1",
          text: "「私はただ、ネットで見つけた流行りの話をまとめただけの一般人だよ。これまでのデマ大事件なんて、私には何の関係もないじゃないか」",
          label: "主張A"
        },
        {
          id: "claim_ch4_2",
          text: "「デマサイトでアフィリエイト広告収入を得るのなんて、法律に触れるわけでもないだろ！騙される方が悪いんだ！」",
          label: "主張B"
        }
      ],
      correctMatch: {
        claimId: "claim_ch4_1",
        evidenceIds: ["evidence_ch4_fruit", "evidence_ch4_factory", "evidence_ch4_mayor"]
      },
      softGuidance: "レン、サトウは『これまでの事件は自分とは無関係で、ただのまとめサイトの運営者だ』と言い張っているわ。\n\n彼の『事件とは無関係だ』という嘘を崩すために、私たちが集めた3つの証拠（ダイエットフルーツの広告ID：証拠A、災害デマのサーバーIP：証拠B、市長フェイク動画の契約者名：証拠C）が、すべて同一人物『SATO』で結びついている『関連性』を、証拠ボードを使ってサトウに突きつけてあげて！"
    },
    explanation: {
      title: "第4章ファクトチェック完了！すべての謎が解けました！",
      subtitle: "アクセスを稼ぎ広告収入を得るためにフェイクニュースを量産していた黒幕サトウを告発しました！",
      modelTitle: "実在する類似の「デマ・ビジネス」モデル",
      modelText: "現代のインターネットにおいて、フェイクニュースが量産される最大の動機（インセンティブ）は「金銭的利益（アフィリエイト広告収入）」です。実際に『MFA（Made For Advertising：広告のためだけのサイト）』と呼ばれる、AIなどを利用して人々の怒りやパニックを煽るデマ記事を大量自動生成し、数万人以上のアクセスを集めて巨額のアドセンス広告料を稼ぐ悪質な業者が世界中で暗躍しています。これらは個人のいたずらではなく、組織化された一つの「ビジネスモデル」として社会問題化しています。",
      skillsTitle: "日常生活で悪質なデマビジネスに加担しないためのファクトチェック技術",
      skills: [
        "発信者の「目的（インセンティブ）」を裏読みする: 記事が感情（怒り・恐怖・驚き）を不自然に刺激し、かつ広告や販売リンクが多数掲載されている場合は、発信者の目的が「真実の伝達」ではなく「PV稼ぎと広告収入」であることを疑いましょう。",
        "デマ記事に「触らない・シェアしない」: 私たちがデマ記事をクリックしたりSNSで拡散したりする行動は、そのまま悪質な発信者の懐にお金（アクセス数・広告収入）を流し込むことになります。不確かな情報や煽り記事は「無視する（シェアしない）」ことが最強の防衛策です。",
        "社会全体でのファクトチェック活動への理解: 情報社会で生きる私たち全員が『クリックひとつ、シェアひとつ』に責任があるという自覚を持つこと。デマのインセンティブ（収益）を断ち切るために、冷静な判断力と倫理観を持ち続けることが、ネット社会を守る防衛網になります。"
      ]
    }
  }
};
