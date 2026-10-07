import json, math, sys
d = json.load(open(sys.argv[1]))
k = math.cos(math.radians(15))
pts = [(x, y) for f in d['features'] for poly in (f['geometry']['coordinates'] if f['geometry']['type'] == 'MultiPolygon' else [f['geometry']['coordinates']]) for ring in poly for x, y in ring]
x0 = min(p[0] for p in pts); x1 = max(p[0] for p in pts); y0 = min(p[1] for p in pts); y1 = max(p[1] for p in pts)
W = 100.0; s = W / ((x1 - x0) * k); H = (y1 - y0) * s
px = lambda x, y: (round((x - x0) * k * s, 1), round((y1 - y) * s, 1))
def area_c(ring):
    a = cx = cy = 0
    for (xa, ya), (xb, yb) in zip(ring, ring[1:] + ring[:1]):
        t = xa * yb - xb * ya; a += t; cx += (xa + xb) * t; cy += (ya + yb) * t
    a /= 2
    return abs(a), (cx / (6 * a), cy / (6 * a)) if a else (0, 0)
out = {}
for f in d['features']:
    g = f['geometry']; polys = g['coordinates'] if g['type'] == 'MultiPolygon' else [g['coordinates']]
    path = ''; best = (0, None)
    for poly in polys:
        for i, ring in enumerate(poly):
            r = [px(x, y) for x, y in ring]
            limpo = [r[0]] + [p for a, p in zip(r, r[1:]) if p != a]
            if limpo[-1] == limpo[0]: limpo.pop()
            if len(limpo) < 3: continue
            if i == 0:
                a, c = area_c(limpo)
                if a > best[0]: best = (a, c)
            fmt = lambda v: ('%g' % v)
            seg = 'M' + fmt(limpo[0][0]) + ' ' + fmt(limpo[0][1])
            for (xa, ya), (xb, yb) in zip(limpo, limpo[1:]):
                seg += 'l' + fmt(round(xb - xa, 1)) + ' ' + fmt(round(yb - ya, 1))
            path += seg + 'z'
    out[f['properties']['sigla']] = {'d': path, 'c': [round(best[1][0], 1), round(best[1][1], 1)]}
json.dump({'w': 100, 'h': round(H, 1), 'ufs': out}, open(sys.argv[2], 'w'), separators=(',', ':'))
print('H', round(H, 1), 'bytes', sum(len(v['d']) for v in out.values()))
print({u: v['c'] for u, v in out.items()})
