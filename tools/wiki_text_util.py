import re

PASSIVE_SKILL_FRONT_MARKER = '<style="パッシブ領域">'

PASSIVE_SKILL_PATTERN = re.compile(PASSIVE_SKILL_FRONT_MARKER + r'(.*?)</style>', re.DOTALL)
ENHANCEMENT_PATTERN = re.compile(r'<style="スキル強化">(.*?)</style>', re.DOTALL)
AUTO_ACTION_MARKER = '<style="オート行動"></style>'

def sanitizeSkillDescription(s: str) -> str:
    s = s.replace(r'<style="改行"></style>', '<br>')
    s = PASSIVE_SKILL_PATTERN.sub(r'<wiki-passive>\1</wiki-passive>', s)
    s = ENHANCEMENT_PATTERN.sub(r'<wiki-enhance>\1</wiki-enhance>', s)
    if AUTO_ACTION_MARKER in s:
        s = s.replace(AUTO_ACTION_MARKER, '<wiki-auto-action>') + '</wiki-auto-action>'

    # LW cannot be trusted to close their tag
    if PASSIVE_SKILL_FRONT_MARKER in s:
        s = s.replace(PASSIVE_SKILL_FRONT_MARKER, '<wiki-passive>') + '</wiki-passive>'
    s = s.replace('<style="改行">', '')
    s = s.replace('</style>', '')

    return s
