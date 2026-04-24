import { useNavigate } from "react-router-dom";
import { SiteFooter } from "../components/SiteFooter";

const FEATURES = [
  {
    title: "阶段目标",
    desc: "按学期、学科与兴趣设定目标，和计划对齐，随时查看完成度。",
    icon: "◎",
  },
  {
    title: "周任务拆解",
    desc: "把大目标拆成可执行的每日任务，支持打卡与逾期标记。",
    icon: "▦",
  },
  {
    title: "成长档案",
    desc: "成绩、老师反馈与观察笔记结构化沉淀，可按科目与时间筛选。",
    icon: "◇",
  },
  {
    title: "风险提醒",
    desc: "逾期、成绩波动与目标偏离等信号自动提示，减少遗漏。",
    icon: "⚠",
  },
  {
    title: "家庭看板",
    desc: "多孩家庭一眼看到今日重点、风险排序与本周完成率。",
    icon: "▣",
  },
  {
    title: "AI 辅助（可选）",
    desc: "从目标生成任务草稿，确认后再落库，家长始终掌握决定权。",
    icon: "✦",
  },
];

const QUOTES = [
  {
    text: "以前作业、群消息、卷子到处散，现在在一个地方就能安排一周，心里踏实多了。",
    name: "李女士",
    role: "二孩家长 · 小学",
  },
  {
    text: "目标和每天任务连起来了，终于不用只靠脑子记，期末前也能看出弱科。",
    name: "张先生",
    role: "初中生家长",
  },
  {
    text: "看板上的风险提示很直接，知道今晚该盯哪一科，比一堆图表有用。",
    name: "王女士",
    role: "小学高年级家长",
  },
];

export function HomePage() {
  const nav = useNavigate();
  const goWorkspace = () => nav("/workspace");

  return (
    <div className="landing">
      <section className="hero">
        <div className="hero-inner">
          <p className="hero-eyebrow">家庭教育 · 从忙乱到可控</p>
          <h1 className="hero-title">
            更有把握地
            <br />
            陪伴孩子成长
          </h1>
          <p className="hero-lead">
            把信息、目标与执行串成一条清晰路径：先看今天该做什么，再记录反馈、看见趋势。适合重视学业与综合发展的家庭。
          </p>
          <div className="hero-actions">
            <button type="button" className="btn btn-primary btn-lg" onClick={goWorkspace}>
              免费开始使用
            </button>
            <a className="btn btn-ghost btn-lg" href="#features">
              了解功能
            </a>
          </div>
        </div>
      </section>

      <section className="section" id="features">
        <div className="section-inner">
          <h2 className="section-title">成长路上，你需要的都在这里</h2>
          <p className="section-subtitle">围绕「目标 → 计划 → 任务 → 记录 → 复盘」设计的管理工具，不是题库，也不是上课平台。</p>
          <div className="feature-grid">
            {FEATURES.map((f) => (
              <article key={f.title} className="feature-card">
                <div className="feature-icon" aria-hidden>
                  {f.icon}
                </div>
                <h3 className="feature-title">{f.title}</h3>
                <p className="feature-desc">{f.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-alt" id="testimonials">
        <div className="section-inner">
          <h2 className="section-title">家长们怎么说</h2>
          <p className="section-subtitle">真实使用场景：周日晚规划、考后复盘、多孩日程撞车时快速取舍。</p>
          <div className="quote-grid">
            {QUOTES.map((q) => (
              <blockquote key={q.name} className="quote-card">
                <p className="quote-text">&ldquo;{q.text}&rdquo;</p>
                <footer>
                  <cite className="quote-name">{q.name}</cite>
                  <span className="quote-role">{q.role}</span>
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="cta-inner">
          <h2 className="cta-title">准备好开始了吗？</h2>
          <p className="cta-text">先建立档案与目标，再添加本周任务——多数操作可在 30 秒内完成。</p>
          <button type="button" className="btn btn-on-dark btn-lg" onClick={goWorkspace}>
            立即进入工作台
          </button>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
