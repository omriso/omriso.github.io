(function (root) {
  "use strict";

  // Hebrew-to-English substitutions, indexed by אבגדהוזחטיכלמנסעפצקרשת.
  // Keys are numbered by solve order, independently of the final code order.
  // Each key supplies three letters, covering א–ש; the final codes never use ת.
  const keys = [
    "HVOPNULGDMFCBYZWKSTJXE", // 1: א–ג → HVO (opening puzzle)
    "CXDJUSYZEWOTKGNLPVHFMB", // 2: ד–ו → JUS (Paris and Rome, VUSH)
    "UPWHGDCFEOMJXZKNLVTSBY", // 3: ז–ט → CFE (gift riddle, BPKB); מ → X, ת → Y, נ → Z
    "CPTJUOSEYKXLGZWVDHBMFN", // 4: י–ל → KXL (atmosphere riddle, LCT)
    "LSGNHOVDUPJETBMYFZKXCW", // 5: מ–ס → TBM (Sinai passage, KWTG)
    "BUVEJDNOHZTFWSLGYPCMXK", // 6: ע–צ → GYP (mirror riddle, VSE)
    "DLBCTKMPXEVUYGFJOSZWNH"  // 7: ק–ש → ZWN (final riddle, KLN); ת → H is not contributed
  ];
  const eighthKey = "HVOJUSCFEKXLTBMGYPZWND";
  const codes = ["LCT", "VSE", "BPKB", "KLN", "VUSH", "KWTG"];

  // Put code pages at the site root as CODE.html to serve them at /CODE.
  // Each clue must contain its contributed Hebrew letters so they can be solved.
  // source is the editable entry code; target is fixed by the physical clue.
  // null source means the opening page; null target means the final riddle.
  // Routing constraints and the full sequence are documented in docs/cipher-riddles.md.
  const levels = {
    first: {
      id: "first-key-v2",
      source: null,
      target: "VUSH",
      key: keys[0],
      text: "מפתח שמיני מורכב משבעה מפתחות.\nהקודים לשישה מפתחות מוחבאים על פתקים בביתך.\nהחמישי, שמורכב מארבע אותיות, מוחבא בשק השלישי (שלא הגיע עם שתי הכריות).\nזה כמובן, מפתח מספר אחת!",
      boldWords: ["שמיני", "משבעה", "לשישה", "החמישי", "מארבע", "השלישי", "שתי", "אחת"]
    },
    vush: {
      id: "vush-v5",
      source: "VUSH",
      target: "BPKB",
      key: keys[1],
      text: "🎶 היינו בפריז וגם ברומא... 🎶\nאבל שם לא פגשנו את אבא או רון.\nהקוד הבא מסתתר יחד איתם, מאחורי נוף משגע."
    },
    gift: {
      id: "gift-v3",
      source: "BPKB",
      target: "LCT",
      key: keys[2],
      text: "אמא שלי חשבה עלינו, ונתנה לנו מתנה. זו יצירה שאנחנו אוהבים מאוד, אבל המתנה ניתנה קצת באיחור, ולכן כמעט לא השתמשנו בה.\nבכל זאת, בתוכה נמצא הקוד הבא, במספר בעל משמעות לשנינו. (הידעת - הקוקטייל בכלל לא קשור לפיצה, הוא מטקסס או מקסיקו, והיא על שם מלכה (אחרת מזו שמוזכרת ביצירה, אבל עם שם דומה))"
    },
    atmosphere: {
      id: "atmosphere-v3",
      source: "LCT",
      target: "KWTG",
      key: keys[3],
      text: "יש בבית זיכרונות שצברנו משנה לשנה ויש דברים שקשורים לשינה. הקוד הבא מוחבא מתחת למכשיר משונה, שביכולתו לשנות את האווירה בלחיצת כפתור. (בהתחלה החידה הייתה אמורה להיות מבוססת פינק-פלויד, אבל שיניתי אותה)"
    },
    sinai: {
      id: "sinai-v2",
      source: "KWTG",
      target: "VSE",
      key: keys[4],
      text: "כט\nויהי ברדת משה מהר סיני ושני לחת העדת ביד־משה ברדתו מן־ההר ומשה לא־ידע כי קרן עור פניו בדברו אתו׃\nל\nוירא אהרן וכל־בני ישראל את־משה והנה קרן עור פניו וייראו מגשת אליו׃\nלא\nויקרא אלהם משה וישבו אליו אהרן וכל־הנשאים בעדה וידבר משה אלהם׃"
    },
    mirror: {
      id: "mirror-v1",
      source: "VSE",
      target: "KLN",
      key: keys[5],
      text: "אתה חתיך ויפה! אני אוהב את האף שלך ואת העיניים שלך. אני אוהב את הלחיים שלך ואת החיוך שלך. יש מקום בבית שגם אתה יכול לראות את זה! בעצם די הרבה פעמים... בצד שמאל מתחת למשהו מוחבא מה שאתה מחפש."
    },
    kwtg: {
      id: "kwtg-v2",
      source: "KLN",
      target: null,
      key: keys[6],
      text: "כל הכבוד!!\nאיך מורכב המפתח השמיני?\nהאותיות א-ג מותאמות לפי המפתח הראשון ששברת,\nהאותיות ד-ו מהמפתח השני וכך עד האותיות ק-ש, שמותאמות לפי המפתח הזה!\nמה יוצא שהקודים אומרים?"
    }
  };

  const api = { keys, eighthKey, codes, levels };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.CipherLevels = api;
})(typeof window !== "undefined" ? window : globalThis);
