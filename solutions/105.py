# 解題核心：以 split() 依空白切割句子，多餘空白會自動被忽略，計算清單長度即為單字數。
import sys

line = sys.stdin.readline().rstrip("\n")
words = line.split()
print(len(words))
