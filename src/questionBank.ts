/**
 * Ngân hàng câu hỏi mẫu cho Math Matrix Pro
 */
export const QUESTION_BANK = {
  "Hàm số": {
    "Nhận biết": [
      "Cho hàm số $y=f(x)$ có bảng biến thiên như sau. Hàm số đồng biến trên khoảng nào?",
      "Đường cong trong hình vẽ bên là đồ thị của hàm số nào dưới đây?",
      "Số điểm cực trị của hàm số $y=x^4-2x^2+3$ là bao nhiêu?"
    ],
    "Thông hiểu": [
      "Tìm giá trị lớn nhất của hàm số $f(x) = \frac{x+1}{x-2}$ trên đoạn $[3; 5]$.",
      "Tìm tất cả các giá trị thực của tham số $m$ để hàm số $y=x^3-3x^2+mx$ đạt cực tiểu tại $x=2$.",
      "Đồ thị hàm số $y=\frac{2x-1}{x+1}$ có bao nhiêu đường tiệm cận?"
    ],
    "Vận dụng": [
      "Cho hàm số $f(x)$ có đạo hàm $f'(x) = x(x-1)^2(x+2)$. Số điểm cực trị của hàm số $g(x) = f(x^2)$ là?",
      "Tìm $m$ để phương trình $x^3-3x+1=m$ có 3 nghiệm phân biệt.",
      "Một vật chuyển động theo quy luật $s(t) = -t^3 + 6t^2$. Vận tốc lớn nhất của vật đạt được tại thời điểm $t$ bằng?"
    ],
    "Vận dụng cao": [
      "Có bao nhiêu giá trị nguyên của $m$ để hàm số $y=|x^3-3x^2+m|$ có 5 điểm cực trị?",
      "Cho hàm số $f(x)$. Biết $f(0)=0$ và $f'(x) = \cos x \cdot \sin^2 x$. Tích phân $\int_0^{\pi/2} f(x) dx$ bằng?",
      "Tìm $m$ để bất phương trình $f(x) \le \exp(x^2) + m$ nghiệm đúng với mọi $x \in [0; 1]$."
    ]
  },
  "Nguyên hàm - Tích phân": {
    "Nhận biết": [
      "Họ nguyên hàm của hàm số $f(x) = e^x + x$ là?",
      "Tính tích phân $I = \int_0^1 (2x+1) dx$.",
      "Khẳng định nào sau đây sai? $\int kf(x)dx = k\int f(x)dx$."
    ],
    "Thông hiểu": [
      "Tính diện tích hình phẳng giới hạn bởi đồ thị hàm số $y=x^2-1$ và trục hoành.",
      "Cho $\int_0^2 f(x)dx = 3$ và $\int_0^2 g(x)dx = -1$. Tính $\int_0^2 [2f(x)-3g(x)]dx$.",
      "Tìm nguyên hàm $F(x)$ của hàm số $f(x) = \sin 2x$ thỏa mãn $F(\pi/4) = 0$."
    ],
    "Vận dụng": [
      "Tính thể tích khối tròn xoay tạo thành khi quay hình phẳng giới hạn bởi $y=\sqrt{x}e^x$, trục hoành và đường thẳng $x=1$ quanh trục $Ox$.",
      "Biết $\int_1^e \frac{\ln x}{x(1+\ln x)^2} dx = a\ln 2 + b$. Tính $a+b$.",
      "Một đám vi khuẩn tại thời điểm $t$ có số lượng là $N(t)$. Biết $N'(t) = \frac{1000}{t+1}$ và $N(0)=1000$. Số lượng vi khuẩn sau 10 ngày là?"
    ],
    "Vận dụng cao": [
      "Cho hàm số $f(x)$ liên tục trên $\mathbb{R}$ thỏa mãn $f(x) + f(-x) = \sqrt{2+2\cos 2x}$. Tính $\int_{-\pi/2}^{\pi/2} f(x) dx$.",
      "Tìm $f(x)$ biết $f'(x) = f(x) + x^2$ và $f(0)=1$.",
      "Tính tích phân $I = \int_0^1 \frac{x^2+1}{x^4+1} dx$."
    ]
  }
};
