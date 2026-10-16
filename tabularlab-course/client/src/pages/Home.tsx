import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  ClipboardCheck,
  Code2,
  Copy,
  Database,
  FileCheck2,
  FlaskConical,
  Gauge,
  HelpCircle,
  Lightbulb,
  LockKeyhole,
  Menu,
  Play,
  RotateCcw,
  Sparkles,
  Target,
  Terminal,
  Trophy,
  XCircle,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { finalChallenge, problems, quickReview, quizQuestions, type Problem } from "@/lib/courseData";

type View = "home" | "course" | "review" | "checklist" | "final";
type StoredState = { completed: number[]; lastProblem: number; quizScore: number | null; challengeScore: number | null };

const STORAGE_KEY = "tabular-lab-progress-v1";

const defaultState: StoredState = {
  completed: [],
  lastProblem: 1,
  quizScore: null,
  challengeScore: null,
};

function readProgress(): StoredState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return defaultState;
    return { ...defaultState, ...JSON.parse(saved) };
  } catch {
    return defaultState;
  }
}

function CodeBlock({ code, compact = false }: { code: string; compact?: boolean }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className={`code-shell ${compact ? "code-shell-compact" : ""}`}>
      <div className="code-topbar">
        <span><span className="code-dot red" /><span className="code-dot yellow" /><span className="code-dot green" /></span>
        <span className="code-language">python</span>
        <button className="icon-button code-copy" onClick={copy} aria-label="Copiar código">
          {copied ? <Check size={14} /> : <Copy size={14} />}
          <span>{copied ? "Copiado" : "Copiar"}</span>
        </button>
      </div>
      <pre><code>{code}</code></pre>
    </div>
  );
}

function ProgressRing({ value, size = 56 }: { value: number; size?: number }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const dash = circumference - (value / 100) * circumference;
  return (
    <div className="progress-ring" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} aria-label={`${value}% concluído`}>
        <circle className="ring-track" cx={size / 2} cy={size / 2} r={radius} />
        <circle className="ring-value" cx={size / 2} cy={size / 2} r={radius} strokeDasharray={circumference} strokeDashoffset={dash} />
      </svg>
      <strong>{value}%</strong>
    </div>
  );
}

