import type {
  FermiHypothesisCard,
  FermiHypothesisSlot,
  FermiStageDefinition,
  FermiTier,
} from './types';

function card(
  stageId: number,
  actIndex: 1 | 2 | 3,
  cardNumber: 1 | 2 | 3 | 4,
  jaLabel: string,
  enLabel: string,
  jaDisplayVal: string,
  enDisplayVal: string,
  numericValue: number,
  trap?: { readonly ja: string; readonly en: string },
): FermiHypothesisCard {
  return {
    id: `f${String(stageId)}-a${String(actIndex)}-${String(cardNumber)}`,
    label: { ja: jaLabel, en: enLabel },
    displayValue: { ja: jaDisplayVal, en: enDisplayVal },
    numericValue,
    isTrap: Boolean(trap),
    trapReason: trap ? { ja: trap.ja, en: trap.en } : null,
  };
}

function slot(
  actIndex: 1 | 2 | 3,
  jaRole: string,
  enRole: string,
  cards: FermiHypothesisCard[],
): FermiHypothesisSlot {
  const slotCode = actIndex === 1 ? 'ACT 1' : actIndex === 2 ? 'ACT 2' : 'ACT 3';
  return {
    actIndex,
    slotCode,
    roleLabel: { ja: jaRole, en: enRole },
    cards,
  };
}

function fermiStage(
  stageId: number,
  tier: FermiTier,
  jaQuestion: string,
  enQuestion: string,
  jaUnit: string,
  enUnit: string,
  baselineValue: number,
  jaFormula: string,
  enFormula: string,
  jaBreakdown: string,
  enBreakdown: string,
  slots: [FermiHypothesisSlot, FermiHypothesisSlot, FermiHypothesisSlot],
): FermiStageDefinition {
  return {
    stageId,
    tier,
    question: { ja: jaQuestion, en: enQuestion },
    unitLabel: { ja: jaUnit, en: enUnit },
    baselineValue,
    baselineFormula: { ja: jaFormula, en: enFormula },
    baselineBreakdownText: { ja: jaBreakdown, en: enBreakdown },
    slots,
  };
}

