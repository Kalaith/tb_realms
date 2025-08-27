<?php

namespace App\Traits;

use Psr\Http\Message\ResponseInterface as Response;
use App\Exceptions\ResourceNotFoundException;

trait ApiResponseTrait
{
    /**
     * Send a JSON response
     */
    protected function jsonResponse(Response $response, array $data, int $status = 200): Response
    {
        $response->getBody()->write(json_encode($data));
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($status);
    }

    /**
     * Handle API action with consistent error handling
     *
     * @param Response $response The PSR-7 response object
     * @param callable $action The action to execute
     * @param string $errorContext Context for general error messages
     * @param string|null $notFoundMessage Custom message for ResourceNotFoundException
     * @param int $successStatus HTTP status code for successful response
     */
    protected function handleApiAction(
        Response $response,
        callable $action,
        string $errorContext,
        ?string $notFoundMessage = null,
        int $successStatus = 200
    ): Response {
        try {
            $result = $action();
            return $this->jsonResponse($response, [
                'success' => true,
                'data' => $result
            ], $successStatus);
        } catch (ResourceNotFoundException $error) {
            // Return 200 for resource not found - successful query with no results
            return $this->jsonResponse($response, [
                'success' => false,
                'message' => $notFoundMessage ?? 'Resource not found'
            ], 200);
        } catch (\Exception $error) {
            // Log the error for debugging
            error_log("Error {$errorContext}: " . $error->getMessage());
            
            // Return 500 only for actual system errors
            return $this->jsonResponse($response, [
                'success' => false,
                'message' => 'Internal server error'
            ], 500);
        }
    }

    /**
     * Send an error response
     */
    protected function errorResponse(Response $response, string $message, int $status = 400): Response
    {
        return $this->jsonResponse($response, [
            'success' => false,
            'message' => $message
        ], $status);
    }

    /**
     * Send a success response
     */
    protected function successResponse(Response $response, $data = null, int $status = 200): Response
    {
        $responseData = ['success' => true];
        
        if ($data !== null) {
            $responseData['data'] = $data;
        }
        
        return $this->jsonResponse($response, $responseData, $status);
    }
}