function Home() {
  const [view, setView] = useState<View>("home");
  const [selectedProblem, setSelectedProblem] = useState(1);
  const [mobileNav, setMobileNav] = useState(false);
  const [progress, setProgress] = useState<StoredState>(readProgress);
  const [hintIndex, setHintIndex] = useState<Record<number, number>>({});
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [challengeCode, setChallengeCode] = useState(finalChallenge.starter);
  const [challengeResults, setChallengeResults] = useState<boolean[] | null>(null);

  const completed = progress.completed;
  const percent = Math.round((completed.length / problems.length) * 100);
  const currentProblem = problems.find((problem) => problem.id === selectedProblem) ?? problems[0];
  const nextProblem = problems.find((problem) => !completed.includes(problem.id))?.id ?? 1;
  const quizScore = quizSubmitted
    ? quizQuestions.reduce((score, question) => score + (quizAnswers[question.id] === question.answer ? 1 : 0), 0)
    : null;
  const challengeScore = challengeResults?.filter(Boolean).length ?? null;
  const finalReady = completed.length === problems.length;

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    const persisted = readProgress();
    setSelectedProblem(persisted.lastProblem || 1);
  }, []);

  const updateProgress = (changes: Partial<StoredState>) => setProgress((current) => ({ ...current, ...changes }));

  const navigate = (nextView: View) => {
    setView(nextView);
    setMobileNav(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openProblem = (id: number) => {
    setSelectedProblem(id);
    updateProgress({ lastProblem: id });
    navigate("course");
  };

  const markComplete = (id: number) => {
    updateProgress({ completed: completed.includes(id) ? completed.filter((item) => item !== id) : [...completed, id] });
  };

  const showNextProblem = () => {
    const next = Math.min(selectedProblem + 1, problems.length);
    openProblem(next);
  };

  const revealHint = () => {
    setHintIndex((current) => ({ ...current, [currentProblem.id]: Math.min((current[currentProblem.id] ?? 0) + 1, currentProblem.hints.length) }));
  };

  const selectAnswer = (questionId: number, answer: number) => {
    if (quizSubmitted) return;
    setQuizAnswers((current) => ({ ...current, [questionId]: answer }));
  };

  const submitQuiz = () => {
    setQuizSubmitted(true);
    const score = quizQuestions.reduce((total, question) => total + (quizAnswers[question.id] === question.answer ? 1 : 0), 0);
    updateProgress({ quizScore: score });
  };

  const resetQuiz = () => {
    setQuizSubmitted(false);
    setQuizAnswers({});
    updateProgress({ quizScore: null });
  };

  const runChallenge = () => {
    const normalized = challengeCode.toLowerCase();
    const results = finalChallenge.tests.map((test) => normalized.includes(test.token.toLowerCase()));
    setChallengeResults(results);
    updateProgress({ challengeScore: results.filter(Boolean).length });
  };

  const startOrResume = () => openProblem(nextProblem);

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand" onClick={() => navigate("home")} aria-label="Voltar ao início">
          <span className="brand-mark"><FlaskConical size={18} /></span>
          <span><strong>tabular</strong><em>lab</em></span>
        </button>
        <div className="topbar-meta">
          <span className="status-dot" /> <span>Trilha ativa</span>
          <span className="topbar-divider" />
          <span className="topbar-caption">Preparação OIAA · Fase 2</span>
        </div>
        <div className="topbar-actions">
          <button className="mobile-menu" onClick={() => setMobileNav((open) => !open)} aria-label="Abrir menu"><Menu size={20} /></button>
          <button className="reset-progress" onClick={() => { if (window.confirm("Zerar seu progresso local?")) setProgress(defaultState); }}><RotateCcw size={14} /> Reiniciar</button>
          <div className="avatar">TL</div>
        </div>
      </header>

      <div className={`workspace ${mobileNav ? "mobile-nav-open" : ""}`}>
        <aside className="sidebar">
          <div className="sidebar-progress">
            <div className="progress-copy"><span>Seu progresso</span><strong>{completed.length}/{problems.length} problemas</strong></div>
            <div className="progress-bar"><span style={{ width: `${percent}%` }} /></div>
            <div className="progress-foot"><span>{percent === 0 ? "Comece pelo primeiro problema" : percent === 100 ? "Trilha concluída" : `${problems.length - completed.length} etapas restantes`}</span><span>{percent}%</span></div>
          </div>
          <nav className="main-nav" aria-label="Navegação do curso">
            <button className={`nav-item ${view === "home" ? "active" : ""}`} onClick={() => navigate("home")}><Gauge size={17} /><span>Visão geral</span>{view === "home" && <ChevronRight size={15} className="nav-chevron" />}</button>
            <button className={`nav-item ${view === "course" ? "active" : ""}`} onClick={() => navigate("course")}><Database size={17} /><span>Problemas</span><span className="nav-count">{completed.length}/{problems.length}</span></button>
            <button className={`nav-item ${view === "review" ? "active" : ""}`} onClick={() => navigate("review")}><Zap size={17} /><span>Revisão rápida</span></button>
            <button className={`nav-item ${view === "checklist" ? "active" : ""}`} onClick={() => navigate("checklist")}><ClipboardCheck size={17} /><span>Checklist de prova</span></button>
            <div className="nav-label">Avaliação</div>
            <button className={`nav-item ${view === "final" ? "active" : ""}`} onClick={() => navigate("final")}><Trophy size={17} /><span>Verificação final</span>{!finalReady && <LockKeyhole size={13} className="lock-icon" />}</button>
          </nav>
          <div className="sidebar-bottom">
            <div className="mini-note"><Sparkles size={16} /><div><strong>Aprenda fazendo</strong><span>Teoria curta. Código real.</span></div></div>
            <div className="sidebar-footer">feito para a sua próxima submissão <span>↗</span></div>
          </div>
        </aside>

        <main className="main-content">
          {view === "home" && <HomeView percent={percent} completed={completed} nextProblem={nextProblem} onStart={startOrResume} onReview={() => navigate("review")} onOpenProblem={openProblem} quizScore={progress.quizScore} challengeScore={progress.challengeScore} />}
          {view === "course" && <CourseView problem={currentProblem} completed={completed} hintCount={hintIndex[currentProblem.id] ?? 0} onBack={() => navigate("home")} onOpenProblem={openProblem} onHint={revealHint} onMarkComplete={() => markComplete(currentProblem.id)} onNext={showNextProblem} />}
          {view === "review" && <ReviewView onOpenProblem={openProblem} />}
          {view === "checklist" && <ChecklistView />}
          {view === "final" && <FinalView completed={completed.length} quizAnswers={quizAnswers} quizSubmitted={quizSubmitted} quizScore={quizScore} challengeCode={challengeCode} challengeResults={challengeResults} onAnswer={selectAnswer} onSubmitQuiz={submitQuiz} onResetQuiz={resetQuiz} onCodeChange={setChallengeCode} onRunChallenge={runChallenge} />}
        </main>
      </div>
    </div>
  );
}

