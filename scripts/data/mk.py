"""Tiny helper used to write a state data file from a Python dict (keeps JSON formatting identical)."""
import json, os, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
def write(d):
    p = os.path.join(ROOT, 'src/data/states', d['abbr'].lower() + '.json')
    json.dump(d, open(p, 'w'), indent=1, ensure_ascii=False)
    print('wrote', p)
def src(name, url, quote, accessed='2026-10-11'):
    return {'name': name, 'url': url, 'accessed': accessed, 'quote': quote}
