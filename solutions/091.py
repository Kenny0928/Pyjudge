# 解題核心：讀取兩行文字，各自轉成小寫後再比較是否相同。
# 積木對照：要求輸入 A → 要求輸入 B → 轉小寫 → 比較是否相等積木 → 說出 true 或 false。
import sys

a = sys.stdin.readline().rstrip("\n")
b = sys.stdin.readline().rstrip("\n")
print("true" if a.lower() == b.lower() else "false")
