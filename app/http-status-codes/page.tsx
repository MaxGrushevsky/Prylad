'use client'

import { useState, useMemo } from 'react'
import Layout from '@/components/Layout'

interface StatusCode {
  code: number
  name: string
  description: string
  category: '1xx' | '2xx' | '3xx' | '4xx' | '5xx'
  useCase: string
  example?: string
}

const statusCodes: StatusCode[] = [
  // 1xx Informational
  { code: 100, name: 'Continue', description: 'The server has received the request headers and the client should proceed to send the request body.', category: '1xx', useCase: 'Used when the client needs to send a large request body.' },
  { code: 101, name: 'Switching Protocols', description: 'The server is switching protocols as requested by the client.', category: '1xx', useCase: 'Used when upgrading from HTTP to WebSocket.' },
  { code: 102, name: 'Processing', description: 'The server has received and is processing the request, but no response is available yet.', category: '1xx', useCase: 'Used for long-running requests to prevent timeout.' },
  { code: 103, name: 'Early Hints', description: 'Used to return some response headers before final HTTP message.', category: '1xx', useCase: 'Allows browser to preload resources while server prepares response.' },
  
  // 2xx Success
  { code: 200, name: 'OK', description: 'The request has succeeded.', category: '2xx', useCase: 'Standard response for successful HTTP requests.', example: 'GET /api/users' },
  { code: 201, name: 'Created', description: 'The request has been fulfilled and a new resource has been created.', category: '2xx', useCase: 'Returned after successfully creating a resource.', example: 'POST /api/users' },
  { code: 202, name: 'Accepted', description: 'The request has been accepted for processing, but processing has not been completed.', category: '2xx', useCase: 'Used for asynchronous processing.', example: 'POST /api/jobs' },
  { code: 204, name: 'No Content', description: 'The server successfully processed the request but is not returning any content.', category: '2xx', useCase: 'Used for successful DELETE requests or updates that don\'t return data.', example: 'DELETE /api/users/123' },
  { code: 206, name: 'Partial Content', description: 'The server is delivering only part of the resource due to a range header sent by the client.', category: '2xx', useCase: 'Used for partial content requests (e.g., video streaming).', example: 'GET /api/video with Range header' },
  
  // 3xx Redirection
  { code: 301, name: 'Moved Permanently', description: 'The requested resource has been permanently moved to a new URL.', category: '3xx', useCase: 'Use when a resource has permanently moved to a new location.', example: 'Old URL redirects to new URL' },
  { code: 302, name: 'Found', description: 'The requested resource has been temporarily moved to a different URL.', category: '3xx', useCase: 'Temporary redirect, commonly used for login redirects.', example: 'Redirect after login' },
  { code: 304, name: 'Not Modified', description: 'The resource has not been modified since the last request.', category: '3xx', useCase: 'Used with conditional GET requests to save bandwidth.', example: 'GET with If-Modified-Since header' },
  { code: 307, name: 'Temporary Redirect', description: 'The request should be repeated with another URL, but the method must not be changed.', category: '3xx', useCase: 'Similar to 302 but preserves HTTP method.', example: 'POST redirect preserving method' },
  { code: 308, name: 'Permanent Redirect', description: 'The request and all future requests should be repeated using another URL.', category: '3xx', useCase: 'Similar to 301 but preserves HTTP method.', example: 'Permanent redirect preserving method' },
  
  // 4xx Client Error
  { code: 400, name: 'Bad Request', description: 'The server cannot process the request due to a client error (e.g., malformed syntax).', category: '4xx', useCase: 'Return when request syntax is invalid or missing required parameters.', example: 'Invalid JSON in request body' },
  { code: 401, name: 'Unauthorized', description: 'Authentication is required and has failed or has not been provided.', category: '4xx', useCase: 'Return when authentication is required or has failed.', example: 'Missing or invalid API token' },
  { code: 403, name: 'Forbidden', description: 'The server understood the request but refuses to authorize it.', category: '4xx', useCase: 'Return when user is authenticated but lacks permission.', example: 'User tries to access admin resource' },
  { code: 404, name: 'Not Found', description: 'The requested resource could not be found on the server.', category: '4xx', useCase: 'Return when the requested resource does not exist.', example: 'GET /api/users/999 (user doesn\'t exist)' },
  { code: 405, name: 'Method Not Allowed', description: 'The request method is not allowed for the requested resource.', category: '4xx', useCase: 'Return when HTTP method is not supported for the endpoint.', example: 'POST to GET-only endpoint' },
  { code: 406, name: 'Not Acceptable', description: 'The server cannot produce a response matching the list of acceptable values.', category: '4xx', useCase: 'Return when server cannot satisfy Accept header requirements.', example: 'Client requests XML but server only has JSON' },
  { code: 409, name: 'Conflict', description: 'The request could not be completed due to a conflict with the current state of the resource.', category: '4xx', useCase: 'Return when there is a conflict (e.g., duplicate email).', example: 'Creating user with existing email' },
  { code: 410, name: 'Gone', description: 'The requested resource is no longer available and will not be available again.', category: '4xx', useCase: 'Return when resource existed but is permanently removed.', example: 'Deleted resource that won\'t be restored' },
  { code: 413, name: 'Payload Too Large', description: 'The request entity is larger than limits defined by the server.', category: '4xx', useCase: 'Return when request body exceeds size limit.', example: 'File upload exceeds 10MB limit' },
  { code: 414, name: 'URI Too Long', description: 'The URI provided was too long for the server to process.', category: '4xx', useCase: 'Return when URL exceeds maximum length.', example: 'GET request with extremely long query string' },
  { code: 415, name: 'Unsupported Media Type', description: 'The media format of the requested data is not supported by the server.', category: '4xx', useCase: 'Return when Content-Type is not supported.', example: 'Sending XML when server expects JSON' },
  { code: 422, name: 'Unprocessable Entity', description: 'The request was well-formed but contains semantic errors.', category: '4xx', useCase: 'Return when validation fails (e.g., invalid email format).', example: 'POST with invalid email address' },
  { code: 429, name: 'Too Many Requests', description: 'The user has sent too many requests in a given amount of time (rate limiting).', category: '4xx', useCase: 'Return when rate limit is exceeded.', example: 'More than 100 requests per minute' },
  
  // 5xx Server Error
  { code: 500, name: 'Internal Server Error', description: 'The server encountered an unexpected condition that prevented it from fulfilling the request.', category: '5xx', useCase: 'Return for unexpected server errors.', example: 'Unhandled exception in server code' },
  { code: 501, name: 'Not Implemented', description: 'The server does not support the functionality required to fulfill the request.', category: '5xx', useCase: 'Return when server doesn\'t support the requested feature.', example: 'Server doesn\'t support requested HTTP method' },
  { code: 502, name: 'Bad Gateway', description: 'The server, while acting as a gateway or proxy, received an invalid response from an upstream server.', category: '5xx', useCase: 'Return when gateway/proxy receives invalid response.', example: 'API gateway receives error from backend' },
  { code: 503, name: 'Service Unavailable', description: 'The server is currently unable to handle the request due to temporary overload or maintenance.', category: '5xx', useCase: 'Return when service is temporarily unavailable.', example: 'Server is down for maintenance' },
  { code: 504, name: 'Gateway Timeout', description: 'The server, while acting as a gateway or proxy, did not receive a timely response from an upstream server.', category: '5xx', useCase: 'Return when upstream server times out.', example: 'Database query exceeds timeout' },
  { code: 505, name: 'HTTP Version Not Supported', description: 'The server does not support the HTTP protocol version used in the request.', category: '5xx', useCase: 'Return when HTTP version is not supported.', example: 'Client uses HTTP/3 but server only supports HTTP/1.1' },
]

