// ESQ Service — загрузчик. Сама программа — в архиве esq.asar рядом с этим файлом (собирает make_update.py из app_src/).
// Обновление скачивается в esq.asar.new и подставляется здесь, до открытия архива; прежняя версия остаётся в esq.asar.prev.
'use strict';
const fs = require('original-fs');   // обычный fs Electron считает .asar папкой
const path = require('path');
const A = path.join(__dirname, 'esq.asar');
try {
  if (fs.existsSync(A + '.new')) {
    if (fs.existsSync(A)) { fs.rmSync(A + '.prev', { force: true }); fs.renameSync(A, A + '.prev'); }
    fs.renameSync(A + '.new', A);
  }
} catch (e) {
  if (!fs.existsSync(A) && fs.existsSync(A + '.prev')) fs.renameSync(A + '.prev', A);
}
// файлы, которые при обновлении были заняты (например, руководство PDF было открыто): rename заменяет файл,
// если он уже свободен; если нет — останется *.new до следующего запуска
try {
  for (const f of fs.readdirSync(__dirname)) {
    if (f.endsWith('.new') && f !== 'esq.asar.new') { try { fs.renameSync(path.join(__dirname, f), path.join(__dirname, f.slice(0, -4))); } catch (e) {} }
  }
} catch (e) {}
// прежние редакции руководства пользователя (doc_ESQ_Service_manual[_x.y.z].pdf) — кроме последней; занятые остаются до следующего запуска
try {
  // номер редакции выравнивается до 4 частей: 2.12 > 2.8.5 (без выравнивания 2.12 давал 2012, а 2.8.5 — 2008005)
  const key = (f) => { const v = (f.match(/_(\d+(?:\.\d+)*)\.pdf$/) || [0, '0'])[1].split('.').map(Number); while (v.length < 4) v.push(0); return v.slice(0, 4).reduce((a, x) => a * 1000 + x, 0); };
  const man = fs.readdirSync(__dirname).filter(f => /^doc_ESQ_Service_manual(_[\d.]+)?\.pdf$/.test(f)).sort((a, b) => key(b) - key(a));
  for (const f of man.slice(1)) { try { fs.rmSync(path.join(__dirname, f), { force: true }); } catch (e) {} }
} catch (e) {}
// файлы версий до 2.8.0 (открытым текстом) больше не нужны
for (const f of ['index.html', 'main.js', 'preload.js', 'docs.js']) { try { fs.rmSync(path.join(__dirname, f), { force: true }); } catch (e) {} }
try { fs.rmSync(path.join(path.dirname(__dirname), 'app_prev'), { recursive: true, force: true }); } catch (e) {}
require(path.join(A, 'main.js'));