function HomeView({ percent, completed, nextProblem, onStart, onReview, onOpenProblem, quizScore, challengeScore }: { percent: number; completed: number[]; nextProblem: number; onStart: () => void; onReview: () => void; onOpenProblem: (id: number) => void; quizScore: number | null; challengeScore: number | null }) {
  const statusText = percent === 0 ? "A primeira linha de código começa aqui." : percent === 100 ? "Você fechou o ciclo. Hora de simular a prova." : "Você já começou a transformar dados em decisões.";
  return (
    <div className="page-wrap home-page">
      <div className="hero-grid">
        <section className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-line" /> LABORATÓRIO DE CLASSIFICAÇÃO TABULAR <span className="eyebrow-dot">●</span></div>
          <h1>Do <span>zero</span> ao<br /> primeiro modelo.</h1>
          <p className="hero-lede">Um curso direto ao ponto para você aprender a ler dados, treinar modelos e chegar na Fase 2 sabendo entregar uma solução que funciona.</p>
          <div className="hero-actions"><button className="primary-button" onClick={onStart}><Play size={16} fill="currentColor" /> {percent === 0 ? "Começar pelo problema 1" : `Continuar no problema ${nextProblem}`} <ArrowRight size={16} /></button><button className="text-button" onClick={onReview}>ver mapa da trilha <ArrowRight size={15} /></button></div>
          <div className="hero-proof"><span><CheckCircle2 size={15} /> 12 problemas práticos</span><span><CheckCircle2 size={15} /> Quiz + desafio final</span></div>
        </section>
        <section className="hero-visual" aria-label="Visualização de progresso do laboratório">
          <div className="orbital-card card-front"><div className="card-kicker"><span className="live-pulse" /> AGORA NO LAB</div><div className="orbital-title">sua próxima<br /><strong>submissão</strong></div><div className="orbital-chart"><span className="orbit orbit-one" /><span className="orbit orbit-two" /><span className="orbit orbit-three" /><span className="orbit-core"><Terminal size={19} /></span><span className="orbit-node node-a" /><span className="orbit-node node-b" /><span className="orbit-node node-c" /></div><div className="orbital-footer"><span>progresso da trilha</span><strong>{percent}%</strong></div><div className="visual-scan" /></div>
          <div className="floating-stat stat-top"><span>F2</span><strong>tabular</strong><small>trilha ativa</small></div>
          <div className="floating-stat stat-bottom"><Gauge size={15} /><span>ritmo atual</span><strong>{completed.length > 0 ? "em movimento" : "pronto para começar"}</strong></div>
        </section>
      </div>
      <div className="home-status"><div><span className="section-kicker">SEU PONTO DE PARTIDA</span><h2>{statusText}</h2></div><div className="home-score"><ProgressRing value={percent} size={62} /><div><span>trilha concluída</span><strong>{completed.length} de {problems.length}</strong></div></div></div>
      <div className="module-heading"><div><span className="section-kicker">A TRILHA</span><h2>Uma sequência, sem atalhos confusos.</h2></div><span className="module-heading-note">cada problema desbloqueia uma parte da lógica</span></div>
      <div className="module-grid">
        {problems.slice(0, 6).map((problem) => <ModuleCard key={problem.id} problem={problem} done={completed.includes(problem.id)} onClick={() => onOpenProblem(problem.id)} />)}
      </div>
      <div className="bottom-callout"><div className="callout-icon"><Target size={22} /></div><div><strong>Como saber se estou pronto?</strong><span>Complete os 12 problemas, faça o quiz e passe pelo desafio de código. A régua é simples: entender o caminho e conseguir repetir.</span></div><button className="ghost-button" onClick={() => onOpenProblem(1)}>ver primeiro problema <ArrowRight size={15} /></button></div>
      <div className="score-teaser"><div><span className="section-kicker">SUA PRÓXIMA CHECAGEM</span><h3>{quizScore !== null ? `Quiz final: ${quizScore}/${quizQuestions.length}` : "Quiz final"}</h3></div><div className="score-teaser-right"><span>{challengeScore !== null ? `Desafio: ${challengeScore}/${finalChallenge.tests.length} testes` : "Ainda não iniciado"}</span><button className="text-button" onClick={() => onOpenProblem(12)}>fortalecer base <ArrowRight size={14} /></button></div></div>
    </div>
  );
}

