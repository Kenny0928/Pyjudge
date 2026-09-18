# 解題核心：讀取字串與 0-based 索引，直接以中括號索引取出字元。
# 積木對照：要求輸入文字 → 要求輸入位置 → 取得字串第 N 個字元積木 → 說出結果。
import sys

lines = sys.stdin.read().splitlines()
a = lines[0] if lines else ""
b = int(lines[1]) if len(lines) > 1 else 0
print(a[b])
