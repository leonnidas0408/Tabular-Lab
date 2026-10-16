export type Problem = {
  id: number;
  title: string;
  eyebrow: string;
  minutes: number;
  concept: string;
  summary: string;
  objectives: string[];
  prompt: string;
  steps: string[];
  code: string;
  hints: string[];
  deliverable: string;
  passCriteria: string[];
};

export const problems: Problem[] = [
  {
    id: 1,
    title: "Enxergar o dataset",
    eyebrow: "Pandas · inspeção",
    minutes: 35,
    concept: "Antes de modelar, você precisa saber o que cada linha e cada coluna significam.",
    summary: "Abra um CSV fictício, leia o formato, encontre o alvo e faça as primeiras perguntas aos dados.",
    objectives: ["Ler um CSV com pandas", "Distinguir atributos de alvo", "Encontrar tipos e valores ausentes"],
    prompt: "Uma equipe recebeu um arquivo com dados de clientes. Descubra como ele está organizado antes de pensar em qualquer modelo.",
    steps: ["Crie um DataFrame com o dicionário fornecido.", "Use head, shape, info e describe para fazer um raio-X.", "Conte as classes da coluna cancelou e procure nulos.", "Escreva três observações em linguagem normal."],
    code: `import pandas as pd\n\ndados = {\n    "idade": [18, 25, 32, 41, 22, 30, 27, 36],\n    "plano": ["basico", "pro", "pro", "basico", "basico", "pro", "pro", "basico"],\n    "meses": [2, 18, 10, 30, 4, 22, 14, 8],\n    "cancelou": [1, 0, 0, 1, 1, 0, 0, 1]\n}\n\ndf = pd.DataFrame(dados)\n# Comece sua investigação aqui`,
    hints: ["A resposta que o modelo deverá prever é a coluna cancelou.", "Use df.isna().sum() para contar ausências.", "value_counts() mostra quantas vezes cada classe aparece."],
    deliverable: "Um notebook ou script que imprime a inspeção e cinco conclusões sobre os dados.",
    passCriteria: ["Use pandas e crie um DataFrame", "Mostre o tamanho e os tipos", "Conte as classes do alvo"]
  },
  {
    id: 2,
    title: "Perguntar aos dados",
    eyebrow: "Pandas · agrupamentos",
    minutes: 30,
    concept: "Agrupamentos simples revelam padrões e ajudam a formular atributos úteis.",
    summary: "Compare o comportamento das classes por plano, idade e tempo de permanência.",
    objectives: ["Usar groupby", "Calcular médias por grupo", "Separar padrão de explicação causal"],
    prompt: "Descubra quais grupos parecem cancelar mais. O resultado é uma pista, não uma prova de causa.",
    steps: ["Calcule a taxa média de cancelamento por plano.", "Compare clientes com menos e mais meses.", "Faça uma pergunta que os dados ainda não respondem.", "Registre quais padrões podem virar atributos."],
    code: `# Continue usando o df do problema 1\n\ntaxa_por_plano = df.groupby("plano")["cancelou"].mean()\nprint(taxa_por_plano)\n\n# Crie uma coluna faixa_meses e compare as taxas`,
    hints: ["A média de uma coluna 0/1 é a proporção de casos positivos.", "Você pode usar pd.cut para criar faixas.", "Uma associação observada não prova que uma variável causou a outra."],
    deliverable: "Cinco linhas explicando os padrões observados e uma hipótese para investigar.",
    passCriteria: ["Use pelo menos um groupby", "Calcule uma proporção por grupo", "Escreva uma hipótese verificável"]
  },
  {
    id: 3,
    title: "Separar entrada e resposta",
    eyebrow: "Machine Learning · preparação",
    minutes: 35,
    concept: "O modelo recebe X, aprende com y e precisa ser avaliado em dados que não viu.",
    summary: "Monte a divisão entre atributos e alvo e crie conjuntos de treino e validação.",
    objectives: ["Criar X e y", "Separar treino e validação", "Entender stratify e random_state"],
    prompt: "Prepare o dataset de cancelamento para um primeiro experimento de classificação.",
    steps: ["Remova cancelou de X e coloque-a em y.", "Remova qualquer identificador que só nomeia a linha.", "Use train_test_split com 20% para validação.", "Confira os tamanhos e a proporção das classes."],
    code: `from sklearn.model_selection import train_test_split\n\nX = df.drop(columns=["cancelou"])\ny = df["cancelou"]\n\nX_treino, X_valid, y_treino, y_valid = train_test_split(\n    X, y, test_size=0.2, random_state=42, stratify=y\n)`,
    hints: ["X é uma tabela; y é uma Series.", "random_state torna o experimento repetível.", "stratify=y tenta preservar a proporção das classes."],
    deliverable: "Um print com os quatro tamanhos e as proporções de y_treino e y_valid.",
    passCriteria: ["X não contém o alvo", "Existe treino e validação", "A divisão usa random_state"]
  },
  {
    id: 4,
    title: "Criar um baseline",
    eyebrow: "Métricas · referência",
    minutes: 30,
    concept: "Um baseline é uma solução simples que serve de régua para qualquer modelo.",
    summary: "Faça uma previsão ingênua e compare acurácia com F1 macro.",
    objectives: ["Criar uma regra de referência", "Calcular acurácia", "Perceber o efeito do desbalanceamento"],
    prompt: "Se você sempre responder a classe mais frequente, quão bom parece o resultado?", 
    steps: ["Descubra a classe mais frequente em y_treino.", "Repita essa classe para todas as linhas da validação.", "Calcule accuracy e F1 macro.", "Explique qual métrica descreve melhor um cenário desbalanceado."],
    code: `from sklearn.metrics import accuracy_score, f1_score\n\nclasse_comum = y_treino.mode()[0]\npredicoes = [classe_comum] * len(y_valid)\n\nprint(accuracy_score(y_valid, predicoes))\nprint(f1_score(y_valid, predicoes, average="macro"))`,
    hints: ["mode()[0] pega o primeiro valor mais frequente.", "F1 macro calcula o F1 de cada classe e faz uma média simples.", "Uma acurácia alta pode esconder uma classe ignorada."],
    deliverable: "Uma comparação curta entre o baseline e o comportamento desejado do modelo.",
    passCriteria: ["Crie previsões do tamanho da validação", "Calcule acurácia e F1", "Explique a limitação do baseline"]
  },
  {
    id: 5,
    title: "Treinar o primeiro classificador",
    eyebrow: "Modelos · regressão logística",
    minutes: 45,
    concept: "Classificação supervisionada aprende uma relação entre atributos e rótulos conhecidos.",
    summary: "Use atributos numéricos para treinar uma regressão logística e comparar com o baseline.",
    objectives: ["Treinar um modelo", "Usar fit e predict", "Comparar resultados na validação"],
    prompt: "Crie um modelo rápido, interprete o resultado e escreva o que ainda está faltando no pipeline.",
    steps: ["Selecione somente colunas numéricas.", "Treine LogisticRegression com max_iter=1000.", "Faça predições no conjunto de validação.", "Compare acurácia e F1 com o problema 4."],
    code: `from sklearn.linear_model import LogisticRegression\n\nmodelo = LogisticRegression(max_iter=1000)\nmodelo.fit(X_treino_numerico, y_treino)\npredicoes = modelo.predict(X_valid_numerico)`,
    hints: ["O modelo não aceita texto bruto.", "fit aprende; predict aplica o que foi aprendido.", "A validação deve continuar separada do treinamento."],
    deliverable: "Uma tabela com baseline versus regressão logística e uma escolha justificada.",
    passCriteria: ["Chame fit no treino", "Chame predict na validação", "Calcule pelo menos uma métrica"]
  },
  {
    id: 6,
    title: "Consertar dados incompletos",
    eyebrow: "Pré-processamento · nulos",
    minutes: 40,
    concept: "Dados reais têm ausências; o tratamento precisa aprender somente com o treino.",
    summary: "Use imputação dentro de um fluxo seguro e evite aprender estatísticas da validação.",
    objectives: ["Detectar nulos", "Usar SimpleImputer", "Evitar vazamento no pré-processamento"],
    prompt: "O pipeline quebra porque há idades desconhecidas. Preencha-as sem contaminar a validação.",
    steps: ["Conte os nulos por coluna.", "Use mediana para numéricas e moda para categorias.", "Faça fit_transform no treino e transform nos outros conjuntos.", "Compare o resultado antes e depois."],
    code: `from sklearn.impute import SimpleImputer\n\nimputer = SimpleImputer(strategy="median")\nX_treino_ok = imputer.fit_transform(X_treino_numerico)\nX_valid_ok = imputer.transform(X_valid_numerico)`,
    hints: ["A mediana deve ser calculada apenas no treino.", "Se você fizer fit na validação, ela influencia o preparo.", "Pipeline automatiza esse contrato."],
    deliverable: "Um pipeline que executa sem erro mesmo com valores ausentes.",
    passCriteria: ["Nulos são tratados", "fit acontece somente no treino", "A validação continua com o mesmo formato"]
  },
  {
    id: 7,
    title: "Colocar categorias no idioma do modelo",
    eyebrow: "Pré-processamento · one-hot",
    minutes: 55,
    concept: "Categorias precisam ser codificadas; OneHotEncoder transforma rótulos em colunas binárias.",
    summary: "Monte um ColumnTransformer com caminhos diferentes para colunas numéricas e categóricas.",
    objectives: ["Separar tipos de coluna", "Usar OneHotEncoder", "Ignorar categorias novas com segurança"],
    prompt: "Faça o modelo usar idade, meses e plano sem transformar categorias em números com ordem inventada.",
    steps: ["Liste colunas numéricas e categóricas.", "Crie dois transformadores no ColumnTransformer.", "Use handle_unknown=ignore.", "Coloque o classificador depois do preprocessamento."],
    code: `from sklearn.compose import ColumnTransformer\nfrom sklearn.preprocessing import OneHotEncoder\nfrom sklearn.pipeline import Pipeline\n\npreprocessamento = ColumnTransformer([\n    ("num", SimpleImputer(strategy="median"), colunas_numericas),\n    ("cat", Pipeline([\n        ("imputer", SimpleImputer(strategy="most_frequent")),\n        ("onehot", OneHotEncoder(handle_unknown="ignore"))\n    ]), colunas_categoricas)\n])`,
    hints: ["One-hot cria uma coluna para cada categoria observada.", "handle_unknown evita quebra se o teste tiver uma categoria nova.", "O pipeline pode receber DataFrames com texto."],
    deliverable: "Um classificador que usa todas as colunas sem erro de tipos.",
    passCriteria: ["Use ColumnTransformer", "Use OneHotEncoder", "Inclua imputação para categorias"]
  },
  {
    id: 8,
    title: "Escolher uma floresta",
    eyebrow: "Modelos · Random Forest",
    minutes: 45,
    concept: "Random Forest combina várias árvores e costuma ser uma ótima linha de base para tabelas.",
    summary: "Compare regressão logística, árvore e floresta usando exatamente a mesma validação.",
    objectives: ["Treinar RandomForestClassifier", "Comparar modelos", "Controlar repetibilidade e tempo"],
    prompt: "Escolha uma primeira solução competitiva sem criar um laboratório impossível de depurar.",
    steps: ["Treine uma árvore simples.", "Treine uma floresta com n_estimators=300.", "Registre F1 macro, acurácia e tempo aproximado.", "Escolha pela validação, não por preferência."],
    code: `from sklearn.ensemble import RandomForestClassifier\n\nfloresta = RandomForestClassifier(\n    n_estimators=300, random_state=42, n_jobs=-1\n)\n\nmodelo = Pipeline([\n    ("preprocessamento", preprocessamento),\n    ("classificador", floresta)\n])`,
    hints: ["Mais árvores aumentam o custo, mas estabilizam o resultado.", "random_state permite comparar mudanças.", "O melhor modelo é o que valida melhor e termina a tempo."],
    deliverable: "Um placar comparativo com quatro modelos e uma decisão técnica.",
    passCriteria: ["Random Forest executa", "A comparação usa a mesma divisão", "A decisão menciona métrica e custo"]
  },
  {
    id: 9,
    title: "Ler a matriz de confusão",
    eyebrow: "Métricas · análise de erros",
    minutes: 35,
    concept: "A pontuação resume; a matriz de confusão mostra onde o modelo está errando.",
    summary: "Investigue quais classes são confundidas e escreva três hipóteses de melhoria.",
    objectives: ["Gerar matriz de confusão", "Analisar recall por classe", "Transformar erro em hipótese"],
    prompt: "O modelo está com F1 razoável, mas a equipe não sabe qual grupo ele perde. Abra a caixa-preta.",
    steps: ["Gere confusion_matrix.", "Leia linhas como classe real e colunas como previsão.", "Use classification_report.", "Escolha cinco exemplos errados e procure um padrão."],
    code: `from sklearn.metrics import confusion_matrix, classification_report\n\nprint(confusion_matrix(y_valid, predicoes))\nprint(classification_report(y_valid, predicoes))`,
    hints: ["A diagonal representa acertos.", "Recall baixo significa que muitos exemplos daquela classe escaparam.", "Uma hipótese precisa ser testada com uma mudança isolada."],
    deliverable: "Uma análise de cinco erros com três melhorias possíveis.",
    passCriteria: ["Mostre a matriz", "Consulte precision/recall/F1", "Descreva um erro concreto"]
  },
  {
    id: 10,
    title: "Não se apaixonar pelo treino",
    eyebrow: "Validação · overfitting",
    minutes: 40,
    concept: "Overfitting acontece quando o modelo memoriza o treino e perde generalização.",
    summary: "Compare treino e validação, identifique um caso de overfitting e teste um controle.",
    objectives: ["Comparar pontuações", "Ajustar profundidade", "Entender generalização"],
    prompt: "Uma árvore tem 100% no treino. Descubra se isso é desempenho real ou memória.",
    steps: ["Calcule F1 no treino e na validação.", "Teste max_depth e min_samples_leaf.", "Anote a diferença entre as pontuações.", "Prefira um resultado um pouco menor no treino, mas estável na validação."],
    code: `pred_treino = modelo.predict(X_treino)\npred_valid = modelo.predict(X_valid)\n\nprint(f1_score(y_treino, pred_treino, average="macro"))\nprint(f1_score(y_valid, pred_valid, average="macro"))`,
    hints: ["Grande distância entre treino e validação é um alerta.", "Limitar complexidade reduz a capacidade de decorar.", "Uma única divisão pode ser instável; repita quando houver tempo."],
    deliverable: "Um gráfico ou anotação com treino versus validação antes e depois do controle.",
    passCriteria: ["Calcule as duas pontuações", "Identifique a diferença", "Teste uma configuração menos complexa"]
  },
  {
    id: 11,
    title: "Cortar o vazamento",
    eyebrow: "Boas práticas · leakage",
    minutes: 40,
    concept: "Vazamento dá uma validação artificialmente boa ao usar informação que não estaria disponível no momento da previsão.",
    summary: "Detecte atributos proibidos e revise a ordem de todas as transformações.",
    objectives: ["Reconhecer leakage", "Remover colunas indevidas", "Proteger a validação"],
    prompt: "Uma coluna chamada status_final aparece no CSV. Decida se ela pode entrar no modelo.",
    steps: ["Pergunte quando cada coluna existiria no mundo real.", "Procure cópias do alvo e agregações que usam o alvo.", "Remova IDs e campos pós-evento.", "Treine novamente e compare a queda honesta."],
    code: `colunas_proibidas = ["id", "status_final", "alvo_calculado"]\nX = treino.drop(columns=[alvo, *colunas_proibidas], errors="ignore")\n\n# Toda transformação que aprende deve ficar dentro do pipeline`,
    hints: ["Se a coluna só existe depois da decisão, ela não pode prever a decisão.", "Uma pontuação que cai depois de remover leakage pode ser mais confiável.", "Nunca use o rótulo para criar atributos antes da divisão."],
    deliverable: "Uma lista de colunas removidas com a justificativa de cada uma.",
    passCriteria: ["Identifique pelo menos uma coluna suspeita", "Explique por que ela vaza informação", "Refaça o pipeline sem ela"]
  },
  {
    id: 12,
    title: "Entregar sem erro",
    eyebrow: "Competição · submissão",
    minutes: 50,
    concept: "Uma solução ótima que não gera o arquivo correto vale zero; submissão é parte do modelo.",
    summary: "Treine com todos os dados, preveja o teste e valide o CSV final como uma equipe de competição.",
    objectives: ["Treinar com X e y completos", "Gerar predições de teste", "Validar linhas, rótulos e colunas"],
    prompt: "Você recebeu treino.csv e teste.csv. Gere submissao_tabular.csv pronto para o avaliador.",
    steps: ["Inspecione treino e teste separadamente.", "Valide o modelo com uma divisão local.", "Depois do modelo escolhido, faça fit com todo treino.", "Gere o CSV com identificador e alvo, sem índice.", "Confirme quantidade de linhas, nulos, classes e nome do arquivo."],
    code: `modelo.fit(X, y)\npredicoes_teste = modelo.predict(X_teste)\n\nsubmissao = pd.DataFrame({\n    "id": teste["id"],\n    "target": predicoes_teste\n})\nsubmissao.to_csv("submissao_tabular.csv", index=False)`,
    hints: ["A validação serve para escolher; o treino completo serve para entregar.", "O teste não tem alvo conhecido, então não calcule métrica nele.", "Leia o CSV salvo de volta com pandas e faça as conferências."],
    deliverable: "Um CSV válido e um relatório curto com modelo, pré-processamento, métrica e decisões.",
    passCriteria: ["Treine com todo o treino", "Gere uma predição por linha do teste", "Salve sem índice e confira o arquivo"]
  }
];

