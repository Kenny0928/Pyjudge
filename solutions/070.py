# 解題核心：先把位移量對 26 取餘數，再依大小寫分別位移；非字母字元保持不變。
import sys

lines = sys.stdin.read().split('\n')
s = lines[0]
b = int(lines[1].strip())
shift = b % 26
result = []
for ch in s:
    if 'a' <= ch <= 'z':
        result.append(chr((ord(ch) - ord('a') + shift) % 26 + ord('a')))
    elif 'A' <= ch <= 'Z':
        result.append(chr((ord(ch) - ord('A') + shift) % 26 + ord('A')))
    else:
        result.append(ch)
print(''.join(result))
