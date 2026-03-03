# 001. A+B 問題
# 難度：Easy

# 靈活讀取輸入：讀取所有內容並切開，可相容單行或多行輸入
import sys
tokens = sys.stdin.read().split()
if len(tokens) >= 2:
    a = int(tokens[0])
    b = int(tokens[1])
    print(a + b)
