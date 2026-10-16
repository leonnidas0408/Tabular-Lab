# Tabular Lab — Curso Prático de IA

Curso web interativo em português para aprender classificação tabular com Python e scikit-learn, com 12 problemas progressivos, revisão rápida, checklist de competição, quiz final e desafio de código.

## Rodar localmente

```bash
pnpm install
pnpm dev:static
```

Depois, abra `http://localhost:3000`.

## Verificar e gerar build

```bash
pnpm check
pnpm build:static
```

O build estático é gerado em `dist/public`.

## Publicar em um novo repositório GitHub

1. Crie um repositório vazio no GitHub, de preferência privado.
2. Extraia este ZIP.
3. Dentro da pasta extraída, execute:

```bash
git init
git add .
git commit -m "feat: criar Tabular Lab"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
git push -u origin main
```

O progresso dos estudantes é salvo localmente no navegador com `localStorage`; não há banco de dados ou chave secreta no projeto.
