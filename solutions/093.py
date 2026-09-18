# 解題核心：讀取字串與重複次數，使用 * 直接重複字串。
# 積木對照：要求輸入文字 → 要求輸入次數 → 重複 N 次迴圈中用字串組合積木累加 → 說出結果。
import sys

lines = sys.stdin.read().splitlines()
a = lines[0] if lines else ""
b = int(lines[1]) if len(lines) > 1 else 0
print(a * b)
