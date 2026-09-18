# 解題核心：讀入整行後（去除換行符），用 len() == 0 判斷是否為空字串。
import sys

s = sys.stdin.readline().rstrip("\n")
print("true" if len(s) == 0 else "false")
