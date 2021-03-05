// @ts-check
const Fs = require('fs');
const Path = require('path');
const AdmZip = require('adm-zip');

const EPUB_CHAPTERS_DIR = 'EPUB/text';

/**
 * @param {AdmZip} zip 
 * @param {string} file 
 * @returns {Promise<Buffer>}
 */
const readZipFile = (zip, file) => new Promise((resolve, reject) => {
  return zip.readFileAsync(file, (data, err) => {
    if (err) {
      return reject(err);
    }
    return resolve(data);
  });
});

/**
 * @param {AdmZip} zip 
 * @param {string} destination 
 * @returns {Promise<void>}
 */
const writeZipFile = (zip, destination) => new Promise((resolve, reject) => {
  return zip.writeZip(destination, err => {
    if (err) {
      return reject(err);
    }
    return resolve();
  });
});

/**
 * @param {string} filePath
 */
const generateEbookForEpub = async (filePath) => {
  const zip = new AdmZip(filePath);
  const chapters = zip.getEntries().filter(e => !e.isDirectory && e.name.endsWith('.xhtml') && e.name.startsWith('ch'));
  const pathsToModify = chapters.map(c => c.entryName);

  for (const path of pathsToModify) {
    const chapterContent = await readZipFile(zip, path);
    const newContent = chapterContent.toString().replace(/^code span\. \{/gm, 'code span {');
    zip.updateFile(path, Buffer.from(newContent));
  }

  await writeZipFile(zip, filePath);
}

generateEbookForEpub('../out/ebook_title-author_name.epub')
