# 解答：九九乘法表
# 核心概念：使用雙層迴圈建立 9 行格式化算式


def main():
    for i in range(1, 10):
        row = [f"{i}*{j}={i * j}" for j in range(1, 10)]
        print(" ".join(row))


if __name__ == "__main__":
    main()
