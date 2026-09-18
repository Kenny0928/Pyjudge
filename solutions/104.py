# 解題核心：以逗號切割字串成清單，再用空格重新連接輸出。
import sys

line = sys.stdin.readline().rstrip("\n")
items = line.split(",")
print(" ".join(items))
