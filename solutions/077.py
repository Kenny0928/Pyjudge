# 解題核心：讀取兩個整數清單，走訪清單 a，若元素同時存在於清單 b 且尚未輸出過，就依序收集。
import sys

lines = sys.stdin.read().splitlines()
idx = 0
n = int(lines[idx]); idx += 1
a = list(map(int, lines[idx].split())); idx += 1
m = int(lines[idx]); idx += 1
b = list(map(int, lines[idx].split())); idx += 1

b_set = set(b)
seen = set()
result = []
for x in a:
    if x in b_set and x not in seen:
        result.append(x)
        seen.add(x)

print(" ".join(map(str, result)))
