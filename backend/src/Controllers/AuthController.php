<?php

declare(strict_types=1);

namespace App\Controllers;

use App\Actions\CreateGuestSessionAction;
use App\Actions\LinkGuestAccountAction;
use App\Core\Database;
use App\Core\Environment;
use App\Http\Request;
use App\Http\Response;
use App\Models\AuthUser;
use App\Repositories\UserRepository;
use RuntimeException;

final class AuthController
{
    private CreateGuestSessionAction $createGuestSessionAction;
    private LinkGuestAccountAction $linkGuestAccountAction;

    public function __construct()
    {
        $userRepository = new UserRepository(Database::getConnection());
        $this->createGuestSessionAction = new CreateGuestSessionAction($userRepository);
        $this->linkGuestAccountAction = new LinkGuestAccountAction($userRepository);
    }

    public function loginInfo(Request $request, Response $response): Response
    {
        return $this->json($response, [
            'success' => true,
            'data' => [
                'login_url' => Environment::required('WEB_HATCHERY_LOGIN_URL'),
            ],
        ]);
    }

    public function session(Request $request, Response $response): Response
    {
        $authUser = AuthUser::fromArray($request->getAttribute('auth_user', []));
        if ($authUser->localUserId <= 0) {
            return $this->json($response->withStatus(401), [
                'success' => false,
                'error' => 'Authentication required',
                'message' => 'Unauthorized',
                'login_url' => Environment::required('WEB_HATCHERY_LOGIN_URL'),
            ]);
        }

        return $this->json($response, [
            'success' => true,
            'data' => [
                'user' => $authUser->toFrontendArray(),
            ],
        ]);
    }

    public function currentUser(Request $request, Response $response): Response
    {
        return $this->session($request, $response);
    }

    public function createGuestSession(Request $request, Response $response): Response
    {
        return $this->json($response->withStatus(201), [
            'success' => true,
            'message' => 'Guest session created',
            'data' => $this->createGuestSessionAction->execute(),
        ]);
    }

    public function linkGuestAccount(Request $request, Response $response): Response
    {
        try {
            $result = $this->linkGuestAccountAction->execute(
                AuthUser::fromArray($request->getAttribute('auth_user', [])),
                $request->getParsedBody()
            );
        } catch (RuntimeException $error) {
            return $this->json($response->withStatus(400), [
                'success' => false,
                'error' => 'Guest link failed',
                'message' => $error->getMessage(),
            ]);
        }

        return $this->json($response, [
            'success' => true,
            'message' => 'Guest account data linked successfully',
            'data' => $result,
        ]);
    }

    /**
     * @param array<string, mixed> $payload
     */
    private function json(Response $response, array $payload): Response
    {
        $response->getBody()->write(json_encode($payload, JSON_THROW_ON_ERROR));

        return $response->withHeader('Content-Type', 'application/json');
    }
}
