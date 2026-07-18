// Client-side translations for skill-search filter category/label/sublabel
// display strings. Mirrors the Python dicts formerly in
// tools/generate_skill_search_index.py. The index always emits English; this
// module applies the user's chosen language at load time.

import type { Category } from '../types'
import type { Lang } from './lang'

const CATEGORY_LABEL_TRANSLATIONS: Record<string, Partial<Record<Lang, string>>> = {
  'attack': { 'zh-Hans': '攻击', 'zh-Hant': '攻擊', ja: '攻撃' },
  'attack.single': { 'zh-Hans': '单体攻击', 'zh-Hant': '單體攻擊', ja: '単体攻撃' },
  'attack.all': { 'zh-Hans': '全体攻击', 'zh-Hant': '全體攻擊', ja: '全体攻撃' },
  'attack.special': { 'zh-Hans': '特殊范围攻击', 'zh-Hant': '特殊範圍攻擊', ja: '特殊範囲攻撃' },
  'attack.multi': { 'zh-Hans': '多重攻击', 'zh-Hant': '多重攻擊', ja: '連続攻撃' },
  'attack.counter': { 'zh-Hans': '反击', 'zh-Hant': '反擊', ja: '反撃' },
  'attack.ally': { 'zh-Hans': '攻击我方', 'zh-Hant': '攻擊我方', ja: '味方への攻撃' },
  'attack.penetrate': { 'zh-Hans': '贯穿伤害', 'zh-Hant': '貫穿傷害', ja: '貫通ダメージ' },

  'damage': { 'zh-Hans': '伤害', 'zh-Hant': '傷害', ja: 'ダメージ' },
  'damage.up': { 'zh-Hans': '提高伤害', 'zh-Hant': '提高傷害', ja: 'ダメージ上昇' },
  'damage.down': { 'zh-Hans': '降低伤害', 'zh-Hant': '降低傷害', ja: 'ダメージ低下' },
  'damage.scaling': { 'zh-Hans': '伤害加成来源', 'zh-Hant': '傷害加成來源', ja: 'ダメージ倍率参照' },
  'damage.dot': { 'zh-Hans': '持续伤害', 'zh-Hant': '持續傷害', ja: '継続ダメージ' },

  'spd': { 'zh-Hans': '速度', 'zh-Hant': '速度', ja: 'SPD' },
  'spd.up': { 'zh-Hans': '提高速度', 'zh-Hant': '提高速度', ja: 'SPD上昇' },
  'spd.down': { 'zh-Hans': '降低速度', 'zh-Hant': '降低速度', ja: 'SPD低下' },
  'spd.other': { 'zh-Hans': '其他速度技能', 'zh-Hant': '其他速度技能', ja: 'その他のSPDスキル' },

  'heal': { 'zh-Hans': '治疗', 'zh-Hant': '治療', ja: '回復' },
  'heal.heal': { 'zh-Hans': '治疗', 'zh-Hant': '治療', ja: '回復' },
  'heal.regen': { 'zh-Hans': '持续治疗', 'zh-Hant': '持續治療', ja: 'リジェネ' },
  'heal.change': { 'zh-Hans': '改变治疗量', 'zh-Hant': '改變治療量', ja: '回復量変化' },

  'combo': { 'zh-Hans': '连击', 'zh-Hant': '連擊', ja: 'コンボ' },
  'combo.up': { 'zh-Hans': '提高连击', 'zh-Hant': '提高連擊', ja: 'コンボ上昇' },

  'vp': { 'zh-Hans': 'VP / View', 'zh-Hant': 'VP / View', ja: 'VP / View' },
  'vp.gain': { 'zh-Hans': 'VP获得', 'zh-Hant': 'VP獲得', ja: 'VP獲得' },
  'vp.consume': { 'zh-Hans': 'VP消耗', 'zh-Hant': 'VP消耗', ja: 'VP消費' },
  'vp.statup': { 'zh-Hans': 'VP能力提升', 'zh-Hant': 'VP能力提升', ja: 'VPステータス上昇' },
  'vp.statdown': { 'zh-Hans': 'VP能力下降', 'zh-Hant': 'VP能力下降', ja: 'VPステータス低下' },
  'vp.costup': { 'zh-Hans': '消耗View增加', 'zh-Hant': '消耗View增加', ja: 'View消費量アップ' },
  'vp.costdown': { 'zh-Hans': '消耗View减少', 'zh-Hant': '消耗View減少', ja: 'View消費量ダウン' },

  'defense': { 'zh-Hans': '防御 / 生存', 'zh-Hant': '防禦 / 生存', ja: '防御 / 生存' },
  'defense.up': { 'zh-Hans': '提高防御', 'zh-Hant': '提高防禦', ja: 'DEF上昇' },
  'defense.down': { 'zh-Hans': '降低防御', 'zh-Hant': '降低防禦', ja: 'DEF低下' },
  'defense.barrier': { 'zh-Hans': '护盾', 'zh-Hant': '護盾', ja: 'バリア' },
  'defense.provoke': { 'zh-Hans': '挑衅', 'zh-Hant': '挑釁', ja: '挑発' },
  'defense.aggregation': { 'zh-Hans': '伤害集中', 'zh-Hant': '傷害集中', ja: 'ダメージ集中' },
  'defense.target': { 'zh-Hans': '攻击目标锁定', 'zh-Hant': '攻擊目標鎖定', ja: '狙われ率変化' },
  'defense.stealth': { 'zh-Hans': '隐身', 'zh-Hant': '隱身', ja: 'ステルス' },
  'defense.hp': { 'zh-Hans': '提高最大HP', 'zh-Hant': '提高最大HP', ja: '最大HPアップ' },
  'defense.dodge': { 'zh-Hans': '闪避', 'zh-Hant': '閃避', ja: '回避' },

  'interf': { 'zh-Hans': '状态控制', 'zh-Hant': '狀態控制', ja: '状態異常操作' },
  'interf.debuff_remove': { 'zh-Hans': '解除减益', 'zh-Hant': '解除減益', ja: 'デバフ解除' },
  'interf.buff_remove': { 'zh-Hans': '解除增益', 'zh-Hant': '解除增益', ja: 'バフ解除' },
  'interf.debuff_resist': { 'zh-Hans': '减益抗性', 'zh-Hant': '減益抗性', ja: 'デバフ耐性' },
  'interf.extend': { 'zh-Hans': '增益/减益延长', 'zh-Hant': '增益/減益延長', ja: 'バフ・デバフ延長' },
  'field.field': { 'zh-Hans': '场地效果', 'zh-Hant': '場地效果', ja: 'フィールド効果' },

  'skillctl': { 'zh-Hans': '技能控制', 'zh-Hant': '技能控制', ja: 'スキル操作' },
  'skillctl.change': { 'zh-Hans': '技能变更', 'zh-Hant': '技能變更', ja: 'スキル変化' },
  'skillctl.extra_action': { 'zh-Hans': '追加行动', 'zh-Hant': '追加行動', ja: '追加行動' },
  'skillctl.extra_activation': { 'zh-Hans': '追加发动', 'zh-Hant': '追加發動', ja: '追加発動' },
  'skillctl.auto': { 'zh-Hans': '自动行动控制', 'zh-Hant': '自動行動控制', ja: 'オート行動操作' },
  'skillctl.ratechange': { 'zh-Hans': '技能几率变化', 'zh-Hant': '技能機率變化', ja: 'スキル確率変化' },
  'interf.silence': { 'zh-Hans': '技能封印', 'zh-Hant': '技能封印', ja: 'スキル封印' },

  'acq': { 'zh-Hans': '获取增加', 'zh-Hant': '獲取增加', ja: '獲得量アップ' },
  'acq.coin': { 'zh-Hans': '金币加成', 'zh-Hant': '金幣加成', ja: 'コイン増加' },
  'acq.exp': { 'zh-Hans': '经验值加成', 'zh-Hant': '經驗值加成', ja: '経験値増加' },
  'acq.relation': { 'zh-Hans': '好感度加成', 'zh-Hant': '好感度加成', ja: '親密度増加' },
}

