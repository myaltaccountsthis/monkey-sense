const { symlink, lstatSync, existsSync, rmSync, readdirSync, unlinkSync, mkdirSync, copyFileSync, cpSync } = require("fs");
const { argv, cwd} = require("process");
const verbose = argv.includes("-v");
const workingDir = cwd();

const log = (message) => {
    if (verbose) {
        console.log(message);
    }
};

// const errorHandler = (err) => {
//     if (err)
//         console.error("Error creating symlink:", err);
// };

// const createLinkIfNotExists = (target, path, callback) => {
//     const targetInfo = lstatSync(target, { throwIfNoEntry: false });
//     const fileInfo = lstatSync(path, { throwIfNoEntry: false });

//     if (targetInfo.isDirectory()) {
//         if (fileInfo?.isDirectory() === false) {
//             log(`Removing existing file at ${path} to create directory`);
//             unlinkSync(path);
//         }
//         if (!existsSync(path))
//             mkdirSync(path);

//         for (const entry of readdirSync(target)) {
//             createLinkIfNotExists(`${target}/${entry}`, `${path}/${entry}`, callback);
//         }
//         return;
//     }

//     const isLink = fileInfo?.isSymbolicLink();
//     if (!isLink) {
//         log(`Creating symlink from ${path} to ${target}`);
//         if (existsSync(path)) {
//             log(`Removing existing file at ${path}`);
//             rmSync(path, { recursive: true }, callback);
//         }
//         symlink(`${workingDir}/${target}`, `${workingDir}/${path}`, "file", callback);
//     }
// };

// createLinkIfNotExists("backend/src/util", "src/util", errorHandler);
// createLinkIfNotExists("backend/.env", ".env", errorHandler);

cpSync("backend/src/util/", "src/util", { recursive: true });
readdirSync("backend").forEach(file => {
    if (file.endsWith(".env")) {
        log(`Copying backend/${file} to ${file.replace("backend/", "")}`);
        copyFileSync(`backend/${file}`, file);
    }
});
cpSync("backend/.env", ".env");