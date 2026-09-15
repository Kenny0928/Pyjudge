# 解題核心：讀取完整一行文字，使用 len() 計算包含空格在內的字元數。
# 積木對照：要求輸入文字 → 字串長度 → 說出結果。
import sys

text = sys.stdin.readline().rstrip("\n")
print(len(text))
