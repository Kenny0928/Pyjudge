# 解題核心：讀入字串與目標字元，使用 find() 找出第一次出現的索引，找不到回傳 -1。
import sys

lines = sys.stdin.read().splitlines()
s = lines[0]
c = lines[1] if len(lines) > 1 else ""
print(s.find(c))
