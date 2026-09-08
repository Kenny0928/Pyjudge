# 解題核心：走訪字串每個字元，遇到母音就把計數器加 1
s = input()
vowels = "aeiou"
count = 0
for ch in s:
    if ch in vowels:
        count += 1
print(count)