export const quizQuestions = [
  { id: 1, question: "Qual é a função de X e y em um problema supervisionado?", options: ["X são os atributos e y é o alvo", "X é o alvo e y são os IDs", "X é a validação e y é o teste", "Ambos são sempre textos"], answer: 0, explanation: "X reúne as entradas; y contém a resposta conhecida usada no treinamento." },
  { id: 2, question: "Por que separar treino e validação?", options: ["Para aumentar o número de colunas", "Para medir generalização em dados não usados no ajuste", "Para remover todas as categorias", "Para esconder o código"], answer: 1, explanation: "A validação simula dados ainda não vistos pelo modelo." },
  { id: 3, question: "Qual prática evita leakage ao imputar valores?", options: ["Fazer fit no teste", "Calcular a mediana usando tudo", "Aprender a imputação no treino e só transformar os demais", "Preencher com o alvo"], answer: 2, explanation: "Estatísticas de pré-processamento também precisam ser aprendidas apenas no treino." },
  { id: 4, question: "Para que serve handle_unknown='ignore'?", options: ["Criar mais linhas", "Evitar quebra com categorias novas no teste", "Excluir o alvo", "Aumentar sempre o F1"], answer: 1, explanation: "O encoder consegue transformar categorias não vistas sem lançar erro." },
  { id: 5, question: "O que é baseline?", options: ["Um modelo de referência simples", "A melhor rede neural possível", "O arquivo de teste", "Um erro de Python"], answer: 0, explanation: "Baseline é a régua que ajuda a saber se o modelo realmente melhorou." },
  { id: 6, question: "O que sugere F1 de treino muito maior que o de validação?", options: ["Underfitting garantido", "Overfitting possível", "CSV perfeito", "Ausência de alvo"], answer: 1, explanation: "Uma diferença grande sugere que o modelo memorizou o treino." },
  { id: 7, question: "O que representa a diagonal da matriz de confusão?", options: ["Os acertos por classe", "Os valores ausentes", "Os identificadores", "O tempo de treinamento"], answer: 0, explanation: "A diagonal reúne casos em que classe real e previsão coincidem." },
  { id: 8, question: "Por que salvar a submissão com index=False?", options: ["Para remover as linhas", "Para não criar uma coluna de índice extra", "Para embaralhar classes", "Para treinar de novo"], answer: 1, explanation: "O índice do pandas não é uma coluna esperada pelo avaliador." }
];

