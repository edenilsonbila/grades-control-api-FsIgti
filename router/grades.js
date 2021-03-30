import express from "express";
const router = express.Router();
import { promises as fs } from "fs";
const { readFile, writeFile } = fs;

router.get("/", (_, res) => {
  res.send("index grade!");
});

router.get("/somaNotas/:student/:subject", async (req, res, next) => {
  let data = JSON.parse(await readFile(global.Db));

  var { student, subject } = req.params;

  const notas = data.grades.filter(
    (e) => e.student === student && e.subject === subject
  );

  if (notas.length === 0) {
    res.send("Nenhum registro correspondente ao filtro informado!");
  }

  const notaTotal = notas.reduce((accumulator, current) => {
    return accumulator + current.value;
  }, 0);

  res.send(notaTotal.toString());
});

router.get("/obterTresMelhores/:subject/:type", async (req, res, next) => {
  var data = JSON.parse(await readFile(global.Db));

  const { subject, type } = req.params;

  var dados = data.grades.filter(
    (e) => e.subject === subject && e.type === type
  );

  if (dados.length === 0) res.send("Nenhum registro encontrado!");

  dados = dados.sort((a, b) => b.value - a.value);

  if (dados.length > 3) dados = dados.slice(0, 3);

  res.send(JSON.stringify(dados));
});

router.get("/obterMedia/:subject/:type", async (req, res, next) => {
  let data = JSON.parse(await readFile(global.Db));

  var { type, subject } = req.params;

  const notas = data.grades.filter(
    (e) => e.type === type && e.subject === subject
  );

  if (notas.length === 0) {
    res.send("Nenhum registro correspondente ao filtro informado!");
  }

  const notaTotal = notas.reduce((accumulator, current) => {
    return accumulator + current.value;
  }, 0);

  const total = notas.length;
  logger.info(notaTotal);
  logger.info(total);

  const media = notaTotal / total;

  res.send(media.toString());
});

router.get("/:id", async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.Db));
    const grade = data.grades.find((e) => e.id === parseInt(req.params.id));
    res.send(grade);
    logger.info("GET /account/:id");
  } catch (err) {
    next(err);
  }
});

router.post("/", async (req, res, next) => {
  try {
    let grade = req.body;

    const data = JSON.parse(await readFile(global.Db));

    grade = {
      id: data.nextId++,
      student: grade.student,
      subject: grade.subject,
      type: grade.type,
      value: grade.value,
      timestamp: new Date(),
    };
    data.grades.push(grade);

    await writeFile(global.Db, JSON.stringify(data, null, 2));

    res.send(grade);

    logger.info(`POST /account - ${JSON.stringify(account)}`);
  } catch (err) {
    next(err);
  }
});

router.put("/:id", async (req, res, next) => {
  try {
    if (req.params.id === null) {
      throw new Error("Id nulo!");
    }

    let grade = req.body;

    const data = JSON.parse(await readFile(global.Db));

    let gradeIndex = data.grades.findIndex(
      (a) => a.id === parseInt(req.params.id)
    );

    if (gradeIndex === -1) {
      throw new Error("Registro não encontrado.");
    }

    data.grades[gradeIndex].student = grade.student;
    data.grades[gradeIndex].subject = grade.subject;
    data.grades[gradeIndex].type = grade.type;
    data.grades[gradeIndex].value = grade.value;

    await writeFile(global.Db, JSON.stringify(data, null, 2));

    res.send(grade);

    logger.info(`POST /account - ${JSON.stringify(account)}`);
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const data = JSON.parse(await readFile(global.Db));
    data.grades = data.grades.filter((e) => e.id !== parseInt(req.params.id));
    await writeFile(global.Db, JSON.stringify(data, null, 2));
    res.end();
    logger.info(`DELETE /account/:id - ${req.params.id}`);
  } catch (err) {
    next(err);
  }
});

router.use((err, req, res, next) => {
  logger.error(`${req.method} ${req.baseUrl} - ${err.message}`);
  res.status(400).send({ error: err.message });
});

export default router;
