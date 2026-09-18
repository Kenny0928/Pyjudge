# 解題核心：依序讀取清單 a、清單 b，將 b 直接接在 a 後面（list 相加）
# 即為合併後的新清單。
import sys

tokens = sys.stdin.read().split()
idx = 0
n_a = int(tokens[idx]); idx += 1
list_a = tokens[idx:idx + n_a]; idx += n_a
n_b = int(tokens[idx]); idx += 1
list_b = tokens[idx:idx + n_b]; idx += n_b

result = list_a + list_b
print(" ".join(result))
