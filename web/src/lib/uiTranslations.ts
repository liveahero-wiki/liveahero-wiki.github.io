import type { Lang } from './lang'

export type UIKey =
  | 'character' | 'type' | 'role' | 'status_type' | 'has_status' | 'view_cost'
  | 'hero' | 'sidekick'
  | 'attack' | 'defense' | 'assistance' | 'debuff' | 'speed' | 'vp_gain' | 'heal' | 'special'
  | 'buff'
  | 'enable_skill_tree' | 'include_mob' | 'show_debug_info' | 'reset_all'
  | 'skills_suffix' | 'char_placeholder' | 'view_min' | 'view_max'
  | 'all'
  | 'type_a_status' | 'remove'
  | 'col_character' | 'col_type' | 'col_skill' | 'col_view_cost'
  | 'kind_hero' | 'kind_sidekick'
  | 'slot_active1' | 'slot_active2' | 'slot_active3' | 'slot_passive'
  | 'slot_sk_active' | 'slot_sk_passive' | 'slot_sk_append'
  | 'kit_button' | 'kit_title' | 'mob_badge'
  | 'close' | 'hidden_badge' | 'hidden_title'
  | 'sub_filters_suffix'
  | 'loading' | 'load_error' | 'lang_title' | 'reload_title'

type Translations = Record<UIKey, { en: string } & Partial<Record<Lang, string>>>

