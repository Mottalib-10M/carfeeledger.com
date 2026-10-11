#!/usr/bin/env python3
"""Rebuild the California jurisdiction list of src/data/states/ca.json.
Inputs (read on 2026-10-11, saved as text): CDTFA "California City & County Sales & Use Tax Rates
(effective October 1, 2026)" and DMV VIRPM Appendix 1A (county fees). Usage: ca-counties.py <cdtfa.txt> <appendix1a.txt>"""
import re, json, sys
cd = open(sys.argv[1]).read().split('\n'); ap = open(sys.argv[2]).read()
rows = []
for l in cd:
    m = re.match(r'\s*(.+?) \| ([\d.]+)% \| (.+?) \| (City|County) \|', l)
    if m: rows.append((m.group(1).strip(), float(m.group(2)), m.group(3).strip(), m.group(4)))
body = ap[ap.index('County Fees – Appendix 1A'):ap.index('City Fees— Appendix 1A')]
blocks = re.split(r'County Code (\d\d) \| County and Fee Information ', body)[1:]
fees = {}
for i in range(0, len(blocks), 2):
    b = blocks[i + 1]; name = re.match(r'([A-Za-z ]+?)\**\s*Use Tax', b).group(1).strip()
    lo = hi = 0
    for l in b.split('\n'):
        m = re.search(r'– \$(\d+)', l)
        if ('Auto Theft' in l or 'Fingerprint' in l or 'Air Quality' in l):
            mm = m or re.search(r'\$(\d+)', l)
            if mm: v = int(mm.group(1)); lo += v; hi += v
        elif 'Abandoned' in l and '***' not in l:
            hi += 1; s = re.search(r'Sunset \d+/\d+/(\d+)', l)
            if not s or int(s.group(1)) >= 2027: lo += 1
        elif 'SAFE' in l: lo += 1; hi += 1
        elif 'CTPF' in l: lo += 10; hi += 10
    fees[name] = [lo, hi]
slug = lambda s: re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')
out = []
BIG = ['Los Angeles','San Diego','San Jose','San Francisco','Fresno','Sacramento','Long Beach','Oakland','Bakersfield','Anaheim','Santa Ana','Riverside','Stockton','Irvine','Chula Vista','Fremont','San Bernardino','Modesto','Fontana','Oxnard']
for n, r, c, k in rows:
    if k == 'County':
        cname = c
        label = n.replace(' Unincorporated Area', ' (unincorporated area)')
        out.append({'id': slug(n), 'name': label, 'localRate': round(r / 100 - 0.0725, 6), 'countyFee': fees.get(cname, [0, 0])})
for n, r, c, k in rows:
    if k == 'City' and n in BIG:
        out.append({'id': 'city-' + slug(n), 'name': f'City of {n} ({c} County)', 'localRate': round(r / 100 - 0.0725, 6), 'countyFee': fees.get(c, [0, 0])})
print(json.dumps(out))