const SUBLABEL_TRANSLATIONS: Record<string, Partial<Record<Lang, string>>> = {
  'self': { 'zh-Hans': '自身', 'zh-Hant': '自身', ja: '自分' },
  'enemy-single': { 'zh-Hans': '单个敌人', 'zh-Hant': '單個敵人', ja: '敵単体' },
  'enemy-adjacent': { 'zh-Hans': '相邻敌人', 'zh-Hant': '相鄰敵人', ja: '隣接する敵' },
  'enemy-all': { 'zh-Hans': '全体敌人', 'zh-Hant': '全體敵人', ja: '敵全体' },
  'enemy-other': { 'zh-Hans': '其他敌方范围', 'zh-Hant': '其他敵方範圍', ja: 'その他の敵範囲' },
  'ally-single': { 'zh-Hans': '单个我方', 'zh-Hant': '單個我方', ja: '味方単体' },
  'ally-adjacent': { 'zh-Hans': '相邻我方', 'zh-Hant': '相鄰我方', ja: '隣接する味方' },
  'ally-all': { 'zh-Hans': '全体我方', 'zh-Hant': '全體我方', ja: '味方全体' },
  'ally-other': { 'zh-Hans': '其他我方范围', 'zh-Hant': '其他我方範圍', ja: 'その他の味方範囲' },

  'hp': { 'zh-Hans': 'HP', 'zh-Hant': 'HP', ja: 'HP' },
  'combo': { 'zh-Hans': '连击', 'zh-Hant': '連擊', ja: 'コンボ' },
  'view': { 'zh-Hans': 'View', 'zh-Hant': 'View', ja: 'View' },
  'spd': { 'zh-Hans': '速度', 'zh-Hant': '速度', ja: 'SPD' },
  'status-count': { 'zh-Hans': '状态数量', 'zh-Hant': '狀態數量', ja: '状態の数' },
  'status-turns': { 'zh-Hans': '状态回合数', 'zh-Hant': '狀態回合數', ja: '状態のターン数' },
  'other': { 'zh-Hans': '其他', 'zh-Hant': '其他', ja: 'その他' },
}

export function localizeCategories(categories: Category[], lang: Lang): Category[] {
  if (lang === 'en') return categories
  return categories.map(cat => ({
    ...cat,
    label: CATEGORY_LABEL_TRANSLATIONS[cat.key]?.[lang] ?? cat.label,
    labels: cat.labels.map(lab => ({
      ...lab,
      label: CATEGORY_LABEL_TRANSLATIONS[lab.key]?.[lang] ?? lab.label,
      sublabels: lab.sublabels?.map(sl => {
        const suffix = sl.key.split('/', 2)[1]
        return { ...sl, label: SUBLABEL_TRANSLATIONS[suffix]?.[lang] ?? sl.label }
      }),
    })),
  }))
}
