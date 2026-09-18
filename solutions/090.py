# 解題核心：讀取兩行文字（保留空白），用 == 逐字元比較是否完全相同。
# 積木對照：要求輸入 A → 要求輸入 B → 比較是否相等積木 → 說出 true 或 false。
import sys

a = sys.stdin.readline().rstrip("\n")
b = sys.stdin.readline().rstrip("\n")
print("true" if a == b else "false")
