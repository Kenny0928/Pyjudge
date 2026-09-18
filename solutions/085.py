# 解題核心：讀取一行文字，以索引 -1 取出最後一個字元。
# 積木對照：要求輸入文字 → 取得字串最後 1 個字元積木 → 說出結果。
import sys

a = sys.stdin.readline().rstrip("\n")
print(a[-1])
