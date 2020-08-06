const fs = require('fs');

const Response = require('./lib/response');
const {loadTemplate} = require('./lib/viewTemplate');
const CONTENT_TYPES = require('./lib/mimeTypes');

const STATIC_FOLDER = `${__dirname}/public`;

const doesFileExist = function (path) {
  const stat = fs.existsSync(path) && fs.statSync(path);
  return !stat || !stat.isFile();
};

const serveStaticFile = function (req) {
  const path = `${STATIC_FOLDER}${req.url}`;

  if (doesFileExist(path)) return new Response();

  const [, extension] = path.match(/.*\.(.*)$/) || [];
  const contentType = CONTENT_TYPES[extension];

  const content = fs.readFileSync(path);

  const res = new Response();
  res.setHeader('Content-Type', contentType);
  res.setHeader('Content-Length', content.length);
  res.statusCode = 200;
  res.body = content;

  return res;
};

const serveHomePage = function (req) {
  req.url = '/index.html';
  return serveStaticFile(req);
};

const replace = function (text, refBag) {

  const replaceWithKeyValue = function (text, key) {
    const pattern = new RegExp(key, 'g');
    return text.replace(pattern, refBag[key]);
  };

  const keys = Object.keys(refBag);
  return keys.reduce(replaceWithKeyValue, text);
};

const redirectTo = function (newUrl) {
  const res = new Response();
  res.setHeader('location', newUrl);
  res.statusCode = 301;
  return res;
};

const findHandler = function (req) {
  if (req.method === 'GET' && req.url === '/') return serveHomePage;
  if (req.method === 'GET') return serveStaticFile;
  return new Response();
};

const processRequest = (req) => {
  const handler = findHandler(req);
  return handler(req);
};

module.exports = {processRequest};