function ModuleCard({ problem, done, onClick }: { problem: Problem; done: boolean; onClick: () => void }) {
  return <button className={`module-card ${done ? "done" : ""}`} onClick={onClick}><div className="module-index">{done ? <Check size={15} /> : String(problem.id).padStart(2, "0")}</div><div className="module-info"><div className="module-top"><span>{problem.eyebrow}</span><small><span className="tiny-dot" /> {problem.minutes} min</small></div><h3>{problem.title}</h3><p>{problem.summary}</p><div className="module-progress"><span style={{ width: done ? "100%" : "14%" }} /></div></div><ChevronRight size={18} className="module-arrow" /></button>;
}

function CourseView({ problem, completed, hintCount, onBack, onOpenProblem, onHint, onMarkComplete, onNext }: { problem: Problem; completed: number[]; hintCount: number; onBack: () => void; onOpenProblem: (id: number) => void; onHint: () => void; onMarkComplete: () => void; onNext: () => void }) {
  return <div className="page-wrap course-page"><div className="course-header"><button className="back-link" onClick={onBack}><ArrowLeft size={15} /> visão geral</button><div className="course-header-right"><span>PROBLEMA {String(problem.id).padStart(2, "0")} / {String(problems.length).padStart(2, "0")}</span><span className="header-slash">/</span><span>{problem.minutes} min de foco</span></div></div><div className="problem-layout"><aside className="problem-rail"><div className="rail-title"><span className="section-kicker">SEQUÊNCIA</span><strong>Problemas</strong></div><div className="problem-list">{problems.map((item) => <button key={item.id} className={`problem-nav ${problem.id === item.id ? "selected" : ""} ${completed.includes(item.id) ? "done" : ""}`} onClick={() => onOpenProblem(item.id)}><span className="problem-nav-number">{completed.includes(item.id) ? <Check size={12} /> : item.id}</span><span>{item.title}</span>{problem.id === item.id && <ChevronRight size={14} />}</button>)}</div><div className="rail-tip"><Lightbulb size={16} /><span>Não pule a entrega. É ali que o conceito fixa.</span></div></aside><article className="problem-content"><div className="problem-kicker"><span className="eyebrow-line" /> {problem.eyebrow}</div><h1>Problema {problem.id}:<br /><span>{problem.title}</span></h1><p className="problem-summary">{problem.summary}</p><div className="concept-strip"><Sparkles size={17} /><div><span>IDEIA CENTRAL</span><strong>{problem.concept}</strong></div></div><div className="objectives-row">{problem.objectives.map((objective) => <span key={objective}><CheckCircle2 size={14} /> {objective}</span>)}</div><div className="problem-section"><div className="section-heading"><span className="step-number">01</span><div><span className="section-kicker">MISSÃO</span><h2>O que você precisa resolver</h2></div></div><p>{problem.prompt}</p><ol className="steps-list">{problem.steps.map((step, index) => <li key={step}><span>{index + 1}</span>{step}</li>)}</ol></div><div className="problem-section code-section"><div className="section-heading"><span className="step-number">02</span><div><span className="section-kicker">PONTO DE PARTIDA</span><h2>Abra o editor e faça acontecer</h2></div></div><p>Leia o código, execute no seu ambiente e complete as partes que faltam. O objetivo não é copiar: é entender o fluxo.</p><CodeBlock code={problem.code} /><div className="hint-box"><div className="hint-icon"><Lightbulb size={17} /></div><div><strong>Dica progressiva</strong>{hintCount === 0 ? <span>Travou? Desbloqueie uma pista sem revelar tudo de uma vez.</span> : <div className="hint-list">{problem.hints.slice(0, hintCount).map((hint, index) => <span key={hint}><b>{index + 1}.</b> {hint}</span>)}</div>}</div><button className="hint-button" onClick={onHint} disabled={hintCount >= problem.hints.length}>{hintCount >= problem.hints.length ? "todas abertas" : hintCount === 0 ? "abrir dica" : `mais uma (${hintCount}/${problem.hints.length})`}</button></div></div><div className="problem-section deliverable-section"><div className="section-heading"><span className="step-number">03</span><div><span className="section-kicker">ENTREGA</span><h2>Quando considerar concluído</h2></div></div><div className="deliverable-card"><FileCheck2 size={20} /><div><strong>{problem.deliverable}</strong><span>Use os critérios abaixo como uma revisão antes de marcar.</span></div></div><div className="criteria-list">{problem.passCriteria.map((criteria) => <span key={criteria}><Circle size={13} /> {criteria}</span>)}</div></div><div className="problem-footer"><button className={`complete-button ${completed.includes(problem.id) ? "completed" : ""}`} onClick={onMarkComplete}>{completed.includes(problem.id) ? <><CheckCircle2 size={17} /> concluído — desfazer</> : <><Circle size={17} /> marcar como concluído</>}</button><button className="next-button" onClick={onNext}>{problem.id === problems.length ? "ir para verificação final" : "próximo problema"} <ArrowRight size={16} /></button></div></article></div></div>;
}

