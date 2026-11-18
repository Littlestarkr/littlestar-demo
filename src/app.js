/* 리틀스타 소개 사이트 — 정적 단일 페이지 앱(서버 전송 없음, localStorage만 사용) */
(function () {
  "use strict";
  var F = window.FACTS, M = window.MENU;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function get(path, obj) { return path.split(".").reduce(function (o, k) { return o == null ? o : o[k]; }, obj); }
  function fmt(n) { return typeof n === "number" ? (Number.isInteger(n) ? String(n) : n.toFixed(1)) : n; }
  function s1(ms) { return (ms / 1000).toFixed(1); }
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) {} }
  };
  function announce(t) { var l = $("#live"); if (l) { l.textContent = ""; setTimeout(function () { l.textContent = t; }, 30); } }

  /* ---------- 공통: 큰 글씨·움직임 끄기 ---------- */
  var prefs = store.get("ls_prefs", {});
  function applyPrefs() {
    document.documentElement.classList.toggle("big", !!prefs.big);
    document.documentElement.classList.toggle("calm", !!prefs.calm);
    $("#btnBig").setAttribute("aria-pressed", prefs.big ? "true" : "false");
    $("#btnCalm").setAttribute("aria-pressed", prefs.calm ? "true" : "false");
  }
  $("#btnBig").addEventListener("click", function () { prefs.big = !prefs.big; store.set("ls_prefs", prefs); applyPrefs(); });
  $("#btnCalm").addEventListener("click", function () { prefs.calm = !prefs.calm; store.set("ls_prefs", prefs); applyPrefs(); });
  applyPrefs();

  /* ---------- 공통: 수치 채우기(C-03) ---------- */
  $$("[data-f]").forEach(function (el) { var v = get(el.getAttribute("data-f"), F); el.textContent = v == null ? "" : fmt(v); });

  /* ---------- 문의(C-04) ---------- */
  // 주소는 화면에 표시하지 않고, 누르는 순간에만 조립해 메일 앱을 엽니다(단순 수집 봇 회피용, 완전한 보호는 아님).
  function rev(t) { return String(t).split("").reverse().join(""); }
  var CP = F.contactParts || [];
  var hasMail = CP.length === 2;
  function openMail(subject) { location.href = "mai" + "lto:" + rev(CP[1]) + "\u0040" + rev(CP[0]) + "?subject=" + encodeURIComponent(subject); }
  function bindMail(a, subject) { a.href = "#contact"; a.addEventListener("click", function (e) { e.preventDefault(); openMail(subject); }); }
  $$("[data-mail]").forEach(function (a) {
    if (hasMail) { bindMail(a, a.getAttribute("data-mail")); }
    else { a.href = "#contact-pending"; a.addEventListener("click", function (e) { e.preventDefault(); $("#contactLine").scrollIntoView(); $("#contactLine").focus && $("#contactLine").setAttribute("tabindex", "-1"); $("#contactLine").focus(); }); }
  });
  if (hasMail) {
    $("#contactLine").innerHTML = '<a class="contact-mail" href="#contact" aria-label="문의 메일 보내기" title="문의 메일 보내기"><span class="ic" aria-hidden="true">✉</span><span aria-hidden="true">메일 보내기</span></a>';
    bindMail($("#contactLine a"), "[리틀스타 문의]");
  } else { $("#contactLine").textContent = "문의 이메일은 공개 전에 확정해 이곳에 표시합니다."; }

  /* ---------- 4.4 실측 vs 모의 테스트 비교 블록(C-08) ---------- */
  var CMP_FIXED = "모의 테스트와 추정값은 실제 매장 측정값이 아닙니다. 실제 결제·대기·제조 시간은 포함되지 않았으며, 리틀스타의 실매장 효과는 2027년 파일럿에서 측정합니다.";
  function cmpRows() {
    var f = F.field, m = F.mock, k = F.klm, t = F.target;
    return [
      { name: "현장 실측", chip: "t-field", cond: f.condition + " (" + f.period + ")", legacy: "평균 " + f.mean + "초, 중앙값 " + f.median + "초 (" + f.min.toFixed(1) + "~" + f.max + "초)", ls: "해당 없음(서비스 전)" },
      { name: "대표 모의 테스트", chip: "t-mock", cond: "모형 화면, 대표 1인 시연 기록, 최대한 빨리 (" + m.date + ")", legacy: m.legacy + "초, 그래도 오주문 발생", ls: m.littlestar == null ? "(" + m.littlestarNote + ")" : m.littlestar + "초" },
      { name: "추정(KLM)", chip: "t-estimate", cond: k.condition, legacy: "약 " + k.legacy + "초", ls: "약 " + k.littlestar + "초(" + k.littlestarNote + ")" },
      { name: "설계 목표", chip: "t-target", cond: "프로토타입 실측으로 검증 예정", legacy: "—", ls: "식별~주문확정 " + t.identToConfirm + "초, 결제 포함 " + t.withPayment + "초 이내" },
      { name: "프로토타입 실측", chip: "t-estimate", cond: "클릭형 프로토타입, 참가자·과제·반복 수 사전 설계", legacy: "(예정)", ls: "(예정)" }
    ];
  }
  function cmpTable(rows) {
    var h = '<div class="tbl-wrap"><table class="tbl"><caption class="sr">실측과 모의 테스트·추정·목표 비교</caption><thead><tr><th scope="col">구분</th><th scope="col">조건</th><th scope="col">기존 키오스크</th><th scope="col">리틀스타</th></tr></thead><tbody>';
    rows.forEach(function (r) { h += '<tr><th scope="row"><span class="chip ' + r.chip + '">' + esc(r.name) + "</span></th><td>" + esc(r.cond) + "</td><td>" + esc(r.legacy) + "</td><td>" + esc(r.ls) + "</td></tr>"; });
    h += "</tbody></table></div><div class=\"cmp-cards\">";
    rows.forEach(function (r) { h += '<div class="cmp-card"><span class="chip ' + r.chip + '">' + esc(r.name) + '</span><div class="cond">조건: ' + esc(r.cond) + "</div><dl><dt>기존</dt><dd>" + esc(r.legacy) + "</dd><dt>리틀스타</dt><dd>" + esc(r.ls) + "</dd></dl></div>"; });
    return h + "</div>";
  }
  function renderCmp(el) {
    var mode = el.getAttribute("data-cmp"), rows = cmpRows();
    if (mode === "summary") rows = [rows[0], rows[3]];
    el.className = "cmp";
    el.innerHTML = "<h3>" + (mode === "summary" ? "지금(현장 실측)과 리틀스타 목표" : "실측 vs 모의 테스트·추정·목표") + "</h3>" + cmpTable(rows) + '<p class="cmp-fixed">' + esc(CMP_FIXED) + "</p>";
  }
  $$("[data-cmp]").forEach(renderCmp);

  /* ---------- P1 투자자 섹션 표 ---------- */
  (function () {
    var max = Math.max.apply(null, F.market.map(function (x) { return x.v; }));
    $("#market").innerHTML = F.market.map(function (x) {
      return '<div class="mk"><span class="lab">' + esc(x.k) + '</span><div class="bar" style="width:' + Math.max(2, x.v / max * 100) + '%" aria-hidden="true"></div><span class="val"><b>' + esc(x.value) + "</b> · " + esc(x.def) + '</span><details><summary>산식 보기</summary>' + esc(x.formula) + "</details></div>";
    }).join("");
    $("#tblChannels tbody").innerHTML = F.channels.map(function (r) { return '<tr><th scope="row">' + esc(r[0]) + "</th><td>" + esc(r[1]) + "</td><td>" + esc(r[2]) + "</td></tr>"; }).join("");
    $("#tblUnit tbody").innerHTML = F.unitEconomics.map(function (r) { return '<tr><th scope="row">' + esc(r[0]) + "</th><td>" + esc(r[1]) + "</td><td>" + esc(r[2]) + "</td></tr>"; }).join("");
    var cls = function (v) { return v.charAt(0) === "-" ? "neg" : v.charAt(0) === "+" ? "pos" : ""; };
    var t = '<div class="tbl-wrap"><table class="tbl"><caption class="sr">5개년 매출·손익(기준 시나리오, 가정)</caption><thead><tr><th scope="col">연도</th><th scope="col">연말 유료 매장(자가 / 채널)</th><th scope="col">구독</th><th scope="col">구축·부가</th><th scope="col">매출</th><th scope="col">비용</th><th scope="col">영업손익</th></tr></thead><tbody>';
    F.pnl.forEach(function (r) { t += '<tr><th scope="row">' + r.y + "</th><td>" + esc(r.stores) + "</td><td>" + r.sub + "</td><td>" + r.extra + "</td><td>" + r.rev + "</td><td>" + r.cost + '</td><td class="' + cls(r.op) + '">' + r.op + "</td></tr>"; });
    t += "</tbody></table></div>";
    F.pnl.forEach(function (r) { t += '<div class="yr"><b>' + r.y + "년</b><dl><dt>연말 유료 매장(자가 / 채널)</dt><dd>" + esc(r.stores) + "</dd><dt>매출</dt><dd>" + r.rev + " (구독 " + r.sub + ", 구축·부가 " + r.extra + ")</dd><dt>비용</dt><dd>" + r.cost + '</dd><dt>영업손익</dt><dd class="' + cls(r.op) + '">' + r.op + "</dd></dl></div>"; });
    $("#pnl").innerHTML = t;
  })();

  /* ---------- 개인정보: 기록 지우기(C-11) ---------- */
  $("#btnWipe").addEventListener("click", function () {
    ["ls_my", "ls_runs", "ls_prefs"].forEach(store.del);
    prefs = {}; applyPrefs(); my.load(); if (route === "my-menu") my.render(); if (route === "try") { tryp.reset(); tryp.render(); }
    $("#wipeMsg").textContent = "이 기기에 저장된 체험 기록·등록 메뉴·화면 설정을 지웠습니다.";
  });

  /* ---------- P4 탭 ---------- */
  $$(".tabs [role=tab]").forEach(function (b) {
    b.addEventListener("click", function () {
      $$(".tabs [role=tab]").forEach(function (x) { x.setAttribute("aria-selected", x === b ? "true" : "false"); });
      var v = b.id === "tab-legacy" ? "legacy" : b.id === "tab-ls" ? "ls" : "both";
      $("#steps").setAttribute("data-view", v); $("#steps").setAttribute("aria-labelledby", b.id);
    });
  });

  /* ---------- 메뉴 도우미 ---------- */
  function item(id) { for (var i = 0; i < M.items.length; i++) if (M.items[i].id === id) return M.items[i]; return null; }
  function defaultSpec(it) { return { itemId: it.id, temp: it.temps[0] || null, size: it.food ? null : "기본", shot: 0, sweet: it.food ? null : "기본", ice: "보통", takeout: true }; }
  function describe(s, noTake) {
    var it = item(s.itemId); if (!it) return "";
    var p = [];
    if (s.temp) p.push(s.temp === "ICED" ? "아이스" : "따뜻하게");
    p.push(it.name);
    if (!it.food) {
      if (s.size && s.size !== "기본") p.push(s.size);
      if (it.coffee && s.shot) p.push("샷 +" + s.shot);
      if (s.sweet && s.sweet !== "기본") p.push(s.sweet);
      if (s.temp === "ICED" && s.ice !== "보통") p.push("얼음 " + s.ice);
    }
    if (!noTake) p.push(s.takeout ? "포장" : "매장");
    return p.join(" · ");
  }
  function price(s) { var it = item(s.itemId); return it ? it.price + (s.size === "큰 사이즈" ? 500 : 0) + (it.coffee ? (s.shot || 0) * 500 : 0) : 0; }
  function sameDrink(a, b) {
    var it = item(b.itemId), diff = [];
    if (a.itemId !== b.itemId) { diff.push("메뉴"); return diff; }
    if (it.food) return diff;
    if ((a.temp || null) !== (b.temp || null)) diff.push("온도");
    if (a.size !== b.size) diff.push("사이즈");
    if (it.coffee && (a.shot || 0) !== (b.shot || 0)) diff.push("샷");
    if (a.sweet !== b.sweet) diff.push("당도");
    if (b.temp === "ICED" && a.ice !== b.ice) diff.push("얼음량");
    return diff;
  }

  /* ---------- 결제·적립 설정(오프라인 결제 때 고르는 것) ---------- */
  var PAY = { card: "신용·체크카드", easy: "간편결제", prepaid: "선불충전금" };
  var USEPT = { none: "사용 안 함", point: "포인트 먼저 사용", stamp: "스탬프 쿠폰 먼저 사용" };
  var EARN = { stamp: "스탬프 적립", point: "포인트 적립", none: "적립 안 함" };
  var RECEIPT = { no: "영수증 미출력", yes: "영수증 출력" };
  var DEMO_POINT = 1200; // 체험용 보유 포인트(가상)
  function defaultProfile() { return { takeout: true, pay: "card", usePt: "none", earn: "stamp", cups: [], receipt: "no" }; }
  function profileOf(d) {
    var p = defaultProfile();
    if (d && d.profile) { for (var k in d.profile) p[k] = d.profile[k]; }
    else if (d && d.menus && d.menus[0] && d.menus[0].takeout === false) p.takeout = false;
    return p;
  }
  function profLine(p) { return (p.takeout ? "포장" : "매장") + " · " + PAY[p.pay] + " · " + EARN[p.earn] + " · " + (p.usePt === "none" ? "포인트·스탬프 사용 안 함" : USEPT[p.usePt]); }
  function specKey(s) { var it = item(s.itemId); if (!it) return s.itemId; if (it.food) return it.id; return [it.id, s.temp || "", s.size, it.coffee ? s.shot || 0 : 0, s.sweet, s.temp === "ICED" ? s.ice : ""].join("|"); }
  function qtyMap(lines) { var m = {}; lines.forEach(function (l) { var k = specKey(l); m[k] = (m[k] || 0) + (l.qty || 1); }); return m; }
  function sameOrder(lines, taskLines) {
    var a = qtyMap(lines), b = qtyMap(taskLines.filter(function (x) { return (x.qty || 1) > 0; })), why = [];
    var keys = {}; Object.keys(a).concat(Object.keys(b)).forEach(function (k) { keys[k] = 1; });
    var miss = 0, extra = 0, qty = 0;
    Object.keys(keys).forEach(function (k) { if (!a[k]) miss++; else if (!b[k]) extra++; else if (a[k] !== b[k]) qty++; });
    if (miss) why.push("과제 메뉴·옵션과 다름");
    if (extra) why.push("과제에 없는 메뉴 포함");
    if (qty) why.push("수량 다름");
    return why;
  }
  function orderTotal(lines) { return lines.reduce(function (s, l) { return s + price(l) * (l.qty || 1); }, 0); }
  function discount(lines, usePt) {
    var t = orderTotal(lines);
    if (usePt === "point") return Math.min(DEMO_POINT, t);
    if (usePt === "stamp") { var drinks = lines.filter(function (l) { return !item(l.itemId).food; }); return drinks.length ? Math.min.apply(null, drinks.map(price)) : 0; }
    return 0;
  }

  /* =====================================================================
   * P3 단골메뉴 등록
   * ===================================================================== */
  var my = {
    data: null, draft: null, t0: null, edit: false, cat: "decaf", cur: null, msg: "", stage: "menu", editIdx: null,
    load: function () { this.data = store.get("ls_my", null); },
    has: function () { return !!(this.data && this.data.menus && this.data.menus.length && this.data.done !== false); }, // 최종 저장까지 끝난 경우만
    partial: function () { return !!(this.data && this.data.menus && this.data.menus.length && this.data.done === false); }, // 메뉴만 저장됨
    addLib: function (d, m) { d.lib = d.lib || []; var k = specKey(m); if (d.lib.some(function (x) { return specKey(x) === k; })) return; var c = JSON.parse(JSON.stringify(m)); delete c.rep; c.qty = m.qty || 1; d.lib.unshift(c); d.lib = d.lib.slice(0, 10); },
    rep: function () { if (!this.has()) return null; var r = this.data.menus.filter(function (m) { return m.rep; })[0]; return r || this.data.menus[0]; },
    profile: function () { return profileOf(this.data); },
    startEdit: function (stage) {
      this.edit = true; this.stage = stage || "menu"; this.editIdx = null;
      this.draft = this.data && this.data.menus ? JSON.parse(JSON.stringify(this.data)) : { alias: "", store: M.stores[0].id, menus: [], regSeconds: null, lib: [] };
      var self = this; this.draft.lib = this.draft.lib || []; this.draft.menus.forEach(function (m) { self.addLib(self.draft, m); });
      this.draft.profile = profileOf(this.draft);
      this.draft.menus.forEach(function (m) { if (!m.qty) m.qty = 1; });
      this.t0 = null; this.cur = null; this.msg = "";
    },
    render: function () {
      var root = $("#myRoot");
      if (!this.edit) {
        if (this.has()) { root.innerHTML = this.savedView(); }
        else { this.startEdit(this.partial() ? "prof" : "menu"); root.innerHTML = this.editView(); }
      } else root.innerHTML = this.editView();
    },
    savedView: function () {
      var d = this.data, p = this.profile(), st = M.stores.filter(function (s) { return s.id === d.store; })[0];
      var h = '<div class="sec"><h2>저장된 나의 메뉴 <span class="chip t-mine">이 기기에만 저장</span></h2>';
      h += "<p>" + esc(d.alias || "나") + " · " + esc(st ? st.name : "") + "</p>";
      h += '<ul class="mylist">' + d.menus.map(function (m, i) { return "<li" + (m.rep ? ' class="rep"' : "") + "><span>" + (m.rep ? "★ " : (i + 1) + ". ") + esc(describe(m, true)) + " × " + (m.qty || 1) + "</span></li>"; }).join("") + "</ul>";
      h += '<p><b>결제·적립 설정</b>: ' + esc(profLine(p)) + (p.cups.length ? " · 일회용품 " + esc(p.cups.join("·")) : "") + " · " + RECEIPT[p.receipt] + "</p>";
      h += '<p>체험용 고객번호: <b class="num">' + esc(d.customerNo || "-") + '</b> <span class="small muted">(리틀스타 키오스크에서 휴대폰 번호 대신 입력하는 6자리. 체험용이며 실제 서비스와 무관)</span></p>';
      if (d.regSeconds != null) h += '<p><span class="chip t-mine">내 체험 기록</span> 최초 1회 등록에 <b>' + d.regSeconds.toFixed(1) + "초</b> 걸렸습니다. 이후 주문부터는 이 과정이 없습니다.</p>";
      h += '<div class="cta-row"><a class="btn primary" href="#try">이 메뉴로 주문 체험하기</a><button type="button" class="btn" data-my="edit" data-v="menu">메뉴 수정</button><button type="button" class="btn" data-my="edit" data-v="prof">결제·적립 설정 수정</button><button type="button" class="btn ghost" data-my="wipe">등록 내용 삭제</button></div>';
      h += '<p class="foot">체험 시간은 이 웹페이지에서 모의로 주문한 기록이며 실제 매장 측정값이 아닙니다. 10초는 설계 목표입니다.</p></div>';
      return h + this.infoCards();
    },
    infoCards: function () {
      return '<div class="sec"><h2>실제 서비스에서는</h2><div class="ident-card"><p><b>고객 확인 방식(설계안)</b>: 기본은 QR·휴대폰 태그 또는 미리 등록한 고객번호 6자리, 보조로 휴대폰 번호(010 뒤 8자리). 번호는 화면에서 가리고(마스킹), PIN을 선택할 수 있으며, 개인정보 수집·이용 동의와 마케팅 동의를 따로 받습니다. 이 체험 사이트에서는 번호를 받지 않습니다.</p>' +
        "<p><b>결제수단 등록</b>: 이 체험에서는 종류만 고릅니다. 실제 서비스에서도 카드번호는 리틀스타가 보관하지 않고 결제대행사가 보관하는 방식(빌링키)을 검토합니다. 선불충전금은 규제 확인이 필요한 장기 과제입니다.</p>" +
        "<p><b>등록 경로(언제·어디서)</b>: 단골 메뉴는 최대 5개, 처음 한 번 등록합니다. ① 매장 키오스크 첫 화면의 [단골메뉴 등록하기]: 휴대폰 번호로 본인 확인 → 메뉴 고르기 → 결제수단 선택 ② 일반 주문으로 결제를 마친 화면의 ‘다음엔 단골로 등록해 보세요’: 방금 주문한 메뉴를 그대로 등록 ③ 웹·앱에서 직접 등록(이 화면, 옵션까지 자세히) ④ 자녀가 부모님 메뉴를 대신 등록(시니어 모드, 준비 중). 등록이 끝나면 고객번호 6자리(또는 QR)가 발급되어 다음 주문부터 첫 화면에서 바로 식별합니다. <span class=\"chip t-estimate\">설계안</span> <span class=\"small muted\">①·②는 <a href=\"#try\">체험하기</a>의 리틀스타 키오스크에서 해 볼 수 있습니다.</span></p></div></div>";
    },
    seg: function (label, act, key, vals, cur, show) {
      var o = '<p class="small muted" style="margin:.6em 0 0">' + label + '</p><div class="seg" role="group" aria-label="' + label + '">';
      vals.forEach(function (v) { o += '<button type="button" data-my="' + act + '" data-k="' + key + '" data-v="' + v + '" aria-pressed="' + (String(cur) === String(v)) + '">' + esc(show ? show(v) : v) + "</button>"; });
      return o + "</div>";
    },
    stageBar: function () {
      var st = this.stage;
      return '<ol class="stagebar" aria-label="등록 단계"><li' + (st === "menu" ? ' aria-current="step"' : "") + '><b>1</b> 나의 메뉴 담기·저장</li><li' + (st === "prof" ? ' aria-current="step"' : "") + '><b>2</b> 결제·적립 설정 → 최종 저장</li></ol>';
    },
    editView: function () {
      var d = this.draft, self = this, p = d.profile, h = this.stageBar(), full = d.menus.length >= 5;
      if (this.stage === "menu") {
        h += '<div class="step-h"><span class="n">1</span><h2>단골 카페 선택 <small class="muted">(체험용 가상 매장)</small></h2></div><div class="seg" role="group" aria-label="매장">';
        M.stores.forEach(function (s) { h += '<button type="button" data-my="store" data-v="' + s.id + '" aria-pressed="' + (d.store === s.id) + '">' + esc(s.name) + "</button>"; });
        h += '</div><div class="field"><label for="myAlias">부르는 이름(별칭)</label><input id="myAlias" maxlength="10" placeholder="예: 나, 어머니" value="' + esc(d.alias) + '" aria-describedby="aliasHelp"><p id="aliasHelp" class="small muted">실명은 쓰지 마세요. 키오스크 첫 화면 인사에만 쓰입니다.</p></div>';
        var cur = d.menus.map(specKey), lib = (d.lib || []).filter(function (x) { return cur.indexOf(specKey(x)) < 0; });
        if (lib.length) {
          h += '<div class="step-h"><span class="n">2</span><h2>저장해 둔 메뉴에서 고르기</h2></div><div class="seg" role="group" aria-label="저장해 둔 메뉴">';
          (d.lib || []).forEach(function (x, li) { if (cur.indexOf(specKey(x)) >= 0) return; h += '<button type="button" data-my="lib" data-i="' + li + '"' + (full ? " disabled" : "") + ">+ " + esc(describe(x, true)) + " × " + (x.qty || 1) + "</button>"; });
          h += "</div>";
        }
        h += '<div class="step-h"><span class="n">' + (lib.length ? 3 : 2) + '</span><h2>' + (this.editIdx != null ? "메뉴 옵션·수량 고치기" : "새 메뉴·옵션·수량 고르기") + '</h2></div>';
        if (full && this.editIdx == null) h += '<p class="note">나의 메뉴는 최대 5개까지입니다. 더 담으려면 아래 목록에서 하나를 삭제하세요.</p>';
        else {
          h += '<div class="seg" role="group" aria-label="분류">';
          M.categories.forEach(function (c) { if (c.id === "rec") return; h += '<button type="button" data-my="cat" data-v="' + c.id + '" aria-pressed="' + (self.cat === c.id) + '">' + esc(c.name) + "</button>"; });
          h += '</div><div class="picks" role="group" aria-label="메뉴">';
          M.items.filter(function (it) { return it.cat.indexOf(self.cat) >= 0; }).forEach(function (it) { h += '<button type="button" class="pick" data-my="item" data-v="' + it.id + '" aria-pressed="' + (self.cur && self.cur.itemId === it.id) + '">' + esc(it.name) + "</button>"; });
          h += "</div>";
        }
        if (this.cur) {
          var c = this.cur, it = item(c.itemId);
          h += '<div class="sec"><p><b>' + esc(it.name) + "</b></p>";
          if (it.temps.length > 1) h += this.seg("온도", "opt", "temp", it.temps, c.temp, function (v) { return v === "ICED" ? "아이스" : "따뜻하게"; });
          if (!it.food) h += this.seg("사이즈", "opt", "size", M.options.size, c.size);
          if (it.coffee) h += this.seg("샷 추가", "opt", "shot", M.options.shot, c.shot, function (v) { return v ? "+" + v : "없음"; });
          if (!it.food) h += this.seg("당도", "opt", "sweet", M.options.sweet, c.sweet);
          if (c.temp === "ICED") h += this.seg("얼음량", "opt", "ice", M.options.ice, c.ice);
          h += '<p class="small muted" style="margin:.6em 0 0">평소 수량</p><div class="stepper"><button type="button" data-my="curq" data-v="-1" aria-label="수량 줄이기"' + (c.qty <= 1 ? " disabled" : "") + '>−</button><b aria-live="polite">' + c.qty + '</b><button type="button" data-my="curq" data-v="1" aria-label="수량 늘리기"' + (c.qty >= 9 ? " disabled" : "") + ">+</button></div>";
          h += '<p>미리보기: <b>' + esc(describe(c, true)) + " × " + c.qty + '</b></p><div class="cta-row" style="margin-top:0"><button type="button" class="btn primary" data-my="add"' + (full && this.editIdx == null ? " disabled" : "") + ">" + (this.editIdx != null ? "고친 내용 적용" : "나의 메뉴에 담기") + '</button><button type="button" class="btn ghost" data-my="curCancel">취소</button></div><p class="small muted">담기만 하고 저장은 아래 [메뉴 저장]에서 합니다.</p></div>';
        }
        h += '<div class="step-h"><span class="n">' + (lib.length ? 4 : 3) + '</span><h2>나의 메뉴 <small class="muted">(' + d.menus.length + "/5. 키오스크에서 모두 기본 수량으로 뜨고 ± 로 바꿀 수 있음)</small></h2></div>";
        if (!d.menus.length) h += '<p class="muted">아직 없습니다. 위에서 메뉴를 골라 담으세요.</p>';
        h += '<ul class="mylist">' + d.menus.map(function (m, i) {
          var nm = esc(describe(m, true));
          return "<li" + (m.rep ? ' class="rep"' : "") + (self.editIdx === i ? ' aria-current="true"' : "") + "><span>" + (m.rep ? "★ " : (i + 1) + ". ") + nm + " × <b>" + m.qty + '</b></span><span class="ctrl">' +
            '<button type="button" data-my="q" data-i="' + i + '" data-v="-1" aria-label="' + nm + ' 수량 줄이기"' + (m.qty <= 1 ? " disabled" : "") + ">−</button>" +
            '<button type="button" data-my="q" data-i="' + i + '" data-v="1" aria-label="' + nm + ' 수량 늘리기"' + (m.qty >= 9 ? " disabled" : "") + ">+</button>" +
            '<button type="button" data-my="medit" data-i="' + i + '" aria-label="' + nm + ' 옵션 고치기">옵션 수정</button>' +
            (m.rep ? "" : '<button type="button" data-my="rep" data-i="' + i + '" aria-label="' + nm + ' 대표로 지정">★ 대표로</button>') +
            '<button type="button" data-my="up" data-i="' + i + '" aria-label="위로"' + (i === 0 ? " disabled" : "") + ">▲</button>" +
            '<button type="button" data-my="down" data-i="' + i + '" aria-label="아래로"' + (i === d.menus.length - 1 ? " disabled" : "") + ">▼</button>" +
            '<button type="button" data-my="del" data-i="' + i + '" aria-label="' + nm + ' 삭제">삭제</button></span></li>';
        }).join("") + "</ul>";
        h += '<div class="cta-row"><button type="button" class="btn primary" data-my="saveMenus"' + (d.menus.length ? "" : " disabled") + ">메뉴 저장하고 다음 (결제·적립 설정) →</button>" + (this.has() ? '<button type="button" class="btn ghost" data-my="cancel">취소</button>' : "") + "</div>";
        h += '<p class="small muted">[메뉴 저장]은 메뉴만 저장합니다. 단골 등록은 다음 단계에서 결제·적립 설정을 고르고 [최종 저장]을 눌러야 끝납니다.</p>';
      } else {
        h += '<div class="sec"><p><b>저장된 나의 메뉴</b> (' + d.menus.length + '/5)</p><ul class="mylist">' + d.menus.map(function (m, i) { return "<li" + (m.rep ? ' class="rep"' : "") + "><span>" + (m.rep ? "★ " : (i + 1) + ". ") + esc(describe(m, true)) + " × " + m.qty + "</span></li>"; }).join("") + '</ul><button type="button" class="btn sm" data-my="toMenu">← 메뉴 수정</button></div>';
        h += '<div class="step-h"><span class="n">2</span><h2>결제·적립 설정 <small class="muted">(매장 키오스크에서 매번 고르던 것)</small></h2></div><div class="sec" style="margin-top:0">';
        h += this.seg("매장/포장", "prof", "takeout", ["true", "false"], String(p.takeout), function (v) { return v === "true" ? "포장" : "매장에서"; });
        h += this.seg("결제수단", "prof", "pay", ["card", "easy", "prepaid"], p.pay, function (v) { return { card: "등록 카드(체험용)", easy: "간편결제", prepaid: "선불충전금(장기 과제)" }[v]; });
        h += this.seg("포인트·스탬프 우선 사용", "prof", "usePt", ["none", "point", "stamp"], p.usePt, function (v) { return USEPT[v]; });
        h += this.seg("적립 방식", "prof", "earn", ["stamp", "point", "none"], p.earn, function (v) { return EARN[v]; });
        h += '<p class="small muted" style="margin:.6em 0 0">일회용품</p><div class="seg" role="group" aria-label="일회용품">';
        ["빨대", "캐리어", "냅킨"].forEach(function (cname) { h += '<button type="button" data-my="cup" data-v="' + cname + '" aria-pressed="' + (p.cups.indexOf(cname) >= 0) + '">' + cname + "</button>"; });
        h += "</div>" + this.seg("영수증", "prof", "receipt", ["no", "yes"], p.receipt, function (v) { return RECEIPT[v]; });
        h += '<p class="small muted">카드번호·계좌·충전 금액은 받지 않습니다. 결제수단은 종류만 고릅니다. 포인트·스탬프 잔액은 체험용 가상 값(포인트 ' + DEMO_POINT.toLocaleString() + "P, 스탬프 쿠폰 1장)입니다." + (p.pay === "prepaid" ? " 선불충전금은 규제 확인 후 추진할 장기 과제이며, 여기서는 화면만 미리 보여 줍니다." : "") + "</p></div>";
        h += '<p class="small muted">최종 저장하면 이 기기 브라우저에만 남습니다. 처음 등록할 때는 첫 조작부터 최종 저장까지 걸린 시간을 재서 체험 결과에 ‘최초 1회 등록 시간’으로 함께 보여 드립니다.</p>';
        h += '<div class="cta-row"><button type="button" class="btn primary" data-my="save">최종 저장</button>' + (this.has() ? '<button type="button" class="btn ghost" data-my="cancel">취소</button>' : "") + "</div>";
      }
      if (this.msg) h += '<p role="status" class="note">' + esc(this.msg) + "</p>";
      return h + this.infoCards();
    },
    onClick: function (e) {
      var b = e.target.closest("[data-my]"); if (!b || b.disabled) return;
      var a = b.getAttribute("data-my"), v = b.getAttribute("data-v"), i = +b.getAttribute("data-i"), d = this.draft, k = b.getAttribute("data-k");
      if (this.edit && this.t0 == null && !(this.has() && d.regSeconds != null)) this.t0 = performance.now();
      if (a === "edit") { this.startEdit(v); }
      else if (a === "wipe") { store.del("ls_my"); this.load(); this.startEdit(); this.msg = "등록 내용을 삭제했습니다."; }
      else if (a === "cancel") { this.edit = false; }
      else if (a === "store") { d.store = v; }
      else if (a === "cat") { this.cat = v; }
      else if (a === "item") { this.cur = defaultSpec(item(v)); this.cur.qty = 1; this.editIdx = null; }
      else if (a === "curCancel") { this.cur = null; this.editIdx = null; }
      else if (a === "medit") { this.cur = JSON.parse(JSON.stringify(d.menus[i])); this.editIdx = i; var ci0 = item(this.cur.itemId); if (ci0 && ci0.cat && ci0.cat.length) this.cat = ci0.cat.filter(function (x) { return x !== "rec"; })[0] || this.cat; }
      else if (a === "lib") { if (d.menus.length < 5) { var lm = JSON.parse(JSON.stringify(d.lib[i])); lm.qty = lm.qty || 1; lm.rep = d.menus.length === 0; d.menus.push(lm); this.msg = ""; announce("저장해 둔 메뉴를 담았습니다."); } }
      else if (a === "toMenu") { this.stage = "menu"; this.msg = ""; }
      else if (a === "saveMenus") {
        var al0 = $("#myAlias"); d.alias = (al0 && al0.value.trim()) || d.alias || "나";
        d.menus.forEach(function (m) { my.addLib(d, m); });
        if (d.done !== true) d.done = false;
        if (d.regSeconds == null && this.t0 != null) { d.regAcc = Math.round(((d.regAcc || 0) + (performance.now() - this.t0) / 1000) * 10) / 10; this.t0 = null; }
        if (!store.set("ls_my", d)) { this.msg = "이 브라우저에서는 저장할 수 없습니다(사생활 보호 모드 등)."; }
        else { this.data = JSON.parse(JSON.stringify(d)); this.stage = "prof"; this.cur = null; this.editIdx = null; this.msg = "메뉴를 저장했습니다. 이제 결제·적립 설정을 고르고 [최종 저장]을 누르세요."; announce(this.msg); }
        window.scrollTo(0, $("#myRoot").offsetTop - 60); this.render(); var f0 = $('#myRoot [data-my="prof"]'); if (f0) f0.focus({ preventScroll: true }); return;
      }
      else if (a === "opt") { this.cur[k] = k === "shot" ? +v : v; }
      else if (a === "curq") { this.cur.qty = Math.max(1, Math.min(9, this.cur.qty + +v)); }
      else if (a === "q") { d.menus[i].qty = Math.max(1, Math.min(9, d.menus[i].qty + +v)); }
      else if (a === "prof") { d.profile[k] = k === "takeout" ? v === "true" : v; }
      else if (a === "cup") { var ci = d.profile.cups.indexOf(v); if (ci >= 0) d.profile.cups.splice(ci, 1); else d.profile.cups.push(v); }
      else if (a === "add") {
        var m = JSON.parse(JSON.stringify(this.cur)); delete m.takeout;
        if (this.editIdx != null && d.menus[this.editIdx]) { m.rep = !!d.menus[this.editIdx].rep; d.menus[this.editIdx] = m; my.addLib(d, m); this.editIdx = null; this.cur = null; announce("메뉴를 고쳤습니다."); }
        else if (d.menus.length < 5) { m.rep = d.menus.length === 0; d.menus.push(m); my.addLib(d, m); this.cur = null; this.msg = ""; announce("나의 메뉴에 담았습니다. 저장은 [메뉴 저장]에서 합니다."); }
      }
      else if (a === "rep") { d.menus.forEach(function (m, j) { m.rep = j === i; }); }
      else if (a === "up" && i > 0) { d.menus.splice(i - 1, 0, d.menus.splice(i, 1)[0]); }
      else if (a === "down" && i < d.menus.length - 1) { d.menus.splice(i + 1, 0, d.menus.splice(i, 1)[0]); }
      else if (a === "del") { if (this.editIdx === i) { this.editIdx = null; this.cur = null; } var wasRep = d.menus[i].rep; d.menus.splice(i, 1); if (wasRep && d.menus[0]) d.menus[0].rep = true; }
      else if (a === "save") {
        var al = $("#myAlias"); d.alias = (al && al.value.trim()) || "나";
        if (d.regSeconds == null) d.regSeconds = Math.round(((d.regAcc || 0) + (this.t0 != null ? (performance.now() - this.t0) / 1000 : 0)) * 10) / 10;
        d.done = true; d.menus.forEach(function (m) { my.addLib(d, m); });
        if (!d.customerNo) d.customerNo = String(100000 + Math.floor(Math.random() * 900000));
        d.savedAt = new Date().toISOString();
        if (!store.set("ls_my", d)) { this.msg = "이 브라우저에서는 저장할 수 없습니다(사생활 보호 모드 등)."; }
        else { this.load(); this.edit = false; this.msg = ""; announce("단골 등록을 최종 저장했습니다."); }
      }
      if (this.draft) { var al2 = $("#myAlias"); if (al2) this.draft.alias = al2.value; }
      var y = window.scrollY; this.render(); window.scrollTo(0, y);
      var again = $('#myRoot [data-my="' + a + '"]' + (v ? '[data-v="' + v + '"]' : "") + (k ? '[data-k="' + k + '"]' : "") + (b.hasAttribute("data-i") ? '[data-i="' + i + '"]' : ""));
      if (again && !again.disabled) again.focus({ preventScroll: true });
    }
  };
  my.load();
  $("#myRoot").addEventListener("click", function (e) { my.onClick(e); });
  $("#myRoot").addEventListener("input", function (e) { if (e.target.id === "myAlias" && my.draft) { my.draft.alias = e.target.value; if (my.t0 == null && my.draft.regSeconds == null) my.t0 = performance.now(); } });

  /* =====================================================================
   * P2 모의 주문 체험
   * ===================================================================== */
  var IDLE_MS = 60000;
  var MODE_NAME = { legacy: "일반 주문(현행과 같은 순서)", ls: "리틀스타 단골 주문", reg: "리틀스타 단골메뉴 등록" };
  function apSec(pay) { var a = F.payment && F.payment.approvalSec || {}; return +(a[pay] != null ? a[pay] : a.card || 0); }
  function apTxt() { var a = F.payment.approvalSec; return "카드 " + a.card.toFixed(1) + "초 · 간편결제 " + a.easy.toFixed(1) + "초 · 선불충전금 " + a.prepaid.toFixed(1) + "초"; }
  function approvalMs(r) { return Math.round(apSec(r.pay) * 1000); }
  function tTot(r) { return r.tEnd - r.t0; }      // 첫 터치~결제 승인 완료(헤드라인)
  function tOrd(r) { return r.tApprove - r.t0; }  // 승인 대기 제외(결제 확정 터치까지)
  var tryp = {
    phase: "select", runs: { legacy: null, ls: null }, first: null, suggest: null, browse: false, run: null, k: null, idleT: null, tickT: null, apT: null,
    task: function () {
      var has = my.has(), t = {};
      t.menus = this.lsMenus().map(function (m) { var c = JSON.parse(JSON.stringify(m)); c.qty = c.qty || 1; return c; });
      t.profile = has ? my.profile() : (function () { var p = defaultProfile(); p.takeout = M.demoTask.takeout !== false; return p; })();
      t.fromMy = has; t.cno = has && my.data.customerNo ? my.data.customerNo : M.demoCustomerNo; return t;
    },
    reset: function () { this.runs = { legacy: null, ls: null }; this.first = null; this.suggest = null; },
    render: function () {
      var root = $("#tryRoot"); clearInterval(this.tickT);
      if (this.phase === "select") root.innerHTML = this.selectView();
      else if (this.phase === "run") { root.innerHTML = this.runShell(); this.k = $("#kiosk"); this.screen({ legacy: "start", ls: "who", reg: "rid" }[this.run.mode]); this.startTick(); }
      else if (this.phase === "result") root.innerHTML = this.resultView();
      else if (this.phase === "browseEnd") root.innerHTML = this.browseEndView();
    },
    taskCard: function (t) {
      var p = t.profile, needNo = p.earn !== "none" || p.usePt !== "none";
      return '<div class="task" aria-labelledby="taskH"><h2 id="taskH">주문 과제 (두 방식 모두 같음)</h2><div class="what">' + t.menus.map(function (m) { return esc(describe(m, true)) + " × " + m.qty; }).join("<br>") + "</div><ul><li>" + (p.takeout ? "포장" : "매장에서 먹기") + "</li><li>결제수단: " + PAY[p.pay] + "</li><li>포인트·스탬프: " + USEPT[p.usePt] + " / " + EARN[p.earn] + (needNo ? " <span class=\"small muted\">(현행 키오스크는 휴대폰 번호 뒤 8자리 입력, 체험이므로 아무 숫자)</span>" : "") + "</li><li>시간은 <b>첫 터치~결제 승인 완료</b>까지. 승인 대기 " + apSec(p.pay).toFixed(1) + "초(" + PAY[p.pay] + ", 가정)를 두 방식에 똑같이 포함</li></ul>" +
        '<p class="small muted">' + (t.fromMy ? "단골메뉴 등록에 저장한 메뉴·수량·결제 설정입니다." : "데모 고객의 단골 메뉴입니다. 내 메뉴로 하려면 <a href=\"#my-menu\">단골메뉴 등록</a>을 먼저 해 보세요.") + " 리틀스타 체험용 고객번호: <b>" + esc(t.cno) + "</b></p></div>";
    },
    modeCard: function (mode) {
      var h = '<div class="sec pick-card" style="margin:0">';
      h += "<h2>" + MODE_NAME[mode] + "</h2>";
      h += mode === "legacy"
        ? '<ol class="mini"><li>매장/포장</li><li>메뉴 찾기·옵션</li><li>광고 팝업·확인·일회용품</li><li>멤버십 번호 입력(식별)·포인트</li><li>결제수단 선택 → 카드 넣기</li></ol><p class="small muted">결제 전 약 13단계</p>'
        : '<ol class="mini"><li>단골 주문 → 고객 식별<br><small>QR·휴대폰 태그 / 고객번호 6자리 (보조: 휴대폰 번호)</small></li><li>나의 메뉴 확인(수량 ±) → 주문하기</li><li>등록 결제수단 자동 선택 → 결제하기</li></ol><p class="small muted">식별 뒤 터치 2회</p>';
      return h + "</div>";
    },
    /* --- 리틀스타 키오스크 첫 화면(11/18): 왼쪽 [일반 주문], 오른쪽 [단골 주문] + 바로 밑 작은 [단골메뉴 등록하기] --- */
    homeView: function () {
      var self = this, ra = this.runs.legacy, rb = this.runs.ls;
      function st(mode) {
        var r = self.runs[mode], o = self.runs[mode === "legacy" ? "ls" : "legacy"], x = "";
        if (self.suggest === mode) x += '<span class="kst sug">무작위 추천: 이쪽 먼저</span>';
        if (r && r.stalled) x += '<span class="kst">60초 넘게 멈춤 · 다시 해 주세요</span>';
        else if (r) x += '<span class="kst">✔ ' + s1(tTot(r)) + "초 · " + (r.why.length ? "과제와 다름" : "과제와 일치") + "</span>";
        else if (o && !o.stalled) x += '<span class="kst">같은 메뉴로 이쪽도</span>';
        return x;
      }
      return '<div class="kiosk khome-wrap" role="region" aria-label="리틀스타 키오스크 첫 화면(모형)"><div class="k-head"><span>첫 화면</span><span>리틀스타(모형)</span></div><h2>주문 방법을 선택해 주세요</h2>' +
        '<div class="khome"><div class="khome-col"><button type="button" class="kb sec2 khome-btn khome-gen' + (this.suggest === "legacy" ? " suggested" : "") + '" data-t="start" data-v="legacy"><span class="kt">일반 주문</span><small>메뉴를 직접 고르기<br>지금 키오스크와 같은 순서</small>' + st("legacy") + "</button></div>" +
        '<div class="khome-col"><button type="button" class="kb acc khome-btn khome-ls' + (this.suggest === "ls" ? " suggested" : "") + '" data-t="start" data-v="ls"><span class="kt">★ 단골 주문</span><small>QR·고객번호로 확인<br>늘 먹던 메뉴 바로 주문</small>' + st("ls") + "</button>" +
        '<button type="button" class="kb-link" data-t="reg">＋ 단골메뉴 등록하기<small>처음 한 번 · 최대 5개</small></button></div></div>' +
        '<p class="small khome-note">버튼을 누르면 해당 절차로 들어갑니다. 시간은 두 경로 모두 다음 화면의 첫 터치부터 잽니다.</p></div>';
    },
    selectView: function () {
      var t = this.task(), h = "";
      if (this.notice) { h += '<p class="note" role="status">' + esc(this.notice) + "</p>"; this.notice = null; }
      h += '<p class="disclaimer">이 체험은 실제 키오스크가 아닌 웹 모형입니다. 측정되는 시간은 이 화면에서 주문한 시간이며 실제 매장 시간과 다를 수 있습니다.</p>';
      h += '<p class="small" style="margin:0 0 8px">과제: <b>' + t.menus.map(function (m) { return esc(describe(m, true)) + " × " + m.qty; }).join(", ") + " · " + (t.profile.takeout ? "포장" : "매장") + '</b> (자세한 조건은 아래). 두 경로로 같은 메뉴를 주문해 비교해 보세요.</p>';
      h += this.homeView();
      h += '<p class="small" style="margin:8px 0">[일반 주문]은 지금 키오스크와 같은 순서 그대로라 처음 온 손님도 평소처럼 쓰고, 이 체험에서 재는 리틀스타 시간과 10초 목표는 <b>단골 주문 경로 기준</b>입니다. 단골 메뉴(최대 5개)는 [단골메뉴 등록하기]나 <a href="#my-menu">웹 단골메뉴 등록</a>에서 처음 한 번 등록합니다. 시간 측정 없이 <button type="button" class="linkish" data-t="browse" data-v="legacy">일반 주문 둘러보기</button> · <button type="button" class="linkish" data-t="browse" data-v="ls">단골 주문 둘러보기</button></p>';
      h += '<details class="sec"><summary><b>두 경로의 순서 보기</b></summary><div class="pair" style="margin-top:8px">' + this.modeCard("legacy") + this.modeCard("ls") + "</div></details>";
      h += this.taskCard(t);
      h += '<p class="small">어느 쪽부터 해도 됩니다. 두 번째로 하는 쪽은 메뉴를 이미 알고 있어 조금 유리할 수 있으므로 결과에 순서를 함께 표시합니다. 순서를 정하기 어렵다면 <button type="button" class="linkish" data-t="suggest">무작위로 정하기</button>.</p>';
      h += '<details class="sec"><summary><b>공정하게 비교하기 위한 규칙</b></summary><ul class="ticks"><li>기존형 단계·순서는 실제 주문절차도(14화면)와 같게 만들었습니다(<a href="#compare">절차 비교</a>에서 공개).</li><li>두 방식의 버튼 크기·반응 속도가 같고, 일부러 넣은 로딩 지연이 없습니다.</li><li>첫 화면에서 [일반 주문]·[단골 주문]을 고르는 터치는 두 경로 모두 시간에 넣지 않고, 다음 화면의 첫 터치부터 결제 승인 완료까지 잽니다. 승인 대기는 결제수단별 가정값(' + apTxt() + ')을 두 방식에 똑같이 넣었습니다. ' + esc(F.payment.basis) + '.</li><li>광고 팝업은 실제 절차에 있어 넣었지만 [건너뛰기]가 바로 보입니다.</li><li>번호는 두 방식 모두 같은 숫자판으로 직접 눌러야 합니다(자동 입력 없음).</li><li>리틀스타는 메뉴를 처음 한 번 등록해야 빨라집니다. 그 등록 시간도 결과에 함께 보여 줍니다.</li><li>웹 모형에는 줄 서기·카드 삽입 동작·뒤 손님의 압박이 없어 실제보다 빠를 수 있습니다.</li></ul></details>';
      var hist = store.get("ls_runs", []);
      if (hist.length) {
        h += '<div class="sec history"><h2>내 체험 기록 <span class="chip t-mine">이 기기에만 저장</span></h2><ol>' + hist.slice(-10).reverse().map(function (x) {
          return "<li>" + esc(x.date) + " · 현행 " + x.legacy + "초 / 리틀스타 " + x.ls + "초 · " + (x.first === "legacy" ? "현행 먼저" : "리틀스타 먼저") + (x.method ? " · " + esc(x.method) : "") + (x.senior ? " · 큰 글씨" : "") + "</li>";
        }).join("") + '</ol><p class="foot">웹 모의 체험 기록 · 실제 매장 측정값 아님. 시간은 첫 터치~결제 승인 완료(승인 대기 가정값 포함). 60초 이상 멈춘 체험은 기록하지 않았습니다.</p></div>';
      }
      return h;
    },
    newRun: function (mode) { return { mode: mode, t0: null, tConfirm: null, tApprove: null, tEnd: null, touches: 0, screens: [], backs: 0, stalled: false, cart: [], takeout: null, stamped: false, cups: [], pay: null, phone: "", cno: "", method: null, spec: null, promoAdded: false, earn: "none", usePt: "none", order: null, qtys: null }; },
    begin: function (mode, browse, extra) {
      this.browse = !!browse;
      this.run = this.newRun(mode); if (extra) for (var ek in extra) this.run[ek] = extra[ek];
      this.phase = "run"; this.render(); window.scrollTo(0, 0); this.focusKiosk();
    },
    runShell: function () {
      var r = this.run, label = r.viaLs ? "리틀스타 일반 주문" : MODE_NAME[r.mode], h = "", other = this.runs[r.mode === "legacy" ? "ls" : "legacy"];
      if (r.mode === "reg") {
        h += '<div class="task"><h2>키오스크에서 단골메뉴 등록 (체험)</h2><p style="margin:0">본인 확인 → 메뉴 최대 5개 → 결제수단, 세 화면이면 끝납니다. 처음 한 번만 하고, 다음부터는 첫 화면에서 QR·고객번호로 바로 주문합니다. 번호는 저장·전송되지 않고, 고른 메뉴만 이 기기 브라우저에 저장됩니다.</p>' + (r.dropped ? '<p class="small muted" style="margin:.4em 0 0">진행 중이던 단골 주문 시간 측정은 멈췄습니다(기록 없음).</p>' : "") + "</div>";
        h += '<div class="timerbar"><span class="order-tag">' + label + '</span><span class="chip t-estimate">주문 시간 측정 안 함</span></div>';
        h += '<div class="kiosk" id="kiosk" role="region" aria-label="' + label + ' 모의 화면"></div><div class="cta-row"><button type="button" class="btn ghost sm" data-t="back">첫 화면으로</button></div>';
        return h;
      }
      h += this.taskCard(this.task());
      if (this.browse) h += '<div class="timerbar"><span class="order-tag">' + label + ' 둘러보기</span><span class="chip t-estimate">시간 측정 안 함</span></div>';
      else h += '<div class="timerbar"><span class="order-tag">' + label + ' <span class="small muted">(' + (other && !other.stalled ? "두 번째" : "첫 번째") + ')</span></span><span>시간 <span class="timer" id="timer">0.0</span>초</span></div>';
      h += '<div class="kiosk" id="kiosk" role="region" aria-label="' + label + ' 모의 화면"></div>';
      h += '<div class="cta-row"><button type="button" class="btn ghost sm" data-t="back">첫 화면으로</button></div>';
      return h;
    },
    startTick: function () {
      var self = this; if (this.browse) return;
      this.tickT = setInterval(function () { var el = $("#timer"); if (el && self.run && self.run.t0 != null) el.textContent = s1((self.run.tEnd || performance.now()) - self.run.t0); }, 100);
    },
    focusKiosk: function () { var h = $("#kiosk h2"); if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); } },
    stopTimers: function () { clearTimeout(this.idleT); clearInterval(this.tickT); clearTimeout(this.apT); },
    resetIdle: function () {
      var self = this; clearTimeout(this.idleT);
      if (this.browse || !this.run || this.run.t0 == null || this.run.tApprove != null) return;
      this.idleT = setTimeout(function () { self.run.stalled = true; self.modal("idle"); }, IDLE_MS);
    },
    /* --- 키오스크 화면 그리기 --- */
    screen: function (name) {
      var r = this.run; r.screen = name; if (r.screens.indexOf(name) < 0 && name !== "done" && name !== "approve") r.screens.push(name);
      this.k.innerHTML = r.mode === "legacy" ? this.legacy(name) : r.mode === "reg" ? this.reg(name) : this.ls(name); this.focusKiosk();
      var h2 = $("#kiosk h2"); if (h2) announce(h2.textContent);
    },
    head: function (left) { return '<div class="k-head"><span>' + left + "</span><span>" + (this.run.viaLs ? "리틀스타 · 일반 주문(모형)" : this.run.mode === "legacy" ? "일반 키오스크(모형)" : "리틀스타(모형)") + "</span></div>"; },
    keypad: function () {
      var h = '<div class="kpad">'; [1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(function (n) { h += '<button type="button" class="kb sec2" data-k="digit" data-v="' + n + '">' + n + "</button>"; });
      return h + '<button type="button" class="kb sec2" data-k="clear">지우기</button><button type="button" class="kb sec2" data-k="digit" data-v="0">0</button><button type="button" class="kb sec2" data-k="bksp" aria-label="한 자리 지우기">←</button></div>';
    },
    phoneShow: function () { var p = (this.run.phone + "________").slice(0, 8); return '<div class="kphone" aria-label="입력한 번호 ' + this.run.phone.length + '자리">010-' + p.slice(0, 4).replace(/\d/g, "●") + "-" + p.slice(4).replace(/\d/g, "●") + "</div>"; },
    cnoShow: function () { var p = (this.run.cno + "______").slice(0, 6); return '<div class="kphone" aria-label="입력한 고객번호 ' + this.run.cno.length + '자리">' + p.replace(/\d/g, "●").split("").join(" ") + "</div>"; },
    phoneWarn: '<p class="kwarn">체험입니다. 실제 번호 대신 아무 숫자 8자리를 눌러 주세요. 입력한 번호는 화면에서 가려지고 저장·전송되지 않습니다.</p>',
    payPrompt: { card: ["카드를 넣어 주세요", "카드를 넣었어요"], easy: ["결제 바코드를 대 주세요", "바코드를 댔어요"], prepaid: ["선불충전금으로 결제합니다", "결제하기"] },
    lsPrompt: { card: "등록 카드로 결제합니다", easy: "간편결제로 결제합니다", prepaid: "선불충전금으로 결제합니다" },
    paySummary: function () {
      var r = this.run, lines = r.mode === "legacy" ? r.cart : r.order, tot = orderTotal(lines), dc = discount(lines, r.usePt);
      return '<div class="kcart" style="margin:0"><span>' + lines.map(function (l) { return esc(describe(l, true)) + " × " + l.qty; }).join("<br>") + "</span><span>합계 " + tot.toLocaleString() + "원" + (dc ? " − " + USEPT[r.usePt].replace(" 먼저 사용", "") + " " + dc.toLocaleString() + "원" : "") + " = <b>" + (tot - dc).toLocaleString() + '원</b> <span class="small">(체험용 가격)</span></span><span class="small">' + EARN[r.earn] + (r.usePt !== "none" ? " · " + USEPT[r.usePt] : "") + "</span></div>";
    },
    payScreens: function (n) {
      var r = this.run, pp = this.payPrompt[r.pay] || this.payPrompt.card;
      if (n === "pay") return this.head("결제") + (r.mode === "ls" ? '<p class="kok">✓ 주문이 접수되었습니다 · 등록한 결제수단: ' + PAY[r.pay] + "</p>" : "") + "<h2>" + (r.mode === "ls" ? this.lsPrompt[r.pay] || pp[0] : pp[0]) + "</h2>" + this.paySummary() + '<p style="text-align:center" class="small">체험에서는 실제 결제를 하지 않습니다. 버튼을 누르면 승인 대기 ' + apSec(r.pay).toFixed(1) + '초(가정)가 흐른 뒤 끝납니다.' + (r.pay === "prepaid" ? " 선불충전금은 장기 과제 미리보기입니다." : "") + '</p><div class="kfoot"><button type="button" class="kb sec2" data-k="unpay">' + (r.mode === "ls" ? "다른 결제수단" : "이전") + '</button><button type="button" class="kb acc" data-k="paid">' + (r.mode === "ls" ? "결제하기" : pp[1]) + "</button></div>";
      if (n === "approve") return this.head("결제") + '<div class="kdone"><div class="big spin" aria-hidden="true">⏳</div><h2>승인 중입니다</h2><p>' + (r.pay === "card" ? "카드를 빼지 마세요." : "잠시만 기다려 주세요.") + '<br><span class="small">승인 대기 ' + apSec(r.pay).toFixed(1) + "초(" + PAY[r.pay] + ", 가정, 두 방식 동일)</span></p></div>";
      return "";
    },
    legacy: function (n) {
      var r = this.run, h = "";
      if (n === "start") {
        h = this.head("주문 시작") + '<h2>주문 방법을 선택해 주세요</h2>' + (r.viaLs ? '<p class="kok">리틀스타의 일반 주문은 지금 키오스크와 같은 순서 그대로입니다. 처음 오신 분도 평소처럼 주문하세요.</p>' : "") + '<p style="text-align:center">화면을 터치하면 주문이 시작됩니다</p><div class="kgrid" style="margin-top:auto"><button type="button" class="kb" data-k="takeout" data-v="false">매장에서 먹기</button><button type="button" class="kb" data-k="takeout" data-v="true">포장하기</button></div>';
      } else if (n === "menu") {
        r.cat = r.cat || "rec"; r.page = r.page || 0;
        var items = M.items.filter(function (it) { return it.cat.indexOf(r.cat) >= 0; }), per = 6, pages = Math.ceil(items.length / per);
        if (r.page >= pages) r.page = 0;
        h = this.head(r.takeout ? "포장" : "매장") + '<h2 class="sr">메뉴 선택</h2><div class="kcats" role="group" aria-label="메뉴 분류">';
        M.categories.forEach(function (c) { h += '<button type="button" class="kb sec2" data-k="cat" data-v="' + c.id + '" aria-pressed="' + (r.cat === c.id) + '">' + esc(c.name) + "</button>"; });
        h += '</div><div class="kgrid">';
        items.slice(r.page * per, r.page * per + per).forEach(function (it) { h += '<button type="button" class="kb kitem" data-k="item" data-v="' + it.id + '"><span>' + esc(it.name) + '</span><span class="pr">' + it.price.toLocaleString() + "원</span></button>"; });
        h += "</div>";
        if (pages > 1) h += '<div class="kpager"><button type="button" class="kb sec2" data-k="page" data-v="-1"' + (r.page === 0 ? " disabled" : "") + ' aria-label="이전 페이지">‹</button><span>' + (r.page + 1) + " / " + pages + '</span><button type="button" class="kb sec2" data-k="page" data-v="1"' + (r.page === pages - 1 ? " disabled" : "") + ' aria-label="다음 페이지">›</button></div>';
        h += '<div class="kcart"><b>장바구니 ' + r.cart.length + "개</b>" + (r.cart.length ? "<ul>" + r.cart.map(function (c) { return "<li>" + esc(describe(c, true)) + " × " + c.qty + "</li>"; }).join("") + "</ul>" : "") +
          '<div class="kfoot"><button type="button" class="kb sec2" data-k="back" data-v="start">이전</button><button type="button" class="kb acc" data-k="checkout"' + (r.cart.length ? "" : " disabled") + ">주문하기</button></div></div>";
        if (r.modal === "opt") h += this.optModal();
        if (r.modal === "promo") h += '<div class="kmodal" role="dialog" aria-modal="true" aria-labelledby="promoH"><div class="box"><h2 id="promoH">함께 드시면 좋아요!</h2><p>크로플을 추가하시겠어요? (체험용 광고 팝업)</p><div class="kgrid"><button type="button" class="kb acc" data-k="promoSkip">건너뛰기</button><button type="button" class="kb" data-k="promoAdd">추가하기</button></div></div></div>';
      } else if (n === "confirm") {
        var total = r.cart.reduce(function (s, c) { return s + price(c) * c.qty; }, 0);
        h = this.head("주문 확인") + "<h2>주문 내역을 확인해 주세요</h2><div class=\"kmenu-list\">";
        r.cart.forEach(function (c, i) { h += '<div class="kcart" style="margin:0"><span>' + esc(describe(c, true)) + '</span><div class="krow"><button type="button" class="kb sec2" data-k="qty" data-i="' + i + '" data-v="-1" aria-label="수량 줄이기">−</button><span style="align-self:center;min-width:2em;text-align:center">' + c.qty + '</span><button type="button" class="kb sec2" data-k="qty" data-i="' + i + '" data-v="1" aria-label="수량 늘리기">+</button></div></div>'; });
        h += '</div><p>합계 <b>' + total.toLocaleString() + '원</b> <span class="small">(체험용 가격)</span></p><div class="kfoot"><button type="button" class="kb sec2" data-k="back" data-v="menu">이전</button><button type="button" class="kb acc" data-k="go" data-v="cup"' + (r.cart.length ? "" : " disabled") + ">다음</button></div>";
      } else if (n === "cup") {
        h = this.head("일회용품") + '<h2>필요한 일회용품을 선택해 주세요</h2><div class="kcheck">';
        ["빨대", "캐리어", "냅킨"].forEach(function (c) { h += '<button type="button" class="kb sec2" role="checkbox" data-k="cupT" data-v="' + c + '" aria-checked="' + (r.cups.indexOf(c) >= 0) + '">' + c + "</button>"; });
        h += '</div><div class="kfoot"><button type="button" class="kb sec2" data-k="back" data-v="confirm">이전</button><button type="button" class="kb acc" data-k="go" data-v="stamp">선택 완료</button></div>';
      } else if (n === "stamp") {
        h = this.head("멤버십") + '<h2>포인트·스탬프를 적립하거나 쓰시겠어요?</h2><div class="kmenu-list"><button type="button" class="kb" data-k="stamp" data-v="phone">휴대폰 번호로 적립·사용</button><button type="button" class="kb sec2" data-k="stamp" data-v="none">건너뛰기(적립 안 함)</button></div><div class="kfoot"><button type="button" class="kb sec2" data-k="back" data-v="cup">이전</button></div>';
      } else if (n === "phone") {
        h = this.head("번호 입력") + "<h2>휴대폰 번호를 입력해 주세요</h2>" + this.phoneShow() + this.phoneWarn + this.keypad() +
          '<div class="kfoot"><button type="button" class="kb sec2" data-k="back" data-v="stamp">이전</button><button type="button" class="kb acc" data-k="phoneOk"' + (r.phone.length === 8 ? "" : " disabled") + ">확인</button></div>";
      } else if (n === "member") {
        h = this.head("멤버십") + '<h2>적립·사용 방법을 골라 주세요</h2><p style="text-align:center;margin:0" class="small">보유(체험용): 포인트 ' + DEMO_POINT.toLocaleString() + "P · 스탬프 쿠폰 1장</p>";
        h += '<div class="kopt"><h3>적립</h3><div class="krow" role="group" aria-label="적립">';
        ["stamp", "point"].forEach(function (v) { h += '<button type="button" class="kb sec2" data-k="earn" data-v="' + v + '" aria-pressed="' + (r.earn === v) + '">' + EARN[v] + "</button>"; });
        h += '</div><h3>먼저 사용</h3><div class="krow" role="group" aria-label="포인트·스탬프 사용">';
        ["none", "point", "stamp"].forEach(function (v) { h += '<button type="button" class="kb sec2" data-k="usept" data-v="' + v + '" aria-pressed="' + (r.usePt === v) + '">' + { none: "사용 안 함", point: "포인트", stamp: "스탬프 쿠폰" }[v] + "</button>"; });
        h += '</div></div><div class="kfoot"><button type="button" class="kb sec2" data-k="back" data-v="phone">이전</button><button type="button" class="kb acc" data-k="go" data-v="paymethod">다음</button></div>';
      } else if (n === "paymethod") {
        h = this.head("결제") + '<h2>결제 수단을 선택해 주세요</h2>' + this.payMethodButtons() + '<div class="kfoot"><button type="button" class="kb sec2" data-k="back" data-v="' + (r.stamped ? "member" : "stamp") + '">이전</button></div>';
      } else if (n === "pay" || n === "approve") {
        h = this.payScreens(n);
      } else if (n === "done") {
        h = this.head("완료") + '<div class="kdone"><div class="big" aria-hidden="true">✓</div><h2>결제가 승인되어 주문이 완료되었습니다</h2><p>진동벨을 가져가세요.</p></div>' + (r.viaLs ? '<div class="kreg"><p><b>★ 자주 드시는 메뉴인가요? 다음엔 단골로 등록해 보세요.</b><br><span class="small">등록해 두면 첫 화면에서 번호만 누르면 이 메뉴가 바로 나옵니다.</span></p><button type="button" class="kb sec2" data-k="regStart">방금 주문한 메뉴로 단골 등록하기</button></div>' : "") + '<button type="button" class="kb acc" data-k="next">' + this.nextLabel() + "</button>";
      }
      return h;
    },
    optModal: function () {
      var r = this.run, s = r.spec, it = item(s.itemId), h = '<div class="kmodal" role="dialog" aria-modal="true" aria-labelledby="optH"><div class="box"><h2 id="optH">' + esc(it.name) + '</h2><div class="kopt">';
      function seg(label, key, vals, show) {
        var o = "<h3>" + label + '</h3><div class="krow" role="group" aria-label="' + label + '">';
        vals.forEach(function (v) { o += '<button type="button" class="kb sec2" data-k="opt" data-o="' + key + '" data-v="' + v + '" aria-pressed="' + (String(s[key]) === String(v)) + '">' + esc(show ? show(v) : v) + "</button>"; });
        return o + "</div>";
      }
      if (it.temps.length > 1) h += seg("온도", "temp", it.temps);
      if (!it.food) h += seg("사이즈", "size", M.options.size);
      if (it.coffee) h += seg("샷 추가", "shot", M.options.shot, function (v) { return v ? "+" + v : "없음"; });
      if (!it.food) h += seg("당도(시럽)", "sweet", M.options.sweet);
      if (s.temp === "ICED") h += seg("얼음량", "ice", M.options.ice);
      return h + '</div><div class="kgrid"><button type="button" class="kb sec2" data-k="optCancel">취소</button><button type="button" class="kb acc" data-k="optAdd">담기</button></div></div></div>';
    },
    lsMenus: function () { if (my.has()) return my.data.menus; var d = JSON.parse(JSON.stringify(M.demoTask)); d.rep = true; return [d]; },
    ls: function (n) {
      var r = this.run, h = "", m = my.has() ? my.data : null, menus = this.lsMenus();
      if (n === "who") {
        var im = r.idMode || "cno";
        h = this.head("고객 확인") + '<h2>단골 주문 · 고객 확인</h2><p class="small" style="text-align:center;margin:0 0 6px">QR·태그 또는 고객번호로 확인하세요</p>' +
          '<button type="button" class="kb acc" data-k="tag">📲 QR·휴대폰 태그로 바로 확인<small>휴대폰을 리더기에 대면 끝(체험: 이 버튼 1회)</small></button>' +
          '<div class="krow" role="group" aria-label="번호 종류"><button type="button" class="kb sec2" data-k="idmode" data-v="cno" aria-pressed="' + (im === "cno") + '">고객번호 6자리<small>기본</small></button><button type="button" class="kb sec2" data-k="idmode" data-v="phone" aria-pressed="' + (im === "phone") + '">휴대폰 번호 8자리<small>보조</small></button></div>' +
          (im === "phone" ? this.phoneShow() : this.cnoShow()) +
          '<p class="kwarn">' + (im === "phone" ? "체험입니다. 실제 번호 대신 아무 숫자 8자리를 누르세요. 다 누르면 바로 넘어갑니다." : "체험용 고객번호 " + esc(this.task().cno) + " (아무 6자리나 인식). 다 누르면 바로 넘어갑니다.") + " 번호는 가려지고 저장되지 않습니다. PC는 키보드 숫자키도 됩니다.</p>" + this.keypad();
      } else if (n === "mymenu") {
        var prof = this.task().profile;
        if (!r.qtys) r.qtys = menus.map(function (x) { return x.qty || 1; });
        var tq = r.qtys.reduce(function (a, b) { return a + b; }, 0);
        h = this.head("나의 메뉴") + '<h2>반가워요! 늘 드시던 메뉴예요</h2><p style="text-align:center;margin:0" class="small">확인됨: ' + esc(m ? m.alias || "나" : "데모 고객") + " (" + { phone: "휴대폰 번호", cno: "고객번호", tag: "QR·태그" }[r.method] + ")</p><div class=\"kmenu-list\">";
        menus.forEach(function (x, i) {
          h += '<div class="kline' + (x.rep ? " rep" : "") + '"><span>' + (x.rep ? "★ " : "") + esc(describe(x, true)) + '</span><div class="kstep"><button type="button" class="kb sec2" data-k="lq" data-i="' + i + '" data-v="-1" aria-label="' + esc(describe(x, true)) + ' 수량 줄이기"' + (r.qtys[i] <= 0 ? " disabled" : "") + '>−</button><b aria-live="polite">' + r.qtys[i] + '</b><button type="button" class="kb sec2" data-k="lq" data-i="' + i + '" data-v="1" aria-label="' + esc(describe(x, true)) + ' 수량 늘리기"' + (r.qtys[i] >= 9 ? " disabled" : "") + ">+</button></div></div>";
        });
        h += '</div><p class="small" style="margin:0">' + esc(profLine(prof)) + '</p><div class="kfoot"><button type="button" class="kb sec2" data-k="back" data-v="who">이전</button><button type="button" class="kb acc" data-k="order"' + (tq ? "" : " disabled") + ">주문하기 (" + tq + "개)</button></div>";
      } else if (n === "paymethod") {
        h = this.head("결제") + '<h2>다른 결제수단을 고르세요</h2>' + this.paySummary() + this.payMethodButtons() + '<div class="kfoot"><button type="button" class="kb sec2" data-k="go" data-v="pay">이전</button></div>';
      } else if (n === "pay" || n === "approve") {
        h = this.payScreens(n);
      } else if (n === "done") {
        h = this.head("완료") + '<div class="kdone"><div class="big" aria-hidden="true">✓</div><h2>결제가 승인되어 주문이 완료되었습니다</h2><p>음료가 준비되면 폰으로 알려 드립니다.<br>(진동벨 대신 알림)</p></div><button type="button" class="kb acc" data-k="next">' + this.nextLabel() + "</button>";
      }
      return h;
    },
    /* --- 키오스크 단골메뉴 등록(체험, 시간 측정 없음) --- */
    startReg: function () {
      var r = this.run, wasBrowse = this.browse, pre = null;
      if (r && r.mode === "legacy" && r.tEnd != null) { pre = r.cart; if (!wasBrowse) this.finishRun(); else this.stopTimers(); }
      else this.stopTimers();
      var dropped = !!(r && r.mode === "ls" && !wasBrowse && r.t0 != null);
      var base = (my.has() ? my.data.menus : []).slice(), keys = base.map(specKey);
      (pre || []).forEach(function (x) { if (keys.indexOf(specKey(x)) < 0) { base.push(x); keys.push(specKey(x)); } }); // 방금 주문한 메뉴를 기존 단골 메뉴 뒤에 더함
      var menus = base.slice(0, 5).map(function (x) { var c = JSON.parse(JSON.stringify(x)); delete c.takeout; delete c.rep; c.qty = c.qty || 1; return c; });
      var prof = my.has() ? my.profile() : defaultProfile();
      this.begin("reg", true, { regMenus: menus, regPay: prof.pay === "prepaid" ? "card" : prof.pay, regTakeout: pre && pre.length && r.takeout != null ? r.takeout : prof.takeout, dropped: dropped, prefilled: !!(pre && pre.length) });
    },
    endReg: function () { this.stopTimers(); this.run = null; this.phase = "select"; this.render(); this.focusTop(); },
    reg: function (n) {
      var r = this.run, h = "", sel = r.regMenus;
      if (n === "rid") {
        h = this.head("단골메뉴 등록 1/3") + "<h2>본인 확인 · 휴대폰 번호</h2>" + this.phoneShow() +
          '<p class="kwarn">체험입니다. 실제 번호 대신 아무 숫자 8자리를 눌러 주세요. 번호는 화면에서 가려지고 저장·전송되지 않습니다. 실제 서비스에서는 이 단계에서 본인 확인과 개인정보 수집·이용 동의를 받습니다(방식은 설계 중).</p>' + this.keypad() +
          '<div class="kfoot"><button type="button" class="kb sec2" data-k="regCancel">취소</button><button type="button" class="kb acc" data-k="go" data-v="rmenu"' + (r.phone.length === 8 ? "" : " disabled") + ">다음</button></div>";
      } else if (n === "rmenu") {
        r.cat = r.cat || "rec";
        h = this.head("단골메뉴 등록 2/3") + '<h2>단골 메뉴를 골라 주세요 <small>(최대 5개)</small></h2><div class="kcats" role="group" aria-label="메뉴 분류">';
        M.categories.forEach(function (c) { h += '<button type="button" class="kb sec2" data-k="cat" data-v="' + c.id + '" aria-pressed="' + (r.cat === c.id) + '">' + esc(c.name) + "</button>"; });
        h += '</div><div class="kgrid">';
        M.items.filter(function (it) { return it.cat.indexOf(r.cat) >= 0; }).forEach(function (it) {
          var on = sel.some(function (m) { return m.itemId === it.id; });
          h += '<button type="button" class="kb kitem" data-k="rpick" data-v="' + it.id + '" aria-pressed="' + on + '"' + (!on && sel.length >= 5 ? " disabled" : "") + "><span>" + esc(it.name) + '</span><span class="pr">' + (on ? "✓ 담김" : it.price.toLocaleString() + "원") + "</span></button>";
        });
        h += '</div><div class="kcart"><b>나의 메뉴 ' + sel.length + "/5</b>" + (sel.length ? "<ul>" + sel.map(function (m, i) { return "<li>" + (i === 0 ? "★ " : "") + esc(describe(m, true)) + " × " + m.qty + "</li>"; }).join("") + "</ul>" : '<span class="small">아직 없습니다. 위에서 눌러 담으세요(다시 누르면 빠짐).</span>') +
          (sel.length >= 5 ? '<span class="small">5개를 다 담았습니다. 바꾸려면 담긴 메뉴를 다시 눌러 빼세요.</span>' : "") +
          '<span class="small">첫 메뉴가 대표 메뉴(★)입니다. 옵션은 기본값으로 담기며, 샷·당도 같은 세부 옵션은 웹 단골메뉴 등록에서 고칠 수 있습니다.</span>' +
          '<div class="kfoot"><button type="button" class="kb sec2" data-k="go" data-v="rid">이전</button><button type="button" class="kb acc" data-k="go" data-v="rpay"' + (sel.length ? "" : " disabled") + ">다음 (" + sel.length + "개)</button></div></div>";
      } else if (n === "rpay") {
        h = this.head("단골메뉴 등록 3/3") + "<h2>결제수단을 고르고 등록을 마치세요</h2>" +
          '<div class="kopt"><h3>평소 이용</h3><div class="krow" role="group" aria-label="매장/포장"><button type="button" class="kb sec2" data-k="rtake" data-v="true" aria-pressed="' + (r.regTakeout === true) + '">포장</button><button type="button" class="kb sec2" data-k="rtake" data-v="false" aria-pressed="' + (r.regTakeout === false) + '">매장에서</button></div>' +
          '<h3>결제수단</h3><div class="krow" role="group" aria-label="결제수단">' + ["card", "easy"].map(function (v) { return '<button type="button" class="kb sec2" data-k="rpay" data-v="' + v + '" aria-pressed="' + (r.regPay === v) + '">' + PAY[v] + "</button>"; }).join("") + "</div></div>" +
          '<p class="small" style="margin:0">카드번호는 받지 않습니다. 실제 서비스에서는 결제대행사가 보관하는 방식(빌링키)을 검토합니다. 적립은 스탬프로 기본 설정되며 웹에서 바꿀 수 있습니다.</p>' +
          '<div class="kfoot"><button type="button" class="kb sec2" data-k="go" data-v="rmenu">이전</button><button type="button" class="kb acc" data-k="rsave">등록하기</button></div>';
      } else if (n === "rdone") {
        h = this.head("등록 완료") + '<div class="kdone" style="padding:16px 0"><div class="big" aria-hidden="true">★</div><h2>단골 등록이 끝났습니다</h2><p>체험용 고객번호 <b class="num">' + esc(my.data && my.data.customerNo || "-") + "</b><br>다음부터 첫 화면에서 QR·고객번호로 확인하면<br>아래 메뉴가 바로 나옵니다.</p></div>" +
          '<div class="kcart" style="margin:0"><ul>' + sel.map(function (m, i) { return "<li>" + (i === 0 ? "★ " : "") + esc(describe(m, true)) + " × " + m.qty + "</li>"; }).join("") + "</ul>" + (r.saveMsg ? '<span class="small">' + esc(r.saveMsg) + "</span>" : "") + "</div>" +
          '<button type="button" class="kb acc" data-k="next">첫 화면으로 (이 메뉴로 단골 주문 해 보기)</button>';
      }
      return h;
    },
    regAct: function (k, v, b, now) {
      var r = this.run;
      if (k === "regCancel") { this.endReg(); return; }
      if (k === "digit" || k === "clear" || k === "bksp") { this.numKey("phone", 8, k, v); this.screen("rid"); this.refocus(k, v); }
      else if (k === "go") { this.screen(v); }
      else if (k === "cat") { r.cat = v; this.screen("rmenu"); this.refocus(k, v); }
      else if (k === "rpick") {
        var ix = -1; r.regMenus.forEach(function (m, i) { if (m.itemId === v) ix = i; });
        if (ix >= 0) r.regMenus.splice(ix, 1); else if (r.regMenus.length < 5) { var sp = defaultSpec(item(v)); delete sp.takeout; sp.qty = 1; r.regMenus.push(sp); }
        this.screen("rmenu"); this.refocus(k, v); announce("나의 메뉴 " + r.regMenus.length + "개");
      }
      else if (k === "rtake") { r.regTakeout = v === "true"; this.screen("rpay"); this.refocus(k, v); }
      else if (k === "rpay") { r.regPay = v; this.screen("rpay"); this.refocus(k, v); }
      else if (k === "rsave") {
        var d = my.data && my.data.menus ? JSON.parse(JSON.stringify(my.data)) : { alias: "나", store: M.stores[0].id, menus: [], regSeconds: null, lib: [] };
        d.menus = r.regMenus.map(function (m, i) { var c = JSON.parse(JSON.stringify(m)); c.rep = i === 0; c.qty = c.qty || 1; return c; });
        d.profile = profileOf(d); d.profile.pay = r.regPay; d.profile.takeout = r.regTakeout;
        d.alias = d.alias || "나";
        if (d.regSeconds == null && r.t0 != null) { d.regSeconds = Math.round((now - r.t0) / 100) / 10; d.regVia = "키오스크"; }
        d.done = true; d.menus.forEach(function (m) { my.addLib(d, m); });
        if (!d.customerNo) d.customerNo = String(100000 + Math.floor(Math.random() * 900000));
        d.savedAt = new Date().toISOString();
        if (store.set("ls_my", d)) { my.load(); this.reset(); this.notice = "단골 등록을 마쳤습니다. 이제 첫 화면의 [단골 주문]으로 방금 등록한 메뉴를 주문해 보세요."; }
        else { my.data = d; r.saveMsg = "이 브라우저에서는 저장할 수 없어(사생활 보호 모드 등) 이 화면에서만 보입니다."; }
        r.phone = ""; this.screen("rdone");
      }
    },
    payMethodButtons: function () { return '<div class="kmenu-list">' + ["card", "easy", "prepaid"].map(function (v) { return '<button type="button" class="kb" data-k="paym" data-v="' + v + '">' + PAY[v] + (v === "prepaid" ? "<small>장기 과제 미리보기</small>" : "") + "</button>"; }).join("") + "</div>"; },
    nextLabel: function () {
      if (this.browse) return "둘러보기 마치기";
      var other = this.runs[this.run.mode === "legacy" ? "ls" : "legacy"];
      return other && !other.stalled && !this.run.stalled ? "결과 보기" : "첫 화면으로";
    },
    modal: function (kind) {
      if (kind === "idle") {
        var d = document.createElement("div"); d.className = "kmodal"; d.setAttribute("role", "alertdialog"); d.setAttribute("aria-modal", "true"); d.setAttribute("aria-labelledby", "idleH");
        d.innerHTML = '<div class="box"><h2 id="idleH">계속하시겠어요?</h2><p>60초 넘게 입력이 없었습니다. 이번 기록은 비교에서 제외됩니다.</p><div class="kgrid"><button type="button" class="kb sec2" data-sys="quit">그만두기</button><button type="button" class="kb acc" data-sys="cont">계속하기</button></div></div>';
        this.k.appendChild(d); d.querySelector("[data-sys=cont]").focus();
      }
    },
    /* --- 키오스크 조작 --- */
    onKiosk: function (e) {
      var sys = e.target.closest("[data-sys]");
      if (sys) { var mm = sys.closest(".kmodal"); if (sys.getAttribute("data-sys") === "quit") { this.toSelect(); } else { mm.remove(); this.focusKiosk(); } return; }
      var b = e.target.closest("[data-k]"); if (!b || b.disabled) return;
      var r = this.run, k = b.getAttribute("data-k"), v = b.getAttribute("data-v"), now = performance.now();
      if (k === "next") { if (r.mode === "reg") this.endReg(); else this.finishRun(); return; }
      if (k === "regStart") { this.startReg(); return; }
      if (k === "general") { this.begin("legacy", this.browse, { viaLs: true }); return; }
      if (r.tApprove != null) return; // 승인 대기 중에는 입력 없음
      r.touches++;
      if ((r.mode === "ls" && r.screen === "who") || (r.mode === "legacy" && r.screen === "phone")) r.idTouches = (r.idTouches || 0) + 1;
      if (r.t0 == null) r.t0 = now;
      this.resetIdle();
      if (k === "back") { r.backs++; r.modal = null; if (v === "who") { r.phone = ""; r.cno = ""; r.tIdent = null; } this.screen(v); return; }
      if (k === "unpay") { if (r.mode === "legacy") { r.backs++; r.pay = null; } this.screen("paymethod"); return; }
      if (k === "paym") { r.pay = v; if (r.mode === "legacy") r.tConfirm = now; this.screen("pay"); return; }
      if (k === "paid") { this.approve(now); return; }
      if (r.mode === "legacy") this.legacyAct(k, v, b, now); else if (r.mode === "reg") this.regAct(k, v, b, now); else this.lsAct(k, v, b, now);
    },
    approve: function (now) {
      var self = this, r = this.run; r.tApprove = now; clearTimeout(this.idleT);
      this.screen("approve");
      this.apT = setTimeout(function () { if (self.run !== r) return; r.tEnd = performance.now(); self.screen("done"); }, approvalMs(r));
    },
    legacyAct: function (k, v, b, now) {
      var r = this.run;
      if (k === "takeout") { r.takeout = v === "true"; this.screen("menu"); }
      else if (k === "cat") { r.cat = v; r.page = 0; this.screen("menu"); }
      else if (k === "page") { r.page += +v; this.screen("menu"); }
      else if (k === "item") { r.spec = defaultSpec(item(v)); r.modal = "opt"; this.screen("menu"); var o = $("#optH"); if (o) { o.setAttribute("tabindex", "-1"); o.focus(); } if (r.screens.indexOf("option") < 0) r.screens.push("option"); }
      else if (k === "opt") { var key = b.getAttribute("data-o"); r.spec[key] = key === "shot" ? +v : v; this.screen("menu"); var f = $('#kiosk [data-o="' + key + '"][data-v="' + v + '"]'); if (f) f.focus(); }
      else if (k === "optCancel") { r.modal = null; this.screen("menu"); }
      else if (k === "optAdd") { var s = r.spec; s.qty = 1; var same = r.cart.filter(function (c) { return JSON.stringify(Object.assign({}, c, { qty: 0 })) === JSON.stringify(Object.assign({}, s, { qty: 0 })); })[0]; if (same) same.qty++; else r.cart.push(s); r.modal = null; this.screen("menu"); }
      else if (k === "checkout") { r.modal = "promo"; this.screen("menu"); if (r.screens.indexOf("promo") < 0) r.screens.push("promo"); var p = $("#promoH"); if (p) { p.setAttribute("tabindex", "-1"); p.focus(); } }
      else if (k === "promoSkip") { r.modal = null; this.screen("confirm"); }
      else if (k === "promoAdd") { r.promoAdded = true; var cr = defaultSpec(item("croffle")); cr.qty = 1; r.cart.push(cr); r.modal = null; this.screen("confirm"); }
      else if (k === "qty") { var i = +b.getAttribute("data-i"); r.cart[i].qty += +v; if (r.cart[i].qty <= 0) r.cart.splice(i, 1); this.screen("confirm"); }
      else if (k === "go") { this.screen(v); }
      else if (k === "cupT") { var ix = r.cups.indexOf(v); if (ix >= 0) r.cups.splice(ix, 1); else r.cups.push(v); this.screen("cup"); var c = $('#kiosk [data-v="' + v + '"]'); if (c) c.focus(); }
      else if (k === "stamp") { if (v === "phone") { r.tIdS = now; this.screen("phone"); } else { r.stamped = false; r.earn = "none"; r.usePt = "none"; this.screen("paymethod"); } }
      else if (k === "earn") { r.earn = v; this.screen("member"); this.refocus(k, v); }
      else if (k === "usept") { r.usePt = v; this.screen("member"); this.refocus(k, v); }
      else if (k === "digit" || k === "clear" || k === "bksp") { this.numKey("phone", 8, k, v); this.screen("phone"); this.refocus(k, v); }
      else if (k === "phoneOk") { r.tIdE = now; r.stamped = true; if (r.earn === "none") r.earn = "stamp"; this.screen("member"); }
    },
    lsAct: function (k, v, b, now) {
      var r = this.run;
      if (k === "idmode") { r.idMode = v; r.phone = ""; r.cno = ""; this.screen("who"); this.refocus(k, v); }
      else if (k === "digit" || k === "clear" || k === "bksp") {
        var field = (r.idMode || "cno") === "cno" ? "cno" : "phone", len = field === "cno" ? 6 : 8;
        this.numKey(field, len, k, v);
        if (r[field].length === len) { r.method = field; r.stamped = true; r.tIdent = now; this.screen("mymenu"); } else { this.screen("who"); this.refocus(k, v); }
      }
      else if (k === "tag") { r.method = "tag"; r.stamped = true; r.tIdent = now; this.screen("mymenu"); }
      else if (k === "lq") { var qi = +b.getAttribute("data-i"); r.qtys[qi] = Math.max(0, Math.min(9, r.qtys[qi] + +v)); this.screen("mymenu"); this.refocusI(k, qi, v); }
      else if (k === "order") {
        var prof = this.task().profile, ms = this.lsMenus();
        r.order = ms.map(function (x, i) { var c = JSON.parse(JSON.stringify(x)); c.qty = r.qtys[i]; return c; }).filter(function (c) { return c.qty > 0; });
        r.takeout = prof.takeout; r.pay = prof.pay; r.earn = prof.earn; r.usePt = prof.usePt; r.tConfirm = now; this.screen("pay");
      }
      else if (k === "go") { this.screen(v); }
    },
    refocusI: function (k, i, v) { var f = $('#kiosk [data-k="' + k + '"][data-i="' + i + '"][data-v="' + v + '"]'); if (f && !f.disabled) f.focus(); },
    refocus: function (k, v) { var f = $('#kiosk [data-k="' + k + '"]' + (v ? '[data-v="' + v + '"]' : "")); if (f) f.focus(); },
    numKey: function (field, len, k, v) {
      var r = this.run;
      if (k === "digit" && r[field].length < len) r[field] += v;
      else if (k === "clear") r[field] = "";
      else if (k === "bksp") r[field] = r[field].slice(0, -1);
    },
    /* --- 정확도 판정 --- */
    judge: function (r) {
      var t = this.task(), p = t.profile, why = [];
      var lines = r.mode === "legacy" ? r.cart : (r.order || []);
      if (!lines.length) why.push("주문 없음"); else why = why.concat(sameOrder(lines, t.menus));
      if (r.mode === "legacy" && r.promoAdded) why.push("광고 팝업 메뉴 추가");
      if (r.takeout !== p.takeout) why.push("매장/포장 다름");
      if (r.pay !== p.pay) why.push("결제수단 다름");
      if (r.earn !== p.earn) why.push("적립 방식 다름");
      if (r.usePt !== p.usePt) why.push("포인트·스탬프 사용 다름");
      return why;
    },
    finishRun: function () {
      var r = this.run; this.stopTimers();
      if (this.browse) { this.phase = "browseEnd"; this.render(); this.focusTop(); return; }
      r.why = this.judge(r);
      var otherMode = r.mode === "legacy" ? "ls" : "legacy", other = this.runs[otherMode];
      if (!other || other.stalled) this.first = r.mode; // 유효한 상대 기록이 없으면 이쪽이 '먼저'
      this.runs[r.mode] = r;
      if (!r.stalled && other && !other.stalled) { this.phase = "result"; this.save(); }
      else this.phase = "select";
      this.render(); this.focusTop();
    },
    focusTop: function () { var h = $("#tryRoot h2"); if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); } window.scrollTo(0, 0); },
    toSelect: function () { this.stopTimers(); this.run = null; this.phase = "select"; this.render(); this.focusTop(); },
    save: function () {
      var a = this.runs.legacy, b = this.runs.ls;
      var hist = store.get("ls_runs", []), d = new Date();
      hist.push({ id: Math.random().toString(36).slice(2, 10), date: d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2) + " " + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2),
        first: this.first, legacy: +s1(tTot(a)), ls: +s1(tTot(b)), legacyEx: +s1(tOrd(a)), lsEx: +s1(tOrd(b)), lsConfirm: +s1(b.tConfirm - b.t0), approvalSec: [apSec(a.pay), apSec(b.pay)], end: "결제 승인 완료",
        method: { phone: "휴대폰 번호", cno: "고객번호", tag: "QR·태그" }[b.method],
        touches: [a.touches, b.touches], screens: [a.screens.length, b.screens.length], backs: [a.backs, b.backs], ok: [!a.why.length, !b.why.length],
        senior: !!prefs.big, device: window.innerWidth < 760 ? "모바일" : "PC" });
      store.set("ls_runs", hist.slice(-10));
    },
    resultView: function () {
      var a = this.runs.legacy, b = this.runs.ls, h = "";
      var ta = tTot(a) / 1000, tb = tTot(b) / 1000, ea = tOrd(a) / 1000, eb = tOrd(b) / 1000, t0 = F.target;
      function idSec(r) { return r.mode === "ls" ? (r.tIdent - r.t0) / 1000 : (r.tIdS != null && r.tIdE != null ? (r.tIdE - r.tIdS) / 1000 : 0); }
      var xa = ta - idSec(a), xb = tb - idSec(b);
      h += '<div class="result"><h2>내 체험 기록 <span class="chip t-mine">내 체험 기록</span></h2>';
      h += "<p>순서: <b>" + (this.first === "legacy" ? "현행 키오스크 먼저 → 리틀스타" : "리틀스타 먼저 → 현행 키오스크") + "</b> (직접 선택). 두 번째 쪽은 메뉴를 이미 알아 조금 유리할 수 있습니다.</p>";
      function hl(title, sub, va, vb, tgt, sub2) {
        var m2 = Math.max(va, vb, 0.1);
        return '<div class="hl"><h3>' + title + ' <span class="small muted">' + sub + '</span></h3><div class="bars" role="img" aria-label="' + title + ': 현행 ' + va.toFixed(1) + '초, 리틀스타 ' + vb.toFixed(1) + '초">' +
          '<div class="barrow"><span>현행</span><div class="bar legacy" style="width:' + (va / m2 * 100) + '%"></div><span class="sec-v">' + va.toFixed(1) + '초</span></div>' +
          '<div class="barrow"><span>리틀스타</span><div class="bar" style="width:' + (vb / m2 * 100) + '%"></div><span class="sec-v">' + vb.toFixed(1) + '초</span></div></div>' +
          (sub2 || "") + (tgt ? '<p class="small muted" style="margin:4px 0 0">리틀스타 목표 ' + tgt + '초 <span class="chip t-target">목표</span> · 내 기록 ' + (vb <= tgt ? '<span class="ok">이내</span>' : '초과') + '</p>' : '') + '</div>';
      }
      h += '<div class="hl-grid">' + hl("첫 터치~결제 승인 완료", "승인 대기(가정) 포함", ta, tb, t0.withPayment, '<p class="small" style="margin:6px 0 0">승인 대기 제외(결제 버튼까지): 현행 <b>' + ea.toFixed(1) + '초</b> · 리틀스타 <b>' + eb.toFixed(1) + '초</b></p>') + hl("식별 제외 구간", "번호 입력·QR 시간을 뺀 나머지", xa, xb, 0) + '</div>';
      h += '<p class="small muted">현장 실측 21건(평균 ' + F.field.mean + '초)은 첫 터치~결제 완료(결제 완료 화면 또는 카드 회수)까지 잰 값이라 승인 시간이 들어 있습니다. 실측과는 위의 전체 시간으로 비교하세요. 승인 대기 제외 시간은 화면 조작만 보려는 보조 값입니다.</p>';
      h += '<div class="note"><b>비교의 핵심은 시간보다 아래 표의 터치 수·화면 수·식별 외 구간입니다.</b> 체험 시간은 마우스 조작과 처음 보는 화면을 찾는 시간이 섞여 있어 실제 매장에서 익숙한 손님이 누르는 시간보다 길게 나옵니다. 실제 매장 측정값이 아니며, 승인 대기는 결제수단별 가정값(' + apTxt() + ')이고 음료 제조 시간은 넣지 않았습니다.</div>';
      function okc(r) { return r.why.length ? '<span class="bad">✘ 불일치</span> <span class="small">(' + esc(r.why.join(", ")) + ")</span>" : '<span class="ok">✔ 일치</span>'; }
      h += '<div class="tbl-wrap"><table class="rtbl"><caption class="sr">체험 상세</caption><thead><tr><th scope="col">항목</th><th scope="col">현행</th><th scope="col">리틀스타</th></tr></thead><tbody>' +
        '<tr><th scope="row">터치 수(전체)</th><td><b>' + a.touches + "회</b></td><td><b>" + b.touches + "회</b></td></tr>" +
        '<tr><th scope="row">└ 식별 입력<br><span class="small muted">번호 입력·QR</span></th><td>' + (a.idTouches || 0) + "회</td><td>" + (b.idTouches || 0) + "회</td></tr>" +
        '<tr><th scope="row">└ 식별 외 터치</th><td><b>' + (a.touches - (a.idTouches || 0)) + "회</b></td><td><b>" + (b.touches - (b.idTouches || 0)) + "회</b></td></tr>" +
        '<tr><th scope="row">거친 화면</th><td><b>' + a.screens.filter(function (x) { return x !== "approve" && x !== "done"; }).length + "개</b></td><td><b>" + b.screens.filter(function (x) { return x !== "approve" && x !== "done"; }).length + "개</b></td></tr>" +
        '<tr><th scope="row">고객 식별 방법</th><td>' + (a.stamped ? "휴대폰 번호 8자리(맨 끝)" : "식별 안 함") + "</td><td>" + { phone: "휴대폰 번호 8자리", cno: "고객번호 6자리", tag: "QR·휴대폰 태그" }[b.method] + "(맨 앞)</td></tr>" +
        '<tr><th scope="row">첫 터치~결제 승인 완료</th><td>' + ta.toFixed(1) + "초</td><td>" + tb.toFixed(1) + "초</td></tr>" +
        '<tr><th scope="row">└ 식별에 쓴 시간</th><td>' + idSec(a).toFixed(1) + "초</td><td>" + idSec(b).toFixed(1) + "초</td></tr>" +
        '<tr><th scope="row">└ 식별 제외 구간</th><td>' + xa.toFixed(1) + "초</td><td>" + xb.toFixed(1) + "초</td></tr>" +
        '<tr><th scope="row">└ 승인 대기 <span class="chip t-assume">가정</span></th><td>' + s1(a.tEnd - a.tApprove) + "초<br><span class=\"small muted\">" + PAY[a.pay] + "</span></td><td>" + s1(b.tEnd - b.tApprove) + "초<br><span class=\"small muted\">" + PAY[b.pay] + "</span></td></tr>" +
        '<tr><th scope="row">승인 대기 제외</th><td>' + ea.toFixed(1) + "초</td><td>" + eb.toFixed(1) + "초</td></tr>" +
        '<tr><th scope="row">뒤로가기</th><td>' + a.backs + "회</td><td>" + b.backs + "회</td></tr>" +
        '<tr><th scope="row">주문 정확도</th><td>' + okc(a) + "</td><td>" + okc(b) + "</td></tr></tbody></table></div>";
      h += '<p class="small muted">현행의 \'식별에 쓴 시간\'은 번호 입력 화면을 연 순간부터 [확인]까지입니다. 리틀스타는 첫 터치부터 번호 마지막 자리(또는 QR)까지입니다.</p>';
      h += this.lsBreakdown(b);
      var reg = my.has() && my.data.regSeconds != null ? my.data.regSeconds : null;
      h += '<p class="note">' + (reg != null ? "리틀스타는 처음 한 번 메뉴를 등록해야 합니다. <b>최초 1회 등록 " + reg.toFixed(1) + "초</b>(이후 주문부터 생략)." : "이번 리틀스타 체험은 데모 고객 메뉴로 했습니다. 실제로는 처음 한 번 메뉴 등록이 필요하며, <a href=\"#my-menu\">단골메뉴 등록</a>을 해 보면 등록 시간도 함께 보여 드립니다.") + "</p>";
      h += '<p class="small muted">승인 대기 근거: ' + esc(F.payment.basis) + ". " + esc(F.payment.ref) + "</p></div>";
      var f = F.field, m = F.mock, t = F.target;
      h += '<div class="result"><h2>참고 <small class="muted">(내 기록과 조건이 다른 값)</small></h2><ul class="ticks">' +
        '<li><span class="chip t-field">현장 실측</span> 기존 키오스크 평균 ' + f.mean + "초 · 중앙값 " + f.median + "초 <span class=\"small muted\">(실매장 " + f.stores + "곳 " + f.n + "건, " + f.period + ", 피크타임 단독 손님, 실제 결제 포함)</span></li>" +
        '<li><span class="chip t-mock">모의 테스트</span> 대표 1인 시연 기록: 기존 ' + m.legacy + "초 / 리틀스타 (" + m.littlestarNote + ")</li>" +
        '<li><span class="chip t-target">목표</span> 리틀스타 식별~주문확정 ' + t.identToConfirm + "초, 결제 포함 " + t.withPayment + "초 이내 <span class=\"small muted\">(프로토타입 실측으로 검증 예정)</span></li></ul>" +
        '<details><summary>측정 조건 자세히 보기</summary><div data-cmp="full"></div></details></div>';
      h += '<div class="cta-row"><button type="button" class="btn primary" data-t="again">순서 바꿔 다시</button><a class="btn" href="#my-menu">내 단골메뉴 등록</a><button type="button" class="btn ghost" data-t="reset">처음으로</button></div>';
      return h;
    },
    lsBreakdown: function (b) {
      var t = F.target, idS = (b.tIdent - b.t0) / 1000, ordS = (b.tConfirm - b.tIdent) / 1000, payS = (b.tApprove - b.tConfirm) / 1000, tot = tTot(b) / 1000, apS = (b.tEnd - b.tApprove) / 1000, conf = (b.tConfirm - b.t0) / 1000;
      var nKeys = { phone: "숫자 8개", cno: "숫자 6개", tag: "버튼 1회" }[b.method], baseN = { phone: 8, cno: 6, tag: 1 }[b.method];
      if ((b.idTouches || 0) > baseN) nKeys += " + 번호 종류 전환·수정 " + ((b.idTouches || 0) - baseN) + "회";
      var extra = b.touches - (b.idTouches || 0) - 2;
      var rows = [["① 고객 식별", nKeys + " (첫 터치에서 시간 시작)", idS], ["② 나의 메뉴 확인 → 주문하기", "1회" + (extra > 0 ? " + 수량 조절 등 " + extra + "회" : ""), ordS], ["③ 결제하기(등록 결제수단 자동 선택)", "1회", payS], ["④ 결제 승인 대기(" + PAY[b.pay] + ")", "가정 " + apSec(b.pay).toFixed(1) + "초", apS]];
      var h = '<h3 style="margin:16px 0 6px">리틀스타 구간별 시간 <span class="small muted">(어디서 시간이 걸렸나)</span></h3><div class="tbl-wrap"><table class="rtbl"><thead><tr><th scope="col">구간</th><th scope="col">터치</th><th scope="col">내 기록</th></tr></thead><tbody>';
      rows.forEach(function (x) { h += '<tr><th scope="row">' + x[0] + "</th><td>" + x[1] + "</td><td>" + x[2].toFixed(1) + "초</td></tr>"; });
      h += '<tr><th scope="row">①~② 첫 터치~주문하기</th><td></td><td><b>' + conf.toFixed(1) + '초</b> <span class="small ' + (conf <= t.identToConfirm ? "ok" : "muted") + '">목표 ' + t.identToConfirm + "초 " + (conf <= t.identToConfirm ? "이내" : "초과") + "</span></td></tr>";
      h += '<tr><th scope="row">합계(결제 승인 완료까지)</th><td>' + b.touches + "회</td><td><b>" + tot.toFixed(1) + '초</b> <span class="small ' + (tot <= t.withPayment ? "ok" : "muted") + '">목표 ' + t.withPayment + "초 " + (tot <= t.withPayment ? "이내" : "초과") + "</span></td></tr></tbody></table></div>";
      h += '<p class="small muted">식별 이후에는 메뉴 탐색·옵션·광고·일회용품·적립 번호 입력이 없고, 터치는 [주문하기]와 [결제하기] 2회입니다. 시간은 직접 누른 기록이라 손 빠르기와 기기(마우스·터치)에 따라 달라집니다. 목표는 설계 목표이며 실측이 아닙니다.</p>';
      return h;
    },
    browseEndView: function () {
      var o = this.run.mode === "legacy" ? "ls" : "legacy";
      return '<div class="result"><h2>둘러보기를 마쳤습니다</h2><p>둘러보기는 시간을 재지 않았고 기록도 남기지 않았습니다.</p><div class="cta-row"><button type="button" class="btn" data-t="browse" data-v="' + o + '">' + MODE_NAME[o] + ' 둘러보기</button><button type="button" class="btn primary" data-t="back">첫 화면으로</button></div></div>';
    },
    onClick: function (e) {
      if (e.target.closest("#kiosk")) { this.onKiosk(e); return; }
      var b = e.target.closest("[data-t]"); if (!b) return;
      var a = b.getAttribute("data-t");
      if (a === "start" || a === "browse") { var md = b.getAttribute("data-v"); this.begin(md, a === "browse", md === "legacy" ? { viaLs: true } : null); }
      else if (a === "reg") this.startReg();
      else if (a === "back") this.toSelect();
      else if (a === "reset") { this.reset(); this.toSelect(); }
      else if (a === "again") { var f = this.first === "legacy" ? "ls" : "legacy"; this.reset(); this.suggest = f; this.toSelect(); }
      else if (a === "suggest") { this.suggest = Math.random() < 0.5 ? "legacy" : "ls"; this.render(); var s = $("#tryRoot .suggested"); if (s) s.focus(); }
    }
  };
  $("#tryRoot").addEventListener("click", function (e) { tryp.onClick(e); });
  // PC: 숫자판 화면에서 키보드 숫자키·백스페이스를 숫자판 버튼과 똑같이 처리(두 키오스크 공통)
  document.addEventListener("keydown", function (e) {
    if (tryp.phase !== "run" || !tryp.k || e.altKey || e.ctrlKey || e.metaKey) return;
    if (e.target && /INPUT|TEXTAREA|SELECT/.test(e.target.tagName)) return;
    var sel = /^[0-9]$/.test(e.key) ? '[data-k="digit"][data-v="' + e.key + '"]' : e.key === "Backspace" ? '[data-k="bksp"]' : null;
    var btn = sel && tryp.k.querySelector(sel);
    if (btn && !btn.disabled) { e.preventDefault(); btn.click(); }
  });
  // 결과 화면 안의 비교 블록도 같은 부품으로 그림
  new MutationObserver(function () { $$("#tryRoot [data-cmp]:not(.cmp)").forEach(renderCmp); }).observe($("#tryRoot"), { childList: true, subtree: true });

  /* =====================================================================
   * 라우터 (#/, #/try, #/my-menu, #/compare, #/investor)
   * ===================================================================== */
  var route = "home";
  var TITLES = { home: "리틀스타 · 소개", "try": "리틀스타 · 주문 순서 비교 체험", "my-menu": "리틀스타 · 단골메뉴 등록", compare: "리틀스타 · 주문 절차 비교" };
  function go() {
    var h = location.hash.replace(/^#\/?/, ""), scrollTo = null; if (h === "home") h = "";
    if (h === "investor") { h = ""; scrollTo = "investor"; }
    var r = { "": "home", "try": "try", "my-menu": "my-menu", compare: "compare" }[h];
    if (!r) return; // #contact-pending 등은 무시
    var first = route === null, changed = r !== route; route = r;
    if (r !== "try" && tryp.phase === "run") { tryp.stopTimers(); tryp.run = null; tryp.phase = "select"; }
    $$(".page").forEach(function (p) { p.hidden = p.getAttribute("data-page") !== r; });
    $$("[data-route]").forEach(function (a) { if (a.getAttribute("data-route") === r) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); });
    document.title = TITLES[r];
    if (r === "try") { if (tryp.phase !== "run") { tryp.phase = tryp.phase === "result" && !changed ? "result" : "select"; } tryp.render(); }
    if (r === "my-menu") { my.edit = false; my.msg = ""; my.render(); }
    if (scrollTo) { var el = document.getElementById(scrollTo); if (el) { el.setAttribute("tabindex", "-1"); el.scrollIntoView(); el.focus({ preventScroll: true }); } }
    else if (changed && !first) { window.scrollTo(0, 0); var hh = $('.page[data-page="' + r + '"] h1'); if (hh) { hh.setAttribute("tabindex", "-1"); hh.focus({ preventScroll: true }); } }
  }
  window.addEventListener("hashchange", go);
  route = null; go();
})();
