export type Lang = "zh" | "en";

export type I18nKey =
  | "app.name"
  | "nav.home"
  | "nav.workspace"
  | "nav.dashboard"
  | "nav.children"
  | "nav.features"
  | "nav.testimonials"
  | "nav.start"
  | "nav.lang.zh"
  | "nav.lang.en"
  | "workspace.title"
  | "workspace.lead"
  | "workspace.existing"
  | "workspace.none"
  | "workspace.enter"
  | "workspace.delete"
  | "workspace.new"
  | "workspace.familyName"
  | "workspace.familyNamePh"
  | "workspace.createAndEnter"
  | "workspace.defaultName"
  | "workspace.confirmDelete"
  | "dashboard.title"
  | "dashboard.lead"
  | "dashboard.todayFocus"
  | "dashboard.noDue"
  | "dashboard.col.child"
  | "dashboard.col.task"
  | "dashboard.col.date"
  | "dashboard.risks"
  | "dashboard.noRisks"
  | "dashboard.col.level"
  | "dashboard.col.detail"
  | "dashboard.week"
  | "dashboard.col.done"
  | "dashboard.col.rate"
  | "dashboard.children"
  | "common.loading"
  | "common.dash"
  | "children.title"
  | "children.lead"
  | "children.add"
  | "children.name"
  | "children.grade"
  | "children.addBtn"
  | "children.list"
  | "children.manage"
  | "home.eyebrow"
  | "home.heroTitle1"
  | "home.heroTitle2"
  | "home.heroLead"
  | "home.ctaPrimary"
  | "home.ctaSecondary"
  | "home.featuresTitle"
  | "home.featuresSubtitle"
  | "home.testimonialsTitle"
  | "home.testimonialsSubtitle"
  | "home.ctaTitle"
  | "home.ctaText"
  | "home.ctaGo"
  | "home.feature.goals.title"
  | "home.feature.goals.desc"
  | "home.feature.tasks.title"
  | "home.feature.tasks.desc"
  | "home.feature.logs.title"
  | "home.feature.logs.desc"
  | "home.feature.risks.title"
  | "home.feature.risks.desc"
  | "home.feature.dashboard.title"
  | "home.feature.dashboard.desc"
  | "home.feature.ai.title"
  | "home.feature.ai.desc"
  | "home.quote.1.text"
  | "home.quote.1.name"
  | "home.quote.1.role"
  | "home.quote.2.text"
  | "home.quote.2.name"
  | "home.quote.2.role"
  | "home.quote.3.text"
  | "home.quote.3.name"
  | "home.quote.3.role"
  | "footer.note"
  | "childApp.title"
  | "childApp.none"
  | "childApp.due"
  | "childApp.done"
  | "childDetail.back"
  | "childDetail.title"
  | "childDetail.lead"
  | "childDetail.profileTitle"
  | "childDetail.profileLead"
  | "childDetail.goalsTitle"
  | "childDetail.goal.title"
  | "childDetail.goal.type"
  | "childDetail.goal.deadline"
  | "childDetail.goal.progress0_100"
  | "childDetail.goal.add"
  | "childDetail.goal.table.goal"
  | "childDetail.goal.table.progress"
  | "childDetail.goal.table.deadline"
  | "childDetail.goal.table.aiDraft"
  | "childDetail.goal.aiApply"
  | "childDetail.tasksTitle"
  | "childDetail.tasks.view"
  | "childDetail.tasks.view.all"
  | "childDetail.tasks.view.week"
  | "childDetail.tasks.title"
  | "childDetail.tasks.date"
  | "childDetail.tasks.add"
  | "childDetail.tasks.table.task"
  | "childDetail.tasks.table.date"
  | "childDetail.tasks.table.status"
  | "childDetail.tasks.table.source"
  | "childDetail.tasks.table.check"
  | "childDetail.tasks.markUndone"
  | "childDetail.tasks.done"
  | "childDetail.tasks.delete"
  | "childDetail.tasks.confirmDelete"
  | "childDetail.logsTitle"
  | "childDetail.logs.type"
  | "childDetail.logs.type.score"
  | "childDetail.logs.type.feedback"
  | "childDetail.logs.type.note"
  | "childDetail.logs.type.event"
  | "childDetail.logs.subject"
  | "childDetail.logs.eventTitle"
  | "childDetail.logs.score"
  | "childDetail.logs.content"
  | "childDetail.logs.details"
  | "childDetail.logs.defaultEventSubject"
  | "childDetail.logs.defaultGeneralSubject"
  | "childDetail.logs.date"
  | "childDetail.logs.save"
  | "childDetail.logs.table.type"
  | "childDetail.logs.table.subject"
  | "childDetail.logs.table.value"
  | "childDetail.logs.table.date"
  | "childDetail.risksTitle"
  | "childDetail.risks.lead"
  | "childDetail.risks.toggleHistory"
  | "childDetail.risks.table.level"
  | "childDetail.risks.table.detail"
  | "childDetail.risks.table.rule"
  | "childDetail.risks.table.status"
  | "childDetail.risks.empty.open"
  | "childDetail.risks.empty.all"
  | "childDetail.risks.status.resolved"
  | "childDetail.risks.status.open"
  | "childDetail.risks.resolve"
  | "childDetail.goal.preset.term"
  | "childDetail.goal.preset.year"
  | "childDetail.goal.preset.subject"
  | "childDetail.goal.preset.interest"
  | "childDetail.goal.preset.general"
  | "childDetail.profile.name"
  | "childDetail.profile.grade"
  | "childDetail.profile.school"
  | "childDetail.profile.subjects"
  | "childDetail.profile.subjectsPh"
  | "childDetail.profile.interests"
  | "childDetail.profile.interestsPh"
  | "childDetail.profile.notes"
  | "childDetail.profile.save"
  | "childDetail.profile.hint"
  | "childDetail.childLink";

