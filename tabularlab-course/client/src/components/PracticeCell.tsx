import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, ChevronDown, Database, Play, RotateCcw, Terminal } from "lucide-react";
import { localClientData, localExampleOutput, practiceChecks } from "@/lib/practiceLab";

type Props = { problemId: number; starterCode: string };
type Verification = { passed: boolean[]; output: string };

const storageKey = (problemId: number) => `tabular-lab-practice-v1-${problemId}`;

function readSavedCode(problemId: number, fallback: string) {
  try {
    return localStorage.getItem(storageKey(problemId)) ?? fallback;
  } catch {
    return fallback;
  }
}

export default function PracticeCell({ problemId, starterCode }: Props) {
  const [code, setCode] = useState(() => readSavedCode(problemId, starterCode));
  const [verification, setVerification] = useState<Verification | null>(null);
  const [dataOpen, setDataOpen] = useState(true);
  const checks = useMemo(() => practiceChecks[problemId] ?? [], [problemId]);

  useEffect(() => {
    setCode(readSavedCode(problemId, starterCode));
    setVerification(null);
  }, [problemId, starterCode]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey(problemId), code);
    } catch {
      // O exercício continua utilizável mesmo se o navegador bloquear armazenamento local.
    }
  }, [problemId, code]);

  const runVerifier = () => {
    const withoutComments = code.replace(/^\s*#.*$/gm, "");
    const passed = checks.map(({ pattern }) => new RegExp(pattern, "im").test(withoutComments));
    const total = passed.filter(Boolean).length;
    const output = total === checks.length
      ? `Verificação concluída: ${total}/${checks.length} requisitos encontrados.\n\n${localExampleOutput[problemId] ?? ""}`
      : `Verificação parcial: ${total}/${checks.length} requisitos encontrados.\nComplete os itens pendentes e rode o verificador novamente.\n\n${localExampleOutput[problemId] ?? ""}`;
    setVerification({ passed, output });
  };

  const resetCode = () => {
    setCode(starterCode);
    setVerification(null);
  };

  return (
    <section className="practice-lab" aria-label={`Célula prática do módulo ${problemId}`}>
      <div className="practice-heading">
        <div className="practice-heading-icon"><Terminal size={16} /></div>
        <div className="practice-heading-copy">
          <span className="section-kicker">CÉLULA DE COMANDO · MÓDULO {String(problemId).padStart(2, "0")}</span>
          <strong>Experimente com dados locais</strong>
        </div>
        <span className="practice-local-badge"><span /> sem servidor</span>
      </div>

      <div className="practice-data">
        <button className="practice-data-toggle" onClick={() => setDataOpen((open) => !open)} aria-expanded={dataOpen}>
          <span><Database size={14} /> clientes_local.csv <small>{localClientData.length} linhas · dados fictícios</small></span>
          <ChevronDown size={15} className={dataOpen ? "is-open" : ""} />
        </button>
        {dataOpen && (
          <div className="practice-table-scroll">
            <table>
              <thead><tr><th>id</th><th>idade</th><th>plano</th><th>meses</th><th>cancelou</th><th>status_final</th></tr></thead>
              <tbody>{localClientData.map((row) => <tr key={row.id}>
                <td>{row.id}</td><td>{row.idade ?? "—"}</td><td>{row.plano}</td><td>{row.meses}</td><td>{row.cancelou}</td><td>{row.status_final}</td>
              </tr>)}</tbody>
            </table>
          </div>
        )}
      </div>

      <div className="practice-editor">
        <div className="practice-editor-bar">
          <span><span className="code-dot red" /><span className="code-dot yellow" /><span className="code-dot green" /></span>
          <span className="practice-file-name">celula_{String(problemId).padStart(2, "0")}.py</span>
          <span className="practice-saved"><span /> rascunho neste navegador</span>
        </div>
        <label className="sr-only" htmlFor={`practice-code-${problemId}`}>Código Python do módulo {problemId}</label>
        <textarea id={`practice-code-${problemId}`} value={code} onChange={(event) => { setCode(event.target.value); setVerification(null); }} spellCheck={false} aria-describedby={`practice-note-${problemId}`} />
        <div className="practice-editor-footer">
          <span>Python · {code.split("\n").length} linhas</span>
          <div>
            <button className="practice-reset" onClick={resetCode} title="Restaurar código inicial"><RotateCcw size={13} /><span>Restaurar</span></button>
            <button className="practice-run" onClick={runVerifier}><Play size={13} fill="currentColor" /> verificar código</button>
          </div>
        </div>
      </div>

      <p className="practice-disclaimer" id={`practice-note-${problemId}`}>
        Verificador local de requisitos: analisa padrões no texto do código; não executa Python nem envia dados. A saída abaixo é uma referência calculada para a amostra.
      </p>

      {verification && <div className="practice-feedback" aria-live="polite">
        <div className="practice-check-list">{checks.map((check, index) => <div className={verification.passed[index] ? "check-ok" : "check-pending"} key={check.label}>
          {verification.passed[index] ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}<span>{check.label}</span><small>{verification.passed[index] ? "encontrado" : "pendente"}</small>
        </div>)}</div>
        <pre>{verification.output}</pre>
      </div>}
    </section>
  );
}