export default function HTTPStatusCodesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<'all' | '1xx' | '2xx' | '3xx' | '4xx' | '5xx'>('all')

  const filteredCodes = useMemo(() => {
    return statusCodes.filter(code => {
      const matchesSearch = searchQuery === '' || 
        code.code.toString().includes(searchQuery) ||
        code.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        code.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        code.useCase.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategory = selectedCategory === 'all' || code.category === selectedCategory
      
      return matchesSearch && matchesCategory
    })
  }, [searchQuery, selectedCategory])

  const getCategoryColor = (category: string) => {
    switch (category) {
      case '1xx':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case '2xx':
        return 'bg-green-100 text-green-800 border-green-200'
      case '3xx':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case '4xx':
        return 'bg-red-100 text-red-800 border-red-200'
      case '5xx':
        return 'bg-purple-100 text-purple-800 border-purple-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getCodeColor = (code: number) => {
    if (code >= 200 && code < 300) return 'text-green-600'
    if (code >= 300 && code < 400) return 'text-yellow-600'
    if (code >= 400 && code < 500) return 'text-red-600'
    if (code >= 500) return 'text-purple-600'
    return 'text-blue-600'
  }

  return (
    <Layout
      title="📡 HTTP Status Codes"
      description="Complete reference of HTTP status codes with descriptions, use cases, and examples. Search and filter by category."
    >
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 lg:p-8 border border-gray-100 mb-6">
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Search
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by code, name, or description..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value as typeof selectedCategory)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  <option value="1xx">1xx Informational</option>
                  <option value="2xx">2xx Success</option>
                  <option value="3xx">3xx Redirection</option>
                  <option value="4xx">4xx Client Error</option>
                  <option value="5xx">5xx Server Error</option>
                </select>
              </div>
            </div>

            {/* Results Count */}
            <div className="text-sm text-gray-600">
              Showing <span className="font-semibold text-primary-600">{filteredCodes.length}</span> of {statusCodes.length} status codes
            </div>

            {/* Status Codes List */}
            <div className="space-y-4">
              {filteredCodes.map((code) => (
                <div
                  key={code.code}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`text-2xl font-bold ${getCodeColor(code.code)}`}>
                          {code.code}
                        </span>
                        <h3 className="text-lg font-semibold text-gray-900">{code.name}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getCategoryColor(code.category)}`}>
                          {code.category}
                        </span>
                      </div>
                      <p className="text-gray-700 mb-2">{code.description}</p>
                      <div className="bg-gray-50 rounded p-2 mb-2">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Use case:</span> {code.useCase}
                        </p>
                        {code.example && (
                          <p className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">Example:</span>{' '}
                            <code className="bg-white px-1 py-0.5 rounded text-xs font-mono">{code.example}</code>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredCodes.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No status codes found</p>
                <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filter</p>
              </div>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-3">About HTTP Status Codes</h3>
          <div className="space-y-2 text-sm text-gray-600">
            <p>
              HTTP status codes are three-digit numbers returned by a server to indicate the result of a request.
              They are grouped into five categories:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li><strong className="text-blue-600">1xx Informational:</strong> Request received, continuing process</li>
              <li><strong className="text-green-600">2xx Success:</strong> Request successfully received, understood, and accepted</li>
              <li><strong className="text-yellow-600">3xx Redirection:</strong> Further action needs to be taken to complete the request</li>
              <li><strong className="text-red-600">4xx Client Error:</strong> Request contains bad syntax or cannot be fulfilled</li>
              <li><strong className="text-purple-600">5xx Server Error:</strong> Server failed to fulfill a valid request</li>
            </ul>
          </div>
        </div>
      </div>
    </Layout>
  )
}

