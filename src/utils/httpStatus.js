/**
 * HTTP status code reference data and filter function.
 */

export const HTTP_STATUS_CODES = [
  // 1xx Informational
  { code: 100, text: 'Continue', category: '1xx', description: 'The server has received the request headers and the client should proceed to send the request body.' },
  { code: 101, text: 'Switching Protocols', category: '1xx', description: 'The server is switching to a different protocol as requested by the client (e.g., WebSocket upgrade).' },
  { code: 102, text: 'Processing', category: '1xx', description: 'The server has received and is processing the request, but no response is available yet (WebDAV).' },
  { code: 103, text: 'Early Hints', category: '1xx', description: 'The server sends preliminary headers to let the client preload resources while the final response is prepared.' },

  // 2xx Success
  { code: 200, text: 'OK', category: '2xx', description: 'The request succeeded. The response body contains the requested resource.' },
  { code: 201, text: 'Created', category: '2xx', description: 'The request succeeded and a new resource was created (typically from POST or PUT).' },
  { code: 202, text: 'Accepted', category: '2xx', description: 'The request has been accepted for processing, but processing is not yet complete.' },
  { code: 203, text: 'Non-Authoritative Information', category: '2xx', description: 'The response contains modified metadata from a third-party copy, not the origin server.' },
  { code: 204, text: 'No Content', category: '2xx', description: 'The request succeeded but there is no content to return. Common for DELETE operations.' },
  { code: 205, text: 'Reset Content', category: '2xx', description: 'The server asks the client to reset the document view (e.g., clear a form after submission).' },
  { code: 206, text: 'Partial Content', category: '2xx', description: 'The server is delivering only part of the resource due to a Range header sent by the client.' },
  { code: 207, text: 'Multi-Status', category: '2xx', description: 'The response body contains multiple status codes for multiple sub-operations (WebDAV).' },
  { code: 208, text: 'Already Reported', category: '2xx', description: 'The members of a DAV binding have already been enumerated and are not included again.' },
  { code: 226, text: 'IM Used', category: '2xx', description: 'The server fulfilled a GET request with instance-manipulations applied to the current instance.' },

  // 3xx Redirection
  { code: 300, text: 'Multiple Choices', category: '3xx', description: 'The request has multiple possible responses. The user or agent should choose one.' },
  { code: 301, text: 'Moved Permanently', category: '3xx', description: 'The requested resource has been permanently moved to a new URL. All future requests should use the new URL.' },
  { code: 302, text: 'Found', category: '3xx', description: 'The resource is temporarily at a different URL. The client should continue to use the original URL for future requests.' },
  { code: 303, text: 'See Other', category: '3xx', description: 'The server directs the client to retrieve the resource at a different URL with a GET request.' },
  { code: 304, text: 'Not Modified', category: '3xx', description: 'The resource has not been modified since the last request. The client can use its cached copy.' },
  { code: 307, text: 'Temporary Redirect', category: '3xx', description: 'The resource is temporarily at a different URL. Unlike 302, the request method must not change.' },
  { code: 308, text: 'Permanent Redirect', category: '3xx', description: 'The resource has permanently moved. Unlike 301, the request method must not change.' },

  // 4xx Client Error
  { code: 400, text: 'Bad Request', category: '4xx', description: 'The server cannot process the request due to malformed syntax, invalid framing, or deceptive routing.' },
  { code: 401, text: 'Unauthorized', category: '4xx', description: 'Authentication is required and has either failed or not been provided. Include valid credentials.' },
  { code: 402, text: 'Payment Required', category: '4xx', description: 'Reserved for future use. Some APIs use this to indicate billing or quota limits.' },
  { code: 403, text: 'Forbidden', category: '4xx', description: 'The server understood the request but refuses to authorize it. Authentication will not help.' },
  { code: 404, text: 'Not Found', category: '4xx', description: 'The server cannot find the requested resource. The URL may be wrong or the resource may have been deleted.' },
  { code: 405, text: 'Method Not Allowed', category: '4xx', description: 'The HTTP method used is not supported for this resource (e.g., POST on a read-only endpoint).' },
  { code: 406, text: 'Not Acceptable', category: '4xx', description: 'The server cannot produce a response matching the Accept headers sent by the client.' },
  { code: 407, text: 'Proxy Authentication Required', category: '4xx', description: 'The client must authenticate itself with the proxy before the request can proceed.' },
  { code: 408, text: 'Request Timeout', category: '4xx', description: 'The server timed out waiting for the client to finish sending the request.' },
  { code: 409, text: 'Conflict', category: '4xx', description: 'The request conflicts with the current state of the target resource (e.g., edit conflict, duplicate key).' },
  { code: 410, text: 'Gone', category: '4xx', description: 'The resource has been permanently removed and is no longer available. Unlike 404, this is intentional.' },
  { code: 411, text: 'Length Required', category: '4xx', description: 'The server requires a Content-Length header in the request.' },
  { code: 412, text: 'Precondition Failed', category: '4xx', description: 'One or more conditions in the request headers (e.g., If-Match) evaluated to false on the server.' },
  { code: 413, text: 'Payload Too Large', category: '4xx', description: 'The request body exceeds the size limit the server is willing or able to process.' },
  { code: 414, text: 'URI Too Long', category: '4xx', description: 'The request URI is too long for the server to interpret.' },
  { code: 415, text: 'Unsupported Media Type', category: '4xx', description: 'The Content-Type of the request body is not supported by the server for this endpoint.' },
  { code: 416, text: 'Range Not Satisfiable', category: '4xx', description: 'The Range header in the request cannot be satisfied — the range is outside the resource size.' },
  { code: 417, text: 'Expectation Failed', category: '4xx', description: 'The server cannot meet the expectation specified in the Expect request header.' },
  { code: 418, text: "I'm a Teapot", category: '4xx', description: 'The server refuses to brew coffee because it is a teapot (RFC 2324). An April Fools\' joke that persisted.' },
  { code: 422, text: 'Unprocessable Entity', category: '4xx', description: 'The server understands the request but cannot process it due to semantic errors in the body (WebDAV).' },
  { code: 423, text: 'Locked', category: '4xx', description: 'The resource is locked and cannot be modified (WebDAV).' },
  { code: 424, text: 'Failed Dependency', category: '4xx', description: 'The request failed because it depended on another request that also failed (WebDAV).' },
  { code: 425, text: 'Too Early', category: '4xx', description: 'The server is unwilling to process a request that might be replayed (TLS early data).' },
  { code: 426, text: 'Upgrade Required', category: '4xx', description: 'The server refuses the request using the current protocol and requires the client to upgrade (e.g., to TLS).' },
  { code: 428, text: 'Precondition Required', category: '4xx', description: 'The server requires conditional headers (e.g., If-Match) to prevent lost updates.' },
  { code: 429, text: 'Too Many Requests', category: '4xx', description: 'The user has sent too many requests in a given time window (rate limiting).' },
  { code: 431, text: 'Request Header Fields Too Large', category: '4xx', description: 'The server refuses the request because the header fields are too large (often cookies).' },
  { code: 451, text: 'Unavailable For Legal Reasons', category: '4xx', description: 'The resource is unavailable due to legal demands (e.g., censorship, DMCA takedown).' },

  // 5xx Server Error
  { code: 500, text: 'Internal Server Error', category: '5xx', description: 'The server encountered an unexpected condition that prevented it from fulfilling the request.' },
  { code: 501, text: 'Not Implemented', category: '5xx', description: 'The server does not support the functionality required to fulfill the request.' },
  { code: 502, text: 'Bad Gateway', category: '5xx', description: 'The server, acting as a gateway, received an invalid response from an upstream server.' },
  { code: 503, text: 'Service Unavailable', category: '5xx', description: 'The server is temporarily unable to handle the request, usually due to overload or maintenance.' },
  { code: 504, text: 'Gateway Timeout', category: '5xx', description: 'The server, acting as a gateway, did not receive a timely response from the upstream server.' },
  { code: 505, text: 'HTTP Version Not Supported', category: '5xx', description: 'The server does not support the HTTP version used in the request.' },
  { code: 506, text: 'Variant Also Negotiates', category: '5xx', description: 'Content negotiation resulted in a circular reference.' },
  { code: 507, text: 'Insufficient Storage', category: '5xx', description: 'The server cannot store the representation needed to complete the request (WebDAV).' },
  { code: 508, text: 'Loop Detected', category: '5xx', description: 'The server detected an infinite loop while processing the request (WebDAV).' },
  { code: 510, text: 'Not Extended', category: '5xx', description: 'The server requires further extensions to the request in order to fulfill it.' },
  { code: 511, text: 'Network Authentication Required', category: '5xx', description: 'The client needs to authenticate to gain network access (e.g., captive portal).' },
];

export const CATEGORIES = ['All', '1xx', '2xx', '3xx', '4xx', '5xx'];

export const CATEGORY_LABELS = {
  All: 'All',
  '1xx': '1xx Info',
  '2xx': '2xx Success',
  '3xx': '3xx Redirect',
  '4xx': '4xx Client',
  '5xx': '5xx Server',
};

export const CATEGORY_COLORS = {
  '1xx': 'text-blue-500',
  '2xx': 'text-green-500',
  '3xx': 'text-yellow-500',
  '4xx': 'text-orange-500',
  '5xx': 'text-red-500',
};

export function filterStatusCodes(search, category) {
  let codes = HTTP_STATUS_CODES;

  if (category && category !== 'All') {
    codes = codes.filter((s) => s.category === category);
  }

  if (search) {
    const q = search.toLowerCase();
    codes = codes.filter(
      (s) =>
        String(s.code).includes(q) ||
        s.text.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q)
    );
  }

  return codes;
}