function ReviewView({ onOpenProblem }: { onOpenProblem: (id: number) => void }) {
  return <div className="page-wrap review-page"><div className="page-intro"><div className="problem-kicker"><span className="eyebrow-line" /> MODO DE REVISÃO</div><h1>O mapa em<br /><span>uma página.</span></h1><p>Use esta tela quando quiser relembrar o raciocínio inteiro antes de voltar para o código.</p></div><div className="review-flow">{quickReview.map((item, index) => <div className="review-step" key={item.label}><div className="review-step-number">0{index + 1}</div><div className="review-step-line" /><div className="review-step-copy"><span>{item.label}</span><strong>{item.text}</strong></div></div>)}</div><div className="review-columns"><div className="review-card"><div className="review-card-icon green"><Database size={19} /></div><span className="section-kicker">FLUXO MENTAL</span><h2>Do arquivo à previsão</h2><div className="mental-flow"><span>inspecionar</span><ChevronRight size={15} /><span>preparar</span><ChevronRight size={15} /><span>validar</span><ChevronRight size={15} /><span>entregar</span></div><p>Se você sabe em que etapa está, fica mais fácil saber qual pergunta fazer.</p></div><div className="review-card dark-card"><div className="review-card-icon yellow"><Terminal size={19} /></div><span className="section-kicker">ATALHO HONESTO</span><h2>Quando o tempo apertar</h2><p>Comece com imputação + OneHotEncoder + Random Forest. Depois melhore uma coisa por vez e nunca abandone o CSV válido.</p><button className="text-button light" onClick={() => onOpenProblem(12)}>ir para submissão <ArrowRight size={15} /></button></div></div><button className="wide-start" onClick={() => onOpenProblem(1)}><span><Play size={17} fill="currentColor" /> refazer a trilha do começo</span><ArrowRight size={17} /></button></div>;
}

