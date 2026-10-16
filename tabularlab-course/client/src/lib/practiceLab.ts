export type LocalClientRow = {
  id: number;
  idade: number | null;
  plano: "basico" | "pro" | "premium";
  meses: number;
  cancelou: 0 | 1;
  status_final: "ativo" | "cancelado";
};

/** Dataset fictício embutido no site: não é enviado a nenhum servidor. */
export const localClientData: LocalClientRow[] = [
  { id: 101, idade: 18, plano: "basico", meses: 2, cancelou: 1, status_final: "cancelado" },
  { id: 102, idade: 25, plano: "pro", meses: 18, cancelou: 0, status_final: "ativo" },
  { id: 103, idade: 32, plano: "pro", meses: 10, cancelou: 0, status_final: "ativo" },
  { id: 104, idade: 41, plano: "basico", meses: 30, cancelou: 1, status_final: "cancelado" },
  { id: 105, idade: null, plano: "basico", meses: 4, cancelou: 1, status_final: "cancelado" },
  { id: 106, idade: 30, plano: "pro", meses: 22, cancelou: 0, status_final: "ativo" },
  { id: 107, idade: 27, plano: "premium", meses: 14, cancelou: 0, status_final: "ativo" },
  { id: 108, idade: 36, plano: "basico", meses: 8, cancelou: 1, status_final: "cancelado" },
];

export type PracticeCheck = { label: string; pattern: string };

/** Verificações textuais de requisitos; não executam código Python arbitrário. */
export const practiceChecks: Record<number, PracticeCheck[]> = {
  1: [
    { label: "Cria ou usa um DataFrame", pattern: "(?:pd\\.)?DataFrame\\s*\\(" },
    { label: "Inspeciona formato ou tipos", pattern: "(?:\\.shape\\b|\\.info\\s*\\(|\\.dtypes\\b)" },
    { label: "Conta as classes do alvo", pattern: "value_counts\\s*\\(" },
  ],
  2: [
    { label: "Agrupa os registros", pattern: "groupby\\s*\\(" },
    { label: "Calcula uma taxa ou média", pattern: "\\.mean\\s*\\(" },
    { label: "Analisa plano, meses ou cancelamento", pattern: "plano|meses|cancelou" },
  ],
  3: [
    { label: "Separa atributos e alvo", pattern: "X\\s*=|y\\s*=" },
    { label: "Cria treino e validação", pattern: "train_test_split\\s*\\(" },
    { label: "Reproduz a divisão", pattern: "random_state\\s*=" },
  ],
  4: [
    { label: "Define uma classe de referência", pattern: "mode\\s*\\(" },
    { label: "Calcula acurácia", pattern: "accuracy_score\\s*\\(" },
    { label: "Calcula F1", pattern: "f1_score\\s*\\(" },
  ],
  5: [
    { label: "Usa regressão logística", pattern: "LogisticRegression\\s*\\(" },
    { label: "Ajusta o modelo", pattern: "\\.fit\\s*\\(" },
    { label: "Gera previsões", pattern: "\\.predict\\s*\\(" },
  ],
  6: [
    { label: "Detecta ou trata valores ausentes", pattern: "isna\\s*\\(|SimpleImputer\\s*\\(" },
    { label: "Aprende a imputação no treino", pattern: "fit_transform\\s*\\(" },
    { label: "Transforma validação sem novo ajuste", pattern: "\\.transform\\s*\\(" },
  ],
  7: [
    { label: "Separa o pré-processamento por tipo", pattern: "ColumnTransformer\\s*\\(" },
    { label: "Codifica categorias", pattern: "OneHotEncoder\\s*\\(" },
    { label: "Aceita categoria ainda não vista", pattern: "handle_unknown\\s*=\\s*[\"']ignore[\"']" },
  ],
  8: [
    { label: "Treina uma Random Forest", pattern: "RandomForestClassifier\\s*\\(" },
    { label: "Configura o número de árvores", pattern: "n_estimators\\s*=" },
    { label: "Fixa a aleatoriedade", pattern: "random_state\\s*=" },
  ],
  9: [
    { label: "Gera a matriz de confusão", pattern: "confusion_matrix\\s*\\(" },
    { label: "Consulta métricas por classe", pattern: "classification_report\\s*\\(|recall_score\\s*\\(" },
    { label: "Compara previsão com rótulo real", pattern: "y_valid" },
  ],
  10: [
    { label: "Faz previsões no treino", pattern: "pred_treino|predict\\s*\\(\\s*X_treino" },
    { label: "Faz previsões na validação", pattern: "pred_valid|predict\\s*\\(\\s*X_valid" },
    { label: "Testa um controle de complexidade", pattern: "max_depth|min_samples_leaf" },
  ],
  11: [
    { label: "Identifica uma coluna suspeita", pattern: "status_final|colunas_proibidas|alvo_calculado" },
    { label: "Remove campos indevidos dos atributos", pattern: "\\.drop\\s*\\(" },
    { label: "Mantém transformações no fluxo de treino", pattern: "Pipeline|fit_transform|SimpleImputer" },
  ],
  12: [
    { label: "Ajusta o modelo", pattern: "\\.fit\\s*\\(" },
    { label: "Prevê as linhas de teste", pattern: "\\.predict\\s*\\(" },
    { label: "Cria o CSV sem coluna de índice", pattern: "to_csv\\s*\\([\\s\\S]*index\\s*=\\s*False" },
    { label: "Inclui identificador e alvo na entrega", pattern: "id[\\s\\S]*target|target[\\s\\S]*id" },
  ],
};

export const localExampleOutput: Record<number, string> = {
  1: "Prévia local: 8 linhas · 6 colunas · alvo cancelou\nClasses: 0 → 4 clientes | 1 → 4 clientes\nAusências em idade: 1",
  2: "Taxa de cancelamento por plano (amostra):\nbasico  1.00\npro     0.00\npremium 0.00\n\nAssociação não demonstra causalidade.",
  3: "Dataset local: 8 linhas\nDivisão de referência (75/25): 6 treino · 2 validação\nLembrete: fixe random_state para repetir o experimento.",
  4: "Baseline local (classe mais frequente):\nAcurácia de referência: 0.50\nCompare também F1 macro para observar cada classe.",
  5: "A amostra tem colunas categóricas e uma idade ausente.\nAntes de treinar regressão logística, selecione numéricas ou use um pré-processador.",
  6: "Ausências encontradas:\nidade  1\nplano  0\nmeses  0\n\nAjuste o imputador no treino; aplique transform na validação.",
  7: "Categorias locais em plano: basico, pro, premium\nUma categoria nova no teste não deve interromper o pipeline.",
  8: "Random Forest: use a mesma divisão e a mesma métrica do baseline.\nOs resultados dependem do código executado fora deste verificador.",
  9: "Alvo local: classes 0 e 1\nLeia a diagonal da matriz como acertos e confira recall por classe.",
  10: "Diagnóstico: compare treino e validação separadamente.\nUma diferença grande é um sinal de alerta, não um diagnóstico definitivo.",
  11: "Colunas locais: id, idade, plano, meses, cancelou, status_final\nCandidatas a remover: id (identificador) e status_final (informação pós-evento).",
  12: "Dataset de treino local: 8 linhas\nDataset de teste de exemplo: 3 linhas\nA submissão deve ter 3 linhas e as colunas id e target.",
};
