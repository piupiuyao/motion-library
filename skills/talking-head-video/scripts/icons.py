"""Find the icon for a spoken word: brand logo if it's a brand, else a plain line icon. None if nothing fits
(then the effect leaves that item out — say it → show it, don't say it → nothing)."""
import functools, json, os, re

ICONS = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', 'library', 'icons', 'icons.json')


@functools.lru_cache(1)
def _db():
    db = json.load(open(ICONS))
    by = {}
    for k, v in db.items():
        for w in v['keys']:
            by.setdefault((v['kind'], w), k)
    tag = {}
    for k, v in db.items():
        if v['kind'] == 'ui':
            for w in v.get('tags', []):
                tag.setdefault(w, []).append(k)
    return db, by, tag


def _forms(q):
    q = re.sub(r'[^a-z0-9]+', ' ', q.lower()).strip()
    out = [q]
    for suf, rep in (("'s", ''), ('ies', 'y'), ('es', ''), ('s', '')):
        if q.endswith(suf) and len(q) > len(suf) + 2:
            out.append(q[:-len(suf)] + rep)
    return out


# Common talking-head words whose best icon isn't the first tag hit (checked by eye). Word → icon id.
CONCEPTS = {
    'money': 'ui:banknote', 'cash': 'ui:banknote', 'dollar': 'ui:dollar-sign', 'price': 'ui:tag', 'cost': 'ui:tag',
    'salary': 'ui:wallet', 'income': 'ui:hand-coins', 'save': 'ui:piggy-bank', 'saving': 'ui:piggy-bank',
    'invest': 'ui:trending-up', 'investing': 'ui:trending-up', 'growth': 'ui:trending-up', 'profit': 'ui:trending-up',
    'loss': 'ui:trending-down', 'debt': 'ui:credit-card', 'card': 'ui:credit-card', 'bank': 'ui:landmark',
    'gym': 'ui:dumbbell', 'workout': 'ui:dumbbell', 'exercise': 'ui:dumbbell', 'run': 'ui:footprints', 'running': 'ui:footprints',
    'sleep': 'ui:moon', 'food': 'ui:utensils', 'diet': 'ui:salad', 'water': 'ui:glass-water', 'health': 'ui:heart-pulse',
    'time': 'ui:clock', 'hour': 'ui:clock', 'minute': 'ui:timer', 'day': 'ui:sun', 'week': 'ui:calendar', 'deadline': 'ui:alarm-clock',
    'email': 'ui:mail', 'mail': 'ui:mail', 'inbox': 'ui:inbox', 'message': 'ui:message-circle', 'text': 'ui:message-square',
    'chat': 'ui:messages-square', 'call': 'ui:phone', 'phone': 'ui:smartphone', 'notification': 'ui:bell',
    'meeting': 'ui:users', 'team': 'ui:users', 'people': 'ui:users', 'friend': 'ui:user-round', 'client': 'ui:handshake',
    'customer': 'ui:handshake', 'boss': 'ui:briefcase', 'job': 'ui:briefcase', 'work': 'ui:briefcase', 'office': 'ui:building-2',
    'home': 'ui:house', 'house': 'ui:house', 'car': 'ui:car', 'travel': 'ui:plane', 'flight': 'ui:plane',
    'idea': 'ui:lightbulb', 'goal': 'ui:target', 'focus': 'ui:target', 'plan': 'ui:list-checks', 'list': 'ui:list-checks',
    'book': 'ui:book-open', 'read': 'ui:book-open', 'learn': 'ui:graduation-cap', 'school': 'ui:school', 'study': 'ui:graduation-cap',
    'video': 'ui:video', 'camera': 'ui:camera', 'photo': 'ui:image', 'music': 'ui:music', 'computer': 'ui:laptop', 'laptop': 'ui:laptop',
    'ai': 'ui:sparkles', 'robot': 'ui:bot', 'code': 'ui:code', 'data': 'ui:chart-column', 'chart': 'ui:chart-column',
    'stress': 'ui:frown', 'happy': 'ui:smile', 'love': 'ui:heart', 'like': 'ui:thumbs-up', 'follower': 'ui:user-plus',
    'subscriber': 'ui:user-plus', 'view': 'ui:eye', 'search': 'ui:search', 'shop': 'ui:shopping-bag', 'shopping': 'ui:shopping-cart',
    'gift': 'ui:gift', 'coffee': 'ui:coffee', 'warning': 'ui:triangle-alert', 'mistake': 'ui:circle-x', 'win': 'ui:trophy',
    'success': 'ui:trophy', 'secret': 'ui:lock', 'security': 'ui:shield-check', 'energy': 'ui:zap', 'fast': 'ui:zap', 'speed': 'ui:gauge',
    'chatgpt': 'logo:openai', 'gpt': 'logo:openai', 'twitter': 'logo:twitter', 'insta': 'logo:instagram',
}


def find(q):
    """q: a word/phrase ('Slack', 'gym', 'money'), or 'ui:wallet' / 'brand:telegram' / 'logo:slack' to force one."""
    db, by, tag = _db()
    if not q:
        return None
    if ':' in q and q.split(':')[0] in ('ui', 'brand', 'logo'):
        kind, w = q.split(':', 1)
        k = q if q in db else by.get((kind, _forms(w)[0]))
        return dict(db[k], id=k) if k in db else None
    for f in _forms(q):
        if f in CONCEPTS and CONCEPTS[f] in db:
            return dict(db[CONCEPTS[f]], id=CONCEPTS[f])
    for f in _forms(q):
        for kind in ('logo', 'brand', 'ui'):
            k = by.get((kind, f))
            if k:
                return dict(db[k], id=k)
    for f in _forms(q):
        hits = tag.get(f)
        if hits:
            k = min(hits, key=lambda k: (f not in db[k]['name'], len(db[k]['name'])))
            return dict(db[k], id=k)
    return None
