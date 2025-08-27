<?php

namespace App\Exceptions;

use Exception;

class UnauthorizedException extends Exception
{
    public function __construct(string $message = "Unauthorized access", int $code = 401, ?Exception $previous = null)
    {
        parent::__construct($message, $code, $previous);
    }
}
