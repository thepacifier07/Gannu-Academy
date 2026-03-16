/**
 * generate-json.js
 *
 * Converts a single master data file into:
 * - data/catalog.json
 * - one JSON file per class/subject
 *
 * Usage:
 *   node generate-json.js
 *
 * Expected input:
 *   ./source-data.json
 */

const fs = require("fs");
const path = require("path");

const SOURCE_FILE = path.join(__dirname, "source-data.json");
const DATA_DIR = path.join(__dirname, "data");

function slugify(value) {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
}

function loadSource() {
  if (!fs.existsSync(SOURCE_FILE)) {
    throw new Error(
      `Missing source file: ${SOURCE_FILE}\nCreate source-data.json first.`
    );
  }

  const raw = fs.readFileSync(SOURCE_FILE, "utf8");
  return JSON.parse(raw);
}

/**
 * Expected source-data.json shape:
 * {
 *   "classes": [
 *     {
 *       "name": "Class 6",
 *       "subjects": [
 *         {
 *           "name": "Science",
 *           "chapters": [
 *             {
 *               "id": "chapter-1",
 *               "title": "Food: Where Does It Come From?",
 *               "qa": [
 *                 {
 *                   "question": "What do herbivores eat?",
 *                   "answer": "Herbivores eat plants."
 *                 }
 *               ]
 *             }
 *           ]
 *         }
 *       ]
 *     }
 *   ]
 * }
 */

function build() {
  const source = loadSource();

  if (!source.classes || !Array.isArray(source.classes)) {
    throw new Error(`source-data.json must contain a "classes" array.`);
  }

  ensureDir(DATA_DIR);

  const catalog = {
    classes: []
  };

  for (const classItem of source.classes) {
    if (!classItem.name) {
      throw new Error(`Each class must have a "name".`);
    }

    const classSlug = slugify(classItem.name);
    const subjects = Array.isArray(classItem.subjects) ? classItem.subjects : [];

    const catalogClass = {
      id: classSlug,
      name: classItem.name,
      subjects: []
    };

    for (const subjectItem of subjects) {
      if (!subjectItem.name) {
        throw new Error(`Each subject in ${classItem.name} must have a "name".`);
      }

      const subjectSlug = slugify(subjectItem.name);

      const fileName = `${classSlug}-${subjectSlug}.json`;
      const filePath = path.join(DATA_DIR, fileName);

      const chapters = Array.isArray(subjectItem.chapters)
        ? subjectItem.chapters.map((chapter, index) => ({
            id: chapter.id || `chapter-${index + 1}`,
            title: chapter.title || `Chapter ${index + 1}`,
            qa: Array.isArray(chapter.qa)
              ? chapter.qa.map((item) => ({
                  question: item.question || "",
                  answer: item.answer || ""
                }))
              : []
          }))
        : [];

      const subjectJson = {
        class: {
          id: classSlug,
          name: classItem.name
        },
        subject: {
          id: subjectSlug,
          name: subjectItem.name
        },
        chapters
      };

      writeJson(filePath, subjectJson);

      catalogClass.subjects.push({
        id: subjectSlug,
        name: subjectItem.name,
        file: `data/${fileName}`
      });
    }

    catalog.classes.push(catalogClass);
  }

  writeJson(path.join(DATA_DIR, "catalog.json"), catalog);

  console.log("JSON files generated successfully.");
  console.log(`Catalog: ${path.join("data", "catalog.json")}`);
}

try {
  build();
} catch (error) {
  console.error("Error generating JSON:");
  console.error(error.message);
  process.exit(1);
}