export const finalChallenge = {
  title: "Desafio de código · Submissão sem susto",
  brief: "Escreva uma função que receba treino e teste, treine um classificador tabular e devolva um DataFrame de submissão.",
  requirements: [
    "Use pandas para manipular os DataFrames.",
    "Separe a coluna target dos atributos.",
    "Não use a coluna id como atributo.",
    "Treine um classificador com fit.",
    "Gere previsões com predict.",
    "Retorne as colunas id e target, na mesma quantidade de linhas de teste."
  ],
  starter: `def criar_submissao(treino, teste):\n    # seu código aqui\n    pass`,
  tests: [
    { label: "A função existe", token: "def criar_submissao" },
    { label: "Separa o alvo", token: "target" },
    { label: "Remove o identificador", token: "id" },
    { label: "Treina um modelo", token: ".fit" },
    { label: "Faz previsões", token: ".predict" },
    { label: "Retorna uma submissão", token: "return" }
  ]
};

export const quickReview = [
  { label: "Antes de treinar", text: "Entenda linhas, tipos, nulos, alvo, IDs e distribuição das classes." },
  { label: "Durante a validação", text: "Separe dados, use uma métrica adequada e evite aprender com validação/teste." },
  { label: "Antes de enviar", text: "Confira linhas, colunas, rótulos, nulos, nome do arquivo e índice extra." }
];
