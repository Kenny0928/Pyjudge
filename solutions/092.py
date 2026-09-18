# 解題核心：讀取兩行文字（保留內部空白），中間插入 "-" 後連接。
# 積木對照：要求輸入 A → 要求輸入 B → 字串組合積木（A + "-" + B）→ 說出結果。
import sys

a = sys.stdin.readline().rstrip("\n")
b = sys.stdin.readline().rstrip("\n")
print(a + "-" + b)
