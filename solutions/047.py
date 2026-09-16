# 解題核心：保留兩行文字的內容，依序連接後輸出。
# 積木對照：要求輸入 A → 要求輸入 B → 字串組合積木 → 說出結果。
import sys

lines = sys.stdin.read().splitlines()
first = lines[0] if lines else ""
second = lines[1] if len(lines) > 1 else ""
print(first + second)
