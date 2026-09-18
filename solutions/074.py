# 解題核心：走訪字串每個字元，轉成小寫後檢查是否屬於母音集合，是則計數器加一。
import sys

text = sys.stdin.readline().rstrip("\n")
vowels = set("aeiou")
count = 0
for ch in text:
    if ch.lower() in vowels:
        count += 1
print(count)
