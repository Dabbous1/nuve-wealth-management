export type ArticleRelated = {
  ticker: string;
  name: string;
  change: number;
};

export type Article = {
  id: string;
  time: string;
  source: string;
  author: string;
  title: string;
  titleAr: string;
  summary: string;
  summaryAr: string;
  readTime: string;
  tag: string;
  isReport: boolean;
  body: string[];
  bodyAr: string[];
  related: ArticleRelated[];
};

export const ARTICLES: Article[] = [
  {
    id: '1',
    time: '10 min ago',
    source: 'Acumen Research',
    author: 'Acumen Research Team',
    title: 'Banking Sector Outlook: Q2 2026',
    titleAr: 'توقعات القطاع المصرفي: الربع الثاني 2026',
    summary: 'Egyptian banks enter Q2 2026 with strong capital buffers and improving net interest margins, supported by the high-rate environment and recovering domestic credit demand.',
    summaryAr: 'تدخل البنوك المصرية الربع الثاني من عام 2026 بأحتياطيات رأسمالية قوية وهوامش فائدة صافية متحسنة.',
    readTime: '8 min',
    tag: 'Banking',
    isReport: true,
    body: [
      'Egyptian banks are entering Q2 2026 with robust capital adequacy ratios and expanding net interest margins, underpinned by the Central Bank of Egypt\'s current monetary policy stance. The sector continues to benefit from elevated lending rates while deposit costs remain relatively contained.',
      'Credit growth is projected to accelerate at 18–22% year-on-year through 2026, driven primarily by corporate lending in construction, infrastructure, and energy sectors. Retail credit expansion is also gaining momentum as consumer confidence improves alongside easing inflation.',
      'Commercial International Bank (COMI) remains our top pick in the sector, with a target price of EGP 92 over the next 12 months, implying a 17% upside from current levels. The bank\'s digital transformation initiative is expected to reduce operating costs by approximately 8% annually.',
      'Banque du Caire and QNB Egypt are also well-positioned for margin expansion, though their smaller balance sheets limit the magnitude of earnings upside relative to the larger private banks.',
      'Key risks to our outlook include a faster-than-expected rate cut cycle, deterioration in asset quality within the SME segment, and potential currency volatility tied to Egypt\'s IMF programme review milestones.',
      'We maintain an Overweight stance on the Egyptian banking sector for Q2 2026, with a preference for liquid, large-cap names offering defensive dividend yields in the 4–6% range.',
    ],
    bodyAr: [
      'تدخل البنوك المصرية الربع الثاني من عام 2026 بنسب كفاية رأس مال قوية وهوامش صافية للفائدة متوسعة، مدعومة بموقف السياسة النقدية للبنك المركزي المصري.',
      'من المتوقع أن ينمو الائتمان بنسبة 18-22% سنوياً طوال عام 2026، مدفوعاً بالإقراض للشركات في قطاعات البناء والبنية التحتية والطاقة.',
      'يظل البنك التجاري الدولي (COMI) اختيارنا الأول في القطاع، بسعر مستهدف يبلغ 92 جنيهاً مصرياً على مدى 12 شهراً.',
    ],
    related: [
      { ticker: 'COMI', name: 'Commercial International Bank', change: 2.4 },
      { ticker: 'QNBE', name: 'QNB Egypt', change: 0.9 },
      { ticker: 'BCWE', name: 'Banque du Caire', change: 1.1 },
    ],
  },
  {
    id: '2',
    time: '2 hrs ago',
    source: 'Market Update',
    author: 'Market Desk',
    title: 'EGX30 closes 1.2% higher on strong earnings season',
    titleAr: 'مؤشر EGX30 يرتفع 1.2% مع موسم أرباح قوي',
    summary: 'The EGX30 index ended the session at 32,450 points, gaining 388 points as blue-chip companies reported earnings above analyst expectations for the third consecutive quarter.',
    summaryAr: 'أغلق مؤشر EGX30 عند 32,450 نقطة، مرتفعاً 388 نقطة بعد إعلان شركات كبرى عن أرباح تفوق توقعات المحللين.',
    readTime: '3 min',
    tag: 'Market',
    isReport: false,
    body: [
      'Egypt\'s benchmark EGX30 index closed Tuesday\'s session at 32,450 points, up 1.2% from Monday\'s close of 32,062 points. The rally was broad-based, with 22 of the 30 index constituents ending the session in positive territory.',
      'The move was driven primarily by strong Q1 2026 earnings releases from heavyweight components including Commercial International Bank, Talaat Moustafa Group, and Eastern Company, all of which reported net profits above the consensus analyst estimates.',
      'Trading volumes reached EGP 4.8 billion, the highest in three weeks, signalling renewed institutional appetite for Egyptian equities. Foreign investors were net buyers, adding approximately EGP 680 million on the session.',
      'The Egyptian pound remained stable against the US dollar at approximately EGP 49.20, providing a supportive backdrop for equity valuations. Market participants are increasingly pricing in a potential CBE rate cut of 150–200 basis points at the June meeting.',
      'Analysts caution that while the near-term momentum is positive, stretched valuations in select industrial and consumer names warrant selective positioning. The EGX30\'s trailing P/E of 9.2x remains below its five-year average of 10.8x, offering room for further re-rating.',
    ],
    bodyAr: [
      'أغلق مؤشر EGX30 القياسي المصري يوم الثلاثاء عند 32,450 نقطة، بارتفاع 1.2% عن إغلاق الإثنين.',
      'جاءت الحركة مدفوعة بنتائج أرباح قوية لبنك CIB ومجموعة طلعت مصطفى والشركة الشرقية.',
      'بلغت أحجام التداول 4.8 مليار جنيه مصري، الأعلى في ثلاثة أسابيع.',
    ],
    related: [
      { ticker: 'EGX30', name: 'EGX30 Index', change: 1.2 },
      { ticker: 'COMI', name: 'Commercial International Bank', change: 2.4 },
      { ticker: 'TMGH', name: 'Talaat Moustafa Group', change: 1.8 },
    ],
  },
  {
    id: '3',
    time: '1 day ago',
    source: 'Acumen Research',
    author: 'Acumen Research Team',
    title: 'Real Estate Fund Strategy: Inflation Hedge',
    titleAr: 'استراتيجية صندوق العقارات: التحوط من التضخم',
    summary: 'Egyptian real estate remains a compelling inflation hedge in 2026, with commercial and mixed-use developments outperforming residential assets. Acumen\'s RE Fund targets a 14–18% annual return.',
    summaryAr: 'تظل العقارات المصرية وسيلة تحوط مقنعة ضد التضخم في 2026، مع تفوق المشاريع التجارية والمختلطة على الأصول السكنية.',
    readTime: '12 min',
    tag: 'Real Estate',
    isReport: true,
    body: [
      'Egypt\'s real estate market has demonstrated remarkable resilience in the face of inflationary pressures, emerging as one of the preferred asset classes for both retail and institutional investors seeking to preserve capital in real terms. Property values in key New Cairo and New Administrative Capital corridors rose 28–35% in EGP terms over the past 12 months.',
      'The Acumen Real Estate Fund (AREF) maintains a diversified portfolio spanning commercial offices, logistics warehouses, and mixed-use developments. This strategy has allowed the fund to capture the strongest segments of Egyptian real estate demand while avoiding the margin compression seen in the residential off-plan market.',
      'Commercial real estate, in particular, stands out as the most attractive sub-segment. Occupancy rates in Grade A office buildings in New Cairo have reached 94%, driving rental yields of 10–12% annually. The shortage of high-quality logistics space — a direct consequence of Egypt\'s e-commerce growth — is producing yields of 13–15% for modern warehouse assets.',
      'The fund\'s USD-denominated component, representing approximately 30% of assets, provides a structural hedge against potential pound depreciation and benefits from Egypt\'s improved current account dynamics post-IMF programme.',
      'AREF targets a gross annual return of 14–18% over a 5-year investment horizon, with quarterly distributions to unit holders. The minimum subscription is EGP 50,000, and the fund is fully FRA-regulated under the Capital Market Authority framework.',
      'Investors should note that real estate funds carry liquidity risk relative to listed equities, and the fund operates with a 12-month lock-up period for new subscriptions. However, a secondary market exists for fund units via Acumen\'s brokerage platform, providing a reasonable exit mechanism.',
      'We recommend an allocation of 10–15% of a balanced portfolio to the AREF, particularly for investors in the 35–55 age bracket seeking capital preservation alongside income generation in excess of prevailing bank deposit rates.',
    ],
    bodyAr: [
      'أظهر سوق العقارات المصري مرونة ملحوظة في مواجهة ضغوط التضخم، وبرز كأحد فئات الأصول المفضلة للمستثمرين.',
      'يحتفظ صندوق عقارات أكيومن (AREF) بمحفظة متنوعة تشمل المكاتب التجارية والمستودعات اللوجستية.',
      'تستهدف الحصة العقارية التجارية عوائد إيجارية بنسبة 10-12% سنوياً مع معدل إشغال 94%.',
      'يستهدف الصندوق عائداً سنوياً إجمالياً يتراوح بين 14-18% على مدى 5 سنوات.',
    ],
    related: [
      { ticker: 'AREF', name: 'Acumen Real Estate Fund', change: 0.6 },
      { ticker: 'TMGH', name: 'Talaat Moustafa Group', change: 1.8 },
      { ticker: 'MNHD', name: 'Madinet Nasr Housing', change: -0.4 },
    ],
  },
];
