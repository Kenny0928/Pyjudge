# 解題核心：讀取一整行文字後原封不動印出，保留開頭空白但不含結尾換行符號。
import sys

text = sys.stdin.readline().rstrip("\n")
print(text)
