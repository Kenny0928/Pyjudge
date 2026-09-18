# 解題核心：讀取一行文字，直接以索引 0 取出第一個字元。
# 積木對照：要求輸入文字 → 取得字串第 1 個字元積木 → 說出結果。
import sys

a = sys.stdin.readline().rstrip("\n")
print(a[0])
