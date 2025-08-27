<?php

namespace App\Middleware;

use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Server\MiddlewareInterface;

/**
 * CORS Middleware for handling Cross-Origin Resource Sharing
 */
class CorsMiddleware implements MiddlewareInterface
{
    public function process(Request $request, RequestHandler $handler): Response
    {
        // Handle preflight requests
        if ($request->getMethod() === 'OPTIONS') {
            $response = new \Nyholm\Psr7\Response();
            return $this->addCorsHeaders($response);
        }

        // Process the request
        $response = $handler->handle($request);
        
        // Add CORS headers to response
        return $this->addCorsHeaders($response);
    }

    private function addCorsHeaders(Response $response): Response
    {
        $allowedOrigins = [
            'http://localhost:3000',     // React dev server
            'http://localhost:5173',     // Vite dev server
            'http://127.0.0.1:3000',
            'http://127.0.0.1:5173',
        ];

        // Add production origins from environment
        if (isset($_ENV['ALLOWED_ORIGINS'])) {
            $envOrigins = explode(',', $_ENV['ALLOWED_ORIGINS']);
            $allowedOrigins = array_merge($allowedOrigins, $envOrigins);
        }

        return $response
            ->withHeader('Access-Control-Allow-Origin', '*') // For development - restrict in production
            ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
            ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
            ->withHeader('Access-Control-Allow-Credentials', 'true')
            ->withHeader('Access-Control-Max-Age', '86400');
    }
}
