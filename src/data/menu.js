/* 체험용 가상 매장·메뉴 데이터(PRD 9장 유지보수: menu 데이터 1곳).
 * 실제 브랜드 메뉴·가격이 아닙니다. 가격은 화면 구성을 위한 체험용 값입니다.
 * temps: 가능한 온도, coffee: 샷 추가 가능 여부
 */
window.MENU = {
  stores: [
    { id: "a", name: "리틀스타 데모 카페 A" },
    { id: "b", name: "리틀스타 데모 카페 B" },
    { id: "c", name: "리틀스타 데모 카페 C" }
  ],
  categories: [
    { id: "rec", name: "추천" },
    { id: "coffee", name: "커피" },
    { id: "decaf", name: "디카페인" },
    { id: "latte", name: "라떼" },
    { id: "drink", name: "음료·티" },
    { id: "dessert", name: "디저트" }
  ],
  items: [
    { id: "americano", name: "아메리카노", cat: ["coffee", "rec"], price: 1500, temps: ["HOT", "ICED"], coffee: true },
    { id: "cafelatte", name: "카페라떼", cat: ["coffee", "latte"], price: 2900, temps: ["HOT", "ICED"], coffee: true },
    { id: "vanillalatte", name: "바닐라라떼", cat: ["coffee", "latte", "rec"], price: 3300, temps: ["HOT", "ICED"], coffee: true },
    { id: "cappuccino", name: "카푸치노", cat: ["coffee"], price: 2900, temps: ["HOT", "ICED"], coffee: true },
    { id: "hazelnut", name: "헤이즐넛 아메리카노", cat: ["coffee"], price: 2000, temps: ["HOT", "ICED"], coffee: true },
    { id: "coldbrew", name: "콜드브루", cat: ["coffee"], price: 3000, temps: ["ICED"], coffee: true },
    { id: "espresso", name: "에스프레소", cat: ["coffee"], price: 1500, temps: ["HOT"], coffee: true },
    { id: "caramelmac", name: "카라멜마키아토", cat: ["coffee", "latte"], price: 3500, temps: ["HOT", "ICED"], coffee: true },
    { id: "mocha", name: "카페모카", cat: ["coffee", "latte"], price: 3500, temps: ["HOT", "ICED"], coffee: true },
    { id: "einspanner", name: "아인슈페너", cat: ["coffee"], price: 3700, temps: ["ICED"], coffee: true },
    { id: "d_americano", name: "디카페인 아메리카노", cat: ["decaf"], price: 2500, temps: ["HOT", "ICED"], coffee: true },
    { id: "d_latte", name: "디카페인 카페라떼", cat: ["decaf"], price: 3400, temps: ["HOT", "ICED"], coffee: true },
    { id: "d_vanilla", name: "디카페인 바닐라라떼", cat: ["decaf"], price: 3800, temps: ["HOT", "ICED"], coffee: true },
    { id: "d_coldbrew", name: "디카페인 콜드브루", cat: ["decaf"], price: 3500, temps: ["ICED"], coffee: true },
    { id: "d_hazelnut", name: "디카페인 헤이즐넛 아메리카노", cat: ["decaf"], price: 3000, temps: ["HOT", "ICED"], coffee: true },
    { id: "d_cappuccino", name: "디카페인 카푸치노", cat: ["decaf"], price: 3400, temps: ["HOT", "ICED"], coffee: true },
    { id: "greentealatte", name: "녹차라떼", cat: ["latte", "drink"], price: 3300, temps: ["HOT", "ICED"], coffee: false },
    { id: "chocolatte", name: "초코라떼", cat: ["latte", "drink"], price: 3300, temps: ["HOT", "ICED"], coffee: false },
    { id: "lemonade", name: "레몬에이드", cat: ["drink", "rec"], price: 3500, temps: ["ICED"], coffee: false },
    { id: "peachtea", name: "복숭아 아이스티", cat: ["drink"], price: 3000, temps: ["ICED"], coffee: false },
    { id: "chamomile", name: "캐모마일 티", cat: ["drink"], price: 2500, temps: ["HOT", "ICED"], coffee: false },
    { id: "yuzutea", name: "유자차", cat: ["drink"], price: 3300, temps: ["HOT", "ICED"], coffee: false },
    { id: "croffle", name: "크로플", cat: ["dessert", "rec"], price: 3000, temps: [], coffee: false, food: true },
    { id: "cookie", name: "초코칩 쿠키", cat: ["dessert"], price: 2000, temps: [], coffee: false, food: true },
    { id: "cheesecake", name: "치즈케이크", cat: ["dessert"], price: 4500, temps: [], coffee: false, food: true }
  ],
  options: {
    size: ["기본", "큰 사이즈"],
    shot: [0, 1, 2],
    sweet: ["기본", "덜 달게", "더 달게"],
    ice: ["적게", "보통", "많이"]
  },
  demoCustomerNo: "246810", // 데모 고객의 체험용 고객번호(6자리)
  // 체험 과제 기본값(데모 고객 메뉴). PRD 6.2 예시. 【확인】 대표 확정 필요
  demoTask: { itemId: "d_americano", temp: "ICED", size: "기본", shot: 1, sweet: "기본", ice: "보통", takeout: true }
};
