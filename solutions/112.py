# 解題核心：讀入整行（保留原始空格），前後接上固定的 <p> 標籤字串。
import sys

s = sys.stdin.readline().rstrip("\n")
print("<p>" + s + "</p>")