export const FERMI_STAGES: readonly FermiStageDefinition[] = [
  fermiStage(
    1,
    'beginner',
    'STAGE 1：日本全国の飲料自動販売機における1日あたりの総売上高はいくらか？',
    'Stage 1: What is the daily total revenue of beverage vending machines across Japan (JPY/day)?',
    '円 / 日',
    'JPY / day',
    6.0e9,
    'ACT 1 × ACT 2 × ACT 3 = 稼働台数 240万台 × 1日販売 20本/台 × 平均単価 130円 ≈ 6.2 × 10^9 円/日',
    'ACT 1 × ACT 2 × ACT 3 = 2.4M machines × 20 drinks/day × 130 JPY ≈ 6.2 × 10^9 JPY/day',
    '国内の飲料自販機は約240万台（人口約50人に1台）が稼働しており、1台あたり1日平均20本前後、1本約130円で販売すると1日約60億円規模になります。',
    'About 2.4M beverage vending machines operate in Japan (~1 per 50 residents); selling ~20 drinks/day at ~130 JPY yields roughly 6.0B JPY per day.',
    [
      slot(1, '国内の飲料自販機稼働台数', 'Active beverage machines in Japan', [
        card(1, 1, 1, '全国稼働台数（人口50人に1台）', 'Active machines (~1 per 50 people)', '240万台', '2.4M units', 2.4e6),
        card(1, 1, 2, '日本の総人口そのまま', 'Total population of Japan', '1.2億台', '120M units', 1.2e8, {
          ja: '日本の総人口（約1.2億人）と自販機の設置台数を1人1台で混同しています。',
          en: 'Confuses total human population (120M) with installed machine count at 1:1.',
        }),
        card(1, 1, 3, '主要駅構内のみの設置数', 'Major train stations only', '5万台', '50K units', 5.0e4),
        card(1, 1, 4, '全業種合算の広義自販機台数', 'Broad machine count incl. lockers', '600万台', '6.0M units', 6.0e6),
      ]),
      slot(2, '1台あたりの1日販売本数', 'Drinks sold per machine per day', [
        card(1, 2, 1, '1台あたりの1日平均本数', 'Average daily sales per unit', '20本 / 日', '20 / day', 20),
        card(1, 2, 2, '1か月分の累計販売本数', 'Monthly cumulative sales', '600本 / 日', '600 / day', 600, {
          ja: '1か月（30日分）の販売本数を1日あたりとして30倍過大に計上しています。',
          en: 'Counts 30-day monthly volume as a single day (30x overcount).',
        }),
        card(1, 2, 3, '閑散地の最低販売本数', 'Off-peak rural minimum', '1.5本 / 日', '1.5 / day', 1.5),
      ]),
      slot(3, '飲料1本あたりの平均単価', 'Average price per drink', [
        card(1, 3, 1, '缶・ペットボトル平均単価', 'Average can/bottle price', '130円', '130 JPY', 130),
        card(1, 3, 2, '単価の1桁取り違え', 'Misplaced decimal price', '1,300円', '1,300 JPY', 1300, {
          ja: '飲料1本の単価を1,300円と1桁（10倍）取り違えています。',
          en: 'Off by a factor of 10 on unit beverage price (1,300 JPY instead of 130 JPY).',
        }),
        card(1, 3, 3, '小容量紙パック中心の単価', 'Discount mini-pack price', '80円', '80 JPY', 80),
      ]),
    ],
  ),

  fermiStage(
    2,
    'beginner',
    'STAGE 2：東京都内のコンビニエンスストアで1日に販売される淹れたてカウンターコーヒーの総杯数は？',
    'Stage 2: How many freshly brewed counter coffees are sold per day at convenience stores in Tokyo?',
    '杯 / 日',
    'cups / day',
    1.8e6,
    'ACT 1 × ACT 2 × ACT 3 = 都内約7,500店 × 来店800人/店・日 × 購入率0.28杯/人 ≈ 1.7 × 10^6 杯/日',
    'ACT 1 × ACT 2 × ACT 3 = 7,500 Tokyo stores × 800 visitors/day × 0.28 cups/visitor ≈ 1.7 × 10^6 cups/day',
    '東京都内のコンビニ店舗数は約7,500店（全国の約13%）で、1店1日あたり約800人が来店し、約4人に1人強（0.28杯/人）がコーヒーを買うと約170万〜180万杯/日となります。',
    'Tokyo hosts ~7,500 convenience stores (~13% of Japan); with ~800 daily customers per store and ~0.28 cups per customer, daily sales reach ~1.8M cups.',
    [
      slot(1, '東京都内のコンビニ店舗数', 'Convenience stores in Tokyo', [
        card(2, 1, 1, '東京都内の店舗数', 'Stores within Tokyo', '7,500店', '7,500 stores', 7500),
        card(2, 1, 2, '日本全国の総店舗数', 'All stores nationwide in Japan', '56,000店', '56,000 stores', 56000, {
          ja: '東京都内のお題に対し、日本全国のコンビニ総店舗数（約5.6万店）を使ってしまっています。',
          en: 'Uses nationwide store count (56,000) instead of Tokyo-only scope.',
        }),
        card(2, 1, 3, '山手線駅前のみの店舗数', 'Station-front stores only', '500店', '500 stores', 500),
      ]),
      slot(2, '1店舗あたりの1日来店客数', 'Daily customers per store', [
        card(2, 2, 1, '標準店舗の1日平均客数', 'Typical daily store footfall', '800人 / 日', '800 / day', 800),
        card(2, 2, 2, '巨大ターミナル駅ビル全体の客数', 'Entire terminal complex traffic', '8,000人 / 日', '8,000 / day', 8000, {
          ja: '大型商業施設全体の通過人数を1店舗のレジ通過客数と混同しています。',
          en: 'Confuses foot traffic of an entire station building with a single convenience store.',
        }),
        card(2, 2, 3, '深夜帯のみの客数', 'Late-night shift visitors only', '80人 / 日', '80 / day', 80),
      ]),
      slot(3, '来店客1人あたりのコーヒー購入杯数', 'Coffee cups bought per visitor', [
        card(2, 3, 1, '来店客の約28%が1杯購入', '~28% of visitors buy 1 cup', '0.28杯 / 人', '0.28 cups', 0.28),
        card(2, 3, 2, '来店客全員が毎回2.5杯購入', 'Every visitor buys 2.5 cups', '2.5杯 / 人', '2.5 cups', 2.5, {
          ja: '購入率を掛け忘れ、来店客全員が毎回2.5杯ずつ買う過大前提になっています。',
          en: 'Omits buyer ratio and assumes every single shopper buys 2.5 cups per visit.',
        }),
        card(2, 3, 3, '30人に1人だけ購入', 'Only 3% of visitors buy', '0.03杯 / 人', '0.03 cups', 0.03),
      ]),
    ],
  ),

  fermiStage(
    3,
    'beginner',
    'STAGE 3：日本全国のスマートフォン充電によって1日に消費される総電力量（Wh / 日）は？',
    'Stage 3: How much total electrical energy (Wh/day) is used daily to charge smartphones across Japan?',
    'Wh / 日',
    'Wh / day',
    8.6e8,
    'ACT 1 × ACT 2 × ACT 3 = 稼働約9,000万台 × 0.85回/日 × 1回約12Wh ≈ 9.2 × 10^8 Wh/日',
    'ACT 1 × ACT 2 × ACT 3 = 90M active phones × 0.85 charges/day × 12 Wh/charge ≈ 9.2 × 10^8 Wh/day',
    'スマホのバッテリー容量は約3,200mAh × 3.8V ≈ 12Wh です。国内稼働約9,000万台が1日平均0.85回フル充電相当を行うと、約8.6億〜9.2億Wh/日（約860MWh/日）になります。',
    'A typical 3,200 mAh × 3.8 V phone battery holds ~12 Wh. Across ~90M active phones in Japan at ~0.85 full-charge equivalents/day, consumption is ~8.6 × 10^8 Wh/day.',
    [
      slot(1, '日本国内の稼働スマートフォン台数', 'Active smartphones in Japan', [
        card(3, 1, 1, '国内の個人・法人稼働スマホ数', 'Active smartphones in Japan', '9,000万台', '90M phones', 9.0e7),
        card(3, 1, 2, '世界全体のモバイル契約総数', 'Global mobile subscriptions', '90億台', '9.0B phones', 9.0e9, {
          ja: '日本国内ではなく世界全体のモバイル契約数（約90億）を使っており100倍過大です。',
          en: 'Uses worldwide mobile subscriptions (9B) instead of Japan (~90M).',
        }),
        card(3, 1, 3, '単一キャリアの新規年間出荷のみ', 'Single-carrier annual shipments', '500万台', '5.0M phones', 5.0e6),
      ]),
      slot(2, '1台あたりの1日フル充電換算回数', 'Full-charge equivalents per day', [
        card(3, 2, 1, '1日平均85%分の充電', '85% charge cycle per day', '0.85回 / 日', '0.85 / day', 0.85),
        card(3, 2, 2, '1年間の累積充電回数', 'Annual charge cycles per year', '300回 / 日', '300 / day', 300, {
          ja: '1年間（365日分）の充電回数を1日あたりとして計上しています。',
          en: 'Uses annual charge count (~300/year) as if it happened in a single day.',
        }),
        card(3, 2, 3, '20日に1回のみ充電', 'Charged once every 20 days', '0.05回 / 日', '0.05 / day', 0.05),
      ]),
      slot(3, 'フル充電1回あたりの消費電力量（Wh）', 'Energy per full charge (Wh)', [
        card(3, 3, 1, '3,200mAh × 3.8V（充電損失込み）', '3,200 mAh × 3.8 V (~12 Wh)', '12 Wh', '12 Wh', 12),
        card(3, 3, 2, 'mAhの数値をそのままWhと誤認', 'Raw mAh number treated as Wh', '3,200 Wh', '3,200 Wh', 3200, {
          ja: '電荷量 3,200mAh（3.2Ah）に電圧約3.8Vを掛けず、1,000倍大きい 3,200Wh と単位混同しています。',
          en: 'Confuses 3,200 mAh (3.2 Ah × 3.8 V ≈ 12 Wh) directly with 3,200 Wh (~260x unit error).',
        }),
        card(3, 3, 3, '小型ウェアラブル端末の容量', 'Smartwatch battery size', '2 Wh', '2 Wh', 2),
      ]),
    ],
  ),

  fermiStage(
    4,
    'intermediate',
    'STAGE 4：平日昼ピーク時における東京都内のWeb会議・同時通信帯域の合計（Mbps）は？',
    'Stage 4: What is the peak weekday-afternoon concurrent video-call bandwidth across Tokyo (Mbps)?',
    'Mbps',
    'Mbps',
    1.5e5,
    'ACT 1 × ACT 2 × ACT 3 = 都内就業者800万人 × 瞬間同時通話率1.5% × 1人1.3Mbps ≈ 1.56 × 10^5 Mbps',
    'ACT 1 × ACT 2 × ACT 3 = 8.0M Tokyo workers × 1.5% concurrent rate × 1.3 Mbps/stream ≈ 1.56 × 10^5 Mbps',
    '東京都内の昼間就業人口約800万人のうち、ある瞬間に同時Web会議中の割合は約1.5%（約12万人）で、1ストリーム平均1.3Mbpsを掛けると合計約15万Mbps（150Gbps）になります。',
    'Of ~8M weekday workers in Tokyo, ~1.5% (~120K people) are in a live call simultaneously; at ~1.3 Mbps per stream, total concurrent bandwidth is ~1.5 × 10^5 Mbps.',
    [
      slot(1, '東京都内の平日昼間就業者数', 'Weekday workers in Tokyo', [
        card(4, 1, 1, '東京都内の昼間就業人口', 'Daytime workforce in Tokyo', '800万人', '8.0M people', 8.0e6),
        card(4, 1, 2, '日本全国の総人口', 'Total population of Japan', '1.25億人', '125M people', 1.25e8, {
          ja: '東京都内かつ就業者の母集団に対し、非就業者を含む日本総人口を当てています。',
          en: 'Substitutes total national population (125M) for Tokyo daytime workforce (8M).',
        }),
        card(4, 1, 3, '単一区のオフィス街のみ', 'Single ward office district', '40万人', '400K people', 4.0e5),
        card(4, 1, 4, '都内デスクワーク中心層', 'Desk-centric Tokyo workers', '500万人', '5.0M people', 5.0e6),
      ]),
      slot(2, 'ある瞬間にWeb会議へ同時接続している比率', 'Instantaneous concurrent call ratio', [
        card(4, 2, 1, '瞬間同時接続率（約1.5%）', 'Instantaneous concurrent share (1.5%)', '0.015', '0.015', 0.015),
        card(4, 2, 2, '1日に1回でも会議する延べ比率', 'Daily cumulative meeting ratio (45%)', '0.45', '0.45', 0.45, {
          ja: '「1日のうちに1回以上会議する延べ割合（45%）」と「ある瞬間の同時接続率」を混同しています。',
          en: 'Confuses cumulative daily participation (45%) with instantaneous concurrency (~1.5%).',
        }),
        card(4, 2, 3, '深夜メンテナンス時間帯の比率', 'Off-hours concurrency', '0.0005', '0.0005', 0.0005),
      ]),
      slot(3, '参加者1人あたりの平均通信ビットレート（Mbps）', 'Average bitrate per participant (Mbps)', [
        card(4, 3, 1, 'HD映像＋音声の平均ストリーム', 'Typical HD video + audio stream', '1.3 Mbps', '1.3 Mbps', 1.3),
        card(4, 3, 2, '1時間あたりの累積データ量（MB/h）', 'Hourly data volume (MB/hour)', '540 Mbps', '540 Mbps', 540, {
          ja: '1時間で消費するデータ量（約540MB/時）を秒間帯域（Mbps）と単位混同しています。',
          en: 'Confuses 1-hour cumulative megabytes (~540 MB/h) with megabits per second (Mbps).',
        }),
        card(4, 3, 3, '音声通話のみ（映像オフ）', 'Audio-only low bitrate', '0.1 Mbps', '0.1 Mbps', 0.1),
      ]),
    ],
  ),

  fermiStage(
    5,
    'intermediate',
    'STAGE 5：世界中のソフトウェア開発者が1日にコミットする新規手書きコード総行数（行 / 日）は？',
    'Stage 5: How many net human-written lines of code are committed daily by developers worldwide?',
    '行 / 日',
    'lines / day',
    9.0e8,
    'ACT 1 × ACT 2 × ACT 3 = 世界の開発者3,000万人 × 1日平均稼働率0.65 × 1人45行/日 ≈ 8.8 × 10^8 行/日',
    'ACT 1 × ACT 2 × ACT 3 = 30M developers × 0.65 active-day factor × 45 lines/day ≈ 8.8 × 10^8 lines/day',
    '世界のプロ・準プロ開発者約3,000万人のうち平日・休日平均で約65%が稼働し、設計・レビューを除き1日平均45行の本番コードを追加すると約9億行/日になります。',
    'With ~30M developers globally, ~65% active on an average calendar day, and ~45 net hand-written lines per active developer, daily commits total ~9.0 × 10^8 lines.',
    [
      slot(1, '世界全体のソフトウェア開発者人口', 'Software developers worldwide', [
        card(5, 1, 1, '世界のプロ・実務開発者数', 'Global professional developers', '3,000万人', '30M devs', 3.0e7),
        card(5, 1, 2, '世界の事務PC利用者全体', 'All office PC users globally', '10億人', '1.0B users', 1.0e9, {
          ja: '表計算などを使う一般PC利用者全体（約10億人）をソフトウェア開発者数と混同しています。',
          en: 'Confuses general office computer users (1B) with software developers (~30M).',
        }),
        card(5, 1, 3, '日本国内のみの開発者数', 'Developers in Japan only', '150万人', '1.5M devs', 1.5e6),
      ]),
      slot(2, 'カレンダー1日あたりの平均稼働開発者比率', 'Share of developers coding on a given day', [
        card(5, 2, 1, '休日・会議日を除いた実稼働比率', 'Calendar-day active coding ratio', '0.65', '0.65', 0.65),
        card(5, 2, 2, '1人5プロジェクト同時100%稼働と誤算', '5x double-counted utilization (500%)', '5.0', '5.0', 5.0, {
          ja: '複数リポジトリへの関与を人数倍率5.0として掛け、稼働率100%超の二重計上になっています。',
          en: 'Multiplies headcount by 5 repos per person without splitting time (>100% utilization).',
        }),
        card(5, 2, 3, '月1回のみコミットする比率', 'Once-a-month hobbyist rate', '0.02', '0.02', 0.02),
      ]),
      slot(3, '稼働開発者1人あたりの1日平均手書き追加行数', 'Net hand-written lines per active dev/day', [
        card(5, 3, 1, '設計・テスト込みの実測平均行数', 'Typical net hand-written LOC/day', '45行 / 日', '45 lines/day', 45),
        card(5, 3, 2, '自動生成lockファイル込みの見かけ行数', 'Auto-generated lockfile dump', '2,500行 / 日', '2,500 lines/day', 2500, {
          ja: '依存パッケージの自動生成ロックファイル等の機械出力行数を手書き行数と混同しています。',
          en: 'Includes machine-generated lockfiles/vendor dumps instead of human-written code.',
        }),
        card(5, 3, 3, '設定1箇所変更のみ', 'Minimal config tweak', '4行 / 日', '4 lines/day', 4),
      ]),
    ],
  ),

  fermiStage(
    6,
    'intermediate',
    'STAGE 6：DAU 100万人のECサイトにおけるピーク時間帯のAPI秒間リクエスト数（RPS）は？',
    'Stage 6: What is the peak-hour API requests-per-second (RPS) for an e-commerce site with 1M DAU?',
    'req / 秒 (RPS)',
    'req / sec (RPS)',
    3.5e4,
    'ACT 1 × ACT 2 × ACT 3 = DAU 100万人 × 瞬間同時アクティブ率0.007 × 1人秒間5 API call ≈ 3.5 × 10^4 RPS',
    'ACT 1 × ACT 2 × ACT 3 = 1.0M DAU × 0.007 concurrent active share × 5 req/sec/user ≈ 3.5 × 10^4 RPS',
    'DAU 100万人がピーク1時間に約15%集中し平均3分滞在すると瞬間同時アクティブは約0.7%（7,000人）。画面遷移・検索・在庫照会で1アクティブユーザー平均5 req/sを発生させると約3.5万RPSとなります。',
    'If 15% of 1M DAU visit during the peak hour for ~3 minutes each, ~0.7% (7,000 users) are active concurrently; at ~5 API calls/s per active user, peak load is ~35,000 RPS.',
    [
      slot(1, '1日のユニークアクティブユーザー数（DAU）', 'Daily Active Users (DAU)', [
        card(6, 1, 1, 'お題指定の DAU 100万人', 'Specified 1.0M DAU', '100万人', '1.0M users', 1.0e6),
        card(6, 1, 2, '30日間の延べMAU合計人数', '30-day cumulative user-days', '3,000万人', '30M user-days', 3.0e7, {
          ja: '1日あたりのDAU（100万人）に30日分を掛けた延べ人数を使っており30倍の二重計上です。',
          en: 'Multiplies 1M DAU by 30 days into cumulative user-days (30x overcount).',
        }),
        card(6, 1, 3, '有料会員一部セグメントのみ', 'VIP segment only', '5万人', '50K users', 5.0e4),
      ]),
      slot(2, 'ピーク瞬間に同時操作中のユーザー比率', 'Peak instantaneous active user fraction', [
        card(6, 2, 1, 'ピーク集中×滞在時間から算出した同時率', 'Peak hour × session duration share', '0.007（0.7%）', '0.007 (0.7%)', 0.007),
        card(6, 2, 2, 'ピーク1時間の来訪率そのもの（滞在補正なし）', 'Hourly share without session length', '0.25（25%）', '0.25 (25%)', 0.25, {
          ja: '1時間全体の来訪率（25%）を「その1秒間ずっと全員が同時操作している率」と取り違えています。',
          en: 'Treats 1-hour arrival share (25%) as 1-second simultaneous active concurrency.',
        }),
        card(6, 2, 3, '早朝閑散時の同時率', '4 AM off-peak concurrency', '0.0002', '0.0002', 0.0002),
      ]),
      slot(3, '同時操作中1ユーザーあたりの秒間APIリクエスト数', 'API requests per second per active user', [
        card(6, 3, 1, '検索・在庫・推薦の非同期API合算', 'BFF/search/stock calls per active sec', '5 req / 秒', '5 req/s', 5),
        card(6, 3, 2, '1セッション全体の累積API通信回数', 'Total API calls across entire session', '200 req / 秒', '200 req/s', 200, {
          ja: '数分間の1セッション全体で発火する総API回数を「毎秒発火するRPS」と単位混同しています。',
          en: 'Confuses total calls over an entire multi-minute session (200) with per-second RPS.',
        }),
        card(6, 3, 3, '静的HTML1枚のみ取得', 'Static page fetch only', '0.3 req / 秒', '0.3 req/s', 0.3),
      ]),
    ],
  ),

  fermiStage(
    7,
    'advanced',
    'STAGE 7：平日朝ラッシュ最混雑時のJR山手線・全走行列車内の同時乗車人数合計（人）は？',
    'Stage 7: How many passengers are riding simultaneously aboard all running Yamanote Line trains at morning peak?',
    '人（同時乗車）',
    'passengers',
    2.2e5,
    'ACT 1 × ACT 2 × ACT 3 = 同時走行約45編成 × 11両/編成 × ラッシュ平均440人/両 ≈ 2.18 × 10^5 人',
    'ACT 1 × ACT 2 × ACT 3 = 45 running trains × 11 cars/train × 440 riders/car ≈ 2.18 × 10^5 passengers',
    '一周約60分の山手線（内回り・外回り）では朝ラッシュ時に約2分半間隔で計45編成前後が同時走行しており、11両編成×1両あたり約440人（混雑率約180%平均）で約22万人が同時に車内にいます。',
    'Around the 60-minute Yamanote loop (inner + outer), ~45 trains of 11 cars run simultaneously at peak headways; at ~440 riders per car, ~220K passengers are onboard at once.',
    [
      slot(1, '朝ラッシュ時に路線上で同時走行している編成数', 'Trains running simultaneously on the loop', [
        card(7, 1, 1, '内外回り合計の同時走行編成数', 'Inner + outer loop simultaneous trains', '45編成', '45 trains', 45),
        card(7, 1, 2, '始発から終電までの1日延べ運行本数', 'Full-day cumulative train runs', '600編成', '600 runs', 600, {
          ja: '1日全体の延べ運行本数（約600本）と、ある瞬間に線路上にいる同時編成数を混同しています。',
          en: 'Confuses full-day cumulative dispatches (~600) with simultaneous trains on track (~45).',
        }),
        card(7, 1, 3, '深夜間引き運転時の編成数', 'Late-night sparse trains', '8編成', '8 trains', 8),
        card(7, 1, 4, '日中平常ダイヤの同時編成数', 'Midday simultaneous trains', '35編成', '35 trains', 35),
      ]),
      slot(2, '1編成あたりの連結車両数', 'Cars per train set', [
        card(7, 2, 1, '山手線の標準編成両数', 'Standard Yamanote train length', '11両 / 編成', '11 cars', 11),
        card(7, 2, 2, '山手線の駅数（30駅）と混同', 'Station count on loop (30 stations)', '30両 / 編成', '30 cars', 30, {
          ja: '山手線の駅数（30駅）を1編成あたりの車両数（11両）と取り違えています。',
          en: 'Confuses the 30 stations on the Yamanote loop with cars per train (11).',
        }),
        card(7, 2, 3, '地方ローカル線の編成両数', 'Rural 2-car train', '2両 / 編成', '2 cars', 2),
      ]),
      slot(3, 'ラッシュ時1両あたりの平均乗車人数', 'Average passengers per car at peak', [
        card(7, 3, 1, '定員約150人の約2.5〜3倍（混雑区間平均）', 'Peak crowded car (~440 riders)', '440人 / 両', '440 / car', 440),
        card(7, 3, 2, '1編成全体の人数を1両あたりに二重計上', 'Whole-train total applied per car', '5,000人 / 両', '5,000 / car', 5000, {
          ja: '11両編成全体の乗客数（約5,000人）をさらに1両あたりに掛けて二重計上しています。',
          en: 'Applies full 11-car train capacity (~5,000) to each individual car (11x double count).',
        }),
        card(7, 3, 3, '座席が埋まる程度の閑散乗車数', 'Seated-only off-peak load', '40人 / 両', '40 / car', 40),
      ]),
    ],
  ),

  fermiStage(
    8,
    'advanced',
    'STAGE 8：日本国内のクラウド・Webサーバー群が1日に出力する非圧縮JSONアクセスログ総量（GB / 日）は？',
    'Stage 8: What is the daily volume of uncompressed JSON access logs emitted by cloud/web servers in Japan (GB/day)?',
    'GB / 日',
    'GB / day',
    1.6e7,
    'ACT 1 × ACT 2 × ACT 3 = 稼働インスタンス200万台 × 平均80万req/台・日 × 1行10^-5 GB(10KB) ≈ 1.6 × 10^7 GB/日',
    'ACT 1 × ACT 2 × ACT 3 = 2.0M instances × 8.0×10^5 req/day × 1.0×10^-5 GB/log ≈ 1.6 × 10^7 GB/day',
    '国内向けの稼働Web/API仮想インスタンス約200万台が1台平均約9〜10 RPS（約80万req/日）を処理し、トレースヘッダ付き非圧縮JSONログ1件を約10KB（10^-5 GB）とすると約1,600万GB/日（16PB/日）になります。',
    'Across ~2M active web/API instances in Japan averaging ~800K requests/day (~9 RPS) at ~10 KB (10^-5 GB) per rich uncompressed JSON log entry, daily output is ~1.6 × 10^7 GB (16 PB).',
    [
      slot(1, '日本国内向けの稼働Web/APIインスタンス数', 'Active web/API server instances in Japan', [
        card(8, 1, 1, '国内クラウド・DCの稼働Web/API台数', 'Active Japan web/API instances', '200万台', '2.0M instances', 2.0e6),
        card(8, 1, 2, '世界中の全サーバー総台数', 'All servers worldwide', '8,000万台', '80M instances', 8.0e7, {
          ja: '日本国内のスコープに対し、北米・欧州・中国を含む世界全体のサーバー台数を使っています。',
          en: 'Uses global server fleet (~80M) instead of Japan-serving instances (~2M).',
        }),
        card(8, 1, 3, '大企業1グループのみの台数', 'Single enterprise fleet only', '10万台', '100K instances', 1.0e5),
      ]),
      slot(2, '1インスタンスあたりの1日平均処理リクエスト数', 'Daily requests per instance', [
        card(8, 2, 1, '日平均約9 RPS × 86,400秒', 'Daily avg ~9 RPS × 86,400 s', '80万 req / 日', '800K req/day', 8.0e5),
        card(8, 2, 2, '瞬間スパイク1,000 RPSが24時間全サーバー継続', 'Peak 1,000 RPS sustained 24h on all', '8,000万 req / 日', '80M req/day', 8.0e7, {
          ja: '一部サーバーの瞬間最大RPSが全サーバーで24時間途切れず続くと仮定した過大計上です。',
          en: 'Assumes burst peak ~1,000 RPS runs 24/7 across every single instance.',
        }),
        card(8, 2, 3, '社内管理ツール程度の低頻度通信', 'Low-traffic internal admin app', '2万 req / 日', '20K req/day', 2.0e4),
      ]),
      slot(3, '非圧縮JSONアクセスログ1件あたりのサイズ（GB換算）', 'Uncompressed JSON log size in GB', [
        card(8, 3, 1, '構造化JSON 1件 約10 KB = 10^-5 GB', '~10 KB structured JSON (10^-5 GB)', '1.0 × 10^-5 GB', '1.0e-5 GB', 1.0e-5),
        card(8, 3, 2, '10 KB を 10 MB（10^-2 GB）と1,000倍換算誤り', '10 KB misconverted as 10 MB (10^-2 GB)', '1.0 × 10^-2 GB', '1.0e-2 GB', 1.0e-2, {
          ja: 'KB から GB への換算（10^-6）を MB 換算（10^-3）と取り違え、1件10MBと1,000倍過大にしています。',
          en: 'Misconverts KB to GB by 1,000x (treats a 10 KB log line as 10 MB = 0.01 GB).',
        }),
        card(8, 3, 3, '圧縮済み最小バイナリレコード', 'Gzipped minimal binary record', '5.0 × 10^-7 GB', '5.0e-7 GB', 5.0e-7),
      ]),
    ],
  ),

  fermiStage(
    9,
    'advanced',
    'STAGE 9：東海道新幹線（東京〜新大阪）の1日あたり総輸送乗客数（人 / 日）は？',
    'Stage 9: What is the average daily passenger ridership on the Tokaido Shinkansen (passengers/day)?',
    '人 / 日',
    'passengers / day',
    4.0e5,
    'ACT 1 × ACT 2 × ACT 3 = 1日約360本 × 16両定員1,320席 × 平均席利用換算0.85 ≈ 4.04 × 10^5 人/日',
    'ACT 1 × ACT 2 × ACT 3 = 360 daily trains × 1,320 seats/train × 0.85 load/turnover factor ≈ 4.04 × 10^5 /day',
    '東海道新幹線は上下合計で1日約360〜370本が運行され、16両編成の定員は1,323席。途中駅での乗降入れ替わりを含めた平均乗車換算係数約0.85を掛けると1日約40万〜45万人になります。',
    'The Tokaido Shinkansen runs ~360–370 trains/day across both directions; each 16-car set seats ~1,320 passengers, and a ~0.85 load/turnover factor yields ~400K–450K riders/day.',
    [
      slot(1, '東海道新幹線の1日あたり運行本数（上下合計）', 'Daily trains operated (both directions)', [
        card(9, 1, 1, 'のぞみ・ひかり・こだま1日運行本数', 'Daily Tokaido schedule (both ways)', '360本 / 日', '360 / day', 360),
        card(9, 1, 2, '山陽・九州の別系統まで重複加算した本数', 'Double-counted across Sanyo/Kyushu legs', '800本 / 日', '800 / day', 800, {
          ja: '直通先の山陽・九州新幹線の列車番号別カウントまで足し合わせた二重計上になっています。',
          en: 'Double-counts through-service legs on Sanyo/Kyushu lines on top of Tokaido runs.',
        }),
        card(9, 1, 3, '1時間あたりの運行本数のみ', 'Single-hour train frequency only', '40本 / 日', '40 / day', 40),
        card(9, 1, 4, '閑散期ダイヤの運行本数', 'Off-season schedule', '280本 / 日', '280 / day', 280),
      ]),
      slot(2, '16両編成1本あたりの座席定員数', 'Seat capacity per 16-car train', [
        card(9, 2, 1, '16両編成の標準座席数（約1,323席）', 'Standard 16-car seating (~1,323)', '1,320席', '1,320 seats', 1320),
        card(9, 2, 2, '座席定員の1桁（10倍）取り違え', '10x decimal error on train capacity', '13,200席', '13,200 seats', 13200, {
          ja: '1編成1,320席を13,200席（1両800人以上）と1桁（10倍）取り違えています。',
          en: 'Off by 10x on 16-car seating capacity (13,200 instead of 1,320 seats).',
        }),
        card(9, 2, 3, '1〜2両分のみの座席数', 'Single-car capacity only', '150席', '150 seats', 150),
      ]),
      slot(3, '定員に対する平均乗車率・区間入れ替わり換算係数', 'Load & turnover factor per train', [
        card(9, 3, 1, '平均乗車率＋途中駅乗降換算（0.85）', 'Load + station turnover factor (0.85)', '0.85', '0.85', 0.85),
        card(9, 3, 2, '85%を小数0.85に直さず85倍する誤算', '85% multiplied as raw 85 instead of 0.85', '85', '85', 85, {
          ja: 'パーセント表記の「85%」を100で割らずにそのまま85倍しており、桁が2桁（100倍）ずれています。',
          en: 'Multiplies by raw percentage 85 instead of decimal 0.85 (100x scaling error).',
        }),
        card(9, 3, 3, '早朝始発のみの低乗車率', 'First-train sparse occupancy (10%)', '0.1', '0.1', 0.1),
      ]),
    ],
  ),
];

export function getFermiStage(stageId: number): FermiStageDefinition {
  const found = FERMI_STAGES.find((s) => s.stageId === stageId);
  return found ?? FERMI_STAGES[0]!;
}