type Dict = Record<I18nKey, string>;

export const dict: Record<Lang, Dict> = {
  zh: {
    "app.name": "家庭教育管家",
    "nav.home": "主页",
    "nav.workspace": "家庭",
    "nav.dashboard": "家庭看板",
    "nav.children": "孩子档案",
    "nav.features": "功能亮点",
    "nav.testimonials": "家长反馈",
    "nav.start": "开始使用",
    "nav.lang.zh": "中文",
    "nav.lang.en": "English",

    "workspace.title": "创建/选择家庭",
    "workspace.lead": "这是你的家庭工作空间入口。选中后会进入「家庭看板」。",
    "workspace.existing": "已有家庭",
    "workspace.none": "暂无家庭，可在右侧新建。",
    "workspace.enter": "进入",
    "workspace.delete": "删除",
    "workspace.new": "新建家庭",
    "workspace.familyName": "家庭名称",
    "workspace.familyNamePh": "例如：张家",
    "workspace.createAndEnter": "创建并进入看板",
    "workspace.defaultName": "我的家庭",
    "workspace.confirmDelete":
      "确定删除家庭「{name}」吗？\n\n这会删除该家庭下的孩子、目标、任务、成长记录与风险提醒，且不可恢复。",

    "dashboard.title": "家庭看板",
    "dashboard.lead": "今日重点 · 风险排序 · 本周完成率。只展示可行动信息，帮你快速做决定。",
    "dashboard.todayFocus": "今日重点",
    "dashboard.noDue": "暂无到期任务。",
    "dashboard.col.child": "孩子",
    "dashboard.col.task": "任务",
    "dashboard.col.date": "日期",
    "dashboard.risks": "风险信号",
    "dashboard.noRisks": "暂无未处理风险。",
    "dashboard.col.level": "等级",
    "dashboard.col.detail": "说明",
    "dashboard.week": "本周任务完成率",
    "dashboard.col.done": "完成 / 总计",
    "dashboard.col.rate": "比率",
    "dashboard.children": "孩子一览",
    "common.loading": "加载中…",
    "common.dash": "—",

    "children.title": "孩子档案",
    "children.lead": "每个孩子独立档案；点「管理」进入目标、任务与成长记录。",
    "children.add": "新增孩子",
    "children.name": "姓名",
    "children.grade": "年级",
    "children.addBtn": "添加",
    "children.list": "列表",
    "children.manage": "管理",

    "home.eyebrow": "家庭教育 · 从忙乱到可控",
    "home.heroTitle1": "更有把握地",
    "home.heroTitle2": "陪伴孩子成长",
    "home.heroLead": "把信息、目标与执行串成一条清晰路径：先看今天该做什么，再记录反馈、看见趋势。适合重视学业与综合发展的家庭。",
    "home.ctaPrimary": "免费开始使用",
    "home.ctaSecondary": "了解功能",
    "home.featuresTitle": "成长路上，你需要的都在这里",
    "home.featuresSubtitle": "围绕「目标 → 计划 → 任务 → 记录 → 复盘」设计的管理工具，不是题库，也不是上课平台。",
    "home.testimonialsTitle": "家长们怎么说",
    "home.testimonialsSubtitle": "真实使用场景：周日晚规划、考后复盘、多孩日程撞车时快速取舍。",
    "home.ctaTitle": "准备好开始了吗？",
    "home.ctaText": "先建立档案与目标，再添加本周任务——多数操作可在 30 秒内完成。",
    "home.ctaGo": "立即进入工作台",

    "home.feature.goals.title": "阶段目标",
    "home.feature.goals.desc": "按学期、学科与兴趣设定目标，和计划对齐，随时查看完成度。",
    "home.feature.tasks.title": "周任务拆解",
    "home.feature.tasks.desc": "把大目标拆成可执行的每日任务，支持打卡与逾期标记。",
    "home.feature.logs.title": "成长档案",
    "home.feature.logs.desc": "成绩、老师反馈与观察笔记结构化沉淀，可按科目与时间筛选。",
    "home.feature.risks.title": "风险提醒",
    "home.feature.risks.desc": "逾期、成绩波动与目标偏离等信号自动提示，减少遗漏。",
    "home.feature.dashboard.title": "家庭看板",
    "home.feature.dashboard.desc": "多孩家庭一眼看到今日重点、风险排序与本周完成率。",
    "home.feature.ai.title": "AI 辅助（可选）",
    "home.feature.ai.desc": "从目标生成任务草稿，确认后再落库，家长始终掌握决定权。",

    "home.quote.1.text": "以前作业、群消息、卷子到处散，现在在一个地方就能安排一周，心里踏实多了。",
    "home.quote.1.name": "李女士",
    "home.quote.1.role": "二孩家长 · 小学",
    "home.quote.2.text": "目标和每天任务连起来了，终于不用只靠脑子记，期末前也能看出弱科。",
    "home.quote.2.name": "张先生",
    "home.quote.2.role": "初中生家长",
    "home.quote.3.text": "看板上的风险提示很直接，知道今晚该盯哪一科，比一堆图表有用。",
    "home.quote.3.name": "王女士",
    "home.quote.3.role": "小学高年级家长",

    "footer.note": "以孩子为核心 · 目标—任务—记录闭环 · 决策优先于堆砌功能",

    "childApp.title": "今日任务",
    "childApp.none": "今天没有待完成任务。",
    "childApp.due": "截止",
    "childApp.done": "完成",

    "childDetail.back": "← 返回孩子列表",
    "childDetail.title": "孩子工作台",
    "childDetail.lead": "目标 → 任务 → 成长记录，形成完整执行与反馈闭环。",
    "childDetail.profileTitle": "孩子档案",
    "childDetail.profileLead":
      "管理对象是谁：基础信息、学校、科目与兴趣、家长备注。孩子轻量端：",
    "childDetail.childLink": "打开今日任务（孩子端）",
    "childDetail.goalsTitle": "长期目标",
    "childDetail.goal.title": "标题",
    "childDetail.goal.type": "类型",
    "childDetail.goal.deadline": "截止日期",
    "childDetail.goal.progress0_100": "初始进度（0–100）",
    "childDetail.goal.add": "添加目标",
    "childDetail.goal.table.goal": "目标",
    "childDetail.goal.table.progress": "进度",
    "childDetail.goal.table.deadline": "截止",
    "childDetail.goal.table.aiDraft": "AI 草稿任务",
    "childDetail.goal.aiApply": "生成并落库",
    "childDetail.goal.preset.term": "学期目标",
    "childDetail.goal.preset.year": "年度目标",
    "childDetail.goal.preset.subject": "学科",
    "childDetail.goal.preset.interest": "兴趣",
    "childDetail.goal.preset.general": "综合",

    "childDetail.tasksTitle": "任务",
    "childDetail.tasks.view": "视图",
    "childDetail.tasks.view.all": "全部",
    "childDetail.tasks.view.week": "本周（{start} ~ {end}）",
    "childDetail.tasks.title": "标题",
    "childDetail.tasks.date": "日期",
    "childDetail.tasks.add": "添加任务",
    "childDetail.tasks.table.task": "任务",
    "childDetail.tasks.table.date": "日期",
    "childDetail.tasks.table.status": "状态",
    "childDetail.tasks.table.source": "来源",
    "childDetail.tasks.table.check": "打卡",
    "childDetail.tasks.markUndone": "标为未完成",
    "childDetail.tasks.done": "完成",
    "childDetail.tasks.delete": "删除",
    "childDetail.tasks.confirmDelete": "确定删除任务「{title}」吗？此操作不可恢复。",

    "childDetail.logsTitle": "成长记录",
    "childDetail.logs.type": "类型",
    "childDetail.logs.type.score": "成绩",
    "childDetail.logs.type.feedback": "老师反馈",
    "childDetail.logs.type.note": "观察笔记",
    "childDetail.logs.type.event": "重要事件（考试/比赛等）",
    "childDetail.logs.subject": "科目",
    "childDetail.logs.eventTitle": "事件标题",
    "childDetail.logs.score": "分数",
    "childDetail.logs.content": "内容",
    "childDetail.logs.details": "详情",
    "childDetail.logs.defaultEventSubject": "重要事件",
    "childDetail.logs.defaultGeneralSubject": "综合",
    "childDetail.logs.date": "日期",
    "childDetail.logs.save": "保存记录",
    "childDetail.logs.table.type": "类型",
    "childDetail.logs.table.subject": "科目",
    "childDetail.logs.table.value": "内容/分数",
    "childDetail.logs.table.date": "日期",

    "childDetail.risksTitle": "风险提醒",
    "childDetail.risks.lead": "默认只显示待处理。处理后会在列表中消失；需要查看历史可打开开关。",
    "childDetail.risks.toggleHistory": "显示已处理记录",
    "childDetail.risks.table.level": "等级",
    "childDetail.risks.table.detail": "说明",
    "childDetail.risks.table.rule": "规则",
    "childDetail.risks.table.status": "状态",
    "childDetail.risks.empty.open": "暂无待处理风险。",
    "childDetail.risks.empty.all": "暂无记录。",
    "childDetail.risks.status.resolved": "已处理",
    "childDetail.risks.status.open": "待处理",
    "childDetail.risks.resolve": "标记已处理",
    "childDetail.profile.name": "姓名",
    "childDetail.profile.grade": "年级",
    "childDetail.profile.school": "学校",
    "childDetail.profile.subjects": "科目（用逗号分隔）",
    "childDetail.profile.subjectsPh": "数学, 语文, 英语",
    "childDetail.profile.interests": "兴趣（用逗号分隔）",
    "childDetail.profile.interestsPh": "钢琴, 游泳",
    "childDetail.profile.notes": "家长备注",
    "childDetail.profile.save": "保存档案",
    "childDetail.profile.hint": "提示：若档案加载失败，请从「孩子档案」重新进入。",
  },
  en: {
    "app.name": "Family Education Butler",
    "nav.home": "Home",
    "nav.workspace": "Workspace",
    "nav.dashboard": "Dashboard",
    "nav.children": "Children",
    "nav.features": "Features",
    "nav.testimonials": "Testimonials",
    "nav.start": "Get started",
    "nav.lang.zh": "中文",
    "nav.lang.en": "English",

    "workspace.title": "Choose a family",
    "workspace.lead": "This is your workspace entry. Select one to open the dashboard.",
    "workspace.existing": "Existing families",
    "workspace.none": "No families yet. Create one on the right.",
    "workspace.enter": "Enter",
    "workspace.delete": "Delete",
    "workspace.new": "Create a family",
    "workspace.familyName": "Family name",
    "workspace.familyNamePh": "e.g. Zhang family",
    "workspace.createAndEnter": "Create and open dashboard",
    "workspace.defaultName": "My family",
    "workspace.confirmDelete":
      "Delete family \"{name}\"?\n\nThis will delete all children, goals, tasks, logs, and risk signals under it. This cannot be undone.",

    "dashboard.title": "Dashboard",
    "dashboard.lead": "Today’s focus · Risk signals · Weekly completion. Only actionable info, for faster decisions.",
    "dashboard.todayFocus": "Today’s focus",
    "dashboard.noDue": "No due tasks.",
    "dashboard.col.child": "Child",
    "dashboard.col.task": "Task",
    "dashboard.col.date": "Date",
    "dashboard.risks": "Risk signals",
    "dashboard.noRisks": "No open risks.",
    "dashboard.col.level": "Level",
    "dashboard.col.detail": "Details",
    "dashboard.week": "Weekly completion rate",
    "dashboard.col.done": "Done / Total",
    "dashboard.col.rate": "Rate",
    "dashboard.children": "Children",
    "common.loading": "Loading…",
    "common.dash": "—",

    "children.title": "Children",
    "children.lead": "Each child has an independent profile. Click “Manage” to edit goals, tasks, and logs.",
    "children.add": "Add a child",
    "children.name": "Name",
    "children.grade": "Grade",
    "children.addBtn": "Add",
    "children.list": "List",
    "children.manage": "Manage",

    "home.eyebrow": "Family education · From chaos to clarity",
    "home.heroTitle1": "Support your child",
    "home.heroTitle2": "with more confidence",
    "home.heroLead":
      "Turn scattered info into a clear path: see what matters today, record feedback, and spot trends. Built for families who value both academics and growth.",
    "home.ctaPrimary": "Start for free",
    "home.ctaSecondary": "See features",
    "home.featuresTitle": "Everything you need, in one place",
    "home.featuresSubtitle": "Designed around “Goals → Plans → Tasks → Logs → Review”. Not a content platform—an execution system.",
    "home.testimonialsTitle": "What parents say",
    "home.testimonialsSubtitle": "Real scenarios: weekly planning, post-exam review, and prioritizing when schedules collide.",
    "home.ctaTitle": "Ready to begin?",
    "home.ctaText": "Create profiles and goals first, then add weekly tasks—most actions take under 30 seconds.",
    "home.ctaGo": "Open workspace",

    "home.feature.goals.title": "Goals",
    "home.feature.goals.desc": "Set stage-based goals across terms, subjects, and interests, and track progress anytime.",
    "home.feature.tasks.title": "Weekly tasks",
    "home.feature.tasks.desc": "Break big goals into daily actions with check-ins and overdue marking.",
    "home.feature.logs.title": "Growth logs",
    "home.feature.logs.desc": "Capture scores, teacher feedback, and observations, filterable by subject and time.",
    "home.feature.risks.title": "Risk signals",
    "home.feature.risks.desc": "Auto-detect overdue tasks, score drops, and goal drift so nothing slips.",
    "home.feature.dashboard.title": "Family dashboard",
    "home.feature.dashboard.desc": "For multi-child families: today’s focus, risk ranking, and weekly completion at a glance.",
    "home.feature.ai.title": "AI assist (optional)",
    "home.feature.ai.desc": "Generate task drafts from goals. You approve before anything is saved.",

    "home.quote.1.text": "Homework, chat messages, and papers used to be everywhere. Now we plan the week in one place—it’s much calmer.",
    "home.quote.1.name": "Ms. Li",
    "home.quote.1.role": "Parent of two · Primary school",
    "home.quote.2.text": "Goals finally connect to daily tasks. I don’t rely on memory anymore, and weak subjects show up early.",
    "home.quote.2.name": "Mr. Zhang",
    "home.quote.2.role": "Middle school parent",
    "home.quote.3.text": "The risk signals are direct—I know what to focus on tonight. Much more useful than endless charts.",
    "home.quote.3.name": "Ms. Wang",
    "home.quote.3.role": "Upper primary parent",

    "footer.note": "Child-first · Goals→Tasks→Logs loop · Decisions over feature bloat",

    "childApp.title": "Today’s tasks",
    "childApp.none": "No tasks to do today.",
    "childApp.due": "Due",
    "childApp.done": "Done",

    "childDetail.back": "← Back to children",
    "childDetail.title": "Child workspace",
    "childDetail.lead": "Goals → Tasks → Logs, a complete execution & feedback loop.",
    "childDetail.profileTitle": "Profile",
    "childDetail.profileLead": "Who are we managing: basics, school, subjects & interests, parent notes. Child view:",
    "childDetail.childLink": "Open today’s tasks (child)",
    "childDetail.goalsTitle": "Goals",
    "childDetail.goal.title": "Title",
    "childDetail.goal.type": "Type",
    "childDetail.goal.deadline": "Deadline",
    "childDetail.goal.progress0_100": "Initial progress (0–100)",
    "childDetail.goal.add": "Add goal",
    "childDetail.goal.table.goal": "Goal",
    "childDetail.goal.table.progress": "Progress",
    "childDetail.goal.table.deadline": "Deadline",
    "childDetail.goal.table.aiDraft": "AI drafts",
    "childDetail.goal.aiApply": "Generate & save",
    "childDetail.goal.preset.term": "Term goal",
    "childDetail.goal.preset.year": "Year goal",
    "childDetail.goal.preset.subject": "Subject",
    "childDetail.goal.preset.interest": "Interest",
    "childDetail.goal.preset.general": "General",

    "childDetail.tasksTitle": "Tasks",
    "childDetail.tasks.view": "View",
    "childDetail.tasks.view.all": "All",
    "childDetail.tasks.view.week": "This week ({start} ~ {end})",
    "childDetail.tasks.title": "Title",
    "childDetail.tasks.date": "Date",
    "childDetail.tasks.add": "Add task",
    "childDetail.tasks.table.task": "Task",
    "childDetail.tasks.table.date": "Date",
    "childDetail.tasks.table.status": "Status",
    "childDetail.tasks.table.source": "Source",
    "childDetail.tasks.table.check": "Check",
    "childDetail.tasks.markUndone": "Mark not done",
    "childDetail.tasks.done": "Done",
    "childDetail.tasks.delete": "Delete",
    "childDetail.tasks.confirmDelete": "Delete task \"{title}\"? This cannot be undone.",

    "childDetail.logsTitle": "Logs",
    "childDetail.logs.type": "Type",
    "childDetail.logs.type.score": "Score",
    "childDetail.logs.type.feedback": "Teacher feedback",
    "childDetail.logs.type.note": "Observation",
    "childDetail.logs.type.event": "Event (exam/contest/etc.)",
    "childDetail.logs.subject": "Subject",
    "childDetail.logs.eventTitle": "Event title",
    "childDetail.logs.score": "Score",
    "childDetail.logs.content": "Content",
    "childDetail.logs.details": "Details",
    "childDetail.logs.defaultEventSubject": "Event",
    "childDetail.logs.defaultGeneralSubject": "General",
    "childDetail.logs.date": "Date",
    "childDetail.logs.save": "Save log",
    "childDetail.logs.table.type": "Type",
    "childDetail.logs.table.subject": "Subject",
    "childDetail.logs.table.value": "Content / score",
    "childDetail.logs.table.date": "Date",

    "childDetail.risksTitle": "Risks",
    "childDetail.risks.lead": "By default we show open items only. Resolved items disappear; toggle to see history.",
    "childDetail.risks.toggleHistory": "Show resolved history",
    "childDetail.risks.table.level": "Level",
    "childDetail.risks.table.detail": "Details",
    "childDetail.risks.table.rule": "Rule",
    "childDetail.risks.table.status": "Status",
    "childDetail.risks.empty.open": "No open risks.",
    "childDetail.risks.empty.all": "No records.",
    "childDetail.risks.status.resolved": "Resolved",
    "childDetail.risks.status.open": "Open",
    "childDetail.risks.resolve": "Mark resolved",
    "childDetail.profile.name": "Name",
    "childDetail.profile.grade": "Grade",
    "childDetail.profile.school": "School",
    "childDetail.profile.subjects": "Subjects (comma-separated)",
    "childDetail.profile.subjectsPh": "Math, Chinese, English",
    "childDetail.profile.interests": "Interests (comma-separated)",
    "childDetail.profile.interestsPh": "Piano, Swimming",
    "childDetail.profile.notes": "Parent notes",
    "childDetail.profile.save": "Save profile",
    "childDetail.profile.hint": "Hint: if the profile failed to load, re-enter from “Children”.",
  },
};

