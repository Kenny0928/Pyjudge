# 解題核心：讀入清單與目標項目，走訪清單檢查是否有完全相同的項目。
import sys

lines = sys.stdin.read().split("\n")
items = lines[1].split()
target = lines[2].strip()
print("true" if target in items else "false")
