# 解題核心：讀取 N 個項目，使用 ",".join(...) 將它們組合成一個字串，
# 項目之間僅以逗號分隔，不含任何空格。
import sys

tokens = sys.stdin.read().split()
n = int(tokens[0])
items = tokens[1:1 + n]
print(",".join(items))
