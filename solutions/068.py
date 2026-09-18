# 解題核心：用集合記錄看過的項目，只有第一次出現的項目才加入結果清單。
import sys

data = sys.stdin.read().split('\n')
n = int(data[0].strip())
items = data[1].split()[:n]
seen = set()
result = []
for item in items:
    if item not in seen:
        seen.add(item)
        result.append(item)
print(' '.join(result))
