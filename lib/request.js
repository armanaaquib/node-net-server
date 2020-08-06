const addQuery = (query, queryTextLine) => {
  const [key, value] = queryTextLine.split('=');
  query[key] = value;
  return query;
};

const parseQuery = function (queryText) {
  const queryTextLines = queryText.split('&');
  return queryTextLines.reduce(addQuery, {});
};

const extractUrlAndQuery = function (urlWithQuery) {
  const [url, queryText] = urlWithQuery.split("?");
  const query = queryText && parseQuery(queryText);
  return {url, query};
};

const collectHeadersAndBody = function (headersAndBody, line) {
  if (line === '') {
    headersAndBody.body = '';
    return headersAndBody;
  }

  if ('body' in headersAndBody) {
    headersAndBody.body += line;
    return headersAndBody;
  }

  const [key, value] = line.split(':');
  headersAndBody.headers[key.toLowerCase()] = value.toLowerCase();
  return headersAndBody;
};

class Request {

  constructor (method, url, query, headers, body) {
    this.method = method;
    this.url = url;
    this.query = query;
    this.headers = headers;
    this.body = body;
  }

  static createFrom(reqText) {
    const [requestLine, ...headersAndBody] = reqText.split('\r\n');
    const [method, urlWithQuery, protocol] = requestLine.split(' ');

    const {url, query} = extractUrlAndQuery(urlWithQuery);
    let {headers, body} = headersAndBody.reduce(collectHeadersAndBody, {headers: {}});
    body = parseQuery(body);

    return new Request(method, url, query, headers, body);
  }
}

module.exports = Request;