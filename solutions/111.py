# 解題核心：讀入整行（保留原始空格），用 replace(' ', '') 移除所有半形空白。
import sys

s = sys.stdin.readline().rstrip("\n")
print(s.replace(" ", ""))
