# 解題核心：讀取一整行（保留內部空白），再用 strip() 只移除頭尾空白。
# 積木對照：要求輸入文字 → 移除頭尾空白積木 → 說出結果。
import sys

a = sys.stdin.readline().rstrip("\n")
print(a.strip())