function ChecklistView() {
  const sections = [
    { title: "Dados", icon: Database, items: ["Identifiquei o alvo e o identificador.", "Verifiquei tipos, nulos e distribuição das classes.", "Removi colunas que vazam informação."] },
    { title: "Modelo", icon: BarChart3, items: ["Separei treino e validação com random_state.", "Escolhi a métrica que faz sentido.", "Comparei baseline e pelo menos dois modelos."] },
    { title: "Entrega", icon: FileCheck2, items: ["Treinei o modelo final com todo o treino.", "Gerei uma previsão para cada linha do teste.", "Conferi colunas, classes, nulos e index=False."] }
  ];
  return <div className="page-wrap checklist-page"><div className="page-intro compact-intro"><div className="problem-kicker"><span className="eyebrow-line" /> ANTES DE SUBMETER</div><h1>Checklist de<br /><span>competição.</span></h1><p>Uma revisão curta para não perder pontos por um detalhe operacional.</p></div><div className="checklist-grid">{sections.map((section) => <div className="checklist-card" key={section.title}><div className="checklist-card-top"><div className="review-card-icon green"><section.icon size={19} /></div><span>0{sections.indexOf(section) + 1}</span></div><h2>{section.title}</h2><div className="check-items">{section.items.map((item) => <label key={item}><input type="checkbox" /> <span>{item}</span></label>)}</div></div>)}</div><div className="submission-callout"><div><span className="section-kicker">REGRA DE OURO</span><h2>Uma solução válida nas três trilhas vence uma ideia brilhante que não envia.</h2></div><span>revisão local · arquivo final · melhor submissão</span></div></div>;
}