const TRANSLATIONS: Translations = {
  character: { en: 'Character', 'zh-Hans': '角色', 'zh-Hant': '角色', ja: 'キャラ' },
  type: { en: 'Type', 'zh-Hans': '类型', 'zh-Hant': '類型', ja: 'タイプ' },
  role: { en: 'Role', 'zh-Hans': '角色定位', 'zh-Hant': '角色定位', ja: 'ロール' },
  status_type: { en: 'Status type', 'zh-Hans': '状态类型', 'zh-Hant': '狀態類型', ja: '状態種別' },
  has_status: { en: 'Has status', 'zh-Hans': '含有状态', 'zh-Hant': '含有狀態', ja: '状態を持つ' },
  view_cost: { en: 'View Cost', 'zh-Hans': 'View消耗', 'zh-Hant': 'View消耗', ja: 'View消費' },

  hero: { en: 'Hero', 'zh-Hans': '英雄', 'zh-Hant': '英雄', ja: 'ヒーロー' },
  sidekick: { en: 'Sidekick', 'zh-Hans': '助手', 'zh-Hant': '助手', ja: 'サイドキック' },
  attack: { en: 'Attack', 'zh-Hans': '攻击', 'zh-Hant': '攻擊', ja: '攻撃' },
  defense: { en: 'Defense', 'zh-Hans': '防御', 'zh-Hant': '防禦', ja: '防御' },
  assistance: { en: 'Assistance', 'zh-Hans': '辅助', 'zh-Hant': '輔助', ja: 'サポート' },
  debuff: { en: 'Debuff', 'zh-Hans': '减益', 'zh-Hant': '減益', ja: 'デバフ' },
  speed: { en: 'Speed', 'zh-Hans': '速度', 'zh-Hant': '速度', ja: 'SPD' },
  vp_gain: { en: 'VP Gain', 'zh-Hans': 'VP获取', 'zh-Hant': 'VP獲取', ja: 'VP獲得' },
  heal: { en: 'Heal', 'zh-Hans': '治疗', 'zh-Hant': '治療', ja: '回復' },
  special: { en: 'Special', 'zh-Hans': '特殊', 'zh-Hant': '特殊', ja: 'スペシャル' },
  buff: { en: 'Buff', 'zh-Hans': '增益', 'zh-Hant': '增益', ja: 'バフ' },

  enable_skill_tree: { en: 'Enable Hero Skill Tree', 'zh-Hans': '启用英雄技能树', 'zh-Hant': '啟用英雄技能樹', ja: 'ヒーロースキルツリーを有効化' },
  include_mob: { en: 'Include Mob', 'zh-Hans': '包含小兵', 'zh-Hant': '包含小兵', ja: 'Mobを含める' },
  show_debug_info: { en: 'Show Debug Info', 'zh-Hans': '显示调试信息', 'zh-Hant': '顯示調試信息', ja: 'デバッグ情報を表示' },
  reset_all: { en: 'Reset all', 'zh-Hans': '重置', 'zh-Hant': '重置', ja: 'リセット' },
  skills_suffix: { en: ' skills', 'zh-Hans': ' 个技能', 'zh-Hant': ' 個技能', ja: ' 件のスキル' },
  char_placeholder: { en: 'character name…', 'zh-Hans': '角色名…', 'zh-Hant': '角色名…', ja: 'キャラ名…' },
  view_min: { en: 'min', 'zh-Hans': '最小', 'zh-Hant': '最小', ja: '最小' },
  view_max: { en: 'max', 'zh-Hans': '最大', 'zh-Hant': '最大', ja: '最大' },

  all: { en: 'All', 'zh-Hans': '全部', 'zh-Hant': '全部', ja: '全て' },

  type_a_status: { en: 'Type a status…', 'zh-Hans': '输入状态名…', 'zh-Hant': '輸入狀態名…', ja: '状態名を入力…' },
  remove: { en: 'remove', 'zh-Hans': '删除', 'zh-Hant': '刪除', ja: '削除' },

  col_character: { en: 'Character', 'zh-Hans': '角色', 'zh-Hant': '角色', ja: 'キャラ' },
  col_type: { en: 'Type', 'zh-Hans': '类型', 'zh-Hant': '類型', ja: 'タイプ' },
  col_skill: { en: 'Skill', 'zh-Hans': '技能', 'zh-Hant': '技能', ja: 'スキル' },
  col_view_cost: { en: 'View Cost', 'zh-Hans': 'View消耗', 'zh-Hant': 'View消耗', ja: 'View消費' },

  kind_hero: { en: 'Hero', 'zh-Hans': '英雄', 'zh-Hant': '英雄', ja: 'ヒーロー' },
  kind_sidekick: { en: 'Sidekick', 'zh-Hans': '助手', 'zh-Hant': '助手', ja: 'サイドキック' },

  slot_active1: { en: 'Active 1', 'zh-Hans': '主动1', 'zh-Hant': '主動1', ja: 'アクティブ1' },
  slot_active2: { en: 'Active 2', 'zh-Hans': '主动2', 'zh-Hant': '主動2', ja: 'アクティブ2' },
  slot_active3: { en: 'Active 3', 'zh-Hans': '主动3', 'zh-Hant': '主動3', ja: 'アクティブ3' },
  slot_passive: { en: 'Passive', 'zh-Hans': '被动', 'zh-Hant': '被動', ja: 'パッシブ' },
  slot_sk_active: { en: 'SK Active', 'zh-Hans': 'SK主动', 'zh-Hant': 'SK主動', ja: 'SKアクティブ' },
  slot_sk_passive: { en: 'SK Passive', 'zh-Hans': 'SK被动', 'zh-Hant': 'SK被動', ja: 'SKパッシブ' },
  slot_sk_append: { en: 'SK Append', 'zh-Hans': 'SK附加', 'zh-Hant': 'SK附加', ja: 'SK追加' },

  kit_button: { en: 'Kit', 'zh-Hans': '技能组', 'zh-Hant': '技能組', ja: 'キット' },
  kit_title: { en: 'Show full skill kit', 'zh-Hans': '查看完整技能组', 'zh-Hant': '查看完整技能組', ja: 'スキルキットを表示' },
  mob_badge: { en: 'mob' },

  close: { en: 'Close', 'zh-Hans': '关闭', 'zh-Hant': '關閉', ja: '閉じる' },
  hidden_badge: { en: 'hidden', 'zh-Hans': '隐藏', 'zh-Hant': '隱藏', ja: '非表示' },
  hidden_title: { en: 'Not shown in-game', 'zh-Hans': '游戏内不显示', 'zh-Hant': '遊戲內不顯示', ja: 'ゲーム内に表示されない' },

  sub_filters_suffix: { en: ': sub-filters', 'zh-Hans': '：子筛选', 'zh-Hant': '：子篩選', ja: '：サブフィルター' },

  loading: { en: 'Loading skill index…', 'zh-Hans': '正在加载技能索引…', 'zh-Hant': '正在載入技能索引…', ja: 'スキルインデックスを読み込み中…' },
  load_error: { en: 'Failed to load index: ', 'zh-Hans': '加载索引失败：', 'zh-Hant': '載入索引失敗：', ja: 'インデックスの読み込みに失敗：' },
  lang_title: { en: 'Language', 'zh-Hans': '语言', 'zh-Hant': '語言', ja: '言語' },
  reload_title: { en: 'Force redownload skill index', 'zh-Hans': '强制重新下载技能索引', 'zh-Hant': '強制重新下載技能索引', ja: 'スキルインデックスを強制再ダウンロード' },
}

export function t(lang: Lang, key: UIKey): string {
  const entry = TRANSLATIONS[key]
  return entry[lang] ?? entry.en
}

const SLOT_KEY_MAP: Record<string, UIKey> = {
  active1: 'slot_active1',
  active2: 'slot_active2',
  active3: 'slot_active3',
  passive: 'slot_passive',
  sidekick_active: 'slot_sk_active',
  sidekick_passive: 'slot_sk_passive',
  sidekick_append: 'slot_sk_append',
}

export function slotLabel(lang: Lang, slot: string): string {
  const key = SLOT_KEY_MAP[slot]
  return key ? t(lang, key) : slot
}
