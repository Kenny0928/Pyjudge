# 解題核心：比較原字串與反轉字串，完全相同就是迴文。
import sys

text = sys.stdin.readline().rstrip("\n")
print("true" if text == text[::-1] else "false")