function FinalView({ completed, quizAnswers, quizSubmitted, quizScore, challengeCode, challengeResults, onAnswer, onSubmitQuiz, onResetQuiz, onCodeChange, onRunChallenge }: { completed: number; quizAnswers: Record<number, number>; quizSubmitted: boolean; quizScore: number | null; challengeCode: string; challengeResults: boolean[] | null; onAnswer: (questionId: number, answer: number) => void; onSubmitQuiz: () => void; onResetQuiz: () => void; onCodeChange: (value: string) => void; onRunChallenge: () => void }) {
  const challengePassed = challengeResults?.filter(Boolean).length === finalChallenge.tests.length;
  return <div className="page-wrap final-page"><div className="page-intro final-intro"><div className="problem-kicker"><span className="eyebrow-line" /> GATE DE PREPARAÇÃO</div><h1>Agora prove que<br /><span>entendeu o caminho.</span></h1><p>O final tem duas partes: decisões de conceito e um pequeno problema para organizar em código.</p><div className="final-gate"><span><CheckCircle2 size={15} /> {completed}/12 problemas concluídos</span><span><HelpCircle size={15} /> {quizQuestions.length} perguntas</span><span><Code2 size={15} /> {finalChallenge.tests.length} testes</span></div></div><section className="assessment-block"><div className="assessment-header"><div><span className="section-kicker">PARTE 01 · CONCEITOS</span><h2>Quiz de prontidão</h2></div>{quizSubmitted && <div className={`score-pill ${quizScore !== null && quizScore >= 6 ? "pass" : "retry"}`}>{quizScore}/{quizQuestions.length} acertos</div>}</div><div className="quiz-grid">{quizQuestions.map((question, index) => { const choice = quizAnswers[question.id]; const right = choice === question.answer; return <div className={`quiz-card ${quizSubmitted ? right ? "quiz-right" : choice !== undefined ? "quiz-wrong" : "" : ""}`} key={question.id}><div className="quiz-number">0{index + 1}</div><h3>{question.question}</h3><div className="options">{question.options.map((option, optionIndex) => <button key={option} className={`option ${choice === optionIndex ? "selected" : ""} ${quizSubmitted && optionIndex === question.answer ? "correct-option" : ""} ${quizSubmitted && choice === optionIndex && optionIndex !== question.answer ? "wrong-option" : ""}`} onClick={() => onAnswer(question.id, optionIndex)}><span className="option-radio">{choice === optionIndex ? <span /> : null}</span>{option}</button>)}</div>{quizSubmitted && <div className={`answer-feedback ${right ? "right" : "wrong"}`}>{right ? <CheckCircle2 size={14} /> : <XCircle size={14} />}<span>{right ? "Boa. " : "Ainda não. "}{question.explanation}</span></div>}</div>})}</div><div className="assessment-actions">{!quizSubmitted ? <button className="primary-button" onClick={onSubmitQuiz} disabled={Object.keys(quizAnswers).length < quizQuestions.length}>corrigir quiz <ArrowRight size={16} /></button> : <button className="secondary-button" onClick={onResetQuiz}><RotateCcw size={15} /> tentar novamente</button>}<span>{!quizSubmitted && Object.keys(quizAnswers).length < quizQuestions.length ? `responda tudo para corrigir · ${Object.keys(quizAnswers).length}/${quizQuestions.length}` : quizSubmitted ? quizScore !== null && quizScore >= 6 ? "conceitos prontos para a prova" : "revise e tente mais uma vez" : "sem pegadinhas, só raciocínio"}</span></div></section><section className="assessment-block code-challenge"><div className="assessment-header"><div><span className="section-kicker">PARTE 02 · MÃO NO CÓDIGO</span><h2>{finalChallenge.title}</h2></div>{challengeResults && <div className={`score-pill ${challengePassed ? "pass" : "retry"}`}>{challengeResults.filter(Boolean).length}/{finalChallenge.tests.length} testes</div>}</div><p className="challenge-brief">{finalChallenge.brief}</p><div className="challenge-layout"><div className="challenge-instructions"><span className="instruction-label">O avaliador procura</span>{finalChallenge.requirements.map((requirement, index) => <span key={requirement}><Check size={13} /> {requirement}</span>)}<div className="challenge-note"><Lightbulb size={15} /><span>Este editor avalia o caminho por testes de requisitos. Depois, replique a solução em um notebook real.</span></div></div><div className="editor-wrap"><div className="editor-top"><span><span className="code-dot red" /><span className="code-dot yellow" /><span className="code-dot green" /></span><span>desafio_final.py</span><span className="editor-status">● local</span></div><textarea value={challengeCode} onChange={(event) => onCodeChange(event.target.value)} spellCheck={false} aria-label="Editor do desafio final" /><div className="editor-bottom"><span>python · {challengeCode.split("\n").length} linhas</span><button className="run-button" onClick={onRunChallenge}><Play size={14} fill="currentColor" /> rodar testes</button></div></div></div>{challengeResults && <div className="test-results">{finalChallenge.tests.map((test, index) => <div className={challengeResults[index] ? "test-pass" : "test-fail"} key={test.label}>{challengeResults[index] ? <CheckCircle2 size={15} /> : <XCircle size={15} />}<span>{test.label}</span><small>{challengeResults[index] ? "passou" : "faltou"}</small></div>)}</div>}</section><div className="final-result"><div className="trophy"><Trophy size={24} /></div><div><span className="section-kicker">RESULTADO DA TRILHA</span><h2>{quizSubmitted && challengePassed ? "Você está pronto para montar a solução." : "Seu resultado aparece aqui."}</h2><p>{quizSubmitted && challengePassed ? "Leve o fluxo para o notebook, valide seu CSV e confie no processo." : "Complete o quiz e rode os testes para liberar seu diagnóstico final."}</p></div><div className="result-metrics"><span><strong>{quizScore ?? "—"}</strong><small>quiz</small></span><span><strong>{challengeResults ? `${challengeResults.filter(Boolean).length}/${finalChallenge.tests.length}` : "—"}</strong><small>código</small></span></div></div></div>;
}

export default Home;
